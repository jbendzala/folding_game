# FOLD — Level Design Document (Levels 1–50)

## Core mechanics recap (as designed against)

- **Grid & paper:** the sheet is a set of unit cells on a grid. `■` = paper, blank = no paper (a hole or outside the shape). `★` = the target cell/marker referenced in the goal.
- **A fold** = pick a grid line (vertical or horizontal) crossing the current shape's bounding box, and a direction — which side flips onto the other. The chosen side rotates 180° about that line and lands on top of the stationary side.
- **Result of a fold** = the union of the stationary footprint and the mirrored footprint of the flipped side. Any grid coordinate with paper in *at least one* layer, at the end, is solid. A coordinate is a **hole** in the final result only if *every* layer ever stacked there was empty.
- **This has one important consequence I designed around:** folding a solid rectangle always produces another rectangle. Non-rectangular target shapes (T, plus, staircase, crown, dragon…) require the *starting* paper itself to be non-rectangular, or a hole to be deliberately preserved rather than patched. World 3 onward relies on this.
- **Worlds 1–2** use the simplest possible goal: reduce the whole sheet, via folds, until only one marked cell (★) remains as a 1×1 result. This isolates "which direction do I fold" and "how many folds does this size need" before anything else is layered on.
- **Worlds 3–4** generalize the goal to an arbitrary target *silhouette* (not just one cell), and introduce holes: sometimes you want a fold to patch a gap (paper overlays it), sometimes you want to deliberately preserve one (never let paper land there).
- **World 5** adds the second win condition promised in the brief: **layer order**. Every cell keeps a small printed mark on its front face. A fold flips the moving flap's face and places it on top of the existing stack at the overlap. From here, the silhouette must match *and* specific marks must land in a specific top-to-bottom order at specific cells.
- **Expected Folds** is the minimum count for the intended solution; a level is still "solved" with a longer sequence, but only the minimum earns full stars — this gives you a stars/optimization layer for free without new mechanics.
- **Solution notation:** `V<k>→` = vertical fold line after column *k*, left side flips right. `V<k>←` = right side flips left. `H<k>↓` = horizontal fold line after row *k*, top flips down. `H<k>↑` = bottom flips up.

---

# WORLD 1 — "The Basics"
*Goal type throughout: fold the sheet down to a single 1×1 result at ★.*

### 1. Tiny Square
```
■ ■
■ ★
```
- **Goal:** reduce to 1×1 at ★ (bottom-right).
- **New Concept:** one vertical fold + one horizontal fold; folding always moves the *side without the target*.
- **Difficulty:** 1/10
- **Expected Folds:** 2 — `V1→` then `H1↓`
- **Why it matters:** the entire grammar of the game in the smallest possible box. Nothing else competes for attention.
- **Artist notes:** this is the tutorial card — give the fold line a bright highlight and a hand-drag hint the very first time.

### 2. Green Corner
```
★ ■
■ ■
```
- **Goal:** same shape as Level 1, target now top-left.
- **New Concept:** the *same-looking* puzzle needs the *opposite* fold directions. First quiet correction of a habit.
- **Difficulty:** 1/10
- **Expected Folds:** 2 — `V1←` then `H1↑`
- **Why it matters:** a player who solved Level 1 by muscle memory (always fold right, always fold down) fails here instantly — cheap, safe, memorable lesson.
- **Artist notes:** keep the palette identical to Level 1 so the "wait, this is different" hits harder.

### 3. Wide Rectangle
```
★ ■ ■ ■
■ ■ ■ ■
```
- **Goal:** reduce 2×4 to 1×1 at far top-left.
- **New Concept:** chaining two folds on the *same* axis (4 → 2 → 1) before touching the other axis.
- **Difficulty:** 2/10
- **Expected Folds:** 3 — `V2→` (via col2|col3, right half onto left), `V1→`, `H1↓`
- **Why it matters:** first taste of "this dimension needs more than one fold" — sets up all of World 2.
- **Artist notes:** long thin card reads well as a banner shape; good candidate for a level-select thumbnail with motion (unrolls sideways).

### 4. Tall Rectangle
```
■ ★
■ ■
■ ■
■ ■
```
- **Goal:** reduce 4×2 to 1×1 at top-right.
- **New Concept:** mirrors Level 3 on the other axis — confirms the player generalized, not memorized.
- **Difficulty:** 2/10
- **Expected Folds:** 3 — `H2↓`, `H1↓`, `V1←`
- **Why it matters:** cheap but necessary — proves the lesson transfers across axes.
- **Artist notes:** rotate Level 3's art 90° for a nice visual rhyme between the two cards on the level-select map.

