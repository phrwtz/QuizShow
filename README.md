# QuizShow — Let's Win a Car

Four silent, automatically repeating display versions share the same code and artwork:

| Version | Host | Contestant behavior | URL |
| --- | --- | --- | --- |
| Monty / Switch | Monty Hall | Female superhero always switches | https://phrwtz.github.io/QuizShow/Monty/Switch/ |
| Monty / NoSwitch | Monty Hall | Male superhero always stays | https://phrwtz.github.io/QuizShow/Monty/NoSwitch/ |
| Haunty / Switch | Haunty Mall | Female superhero always switches | https://phrwtz.github.io/QuizShow/Haunty/Switch/ |
| Haunty / NoSwitch | Haunty Mall | Male superhero always stays | https://phrwtz.github.io/QuizShow/Haunty/NoSwitch/ |

The square scene uses the shorter viewport dimension. The text area is to its left in landscape and above it in portrait, with a centered title and left-aligned introductory and variant paragraphs. Text scales to fit the available area. Display versions hide review controls and ignore pairing query parameters.

After each result, a six-second results screen shows games played, Contestant wins, the named host’s wins, and Nobody wins, then a three-second illustration shows both protagonists facing the camera with big smiles, saying “Let's try that again!” in one large balloon with two tails. A new random round then starts. Each browser tab starts all four counts at zero and accumulates them only in page memory while it runs. Opening or refreshing a variant resets Games played, Contestant wins, Host wins, and Nobody wins to zero. Returning with the browser’s Back or Forward buttons also starts that variant from zero. Only automatic rounds within the same invocation retain its tally. The contestant wins by receiving the car. The host wins only by revealing the car on the first opening, which can happen only to Haunty. Nobody wins when the final chosen door reveals a goat. Monty’s win count is always zero. Previously saved browser totals are ignored. Tabs do not share counts, including two tabs running the same pairing.

## GitHub Pages

In the repository's Settings → Pages, choose **Deploy from a branch**, **main**, **/(root)**, then Save. No build system is required; `.nojekyll` enables direct static hosting. This project's four URLs require the exact capitalization shown above.

For local preview, run `python3 -m http.server 8000` and open a version path or `/` for the editable review page. After editing the root HTML, run `python3 scripts/prepare-pages.py` to regenerate the four display pages. Run `node game-logic.test.mjs` for exhaustive door-choice and outcome checks.

The artwork uses illustrated poses and live balloon/reveal/glow overlays; continuous camera and character motion is not yet implemented. After the host invitation, the reverse-angle selection shot shows the contestant pointing and announcing the chosen door. Its number matches the round’s actual random choice.

## Review-page details


Run `python3 -m http.server 8000` in this folder, then open http://localhost:8000.

Choose either host and contestant. Each scene lasts three seconds. After the opening invitation, the contestant faces the camera, points, and announces the selected door. The view returns to the host, who turns toward the doors and shows two thought balloons. Each thought lasts 3,000 milliseconds, followed by a door reveal. A first car reveal ends play: Haunty thinks “This is awkward!” for three seconds, then faces the slumped contestant and says “Sorry about that...” in a persistent final scene. A goat reveal lasts three seconds, then the host asks about switching for three seconds, followed by the contestant reply for three seconds, then the final chosen door opens and stays for review. The original goat reveal remains visible. The selected closed door pulses. Choose a door explicitly or let the preview choose randomly. The Preview host thoughts button skips the opening, Preview door reveal jumps directly to the reveal, and Preview switch question skips to the question when a goat was revealed. Car location and selected door can be forced or randomized. The same timing is used for both hosts. Replay, pause/resume and next-balloon controls support review. Query parameters `host=monty|haunty` and `contestant=female|male` select a pairing for separate tabs.

The scene is square with side length equal to the viewport's shorter dimension. Controls occupy the remaining area. These are still images with live speech/thought overlays and a pulsing selection glow, not the full game animation. The host opens an unselected door to reveal a car or goat. Monty excludes the car; Haunty chooses either unselected door equally. The contestant selection camera shot appears after the invitation and before the host thoughts. No audio or external dependencies.

Dialogue is in `preview.js`. Speech balloon dimensions follow the measured text, with consistent type size and padding; tails stay anchored to the host. Haunty says “I'm filling in for Monty.”

Door logic is in `game-logic.mjs`; run `node game-logic.test.mjs` to verify all 18 host/choice/car combinations and 50/50 choice boundaries. Generated artwork and prompts are in `assets/reveal/`. The female contestant switches to the remaining closed door; the male contestant keeps his original door. The glow follows the decision and the speech tail points to the speaker. Preview final reveal skips to the chosen-door reveal when the first reveal was a goat. Final car reveals show a jumping-for-joy contestant and the host saying “Congratulations!”; final goat reveals show the contestant slumped on the floor and the host saying “Better luck next time”. These are illustrated reaction poses; continuous character motion remains later work. The cumulative scoreboard follows each finished round.

Reaction artwork and the built-in image-generation prompts are saved in `assets/reveal/reaction-prompts.md`. Both reaction poses for each contestant were reviewed in the browser.

Preview Haunty’s apology is available only when Haunty’s first reveal is the car. Both contestants use their losing pose, the accidentally revealed car remains visible, and no switch or second door opening occurs. The apology sprite and generation prompt are saved in `assets/reveal/haunty-apology-v1.png` and `assets/reveal/apology-prompt.md`.

Explanatory copy is maintained in `text-content.json`. Run `python3 scripts/prepare-pages.py` after editing it to regenerate the shared text module and all four fixed pages.

`node tally.test.mjs` checks independent variant totals, reset behavior, and duplicate-round protection. The page preparation script emits `display-runtime.mjs` and versioned script/style URLs so published pages load matching current code rather than an older cached script. The root review page continues to use the source modules directly.

## Background tabs

Display playback is scheduled against elapsed wall time. Delayed background timers process missed scene transitions and completed games, preserving three-second scenes and six-second results. Switching back to a tab reconciles it to the current scene and totals immediately. Completely suspended browser tabs cannot execute JavaScript until resumed; elapsed games are calculated on resume. A discarded/reloaded page is a new invocation and starts its counters at zero.

Run `node timeline.test.mjs` to compare an hour of uninterrupted playback against an hour with no timer callbacks for all four variants, including longer suspension across multiple bounded catch-up batches.
