import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { games, initializeLanding } from './landing.mjs';
assert.deepEqual(games.map(g => g.name), ['Monty Hall and Female Contestant', 'Monty Hall and Male Contestant', 'Haunty Mall and Female Contestant', 'Haunty Mall and Male Contestant']);
assert.deepEqual(games.map(g => g.path), ['Monty/Switch/', 'Monty/NoSwitch/', 'Haunty/Switch/', 'Haunty/NoSwitch/']);
function fixture(state = null) {
  const element = () => ({ hidden: false, children: [], events: {}, classes: new Set(), classList: { toggle(name, enabled) { if (enabled) this.owner.classes.add(name); else this.owner.classes.delete(name); } }, focus() {}, append(child) { this.children.push(child); }, addEventListener(type, fn) { this.events[type] = fn; } });
  const nodes = Object.fromEntries(['#game-overview', '#game-grid', '#game-links', '.welcome', '#start-game'].map(id => [id, element()]));
  nodes['#game-overview'].hidden = true;
  const document = { querySelector: id => nodes[id], createElement() { const node = element(); node.classList.owner = node; return node; } };
  const history = { state, replaceState(next) { this.state = next; }, pushState(next) { this.state = next; } };
  const navigation = element();
  initializeLanding(document, history, navigation);
  return { nodes, history, navigation };
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
const frames = initial.nodes['#game-grid'].children;
for (const frame of frames) {
  const panel = { style: {} };
  frame.contentDocument = { querySelector: () => panel, gamesPlayed: 12, scene: 4 };
  frame.events.load();
  assert.equal(panel.style.display, 'none');
}
const overviewState = initial.history.state;
for (let index = 0; index < games.length; index++) {
  const frame = frames[index];
  const liveDocument = frame.contentDocument;
  let prevented = false;
  initial.nodes['#game-links'].children[index].events.click({ button: 0, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(initial.history.state.game, index);
  assert.equal(frame.classes.has('enlarged'), true);
  assert.equal(liveDocument.querySelector().style.display, '');
  initial.history.state = overviewState;
  initial.navigation.events.popstate();
  assert.equal(frame.classes.has('enlarged'), false);
  assert.equal(liveDocument.querySelector().style.display, 'none');
  assert.equal(frame.contentDocument, liveDocument);
  assert.equal(frame.contentDocument.gamesPlayed, 12);
  assert.equal(frame.contentDocument.scene, 4);
  assert.deepEqual(initial.nodes['#game-grid'].children, frames);
}
for (const game of games) {
  assert.ok(readFileSync(`${game.path}index.html`, 'utf8').includes(`<title>${game.name}</title>`));
}
console.log('Overview launch, live tile enlargement, state preservation, game titles, duplicate prevention, and Back restoration passed.');
