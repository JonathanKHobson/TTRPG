# Assist / Hinder System — Rules Extraction Pack (v0.1)
**Source of truth:** `War_Encounter_Rules_Reformatted_v2.md`  
**Purpose:** Pull *only* the rules that mention **proximity**, **adjacency**, **range**, or other **conditional effects** that can change either side’s **dice pool** (directly or indirectly via STR/Size), so we can write a clean PRD for the “Nearby Armies Assist/Hinder” feature.

---

## 1) Key Terms & Measurement

### 1.1 Spaces ↔ Miles (range language)
The rules use both **miles** and **spaces** as the same measurement system:

- Movement tables show “Miles / Phase” and “Spaces / Phase” in the same row (e.g., 10 miles = 2 spaces).  
  fileciteturn7file5L7-L14
- Several army rules explicitly say **“1 space (5 miles)”**.  
  fileciteturn7file4L1-L3 fileciteturn7file13L37-L38

**Practical engineering default:** treat **1 space = 5 miles** (consistent with the explicit “1 space (5 miles)” wording).

### 1.2 “Adjacent” vs “Within X spaces”
The rules use:
- **Adjacent** (implies very close proximity; usually “same space / next to”)
- **Within 5 miles (1 space)** (a radius / proximity)
- **Within 2 spaces** (longer-range support)

We’ll model these explicitly as **range categories** (Adjacency, 1-space radius, 2-space radius, Same-location).

---

## 2) Canonical Proximity / Conditional Rules That Affect Dice Pools

> **How to read this table:**  
> - **Effect Type** is phrased in implementation-friendly language (add dice, remove dice, reroll rule, STR mod, etc.)  
> - This is *not new design*. It’s a faithful extraction of rules-as-written.

### 2.1 Standard Army Classes (Non-Special)

| Source | Trigger / Range | Affects | Effect (Dice / STR) | Notes | Citation |
|---|---|---|---|---|---|
| **Archers** | Attacking an enemy **2 spaces away** | Enemy (defense) | Enemy suffers **−2d6** to defense (Cavalry only **−1d6**) | Also: Archers have **10 miles (2 spaces) reach** | fileciteturn6file0L11-L18 |
| **Archers** | Ally defending vs enemy that is **within 2 spaces of the Archers** | Ally defender | Ally gains **+2d6** | This is *the cleanest “assist” precedent* in the rules | fileciteturn6file0L11-L14 |
| **Assassins (unseen)** | Battle Phase action; target is **adjacent** (and is battling another army same phase) | Opposing army | Remove target’s **highest rolled d6** from play | Does **not** reveal assassin location | fileciteturn6file0L33-L34 |
| **Spies (unseen)** | Battle Phase action; ally is **adjacent** (and is battling another army same phase) | Ally army | Ally may **remove their lowest rolled d6** from play | Does **not** reveal spy location | fileciteturn7file6L1-L3 |
| **Thieves** | Battle Phase “steal” action vs opposing army **within 5 miles (1 space)** | Both armies | Opponent **STR −1d4**; Thieves **STR +1d4** | STR affects dice pool indirectly (pool is built from Size + STR) | fileciteturn7file6L35-L36 |
| **Rebels** | Defending **within 5 miles (1 space)** of their home location | Rebels | **+1d6** | Home-advantage conditional buff | fileciteturn7file8L5-L8 |
| **Pikes** | If **flanked by two opposing armies** | Pikes | **−1d6** | “Flanked by two armies” implies multi-enemy proximity scenario | fileciteturn7file4L20-L23 |

### 2.2 Special Army Classes (Faction / Supernatural)

