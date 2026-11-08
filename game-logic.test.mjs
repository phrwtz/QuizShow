import assert from 'node:assert/strict';
import { createRound, contestantDecision, finalOutcome, roundWinner } from './game-logic.mjs';

for (const host of ['monty', 'haunty']) {
  for (const selected of [1, 2, 3]) {
    for (const car of [1, 2, 3]) {
      const eligible = [1, 2, 3].filter(door => door !== selected && (host === 'haunty' || door !== car));
      const first = createRound(host, selected, car, () => 0);
      const last = createRound(host, selected, car, () => 0.999999);
      assert.equal(first.openedDoor, eligible[0]);
      assert.equal(last.openedDoor, eligible.at(-1));
      for (const round of [first, last]) {
        for (const contestant of ['male', 'female']) {
          const winner = roundWinner(contestant, round);
          assert.equal(winner, round.openedDoor === car ? 'host'
            : contestantDecision(contestant, round) === car ? 'contestant' : 'nobody');
          if (host === 'monty') assert.notEqual(winner, 'host');
        }
        assert.notEqual(round.openedDoor, selected);
        assert.equal(round.prize, round.openedDoor === car ? 'car' : 'goat');
        if (host === 'monty') assert.equal(round.prize, 'goat');
        if (round.prize === 'goat') {
          assert.equal(contestantDecision('male', round), selected);
          const switched = contestantDecision('female', round);
          assert.notEqual(switched, selected);
          assert.notEqual(switched, round.openedDoor);
          for (const contestant of ['male', 'female']) {
            const result = finalOutcome(contestant, round);
            assert.equal(result.finalDoor, contestantDecision(contestant, round));
            assert.equal(result.won, result.finalDoor === car);
            assert.equal(result.prize, result.won ? 'car' : 'goat');
          }
        } else {
          assert.equal(contestantDecision('female', round), null);
          assert.equal(contestantDecision('male', round), null);
          assert.deepEqual(finalOutcome('female', round), { finalDoor: null, prize: null, won: false });
        }
      }
      if (eligible.length === 2) {
        assert.equal(createRound(host, selected, car, () => 0.499999).openedDoor, eligible[0]);
        assert.equal(createRound(host, selected, car, () => 0.5).openedDoor, eligible[1]);
      }
    }
  }
}
console.log('Passed all 18 host/choice/car combinations and equal-probability boundaries.');
