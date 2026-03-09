# War Encounter Rules 2026 Review Report

Design critique and recommendations for the v4 markdown ruleset

Prepared March 8, 2026

## Executive summary

- The ruleset has a strong high-level promise. The two-layer structure aims at a real D&D war problem: resolve the big war quickly while keeping PCs central to the story.
- The strongest ideas are the strategic-to-cinematic handoff, the emphasis on visible war consequences, and the attempt to keep large battles in a Risk-like resolution model instead of tactical miniatures accounting.
- The document is not yet stable enough for broad table use. Duplicate sections, drafting artifacts, terminology drift, off-page dependencies, and contradictory wording make the rules hard to trust on first read.
- The biggest design risk is stack overload. Army Size, STR, matchup effects, doctrines, meters, weather, terrain, help actions, and repeated attacks all compete inside the same battle math, which raises GM burden and flattens some intended distinctions.
- Recommended direction: stabilize the text first, standardize the cinematic impact ladder, reduce battle-math compression, and publish the system in explicit play tiers rather than treating every subsystem as equally active by default.

## Review context

- **Source file:** assets/documentation/War_Encounter_Rules_2026_v4.md
- **Rules version:** Version date in document: 2026-02-24
- **Primary mode:** Critique/Post-Playtest Diagnosis
- **Secondary lenses:** Mechanics and Core Loop Design; Balance and Decision Analysis; Onboarding/Pacing/Readability
- **Audience:** Mixed design, product, and implementation collaborators
- **Review stance:** Preserve the fast, GM-flexible philosophy; tighten only where ambiguity harms play

## System promise and intended player experience

| Lens | Intended outcome | Assessment |
| --- | --- | --- |
| Fantasy and promise | Resolve large-scale war quickly without turning PCs into spectators. | Strong target. The concept section consistently aims at fast war, visible stakes, and hero agency. |
| Core loop | Move -> declare -> optional cinematic -> battle -> aftermath. | Promising, but overloaded once optional systems and repeated attacks are layered in. |
| Meaningful play | PC actions should clearly change strategic outcomes. | Partially successful. The document promises impact, but the conversion from scene success to battle effect is still too discretionary. |
| Readability | A GM should be able to run a war stage with confidence. | Currently weak. The system needs a stabilization pass before its best ideas can land cleanly at the table. |

## What is working well

- The overview chapters clearly identify the player-facing fantasy: fast war, real stakes, and personal hero relevance.
- The two-layer split is the right structural choice for a D&D-adjacent war system. It lets the war move without forcing every clash into tactical combat.
- The strategic loop is short enough to be teachable in concept. Move, declare, optionally zoom in, then resolve battles is the right backbone.
- Army classes have strong thematic silhouettes. Even before tuning, players can infer what Archers, Cavalry, Pikes, Siege, Spies, and Mages are supposed to do.
- Doctrines and command meters create real campaign texture. They point toward a compelling version of the game where logistics, morale, and politics matter without a full grand strategy sim.
- The weather and terrain material is evocative and campaign-friendly. Once trimmed and modularized, it can become a strong amplifier for scenario identity.

## Priority findings overview

