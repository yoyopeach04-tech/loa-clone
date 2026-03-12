import Card from '../objects/Card.js';
import GameState from '../data/gameState.js';
import { buildDeck, drawCard } from '../systems/DeckSystem.js';
import { executeAttack, checkDeaths } from '../systems/CombatSystem.js';

const BOARD_SLOTS = 7;
const SLOT_W = 62, SLOT_H = 80;
const SLOT_START_X = 30;

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
    this.selectedHandCard = null;
    this.selectedHandIdx  = null;
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0d1a');

    // Init Game
    GameState.player.deck = buildDeck();
    GameState.enemy.deck  = buildDeck();
    for (let i = 0; i < 3; i++) {
      drawCard(GameState.player);
      drawCard(GameState.enemy);
    }

    this.drawAll();
  }

  // ========== วาดทั้งหมด ==========
  drawAll() {
    // ล้างหน้าจอ
    if (this.uiLayer) this.uiLayer.destroy();
    this.uiLayer = this.add.container(0, 0);

    this.drawHeroHP();
    this.drawBoards();
    this.drawHand();
    this.drawTurnInfo();
    this.drawEndTurnButton();
    this.drawLog('');
  }

  // ========== HP ฮีโร่ ==========
  drawHeroHP() {
    // ผู้เล่น (ล่าง)
    const pPct = GameState.player.hp / GameState.player.maxHp;
    this.add.rectangle(240, 820, 440, 18, 0x222222);
    this.add.rectangle(20 + (440 * pPct) / 2, 820, 440 * pPct, 18, 0x2ecc71).setOrigin(0, 0.5).setX(20);
    this.add.text(240, 820,
      `❤️ ผู้เล่น ${GameState.player.hp.toLocaleString()} / ${GameState.player.maxHp.toLocaleString()}`,
      { fontSize: '12px', color: '#fff' }
    ).setOrigin(0.5);

    // ศัตรู (บน)
    const ePct = GameState.enemy.hp / GameState.enemy.maxHp;
    this.add.rectangle(240, 30, 440, 18, 0x222222);
    this.add.rectangle(20 + (440 * ePct) / 2, 30, 440 * ePct, 18, 0xe74c3c).setOrigin(0, 0.5).setX(20);
    this.add.text(240, 30,
      `💀 ศัตรู ${GameState.enemy.hp.toLocaleString()} / ${GameState.enemy.maxHp.toLocaleString()}`,
      { fontSize: '12px', color: '#fff' }
    ).setOrigin(0.5);
  }

  // ========== Board ==========
  drawBoards() {
    // Board ศัตรู (บน)
    this.drawBoardRow(GameState.enemy.board,  55,  false);
    // Board ผู้เล่น (ล่าง)
    this.drawBoardRow(GameState.player.board, 680, true);
  }

  drawBoardRow(board, y, isPlayer) {
    board.forEach((card, i) => {
      const x = SLOT_START_X + i * (SLOT_W + 5) + SLOT_W / 2;

      // กรอบช่อง
      const slotBg = this.add.rectangle(x, y + SLOT_H / 2, SLOT_W, SLOT_H,
        card ? (isPlayer ? 0x2d1b69 : 0x4a0000) : 0x1a1a2e
      ).setStrokeStyle(1, isPlayer ? 0x6c3483 : 0x922b21);

      if (card) {
        this.drawCardOnBoard(card, x, y, isPlayer);
      } else if (isPlayer) {
        // ช่องว่างผู้เล่นกดวางได้
        slotBg.setInteractive();
        slotBg.on('pointerover', () => slotBg.setFillStyle(0x2c3e50));
        slotBg.on('pointerout',  () => slotBg.setFillStyle(0x1a1a2e));
        slotBg.on('pointerdown', () => this.placeCardOnBoard(i));
      }

      // เลขช่อง
      this.add.text(x, y + SLOT_H - 5, `${i + 1}`,
        { fontSize: '9px', color: '#555' }
      ).setOrigin(0.5);
    });
  }

  drawCardOnBoard(card, x, y, isPlayer) {
    // ชื่อ
    this.add.text(x, y + 8, card.name,
      { fontSize: '9px', color: '#fff', wordWrap: { width: SLOT_W - 4 } }
    ).setOrigin(0.5);

    // Stars
    this.add.text(x, y + 20, '⭐'.repeat(Math.min(card.stars, 5)),
      { fontSize: '7px' }
    ).setOrigin(0.5);

    // ATK / HP
    this.add.text(x, y + 34, `⚔️${card.atk}`,
      { fontSize: '10px', color: '#f39c12' }
    ).setOrigin(0.5);
    this.add.text(x, y + 47, `❤️${card.hp}`,
      { fontSize: '10px', color: '#e74c3c' }
    ).setOrigin(0.5);

    // Status icons
    let icons = '';
    if (card.physShield)    icons += '🛡️';
    if (card.stealth)       icons += '👻';
    if (card.immortalTurns) icons += '👑';
    if (card.burnTurns)     icons += '🔥';
    if (card.corruptTurns)  icons += '🌌';
    if (icons) {
      this.add.text(x, y + 60, icons, { fontSize: '8px' }).setOrigin(0.5);
    }

    // HP Bar
    const barW = SLOT_W - 8;
    const pct  = card.getHpPercent();
    this.add.rectangle(x, y + SLOT_H - 10, barW, 5, 0x333333);
    const barColor = pct > 0.5 ? 0x2ecc71 : pct > 0.25 ? 0xf39c12 : 0xe74c3c;
    this.add.rectangle(x - barW / 2, y + SLOT_H - 10, barW * pct, 5, barColor).setOrigin(0, 0.5);

    // WaitTime overlay
    if (card.waitTime > 0) {
      this.add.rectangle(x, y + SLOT_H / 2, SLOT_W, SLOT_H, 0x000000, 0.5);
      this.add.text(x, y + SLOT_H / 2, `⏳${card.waitTime}`,
        { fontSize: '18px', color: '#f1c40f' }
      ).setOrigin(0.5);
    }
  }

  // ========== Hand ==========
  drawHand() {
    const hand = GameState.player.hand;
    const startX = 20;
    const y = 755;
    const cardW = 58, cardH = 60;

    this.add.text(10, y - 14, `🃏 มือ (${hand.length}/7)`,
      { fontSize: '11px', color: '#aaa' }
    );

    hand.forEach((card, i) => {
      const x = startX + i * (cardW + 4);
      const isSelected = this.selectedHandIdx === i;

      const bg = this.add.rectangle(x + cardW / 2, y + cardH / 2, cardW, cardH,
        isSelected ? 0x8e44ad : 0x2c3e50
      ).setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xf1c40f : 0x7f8c8d)
       .setInteractive();

      bg.on('pointerdown', () => this.selectHandCard(card, i));

      // ชื่อ
      this.add.text(x + cardW / 2, y + 8, card.name,
        { fontSize: '8px', color: '#fff', wordWrap: { width: cardW - 4 } }
      ).setOrigin(0.5);

      // Stats
      this.add.text(x + cardW / 2, y + 28, `⚔️${card.atk}`,
        { fontSize: '9px', color: '#f39c12' }
      ).setOrigin(0.5);
      this.add.text(x + cardW / 2, y + 40, `❤️${card.hp}`,
        { fontSize: '9px', color: '#e74c3c' }
      ).setOrigin(0.5);

      // WaitTime
      this.add.text(x + cardW / 2, y + 52, `⏳${card.waitTime}`,
        { fontSize: '9px', color: '#f1c40f' }
      ).setOrigin(0.5);
    });
  }

  // ========== เลือกการ์ดในมือ ==========
  selectHandCard(card, idx) {
    if (this.selectedHandIdx === idx) {
      this.selectedHandCard = null;
      this.selectedHandIdx  = null;
    } else {
      this.selectedHandCard = card;
      this.selectedHandIdx  = idx;
    }
    this.drawAll();
    this.drawLog(
      this.selectedHandCard
        ? `เลือก ${this.selectedHandCard.name} | คลิกช่องว่างบน Board เพื่อวาง`
        : ''
    );
  }

  // ========== วางการ์ดลง Board ==========
  placeCardOnBoard(slotIdx) {
    if (!this.selectedHandCard) {
      this.drawLog('⚠️ เลือกการ์ดในมือก่อน!');
      return;
    }
    if (GameState.player.board[slotIdx]) {
      this.drawLog('⚠️ ช่องนี้มีการ์ดแล้ว!');
      return;
    }

    // วางการ์ด
    GameState.player.board[slotIdx] = this.selectedHandCard;
    GameState.player.hand.splice(this.selectedHandIdx, 1);
    this.selectedHandCard = null;
    this.selectedHandIdx  = null;

    this.drawAll();
    this.drawLog(`✅ วาง ${GameState.player.board[slotIdx].name} ที่ช่อง ${slotIdx + 1}`);
  }

  // ========== End Turn ==========
  drawEndTurnButton() {
    const btn = this.add.text(390, 840, '⚔️ END TURN', {
      fontSize: '13px', color: '#fff',
      backgroundColor: '#922b21',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive();

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#e74c3c' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#922b21' }));
    btn.on('pointerdown', () => this.endTurn());
  }

  endTurn() {
    const logs = [];

    // ① Process Player Turn (การ์ดผู้เล่นโจมตี)
    GameState.player.board.forEach((card, i) => {
      if (card && card.isAlive && card.waitTime <= 0) {
        const result = executeAttack(card, i, true);
        logs.push(...result);
      }
    });
    checkDeaths(GameState.enemy).forEach(l => logs.push(l));

    // เช็คชนะ
    if (GameState.enemy.hp <= 0) {
      this.drawAll();
      this.drawLog('🏆 ชนะแล้ว!');
      return;
    }

    // ② ศัตรู ลด waitTime + ดึงการ์ด + ลงสนาม
    GameState.enemy.board.forEach(c => { if (c) c.waitTime = Math.max(0, c.waitTime - 1); });
    GameState.player.board.forEach(c => { if (c && c.waitTime > 0) c.waitTime--; });

    drawCard(GameState.enemy);
    this.enemyPlayCards();

    // ③ Process Enemy Turn (การ์ดศัตรูโจมตี)
    GameState.enemy.board.forEach((card, i) => {
      if (card && card.isAlive && card.waitTime <= 0) {
        const result = executeAttack(card, i, false);
        logs.push(...result);
      }
    });
    checkDeaths(GameState.player).forEach(l => logs.push(l));

    // เช็คแพ้
    if (GameState.player.hp <= 0) {
      this.drawAll();
      this.drawLog('💀 แพ้แล้ว!');
      return;
    }

    // ④ ผู้เล่นดึงการ์ด
    const drawn = drawCard(GameState.player);
    if (drawn) logs.push(`🃏 ดึง ${drawn.name} มาที่มือ`);

    GameState.turn++;
    this.drawAll();
    this.drawLog(logs.slice(-3).join('\n'));
  }

  // AI ศัตรูลงการ์ด
  enemyPlayCards() {
    GameState.enemy.hand.forEach((card, i) => {
      if (card.waitTime <= 0) {
        const emptySlot = GameState.enemy.board.findIndex(s => s === null);
        if (emptySlot !== -1) {
          GameState.enemy.board[emptySlot] = card;
          GameState.enemy.hand.splice(i, 1);
        }
      }
    });
  }

  // ========== UI ==========
  drawTurnInfo() {
    this.add.text(10, 10,
      `เทิร์น ${GameState.turn}  |  สุสาน: ⚰️${GameState.player.graveyard.length}`,
      { fontSize: '11px', color: '#aaa' }
    );
  }

  drawLog(msg) {
    if (this.logBox) this.logBox.destroy();
    this.logBox = this.add.text(10, 390, msg, {
      fontSize: '12px', color: '#f1c40f',
      wordWrap: { width: 460 },
      backgroundColor: '#00000088',
      padding: { x: 6, y: 4 }
    });
  }
}