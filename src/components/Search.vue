<template>
  <div>
    <section class="block">
      <b-field
        label="input search word"
        message=" (j=ŋ sz=š s,=ṣ t,=ṭ 0-9=₀-₉; '=alef)"
      >
        <b-input
          placeholder="hu bu ur2"
          rounded
          icon-pack="fas"
          icon="search"
          type="text"
          v-model="input"
        />
      </b-field>

      <div class="block">
        <b-field label="Search field" grouped group-multiline>
          <b-checkbox v-model="searchTarget" native-value="title">
            Title
          </b-checkbox>
          <b-checkbox v-model="searchTarget" native-value="meaning">
            Meaning
          </b-checkbox>
          <b-checkbox v-model="searchTarget" native-value="orth">
            Orthography
          </b-checkbox>
          <b-checkbox v-model="searchTarget" native-value="sense">
            Sense
          </b-checkbox>
          <b-checkbox v-model="searchTarget" native-value="equiv">
            Equivalent
          </b-checkbox>
          <b-checkbox v-model="searchTarget" native-value="phrase">
            Phrase
          </b-checkbox>
        </b-field>
      </div>
      <p v-if="searching">finding...</p>
      <p v-else>{{ totalFound }} words found.</p>
    </section>

    <section class="block">
      <b-pagination v-model="page" :total="maxPage" :per-page="1" />
      <div class="columns">
        <div class="column is-narrow is-hidden-mobile">
          <ul>
            <li
              v-for="(word, wordIndex) in resultView"
              :key="'side_' + word.id"
            >
              <a :href="'#w' + wordIndex"
                >{{ word.title }} [{{ word.gw }}] ({{ word.pos }})</a
              >
            </li>
          </ul>
        </div>
        <div class="column">
          <ul class="searchresult" id="searchresult">
            <li
              v-for="(word, wordIndex) in resultView"
              :key="word.id"
              :id="'result_' + wordIndex"
            >
              <div class="box">
                <header>
                  <p>
                    <a :href="word.url" :id="'w' + wordIndex" target="_blank">
                      {{ word.title }} [{{ word.gw }}] ({{ word.pos }})</a
                    >
                  </p>
                  <p>{{ word.meaning }}</p>
                </header>
                <h4 v-if="word.orth.length > 0">Orthography</h4>
                <orthography
                  v-for="(orth, orthIndex) in word.orth"
                  :key="orth.w + '_' + orthIndex"
                  v-bind="orth"
                />
                <h4 v-if="word.senses.length > 0">Sense</h4>
                <div v-for="sense in word.senses" :key="sense">
                  <sense>{{ sense }}</sense>
                </div>
                <h4 v-if="word.equivs.length > 0">Equivalents</h4>
                <div v-for="equivs in word.equivs" :key="equivs">
                  <equivs>{{ equivs }}</equivs>
                </div>
                <h4 v-if="Object.keys(word.phrases).length > 0">Phrase</h4>
                <div
                  v-for="(phrase, phraseIndex) in word.phrases"
                  :key="phrase.title + '_' + wordIndex + '_' + phraseIndex"
                >
                  <phrase :phrase="phrase" />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <b-pagination v-model="page" :total="maxPage" :per-page="1" />
    </section>
  </div>
</template>

<script>
import _ from "lodash";
import Mark from "mark.js";
import Orthography from "../components/Orthography.vue";
import Sense from "../components/Sense.vue";
import Equivs from "../components/Equivs.vue";
import Phrase from "../components/Phrase.vue";
import useURLQuery from "../useURLQuery";

function markRegex(keyword) {
  var re = keyword.trim();
  re = re.replace(/sz/g, "(sz|š)");
  re = re.replace(/j/g, "(j|ŋ)");
  re = re.replace(/s,/g, "(s,|ṣ)");
  re = re.replace(/t,/g, "(t,|ṭ)");
  re = re.replace(/h/g, "(h|ḫ)");
  re = re.replace(/0/g, "(0|₀)");
  re = re.replace(/1/g, "(1|₁)");
  re = re.replace(/2/g, "(2|₂)");
  re = re.replace(/3/g, "(3|₃)");
  re = re.replace(/4/g, "(4|₄)");
  re = re.replace(/5/g, "(5|₅)");
  re = re.replace(/6/g, "(6|₆)");
  re = re.replace(/7/g, "(7|₇)");
  re = re.replace(/8/g, "(8|₈)");
  re = re.replace(/9/g, "(9|₉)");
  re = re.replace(/x/g, "(x|ₓ)");
  re = re.replace(/a/g, "[aāâ]");
  re = re.replace(/i/g, "[iîī]");
  re = re.replace(/u/g, "[uûū]");
  re = re.replace(/e/g, "[eêē]");
  re = re.split(/\s+/).join(")|(");
  return new RegExp(`(${re})`, "gi");
}

