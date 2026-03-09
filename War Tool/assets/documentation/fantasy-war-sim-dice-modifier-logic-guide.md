# Fantasy War Sim Dice Modifier Logic Guide

This guide supersedes the older debug-audit framing. It is meant to help an engineer understand the live modifier pipeline in `fantasy-war-sim.html` without reading the full rulebook and reverse-engineering the HTML from scratch.

Use this guide for:
- the current modifier order
- what each layer is supposed to mean in plain English
- where the HTML currently uses direct context, nearby assist/hinder, doctrines, weather specials, and phenomena
- where the HTML adds behavior beyond the raw rules text

Use `fantasy-war-sim-class-matchup-logic-guide.md` for the narrower class-matchup layer.

## Plain-English Summary

The shipped HTML no longer treats every modifier the same way. It now separates:
- plain class-vs-class matchup logic
- direct self / battle-context logic
- nearby assist / hinder effects
- doctrine math
- phenomena and wild-magic effects

That separation is the main thing a new engineer needs to understand. A mechanic that looks "missing" may actually live in a different layer than expected.

## Current Modifier Pipeline

The shipped app now has two pool modes:
- `legacy` keeps the older direct-cap pipeline
- `threePool` builds `Total dice`, caps into `Usable dice`, then applies the rest of the dice-count modifiers before `Dice to roll` is limited

The table below describes the active `threePool` default because that is now the primary player-facing rules mode.

| Layer | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Base size / STR dice | Army Size and STR generate the starting pool. | Implemented as `floor(size / 50)` plus `floor(str / 10)` after size/STR adjustments and STR penalties are applied. | This is the `Total dice` stage in `threePool`. |
| Usable-dice cap | Large armies should not ignore all later modifiers. | `threePool` clamps Total dice to `softDiceCaps` (`12 / 10`) before other dice-count modifiers are added. | This is the main intentional rules change versus `legacy`. |
| Intrinsic class effects | Some classes alter their own dice shape or pool in class-specific ways. | In `threePool`, applied after the usable-dice cap. In `legacy`, they remain before the cap. | This is separate from class-vs-class matchup logic. |
| Matchup layer | Immunity, resistance, vulnerability, deadly, and deadly doctrine penalties. | Implemented through `matchupMod()` plus the deadly-doctrine pass, after the usable-dice cap in `threePool`. | See the matchup guide for the details and limitations. |
| Bespoke matchup riders | A few approved pairings need extra math on top of normal matchup data. | Implemented in `computeBespokeMatchupRider()` after the generic matchup layer. | Currently limited to Snow Elves vs Forest Fey / Treants and Fire Cult vs Snow Elves. |
| Generic weather | Preferred / undesired weather should alter the pool. | Implemented through parsed weather-preference matching, after the usable-dice cap in `threePool`. | Stronger than the old debug docs implied. |
| Class weather specials | Some classes have bespoke sunlight, storm, cold, or night rules. | STR penalties still happen before Total dice; class-special dice bonuses happen after the usable-dice cap in `threePool`. Fire Cult also adds a narrow weather guard around round execution. | This splits one subsystem across two stages. |
| Direct self / battle context | Some rules depend on the active army plus current battle context checkboxes. | Implemented in `computeDirectContextEffects()` after the usable-dice cap in `threePool`. | Currently covers Rebels, Forest Fey, Pikes, attacking Bandits hidden attacks, and defender-side Shield-Brethren bulwark / represented surprise suppression. |
| Doctrine effects | Active doctrines can add bonuses, penalties, or die-step changes. | Implemented in `computeDoctrineEffects()` after the usable-dice cap in `threePool`. | Strong for some doctrines, partial for others. |
| Phenomena | World phenomena and magical incidents should modify the pool. | Implemented in `computePhenomenaEffects()` after the usable-dice cap in `threePool`. | This is one of the most HTML-specific layers. |
| Nearby assist / hinder | Nearby allied or enemy armies can help, hinder, or manipulate rolls. | Size/STR adjustments still affect Total dice; `diceDelta` applies after the usable-dice cap in `threePool`. | Powerful, but very dependent on UI setup and current modeling choices. |
| Manual override | Users can manually push the pool up or down. | In `threePool`, manual dice adjustment is part of the post-usable-cap modifier stage. | Runtime-only tactical control, not saved army identity. |
| Dice-to-roll cap / floor handling | Dice caps and floor rules should bound the rolled subset. | In `threePool`, `allowOverCap` bypasses only the final Dice to roll cap while side `capOverride` bypasses both cap layers. | Consumers must distinguish usable pool from rolled count. |
| Class dice shape | Some classes do not keep a uniform die list even after the final count is known. | Implemented in `applyClassDiceShape()` after pool counts are finalized. | Mutants and Gunners now share this pass. |
| Roll generation / roll operations / resolution | Dice are generated, manipulated, and resolved. | Implemented after the pool is finalized. Nearby remove-highest/remove-lowest effects act here, not earlier. | Important when comparing "dice count" logic vs "rolled die" manipulation. |

