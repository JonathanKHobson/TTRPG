# War Encounter — Augment Doctrines Rules Reference (As Authored)
**Status:** Draft reference appendix (PRD support)  
**Version:** v0.1  
**Date:** 2026-03-05  
**Source:** `War_Encounter_Rules_Reformatted_v2.md`

> This document is a **rules reference** (not a build plan). It compiles **all Augment Doctrines** (General + Mage),
their **eligibility**, and how they connect to:
> - **Deadly Doctrines** (doctrine-based -3 dice triggers)
> - Army class **Immunities / Resistances / Vulnerabilities / Deadly**
> - Army class **Preferred / Undesired Weather**
> - Any **explicit dice pool / die step changes** described in doctrine rules

---

## 1. Matchup magnitude references (rules template)
The rules template for army class matchups defines these magnitudes:



**Interpretation:**  
- “Deadly” and “Deadly Doctrines” both indicate a **-3 dice** effect at the dice pool level (as per the template).  
- Preferred/Undesired weather generally apply **+1 to +3 dice** / **-1 to -3 dice** depending on the class.

---

## 2. Doctrine Catalog (complete list)
| Doctrine | ID | Type | CP | Eligible (rules) | Direct Dice/Die Effect? |
|---|---|---|---|---|---|
| **Anti-Air** | `anti_air` | general | 1 | Archers, Pikes, Gunners, Siege, projectile classes | Indirect/Matchup |
| **Anti-Magic** | `anti_magic` | general | 1 | Any non-magic army | Indirect/Matchup |
| **Heavy Artillery** | `heavy_artillery` | general | 1 | Siege (plus GM-approved) | Indirect/Matchup |
| **Fire Artillery** | `fire_artillery` | general | 1 | Archers, Siege, GM-approved ranged | Indirect/Matchup |
| **Elemental Ammunition** | `elemental_ammunition` | general | 1 | Gunners, Archers, Siege, Mages, GM ranged | Indirect/Matchup |
| **Armor-Piercing** | `armor_piercing` | general | 1 | Gunners, Archers, Siege, Mages, GM ranged | Yes |
| **Heavy-Protection** | `heavy_protection` | general | 2 | Any GM-approved (except Rebels/Bandits) | Yes |
| **Battlefield Weavers** | `battlefield_weavers` | mage | 2 | Mage | Indirect/Matchup |
| **Counterspell Cadre** | `counterspell_cadre` | mage | 1 | Mage | Indirect/Matchup |
| **Wild Surge License** | `wild_surge_license` | mage | 1 | Mage | Yes |
| **Ritual Artillery** | `ritual_artillery` | mage | 2 | Mage | Indirect/Matchup |
| **Ward-Smiths** | `ward_smiths` | mage | 1 | Mage | Indirect/Matchup |
| **Soul-Binders** | `soul_binders` | mage | 1 | Mage | Indirect/Matchup |
| **Spellthief Detachment** | `spellthief_detachment` | mage | 2 | Mage | Indirect/Matchup |

---

## 3. Doctrine Details (rules text + actionable notes)


## Anti-Air (`anti_air`)
**Type:** general augment doctrine
**Army classes that list this as a Deadly Doctrine (rules):** Aerial Cavalry

## Anti-Magic (`anti_magic`)
**Type:** general augment doctrine
**Notes:**
- Has special interaction rules with the **Mages** army class (see Mages notes in Army Class section).
**Army classes that list this as a Deadly Doctrine (rules):** Mages, Hunters, Fiends, Undead, Aerial Cavalry, Warforged (Artificial Constructs), Mutants, Fire Cult, Grail, Drow (Underdark), Forest Fey, Treants, Artemis

## Heavy Artillery (`heavy_artillery`)
**Type:** general augment doctrine
**Notes:**
- Rules explicitly list default eligible classes beyond Siege: **Mutants** and **Warforged** (plus GM discretion).
**Army classes that list this as a Deadly Doctrine (rules):** Hunters, Undead, Shield-Brethren, Warforged (Artificial Constructs), Mutants, Fire Cult, Treants

## Fire Artillery (`fire_artillery`)
**Type:** general augment doctrine
**Notes:**
- This doctrine changes matchup outcomes beyond doctrine-based Deadly Doctrines (it uses damage-type matchups).
**Army classes that list this as a Deadly Doctrine (rules):** Siege, Hunters, Snow Elves, Drow (Underdark), Forest Fey, Treants

