export const games = [
  { name: 'Version 1', path: 'Haunty/NoSwitch/', target: 'quizshow-haunty-male' },
  { name: 'Version 2', path: 'Haunty/Switch/', target: 'quizshow-haunty-female' },
  { name: 'Version 3', path: 'Monty/NoSwitch/', target: 'quizshow-monty-male' },
  { name: 'Version 4', path: 'Monty/Switch/', target: 'quizshow-monty-female' }
];

// All opens must happen synchronously inside the button's user gesture.
// Named tabs and retained handles let a blocked launch be retried without
// duplicating or reloading games that already opened.
export function createLauncher(openWindow) {
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
    return games.filter(game => !openGame(game));
  }
  return { start, openGame };
}

if (typeof document !== 'undefined') {
  const launcher = createLauncher((url, target) => window.open(url ? `${url}?v=monty-last` : '', target));
  const help = document.querySelector('#launch-help');
  const message = document.querySelector('#launch-message');
  const remaining = document.querySelector('#remaining-games');
  const overview = document.querySelector('#game-overview');
  const grid = document.querySelector('#game-grid');
  function showOverview() {
    if (!overview.hidden) return;
    // Row-major order: Monty/female, Monty/male, Haunty/female, Haunty/male.
    for (const index of [3, 2, 1, 0]) {
      const game = games[index];
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