| Severity | Finding | Area | Main move |
| --- | --- | --- | --- |
| Critical | Editorial instability makes the rules hard to trust | Chapters 6-10 and multiple cross-references | Freeze a master rulebook, remove all duplicated text and drafting artifacts, eliminate off-page dependencies, and run a terminology/style pass before further balance expansion. This is the highest-value change because every later tuning pass depends on readers trusting the document. |
| Critical | Core battle math compresses differentiation and makes the cap do too much work | Chapter 4 and Chapter 6 battle pool rules | Separate base force from situational edge. Let Army Size drive most of the pool, reduce STR to smaller quality bands or die-step shifts, and reserve only a narrow post-cap bonus window for terrain, matchup, doctrine, and cinematic impact. This keeps the roll fast while making modifiers legible again. |
| Critical | Optional systems are not truly modular and overload the GM's decision surface | Chapters 7-10 plus optional mechanics inside Chapter 6 | Publish explicit play tiers: Core War, Command War, and Full Campaign. Each subsystem should declare which mode uses it and which phase it modifies. This turns optional material into real modules instead of ambient overhead. |
| Major | The cinematic-to-strategic handoff is thematically strong but mechanically under-specified | Quick Start, Chapter 1, Chapter 2, and battle pool construction | Predeclare each cinematic objective and map it to a named reward tier before the scene starts: minor, major, or decisive. Keep decisive outcomes rare and only for predeclared climax objectives. |
| Major | Battle cadence currently favors deterministic grinding and rout spirals | Chapter 6 battle aftermath, retreat, and repeated attack rules | After the first loss, defenders should explicitly choose hold, withdraw, or desperate stand. Additional presses should cost exhaustion, CP, or doctrine support. Retreat odds should depend on mobility and terrain rather than a flat 1d6 for every army. |
| Major | Army and doctrine abilities use inconsistent templates, hiding counterplay and stack rules | Chapter 5, Chapter 6 optional mechanics, and Chapter 9 doctrines | Standardize every class and doctrine entry around the same fields: phase, trigger, range, frequency, effect type, counterplay, and stack rule. If an ability modifies pool size, die size, or outcome timing, say so directly. |
| Major | The economy and governance layer is appealing but still incomplete | Chapter 6 financial rules and Chapter 7 command systems | Either add a one-page economy loop with default numbers and turn timing, or move incomplete economic hooks into a campaign appendix until they are fully implemented. |
| Moderate | Chapter 5 mixes mechanical archetypes, species rules, and named factions in a way that slows onboarding | Chapter 5 army classifications and faction sections | Split the roster into mechanical archetypes, species or special templates, and faction overlays. Keep a single stat-entry template across all three. |
| Moderate | Weather and terrain are evocative, but the chapter is too broad for the current core loop | Chapter 10 and class preferred/undesired environment hooks | Publish a starter environment kit of six to eight common conditions, then keep the long weather and terrain list as an advanced appendix. Use simple tags for modifier handoff. |
| Minor | The quick reference cannot become reliable until terminology and chapter text are stabilized | Appendix and cross-document references | Rebuild the appendix after the chapter text is stabilized. Treat it as a final product, not an early drafting scaffold. |

## Priority findings

### Critical - Editorial instability makes the rules hard to trust

- **Where it appears:** Chapters 6-10 and multiple cross-references
- **Diagnosis:** The rules file still contains duplicated sections, visible drafting artifacts, terminology drift, and at least one live dependency on an external Google Doc. Examples include duplicated 'Invading a Location', 'Supply Meter', and 'Influence Meter' sections; drafting notes such as 'Perfect. We'll mirror...' and 'Absolutely. Here's a cleaned + expanded version...'; and word drift such as 'Moral Meter' instead of 'Morale Meter'.
- **What the system rewards today:** The current text rewards improvisation over reliable procedure. A GM is pushed to infer the intended rule rather than follow a stable source of truth.
- **Recommendation:** Freeze a master rulebook, remove all duplicated text and drafting artifacts, eliminate off-page dependencies, and run a terminology/style pass before further balance expansion. This is the highest-value change because every later tuning pass depends on readers trusting the document.
- **Tradeoff:** This pauses new content for one editorial cycle, but it creates the foundation that makes later balance work worth doing.

### Critical - Core battle math compresses differentiation and makes the cap do too much work

- **Where it appears:** Chapter 4 and Chapter 6 battle pool rules
- **Diagnosis:** Army Size and STR both add full dice, then attacker and defender caps flatten the result. The worked example reaches 15 vs 10 dice before modifiers, then collapses to 10 vs 8 after caps. That means large chunks of army identity, terrain, and doctrine value can become invisible because many inputs compete for the same final two dice.
- **What the system rewards today:** The system currently rewards stacking raw STR and only then looking for a few decisive post-cap penalties or bonuses. It is less about nuanced army identity than about hitting the cap efficiently.
- **Recommendation:** Separate base force from situational edge. Let Army Size drive most of the pool, reduce STR to smaller quality bands or die-step shifts, and reserve only a narrow post-cap bonus window for terrain, matchup, doctrine, and cinematic impact. This keeps the roll fast while making modifiers legible again.
- **Tradeoff:** This requires reworking examples and some class assumptions, but it will make the system more readable and less prone to hidden saturation.

