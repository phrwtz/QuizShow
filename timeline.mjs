// Deadlines remain tied to elapsed wall time even when browser timers are late.
export function createTimeline(now = Date.now) {
  let action = null;
  let due = 0;
  let processing = false;
  function schedule(nextAction, duration) {
    due = (processing ? due : now()) + duration;
    action = nextAction;
  }
  function tick(limit = 500) {
    const target = now();
    let steps = 0;
    processing = true;
    try {
      while (action && due <= target && steps < limit) {
        const nextAction = action;
        action = null;
        nextAction();
        steps++;
      }
    } finally { processing = false; }
    return { steps, pending: Boolean(action && due <= now()) };
  }
  function delay() { return action ? Math.max(0, due - now()) : null; }
  function stop() { action = null; due = 0; }
  return { schedule, tick, delay, stop };
}
