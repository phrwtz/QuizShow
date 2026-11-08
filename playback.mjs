export const SELECTION_SCENE = 10;
export const SCENE_DURATION_MS = 3000;
export const SCORE_DURATION_MS = 6000;

export function selectionImage(host, contestant) {
  return host === 'monty' && contestant === 'female'
    ? 'contestant-pointing-balloon-v2.png'
    : `${host}-${contestant}-contestant-front-v1.png`;
}

export function selectionSpeech(door) {
  return `I want Door ${door}!`;
}

export function nextScene(index, firstPrize) {
  if (index === 2) return SELECTION_SCENE;
  if (index === SELECTION_SCENE) return 3;
  return index === 5 && firstPrize === 'car' ? 9 : index + 1;
}
