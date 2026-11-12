export const games = [
  { name: 'Version 1', path: 'Monty/Switch/', target: 'quizshow-monty-female' },
  { name: 'Version 2', path: 'Monty/NoSwitch/', target: 'quizshow-monty-male' },
  { name: 'Version 3', path: 'Haunty/Switch/', target: 'quizshow-haunty-female' },
  { name: 'Version 4', path: 'Haunty/NoSwitch/', target: 'quizshow-haunty-male' }
];

// All opens must happen synchronously inside the button's user gesture.
// Named tabs and retained handles let a blocked launch be retried without
// duplicating or reloading games that already opened.
export function createLauncher(openWindow, focusLanding = () => {}) {
  const tabs = new Map();
  function openGame(game) {
    let tab = tabs.get(game.target);
    if (!tab || tab.closed) {
      tab = openWindow(game.path, game.target);
      if (tab) tabs.set(game.target, tab);
    }
    return tab;
  }
  function start() {
    const blocked = games.filter(game => !openGame(game));
    focusLanding();
    return blocked;
  }
  return { start, openGame };
}

if (typeof document !== 'undefined') {
  const focusLanding = () => window.focus();
  const launcher = createLauncher((url, target) => {
    const tab = window.open(`${url}?v=overview-first`, target);
    if (tab) tab.blur();
    return tab;
  }, focusLanding);
  const help = document.querySelector('#launch-help');
  const message = document.querySelector('#launch-message');
  const remaining = document.querySelector('#remaining-games');
  const overview = document.querySelector('#game-overview');
  const grid = document.querySelector('#game-grid');
  function showOverview() {
    if (!overview.hidden) return;
    // Row-major order: Monty/female, Monty/male, Haunty/female, Haunty/male.
    for (const game of games) {
      const frame = document.createElement('iframe');
      frame.title = `${game.name}: ${game.target.replace('quizshow-', '').replace('-', ' / ')}`;
      frame.addEventListener('load', () => {
        // The square tiles show the scene; the overview supplies shared copy.
        const panel = frame.contentDocument?.querySelector('aside');
        if (panel) panel.style.display = 'none';
      });
      frame.src = game.path;
      grid.append(frame);
    }
    overview.hidden = false;
    document.querySelector('.welcome').hidden = true;
    overview.querySelector('.overview-copy').append(help);
  }
  document.querySelector('#start-game').addEventListener('click', () => {
    const blocked = launcher.start();
    showOverview();
    help.hidden = blocked.length === 0;
    remaining.replaceChildren();
    if (!blocked.length) return;
    message.textContent = 'Your browser blocked some game tabs. Allow pop-ups for this site, then open the remaining games below.';
    for (const game of blocked) {
      const link = document.createElement('a');
      link.href = game.path;
      link.target = game.target;
      link.textContent = game.name;
      link.addEventListener('click', event => {
        event.preventDefault();
        if (launcher.openGame(game)) {
          focusLanding();
          link.remove();
          if (!remaining.children.length) {
            help.hidden = true;
          }
        }
      });
      remaining.append(link);
    }
  });
}