## Elemental Ammunition (`elemental_ammunition`)
**Type:** general augment doctrine
**Eligible (rules text):** Gunner, Archers, Siege, Mages, and other ranged army classes at GM discretion.
**Effect (rules):** Choose **one damage type** when purchased (cold, fire, lightning, acid, poison, psychic, radiant, necrotic, thunder, force). This army is treated as also dealing that damage type for matchup purposes: if an enemy army is **Vulnerable**/**Deadly** to that damage type, apply those matchup results even if the army’s class normally wouldn’t trigger them. Essentially when calculating immunities/resistancatances and vulnerabilities/deadly the new damage type takes priority. (GM discretion for edge cases.)
**Notes:**
- This doctrine changes matchup outcomes beyond doctrine-based Deadly Doctrines (it uses damage-type matchups).
- Requires an additional selection: **one damage type** at purchase/assignment time (listed in rules).
**Army classes that list this as a Deadly Doctrine (rules):** None listed in rules.

## Armor-Piercing (`armor_piercing`)
**Type:** general augment doctrine
**Eligible (rules text):** Gunner, Archers, Siege, Mages, and other ranged army classes at GM discretion.
**Effect (rules):** Once per battle phase, when this army would suffer a **\-1 die penalty** due to enemy armor/fortification-style effects (GM discretion), ignore that penalty. Additionally,  if the enemy army has a doctrine or trait that implies heavy protection, apply **\+1 die**. (GM discretion)
**Army classes that list this as a Deadly Doctrine (rules):** Shield-Brethren

## Heavy-Protection (`heavy_protection`)
**Type:** general augment doctrine
**Eligible (rules text):** Any army classes at GM discretion expect Rebels or Bandits.
**Effect (rules):** If the army class has the Armor-Piercing doctrine then ignore the benefits of this doctrine. This army gains resistance to all non-special army classes except Mages unless that class was Deadly to them then that army class drops to vulnerable instead. One per battle phase, an army who attacks this army would suffer a **\-1 die penalty** to their dice pool.
**Army classes that list this as a Deadly Doctrine (rules):** None listed in rules.

## Battlefield Weavers (`battlefield_weavers`)
**Type:** mage augment doctrine
**Eligible (rules text):** Mage
**Effect (rules):** Once per battle phase, alter the environmental weather condition in a 5 mile radius by one step, either increasing or decreasing the temperature (hotter or colder) or the intensity (calmer or stormier). (GM discretion) This ability can be used only once per battle phase. If the condition aligns with this army’s preferred weather or creates an undesired condition for the enemy, apply standard modifiers.
**Army classes that list this as a Deadly Doctrine (rules):** None listed in rules.

## Counterspell Cadre (`counterspell_cadre`)
**Type:** mage augment doctrine
**Eligible (rules text):** Mage
**Effect (rules):** Once per battle phase, when an opposing army benefits from a Mage-based Augment or Divinity-based effect, reduce that effect one tier (Deadly → Vulnerable, Vulnerable → Neutral, or remove one die bonus granted by that effect). (GM discretion) This ability may only target one army per phase.
**Army classes that list this as a Deadly Doctrine (rules):** None listed in rules.

## Wild Surge License (`wild_surge_license`)
**Type:** mage augment doctrine
**Eligible (rules text):** Mage
**Effect (rules):** Once per battle phase, increase this army’s die size one step for that roll (d8 → d10, etc.). If any die rolls its lowest possible value, trigger a Wild Complication determined by the GM (battlefield distortion, friendly interference, uncontrolled elemental surge, etc.).
**Army classes that list this as a Deadly Doctrine (rules):** None listed in rules.

## Ritual Artillery (`ritual_artillery`)
**Type:** mage augment doctrine
**Eligible (rules text):** Mage
**Effect (rules):** If this army does not move during a move phase, its next battle phase attack may target up to 10 miles (2 spaces) and count as though it was a ranged attack with all the benefits of a Gunners, Archers, or Siege Army class and none of the drawbacks.
**Army classes that list this as a Deadly Doctrine (rules):** None listed in rules.

## Ward-Smiths (`ward_smiths`)
**Type:** mage augment doctrine
**Eligible (rules text):** Mage
**Effect (rules):** Once per battle phase, grant one allied army in the same zone immunity to Mages or Divinity-based (Grail, Artemis, Fiend) effects for that phase, or if they are deadly to that army class negate one instance of Deadly against them.
**Army classes that list this as a Deadly Doctrine (rules):** None listed in rules.

## Soul-Binders (`soul_binders`)
**Type:** mage augment doctrine
**Eligible (rules text):** Mage
**Effect (rules):** If this army wins a battle phase in its zone, gain \+1 CP.
**Army classes that list this as a Deadly Doctrine (rules):** None listed in rules.

## Spellthief Detachment (`spellthief_detachment`)
**Type:** mage augment doctrine
**Eligible (rules text):** Mage
**Effect (rules):** Once per battle phase, when an enemy army with an Augment is within 5 mile radius, the Mages army temporarily gains one of their Augment Tags for that phase (GM-approved). The copied Tag functions at its standard strength and abilities.
**Army classes that list this as a Deadly Doctrine (rules):** None listed in rules.

---

## 4. Army Class Trait Matrix (as authored)
This table is the authoritative cross-reference for applying:
- damage-type matchups (e.g., Fire/Cold via Elemental Ammunition)
- weather preference penalties/bonuses (including Fire Artillery and Battlefield Weavers interactions)
- doctrine-based deadly triggers (Deadly Doctrines column)

| Army Class | Immunities | Resistances | Vulnerabilities | Deadly | Deadly Doctrines | Preferred Weather | Undesired Weather |
|---|---|---|---|---|---|---|---|
| **Archers** | — | Pikes | Swords, Cavalry, Shield-Brethren | Undead, Gunners | — | Clear Skies at Daylight | Cloudy, Heavy Clouds/Fog |
| **Assassins** | — | Assassins | Spies | — | — | Cloudy or Foggy, Nighttime | Clear Skies at Daylight |
| **Bandits** | — | — | Spies | Undead | — | Clear Skies at Daylight | Thunderstorm |
| **Builders** | — | Siege, Pikes | Bandits, Thieves, Spies | Swords, Cavalry, Assassins, (All Special Army classes are deadly to Builders unless they are specifically listed as vulnerable to Builders, or if Builders are specifically stated to be deadly to that class.) | — | Clear Skies at Daylight | Thunderstorm, Heavy Rain |
| **Cavalry** | — | Swords, Archers | Pikes, Undead | — | — | Clear Skies at Daylight | Heavy Rain, Snow |
| **Gunners** | Swords | — | Cavalry, Undead | Vampires | — | Clear Skies at Daylight | Thunderstorm |
| **Mages** | Rebels | Arches | Assassins, Spies | Cavalry, Swords | Anti-Magic | Clear Skies at Nighttime (stars) or Clear Skies at Daylight | Heavy Rain, Heavy Clouds/Fog |
| **Pikes** | Cavalry | — | Archers, Undead | Vampires | — | Clear Skies at Daylight | Thunderstorm |
| **Rebels** | — | (Home Bonus) | All | Undead | — | Clear Skies at Daylight | Thunderstorm |
| **Siege** | — | — | Cavalry, Pikes | Swords, Assassins | Fire-Artillery | Clear Skies at Daylight | Heavy Rain, Snow |
| **Spies** | — | Assassins | Spies | — | — | Cloudy or Foggy, Nighttime | Clear Skies at Daylight |
| **Swords** | — | Archers | Cavalry | Undead, Gunners | — | Clear Skies at Daylight | Thunderstorm |
| **Thieves** | — | — | Spies | Undead | — | Cloudy or Foggy, Nighttime | Clear Skies at Daylight |
| **Hunters** | Beasts | LizardFolk, Vampires, Supernatural (Monsters) | Swords | Gunners | Fire-Artillery, Anti-Magic, Heavy-Artillery | Clear Skies at Daylight | — |
| **Fiends** | Fire Cult | Fire | Grail, Drow | The Divine (i.e. Goddess Chuu) | Anti-Magic | Sunny Day, Scorching Heat | — |
| **Undead** | Swords, Rebels, Bandits | Archers, Pikes | Fey, Drow | Grail | Anti-Magic, Heavy-Artillery | Cloudy or Foggy, Nighttime | — |
| **Aerial Cavalry** | Swords, Rebels, Bandits | Cavalry, Pikes (only if anti-air doctrine is NOT prepared) | Siege (only if anti-air doctrine is NOT prepared) | Archers, Mages (Archers and Mages will be double Deadly if they have Anti-Air doctrine) | Anti-Magic, Anti-Air | Clear Skies at Daylight, Cold Clear Nights | Heavy Rain, Snowstorm, Gale Winds |
| **Vampires** | Swords, Rebels, Bandits | Archers, Pikes, Cavalry, Darkness (Nighttime) | Mages, Hunters, Fiends | Grail, Fire Cult, Artemis, Sun (Daytime) | — | Cloudy or Foggy, Nighttime | Sunny Day, Scorching Heat (especially at Daylight) |
| **Shield-Brethren** | Archers | Swords, Rebels, Bandits, Cavalry | Mages, Aerial Cavalry | Pikes, Undead, | Heavy-Artillery, Armor-Piercing | — | Swamp, Quicksand, Deep Mud |
| **Warforged (Artificial Constructs)** | — | Swords, Archers | Mages, Siege, Gunners, Builders, Cavalry | Undead | Heavy-Artillery, Anti-Magic | Clear, Dry Conditions | — |
| **Mutants** | — | — | — | — | Anti-Magic, Heavy-Artillery, | — | — |
| **Snow Elves** | — | Fey, Drow, Treeants | — | Fire Cult | Fire-Artillery | Cold, Snow | Sunny Day, Scorching Heat |
| **Fire Cult** | Treeants, Fiends | Snow Elves | — | (Any Ice/Extreme Cold Weather) | Anti-Magic, Heavy-Artillery | Sunny Day, Scorching Heat | Cold, Snow |
| **Grail** | Undead | Fiends, Vampires | Drow, Artemis | Cult of War (Cult of Kratos) | Anti-Magic | Clear Skies at Daylight | — |
| **Arrio Sisters** | Assassins, Spys | Monarchy | Invaders | Roshna (Drug Addiction) | — | Cloudy or Foggy at Daytime | — |
| **Drow (Underdark)** | Supernatural (Monsters) | Snow Elves, Fiends | Grail | Sun (Daytime), Fire Cult | Fire-Artillery, Anti-Magic | Cloudy or Foggy, Nighttime | Clear Skies at Daylight |
| **Forest Fey** | Summer Fey | Undead | Grail, Swords, Rebels (Iron) | Shadow, Drow, Winter Fey, Anti-Magic | Anti-Magic, Fire-Artillery | Clear Skies at Daylight | Cloudy or Foggy, Nighttime |
| **Mel's Army** | Thieves/Bandits | Pikes | Swords | Undead | — | Cloudy or Foggy, Nighttime | Clear Skies at Daylight |
| **Treants** | Swords, Undead | Archers, Pikes, Cavalry | Grail, Drow, Siege | Fire Cult, Snow Elves, (Any Fire/Explosive) | Fire-Artillery, Anti-Magic, Heavy-Artillery | Clear Skies at Daylight | Cold, Snow |
| **Artemis** | Swords (while the blessing remains above the minimum baseline; once they hit baseline, remove this immunity) | Undead, Fiends | Grail, Gunners | Cult of War (Cult of Kratos), | Anti-Magic | Night / Cloudy / Foggy (moonlight, concealment, and hunt-terrain) | Scorching Heat (dulls the moon's edge) |
| **Hel’s Legion** | Rebels, Bandits, Thieves, Spies | Swords, Pikes, Cavalry | Mages, Siege, Undead | Grail, Artemis, Mutants, Warforged | — | — | Heavy Rain (mud slows industrial advance) |
| **Turn Order** | — | — | — | — | — | — | — |
| **Important Clarification** | — | — | — | — | — | — | — |
| **Declaration Rule (Stops Infinite “Move In / Move Away”)** | — | — | — | — | — | — | — |
| **Battle Order (When Multiple Battles Happen)** | — | — | — | — | — | — | — |
| **Army Size Is Relative (Choose Your Scale)** | — | — | — | — | — | — | — |
| **How the GM Sets Army Size** | — | — | — | — | — | — | — |
| **How Army Size Is Used Mechanically** | — | — | — | — | — | — | — |
| **How Army Size Changes Over Time** | — | — | — | — | — | — | — |
| **How STR Is Used Mechanically** | — | — | — | — | — | — | — |
| **How the GM Sets STR (Practical Method)** | — | — | — | — | — | — | — |
| **Common STR Adjustments (Rule of Thumb)** | — | — | — | — | — | — | — |
| **Turn Order** | — | — | — | — | — | — | — |
| **What Happens in a Move Phase** | — | — | — | — | — | — | — |
| **Declaration Step (Prevents “Just Walk Away” Issues)** | — | — | — | — | — | — | — |
| **Road Bonuses** | — | — | — | — | — | — | — |
| **Difficult Terrain** | — | — | — | — | — | — | — |
| **Step 0: Set Conditions** | — | — | — | — | — | — | — |
| **Step 1: Confirm Engagements** | — | — | — | — | — | — | — |
| **Step 2: Build Dice Pools** | — | — | — | — | — | — | — |
| **Step 3: Commit Dice** | — | — | — | — | — | — | — |
| **Step 4: Roll and Compare (Risk-Style Face-Off)** | — | — | — | — | — | — | — |
| **Step 5: Resolve Outcomes and Continue** | — | — | — | — | — | — | — |
| **Full Worked Example: Building a Dice Pool from Scratch** | — | — | — | — | — | — | — |
| **Minimum Dice and What Happens When a Pool Hits Zero** | — | — | — | — | — | — | — |
| **Currency Note: Gold vs. Command Points** | — | — | — | — | — | — | — |
| **Step 0: The Survivor Roll (Used by Multiple Outcomes)** | — | — | — | — | — | — | — |
| **Outcome 1: Convert Army** | — | — | — | — | — | — | — |
| **Outcome 2: Capture Army** | — | — | — | — | — | — | — |
| **Outcome 3: Raze Army** | — | — | — | — | — | — | — |
| **Outcome 4: Liberate Army** | — | — | — | — | — | — | — |
| **Option A: Occupy** | — | — | — | — | — | — | — |
| **Option B: Sack** | — | — | — | — | — | — | — |
| **Option C: Liberate / Install Allies** | — | — | — | — | — | — | — |
| **Convert Location** | — | — | — | — | — | — | — |
| **Raze Location** | — | — | — | — | — | — | — |
| **Liberate Location** | — | — | — | — | — | — | — |
| **Retreat (Retreat Action)** | — | — | — | — | — | — | — |
| **Split** | — | — | — | — | — | — | — |
| **Flanking** | — | — | — | — | — | — | — |
| **Rest** | — | — | — | — | — | — | — |
| **Fortify** | — | — | — | — | — | — | — |
| **Fallen Commander or Special** | — | — | — | — | — | — | — |
| **Medals** | — | — | — | — | — | — | — |
| **Financial** | — | — | — | — | — | — | — |
| **Cutscene** | — | — | — | — | — | — | — |
| **Dice Impact** | — | — | — | — | — | — | — |
| **Weather** | — | — | — | — | — | — | — |
| **Terrain** | — | — | — | — | — | — | — |
| **DOCTRINE TEMPLATE** | — | — | — | — | — | — | — |

---

## 5. Deadly Doctrines Cross-Reference (Doctrine → Vulnerable Classes)
This is the reverse index from the Army Class trait matrix.

| Doctrine ID | Doctrine Name | Army classes where this doctrine is listed as Deadly Doctrine |
|---|---|---|
| `anti_air` | Anti-Air | Aerial Cavalry |
| `anti_magic` | Anti-Magic | Mages, Hunters, Fiends, Undead, Aerial Cavalry, Warforged (Artificial Constructs), Mutants, Fire Cult, Grail, Drow (Underdark), Forest Fey, Treants, Artemis |
| `heavy_artillery` | Heavy Artillery | Hunters, Undead, Shield-Brethren, Warforged (Artificial Constructs), Mutants, Fire Cult, Treants |
| `fire_artillery` | Fire Artillery | Siege, Hunters, Snow Elves, Drow (Underdark), Forest Fey, Treants |
| `elemental_ammunition` | Elemental Ammunition | — |
| `armor_piercing` | Armor-Piercing | Shield-Brethren |
| `heavy_protection` | Heavy-Protection | — |
| `battlefield_weavers` | Battlefield Weavers | — |
| `counterspell_cadre` | Counterspell Cadre | — |
| `wild_surge_license` | Wild Surge License | — |
| `ritual_artillery` | Ritual Artillery | — |
| `ward_smiths` | Ward-Smiths | — |
| `soul_binders` | Soul-Binders | — |
| `spellthief_detachment` | Spellthief Detachment | — |

---

## 6. Elemental Ammunition — Damage Type Cross-Reference (Trait/Weather Tokens)
Elemental Ammunition says: choose **one damage type**, then treat that damage type as participating in
**immunity/resistance/vulnerability/deadly** matchup resolution.

Because the rules express some of these as natural language tokens (e.g., “Any Ice/Extreme Cold Weather”, “Any Fire/Explosive”),
the safest implementation approach is:
1) match against explicit damage-type tokens when present  
2) additionally match against equivalent **rules tokens** (below) that clearly refer to the same thing

> The table below lists which army classes include related tokens in any of:
> Immunities / Resistances / Vulnerabilities / Deadly / Preferred Weather / Undesired Weather.

| Damage Type (Elemental Ammunition) | Army classes with related tokens in traits/weather | Keywords used (rules tokens) |
|---|---|---|
| acid | — | acid |
| cold | Cavalry, Siege, Aerial Cavalry, Snow Elves, Fire Cult, Drow (Underdark), Treants | cold, ice, snow, wet |
| fire | Fiends, Vampires, Snow Elves, Drow (Underdark), Treants | fire, explosive |
| force | — | force |
| lightning | — | lightning |
| necrotic | Archers, Bandits, Cavalry, Gunners, Pikes, Rebels, Swords, Thieves, Shield-Brethren, Warforged (Artificial Constructs), Grail, Forest Fey, Mel's Army, Treants, Artemis, Hel’s Legion | necrotic, undead |
| poison | — | poison |
| psychic | — | psychic |
| radiant | — | radiant |
| thunder | Bandits, Builders, Gunners, Pikes, Rebels, Swords | thunder |

**Important constraint:** This index is a *token finder*, not a new rule. If a class does not list the token (or a clear equivalent),
Elemental Ammunition should not invent additional matchups.

---

## 7. Special Rule Interaction: Mages vs Anti-Magic (as authored)
The **Mages** army class contains explicit exceptions when Anti-Magic is present:

- \* **Ward Screen (Defense):** A defending allied army within 5 miles (1 space) gains \+2d6 to their dice pool for that battle. Does not work if the attacking army has Anti-Magic doctrine.
- \* **Arcane Volley (Attack):** When attacking, Mages can force the defending opposing army to suffer \-2d6 to their dice pool unless that opposing army is Spies or Assassins (they only suffer \-1d6). Does not work if the defending army has Anti-Magic doctrine.
- Mages’ abilities do not work if an enemy army with Anti-Magic doctrine is within 5 miles (1 space). Mages’ roll d4s for their dice pool when attacking or defending an army with the Anti-Magic doctrine.
- * **Deadly Doctrines:** Anti-Magic

---

## 8. Doctrine-side explicit dice effects (quick checklist)
The following doctrines include **explicit** dice pool or die-step changes in their rule text:

- **Heavy Artillery**: damage die **+1 step**  
- **Fire Artillery**: adds additional **-3 dice** if target already deadly to Fire; **max -6 dice**; also **Cold/Wet = -1 die** when active  
- **Elemental Ammunition**: if enemy resists/immune to chosen type → attacker **-1 die** that phase  
- **Armor-Piercing**: ignore a **-1 die penalty** once/phase; may gain **+1 die** vs heavy protection; then **-1 die next phase**  
- **Heavy-Protection**: attackers suffer **-1 die** once/phase (unless Armor-Piercing negates)  
- **Battlefield Weavers**: after using, dice pool **-1 next phase**  
- **Wild Surge License**: die size **+1 step**; on complication, dice pool **-1 next phase**  
- **Ward-Smiths**: after use, dice pool **-1 next phase**  

Other doctrines primarily change matchups (Deadly/Vulnerable/Neutral tiers) rather than directly adding/subtracting dice.

---

## 9. Notes on “double-down” stacking (rules-aligned)
When a doctrine introduces a damage type or deadly doctrine trigger (e.g., Fire Artillery, Elemental Ammunition), it can stack with:
- the target’s **Deadly Doctrines** list (doctrine-based -3 dice)  
- the target’s **Deadly / Vulnerability** entries (damage-type / class matchup -3 or -1 dice effects)  
- weather preferences/undesired weather where explicitly referenced by the doctrine (Fire Artillery; Battlefield Weavers)

This is why the trait matrix is included in full above: it’s the canonical source for these stacked outcomes.

