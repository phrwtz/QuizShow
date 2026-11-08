export function chooseHostDoor(host, selectedDoor, carDoor, random = Math.random) {
  if (!['monty', 'haunty'].includes(host)) throw new Error('Unknown host');
  if (![1, 2, 3].includes(selectedDoor) || ![1, 2, 3].includes(carDoor)) {
    throw new Error('Doors must be 1, 2, or 3');
  }
  const candidates = [1, 2, 3].filter(door =>
    door !== selectedDoor && (host === 'haunty' || door !== carDoor));
  return candidates[Math.floor(random() * candidates.length)];
}

export function createRound(host, selectedDoor, carDoor, random = Math.random) {
  const openedDoor = chooseHostDoor(host, selectedDoor, carDoor, random);
  return { selectedDoor, carDoor, openedDoor, prize: openedDoor === carDoor ? 'car' : 'goat' };
}

export function contestantDecision(contestant, round) {
  if (round.prize !== 'goat') return null;
  if (!['female', 'male'].includes(contestant)) throw new Error('Unknown contestant');
  return contestant === 'female'
    ? [1, 2, 3].find(door => door !== round.selectedDoor && door !== round.openedDoor)
    : round.selectedDoor;
}

export function finalOutcome(contestant, round) {
  const finalDoor = contestantDecision(contestant, round);
  if (finalDoor === null) return { finalDoor: null, prize: null, won: false };
  const prize = finalDoor === round.carDoor ? 'car' : 'goat';
  return { finalDoor, prize, won: prize === 'car' };
}
