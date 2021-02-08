const importStart = new Date();
import FlexSearch from "flexsearch";
import index_titles from "../src/assets/index_titles.json";
import index_meanings from "../src/assets/index_meanings.json";
import index_orths from "../src/assets/index_orths.json";
import index_phrases from "../src/assets/index_phrases.json";
import index_senses from "../src/assets/index_senses.json";
import index_equivs from "../src/assets/index_equivs.json";

import source from "../src/assets/epsd2_src.json";

const importEnd = new Date();
console.log("Import Time: %d", importEnd - importStart);

function encoder(value) {
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
}

const options = {
  encode: encoder,
  depth: 3,
  doc: {
    id: "id",
    field: {
      content: {
        encode: encoder,
        split: "[!? .\\-{}<>()/⸢⸣\\[\\]]+",
      },
      cuneiform: {
        encode: false,
        split: "[!? .\\-{}<>()/⸢⸣\\[\\]]+",
        tokenize: "full",
      },
    },
    store: ["wordid", "tag", "index"],
  },
};

const start = new Date();

const titles = new FlexSearch(Object.assign({}, options));
titles.import(index_titles, { serialize: false });

const meanings = new FlexSearch(Object.assign({}, options));
meanings.import(index_meanings, { serialize: false });

const orths = new FlexSearch(Object.assign({}, options));
orths.import(index_orths, { serialize: false });

const senses = new FlexSearch(Object.assign({}, options));
senses.import(index_senses, { serialize: false });

const equivs = new FlexSearch(Object.assign({}, options));
equivs.import(index_equivs, { serialize: false });

const phrases = new FlexSearch(Object.assign({}, options));
phrases.import(index_phrases, { serialize: false });

const end = new Date();
console.log("index Time: %d ms", end - start);

module.exports = (req, res) => {
  console.log(req.query);
  var result = [];
  const startTime = new Date();
  result = result.concat(titles.search(req.query.text));
  result = result.concat(orths.search(req.query.text));
  result = result.concat(senses.search(req.query.text));
  result = result.concat(meanings.search(req.query.text));
  result = result.concat(equivs.search(req.query.text));
  result = result.concat(phrases.search(req.query.text));
  result = result.sort((a, b) => a.wordid - b.wordid);
  console.log(result.length);
  const endTime = new Date();
  console.log(endTime - startTime);
  res.json({ count: result.length, time: endTime - startTime });
};
