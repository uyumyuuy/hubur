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

function search(query, targets) {
  var result = [];
  if (typeof targets === "string") {
    targets = targets.split(",");
  }

  targets.forEach((target) => {
    switch (target) {
      case "title":
        result = result.concat(titles.search(query, 100000));
        console.debug(`title:${result.length}`);
        break;
      case "meaning":
        result = result.concat(meanings.search(query, 100000));
        console.debug(`meaning:${result.length}`);
        break;
      case "orth":
        result = result.concat(orths.search(query, 100000));
        console.debug(`orth:${result.length}`);
        break;
      case "sense":
        result = result.concat(senses.search(query, 100000));
        console.debug(`sense:${result.length}`);
        break;
      case "equiv":
        result = result.concat(equivs.search(query, 100000));
        console.debug(`equivs:${result.length}`);
        break;
      case "phrase":
        result = result.concat(phrases.search(query, 100000));
        console.debug(`phrase:${result.length}`);
        break;
    }
  });
  return result.sort((a, b) => a.wordid - b.wordid);
}

function make_result(query, searchs) {
  let lastid = -1;
  var item;
  let data = [];
  searchs.forEach((x) => {
    const word = source[x.wordid];
    if (x.wordid != lastid) {
      item = {
        wordid: x.wordid,
        title: word.cf,
        gw: word.gw,
        pos: word.pos,
        url: word.url,
        id: word.id,
        orth: [],
        senses: [],
        equivs: [],
        phrases: {},
        rank: 0,
      };
      lastid = x.wordid;
      data.push(item);
    }

    let cal_rank = (val) => {
      return 1 - Math.abs(val.length - query.length) / val.length;
    };

    let i, j, line;
    switch (x.tag) {
      case "title":
        item.rank += 200 * cal_rank(item.title);
        break;
      case "meaning":
        item.rank += 50 * cal_rank(item.gw);
        break;
      case "cf":
        item.rank += 10 * cal_rank(word.orth[x.index].cuneiform);
        item.orth.push(word.orth[x.index]);
        break;
      case "w":
        if (x.wordid == "6934") {
          console.log(word.orth[x.index].w);
        }
        item.rank += 10 * cal_rank(word.orth[x.index].w);
        item.orth.push(word.orth[x.index]);
        break;
      case "sense":
        item.rank += 10 * cal_rank(word.senses[x.index]);
        item.senses.push(word.senses[x.index]);
        break;
      case "equivs":
        item.rank += 10 * cal_rank(word.equivs[x.index]);
        item.equivs.push(word.equivs[x.index]);
        break;
      case "phrase_title":
        if (!item.phrases[x.index]) {
          item.phrases[x.index] = {
            title: word.phrases[x.index].title,
            lines: [],
          };
          item.rank += 10 * cal_rank(word.phrases[x.index].title);
        }
        break;
      case "phrase_sumer":
      case "phrase_akkad":
        i = x.index[0];
        j = x.index[1];
        if (!item.phrases[i]) {
          item.phrases[i] = {
            title: word.phrases[i].title,
            lines: [],
          };
        }
        line = {
          sum: word.phrases[i].lines[j].sum,
          akk: word.phrases[i].lines[j].akk,
        };
        item.phrases[i].lines.push(line);
        item.rank += 5;
        break;
    }
  });
  return data.sort((a, b) => b.rank - a.rank);
}

module.exports = (req, res) => {
  const query = req.query.text || "";
  const targets = req.query.targets || [
    "title",
    "meaning",
    "orth",
    "sense",
    "equiv",
    "phrase",
  ];
  const page = Number(req.query.page) || 0;
  const perpage = Number(req.query.perpage) || 50;
  console.log(req.query);
  const startTime = new Date();
  let searchs = search(query, targets);
  let data = make_result(query, searchs);

  const endTime = new Date();
  console.log(endTime - startTime);
  res.json({
    total: data.length,
    page: page,
    maxpage: Math.ceil(data.length / perpage),
    data: data.slice(page * perpage, (page + 1) * perpage),
  });
};
