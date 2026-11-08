export function createTally() {
  let totals;
  let countedRounds;
  function reset() {
    totals = { games: 0, contestant: 0, host: 0, nobody: 0 };
    countedRounds = new WeakSet();
    return snapshot();
  }
  function snapshot() { return { ...totals }; }
  function record(round, winner) {
    if (!['contestant', 'host', 'nobody'].includes(winner)) throw new Error('Unknown outcome');
    if (!countedRounds.has(round)) {
      totals.games++;
      totals[winner]++;
      countedRounds.add(round);
    }
    return snapshot();
  }
  reset();
  return { reset, record, snapshot };
}
