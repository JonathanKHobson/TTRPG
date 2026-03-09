# Fantasy War Sim Class Matchup Logic Guide

This guide supersedes the older debug-audit framing. It is meant to help an engineer understand the live class-matchup logic without diffing the full rulebook against `fantasy-war-sim.html` line by line.

Use this document for the matchup layer only:
- class-vs-class immunities, resistances, vulnerabilities, and deadly penalties
- deadly doctrine triggers that act like matchup penalties
- weather preference logic where it changes matchup-style dice counts
- modeling limits such as aliases, categories, and conditional rules

Use `fantasy-war-sim-dice-modifier-logic-guide.md` for the wider modifier pipeline.

## Plain-English Summary

The shipped HTML is strongest when a rule can be expressed as:
- "this class gets a modifier against that exact class name"
- "this class is deadly to an enemy doctrine"
- "this class likes or dislikes a specific weather/time condition"

The shipped HTML is weaker when a rule depends on:
- aliases like "Vampires count as Undead"
- broad categories like "all Special classes"
- conditional clauses like "only if Anti-Air is prepared"
- non-modeled categories like "Monarchy" or "Invaders"

## Core Matchup Model

| Mechanic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Immunity | A strong favorable matchup bonus. | Implemented through exact class-name matching in `selfCls.matchups.immunities`, worth `+3` dice. | Works well when the opponent name is explicitly present in the parsed matchup list. |
| Resistance | A light favorable matchup bonus. | Implemented through exact class-name matching in `selfCls.matchups.resistances`, worth `+1` die. | Same strength/limitation pattern as immunity. |
| Vulnerability | A light unfavorable matchup penalty. | Implemented through exact class-name matching in `selfCls.matchups.vulnerabilities`, worth `-1` die. | Supports the special `__ALL__` marker for blanket vulnerability. |
| Deadly | A severe unfavorable matchup penalty. | Implemented through exact class-name matching in `selfCls.matchups.deadly`, worth `-3` dice. | Strong when exact-name data exists; weak when canon uses categories or aliases instead. |
| Deadly doctrine | Some classes are deadly to armies using certain doctrines. | Implemented in a separate deadly-doctrine pass, but folded into the shipped matchup layer result before later modifier layers. | This is a code-split implementation of one conceptual layer. |
| Preferred / undesired weather | Some classes gain or lose dice in favored or hated weather. | Implemented through parsed weather-preference matching and can include day/night requirements when the raw weather text includes them. | Stronger than the old audit assumed: generic weather preference matching now respects day/night keywords. |
| Class weather specials | Some classes have bespoke sunlight/night or special-weather logic. | Implemented as hardcoded overrides in `applyClassWeatherSpecials()`. | These are not pure matchup rules, but they often act like matchup adjustments and matter when comparing rules vs HTML behavior. |

## What The Matchup Layer Does Well

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Exact class names | Straight class-vs-class tables should apply cleanly. | This is the engine's best-supported case. Exact opponent names are normalized and matched directly. | If the data is present, the runtime path is reliable. |
| Deadly doctrines | Doctrine-triggered matchup penalties should apply when the enemy has the doctrine. | Implemented and integrated into the pool math. | Anti-Magic can be suppressed by Wild Magic Storm, which is an HTML behavior layer on top of the raw doctrine check. |
| Weather preference strings | Classes that like `Clear`, `Fog`, `Rain`, `Snow`, etc. should gain or lose dice accordingly. | Implemented through parsed entries rather than a single flat weather tag. | This now supports `requiresDay` / `requiresNight` matching in the generic weather preference path. |

## Main Modeling Limits

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Exact-name dependency | Canon often mixes exact classes, aliases, and broad groups. | The runtime matchup layer mostly relies on exact class names in parsed arrays. | **Not modeled / partially modeled:** anything not represented as an exact opponent token is weak or inert unless hardcoded elsewhere. |
| Category-based logic | Some canon uses buckets like `Special Army Classes`, `Monarchy`, or `Invaders`. | No general category engine exists for those labels. | **Not modeled / partially modeled:** those rules do nothing unless the category has been translated into actual runtime logic. |
| Alias-based logic | Some canon treats one class as another for matchup purposes. | There is no general alias engine for matchup resolution. | **Not modeled / partially modeled:** Vampire-as-Undead is not applied generically. |
| Conditional clauses | Some canon only applies if a flag is true or false. | Only a few conditions are hardcoded manually. | **Not modeled / partially modeled:** most prose conditions are flattened away unless someone added explicit HTML logic. |
| Terrain categories | Canon often refers to marsh, bog, riverbank, heartland forest, and similar spaces. | The shipped app has weather plus a small direct-context layer, not a broad terrain engine. | Terrain-sensitive matchup ideas are only partially represented unless mapped into a checkbox or special case. |

## Known Comparative Cases

### Aerial Cavalry and Anti-Air

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Pikes / Siege conditional matchup | Aerial Cavalry clauses depend on whether Anti-Air is prepared. | The base matchup lists are still exact-name based, but there is a hardcoded override: if the enemy has `anti_air`, the HTML removes the normal Pikes resistance and Siege vulnerability. | **HTML-added behavior:** this conditional override now exists explicitly in `matchupMod()`. It is still a narrow one-off, not a general conditional-rule system. |
| Archers / Mages with Anti-Air | Canon can escalate danger when those enemies are prepared with Anti-Air. | The current hardcoded override only removes certain Aerial Cavalry base modifiers. It does not convert Archers or Mages into a more general conditional anti-air matrix. | **Not modeled / partially modeled:** only part of the prose condition tree is represented. |

