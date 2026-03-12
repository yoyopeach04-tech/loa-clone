import GameState from '../data/gameState.js';

export function executeAttack(attacker, slotIndex, isPlayer) {
  const enemySide = isPlayer ? GameState.enemy : GameState.player;
  const logs = [];

  // ถ้ามีการ์ดช่องตรงข้าม → ตีการ์ด
  const target = enemySide.board[slotIndex];
  if (target && !target.stealth) {
    const dmg = target.applyDamage(attacker.atk, 'normal');
    logs.push(`⚔️ ${attacker.name} ตี ${target.name} ดาเมจ ${dmg}`);
    if (!target.isAlive) {
      logs.push(`💀 ${target.name} ถูกสังหาร!`);
    }
  } else {
    // ช่องว่าง หรือ Stealth → ตีฮีโร่โดยตรง
    enemySide.hp = Math.max(0, enemySide.hp - attacker.atk);
    logs.push(`💥 ${attacker.name} โจมตีฮีโร่โดยตรง! -${attacker.atk} HP`);
  }

  return logs;
}

export function checkDeaths(side) {
  const logs = [];
  side.board.forEach((card, i) => {
    if (card && !card.isAlive) {
      side.graveyard.push(card);
      side.board[i] = null;
      logs.push(`⚰️ ${card.name} เข้า Graveyard`);
    }
  });
  return logs;
}