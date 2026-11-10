# Instructions for coding agents

## Project identity

This repository contains the existing browser prototype for **«Верхняя Максаковка»**, prologue **«Спиннер»**, version `v0.1`. The final game title has not been selected.

## Read before changing anything

1. `README.md`
2. `docs/status.md`
3. `docs/architecture.md`
4. `docs/run.md`
5. `docs/design-document.md`
6. `docs/prologue-script.md`
7. `docs/roadmap.md`

## Important project boundaries

- The current playable preview contains only three scenes: the apartment (`flat`), stairwell (`stairs`) and courtyard (`yard`).
- The full eight-scene prologue in `docs/prologue-script.md` is approved story design, **not** proof that all eight scenes are implemented.
- Treat `docs/status.md` and the actual source code as the authority for implementation status.
- Do not claim that planned features, future consequences, scenes, tests or endings already work unless verified in code and by testing.
- `vm/dist/maksakovka_prologue_v0.1.html` is the known-good standalone build. Preserve it as a baseline before any rebuild.

## Source-code architecture

- The game source is in `vm/src/`.
- The numbered JavaScript files are concatenated in filename order by `vm/build.js`.
- These files share a global lexical scope. They are **not** independent ES modules. Keep the order and existing global conventions unless the owner explicitly approves an architectural refactor.
- Three.js revision 160 is vendored in `vm/three.module.min.js`; the standalone build embeds the library and does not need an internet connection.

## Build and test safety

- The existing `vm/build.js` contains the old absolute path `/data/vm`.
- The existing `vm/test.js` contains absolute paths for Playwright, Chromium, the HTML build and screenshots from the original environment.
- Do not run these scripts unchanged on a new machine. In particular, do not run the build script until its paths have been reviewed; it may write to the old absolute location.
- If a build/test setup is requested, first explain the required minimal path changes and ask the owner before modifying files or installing dependencies.
- Do not overwrite the known-good `vm/dist/` build until a separate backup exists and the owner has approved the change.

## Change policy

- On the first pass, inspect the project and report findings; do not edit files.
- Make only the changes requested by the owner. Prefer small, isolated diffs.
- Do not rewrite the game, replace Three.js, convert the project to a new framework, or restructure the source without explicit approval.
- Do not change approved story content, character facts, dialogue, flags or consequences without the owner's approval.
- When a change is approved, update `docs/status.md` and relevant tests/documentation to distinguish implemented behavior from planned design.
- Report which tests were actually run and their results. Never describe an unrun test as passed.

## Assets, copyright and privacy

- `vm/shots/` and `feedback/` contain development/test screenshots; they are not final game art assets.
- The project does not yet have an owner-selected license. Do not add an open-source license for the game's own code without approval.
- Preserve the Three.js MIT copyright/license notices. Review the full third-party license requirements before public distribution.
- Do not add commercial music, copyrighted images, map screenshots or other third-party assets without permission. The design document calls for original music and author-owned photos.
- Keep the repository private until the owner has reviewed its contents and decided what may be public.
