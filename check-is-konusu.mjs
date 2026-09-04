import fs from 'fs';
const vocab = await import('./src/vocabulary.ts');
const words = vocab.LEARNING_PATH;

// "İş" konusundaki kelimeleri filtrele
const isKelimeleri = words.filter(w => w.topic === 'İş');
console.log(`"İş" konusu kelime sayısı: ${isKelimeleri.length}\n`);

isKelimeleri.forEach(w => {
  console.log(`ID ${w.id}: ${w.word} -> ${w.meaningTr} (${w.pos}, ${w.level})`);
});

// Ayrıca "Kariyer" konusuna da bakalım
const kariyerKelimeleri = words.filter(w => w.topic === 'Kariyer');
console.log(`\n\n"Kariyer" konusu kelime sayısı: ${kariyerKelimeleri.length}\n`);

kariyerKelimeleri.forEach(w => {
  console.log(`ID ${w.id}: ${w.word} -> ${w.meaningTr} (${w.pos}, ${w.level})`);
});

// "Teknoloji" de işle ilgili olabilir
const techKelimeleri = words.filter(w => w.topic === 'Teknoloji');
console.log(`\n\n"Teknoloji" konusu kelime sayısı: ${techKelimeleri.length}\n`);

techKelimeleri.forEach(w => {
  console.log(`ID ${w.id}: ${w.word} -> ${w.meaningTr} (${w.pos}, ${w.level})`);
});