# Initial visual study

First pairing: original fictional host and female superhero contestant, approved as a visual substitute after image generation rejected the named-character attempts. Two square still keyframes establish the art direction before adding other characters, animation, or balloons.

Host concept: cheerful middle-aged man with wavy silver hair, round face, small moustache, plum suit and orange tie. Contestant concept: adult woman with short curly dark hair, teal full-length superhero jumpsuit, copper boots and belt, and a short cream cape. These are original designs without celebrity likenesses or existing superhero logos.

- Camera A: behind the contestant; host faces the camera with three numbered doors behind him.
- Camera B: behind the host; contestant faces the camera. This is the reverse angle of the same stage.
- Style assumption for review: clean, expressive 2D cartoon designed for distance viewing.
- All doors begin closed. Speech/thought balloons and choice glow will be separate elements in the animation phase.
- Scene side length: min(screen width, screen height). At 3:2 landscape, the remaining text strip is half a scene-width wide; at 2:3 portrait, it is half a scene-height tall. Scene must remain square without stretching or cropping.

## Later implementation requirements

Four fixed pairings: Monty/Wonder Woman, Monty/Superman, Haunty/Wonder Woman, Haunty/Superman. Wonder Woman always switches; Superman always stays. Monty knows the prizes and always reveals an unchosen goat. Haunty does not know and opens a random unchosen door. An early car reveal ends the round as a contestant loss. Prize location and initial contestant choice are random each round. No sound. Speech balloons use tails; thought balloons use small bubbles. Results remain for five seconds before the next round with the same pairing. Count games, contestant wins/losses, and host wins/losses. The precise meaning of host win/loss remains to be settled before implementation.

Initial assets are concept stills, not layered animation-ready character rigs. Review character appearance, stage design, and camera framing first.

Generated using the built-in image generation tool. Prompts are saved alongside the concept assets.
