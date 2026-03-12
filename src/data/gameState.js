const GameState = {
  player: {
    hp: 50000,
    maxHp: 50000,
    board: Array(7).fill(null),   // 7 ช่อง
    hand: [],
    deck: [],
    graveyard: []
  },
  enemy: {
    hp: 100000,
    maxHp: 100000,
    board: Array(7).fill(null),
    hand: [],
    deck: [],
    graveyard: []
  },
  turn: 1,
  phase: 'player'   // 'player' | 'enemy'
};

export default GameState;