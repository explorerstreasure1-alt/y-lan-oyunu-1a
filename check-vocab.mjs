import fs from 'fs';
const content = fs.readFileSync('src/vocabulary.ts', 'utf8');
const extraContent = fs.readFileSync('src/extraTuples.ts', 'utf8');

// Count BASE_TUPLES - match array entries
const baseMatches = content.match(/\["[^"]+","[^"]+","[^"]+","[^"]+","[^"]+"\]/g);
console.log('BASE_TUPLES approximate count:', baseMatches ? baseMatches.length : 0);

// Count EXTRA_TUPLES
const extraMatches = extraContent.match(/\["[^"]+","[^"]+","[^"]+","[^"]+","[^"]+"\]/g);
console.log('EXTRA_TUPLES approximate count:', extraMatches ? extraMatches.length : 0);

// Import the vocabulary module
const vocab = await import('./src/vocabulary.ts');
console.log('TOTAL_WORDS from module:', vocab.TOTAL_WORDS);
console.log('LEARNING_PATH length:', vocab.LEARNING_PATH.length);