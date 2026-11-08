import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { SELECTION_SCENE, SCENE_DURATION_MS, SCORE_DURATION_MS, nextScene, selectionImage, selectionSpeech } from './playback.mjs';

assert.equal(SCENE_DURATION_MS, 3000);
assert.equal(SCORE_DURATION_MS, 6000);

for (const prize of ['goat', 'car']) {
  const scenes = [0];
  while (![8, 9].includes(scenes.at(-1))) {
    assert.ok(scenes.length < 12, 'Playback must reach a result');
    scenes.push(nextScene(scenes.at(-1), prize));
  }
  assert.deepEqual(scenes, prize === 'goat'
    ? [0, 1, 2, SELECTION_SCENE, 3, 4, 5, 6, 7, 8]
    : [0, 1, 2, SELECTION_SCENE, 3, 4, 5, 9]);
}
for (const host of ['monty', 'haunty']) {
  for (const contestant of ['female', 'male']) {
    assert.ok(existsSync(new URL(`./assets/concepts/${selectionImage(host, contestant)}`, import.meta.url)));
    for (const door of [1, 2, 3]) assert.equal(selectionSpeech(door), `I want Room ${door}!`);
  }
}
console.log('Selection scene appears after the invitation and before host thoughts in both branches; all four artwork pairings exist.');
