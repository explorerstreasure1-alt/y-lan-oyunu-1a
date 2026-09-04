import fs from 'fs';
const content = fs.readFileSync('src/vocabulary.ts', 'utf8');
const extraContent = fs.readFileSync('src/extraTuples.ts', 'utf8');

// Parse BASE_TUPLES more carefully
const baseArrayMatch = content.match(/const BASE_TUPLES: BaseTuple\[\] = \[([\s\S]*?)\];/);
if (baseArrayMatch) {
  const baseContent = baseArrayMatch[1];
  // Count entries more precisely by counting opening brackets at start of lines
  const entries = baseContent.match(/^\s*\["/gm);
  console.log('BASE_TUPLES entries (by line start):', entries ? entries.length : 0);
}

// Parse EXTRA_TUPLES more carefully
const extraArrayMatch = extraContent.match(/export const EXTRA_TUPLES: \[word: string, tr: string, pos: string, level: WordLevel, topic: string\]\[\] = \[([\s\S]*?)\];/);
if (extraArrayMatch) {
  const extraContentStr = extraArrayMatch[1];
  const entries = extraContentStr.match(/^\s*\["/gm);
  console.log('EXTRA_TUPLES entries (by line start):', entries ? entries.length : 0);
}

// Now let's check for duplicates and issues
const vocab = await import('./src/vocabulary.ts');
const words = vocab.LEARNING_PATH;

// Check for duplicate words
const wordMap = new Map();
words.forEach((w, i) => {
  if (wordMap.has(w.word)) {
    wordMap.get(w.word).push(i);
  } else {
    wordMap.set(w.word, [i]);
  }
});

const duplicates = Array.from(wordMap.entries()).filter(([_, indices]) => indices.length > 1);
console.log('\nDuplicate words:', duplicates.length);
if (duplicates.length > 0) {
  duplicates.slice(0, 20).forEach(([word, indices]) => {
    console.log(`  "${word}" at indices: ${indices.join(', ')}`);
  });
}

// Check for empty or problematic words
const problematic = words.filter(w => 
  !w.word || 
  w.word.trim() === '' || 
  !w.meaningTr || 
  w.meaningTr.trim() === '' ||
  w.word.length > 50 ||
  w.meaningTr.length > 100
);
console.log('\nProblematic entries:', problematic.length);
problematic.slice(0, 10).forEach(w => {
  console.log(`  ID ${w.id}: "${w.word}" -> "${w.meaningTr}" (pos: ${w.pos}, level: ${w.level}, topic: ${w.topic})`);
});

// Check level distribution
const levelDist = {};
words.forEach(w => {
  levelDist[w.level] = (levelDist[w.level] || 0) + 1;
});
console.log('\nLevel distribution:');
Object.entries(levelDist).sort().forEach(([level, count]) => {
  console.log(`  ${level}: ${count}`);
});

// Check topic distribution
const topicDist = {};
words.forEach(w => {
  topicDist[w.topic] = (topicDist[w.topic] || 0) + 1;
});
console.log('\nTopic distribution (top 20):');
Object.entries(topicDist).sort((a,b) => b[1] - a[1]).slice(0, 20).forEach(([topic, count]) => {
  console.log(`  ${topic}: ${count}`);
});

// Check pos distribution
const posDist = {};
words.forEach(w => {
  posDist[w.pos] = (posDist[w.pos] || 0) + 1;
});
console.log('\nPOS distribution:');
Object.entries(posDist).sort((a,b) => b[1] - a[1]).forEach(([pos, count]) => {
  console.log(`  ${pos}: ${count}`);
});