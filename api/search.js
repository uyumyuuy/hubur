import FlexSearch from "flexsearch";
import index_titles from "../src/assets/index_titles.json";

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
const titles = new FlexSearch(Object.assign({}, options));
titles.import(index_titles, { serialize: false });

module.exports = (req, res) => {
  console.log(req.query);
  res.json(titles.search(req.query.text));
};
