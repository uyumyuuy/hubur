<template>
  <p class="equivs">
    <span>Akk. </span> <span class="italic"> <slot /></span>
  </p>
</template>

<script>
export default {
  name: "Equivs",
};
</script>

<style lang="sass" scoped>
.equivs
  margin-left: 2rem
  .italic
    font-family: ungkam,"Times New Roman", serif
    font-style: italic
</style>
