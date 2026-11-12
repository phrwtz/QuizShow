export const games = [
  { name: 'Monty Female', path: 'Monty/Switch/' },
  { name: 'Monty Male', path: 'Monty/NoSwitch/' },
  { name: 'Haunty Female', path: 'Haunty/Switch/' },
  { name: 'Haunty Male', path: 'Haunty/NoSwitch/' }
];

export function initializeLanding(document, history) {
  const overview = document.querySelector('#game-overview');
  const grid = document.querySelector('#game-grid');
  const links = document.querySelector('#game-links');
  function showOverview() {
    if (!overview.hidden) return;
    // Row-major order also matches the individual game buttons.
    for (const game of games) {
      const frame = document.createElement('iframe');
      frame.title = game.name;
      frame.addEventListener('load', () => {
        // The square tiles show the scene; the overview supplies shared copy.
        const panel = frame.contentDocument?.querySelector('aside');
        if (panel) panel.style.display = 'none';
      });
      frame.src = game.path;
      grid.append(frame);
      const link = document.createElement('a');
      link.href = game.path;
      link.textContent = game.name;
      links.append(link);
    }
    overview.hidden = false;
    document.querySelector('.welcome').hidden = true;
  }
  document.querySelector('#start-game').addEventListener('click', () => {
    // Preserve the overview on Back, including when the browser reloads it.
    history.replaceState({ ...history.state, overview: true }, '');
    showOverview();
  });
  if (history.state?.overview) showOverview();
}

if (typeof document !== 'undefined') initializeLanding(document, window.history);