## Direct Self / Battle Context Layer

This is the clearest place where the shipped HTML differs from the older audit framing.

| Mechanic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Rebels + home territory | Defending Rebels gain a home bonus. | Implemented directly in `computeDirectContextEffects()` as `+1` die when the defender is Rebels and `homeTerritory` is checked. | This no longer depends on nearby assist/hinder entries. |
| Forest Fey + forest environment | Defending Forest Fey gain a forest-defense bonus. | Implemented directly as `+3` dice when the defender is Forest Fey and `forestEnvironment` is checked. | Also no longer depends on nearby setup. |
| Pikes + flanked by two enemies | Pikes suffer when flanked. | Implemented directly as `-1` die when the army is Pikes and `flankedByTwoEnemies` is checked. | Also no longer modeled as a nearby action. |
| Bandits + hidden attack | Attacking Bandits gain a hidden strike bonus unless enemy intel exposes them. | Implemented directly as `+1` die for attacking Bandits when `selfHiddenOrSurprising` is checked and `enemyHasIntelOnHidden` is not. | This also surfaces a non-bonus note when enemy intel blocks the effect. |
| Shield-Brethren bulwark | Main defending Shield-Brethren should pressure the attacker at city / fort / choke points and ignore represented surprise bonuses. | Implemented directly as an attacker-side `-2` dice penalty when the defender is Shield-Brethren and `cityFortChoke` is checked; represented surprise-positioning bonuses are blocked rather than applied. | This is a narrow parity pass, not a full formation-state system. |
| Fire Cult weather lock | Fire Cult should keep battle weather inside its hot-weather lane without adding new UI for move-phase weather forcing. | Implemented as round-time pre-battle normalization and post-battle drift clamping into `CLEAR` / `DRY` / `HEAT`, with additive result / history messaging only. | This is a stabilization-safe interpretation, not a full map-radius or move-phase weather system. |
| Other context flags | Other flags may still exist in the UI. | The help text explicitly says only ticketed mechanics use direct active-matchup rules in this pass. | **Not modeled / partially modeled:** many context-looking flags still only power nearby assist/hinder mechanics. |

## Nearby Assist / Hinder Layer

Nearby logic is real, but it is not the right home for every rule.

| Mechanic family | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Archer cover / pressure | Archers can help allies or pressure enemies at range. | Implemented as nearby actions that must be attached manually on the affected side. Defender-only pressure now keys role validation off the source side, so legitimate defender pressure no longer gets blocked by attacker-side setup. | The logic is present, but the UX is easy to misread. |
| Mage ward / arcane volley | Mages can defend allies or hinder enemies. | Implemented as nearby actions, with Anti-Magic suppression checks. Defender-only Arcane Volley now also keys role validation off the source side. | Still depends on nearby entry setup rather than automatic aura logic. |
| Spies / Assassins | These mechanics often manipulate rolled dice rather than pool size. | Implemented as nearby roll-operation effects. | They occur after dice are rolled, not as pre-roll pool math. |
| Builders / Siege Prep | Builders can queue or simplify later effects. | Implemented as nearby actions, including a queued next-battle Siege bonus. | This is a useful runtime model, but not always a plain-English match to the raw rulebook wording. |
| Shield-Brethren aura / bulwark | Defensive support and choke-point pressure. | `shield_aura` remains a nearby defending assist for allied units within 1 space; the old nearby `shield_bulwark` path is now legacy-disabled. | Main-battle bulwark pressure moved into the direct-context layer so the defending Shield-Brethren army no longer needs a manual nearby row to apply `-2` dice at city / fort / choke points. |
| Thieves / Mel / Forest restore / Treant surprise / Ward-Smiths / Battlefield Weavers | Mixed special effects and doctrine-assisted support behavior. | Still implemented in nearby-action style, but the current runtime queueing, doctrine gates, roll ops, and reporting paths have now been regression-audited. | Semantics can still feel "off" because the architecture is intentionally narrower than the raw rules text. |

## Doctrine Layer

| Doctrine | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Fire Artillery | Offensive boost with weather-related drawbacks. | Implemented and materially affects dice totals. | One of the better-supported doctrine effects. |
| Elemental Ammunition | Changes offense based on elemental interactions. | Implemented through raw token matching against enemy text blobs. | Works, but is text-match-driven and therefore fuzzy at the edges. |
| Heavy-Protection / Armor-Piercing | Armor and anti-armor interaction. | Implemented in a narrower way than a full armor system. | **Not modeled / partially modeled:** there is no broad armor/fortification subsystem behind it. |
| Wild Surge License | A doctrine that changes die-step behavior with a downside. | Implemented. | Strong example of doctrine logic that is not just a flat dice bonus. |
| Battlefield Weavers / Ward-Smiths | Doctrine effects with broader battlefield implications. | Partly implemented through nearby-action style support mechanics plus doctrine runtime toggles. | Semantically awkward: the doctrine exists, but some of its payoff still lives in nearby logic. |
| Counterspell Cadre | Rules suggest an active doctrine effect. | No meaningful active math path was found. | **Not modeled / partially modeled:** doctrine exists in metadata but not in a real battle-effect layer. |

