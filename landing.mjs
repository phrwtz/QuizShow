export const games = [
  { name: 'Monty / female', path: 'Monty/Switch/', target: 'quizshow-monty-female' },
  { name: 'Monty / male', path: 'Monty/NoSwitch/', target: 'quizshow-monty-male' },
  { name: 'Haunty / female', path: 'Haunty/Switch/', target: 'quizshow-haunty-female' },
  { name: 'Haunty / male', path: 'Haunty/NoSwitch/', target: 'quizshow-haunty-male' }
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
  function focusFirst() {
    const first = tabs.get(games[0].target);
    if (first && !first.closed) first.focus();
  }
  function start() {
    const blocked = games.filter(game => !openGame(game));
    focusFirst();
    return blocked;
  }
  return { start, openGame, focusFirst };
}

if (typeof document !== 'undefined') {
  const launcher = createLauncher((url, target) => window.open(url, target));
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
