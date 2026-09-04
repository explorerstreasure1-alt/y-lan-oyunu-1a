import { RUSSIAN_PATH } from './src/vocabularyRu.ts';

console.log('Russian total:', RUSSIAN_PATH.length);

// Level distribution
const levelDist = {};
RUSSIAN_PATH.forEach(w => {
  levelDist[w.level] = (levelDist[w.level] || 0) + 1;
});
console.log('Level distribution:', levelDist);

// Topic distribution (top 20)
const topicDist = {};
RUSSIAN_PATH.forEach(w => {
  topicDist[w.topic] = (topicDist[w.topic] || 0) + 1;
});
console.log('Topic distribution (top 20):', Object.entries(topicDist).sort((a,b) => b[1] - a[1]).slice(0, 20));

// POS distribution
const posDist = {};
RUSSIAN_PATH.forEach(w => {
  posDist[w.pos] = (posDist[w.pos] || 0) + 1;
});
console.log('POS distribution:', posDist);