| Source | Trigger / Range | Affects | Effect (Dice / STR / Size) | Notes | Citation |
|---|---|---|---|---|---|
| **Mages** | “Ward Screen” — defending allied army **within 5 miles (1 space)** | Ally defender | **+2d6** to ally’s dice pool | Blocked if **attacker has Anti-Magic doctrine** | fileciteturn6file3L35-L40 |
| **Mages** | “Arcane Volley” — when Mages are attacking | Enemy defender | Enemy suffers **−2d6** (Spies/Assassins only **−1d6**) | Blocked if **defender has Anti-Magic doctrine** | fileciteturn6file3L37-L40 |
| **Mages** | Passive constraint: if an enemy with Anti-Magic doctrine is **within 5 miles (1 space)** | Mages | Mage abilities **do not work** | Also: vs Anti-Magic, Mages roll **d4s** for dice pool | fileciteturn7file0L1-L3 |
| **Builders** | **Siege Prep**: Siege army is in **same location** | Siege ally | Siege gains **+1d6** in its *next* battle | **Stacks once, not repeatedly** | fileciteturn5file5L39-L42 |
| **Builders** | **Repair & Reinforce**: allied army in **same location** | Allied army | Remove **−1d6 worth of penalties** (env/terrain damage/sabotage) | “GM adjudicates what’s repairable” | fileciteturn5file5L41-L43 |
| **Forest Fey** | Defending in **Heartland forest environment** | Forest Fey | **+3d6** | Terrain-conditional buff | fileciteturn6file4L19-L22 |
| **Forest Fey** | Restore action: target ally is **within 5 miles (1 space)** during both phases | Ally (non-special list) | Restore **+10 units** | Indirectly impacts dice pool via Army Size | fileciteturn6file4L21-L22 |
| **Mel’s Army** | Hidden attack | Mel’s Army | **+2d6** when attacking while hidden | Conditional (state) rather than proximity | fileciteturn6file4L39-L41 |
| **Mel’s Army** | Move Action theft vs opposing army **within 5 miles (1 space)** | Both armies | Opponent **STR −1d10** (or **−2d10 if hidden**); Mel **STR + same** | STR affects dice pool indirectly | fileciteturn6file4L41-L42 |
| **Mel’s Army** | Free action: gain Spy “adjacent ally remove lowest d6” benefit | Self or **adjacent ally** | Grants Spy-style dice manipulation | Mentions “adjacent ally” explicitly | fileciteturn6file4L41-L42 |
| **Treants** | Invisible (no move in forest) → surprise attack on **adjacent opposing army within 5 miles (1 space)** | Treants | **+3d6** | Conditional + adjacency; requires enemy lacks intel | fileciteturn6file10L39-L40 |
| **Shield-Brethren** | Bulwark Formation: defending a **city/fort/choke point** | Opposing army | Opponent suffers **−2d6** | Context-conditional | fileciteturn7file13L31-L38 |
| **Shield-Brethren** | Bulwark Formation: allies **1 space (5 miles)** away, defending | Allied defenders | Allies gain **+1d6** | Passive aura-style “assist” effect | fileciteturn7file13L36-L38 |
| **Hunters** | Defending in swamp environment | Hunters | **+3d6** | Terrain-conditional | fileciteturn6file8L1-L1 |
| **Drow (Underdark)** | Day vs Night | Drow | Day: **−3d6**; Night: **+2d6** (with caveat about enemies who also prefer night) | Conditional (time/weather) | fileciteturn5file0L1-L4 |

### 2.3 System-Level “Conditional Modifier” Hook (non-proximity)
Even though not proximity, it’s a precedent for *external* “assist-like” modifiers:

- Cinematic sequences can apply **agreed results** like **−2 dice** to a pool.  
  fileciteturn6file12L7-L12

This is relevant because Assist/Hinder can follow the same “external modifier” plumbing as Cinematic adjustments.

---

## 3) Doctrine-Based Range / Area Effects (Relevant to Assist/Hinder)

Most doctrines are “army-local” augments. However, **Mage-specific augment doctrines** explicitly mention ranges / zones:

