export const games = [
  { name: 'Version 1', path: 'Monty/Switch/', target: 'quizshow-monty-female' },
  { name: 'Version 2', path: 'Monty/NoSwitch/', target: 'quizshow-monty-male' },
  { name: 'Version 3', path: 'Haunty/Switch/', target: 'quizshow-haunty-female' },
  { name: 'Version 4', path: 'Haunty/NoSwitch/', target: 'quizshow-haunty-male' }
];

// All opens must happen synchronously inside the button's user gesture.
// Named tabs and retained handles let a blocked launch be retried without
// duplicating or reloading games that already opened.
export function createLauncher(openWindow, defer = setTimeout) {
  const tabs = new Map();
  function openGame(game) {
    let tab = tabs.get(game.target);
    if (!tab || tab.closed) {
      tab = openWindow(game.path, game.target);
      if (tab) tabs.set(game.target, tab);
    }
    return tab;
  }
  function focusFirst() {
    const first = tabs.get(games[0].target);
    if (first && !first.closed) {
      // Focusing must never navigate a page or create another tab.
      first.focus();
    }
  }
  function start() {
    const blocked = games.filter(game => !openGame(game));
    const first = tabs.get(games[0].target);
    if (first && !first.closed) {
      // This stays in the Start click: a real URL selects the existing named
      // game without the empty-URL navigation back to the welcome document.
      const selected = openWindow(games[0].path, games[0].target);
      if (selected) tabs.set(games[0].target, selected);
    }
    focusFirst();
    // New tabs activate asynchronously in Chrome. Select Version 1 again
    // after those activation requests have settled, including on a fresh launch.
    defer(focusFirst, 750);
    return blocked;
  }
  return { start, openGame, focusFirst };
}

if (typeof document !== 'undefined') {
  const launcher = createLauncher((url, target) => window.open(url ? `${url}?v=numbered-versions` : '', target));
  const help = document.querySelector('#launch-help');
  const message = document.querySelector('#launch-message');
  const remaining = document.querySelector('#remaining-games');
  document.querySelector('#start-game').addEventListener('click', () => {
    const blocked = launcher.start();
    help.hidden = blocked.length === 0;
    remaining.replaceChildren();
    if (!blocked.length) return;
    message.textContent = 'Your browser blocked some game tabs. Allow pop-ups for this site, then press Start Game! again, or open the remaining games below.';
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
            launcher.focusFirst();
          }
        }
      });
      remaining.append(link);
    }
  });
}
