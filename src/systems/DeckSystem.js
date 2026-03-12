import CARDS_DATA from '../data/cards.js';
import Card from '../objects/Card.js';
import GameState from '../data/gameState.js';

// กฎจำนวนการ์ดต่อ Deck ตาม Stars
const STAR_LIMIT = { 6: 1, 5: 2 };

export function buildDeck() {
  const deck = [];
  const starCount = {};

  const shuffled = [...CARDS_DATA].sort(() => Math.random() - 0.5);

  for (const data of shuffled) {
    if (deck.length >= 10) break;
    const limit = STAR_LIMIT[data.stars] ?? 3;
    const count = starCount[data.stars] || 0;
    if (count < limit) {
      deck.push(new Card(data));
      starCount[data.stars] = count + 1;
    }
  }
  return deck;
}

export function drawCard(side) {
  if (side.hand.length >= 7) return null;       // มือเต็ม
  if (side.deck.length === 0) return null;      // ไพ่หมด
  const card = side.deck.shift();
  side.hand.push(card);
  return card;
}

export function checkDeckEmpty(side) {
  return side.deck.length === 0 &&
         side.hand.length === 0 &&
         side.board.every(c => c === null);
}