## Phenomena and Wild Magic

This is where the HTML most clearly adds behind-the-scenes logic that would be hard to infer from the UI alone.

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Global phenomena pressure | Some phenomena should generally make battles harsher or stranger. | Several phenomena apply a global negative pressure scaled by intensity. | This is a broad HTML system layer, not a one-rule-one-ability mapping. |
| Implied weather tags | A phenomenon can feel like weather even if it is not a normal weather tag. | HTML maps some phenomena into implied weather tags and reuses weather preference logic against them. | **HTML-added behavior:** this is a clever bridge layer rather than a raw rules-table transcription. |
| Wild Magic Storm | Wild magic should produce special battlefield effects. | HTML applies intensity-based pressure: Mages gain dice, non-mages lose dice, and Anti-Magic is suppressed. | **HTML-added behavior:** this is a strong explicit runtime model beyond simple flavor text. |
| Elemental Disturbance | Elemental subtype should matter. | HTML attaches a subtype object with a base element and multiplier, then scores class raw text against it. | This is one of the most important hidden logic maps in the whole app. |
| Magnetic Storm / Warforged | Constructs should react badly to certain disruptions. | HTML directly penalizes Warforged in Magnetic Storm and Elemental Disturbance contexts. | This is special-case phenomena logic, not generic matchup logic. |

## HTML-Added Behavior Worth Calling Out

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Elemental subtype alias mapping | Rules may describe elemental variants in prose. | HTML normalizes subtype aliases into base elements plus a multiplier. Example: `Corrosive` -> `acid x2`, `Cryo` -> `cold x2`, `Plasma` -> `fire x2`. | **HTML-added behavior:** this is a behind-the-scenes normalization layer, not a user-facing rule label. |
| Wild Magic subtype persistence | Rules may list a surge result, but not how it should persist in app state. | HTML stores wild-magic event metadata and a resolved subtype label in the weather snapshot. | **HTML-added behavior:** useful for auditability and history/report rendering. |
| Anti-Magic suppression under Wild Magic Storm | Rules may imply weird interactions, but not always in app-ready form. | HTML explicitly suppresses Anti-Magic while Wild Magic Storm is active. | **HTML-added behavior:** this changes how mage and doctrine logic behave during those rounds. |
| Implied-tag reuse of weather logic | Rules often separate phenomena and weather conceptually. | HTML lets some phenomena piggyback on the weather-preference system through implied tags. | **HTML-added behavior:** simplifies implementation, but it is still a modeling decision rather than direct rule text. |

## Not Modeled / Partially Modeled Callouts

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| General terrain engine | Many class abilities key off terrain types. | The app has weather plus a few direct-context flags, not a full terrain model. | **Not modeled / partially modeled:** terrain-heavy rules are still the biggest structural gap. |
| Self-conditional specials beyond the ticketed set | Some classes should self-trigger under hidden, surprise, or situational conditions. | Only a narrow direct-context subset is now truly direct. Many other abilities still live in nearby logic or are absent. | This is where the docs should help Claude avoid assuming "missing" vs "misplaced." |
| Broad doctrine parity | Some doctrines have both a benefit and a drawback in the rules. | The HTML has uneven doctrine coverage. | Some doctrines are rich, some partial, some nearly metadata-only. |
| Full terrain-penalty removal semantics | Rules may say "remove a terrain/sabotage penalty" rather than "gain +1 die." | HTML often simplifies that into a direct numeric bonus. | The app tends to model outcomes rather than full causal history when the underlying subsystem does not exist. |

## Practical Mapping: What Lives Where

| If the rule sounds like... | Look here first | Why |
|---|---|---|
| "This class is strong or weak against that class." | Matchup layer | Exact-name matchup logic is its cleanest case. |
| "This class gets a bonus when defending in a specific context." | Direct self / battle-context layer | That is where Rebels, Forest Fey, and Pikes now live. |
| "A nearby ally or enemy changes this battle." | Nearby assist / hinder layer | Range, hidden-source, and action type matter here. |
| "A doctrine changes dice, die steps, or penalties." | Doctrine layer | Some doctrine logic is direct; some is still coupled to nearby mechanics. |
| "Weird weather or magical anomalies are altering the fight." | Phenomena + class weather specials | The HTML has explicit behavior here that is not obvious from the UI alone. |

## Bottom Line

The shipped HTML has a real layered modifier model now. That is the biggest thing these rewritten docs need to communicate:
- not every modifier is a matchup
- not every situational rule is nearby assist/hinder
- not every weird effect is just "weather"

If Claude keeps those boundaries in mind, the codebase becomes much easier to audit without reading the entire rulebook every time.