### Vampires and Undead Aliasing

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Vampires count as Undead when not explicitly listed | Some rules intend Undead-targeting logic to catch Vampires as well. | Matchup resolution uses exact names and does not generically remap Vampires into Undead. | **Not modeled / partially modeled:** if a class is deadly to Undead but does not explicitly list Vampires, that will not automatically transfer. |
| Vampire sunlight / night logic | Vampires are heavily punished by daylight and helped by darkness. | Hardcoded in `applyClassWeatherSpecials()`: sunlight can impose `-50 STR`, and night-like conditions add `+1` die. | **HTML-added behavior:** this is implemented outside the generic matchup table and should be read as a class-weather special, not a plain matchup token. |

### Drow (Underdark)

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Daylight weakness | Drow should suffer in sunlight/daylight. | Hardcoded as `-3` dice when sunlight is present. | This is stronger and cleaner than the older audit state. |
| Night advantage | Drow should be stronger at night unless the opponent is equally night-adapted. | Hardcoded as `+2` dice at night-like conditions, but neutralized if the opponent also prefers night-like weather. | **HTML-added behavior:** the enemy-night-preference exception is now explicitly represented. |

### Mel's Army

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Thieves / Bandits immunity | Raw canon says Mel's Army should be immune to Thieves/Bandits. | The embedded parsed matchup data still lacks that immunity entry. | **Not modeled / partially modeled:** this looks like a data gap rather than a battle-engine gap. |
| Hidden attack bonus | Mel's Army should gain a hidden/surprise attack bonus. | This is not handled in the matchup layer. | That mechanic belongs to the modifier guide because it is not a plain class-vs-class entry. |

### Rebels, Forest Fey, and Pikes

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Rebels home bonus | A self/context defense bonus, not a class-vs-class matchup. | Implemented in the direct self / battle-context layer, not in the nearby layer anymore. | This is intentionally outside the matchup engine now. |
| Forest Fey forest defense | A self/context defense bonus, not a plain class-vs-class matchup. | Implemented in the direct self / battle-context layer. | Also intentionally outside the matchup engine. |
| Pikes flanked penalty | A self/context penalty, not a class-vs-class entry. | Implemented in the direct self / battle-context layer. | Also intentionally outside the matchup engine. |

## Weather and Matchup Comparison

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Preferred weather | Classes gain dice in preferred weather. | Implemented generically through parsed preferred-weather entries, scaled by current weather intensity. | Strongly supported when the preference can be expressed as tags plus optional day/night gating. |
| Undesired weather | Classes lose dice in hated weather. | Implemented the same way as preferred weather, but as a penalty. | Same modeling strengths and weaknesses. |
| Day/night-specific weather text | Rules may say `Clear at Daylight` or `Foggy, Nighttime`. | The current generic matcher now checks both tags and day/night requirements. | This is more accurate than the earlier audit docs implied. |
| Bespoke weather effects | Some classes have special numeric sunlight/night/storm rules that are not just "preferred weather." | Implemented separately in `applyClassWeatherSpecials()`. | These are live logic, but they are not stored in the parsed matchup arrays. |

## HTML-Added Behavior Worth Calling Out

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Conditional Aerial Cavalry override | Rules describe a conditional anti-air interaction. | HTML now explicitly removes certain Aerial Cavalry base modifiers when the enemy doctrine list contains `anti_air`. | **HTML-added behavior:** narrow hardcoded override instead of a general conditional matchup system. |
| Night-preference comparison for Drow | Canon implies Drow night logic should depend on context. | HTML now checks whether the opposing class also prefers night-like weather before awarding the Drow night bonus. | **HTML-added behavior:** this is a live comparative rule, not just a flat bonus. |
| Day/night-aware generic weather preference parsing | Older implementations often flattened weather strings. | The current HTML parses weather preferences into tags plus `requiresDay` / `requiresNight`. | **HTML-added behavior:** this broadens generic weather matching beyond a single flat tag system. |

## Not Modeled / Partially Modeled Callouts

| Topic | Rules as written | HTML as shipped | Gap / added behavior / notes |
|---|---|---|---|
| Category targets | Rules may target groups instead of classes. | No general category layer exists. | `Monarchy`, `Invaders`, `Cult of War`, `Summer Fey`, and similar labels are inert unless explicitly modeled elsewhere. |
| Alias behavior | Rules may treat one class as another. | No general alias remap exists in matchup resolution. | Vampire-as-Undead remains the clearest example. |
| Conditional prose rules | Some rules depend on multi-part conditions. | Only hand-picked conditions are hardcoded. | Most condition trees are still simplified or flattened in data. |
| Data completeness | Some rules are correct in prose but missing in parsed runtime data. | HTML only sees the parsed data. | Mel's Army immunity remains a good example of a likely data defect. |

## Bottom Line

The matchup layer is real and useful. It is not the problem space people worry about when they say "the sim has no class logic." The real risk is narrower:
- exact-name logic is strong
- category, alias, and conditional logic is selective
- some behavior has moved out of the matchup layer into direct self/context or class-weather specials

If Claude is comparing rules to code, the safest mental model is:
1. check whether the rule is exact-name and static
2. check whether it is actually a direct self/context rule instead
3. check whether it is one of the hardcoded weather or condition exceptions
4. only then conclude that the HTML is missing it