export default {
  mixins: [useURLQuery],
  name: "Search",
  data() {
    return {
      searchCount: 0,
      input: "",
      index: null,
      results: [],
      totalFound: 0,
      maxPage: 0,
      page: 0,
      searching: false,
      searchTarget: ["title", "meaning", "orth", "sense", "equiv"],
    };
  },
  urlSyncedData: {
    input: {
      type: String,
    },
  },
  components: {
    Orthography,
    Sense,
    Equivs,
    Phrase,
  },
  created: function () {
    this.debouncedSearch = _.debounce(this.incrementalSearch, 200);
    if (this.text) {
      this.input = this.text;
    }
  },
  watch: {
    input: function () {
      this.page = 1;
      this.debouncedSearch();
    },
    page: function () {
      this.debouncedSearch();
    },
    searchTarget() {
      this.debouncedSearch();
    },
  },
  mounted() {},

  methods: {
    incrementalSearch: function () {
      let searchStart = 0;
      var performance;
      if (window.performance) {
        performance = window.performance;
        searchStart = window.performance.now();
      }

      this.searchCount++;
      let count = this.searchCount;
      let input = this.input;
      const query = new URLSearchParams({
        text: input,
        targets: this.searchTarget,
        page: this.page - 1,
        perpage: 20,
      });

      this.searching = true;
      fetch("/api/search?" + query)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (count !== this.searchCount) {
            console.log("cancel:%s, %s", count, this.searchCount);
            return;
          }

          if (performance) {
            let elapsed = Math.round(performance.now() - searchStart);

            console.log(elapsed);
            this.$gtag.time({
              name: "serch",
              value: elapsed,
              event_category: "Word Search",
            });
          }
          this.$gtag.event("search", {
            event_category: "engagement",
            event_label: `${this.searchTarget}`,
          });

          this.searching = false;

          this.maxPage = data.maxpage;
          this.results = data.data;
          this.totalFound = data.total;

          let mark = (index) => {
            if (count !== this.searchCount) return;
            if (index < this.resultView.length) {
              var instance = new Mark("#result_" + index);
              instance.unmark({
                done: () => {
                  instance.markRegExp(markRegex(this.input), {
                    done: () => setTimeout(() => mark(index + 1), 10),
                  });
                },
              });
            }
          };

          setTimeout(() => {
            mark(0);
          }, 10);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    url: function (word) {
      const id = word.url[0].match(/o[0-9]+/)[0];
      return `http://oracc.iaas.upenn.edu/epsd2/cbd/sux/${id}.html`;
    },
  },
  computed: {
    resultView() {
      return this.results.slice(0, 50);
    },
  },
};
</script>
<style lang="scss">
mark {
  background: linear-gradient(transparent 80%, orange 80%);
}
</style>
<style lang="scss" scoped>
h4 {
  margin-top: 0.5rem;
  text-decoration: underline;
}

li {
  margin-top: 1rem;
}
li:first-child {
  margin-top: 0;
}

.p-1 {
  padding: 1em;
}
.sidebar-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  // min-height: 100vh;
  .sidebar-layout {
    display: flex;
    flex-direction: row;
    min-height: 100%;
    // min-height: 100vh;
  }
}
@media screen and (max-width: 1023px) {
  .b-sidebar {
    .sidebar-content {
      &.is-mini-mobile {
        &:not(.is-mini-expand),
        &.is-mini-expand:not(:hover) {
          .menu-list {
            li {
              a {
                span:nth-child(2) {
                  display: none;
                }
              }
              ul {
                padding-left: 0;
                li {
                  a {
                    display: inline-block;
                  }
                }
              }
            }
          }
          .menu-label:not(:last-child) {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
@media screen and (min-width: 1024px) {
  .b-sidebar {
    .sidebar-content {
      &.is-mini {
        &:not(.is-mini-expand),
        &.is-mini-expand:not(:hover) {
          .menu-list {
            li {
              a {
                span:nth-child(2) {
                  display: none;
                }
              }
              ul {
                padding-left: 0;
                li {
                  a {
                    display: inline-block;
                  }
                }
              }
            }
          }
          .menu-label:not(:last-child) {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
.is-mini-expand {
  .menu-list a {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
