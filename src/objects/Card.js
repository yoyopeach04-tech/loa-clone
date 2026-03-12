export default class Card {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.rarity = data.rarity;
    this.stats = {
      hp:    data.hp,
      maxHp: data.hp,
      atk:   data.atk,
      def:   data.def,
      spd:   data.spd || 10
    };
    this.skills = data.skills || [];
    this.isAlive = true;
    this.cardObj = null;
    this.hpBar = null;
  }

  takeDamage(amount) {
    const dmg = Math.max(1, amount - this.stats.def);
    this.stats.hp = Math.max(0, this.stats.hp - dmg);
    if (this.stats.hp <= 0) this.isAlive = false;
    return dmg;
  }

  heal(amount) {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  getHpPercent() {
    return this.stats.hp / this.stats.maxHp;
  }
}