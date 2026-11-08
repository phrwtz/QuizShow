import { createRound, contestantDecision, finalOutcome, roundWinner } from './game-logic.mjs';
import { SELECTION_SCENE, SCENE_DURATION_MS, SCORE_DURATION_MS, nextScene, selectionImage, selectionSpeech } from './playback.mjs';
import { displayCopy } from './text-content.mjs';
import { createTally } from './tally.mjs';

export const dialogue = {
  monty: [
    `I'm Monty Hall, host of the wildly popular "Let's Win a Car" show!`,
    'Behind one of these doors there is a shiny new car!',
    'Contestant, please select a door!',
    'Now to pick a door with a goat.',
    'Lucky I know where the car is!'
  ],
  haunty: [
    "Welcome to Let's Win a Car!",
    "My name is Haunty Mall. I'm filling in for Monty.",
    'Contestant, pick a door!',
    'Oh no! They forgot to tell me where the car is!.',
    "Guess I'll just have to wing it!"
  ]
};

const images = {
  'monty-female': 'host-front-v1.png',
  'monty-male': 'monty-male-host-front-v1.png',
  'haunty-female': 'haunty-female-host-front-v1.png',
  'haunty-male': 'haunty-male-host-front-v1.png'
};
const host = document.querySelector('#host');
const contestant = document.querySelector('#contestant');
const door = document.querySelector('#door');
const carControl = document.querySelector('#car-door');
const fixedHost = document.body.dataset.fixedHost;
const fixedContestant = document.body.dataset.fixedContestant;
const displayMode = Boolean(fixedHost && fixedContestant);
const params = new URLSearchParams(location.search);
if (Object.hasOwn(dialogue, params.get('host'))) host.value = params.get('host');
if (['male', 'female'].includes(params.get('contestant'))) contestant.value = params.get('contestant');
if (displayMode) {
  host.value = fixedHost;
  contestant.value = fixedContestant;
  document.querySelector('#display-condition').textContent = `${fixedHost === 'monty' ? 'Monty Hall' : 'Haunty Mall'} · ${fixedContestant === 'female' ? 'Always switches' : 'Always stays'}`;
}
let index = 0;
let paused = false;
let timer;
let deadline;
let remaining = SCENE_DURATION_MS;
let selectedDoor = 2;
let round;
// Each page/variant invocation owns an independent, in-memory tally.
const tally = createTally();

function fitDisplayCopy() {
  if (!displayMode) return;
  const panel = document.querySelector('aside');
  const copy = document.querySelector('.display-copy');
  const style = getComputedStyle(panel);
  const bounds = panel.getBoundingClientRect();
  const height = bounds.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const width = bounds.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  if (height <= 0 || width <= 0) return;
  let low = 1;
  let high = Math.min(128, width / 9, height / 5);
  for (let step = 0; step < 12; step++) {
    const size = (low + high) / 2;
    copy.style.fontSize = `${size}px`;
    // scrollWidth/Height are rounded to whole pixels. Comparing them with
    // fractional viewport/padding sizes without tolerance can reject every
    // font size and collapse the text to one pixel.
    if (copy.scrollHeight <= Math.ceil(height) && copy.scrollWidth <= Math.ceil(width) + 1) low = size;
    else high = size;
  }
  copy.style.fontSize = `${Math.floor(low * 10) / 10}px`;
}

function currentText() {
  if (index === SELECTION_SCENE) return selectionSpeech(selectedDoor);
  if (index === 9) return 'Sorry about that...';
  if (index === 8) return finalOutcome(contestant.value, round).won
    ? 'Congratulations!'
    : 'Better luck next time';
  if (index === 5 && host.value === 'haunty') return round.prize === 'goat'
    ? 'Whew! That was close!'
    : 'This is awkward!';
  if (index === 6) return "Guess it wasn't that one! Do you want to switch doors?";
  if (index === 7) return contestant.value === 'female'
    ? 'I want to switch!'
    : "No, I'll stick with the door I've got!";
  return dialogue[host.value][index];
}

function balloonVisible() {
  return index !== 5 || host.value === 'haunty';
}

function isFinished() {
  return index === 8 || index === 9;
}

function newRound() {
  selectedDoor = door.value === 'random' ? 1 + Math.floor(Math.random() * 3) : Number(door.value);
  const car = carControl.value === 'random' ? 1 + Math.floor(Math.random() * 3) : Number(carControl.value);
  round = createRound(host.value, selectedDoor, car);
}

