import Card from '../objects/Card.js';
import CARDS_DATA from '../data/cards.js';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
    this.selectedHero = null;
    this.selectedEnemy = null;
  }

  create() {
    // พื้นหลัง
    this.add.rectangle(240, 427, 480, 854, 0x1a0a2e);

    // สร้างทีม
    this.heroTeam   = this.createTeam([1, 2, 3]);   // เลือกการ์ด id 1,2,3
    this.enemyTeam  = this.createTeam([4, 3, 2]);   // ศัตรู

    // วางการ์ดบนหน้าจอ
    this.drawTeam(this.heroTeam,  [120, 240, 360], 620, true);
    this.drawTeam(this.enemyTeam, [120, 240, 360], 200, false);

    // ปุ่ม Action
    this.createActionButtons();

    // Log text
    this.logText = this.add.text(20, 430, "เลือกการ์ดแล้วกด ATK!", {
      fontSize: '14px', color: '#fff',
      wordWrap: { width: 440 }
    });
  }

  createTeam(ids) {
    return ids.map(id => {
      const data = CARDS_DATA.find(c => c.id === id);
      return new Card(data);
    });
  }

  drawTeam(team, xList, y, isHero) {
    team.forEach((card, i) => {
      const x = xList[i];
      const color = isHero ? 0x2d1b69 : 0x6b1a1a;
      const border = isHero ? 0x9b59b6 : 0xe74c3c;

      // กรอบการ์ด
      const bg = this.add.rectangle(x, y, 100, 130, color)
        .setStrokeStyle(2, border);

      if (isHero) {
        bg.setInteractive();
        bg.on('pointerdown', () => this.selectHero(card, x, y, bg));
      } else {
        bg.setInteractive();
        bg.on('pointerdown', () => this.selectEnemy(card, x, y, bg));
      }

      // ชื่อการ์ด
      this.add.text(x, y - 50, card.name, {
        fontSize: '11px', color: '#fff'
      }).setOrigin(0.5);

      // Stars ตาม rarity
      const stars = '⭐'.repeat(card.rarity);
      this.add.text(x, y - 35, stars, {
        fontSize: '9px'
      }).setOrigin(0.5);

      // Stats
      this.add.text(x, y - 10, `❤️ ${card.stats.hp}`, {
        fontSize: '11px', color: '#e74c3c'
      }).setOrigin(0.5);
      this.add.text(x, y + 8, `⚔️ ${card.stats.atk}`, {
        fontSize: '11px', color: '#f39c12'
      }).setOrigin(0.5);
      this.add.text(x, y + 26, `🛡️ ${card.stats.def}`, {
        fontSize: '11px', color: '#3498db'
      }).setOrigin(0.5);

      // HP Bar
      const barW = 80;
      this.add.rectangle(x, y + 50, barW, 8, 0x333333);
      card.hpBar = this.add.rectangle(
        x - barW/2, y + 50, barW, 8, 0x2ecc71
      ).setOrigin(0, 0.5);

      card.cardObj = bg;
    });
  }

  selectHero(card, x, y, bg) {
    // Reset highlight
    this.heroTeam.forEach(c => {
      if (c.cardObj) c.cardObj.setStrokeStyle(2, 0x9b59b6);
    });
    this.selectedHero = card;
    bg.setStrokeStyle(3, 0xf1c40f); // highlight เหลือง
    this.logText.setText(`เลือก: ${card.name} | ATK:${card.stats.atk} DEF:${card.stats.def}`);
  }

  selectEnemy(card, x, y, bg) {
    this.enemyTeam.forEach(c => {
      if (c.cardObj) c.cardObj.setStrokeStyle(2, 0xe74c3c);
    });
    this.selectedEnemy = card;
    bg.setStrokeStyle(3, 0xf1c40f);
    this.logText.setText(`เป้าหมาย: ${card.name} | HP:${card.stats.hp}`);
  }

  createActionButtons() {
    const buttons = [
      { label: '⚔️ ATK',   x: 80,  action: () => this.doAttack() },
      { label: '🛡️ DEF',   x: 180, action: () => this.doDefend() },
      { label: '✨ SKILL', x: 280, action: () => this.doSkill() },
      { label: '💊 HEAL',  x: 380, action: () => this.doHeal() },
    ];

    buttons.forEach(btn => {
      const b = this.add.text(btn.x, 780, btn.label, {
        fontSize: '15px', color: '#fff',
        backgroundColor: '#6c3483',
        padding: { x: 10, y: 8 }
      }).setOrigin(0.5).setInteractive();

      b.on('pointerdown', btn.action);
      b.on('pointerover', () => b.setStyle({ backgroundColor: '#9b59b6' }));
      b.on('pointerout',  () => b.setStyle({ backgroundColor: '#6c3483' }));
    });
  }

  doAttack() {
    if (!this.selectedHero || !this.selectedEnemy) {
      this.logText.setText('⚠️ เลือกการ์ดตัวเองและศัตรูก่อน!');
      return;
    }
    const dmg = this.selectedEnemy.takeDamage(this.selectedHero.stats.atk);
    this.updateHpBar(this.selectedEnemy);
    this.logText.setText(
      `${this.selectedHero.name} โจมตี ${this.selectedEnemy.name} ทำดาเมจ ${dmg}!\nHP เหลือ: ${this.selectedEnemy.stats.hp}`
    );
    if (!this.selectedEnemy.isAlive) {
      this.logText.setText(`💀 ${this.selectedEnemy.name} พ่ายแพ้!`);
      this.selectedEnemy.cardObj.setFillStyle(0x333333);
      this.selectedEnemy = null;
    }
  }

  doDefend() {
    if (!this.selectedHero) {
      this.logText.setText('⚠️ เลือกการ์ดตัวเองก่อน!');
      return;
    }
    const oldDef = this.selectedHero.stats.def;
    this.selectedHero.stats.def = Math.floor(oldDef * 1.5);
    this.logText.setText(`🛡️ ${this.selectedHero.name} ตั้งรับ! DEF: ${oldDef} → ${this.selectedHero.stats.def}`);
  }

  doHeal() {
    if (!this.selectedHero) {
      this.logText.setText('⚠️ เลือกการ์ดตัวเองก่อน!');
      return;
    }
    const amount = Math.floor(this.selectedHero.stats.maxHp * 0.2);
    this.selectedHero.heal(amount);
    this.updateHpBar(this.selectedHero);
    this.logText.setText(`💊 ${this.selectedHero.name} ฟื้นฟู HP +${amount} | HP: ${this.selectedHero.stats.hp}`);
  }

  doSkill() {
    if (!this.selectedHero || !this.selectedEnemy) {
      this.logText.setText('⚠️ เลือกการ์ดตัวเองและศัตรูก่อน!');
      return;
    }
    const skill = this.selectedHero.skills[0];
    const dmg = this.selectedEnemy.takeDamage(
      Math.floor(this.selectedHero.stats.atk * skill.damage)
    );
    this.updateHpBar(this.selectedEnemy);
    this.logText.setText(
      `✨ ${this.selectedHero.name} ใช้ ${skill.name}!\nดาเมจ ${dmg} | HP เหลือ: ${this.selectedEnemy.stats.hp}`
    );
  }

  updateHpBar(card) {
    if (card.hpBar) {
      const pct = card.getHpPercent();
      card.hpBar.setScale(pct, 1);
      const color = pct > 0.5 ? 0x2ecc71 : pct > 0.25 ? 0xf39c12 : 0xe74c3c;
      card.hpBar.setFillStyle(color);
    }
  }
}