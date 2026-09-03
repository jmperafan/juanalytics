---
name: humanize-writing
description: Edit blog-post prose so it reads like Juan wrote it, not a model. Two passes — a mechanical sweep for AI-writing tells (promotional adjectives, AI vocabulary, em-dash overuse, padded triads, hedging, vague attribution) and a developmental pass for voice (find the point, compress, replace vague claims with the concrete command/number/failure mode, keep the register). Use when drafting or reviewing the body prose of a post in content/blogs/*.md — the sentences, not code blocks, frontmatter, or embedded HTML/JS. Anchored on the gold-standard chapter in this skill's reference.md.
---

# Humanize writing

Get a draft to read like Juan wrote it. This applies to the body prose of posts
in `content/blogs/*.md` — the sentences that make an argument or tell a story.
It does **not** touch code blocks, commands, config keys, flag names,
frontmatter, or embedded HTML/JS (e.g. the Tableau embed in
`psychology-to-data.md`); those are exact by nature.

Two passes. Pass 1 is a mechanical pattern sweep. Pass 2 is the developmental
edit — is the paragraph actually saying something, or does it just sound like
it is. Do them in order, but Pass 2 often dissolves Pass 1 patterns on its own,
since AI tells are what fills the space where a specific claim should be.

## The voice you're aiming at

**Read `reference.md` in this folder first.** The gold standard is Chapter 13 of
*Fundamentals of Analytics Engineering* (Juan co-wrote it); `reference.md`
distills the eight things its voice does and shows where even that chapter
slips. The full PDF is in this folder for local reading (gitignored — don't
commit it, the publisher holds copyright and this repo is public).

For the same voice in a shorter, punchier register, read two existing posts:
`writeops-manifesto.md` (argumentative) and `psychology-to-data.md` (personal,
first person). Juan writes both registers. The target is one of them with the
model residue removed — not neutral, measured prose.

Deliberate style that is **not** a tell here:

- **Short declaratives stacked for cadence.** "This is insane. We have better
  tools. We know better patterns." Rhythm, not padding.
- **Rhetorical triples used for beat.** "Version control it. Test it. Automate
  it." Keep it when it lands; only cut a triad of three vague nouns
  ("scalability, flexibility, and reliability") assembled to sound thorough.
- **Title Case headings.** Every existing post uses them. Match that — do not
  "fix" headings to sentence case.
- **First person and strong opinions.** The whole point of a personal blog is
  the person in it. A wrong opinion stated clearly beats a balanced survey that
  concludes nothing.

## Pass 1 — mechanical sweep

### Content patterns

| Pattern | Watch for | Fix |
|---|---|---|
| **Inflated significance** | "plays a crucial/pivotal role," "represents a shift," "sets the stage for," "underscores its importance" | State what it does. Drop the claim about historical importance. |
| **Promotional language** | "powerful," "robust," "seamless," "cutting-edge," "industry-leading," "rich ecosystem," "game-changer" | Replace with the specific capability. "Robust error handling" → "raises a typed exception with the failing row." |
| **Superficial -ing tacked on for depth** | "…ensuring consistency," "…fostering collaboration," "…highlighting its flexibility" | Delete the clause, or replace with the mechanism that produces the effect. |
| **Vague attribution** | "many teams find," "it's widely considered," "practitioners agree," "some argue" | Name the source, say "I think" if it's your opinion, or cut it. |
| **Formulaic "downsides" section** | "Despite its advantages, X faces some challenges…" then generic hedges | State the specific limitation and when it bites. `sql-for-data-analytics.md` does this well with "The Gaps." |
| **Rule-of-three padding** | Three items where the third is filler, or all three are vague nouns | Keep triads with rhythm and concrete items; cut the ones assembled to sound complete. |

### Language and grammar

| Pattern | Watch for | Fix |
|---|---|---|
| **AI vocabulary** | additionally, delve, crucial, leverage, foster, garner, intricate, pivotal, landscape (abstract), tapestry, testament, underscore, seamless, robust, streamline, realm, navigate (abstract) | Use the plain word, or cut the sentence. "Leverage the API" → "call the API." |
| **Copula avoidance** | "serves as," "stands as," "functions as," "boasts," "acts as a" in place of is/has | Use "is" or "has." |
| **Negative parallelism** | "It's not just X, it's Y" as a reflex | Fine once for emphasis; if it recurs, rewrite one to state Y directly. |
| **False range** | "from simple scripts to enterprise-grade pipelines" when the ends aren't on a real scale | Name the actual boundaries, or drop the range. |
| **Throat-clearing openers** | "In today's data-driven world," "As we all know," "It's worth noting that," "When it comes to X" | Delete. Start with the sentence that carries information. |

### Style and filler

| Pattern | Watch for | Fix |
|---|---|---|
| **Em-dash overuse** | — where a comma or period would do, or more than one per paragraph | Reserve for a genuine aside. Existing posts lean on periods and commas. |
| **Mechanical boldface** | Bolding every key term on first mention | Bold only the line a skimming reader should stop on. The manifesto bolds thesis sentences, not vocabulary. |
| **Inline-header lists** | "- **Speed:** It's faster. - **Safety:** It's safer." | Fold into prose, or make the list item the content, not a label plus a restatement. |
| **Summary that adds nothing** | "In conclusion, X is a valuable tool that…" | End on the sharpest line of the argument. See `reference.md` trait 8. |
| **Hedging** | "in order to," "it is important to note that," "has the ability to," "could potentially cause issues in some cases," "there are a number of ways" | "to," delete, "can," name the actual case, state the ways. |

## Pass 2 — developmental edit

**1. Find the point first.** Every section makes one move — an argument, a
comparison, a story beat. If you can't state it in one sentence, the section
doesn't know what it's for. Fix the move, then the prose.

**2. Compress ruthlessly.** Cut restated transitions and any sentence that says
what the next code block or list already shows. Target 20–40% shorter. The
manifesto never wastes a sentence.

**3. Concrete over abstract — show, don't tell.** Don't assert a tool is
flexible; show the one line that changes when the requirement changes. Don't
say "handles errors gracefully"; show the exception it raises. `reference.md`
trait 3: coffee, shrimp, a kid's toy — concrete nouns do the persuading.

**4. Define by consequence.** `reference.md` trait 2: "it is not about creating
new dashboards but ensuring the existing ones do not break" beats any
dictionary definition.

**5. Name the gotcha instead of hedging it.** "This might occasionally cause
issues" tells the reader nothing. "This throws `IntegrityError` if the foreign
key doesn't exist yet — create the parent row first" tells them what to check.

**6. Keep the register, don't flatten it.** If the draft is a manifesto, keep
the short punchy sentences and the repetition. If it's a personal essay, keep
the first person and the asides. The failure mode is editing both into the same
beige middle.

### Fast tests

- **Point test.** State the section's move in one sentence, then in six words.
  Hard? It doesn't have one yet.
- **Concreteness test.** Find the vaguest adjective ("powerful," "flexible,"
  "efficient"). Can it be replaced by the specific command, number, or
  behavior? If not, cut the sentence.
- **Skim test.** Could a reader skip this paragraph and lose nothing? Then it's
  decoration — sharpen it into a real beat or delete it.
- **Register test.** Read it next to a strong passage from `reference.md` or the
  matching blog post. Same person, or has it drifted toward neutral?

## Process

1. Read the passage; identify its register (argumentative or personal) and its
   one move.
2. Pass 1: mark and rewrite every mechanical pattern. Replace a vague claim with
   the concrete fact behind it, don't just delete the padding.
3. Pass 2: restructure so the most specific material leads; line-edit for the
   six principles; run the fast tests.
4. Self-audit: "what still makes this sound generated?" — answer honestly in a
   few bullets, then revise again.
5. Confirm nothing in a code block, command, config key, frontmatter field, or
   embedded HTML/JS got touched.

## Output

Present the revision plus a short list of what changed and why — one line per
significant change — so Juan can accept or reject each. Some "generic-sounding"
claims are just true and don't need an example: flag those rather than forcing a
war story. Also flag anything you left because it's deliberate style (a triad
with rhythm, a bold thesis line, a Title Case heading).