function fitBalloon(text) {
  const bubble = document.querySelector('#bubble');
  const speech = document.querySelector('#speech');
  if (index === SELECTION_SCENE) {
    // Preserve the approved illustrated balloon and tail. Cover its sample
    // lettering with a live text layer so the announcement matches this round.
    bubble.setAttribute('d', 'M 148 95 H 768 V 195 H 148 Z');
    bubble.setAttribute('stroke', 'none');
    document.querySelector('#thought-trail').replaceChildren();
    speech.textContent = text;
    Object.assign(speech.style, { left: '14.8%', top: '9.5%', width: '62%', height: '10%', fontSize: '7.5cqw' });
    return;
  }
  bubble.setAttribute('stroke', '#17131a');
  speech.style.fontSize = '';
  // Measure in the SVG's 1000-unit space so layout scales with the square.
  const context = document.createElement('canvas').getContext('2d');
  const fontSize = host.value === 'haunty' ? 35 : 38;
  context.font = `800 ${fontSize}px Arial, sans-serif`;
  const sceneWidth = document.querySelector('.scene').getBoundingClientRect().width;
  const sidePadding = Math.max(32, 20 * 1000 / sceneWidth);
  const maxTextWidth = Math.min(820, 920 - 2 * sidePadding);
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxTextWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  lines.push(line);
  const width = Math.max(...lines.map(value => context.measureText(value).width)) + 2 * sidePadding;
  const height = lines.length * fontSize * 1.16 + 40;
  const left = (1000 - width) / 2;
  const right = left + width;
  const top = 20;
  const bottom = top + height;
  const radius = 28;
  const finalDoor = index === 8 ? finalOutcome(contestant.value, round).finalDoor : null;
  const [tipX, tipY] = index === 8
    ? [[398, 597, 797][finalDoor - 1] - 110, host.value === 'monty' ? 420 : 350]
    : index === 7 ? [200, 407]
    : index === 6 || index === 9 ? [round.openedDoor === 1 ? 750 : 460, 390]
    : host.value === 'monty' ? [392, 426] : [333, 290];
  const base = Math.max(left + radius + 30, Math.min(right - radius - 30, tipX + 50));
  const thinking = index === 3 || index === 4 || (index === 5 && host.value === 'haunty');
  const tail = thinking ? '' : `H ${base + 25} L ${tipX} ${tipY} L ${base - 25} ${bottom}`;
  document.querySelector('#bubble').setAttribute('d',
    `M ${left + radius} ${top} H ${right - radius} Q ${right} ${top} ${right} ${top + radius} V ${bottom - radius} Q ${right} ${bottom} ${right - radius} ${bottom} ${tail} H ${left + radius} Q ${left} ${bottom} ${left} ${bottom - radius} V ${top + radius} Q ${left} ${top} ${left + radius} ${top} Z`);
  const trail = document.querySelector('#thought-trail');
  trail.replaceChildren();
  if (thinking) {
    const head = index === 5
      ? [[398, 597, 797][round.openedDoor - 1] - 110, 240]
      : host.value === 'monty' ? [320, 330] : [300, 210];
    // A trail of decreasing bubbles, ending just above the host's head.
    for (const [fraction, size] of [[0.25, 15], [0.55, 10], [0.82, 6]]) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', 420 + (head[0] - 420) * fraction);
      circle.setAttribute('cy', bottom + (head[1] - bottom) * fraction);
      circle.setAttribute('r', size);
      trail.append(circle);
    }
  }
  speech.textContent = lines.join('\n');
  Object.assign(speech.style, {
    left: `${left / 10}%`, top: `${top / 10}%`,
    width: `${width / 10}%`, height: `${height / 10}%`
  });
}

