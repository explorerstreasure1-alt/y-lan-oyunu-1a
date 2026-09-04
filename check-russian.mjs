import { RUSSIAN_PATH } from './src/vocabularyRu.ts';

console.log('Russian total:', RUSSIAN_PATH.length);

// Level distribution
const levelDist = {};
RUSSIAN_PATH.forEach(w => {
  levelDist[w.level] = (levelDist[w.level] || 0) + 1;
});
console.log('Level distribution:', levelDist);

// Topic distribution
const topicDist = {};
RUSSIAN_PATH.forEach(w => {
  topicDist[w.topic] = (topicDist[w.topic] || 0) + 1;
});
console.log('Topic distribution:', Object.entries(topicDist).sort((a,b) => b[1] - a[1]));

// POS distribution
const posDist = {};
RUSSIAN_PATH.forEach(w => {
  posDist[w.pos] = (posDist[w.pos] || 0) + 1;
});
console.log('POS distribution:', posDist);

// Check İş/Kariyer topics
const isKelimeler = RUSSIAN_PATH.filter(w => w.topic === 'İş' || w.topic === 'Kariyer' || w.topic === 'Alışveriş');
console.log('\nİş/Kariyer/Alışveriş kelimeleri:', isKelimeler.length);
isKelimeler.forEach(w => console.log(`  ${w.word} -> ${w.meaningTr} (${w.pos}, ${w.level}, ${w.topic})`));