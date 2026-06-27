---
name: youtube-script
description: Write, plan, or improve a YouTube script using a proven structure (Hook → 3Ps intro → List/Steps/Stories → CTA) plus Alex Hormozi's 10-to-1 content rule, then self-audit the draft against a retention/quality bar before delivering. Use whenever the user wants to script a YouTube video, draft a video outline, write a hook or intro, or tighten an existing script.
---

# YouTube Script Builder

Turn a video idea into a **record-ready script** that follows the framework *and* survives the comment section. You act as scriptwriter **and** a tough evaluator in the same pass — draft to the framework, then grade your own draft and fix what's weak before handing it over.

## What this produces
A clean markdown script containing: a hook, a 3Ps intro (Proof · Promise · Plan), three teaching points (each with steps, a stat or belief-breaking explanation, and a personal story), open loops between sections, `[ON SCREEN]` capture cues, and one clear CTA — plus a short self-audit scorecard and a list of `[INSERT …]` placeholders only the user can fill.

## Reference files — read the relevant one *before* the matching step
- `references/framework.md` — the structure, the 10-to-1 rule, the vehicles, the value equation. **Read before drafting (Step 2).**
- `references/quality-bar.md` — the scorecard dimensions and the failure modes to avoid. **Read before the self-audit (Step 3).**
- `templates/script-skeleton.md` — the exact output layout to fill in Step 2.

## Workflow

### 1 · Gather inputs (don't skip — weak inputs = weak script)
If the user already gave notes, a topic, or a rough draft, mine it first and **only ask for what's genuinely missing**. Keep questions batched and short. You need:
- **Topic / working title.**
- **The ONE thing** — the single action or belief the viewer should leave with. (10-to-1 = one ask, not five.) If they give several, help them pick one or split into separate videos.
- **Proof** — their credibility or result for this topic, *and* whether they can show it on screen.
- **The 3 key points** — or offer to derive them from the topic and confirm.
- **A personal story per point** — short, specific, ideally belief-breaking. If they have none, ask 2–3 probing questions to surface one.
- **CTA destination** — where viewers should go (community, lead magnet, subscribe, link).
- **Mode** — *full teleprompter script*, or *speak-freely outline* (intro fully scripted, body in tight bullets).

### 2 · Draft
Read `references/framework.md`, then fill `templates/script-skeleton.md` exactly. Non-negotiables while drafting:
- **Hook** reinforces the title and **leads with the outcome/speed**, not backstory.
- **Plan steps = the 3 teaching points** (keep them 1:1 — no mismatch).
- **Each point:** concrete steps → one stat *or* an explanation that breaks a belief → the personal story.
- **Stack reasons across the whole video** (10-to-1); wrap the offer in the **value equation** (dream outcome → fast → easy → risk-free), and **lead with speed** somewhere.
- Add an **open loop** at the end of the intro and at the end of each section (tease the next one).
- Add **`[ON SCREEN]`** cues for every step — especially for tutorials/demos, where the screen *is* the content.
- **One CTA**, complete, to a single destination.
- Use **`[INSERT …]`** for any number, price, or result only the user can verify. **Never invent stats.**

### 3 · Self-audit (now be the tough evaluator)
Read `references/quality-bar.md` and score the draft on every dimension. Fix weak spots in place where you can; flag the ones that need the user (real data, a title call). **Hard-check the two killers:**
- **Title ↔ content honesty** — does the body actually deliver what the title/hook promises? If not, reframe the promise to the real deliverable, or flag the gap and offer both paths.
- **Proof → payoff** — does the video *show* the promised result, or quietly hand off to "later/eventually"? Close the loop, or downgrade the claim to what's true.

### 4 · Deliver
- Write the script to `<slug>-script.md` in the working directory (or a path the user specifies). Use `SendUserFile` so they get the file.
- Output a **one-line-per-dimension scorecard** and the **placeholder list**.
- Offer logical next steps: 3–5 **title + thumbnail-text** options, a **pinned comment** that pre-empts likely objections, or a **B-roll / shot list** from the `[ON SCREEN]` cues.

## Notes
- This skill is self-contained — it does not depend on other files in the repo.
- Respect the user's voice. Keep copy at a ~5th-grade reading level: short sentences, concrete words, show *how* not just *what*.
- A script that merely "passes the framework checklist" is not the goal. The goal is a video a stranger watches to the end and doesn't feel lied to.