### 5. Large Square
```
■ ■ ■ ★
■ ■ ■ ■
■ ■ ■ ■
■ ■ ■ ■
```
- **Goal:** reduce 4×4 to 1×1, target top-right corner.
- **New Concept:** first level requiring both axes *and* multiple folds per axis — the first real 4-fold plan.
- **Difficulty:** 3/10
- **Expected Folds:** 4 — `V2→`, `V1→`, `H1↓` (order of the row/column folds is free — they don't interact).
- **Why it matters:** the first level that needs to be *planned*, not walked through.
- **Artist notes:** biggest, cleanest square yet — good "world escalation" beat.

### 6. Center Target
```
■ ■ ■ ■
■ ■ ★ ■
■ ■ ■ ■
■ ■ ■ ■
```
- **Goal:** reduce 4×4 to 1×1, target one of the four center cells.
- **New Concept:** the target is near the fold's center line — both directions *look* equally plausible; only one preserves it.
- **Difficulty:** 3/10
- **Expected Folds:** 4 — `V2←` (target is just right of center, so the *left* half must move), `V1→`, `H2↓`, `H1↓`... actually target sits in row 2, so first horizontal fold is `H2↑`? Practically: fold whichever half does **not** contain ★ onto the half that does.
- **Why it matters:** first deliberate "obvious fold, wrong pick" trap — teaches players to locate the target relative to the line before committing.
- **Artist notes:** dim the non-target cells slightly more here so the near-miss reads clearly on replay.

### 7. Edge Target
```
■ ★ ■ ■
■ ■ ■ ■
■ ■ ■ ■
■ ■ ■ ■
```
- **Goal:** reduce 4×4 to 1×1, target on the top edge (not a corner).
- **New Concept:** the vertical folds and horizontal folds are fully independent here — do them in any order, same result. First explicit "order doesn't matter" reassurance.
- **Difficulty:** 4/10
- **Expected Folds:** 4
- **Why it matters:** removes an anxiety (players start worrying about sequencing after Level 6's trap) at exactly the right moment.
- **Artist notes:** UI could literally let the player fold rows and columns in any order and show both paths converging — nice one-off animation flourish.

### 8. Opposite Corner
```
■ ■ ■ ■
■ ■ ■ ■
■ ■ ■ ■
★ ■ ■ ■
```
- **Goal:** reduce 4×4 to 1×1, target is the mirror-opposite corner of Level 5.
- **New Concept:** nothing mechanically new — this is a deliberate memorization trap. A player who pattern-matched Level 5's fold directions and reapplies them blind will fail.
- **Difficulty:** 4/10
- **Expected Folds:** 4 — every direction reversed from Level 5.
- **Why it matters:** direct callback level; validates whether the player actually understands "fold away from target" versus just recalling button presses.
- **Artist notes:** use the *exact* same square art as Level 5, just relabel the target — visual déjà vu is the joke.

### 9. Five by Five
```
■ ■ ■ ■ ■
■ ■ ■ ■ ■
■ ■ ★ ■ ■
■ ■ ■ ■ ■
■ ■ ■ ■ ■
```
- **Goal:** reduce 5×5 to 1×1, target dead center.
- **New Concept:** first odd-length dimension. A single fold on a 5-wide strip can't split evenly — it's always 2 vs 3. Foreshadows World 2.
- **Difficulty:** 4/10
- **Expected Folds:** 6 (3 vertical + 3 horizontal — 5 needs `⌈log₂5⌉ = 3` folds per axis)
- **Why it matters:** quietly previews the whole next world without naming it.
- **Artist notes:** center target on an odd grid is visually satisfying — perfectly symmetric card, good for a "calm before the storm" beat.

### 10. Large Grid
```
■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■
■ ★ ■ ■ ■ ■
■ ■ ■ ■ ■ ■
```
- **Goal:** reduce 6×6 to 1×1 at an off-corner spot.
- **New Concept:** none — this is World 1's capstone, combining every lesson (direction, chaining, order-independence, off-center targeting) at the largest scale yet.
- **Difficulty:** 5/10
- **Expected Folds:** 6 (3 + 3)
- **Why it matters:** closes the world with a level that requires genuine upfront planning but no new rule — a real "I've got this" moment.
- **Artist notes:** first level worth a short victory flourish (paper "settles" with a satisfying thump) — reward the world-clear.

---

# WORLD 2 — "Odd Dimensions"
*Same single-cell goal type. Focus shifts to precision: where exactly the fold line goes, not just which direction.*

### 11. Three Square
```
■ ■ ■
■ ■ ■
★ ■ ■
```
- **Goal:** reduce 3×3 to 1×1, bottom-left.
- **New Concept:** smallest odd square — introduces the "1 leftover column/row" pattern explicitly, in isolation.
- **Difficulty:** 3/10
- **Expected Folds:** 4 — `V2←`, `V1←`, `H2↑`, `H1↑`
- **Why it matters:** clean, minimal reintroduction after Level 10's big finish — a breather that still teaches.
- **Artist notes:** keep it visually plain; this card is a palate cleanser.

### 12. Wide Odd
```
■ ■ ■ ■ ■
■ ■ ■ ★ ■
■ ■ ■ ■ ■
```
- **Goal:** reduce 3×5 to 1×1.
- **New Concept:** the two axes now need *different* fold counts (rows: 2 folds, columns: 3 folds) — first grid where the axes are visibly asymmetric in effort.
- **Difficulty:** 4/10
- **Expected Folds:** 5
- **Why it matters:** trains the player to plan per-axis instead of assuming symmetric effort.
- **Artist notes:** letterbox aspect ratio, reads as "wide" instantly.

### 13. Tall Odd
```
■ ■ ■
■ ■ ■
■ ■ ■
★ ■ ■
■ ■ ■
```
- **Goal:** reduce 5×3 to 1×1.
- **New Concept:** the target's exact row now *forces* the fold-line position, not just the direction — first level where fold-line placement, not merely left/right, is graded.
- **Difficulty:** 4/10
- **Expected Folds:** 5
- **Why it matters:** rotates Level 12's lesson 90° and sharpens it — placement matters, not just side.
- **Artist notes:** portrait card; nice pairing with 12 on the level-select map.

### 14. Seven Strip
```
■ ■ ■ ■ ■ ★ ■
```
- **Goal:** reduce a 1×7 strip to 1×1.
- **New Concept:** a single-row strip — only vertical folds exist. Purely 1-D chaining, `⌈log₂7⌉ = 3` folds.
- **Difficulty:** 3/10
- **Expected Folds:** 3
- **Why it matters:** deliberate breather level — minimalist, calm, confidence-building before the world ramps up again.
- **Artist notes:** gorgeous as a thin ribbon animation; let it fold like an accordion strip of receipt paper.

### 15. Zig Strip
```
■ ■ ■ ■ ■ ■ ■
■ ★ ■ ■ ■ ■ ■
```
- **Goal:** reduce 2×7 to 1×1.
- **New Concept:** none mechanically — first level that's *purely* about confident execution on a shape that looks busier than it is. A trust-building level after 14's calm.
- **Difficulty:** 3/10
- **Expected Folds:** 4
- **Why it matters:** Nintendo-style pacing: easy-hard-easy-medium, never just climbing.
- **Artist notes:** name it visually — make the fold-line hints trace a literal zigzag path across the strip.

### 16. Five by Seven
```
■ ■ ■ ■ ■ ■ ★
■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■
```
- **Goal:** reduce 5×7 to 1×1, far corner.
- **New Concept:** first "big checkpoint" grid combining two different odd sizes at real scale.
- **Difficulty:** 5/10
- **Expected Folds:** 6 (3 + 3)
- **Why it matters:** mid-world test of whether all prior lessons compose without hand-holding.
- **Artist notes:** widescreen card, good for a promotional screenshot.

### 17. Seven by Five
```
■ ■ ■ ■ ■
■ ■ ■ ■ ■
■ ■ ■ ■ ■
■ ■ ■ ■ ■
■ ■ ■ ■ ■
■ ■ ★ ■ ■
■ ■ ■ ■ ■
```
- **Goal:** reduce 7×5 to 1×1.
- **New Concept:** 7 can be split 3|4 or 4|3 at the first cut — both are legal, but only one choice keeps the path at minimum length for this target position. First explicit "valid but inefficient" trap.
- **Difficulty:** 5/10
- **Expected Folds:** 6
- **Why it matters:** introduces the star/optimization layer's teeth — wrong-but-legal choices should feel like a real, correctable mistake, not a dead end.
- **Artist notes:** consider a subtle "fold count" counter appearing for the first time here.

### 18. Offset Center
```
■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■
■ ■ ■ ★ ■ ■
■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■
```
- **Goal:** reduce 6×6 to 1×1 — target is one cell off the true visual center.
- **New Concept:** dedicated "obvious fold is wrong" level. The instinctive first move (fold the exact middle) does not lead anywhere near the shortest path.
- **Difficulty:** 5/10
- **Expected Folds:** 6
- **Why it matters:** this is the trope the brief explicitly asks for, given its own showcase level rather than buried in a bigger one.
- **Artist notes:** render the "true center" gridlines very faintly as a visual temptation — then let the correct line be one column over.

### 19. Uneven Rectangle
```
■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ★ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
```
- **Goal:** reduce 3×9 to 1×1.
- **New Concept:** extreme aspect ratio — one axis needs far more folds than the other (columns: 4, rows: 2). Confirms folds never need to alternate evenly between axes.
- **Difficulty:** 6/10
- **Expected Folds:** 6
- **Why it matters:** visually striking, and a good gut-check that the player isn't superstitiously alternating V/H folds out of habit.
- **Artist notes:** ultra-wide card — this is a great "look how thin!" App Store screenshot candidate.

### 20. Large Odd Grid
```
■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
★ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
```
- **Goal:** reduce 9×9 to 1×1 — World 2's capstone.
- **New Concept:** none — pure synthesis at the largest scale in either world so far (`⌈log₂9⌉ = 4` folds/axis).
- **Difficulty:** 6/10
- **Expected Folds:** 8 (4 + 4)
- **Why it matters:** closes World 2 the same way Level 10 closed World 1: no new idea, just mastery on display.
- **Artist notes:** biggest solid grid the player will see before holes start appearing — good visual contrast against World 3's opener.

---

# WORLD 3 — "Missing Pieces"
*Goal type generalizes to arbitrary silhouettes. Holes enter the game: a fold either patches a gap (paper overlaps it) or must avoid ever touching it.*

### 21. Missing Corner
```
■ ■ ■
■ ■ ■
■ ■
```
- **Goal:** fold down to a **solid** 2×3 rectangle (no notch).
- **New Concept:** a hole can be folded away entirely — fold the row/column *containing* the hole onto a fully solid row/column, and the gap simply vanishes in the union.
- **Difficulty:** 4/10
- **Expected Folds:** 2 — `H2↑` (row 3 folds up onto row 2, which is fully solid; the missing cell contributes nothing but takes nothing away)
- **Why it matters:** subverts the instinct that "a hole is permanent" — a small, satisfying rule-reveal.
- **Artist notes:** animate the missing corner visibly "filling in" as the fold lands — make the surprise readable.

### 22. Opposite Missing Corner
```
■ ■
■ ■ ■
■ ■ ■
```
*(hole at top-left this time)*
- **Goal:** fold down to a smaller shape that **keeps** the notch (a 2×2 with one corner missing).
- **New Concept:** the opposite lesson from 21 — fold only the parts that never cross the hole's row/column, and the notch survives intact.
- **Difficulty:** 4/10
- **Expected Folds:** 2 — `V2←` (drop the solid third column, which never touches the hole), `H2↑` variant chosen to fold row 3 onto row 2 — wait: to preserve, fold only *rows/columns that don't include the hole's row*, i.e. `V2←` then a fold that merges rows 2 & 3 (both fully solid, hole is in row 1 and untouched).
- **Why it matters:** direct callback/contrast to Level 21 — same shape, opposite intent, and the player must recognize *which* folds are "safe" for a hole to survive.
- **Artist notes:** reuse Level 21's silhouette, mirror the hole — visual rhyme reinforces the paired lesson.

### 23. Two Missing Corners
```
■ ■
■ ■ ■
■ ■
```
*(holes at top-left and bottom-right, diagonal)*
- **Goal:** fold all the way down to a single cell that ends up **empty** — the goal is an absence, not a presence.
- **New Concept:** an "anti-goal": two holes folded onto each other stay a hole (empty + empty = empty), unlike a hole meeting solid paper. First level where the win condition is "make this cell disappear."
- **Difficulty:** 5/10
- **Expected Folds:** 3
- **Why it matters:** completes the hole vocabulary — patch (21), preserve (22), and now combine two holes into one confirmed gap.
- **Artist notes:** show the target cell as a dashed outline instead of a star — visually distinct "absence" marker, reusable for future anti-goal levels.

### 24. Diagonal Missing
```
■ ■ ■ ■
■ ■ ■ ■
■ ■ ■ ■
■ ■ ■ ■
```
*(same two diagonal holes as 23, but larger 4×4 base)*
- **Goal:** fold down to a fully **solid** small square — both holes must be patched this time.
- **New Concept:** direct contrast to 23 on a bigger board — the player now *chooses* whether holes live or die, using both prior lessons in one level.
- **Difficulty:** 5/10
- **Expected Folds:** 4
- **Why it matters:** the real test of whether "patch vs. preserve" was actually learned, not just executed once each.
- **Artist notes:** identical geometry to 23 at 2× scale — let players notice the reuse and feel clever for recognizing it.

### 25. L Shape
```
■ ■ ■
■
■
```
- **Goal:** fold down to a solid 2×2 (the long leg folds up and overlaps the short arm).
- **New Concept:** first genuinely concave shape — a fold across the leg only affects the leg's column, leaving the top bar's other columns as dangling flaps that overhang once folded.
- **Difficulty:** 5/10
- **Expected Folds:** 3
- **Why it matters:** the leg is longer than the bar is thick, so the "obvious" single fold overshoots — first real lesson in tracking overlap vs. overhang region by region.
- **Artist notes:** the classic silhouette — very readable, good level-select icon.

### 26. Reverse L
```
■ ■ ■
    ■
    ■
```
- **Goal:** mirror of Level 25.
- **New Concept:** none new — confirms the concave-shape lesson generalizes by mirroring, not memorizing.
- **Difficulty:** 5/10
- **Expected Folds:** 3
- **Artist notes:** visual pair with 25 on the map — same silhouette, flipped.

### 27. Thick L
```
■ ■ ■ ■
■ ■ ■ ■
■ ■
■ ■
```
- **Goal:** fold down to a solid 2×2.
- **New Concept:** a thicker leg means a single fold line can patch *part* of its length while leaving another part unaffected — first fold where one action has genuinely mixed consequences across its own span.
- **Difficulty:** 6/10
- **Expected Folds:** 3
- **Why it matters:** breaks the assumption that a fold's effect is uniform along the whole line — a real "wait, half of that worked and half didn't" moment.
- **Artist notes:** chunkier, bolder L — should read as "the tough version" of 25/26 at a glance.

### 28. U Shape
```
■ ■     ■ ■
■           ■
■ ■ ■ ■ ■
```
- **Goal:** fold one arm onto the other to close the gap into a solid block.
- **New Concept:** two symmetric prongs with an empty gap between them — folding closes the gap exactly, like shutting a book, *if and only if* the fold line and direction are precisely centered.
- **Difficulty:** 6/10
- **Expected Folds:** 3
- **Why it matters:** rewards precision over "good enough" — an off-center fold leaves a visible seam instead of a clean closure.
- **Artist notes:** this one should feel great to solve — snap animation with a soft "clack" when the arms meet flush.

### 29. C Shape
```
■ ■ ■
■
■ ■ ■
```
- **Goal:** same closing mechanic as Level 28, opening faces sideways instead of up.
- **New Concept:** confirms the "closing the gap" mechanic works on the other axis — same idea, 90° rotated context.
- **Difficulty:** 6/10
- **Expected Folds:** 3
- **Artist notes:** visual companion to 28; consider placing them adjacent on the world map.

### 30. Frame
```
■ ■ ■ ■ ■
■         ■
■         ■
■ ■ ■ ■ ■
```
- **Goal:** fold down to a small, fully solid square — the hollow center must vanish.
- **New Concept:** the first *fully enclosed* hole (not just a corner or edge notch) — World 3's capstone, combining patch/preserve judgment from every prior level in the world.
- **Difficulty:** 7/10
- **Expected Folds:** 6
- **Why it matters:** requires reasoning about which side folds onto which for *all four* edges of the frame, since any wrong pairing leaves a piece of the hollow center exposed.
- **Artist notes:** satisfying "solid at last" reveal — good place for a distinct world-clear animation (paper folding into a tidy little solid block, camera push-in).

---

# WORLD 4 — "Interesting Geometry"
*Starting shapes are now the interesting silhouettes themselves. Every level explores how straight folds behave against concave, asymmetric, or symmetric boundaries.*

### 31. T Shape
```
■ ■ ■ ■ ■
    ■
    ■
    ■
```
- **Goal:** fold down to a solid 1×1 at the stem's tip.
- **New Concept:** the top bar is wider than the stem — folding the bar down over the stem only overlaps where the stem exists; the bar's outer wings become overhanging flaps sticking past the stem's width, forming a *new* irregular silhouette instead of instantly simplifying.
- **Difficulty:** 5/10
- **Expected Folds:** 4
- **Why it matters:** first shape where "just fold the whole bar down" doesn't cleanly resolve anything by itself — the player must track exactly which columns overlap.
- **Artist notes:** classic, extremely readable silhouette; strong world-opener icon.

### 32. Plus Shape
```
    ■
    ■
■ ■ ■ ■ ■
    ■
    ■
```
- **Goal:** fold all four arms inward onto the center, ending in a small solid stack.
- **New Concept:** four independent protrusions mean four separate folds are needed — an irregular shape can cost *more* folds than a rectangle of the same bounding size.
- **Difficulty:** 5/10
- **Expected Folds:** 4
- **Why it matters:** corrects the assumption (from Worlds 1–2) that fold count is purely a function of bounding-box size.
- **Artist notes:** perfectly symmetric — should look beautiful mid-fold as each arm swings in.

### 33. Arrow
```
        ■
      ■ ■
■ ■ ■ ■ ■ ■
      ■ ■
        ■
```
- **Goal:** fold the arrowhead and shaft down to a solid 1×1 at the shaft's back end.
- **New Concept:** a shape that *reads* as diagonal (a pointed arrowhead) built entirely from orthogonal cells — folding it teaches that "diagonal-looking" silhouettes are just staircases, and grid folds handle them the same as anything else.
- **Difficulty:** 6/10
- **Expected Folds:** 4
- **Why it matters:** an optical "aha" — the shape looks like it needs a diagonal cut, but never does.
- **Artist notes:** lean into the illusion — render the arrowhead with crisp pixel edges so the "it's just squares" reveal lands when it folds flat.

### 34. Hammer
```
■ ■ ■ ■ ■ ■ ■
  ■
  ■
  ■
```
- **Goal:** fold down to a solid 1×1 at the stem's foot.
- **New Concept:** the head is offset, not centered on the stem — one side of the head overhangs much farther than the other. The visually "centered-looking" first fold is wrong; you must fold *at the stem's actual column*, not the bar's midpoint.
- **Difficulty:** 6/10
- **Expected Folds:** 4
- **Why it matters:** an explicit "obvious fold is wrong" level built around asymmetric protrusion rather than target position.
- **Artist notes:** exaggerate the offset visually so the trap is fair — the player should be able to see it's off-center if they look.

### 35. Staircase
```
■ ■ ■ ■
  ■ ■ ■
    ■ ■
      ■
```
- **Goal:** fold down to a solid 1×1 at the bottom step.
- **New Concept:** first shape where a single fold line has a genuinely different effect on every row it crosses — some rows have full-length paper at that column, others have none at all.
- **Difficulty:** 7/10
- **Expected Folds:** 5
- **Why it matters:** forces row-by-row (or column-by-column) thinking about a single fold's consequences, rather than treating a fold as one uniform action.
- **Artist notes:** iconic, instantly memorable silhouette — a strong candidate for the game's key art.

### 36. Reverse Staircase
```
      ■
    ■ ■
  ■ ■ ■
■ ■ ■ ■
```
- **Goal:** fold the staircase onto its own mirror so the steps interlock, filling every gap exactly, into a solid block.
- **New Concept:** self-symmetric folding where missing corners and filled corners match perfectly, step for step — a genuinely satisfying "puzzle pieces click into place" moment.
- **Difficulty:** 7/10
- **Expected Folds:** 4
- **Why it matters:** rewards the row-by-row thinking from Level 35 by paying it off with a clean, total solution instead of a partial one.
- **Artist notes:** this fold should have a distinct "click" sound/animation — it's meant to feel like the best fold in the world so far.

### 37. Pyramid
```
      ■
    ■ ■ ■
  ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■
```
- **Goal:** fold down to a solid triangle-half stack via one clean symmetric fold, then reduce further to 1×1.
- **New Concept:** first shape with an obvious symmetry axis — the vertical center fold overlaps both halves *perfectly*, zero overhang. Teaches players to spot a symmetry axis as a "free," clean first move.
- **Difficulty:** 6/10
- **Expected Folds:** 5
- **Why it matters:** a breather after 35/36's density — big, but the first fold is genuinely easy once you see the axis.
- **Artist notes:** should look monumental — good "world midpoint" visual beat.

### 38. Diamond
```
      ■
    ■ ■ ■
  ■ ■ ■ ■ ■
    ■ ■ ■
      ■
```
- **Goal:** fold down to a solid 1×1 at the center.
- **New Concept:** symmetric on *both* axes — the first shape where the player has a genuine choice of which clean symmetric fold to do first, not just one obvious axis.
- **Difficulty:** 6/10
- **Expected Folds:** 5
- **Why it matters:** first real branching strategy moment; both paths are equally valid, which builds confidence in reading a shape rather than following a fixed recipe.
- **Artist notes:** render both symmetry axes as faint guide lines the player can toggle — a nice diegetic hint system introduced here.

### 39. Hourglass
```
■ ■ ■ ■ ■
  ■ ■ ■
    ■
  ■ ■ ■
■ ■ ■ ■ ■
```
- **Goal:** fold at the narrow waist so the top and bottom cones overlap perfectly into a solid small diamond.
- **New Concept:** a pinch-point shape — folding exactly at the waist gives a perfect overlap, but folding one line off (through a wider row) creates ugly, avoidable overhang. Raises the stakes on precise line placement from Level 28's lesson.
- **Difficulty:** 7/10
- **Expected Folds:** 5
- **Why it matters:** highest-precision "obvious but wrong" trap yet — several nearby lines all look plausible, only one is clean.
- **Artist notes:** the waist should be visually pinched enough to invite the correct guess without giving it away outright.

### 40. Lightning
```
■ ■ ■ ■
    ■ ■
  ■ ■
■ ■ ■ ■
```
- **Goal:** fold down to a solid 1×1.
- **New Concept:** World 4's capstone — a shape with **no** symmetry axis at all. No shortcuts from spotting a mirror line; every fold must be reasoned out from scratch, combining concave overlap (31), asymmetric overhang (34), and partial-row effects (35) in one shape.
- **Difficulty:** 8/10
- **Expected Folds:** 7
- **Why it matters:** closes the world by removing every crutch it just taught, forcing genuine synthesis.
- **Artist notes:** should feel electric and asymmetric — a jagged, energetic silhouette to contrast the calm symmetry of 37/38.

---

# WORLD 5 — "Mind Benders"
*Every level now has two win conditions: the final silhouette, AND a required top-to-bottom order of marked faces at specified cells. A fold flips the moving flap's mark face-down/up and places it on top of the stack at the overlap.*

### 41. Cross
```
    ■
  ■ ■ ■
■ ■ ■ ■ ■
  ■ ■ ■
    ■
```
- **Goal:** fold the big plus down to a smaller plus, with the center-arm's mark ending face-up on top at the center cell.
- **New Concept:** **layer order is introduced.** The silhouette alone (identical to a Diamond/Cross fold) is easy — deliberately reused geometry so the *only* new thing to learn is that a second, independent condition now exists.
- **Difficulty:** 7/10
- **Expected Folds:** 4
- **Why it matters:** isolates the new rule completely — familiar shape, one new idea, per the design philosophy.
- **Artist notes:** show a small "stack preview" UI element for the first time — a simple side-view icon of the required top mark. This UI debuts here and recurs through the rest of the world.

### 42. Castle
```
■   ■   ■
■ ■ ■ ■ ■
■ ■ ■ ■ ■
■ ■ ■ ■ ■
```
- **Goal:** fold the crenellated top down flush, with the center turret's mark on top.
- **New Concept:** three separate protrusions (turrets) instead of one — the player must manage several independent notches in the same silhouette simultaneously, now with a layer-order requirement layered on top.
- **Difficulty:** 7/10
- **Expected Folds:** 6
- **Why it matters:** scales Level 41's new rule up against real geometric complexity instead of a toy shape.
- **Artist notes:** crenellations read great as a silhouette — strong "boss-arena" visual for the world.

### 43. Rocket
```
      ■
    ■ ■ ■
  ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■
■     ■     ■
```
- **Goal:** fold to a small solid block; the nose's mark must be on top, the fins' marks second layer.
- **New Concept:** first **multi-cell** layer-order goal — two separate positions each have their own required order, not just one.
- **Difficulty:** 8/10
- **Expected Folds:** 7
- **Why it matters:** tests whether the player can track more than one stack simultaneously without conflating them.
- **Artist notes:** distinct nose/fin marks (e.g., different icon shapes) so the two order-goals are never ambiguous at a glance.

### 44. Tree
```
    ■ ■ ■
  ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■
      ■
      ■
```
- **Goal:** fold the canopy onto the trunk, then the trunk down to a stack with canopy's mark on top.
- **New Concept:** first genuinely **order-dependent** puzzle. Folding the trunk before the canopy vs. after changes what the *next* fold line even sees, because the canopy fold changes the shape's boundary. Earlier levels' axis-folds were commutative; this one isn't.
- **Difficulty:** 8/10
- **Expected Folds:** 7
- **Why it matters:** finally breaks the "order never matters" reassurance from Level 7 — deliberately, and only once it's safe to.
- **Artist notes:** consider letting a "wrong order" attempt still look almost right, so the failure teaches rather than just blocks.

### 45. Crown
```
■   ■   ■   ■
■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■
```
- **Goal:** fold all four points down; their marks must land in one specific full top-to-bottom stack order (not just "on top" — the *entire* order is specified).
- **New Concept:** first **full stack-order** goal (every layer's position specified, not just the topmost).
- **Difficulty:** 9/10
- **Expected Folds:** 7
- **Why it matters:** generalizes Level 41's single-mark rule to a complete ordering — the natural endpoint of the layer-order thread.
- **Artist notes:** the stack-preview UI needs to show a full 4-high column here — make sure it reads clearly at a glance.

### 46. Key
```
■ ■ ■
■ ■ ■
    ■
    ■ ■
    ■
    ■ ■
```
- **Goal:** fold the bow and toothed shaft down to a solid 1×1, no symmetry to lean on anywhere.
- **New Concept:** a fully asymmetric silhouette with fine 1-cell detail (the teeth) at one end — precision counting at small scale, under full complexity, no shortcuts available.
- **Difficulty:** 8/10
- **Expected Folds:** 7
- **Why it matters:** having removed symmetry as a crutch in World 4 (Level 40) and introduced order-dependency (Level 44), this level demands both at once, at fine grain.
- **Artist notes:** the teeth should be crisp, countable notches — this is a "zoom in and check twice" level.

### 47. Anchor
```
    ■
  ■ ■ ■
    ■
    ■
■ ■ ■ ■ ■
  ■ ■ ■
■ ■   ■ ■
```
- **Goal:** fold the crossbar, shaft, and stairstep arms down to a solid stack with the shaft's mark on top.
- **New Concept:** none new — a deliberate "boss fight" combining Level 32's arm-folding, Level 35's stairstep partial-row folds, and Level 37's clean symmetric center fold, all in one shape.
- **Difficulty:** 9/10
- **Expected Folds:** 8
- **Why it matters:** a synthesis checkpoint before the final three levels, proving mastery of geometry mechanics specifically (as opposed to layer-order mechanics).
- **Artist notes:** should read as the most "illustrative" shape yet — lean into linework that actually looks like an anchor at a glance.

### 48. Butterfly
```
■ ■     ■ ■
■ ■ ■ ■ ■ ■
■ ■     ■ ■
  ■ ■ ■ ■
    ■ ■
```
- **Goal:** fold both wings down to the body — final silhouette is fully symmetric, but the left wing's mark must end up *above* the right wing's mark, even though the two wings are visually identical.
- **New Concept:** the ultimate "looks right but is wrong" level — two different fold sequences produce the **identical silhouette** but opposite layer order, because visual symmetry hides a real asymmetry in fold direction/order.
- **Difficulty:** 9/10
- **Expected Folds:** 7
- **Why it matters:** the purest, highest-stakes expression of the brief's "some folds should look obvious but be incorrect" — here, the *entire visible result* can be perfect and the level still fails.
- **Artist notes:** don't visually hint which wing's mark is which until the stack-preview UI reveals it — the symmetry needs to be genuinely convincing.

### 49. Dragon
```
■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■               ■ ■
  ■ ■             ■
    ■ ■ ■ ■ ■ ■ ■ ■
            ■ ■
          ■ ■
        ■ ■
```
- **Goal:** fold the head, wings, body, and long stairstep tail down to a small stack, head mark on top.
- **New Concept:** none new — the game's largest synthesis: a thin chained tail (Level 14), asymmetric wing protrusions (Level 32/43), concave overlaps (Level 25/31), order-dependency (Level 44), and a layer-order goal, all in a single sprawling shape.
- **Difficulty:** 9/10
- **Expected Folds:** 9
- **Why it matters:** the penultimate level should feel like *the* hardest thing in the game mechanically, saving the final level for its own distinct kind of finale (see 50).
- **Artist notes:** the game's marquee shape — worth extra art passes; this is the one players will screenshot.

### 50. Impossible Looking Shape
```
    ■ ■ ■ ■
  ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■
  ■ ■ ■ ■ ■ ■
    ■ ■ ■ ■
```
- **Goal:** fold this stairstep "circle" down to a small solid stack, with a fully specified top-to-bottom layer order.
- **New Concept:** the capstone reveal — a shape built entirely from straight vertical/horizontal steps that *reads* as a smooth circle, "impossible" to fold cleanly at a glance. It resolves with nothing but ordinary axis-aligned folds, proving the game's entire core promise: no shape, however organic it looks, ever needed anything but straight folds.
- **Difficulty:** 10/10
- **Expected Folds:** 11 (longest in the game — both silhouette reduction and full stack ordering)
- **Why it matters:** the thesis statement of the whole 50 levels, paid off last: geometry can *look* impossible without ever breaking the one simple rule the player has used since Level 1.
- **Artist notes:** the reveal moment (final fold snapping into a small, perfect stack) deserves the game's best animation and sound — this is the ending screenshot.

---

## Cross-cutting progression notes

- **Goal-type arc:** single-cell target (Worlds 1–2) → arbitrary silhouette (World 3+) → silhouette + layer order (World 5). Each transition is introduced on a shape simple enough that the new rule is the *only* new thing to learn.
- **"Obvious but wrong" traps**, placed deliberately rather than scattered: Level 6 (near-center target), Level 8 (memorization trap), Level 18 (dedicated showcase), Level 34 (asymmetric protrusion), Level 39 (precision pinch-point), Level 48 (the hardest version — identical silhouette, wrong order).
- **Breather levels**, placed after density spikes: Level 11 (after World 1's finale), Level 14 (mid-World 2), Level 37 (after the Staircase pair).
- **Callback pairs** for reinforcement without new content: 3↔4, 5↔8, 12↔13, 21↔22, 23↔24, 25↔26, 28↔29, 35↔36, 37↔38.
- **World capstones** (synthesis, no new mechanic): 10, 20, 30, 40, and 49–50 as a two-level finale (49 = mechanical synthesis, 50 = thematic payoff).
