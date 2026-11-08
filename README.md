# QuizShow — Let's Win a Car

Four silent, automatically repeating display versions share the same code and artwork:

| Version | Host | Contestant behavior | URL |
| --- | --- | --- | --- |
| Monty / Switch | Monty Hall | Female superhero always switches | https://phrwtz.github.io/QuizShow/Monty/Switch/ |
| Monty / NoSwitch | Monty Hall | Male superhero always stays | https://phrwtz.github.io/QuizShow/Monty/NoSwitch/ |
| Haunty / Switch | Haunty Mall | Female superhero always switches | https://phrwtz.github.io/QuizShow/Haunty/Switch/ |
| Haunty / NoSwitch | Haunty Mall | Male superhero always stays | https://phrwtz.github.io/QuizShow/Haunty/NoSwitch/ |

The square scene uses the shorter viewport dimension. The reserved text area is to its left in landscape and above it in portrait. Display versions hide review controls and ignore pairing query parameters.

After each result, a five-second results screen shows games played and contestant/host wins and losses, then a new random round starts. Counts persist separately for each pairing in the browser's local storage. A host win means a contestant loss and vice versa. Clearing site data resets counts. Browser windows on separate computers do not share totals.

## GitHub Pages

In the repository's Settings → Pages, choose **Deploy from a branch**, **main**, **/(root)**, then Save. No build system is required; `.nojekyll` enables direct static hosting. This project's four URLs require the exact capitalization shown above.

For local preview, run `python3 -m http.server 8000` and open a version path or `/` for the editable review page. After editing the root HTML, run `python3 scripts/prepare-pages.py` to regenerate the four display pages. Run `node game-logic.test.mjs` for exhaustive door-choice and outcome checks.

The artwork uses illustrated poses and live balloon/reveal/glow overlays; continuous camera and character motion is not yet implemented. The reverse-angle contestant selection shot is available as artwork but is not yet in playback.

## Review-page details


Run `python3 -m http.server 8000` in this folder, then open http://localhost:8000.

Choose either host and contestant. The three opening speech balloons advance at 2,000 milliseconds each, then the host turns toward the doors and shows two thought balloons. Each thought lasts 2,000 milliseconds, followed by a door reveal. A first car reveal ends play: Haunty thinks “This is awkward!” for two seconds, then faces the slumped contestant and says “Sorry about that...” in a persistent final scene. A goat reveal lasts two seconds, then the host asks about switching for two seconds, followed by the contestant reply for two seconds, then the final chosen door opens and stays for review. The original goat reveal remains visible. The selected closed door pulses. Choose a door explicitly or let the preview choose randomly. The Preview host thoughts button skips the opening, Preview door reveal jumps directly to the reveal, and Preview switch question skips to the question when a goat was revealed. Car location and selected door can be forced or randomized. The same timing is used for both hosts. Replay, pause/resume and next-balloon controls support review. Query parameters `host=monty|haunty` and `contestant=female|male` select a pairing for separate tabs.

The scene is square with side length equal to the viewport's shorter dimension. Controls occupy the remaining area. These are still images with live speech/thought overlays and a pulsing selection glow, not the full game animation. The host opens an unselected door to reveal a car or goat. Monty excludes the car; Haunty chooses either unselected door equally. The contestant selection camera shot is not yet part of playback. No audio or external dependencies.

Dialogue is in `preview.js`. Speech balloon dimensions follow the measured text, with consistent type size and padding; tails stay anchored to the host. Haunty says “I'm filling in for Monty.”

Door logic is in `game-logic.mjs`; run `node game-logic.test.mjs` to verify all 18 host/choice/car combinations and 50/50 choice boundaries. Generated artwork and prompts are in `assets/reveal/`. The female contestant switches to the remaining closed door; the male contestant keeps his original door. The glow follows the decision and the speech tail points to the speaker. Preview final reveal skips to the chosen-door reveal when the first reveal was a goat. Final car reveals show a jumping-for-joy contestant and the host saying “Congratulations!”; final goat reveals show the contestant slumped on the floor and the host saying “Better luck next time”. These are illustrated reaction poses; continuous character motion remains later work. The contestant selection camera shot and scores remain later phases.

Reaction artwork and the built-in image-generation prompts are saved in `assets/reveal/reaction-prompts.md`. Both reaction poses for each contestant were reviewed in the browser.

Preview Haunty’s apology is available only when Haunty’s first reveal is the car. Both contestants use their losing pose, the accidentally revealed car remains visible, and no switch or second door opening occurs. The apology sprite and generation prompt are saved in `assets/reveal/haunty-apology-v1.png` and `assets/reveal/apology-prompt.md`.