function schedule() {
  clearTimeout(timer);
  if (displayMode && isFinished()) {
    timer = setTimeout(showScores, SCENE_DURATION_MS);
    return;
  }
  if (!paused && !isFinished()) {
    deadline = performance.now() + remaining;
    timer = setTimeout(advance, remaining);
  }
}
function showScores() {
  const totals = tally.record(round, roundWinner(contestant.value, round));
  renderTotals(totals);
  document.querySelector('#scores').hidden = false;
  timer = setTimeout(restart, SCORE_DURATION_MS);
}
function renderTotals(totals) {
  document.querySelector('#games-played').textContent = totals.games;
  document.querySelector('#contestant-wins').textContent = totals.contestant;
  document.querySelector('#host-name').textContent = fixedHost === 'monty' ? 'Monty Hall wins' : 'Haunty Mall wins';
  document.querySelector('#host-wins').textContent = totals.host;
  document.querySelector('#nobody-wins').textContent = totals.nobody;
}
function advance() {
  index = nextScene(index, round.prize);
  remaining = SCENE_DURATION_MS;
  render();
}
function render() {
  const key = `${host.value}-${contestant.value}`;
  const selecting = index === SELECTION_SCENE;
  const thinking = index >= 3 && index < 5;
  const revealed = index >= 5 && !selecting;
  const reaction = index === 9 ? 'lose' : index === 8 ? (finalOutcome(contestant.value, round).won ? 'win' : 'lose') : '';
  const filename = selecting ? selectionImage(host.value, contestant.value)
    : reaction ? `${contestant.value}-${reaction}-stage-v1.png`
    : revealed ? `${contestant.value}-stage-v1.png` : thinking ? `${key}-turn-v1.png` : images[key];
  const art = document.querySelector('#art');
  const source = `assets/${revealed ? 'reveal' : 'concepts'}/${filename}`;
  if (art.getAttribute('src') !== source) art.src = source;
  art.alt = revealed ? `Host opened door ${round.openedDoor}, revealing a ${round.prize}. Selected door ${selectedDoor} remains closed.` : thinking ? `Host turning toward three closed doors. Door ${selectedDoor} is selected.` : 'Host facing the contestant with three closed prize doors behind him';
  if (selecting) art.alt = `View from behind the host: ${contestant.value === 'female' ? 'female' : 'male'} superhero contestant faces the camera and points above the host's head, choosing Door ${selectedDoor}.`;
  const glow = document.querySelector('#door-glow');
  glow.hidden = !thinking && !revealed;
  const activeDoor = index === 7 || index === 8 ? contestantDecision(contestant.value, round) : selectedDoor;
  glow.style.left = `${[42, 62, 82][activeDoor - 1]}%`;
  glow.setAttribute('aria-label', `Door ${activeDoor} selected, ${index === 8 ? 'now open' : 'still closed'}`);
  document.querySelector('.balloon').hidden = !balloonVisible();
  document.querySelector('#reveal').hidden = !revealed;
  if (balloonVisible()) fitBalloon(currentText());
  if (revealed) {
    document.querySelector('#foreground-contestant').src = source;
    document.querySelector('#foreground-contestant').dataset.reaction = reaction;
    document.querySelector('#reveal').style.setProperty('--door-left', `${[39.8, 59.7, 79.7][round.openedDoor - 1]}%`);
    const hostImage = document.querySelector('#opening-host');
    const asking = index === 6 || index === 7 || index === 9;
    hostImage.src = `assets/reveal/${host.value}-${index === 9 ? 'apology' : asking ? 'asking' : 'opening'}-v1.png`;
    hostImage.classList.toggle('asking', asking);
    hostImage.style.left = asking ? (round.openedDoor === 1 ? '57%' : '28%') : '';
    hostImage.alt = index === 9 ? 'Haunty facing the contestant and apologizing' : asking ? 'Host facing the contestant and asking about switching' : 'Host holding the opened door';
    document.querySelector('#opened-number').textContent = round.openedDoor;
    document.querySelector('#prize').src = `assets/reveal/${round.prize}-v1.png`;
    document.querySelector('#prize').alt = round.prize === 'car' ? 'Fancy shiny new sports car' : 'Shabby shaggy goat';
  }
  const result = finalOutcome(contestant.value, round);
  document.querySelector('#final-door').hidden = index !== 8;
  const reveal = document.querySelector('#reveal');
  reveal.style.removeProperty('--host-door-left');
  if (index === 8) {
    const position = `${[39.8, 59.7, 79.7][result.finalDoor - 1]}%`;
    document.querySelector('#final-door').style.setProperty('--door-left', position);
    reveal.style.setProperty('--host-door-left', position);
    document.querySelector('#final-number').textContent = result.finalDoor;
    const prize = document.querySelector('#final-prize');
    prize.src = `assets/reveal/${result.prize}-v1.png`;
    prize.alt = result.prize === 'car' ? 'Contestant wins a fancy shiny new sports car' : 'Contestant gets a shabby shaggy goat';
    art.alt = `Host has opened the contestant's final door ${result.finalDoor}, revealing a ${result.prize}. The contestant is ${result.won ? 'jumping for joy' : 'slumped on the floor in frustration'}. The first goat remains behind door ${round.openedDoor}.`;
  }
  if (index === 9) art.alt = `Haunty accidentally revealed the car behind Door ${round.openedDoor}. The contestant is slumped on the floor in frustration while Haunty faces them and apologizes. Original Door ${selectedDoor} stays closed.`;
  document.querySelector('#progress').textContent = selecting
    ? `Contestant selects Door ${selectedDoor}`
    : index === 9
    ? `Haunty revealed the car behind Door ${round.openedDoor} · Contestant loses`
    : index === 8
    ? `Final Door ${result.finalDoor}: ${result.prize === 'car' ? 'a car — contestant wins' : 'a goat — contestant loses'}`
    : index === 7
    ? `Original Door ${selectedDoor} · Goat behind Door ${round.openedDoor} · ${contestant.value === 'female' ? 'Switches to' : 'Keeps'} Door ${activeDoor}`
    : index === 6 ? `Goat behind Door ${round.openedDoor} · Host offers a switch from Door ${selectedDoor}`
    : revealed
    ? `Door ${selectedDoor} selected · ${host.value === 'monty' ? 'Monty' : 'Haunty'} opened Door ${round.openedDoor}: ${round.prize === 'car' ? 'a car — round ends in a contestant loss' : 'a goat'}`
    : thinking
    ? `Door ${selectedDoor} selected · Thought ${index - 2} of 2`
    : `Opening balloon ${index + 1} of 3`;
  document.querySelector('#pause').textContent = paused ? 'Resume' : 'Pause';
  document.querySelector('#pause').disabled = isFinished();
  document.querySelector('#next').disabled = isFinished();
  document.querySelector('#switch-question').disabled = round.prize !== 'goat';
  document.querySelector('#final-reveal').disabled = round.prize !== 'goat';
  document.querySelector('#apology').disabled = host.value !== 'haunty' || round.prize !== 'car';
  schedule();
}
function restart() {
  clearTimeout(timer);
  document.querySelector('#scores').hidden = true;
  index = 0; paused = false; remaining = SCENE_DURATION_MS;
  newRound();
  document.querySelector('#game-intro').textContent = displayCopy.intro;
  document.querySelector('#variant-description').textContent = displayCopy.variants[`${host.value}-${contestant.value}`];
  fitDisplayCopy();
  document.querySelector('#art').src = `assets/concepts/${images[`${host.value}-${contestant.value}`]}`;
  document.querySelector('.scene').dataset.host = host.value;
  const url = new URL(location.href);
  if (displayMode) {
    url.searchParams.delete('host');
    url.searchParams.delete('contestant');
  } else {
    url.searchParams.set('host', host.value);
    url.searchParams.set('contestant', contestant.value);
  }
  history.replaceState(null, '', url);
  render();
}
function startVariant() {
  if (displayMode) {
    host.value = fixedHost;
    contestant.value = fixedContestant;
  }
  renderTotals(tally.reset());
  restart();
}
host.addEventListener('change', startVariant);
contestant.addEventListener('change', startVariant);
function changeRound() {
  newRound();
  if (index >= 6 && ![9, SELECTION_SCENE].includes(index) && round.prize === 'car') index = 5;
  if (index === 9 && round.prize === 'car') index = 5;
  if (index === 9 && round.prize === 'goat') index = 5;
  if (!paused && !isFinished()) remaining = Math.max(0, deadline - performance.now());
  render();
}
door.addEventListener('change', changeRound);
carControl.addEventListener('change', changeRound);
document.querySelector('#open-door').addEventListener('click', () => {
  index = 5; paused = false; remaining = SCENE_DURATION_MS; render();
});
document.querySelector('#switch-question').addEventListener('click', () => {
  if (round.prize !== 'goat') return;
  index = 6; paused = false; remaining = SCENE_DURATION_MS; render();
});
document.querySelector('#final-reveal').addEventListener('click', () => {
  if (round.prize !== 'goat') return;
  index = 8; render();
});
document.querySelector('#apology').addEventListener('click', () => {
  if (host.value !== 'haunty' || round.prize !== 'car') return;
  index = 9; render();
});
document.querySelector('#thoughts').addEventListener('click', () => {
  index = 3; paused = false; remaining = SCENE_DURATION_MS; render();
});
document.querySelector('#selection').addEventListener('click', () => {
  index = SELECTION_SCENE; paused = false; remaining = SCENE_DURATION_MS; render();
});
document.querySelector('#replay').addEventListener('click', restart);
document.querySelector('#next').addEventListener('click', () => {
  if (!isFinished()) advance();
});
document.querySelector('#pause').addEventListener('click', () => {
  if (isFinished()) return;
  if (!paused) remaining = Math.max(0, deadline - performance.now());
  paused = !paused;
  render();
});
startVariant();
// Back/Forward navigation can restore a document without re-running its modules.
window.addEventListener('pageshow', event => { if (event.persisted) startVariant(); });
window.addEventListener('pagehide', () => clearTimeout(timer));
new ResizeObserver(() => { if (balloonVisible()) fitBalloon(currentText()); })
  .observe(document.querySelector('.scene'));
new ResizeObserver(fitDisplayCopy).observe(document.querySelector('aside'));
