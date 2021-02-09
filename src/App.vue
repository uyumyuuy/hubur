<template>
  <div id="app">
    <div>
      <b-navbar spaced shadow>
        <template #brand>
          <b-navbar-item>
            <span>Ḫubur</span>
          </b-navbar-item>
        </template>
        <template #start>
          <b-navbar-item href="https://blog.kurnugia.com">Blog</b-navbar-item>
          <b-navbar-item href="https://app.kurnugia.com"
            >KUR.NU.GI4.A</b-navbar-item
          >
          <b-navbar-item href="https://qantuppi.kurnugia.com"
            >qantuppi</b-navbar-item
          >
        </template>
        <template #end> </template>
      </b-navbar>
      <div class="container">
        <section class="hero">
          <div class="hero-body">
            <p class="title"><span class="cuneiform">𒄷𒁓</span> Ḫubur</p>
            <p class="subtitle">
              Unofficial EPSD2 Rapid Searcher
            </p>
          </div>
        </section>
        <Search />
      </div>
    </div>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>Developed by <a href="https://twitter.com/uyum">uyum</a></p>
        <p>
          This application uses the data provided by
          <a href="http://oracc.museum.upenn.edu/epsd2/index.html">ePSD2</a>(The
          electronic Pennsylvania Sumerian Dictionary) under the
          <a href="http://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA</a>
          license.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import Search from "./components/Search.vue";

export default {
  name: "App",
  components: {
    Search,
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
