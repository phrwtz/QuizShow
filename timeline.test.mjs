import assert from 'node:assert/strict';
import { createTimeline } from './timeline.mjs';
import { createRound, roundWinner } from './game-logic.mjs';
import { createTally } from './tally.mjs';
import { nextScene, SCENE_DURATION_MS, SCORE_DURATION_MS } from './playback.mjs';

function simulation(host, contestant) {
  let time = 0;
  let seed = 1234;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
  const clock = createTimeline(() => time);
  const tally = createTally();
  let index, round, scores;
  function start() {
    index = 0; scores = false;
    round = createRound(host, 1 + Math.floor(random() * 3), 1 + Math.floor(random() * 3), random);
    clock.schedule(advance, SCENE_DURATION_MS);
  }
  function advance() {
    index = nextScene(index, round.prize);
    clock.schedule(index === 8 || index === 9 ? showScores : advance, SCENE_DURATION_MS);
  }
  function showScores() {
    tally.record(round, roundWinner(contestant, round));
    scores = true;
    clock.schedule(start, SCORE_DURATION_MS);
  }
  start();
  return {
    runUntil(target) {
      time = target;
      while (clock.tick().pending) { /* Yield batches without losing elapsed time. */ }
    },
    state: () => ({ index, scores, round, counts: tally.snapshot(), nextIn: clock.delay() })
  };
}
for (const host of ['monty', 'haunty']) {
  for (const contestant of ['female', 'male']) {
    const active = simulation(host, contestant);
    const background = simulation(host, contestant);
    const hour = 60 * 60 * 1000;
    for (let time = 250; time <= hour; time += 250) active.runUntil(time);
    background.runUntil(hour);
    assert.deepEqual(background.state(), active.state());
    assert.ok(background.state().counts.games >= 100);
    assert.equal(background.state().counts.games, Object.entries(background.state().counts).filter(([key]) => key !== 'games').reduce((sum, [, value]) => sum + value, 0));
    if (host === 'monty') assert.equal(background.state().counts.host, 0);
    // Multiple days of suspension must survive the bounded catch-up batches.
    background.runUntil(72 * hour);
    assert.ok(background.state().counts.games >= 7200);
  }
}
console.log('All four variants match active playback after an hour without timer callbacks and catch up across multi-day suspension.');
