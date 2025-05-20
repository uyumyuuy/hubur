<template>
  <div class="phrase">
    <h5><trans-literal :text="phrase.title" /></h5>
    <div
      class="phrase-line"
      v-for="(line, lineIndex) in phrase.lines"
      :key="line.sum + '_' + lineIndex"
    >
      <div class="columns is-mobile is-vcentered">
        <p class="column"><trans-literal :text="line.sum" /></p>
        <p class="column"><trans-literal akkadian :text="line.akk" /></p>
      </div>
    </div>
  </div>
</template>

<script>
import TransLiteral from "./Transliteral.vue";
export default {
  name: "Phrase",
  props: {
    phrase: Object,
  },
  components: {
    TransLiteral,
  },
};
</script>

<style lang="sass" scoped>
h5
    font-weight: bold

.phrase
    margin-top: 1rem
    margin-left: 2rem
.phrase :first-child
    margin-top: 0px

.phrase-line
    margin-left: 2rem
    border-bottom: solid 1px lightgray

div.phrase-line:last-child
    border-bottom: none
</style>
