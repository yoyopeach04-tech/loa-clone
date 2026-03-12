const CARDS_DATA = [
  {
    id: 1,
    name: "นักรบไฟ",
    type: "warrior",
    rarity: 3,
    hp: 1200,
    atk: 280,
    def: 120,
    spd: 8,
    skills: [
      { name: "ฟันไฟ", damage: 1.5, cost: 2 }
    ]
  },
  {
    id: 2,
    name: "นางฟ้าน้ำแข็ง",
    type: "mage",
    rarity: 4,
    hp: 900,
    atk: 420,
    def: 60,
    spd: 12,
    skills: [
      { name: "พายุหิมะ", damage: 2.0, cost: 3 }
    ]
  },
  {
    id: 3,
    name: "นักธนูพิษ",
    type: "archer",
    rarity: 3,
    hp: 1000,
    atk: 320,
    def: 80,
    spd: 15,
    skills: [
      { name: "ลูกศรพิษ", damage: 1.2, cost: 1 }
    ]
  },
  {
    id: 4,
    name: "อัศวินมืด",
    type: "warrior",
    rarity: 5,
    hp: 1800,
    atk: 380,
    def: 200,
    spd: 7,
    skills: [
      { name: "ดาบมรณะ", damage: 2.5, cost: 4 }
    ]
  }
];

export default CARDS_DATA;