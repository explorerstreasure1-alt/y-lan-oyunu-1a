const fs = require('fs');
const content = fs.readFileSync('src/vocabulary.ts', 'utf8');
const extraContent = fs.readFileSync('src/extraTuples.ts', 'utf8');

// Count BASE_TUPLES - match array entries
const baseMatches = content.match(/\["[^"]+","[^"]+","[^"]+","[^"]+","[^"]+"\]/g);
console.log('BASE_TUPLES approximate count:', baseMatches ? baseMatches.length : 0);

// Count EXTRA_TUPLES
const extraMatches = extraContent.match(/\["[^"]+","[^"]+","[^"]+","[^"]+","[^"]+"\]/g);
console.log('EXTRA_TUPLES approximate count:', extraMatches ? extraMatches.length : 0);

// Also check the LEARNING_PATH length by running the build function
// We'll import the module dynamically
try {
  const vocab = require('./src/vocabulary.ts');
  console.log('TOTAL_WORDS from module:', vocab.TOTAL_WORDS);
} catch(e) {
  console.log('Cannot import directly, need to compile first');
}