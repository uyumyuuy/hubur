const FlexSearch = require("flexsearch");
const fs = require("fs");
const src = require("../src/assets/epsd2_src.json");

let encoder = function(value) {
  value = value.toLowerCase();
  value = value.replace(/ŋ/g, "j");
  value = value.replace(/š/g, "sz");
  value = value.replace(/ṣ/g, "s,");
  value = value.replace(/ṭ/g, "t");
  value = value.replace(/ḫ/g, "h");
  value = value.replace(/ḫ/g, "h");
  value = value.replace(/[āâ]/g, "a");
  value = value.replace(/[îī]/g, "i");
  value = value.replace(/[ûū]/g, "u");
  value = value.replace(/[êē]/g, "e");

  value = value.replace(/₀/g, "0");
  value = value.replace(/₁/g, "1");
  value = value.replace(/₂/g, "2");
  value = value.replace(/₃/g, "3");
  value = value.replace(/₄/g, "4");
  value = value.replace(/₅/g, "5");
  value = value.replace(/₆/g, "6");
  value = value.replace(/₇/g, "7");
  value = value.replace(/₈/g, "8");
  value = value.replace(/₉/g, "9");
  value = value.replace(/ₓ/g, "x");

  return value;
};

var options = {
  encode: encoder,
  depth: 3,
  doc: {
    id: "id",
    field: {
      content: {
        encode: encoder,
        split: "[!? .\\-{}<>()/⸢⸣\\[\\]]+",
        stemmer: false,
        filter: false,
      },
      cuneiform: {
        encode: false,
        split: "[!? .\\-{}<>()/⸢⸣\\[\\]]+",
        tokenize: "full",
        stemmer: false,
        filter: false,
      },
    },
    store: ["wordid", "tag", "index", "cuneiform"],
  },
};

var meanings = new FlexSearch(Object.assign({}, options));
var titles = new FlexSearch(Object.assign({}, options));
var orths = new FlexSearch(Object.assign({}, options));
var senses = new FlexSearch(Object.assign({}, options));
var equivs = new FlexSearch(Object.assign({}, options));
var phrases = new FlexSearch(Object.assign({}, options));

var id = 0;
function newid() {
  id = id + 1;
  return id;
}
src.forEach((word, wordid) => {
  titles.add({
    wordid: wordid,
    id: newid(),
    tag: "title",
    content: word.cf,
    cuneiform: "",
    index: 0,
  });
  meanings.add({
    wordid: wordid,
    id: newid(),
    tag: "meaning",
    content: word.gw,
    cuneiform: "",
    index: 0,
  });
  word.orth.forEach((orth, i) => {
    orths.add({
      wordid: wordid,
      id: newid(),
      tag: "w",
      content: orth.w,
      cuneiform: "",
      index: i,
    });
    orths.add({
      wordid: wordid,
      id: newid(),
      tag: "cf",
      cuneiform: orth.cuneiform,
      content: "",
      index: i,
    });
  });
  word.senses.forEach((sense, i) => {
    senses.add({
      wordid: wordid,
      id: newid(),
      tag: "sense",
      content: sense.replace(/\([0-9x%/]+\)/, ""),
      index: i,
    });
  });

  word.equivs.forEach((equiv, i) => {
    equivs.add({
      wordid: wordid,
      id: newid(),
      tag: "equivs",
      content: equiv,
      index: i,
    });
  });

  word.phrases.forEach((phrase, i) => {
    phrases.add({
      wordid: wordid,
      id: newid(),
      tag: "phrase_title",
      content: phrase.title,
      index: i,
    });
    phrase.lines.forEach((line, j) => {
      phrases.add({
        wordid: wordid,
        id: newid(),
        tag: "phrase_sumer",
        content: line["sum"],
        index: [i, j],
      });
      if (line["akk"] != "") {
        phrases.add({
          wordid: wordid,
          id: newid(),
          tag: "phrase_akkad",
          content: line["akk"],
          index: [i, j],
        });
      }
    });
  });
});

console.log("titles");
console.log(titles.info());
fs.writeFileSync(
  __dirname + "/../src/assets/index_titles.json",
  titles.export()
);

console.log("meanings");
console.log(meanings.info());
fs.writeFileSync(
  __dirname + "/../src/assets/index_meanings.json",
  meanings.export()
);

console.log("orths");
console.log(orths.info());
fs.writeFileSync(__dirname + "/../src/assets/index_orths.json", orths.export());

console.log("senses");
console.log(senses.info());
fs.writeFileSync(
  __dirname + "/../src/assets/index_senses.json",
  senses.export()
);

console.log("equivs");
console.log(equivs.info());
fs.writeFileSync(
  __dirname + "/../src/assets/index_equivs.json",
  equivs.export()
);

console.log("phrases");
console.log(phrases.info());
fs.writeFileSync(
  __dirname + "/../src/assets/index_phrases.json",
  phrases.export()
);
