<template>
  <div>
    <section>
      <input type="text" v-model="input" />
    </section>

    <section>
      <p>{{ results.length }} word found.</p>
      <ul class="searchresult" id="searchresult">
        <li
          v-for="(word, wordIndex) in resultView"
          :key="word.id"
          :id="'result_' + wordIndex"
        >
          <h3>
            <a :href="word.url" target="blank">
              {{ word.title }} [{{ word.gw }}] ({{ word.pos }})</a
            >
          </h3>
          <h4 v-if="word.orth.length > 0">Orthography</h4>
          <div
            v-for="(orth, orthIndex) in word.orth"
            :key="orth.w + '_' + orthIndex"
          >
            <span class="cuneiform">{{ orth.cuneiform }}</span>
            <span class="transliteral">{{ orth.w }}</span>
          </div>
          <h4 v-if="word.senses.length > 0">Sense</h4>
          <div v-for="sense in word.senses" :key="sense">
            <span class="sense">{{ sense }}</span>
          </div>
          <h4 v-if="word.equivs.length > 0">Equivalents</h4>
          <div v-for="equivs in word.equivs" :key="equivs">
            <span class="equivs">{{ equivs }}</span>
          </div>
          <h4 v-if="Object.keys(word.phrases).length > 0">Phrase</h4>
          <div
            v-for="(phrase, phraseIndex) in word.phrases"
            :key="phrase.title + '_' + wordIndex + '_' + phraseIndex"
          >
            <h5>{{ phrase.title }}</h5>
            <p
              v-for="(line, lineIndex) in phrase.lines"
              :key="line.sum + wordIndex + '_' + phraseIndex + '_' + lineIndex"
            >
              <span class="sum">{{ line.sum }}</span>
              <span v-if="line.akk"> = </span>
              <span v-if="line.akk" class="akk"> {{ line.akk }} </span>
            </p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
const FlexSearch = require("flexsearch");
const indexjson = require("../assets/searchindex.json");
const epsd2 = require("../assets/epsd2_src.json");
import _ from "lodash";
import Mark from "mark.js";

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

export default {
  name: "Search",
  data() {
    return {
      input: "",
      index: null,
      results: [],
    };
  },
  created: function() {
    this.debouncedSearch = _.debounce(this.incrementalSearch, 200);
  },
  watch: {
    input: function() {
      this.debouncedSearch();
    },
  },
  mounted() {
    this.index = FlexSearch.create({
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
    });
    this.index.import(JSON.stringify(indexjson));
  },

  methods: {
    incrementalSearch: function() {
      let data = [];
      if (this.input != "") {
        let searchs = this.index.search(this.input, {
          sort: "wordid",
        });

        let lastid = -1;
        var item;
        searchs.forEach((x) => {
          const word = epsd2[x.wordid];
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
            return Math.abs(val.length - this.input.length) / val.length;
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
              item.rank += 10 * cal_rank(word.orth[x.index].w);
              item.orth.push(word.orth[x.index]);
              break;
            case "sense":
              item.rank += 10 * cal_rank(word.senses[x.index]);
              item.senses.push(word.senses[x.index]);
              break;
            case "equivs":
              item.rank += 10 * cal_rank(word.equivs[x.index]);
              item.senses.push(word.equivs[x.index]);
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
      }
      this.results = data.sort((a, b) => b.rank - a.rank);

      let mark = (index) => {
        if (index < this.resultView.length) {
          var instance = new Mark("#result_" + index);
          instance.unmark({
            done: () => {
              instance.mark(this.input, {
                done: () => setTimeout(() => mark(index + 1), 10),
              });
            },
          });
        }
      };

      setTimeout(() => {
        mark(0);
      }, 10);
    },
  },
  computed: {
    resultView() {
      return this.results.slice(0, 50);
    },
  },
};
</script>

<style scoped>
.cuneiform {
  font-family: "Segoe UI histric", "Noto Sans Cuneiform";
}
</style>
