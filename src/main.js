import Vue from "vue";
import App from "./App.vue";
import VueGtag from "vue-gtag";
import "./registerServiceWorker";
import Buefy from "buefy";
import "./assets/scss/app.scss";

import { library } from "@fortawesome/fontawesome-svg-core";
// internal icons
import {
  faCheck,
  faCheckCircle,
  faInfoCircle,
  faExclamationTriangle,
  faExclamationCircle,
  faArrowUp,
  faAngleRight,
  faAngleLeft,
  faAngleDown,
  faEye,
  faEyeSlash,
  faCaretDown,
  faCaretUp,
  faUpload,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faCheck,
  faCheckCircle,
  faInfoCircle,
  faExclamationTriangle,
  faExclamationCircle,
  faArrowUp,
  faAngleRight,
  faAngleLeft,
  faAngleDown,
  faEye,
  faEyeSlash,
  faCaretDown,
  faCaretUp,
  faUpload,
  faSearch,
  faGithub
);
Vue.component("vue-fontawesome", FontAwesomeIcon);

Vue.use(Buefy, {
  defaultIconComponent: "vue-fontawesome",
  defaultIconPack: "fas",
});

Vue.use(VueGtag, {
  config: {
    id: "G-MQRP11FV0F",
    params: {},
  },
});

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
