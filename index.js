const fs = require('fs');
const path = require('path')
const badWordDictionary = require('./badwords.json');
const wordsToCensor = require('./wordstocensor.json');
const filepath = process.argv[2];

let data = "";
try {
  data = fs.readFileSync(filepath, 'utf8');
} catch (err) {
  console.log("###############################")
  console.log("FILE COULD NOT BE READ PROPERLY")
  console.log("ONLY .srt and .txt  FILES ARE ALLOWED")
  console.log(err);
  return;
}

let badWordLines = {};
let subtitles = data
  .split('\r\n\r\n')
  .filter(section => section !== "")
  .map(section => {
    let lines = section.split('\r\n');
    let number = lines[0];
    let time = lines[1];
    let words = 
      lines
        .slice(2, lines.length)
        .join(' ')
        .split(' ')
        .map(word => word.replace(/\W/, '').toLowerCase());
    return {
      number,
      time,
      words
    }
  });

subtitles.forEach(sub => {
  sub.words.forEach(word => {
    if (badWordDictionary[word]) {
      badWordLines[sub.number] = {
        time: sub.time,
        word: wordsToCensor[word] ? censorWord(word) : word
      };
    }
  })
})

console.log(badWordLines);

let outputContents = []
for (let key in badWordLines) {
  outputContents.push(`[] ${key} ${badWordLines[key].time} ${badWordLines[key].word}`)
}
let outputFile = `${path.basename(filepath).split('.')[0]}-BadWords.txt`;
let outputDir = path.dirname(filepath);
console.log(path.join(outputDir, outputFile))
fs.writeFileSync(path.join(outputDir, outputFile), outputContents.join('\n'));


function censorWord(word) {
  return word.split('').fill('*', 1, -1).join('');
}