| Doctrine | Range Language | Potential Assist/Hinder Interpretation | Citation |
|---|---|---|---|
| **Battlefield Weavers** | “5-mile radius” weather shift | Area effect that can change weather → indirectly affect dice pools via preferred/undesired weather | fileciteturn5file10L15-L33 |
| **Ritual Artillery** | “10 miles (2 spaces)” reach | Enables long-range threat; could be modeled later as “hinder from afar” | fileciteturn5file10L17-L19 |
| **Spellthief Detachment** | “within 5 miles” copy augment tag | Could be modeled later as “proximity doctrine interaction” | fileciteturn5file10L19-L22 |
| **Ward-Smiths** | “ally in zone” | “Protect ally” support behavior (not dice, but negating deadly effects) | fileciteturn5file10L18-L21 |

Also note the *army-level* Anti-Magic doctrine interaction with Mages (functionally a proximity doctrine effect):  
- If an enemy with Anti-Magic is **within 5 miles (1 space)**, Mage abilities do not work.  
  fileciteturn7file0L1-L3

---

## 4) What We *Do Not* Have (Yet): A General “Help” Rule

You were right to suspect it: the rules are currently written as **specific-case support mechanics** (Archers assist, Mages assist, Shield-Brethren aura, etc.) rather than a single generic “any nearby army can help” rule.

The closest “system hook” is the **Cinematic Sequence modifier step** fileciteturn6file12L7-L12 and the general “dice pool is modified by ordered steps” language fileciteturn7file5L66-L68 — but there is no explicit universal Help rule here.

---

## 5) MVP Recommendation for the Assist/Hinder Feature (Rules-Accurate)

**Phase 1 (rules-accurate):** implement *only* these support/hinder sources:
- Archers (2-space debuff; 2-space defensive assist) fileciteturn6file0L11-L14  
- Mages (Ward Screen / Arcane Volley) + Anti-Magic suppression fileciteturn6file3L35-L44  
- Shield-Brethren (aura + choke-point debuff) fileciteturn7file13L31-L38  
- Spies / Assassins (adjacent dice manipulation) fileciteturn7file6L1-L3 fileciteturn6file0L33-L34  
- Builders (same-location siege prep + repair) fileciteturn5file5L39-L43  
- Thieves / Mel’s Army theft (STR transfer within 1 space) fileciteturn7file6L35-L36 fileciteturn6file4L41-L42  
- Optional: Forest Fey restore units (Size change within 1 space) fileciteturn6file4L21-L22  

**Why this is the right starting cut:** it’s grounded in rules text and immediately makes battles feel like “war” instead of isolated duels.

---

## 6) (Optional) Design Brainstorm: If We Add a General Help Rule Later

If you decide to add a universal Help mechanic later, two low-risk options:

1) **“Support Die” rule (simple):**  
Any allied army within 1 space may contribute **+1d6** to the engaged ally **once per battle phase** (cap: +2d6 total from generic help).  
- Advantage: easy mental model; fits your existing +d6 language.
- Risk: can overpower stacking unless capped.

2) **“Tactical Reroll” rule (cleaner, less swingy):**  
A nearby allied army can allow the engaged army to **reroll one die** (or “remove lowest d6”) once per battle phase.  
- Advantage: feels like “coordination,” not raw power creep.
- Matches Spy-style “remove lowest d6” precedent fileciteturn7file6L1-L3

---

## 7) Open Questions to Resolve Before PRD (so engineering doesn’t guess)

1) Do we want “Assist/Hinder armies” to require the user to specify **range** (Adjacent / 1 space / 2 spaces / same location), or do we assume it’s true and just let the user select which effects apply?
2) Can one assisting army apply **multiple** assist effects in the same battle phase (e.g., a Mage choosing Ward Screen *and* Arcane Volley)? The current Mage rule says “Choose one option.” fileciteturn6file3L35-L40
3) Should “hidden” be a tracked state in the tool for Bandits / Mel’s Army / Treants? (The rules use it heavily for conditional bonuses.) fileciteturn6file0L51-L55 fileciteturn6file10L39-L40

---

**Next step:** Once you confirm the above open questions, we can turn this extraction into a full PRD + implementation roadmap (UI, data model, acceptance criteria, and slice plan).
