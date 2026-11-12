import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { games, initializeLanding } from './landing.mjs';
assert.deepEqual(games.map(g => g.name), ['Monty Hall and Female Contestant', 'Monty Hall and Male Contestant', 'Haunty Mall and Female Contestant', 'Haunty Mall and Male Contestant']);
assert.deepEqual(games.map(g => g.path), ['Monty/Switch/', 'Monty/NoSwitch/', 'Haunty/Switch/', 'Haunty/NoSwitch/']);
function fixture(state = null) {
  const element = () => ({ hidden: false, children: [], events: {}, append(child) { this.children.push(child); }, addEventListener(type, fn) { this.events[type] = fn; } });
  const nodes = Object.fromEntries(['#game-overview', '#game-grid', '#game-links', '.welcome', '#start-game'].map(id => [id, element()]));
  nodes['#game-overview'].hidden = true;
  const document = { querySelector: id => nodes[id], createElement: element };
  const history = { state, replaceState(next) { this.state = next; } };
  initializeLanding(document, history);
  return { nodes, history };
}
const initial = fixture();
assert.equal(initial.nodes['#game-grid'].children.length, 0);
initial.nodes['#start-game'].events.click();
assert.equal(initial.nodes['.welcome'].hidden, true);
assert.equal(initial.nodes['#game-overview'].hidden, false);
assert.equal(initial.history.state.overview, true);
function checkOverview({ nodes }) {
  assert.deepEqual(nodes['#game-grid'].children.map(f => f.src), games.map(g => g.path));
  assert.deepEqual(nodes['#game-links'].children.map(a => [a.textContent, a.href, a.target]), games.map(g => [g.name, g.path, undefined]));
}
checkOverview(initial);
initial.nodes['#start-game'].events.click();
checkOverview(initial); // No duplicated frames or links.
const restored = fixture(initial.history.state); // Back with a fresh document.
assert.equal(restored.nodes['#game-overview'].hidden, false);
checkOverview(restored);
for (const game of games) {
  assert.ok(readFileSync(`${game.path}index.html`, 'utf8').includes(`<title>${game.name}</title>`));
}
console.log('Overview launch, same-tab links, game titles, duplicate prevention, and Back restoration passed.');