### Critical - Optional systems are not truly modular and overload the GM's decision surface

- **Where it appears:** Chapters 7-10 plus optional mechanics inside Chapter 6
- **Diagnosis:** Meters, doctrines, help actions, medals, financial rules, weather, terrain, and campaign economics all plug into the same battle resolution space, but the document does not clearly define which of these are expected in a default game. The result is a rulebook that reads as if everything might matter at once.
- **What the system rewards today:** The current structure rewards veteran GMs who can prune subsystems on the fly. It punishes first-time readers with a high cognitive load before the core loop is even stable.
- **Recommendation:** Publish explicit play tiers: Core War, Command War, and Full Campaign. Each subsystem should declare which mode uses it and which phase it modifies. This turns optional material into real modules instead of ambient overhead.
- **Tradeoff:** The document becomes slightly more structured and less freeform, but it becomes far easier to teach and adopt.

### Major - The cinematic-to-strategic handoff is thematically strong but mechanically under-specified

- **Where it appears:** Quick Start, Chapter 1, Chapter 2, and battle pool construction
- **Diagnosis:** The rules correctly frame cinematic sequences as the place where PCs matter, but the conversion language is too loose. Outcomes can add or remove dice, change die sizes, alter conditions, or occasionally decide a battle entirely, yet there is no standard effect ladder, declared-stakes template, or cap on how many strategic changes one scene can generate.
- **What the system rewards today:** The current system rewards GM fiat and player persuasion more than predictable agency. Players cannot estimate the strategic value of choosing one intervention over another.
- **Recommendation:** Predeclare each cinematic objective and map it to a named reward tier before the scene starts: minor, major, or decisive. Keep decisive outcomes rare and only for predeclared climax objectives.
- **Tradeoff:** This narrows improvisational range slightly, but it improves player autonomy and consequence clarity.

### Major - Battle cadence currently favors deterministic grinding and rout spirals

- **Where it appears:** Chapter 6 battle aftermath, retreat, and repeated attack rules
- **Diagnosis:** Attackers can press repeated attacks in the same Battle Phase, defenders auto-lose when their pool hits zero, and retreat relies on a flat 1-in-6 roll after attacks. Combined with a five-die minimum to initiate and ties favoring defenders, this creates a swingy but still grind-forward cadence where the first strong engagement often dictates the rest of the phase.
- **What the system rewards today:** The rules currently reward concentration of attack power and repeated pressing over repositioning, delaying, or elastic defense.
- **Recommendation:** After the first loss, defenders should explicitly choose hold, withdraw, or desperate stand. Additional presses should cost exhaustion, CP, or doctrine support. Retreat odds should depend on mobility and terrain rather than a flat 1d6 for every army.
- **Tradeoff:** Some clashes will take one extra decision step, but wars will feel less pre-solved after the first exchange.

### Major - Army and doctrine abilities use inconsistent templates, hiding counterplay and stack rules

- **Where it appears:** Chapter 5, Chapter 6 optional mechanics, and Chapter 9 doctrines
- **Diagnosis:** High-leverage abilities vary widely in timing, range, visibility, frequency, and counter language. Assassins remove the highest enemy die or directly bleed size while unseen. Spies are effectively always hidden except to nearby spies. Heavy-Protection grants near-universal resistance. Warforged change their entire die type by matchup. These all create meaningful identity, but the template is inconsistent enough that balance and dispute resolution become difficult.
- **What the system rewards today:** The current text rewards exploiting loosely specified edge cases and asking the GM for favorable interpretations.
- **Recommendation:** Standardize every class and doctrine entry around the same fields: phase, trigger, range, frequency, effect type, counterplay, and stack rule. If an ability modifies pool size, die size, or outcome timing, say so directly.
- **Tradeoff:** Entries become slightly longer, but table rulings become faster and more defensible.

### Major - The economy and governance layer is appealing but still incomplete

