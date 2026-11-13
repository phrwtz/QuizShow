export const games = [
  { name: 'Monty Hall and Female Contestant', path: 'Monty/Switch/' },
  { name: 'Monty Hall and Male Contestant', path: 'Monty/NoSwitch/' },
  { name: 'Haunty Mall and Female Contestant', path: 'Haunty/Switch/' },
  { name: 'Haunty Mall and Male Contestant', path: 'Haunty/NoSwitch/' }
];

export function initializeLanding(document, history, navigation = document.defaultView) {
  const overview = document.querySelector('#game-overview');
  const grid = document.querySelector('#game-grid');
  const links = document.querySelector('#game-links');
  const frames = [];
  function showGame(selected) {
    frames.forEach((frame, index) => {
      const enlarged = index === selected;
      frame.classList.toggle('enlarged', enlarged);
      const panel = frame.contentDocument?.querySelector('aside');
      if (panel) panel.style.display = enlarged ? '' : 'none';
    });
  }
  function showOverview() {
    if (!overview.hidden) return;
    // Row-major order also matches the individual game buttons.
    for (const game of games) {
      const frame = document.createElement('iframe');
      const index = frames.length;
      frames.push(frame);
      frame.title = game.name;
      frame.addEventListener('load', () => {
        // The square tiles show the scene; the overview supplies shared copy.
        const panel = frame.contentDocument?.querySelector('aside');
        if (panel) panel.style.display = history.state?.game === index ? '' : 'none';
      });
      frame.src = game.path;
      grid.append(frame);
      const link = document.createElement('a');
      link.href = game.path;
      link.textContent = game.name;
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        // Enlarge the existing browsing context so its game and timers survive.
        history.pushState({ ...history.state, game: index }, '', `#game-${index + 1}`);
        showGame(index);
        frame.focus();
      });
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
  navigation.addEventListener('popstate', () => showGame(history.state?.game));
  if (history.state?.overview) {
    showOverview();
    showGame(history.state.game);
  }
}

if (typeof document !== 'undefined') initializeLanding(document, window.history);
