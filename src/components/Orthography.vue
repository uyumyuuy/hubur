<template>
  <div class="orthography">
    <div class="columns is-mobile is-vcentered">
      <p class="cuneiform column">{{ cuneiform }}</p>
      <p class="cuneiform column"><trans-literal :text="w" /></p>
    </div>
  </div>
</template>

<script>
import TransLiteral from "./Transliteral.vue";
export default {
  name: "Orthography",
  props: {
    cuneiform: String,
    w: String,
  },
  components: {
    TransLiteral,
  },
};
</script>

<style lang="sass">
.orthography
    margin-left: 2rem
    border-bottom: solid 1px lightgray

div.orthography:last-child
    border-bottom: none

.cuneiform
  font-family: "Segoe UI histric", "Noto Sans Cuneiform"
</style>