- **Where it appears:** Chapter 6 financial rules and Chapter 7 command systems
- **Diagnosis:** CP is presented as a scarce, high-value war resource, but its gain cadence and default sinks remain partly descriptive rather than procedural. Medals, improved training, the Republic of Fairgard ledger, and some construction or policy references assume adjacent systems that are not fully present in this document.
- **What the system rewards today:** The current structure rewards either full GM invention or complete subsystem avoidance. Neither is a good default for a first release.
- **Recommendation:** Either add a one-page economy loop with default numbers and turn timing, or move incomplete economic hooks into a campaign appendix until they are fully implemented.
- **Tradeoff:** The first stable release may be narrower, but it will be more coherent and easier to tune.

### Moderate - Chapter 5 mixes mechanical archetypes, species rules, and named factions in a way that slows onboarding

- **Where it appears:** Chapter 5 army classifications and faction sections
- **Diagnosis:** The army catalog combines generic battlefield roles, stealth specialists, supernatural species, and setting-specific rosters in one continuous lookup block. That makes it harder to distinguish reusable core mechanics from setting flavor or campaign-specific exceptions.
- **What the system rewards today:** The current organization rewards designer familiarity more than reader comprehension.
- **Recommendation:** Split the roster into mechanical archetypes, species or special templates, and faction overlays. Keep a single stat-entry template across all three.
- **Tradeoff:** This adds one more table of contents layer, but it makes the rules far easier to learn and expand.

### Moderate - Weather and terrain are evocative, but the chapter is too broad for the current core loop

- **Where it appears:** Chapter 10 and class preferred/undesired environment hooks
- **Diagnosis:** The environmental material has good flavor and useful scenario hooks, but it introduces a large lookup surface on top of already dense battle math. Because so many armies also have preferred or undesired weather and terrain, every battle risks becoming a multi-table rules audit.
- **What the system rewards today:** The current version rewards using only the most obvious environment effects while quietly ignoring the rest.
- **Recommendation:** Publish a starter environment kit of six to eight common conditions, then keep the long weather and terrain list as an advanced appendix. Use simple tags for modifier handoff.
- **Tradeoff:** The core game loses some encyclopedic breadth, but gains much faster battle setup.

### Minor - The quick reference cannot become reliable until terminology and chapter text are stabilized

- **Where it appears:** Appendix and cross-document references
- **Diagnosis:** The appendix is useful in intent, but a quick reference only works when the main rule language is already normalized. Right now the book still contains wording drift, duplicate sections, and chapter overlap that prevent the appendix from serving as a trustworthy compression layer.
- **What the system rewards today:** The current appendix rewards experienced readers who already know what the system probably means.
- **Recommendation:** Rebuild the appendix after the chapter text is stabilized. Treat it as a final product, not an early drafting scaffold.
- **Tradeoff:** This delays final reference polish, but avoids reinforcing unstable rules wording.

## Recommendations and targeted fix proposals

1. Run an editorial stabilization pass first. Remove duplicated sections, drafting notes, broken references, and terminology drift before touching balance numbers.
1. Redesign the battle math around fewer meaningful knobs: clear base force, clear quality modifier, and a small post-cap window for situational effects.
1. Add a cinematic impact ladder with predeclared stakes so players can predict how hero scenes matter strategically.
1. Publish the rules in three modes - Core War, Command War, and Full Campaign - and mark every subsystem with the modes that use it.
1. Standardize all army and doctrine entries around the same timing and counterplay template.
1. Either complete the economy layer with default cadence and numbers, or demote unfinished pieces to campaign hooks until they are ready.

## Suggested rewrite text for the highest-impact rules only

### Suggested replacement text: Cinematic impact ladder

**Intent:** Replace ad hoc scene-to-strategy conversion with a bounded ladder.

