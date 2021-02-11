<template>
  <span class="transliteral" v-html="Transliteral"></span>
</template>

<script>
export default {
  name: "TransLiteral",
  props: {
    text: String,
    akkadian: Boolean,
  },
  computed: {
    Transliteral() {
      let text = "";
      var lower = false;
      if (this.akkadian) {
        for (let i = 0; i < this.text.length; i++) {
          let letter = this.text[i];
          if (letter !== letter.toUpperCase()) {
            if (!lower) {
              text += "<i>";
              lower = true;
            }
          } else {
            if (lower) {
              text += "</i>";
              lower = false;
            }
          }
          text += letter;
        }
        if (lower) {
          text += "</span>";
        }
      } else {
        text = this.text;
      }
      let html = text.replace(/{([^}]+)}/g, "<sup>$1</sup>");
      return html;
    },
  },
};
</script>

<style lang="sass">
.transliteral
  font-size: 120%
  font-family: ungkam, "Times New Roman", serif
</style>
