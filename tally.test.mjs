import assert from 'node:assert/strict';
import { createTally } from './tally.mjs';

const zero = { games: 0, contestant: 0, host: 0, nobody: 0 };
const versions = ['Monty/Switch', 'Monty/NoSwitch', 'Haunty/Switch', 'Haunty/NoSwitch'];
const tallies = Object.fromEntries(versions.map(version => [version, createTally()]));
for (const version of versions) assert.deepEqual(tallies[version].snapshot(), zero);
for (let i = 0; i < versions.length; i++) {
  for (let round = 0; round <= i; round++) {
    const game = {};
    tallies[versions[i]].record(game, 'contestant');
    tallies[versions[i]].record(game, 'contestant');
  }
}
for (let i = 0; i < versions.length; i++) {
  assert.equal(tallies[versions[i]].snapshot().games, i + 1);
  assert.equal(tallies[versions[i]].snapshot().contestant, i + 1);
}
for (const version of versions) {
  const otherTotals = versions.filter(other => other !== version).map(other => tallies[other].snapshot());
  assert.deepEqual(tallies[version].reset(), zero);
  assert.deepEqual(versions.filter(other => other !== version).map(other => tallies[other].snapshot()), otherTotals);
}
const tally = createTally();
for (const winner of ['contestant', 'host', 'nobody']) tally.record({}, winner);
assert.deepEqual(tally.snapshot(), { games: 3, contestant: 1, host: 1, nobody: 1 });
const detached = tally.snapshot();
detached.games = 1000;
assert.equal(tally.snapshot().games, 3);
assert.deepEqual(createTally().snapshot(), zero);
console.log('All four variants accumulate independently, count each game once, and reset all four counts on invocation.');