```text
When the GM declares a Cinematic Sequence, name the objective and its reward tier before play begins.
Minor objective: on success, apply one of the following to the next related battle only: +1 die, -1 die, Advantage 1, or cancel one minor terrain penalty.
Major objective: on success, apply one of the following to the next related battle only: +2 dice, -2 dice, upgrade or downgrade one die step on up to two dice, or disable one named doctrine or fortification benefit.
Decisive objective: only for predeclared climax scenes. On success, force a retreat, cancel the battle entirely, or remove a named commander or special asset from the battle. A decisive reward must replace normal dice rewards, not stack with them.
A single Cinematic Sequence can grant only one reward tier unless the GM declares that both sides entered the scene with separate objectives.
```

### Suggested replacement text: Battle pool construction

**Intent:** Reduce cap compression while keeping the roll fast.

```text
Build each army's battle pool in this order.
1. Base force: gain 1 die per 50 Army Size, rounded down.
2. Quality band: compare the army's STR to the war's baseline and apply one result - Weak: -1 die, Standard: no change, Veteran: +1 die, Elite: +2 dice or upgrade one die step on two dice.
3. Situational edge: apply no more than two sources from terrain, weather, matchup, doctrine, help, or cinematic results.
4. Final cap: Attacker 8 dice, Defender 7 dice. If an army would gain more dice after reaching its cap, convert each two excess dice into Advantage 1, to a maximum of Advantage 2.
This keeps large armies dangerous, preserves situational edges, and prevents late modifiers from disappearing into the cap.
```

### Suggested replacement text: Trade doctrine trigger template

**Intent:** Normalize doctrine timing and avoid repeated ambiguous phrasing.

```text
Trigger timing: resolve doctrine upkeep, earnings, and meter shifts at the start of the Move Phase.
Failure check: if a doctrine lists a failure threshold and that meter is at or below the threshold at this moment, the doctrine stays active but its positive effect is suppressed for this turn.
Penalty rule: apply the doctrine's listed penalties once for the turn. Do not reapply them again when the doctrine is deactivated later in the same turn.
Naming rule: always use the same meter names - Morale, Supply, and Influence - in both doctrine text and chapter text.
```

### Suggested replacement text: Rules mode gate

**Intent:** Turn optional material into true modules.

```text
Choose one war mode before the campaign begins.
Core War: use Quick Start, Chapters 1-6, and the appendix only.
Command War: add Chapter 7 command meters and any doctrines explicitly marked Command War.
Full Campaign: add Chapter 10 environment rules, financial rules, medals, and advanced doctrines.
Every optional rule must list which war mode uses it and which phase it modifies.
```

## Playtest and validation plan

### Core loop teach test

- **Question:** Can a new GM run one full war stage using only Quick Start plus the stabilized Chapter 6 procedure?
- **Build under test:** Use the core loop only. No meters, no doctrines, no weather table beyond one obvious condition.
- **Scenario:** Two armies on a simple map with one defended location and one possible cinematic intervention.
- **What to observe:**
  - How many rules lookups happen outside Quick Start and Chapter 6
  - Whether the GM can explain why the battle result happened
  - Whether players can predict what their choices will change
- **Success signal:** The GM resolves the stage with two or fewer outside lookups and players can restate the battle logic in plain language.
- **Failure signal:** The GM needs ad hoc rulings for core timing, pool math, or cinematic conversion.

### Cinematic agency test

- **Question:** Do players feel they are choosing where to matter, rather than just being handed a spotlight scene?
- **Build under test:** Run two possible cinematic objectives with predeclared reward tiers tied to different fronts.
- **Scenario:** Players must choose whether to sabotage a siege engine or rescue a commander before the battle phase.
- **What to observe:**
  - Whether players understand the tradeoff before choosing
  - Whether the chosen scene produces a clear strategic change
  - Whether the unchosen front still feels like a meaningful cost
- **Success signal:** Players report that the choice felt legible and consequential before the dice were rolled.
- **Failure signal:** Players describe the scene as cool but arbitrary, or cannot explain why one objective mattered more than the other.

### Cap compression test

- **Question:** Do different armies still feel different after pool caps are applied?
- **Build under test:** Run at least twelve sample battles across low, mid, and high force levels with and without terrain or doctrine modifiers.
- **Scenario:** Include cavalry vs pikes, siege vs fortification, warforged vs anti-magic opposition, and one stealth-heavy matchup.
- **What to observe:**
  - How often different armies collapse to the same final pool
  - Whether terrain and doctrine choices still move outcomes materially
  - Which modifiers routinely become invisible after capping
