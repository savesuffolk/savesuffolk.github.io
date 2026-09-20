# Research dossiers (2026-09-19)

Raw research for three proposed new pages. Not served by the site; source material for `data/*.js` and new HTML pages.

| File | Proposed page | Status |
|---|---|---|
| `property-values.md` | **Property Values** — hedonic studies, appraisal doctrine, Holbrook ZHVI, dollar-exposure table, counter-evidence + rebuttals | Every URL marked VERIFIED/UNVERIFIED. Lead Amazon-specific stat (SSRN 2024, ~10% within ½ mi) still needs manual PDF check. |
| `noise.md` + `noise-calc.py` | **Noise & Light** — source levels, propagation formulas (JS-ready spec), worked example 300 ft → 1 mi, DEC DEP-00-1 + Islip Ch. 35 thresholds, WHO health lines, real FC cases | Islip Code Ch. 35 Table 1 dBA limits still unretrieved (eCode360 blocked). |
| `audio-clips.md` | **Noise page → Hear it from the neighbors** — verified YouTube/station clips; Amazon-specific bedroom audio is scarce | Audio content not yet listened to. |
| `power-roads-services.md` + `filing-power-services.md` | **Your House → "Also on the table" / More tab** — electricity (12.1 MW), road wear (GAO 9,600 cars), EMS/fire (Senate injury rate, Holbrook FD calls, Redlands), schools/IDA (OSC $717M), drones, heat, stormwater, idling; FOIL list | News sources blocked; road-damage anecdotes and drone dB unverified, not published. |
| `voices.md` | **Voices from other towns** — ~60 attributed resident quotes grouped by facility, 16-video gallery, promises-vs-outcomes table, pull quotes | Reddit/Newsday/syracuse.com blocked; SYR1 Clay post-opening resident testimony is the main gap. |

Verification key used throughout: VERIFIED = fetched and read; UNVERIFIED = search snippet only, confirm before publishing; PARAPHRASE = not a direct quote; estimate = researcher assumption.

## Audience principles (approved plan, 2026-09-20)

Reader: a couple in their early-to-mid 50s (Holbrook median age 43.4 and rising; ~30% of households have kids; ~1 in 5 residents is 65+), on a phone, from Facebook, 90 seconds.

1. One question per screen, one answer, one button.
2. Plain words on landing pages; dBA / Leq / LAmax / SEQRA / PILOT / FAR / IMUPDD only inside Sources folds.
3. At most three numbers above the fold; the rest behind "show the math."
4. Neighbors before studies.
5. Phone first: 44 px targets, no hover-only affordances, no horizontal scroll.
6. 18 px body on phones; muted text ≥ 4.5:1.
7. Verification tags only in Sources contexts (CSS scopes `.basis`).
