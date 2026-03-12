import BattleScene from './scenes/BattleScene.js';

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 854,
  backgroundColor: '#1a0a2e',
  scene: [BattleScene],
  parent: 'game-container'
};

const game = new Phaser.Game(config);