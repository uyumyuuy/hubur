const importStart = new Date();
import FlexSearch from "flexsearch";
import index_orths from "../src/assets/index_orths.json";

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

const orths = new FlexSearch(Object.assign({}, options));
orths.import(index_orths, { serialize: false });

const end = new Date();
console.log("index Time: %d ms", end - start);

function search(query) {
  var result = [];

  result = orths.search(query, 100000);
  console.log(`orth:${result.length}`);

  return result.sort((a, b) => a.wordid - b.wordid);
}

function make_result(query, searchs) {
  let lastid = -1;
  var item;
  let data = [];
  searchs.forEach((x) => {
    const word = source[x.wordid];
    item = {
      wordid: x.wordid,
      title: word.cf,
      gw: word.gw,
      pos: word.pos,
      url: word.url,
      id: word.id,
      orth: word.orth[x.index],
      rank: 0,
    };

    let cal_rank = (val) => {
      return 1 - Math.abs(val.length - query.length) / val.length;
    };

    item.rank += 10 * cal_rank(word.orth[x.index].cuneiform);
    item.orth = word.orth[x.index];
    data.push(item);
  });
  return data.sort((a, b) => b.rank - a.rank);
}

module.exports = (req, res) => {
  const query = req.query.text || "";

  const page = Number(req.query.page) || 0;
  const perpage = Number(req.query.perpage) || 50;
  console.log(req.query);
  const startTime = new Date();
  let searchs = search(query);
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
