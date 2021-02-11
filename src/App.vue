<template>
  <div id="app">
    <div>
      <b-navbar spaced shadow>
        <template #brand>
          <b-navbar-item tag="div">
            Ḫubur
          </b-navbar-item>
        </template>
        <template #start> </template>
        <template #end>
          <b-navbar-item href="https://blog.kurnugia.com">Blog</b-navbar-item>
          <b-navbar-item href="https://app.kurnugia.com"
            >KUR.NU.GI₄.A</b-navbar-item
          >
          <b-navbar-item href="https://qantuppi.kurnugia.com"
            >qantuppi</b-navbar-item
          >
        </template>
      </b-navbar>
      <div class="container">
        <section class="hero">
          <div class="hero-body">
            <p class="title"><span class="cuneiform">𒄷𒁍𒌫</span> [Ḫubur]</p>
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
        <p>
          Ḫubur's source code is licensed under MIT.
          <a href="https://github.com/uyumyuuy/hubur">
            <b-icon pack="fab" icon="github"> </b-icon>
            <span> </span>
          </a>
        </p>
        <p>This site is powered by <a href="https://vercel.com">Vercel</a>.</p>
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
  font-family: "Source Sans Pro", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.cuneiform {
  font-family: "Segoe UI histric", "Noto Sans Cuneiform";
}

div.navbar-item {
  font-weight: bold;
  font-size: 120%;
}

a.navbar-item:hover {
  background-color: gray;
}
a.navbar-item::after {
  content: "";
  position: absolute;
  width: 0px;
  height: 5px;
  left: 50%;
  bottom: 0;
  background-color: gray;
  transition: all ease-in-out 0.2s;
}
a.navbar-item:hover::after {
  width: 100%;
  left: 0;
}
</style>