- **Success signal:** Distinct army profiles still produce distinct final states after the cap, and situational choices move the outcome often enough to matter.
- **Failure signal:** Most battles saturate into the same capped pools and only a few extreme modifiers remain relevant.

### Module burden test

- **Question:** Do advanced modules add texture without breaking pacing?
- **Build under test:** Run the same scenario once in Core War mode and once in Full Campaign mode.
- **Scenario:** A three-front war turn with one doctrine, one weather condition, and one command meter swing.
- **What to observe:**
  - Resolution time
  - Number of rule lookups and disputes
  - Whether added systems create new decisions or just more bookkeeping
- **Success signal:** Advanced play produces new decisions without doubling resolution friction.
- **Failure signal:** The advanced version mostly adds arithmetic, forgotten triggers, and delayed payoff.

### Counterplay integrity test

- **Question:** Do signature units and doctrines have readable answers rather than hard invalidation or no answer at all?
- **Build under test:** Stage focused matchups for Vampires, Assassins, Warforged, Siege, and Heavy-Protection armies against prepared counters.
- **Scenario:** Use one prepared counter and one unprepared control case for each featured unit or doctrine.
- **What to observe:**
  - Whether the counter changes the odds in a meaningful but not automatic way
  - Whether the defending player understands how to access the counterplay
  - Whether the signature unit still feels special after being answered
- **Success signal:** Counters create pressure and adaptation without deleting the fantasy of the signature unit.
- **Failure signal:** A counter fully blanks the unit, or the unit remains dominant despite the supposed answer.

## Appendix: issue map by chapter

| Area | Strength | Main risk | Priority |
| --- | --- | --- | --- |
| Quick Start | Clear promise and usable war-loop summary. | Needs tighter link to the later chapter language so it remains a true entry point. | Major |
| Chapter 1 - Overview | Best articulation of fantasy, player role, and two-layer logic. | Needs a firmer rule for when cinematic play changes strategy. | Major |
| Chapter 2 - Cinematic Sequences | Strong PC spotlight intent. | Needs a standard reward ladder and clearer bounds on narrative overrides. | Major |
| Chapter 3 - Size Classifications | Useful framing for cinematic NPC scale. | Needs tighter linkage to the strategic layer and fewer one-off exceptions. | Moderate |
| Chapter 4 - Strategic Wargame Sequences | Good conceptual frame and readable high-level procedure. | Battle math explanation overpromises speed while hiding saturation risk. | Critical |
| Chapter 5 - Army Classifications and Factions | Strong thematic silhouettes and faction flavor. | Lookup burden, template inconsistency, and taxonomy sprawl slow onboarding. | Major |
| Chapter 6 - Core Procedures | Contains the real backbone of the system. | Repeated attack cadence, retreat rules, and pool construction need revision. | Critical |
| Chapter 7 - Strategic Command Meters | Adds compelling campaign texture. | Contains duplicate headings and pushes too much load into the default loop. | Critical |
| Chapter 8 - Optional Mechanics | Contains useful hooks such as help actions and environment toggles. | Needs mode gating so optional rules stop feeling mandatory. | Major |
| Chapter 9 - Doctrines | Rich strategic identity and strong flavor scaffolding. | Power inflation, ambiguous timing, and inconsistent templates undermine tuning. | Major |
| Chapter 10 - Weather and Terrain | Evocative battlefield flavor and scenario texture. | Too broad for core use and still contains drafting artifacts. | Moderate |
| Appendix | Correct instinct: quick references matter for this kind of game. | Should be rebuilt only after the main text is stabilized. | Minor |

## Assumptions

- This review evaluates the markdown rules file as a document for table use, not the underlying HTML or app implementation.
- The intended format is a GM-facing TTRPG or wargame hybrid, not a competitive tournament ruleset.
- Recommendations prioritize clarity, pacing, and agency over simulation detail.
- The immediate goal is a stable v1 rulebook, not exhaustive setting coverage.
