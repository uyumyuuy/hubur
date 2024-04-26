//https://zenn.dev/sa2knight/articles/9bf1b5bca340a6
export default {
  beforeMount() {
    const urlParams = this.$route.query;
    Object.keys(this.urlSyncedData).forEach((key) => {
      // 同期対象パラメータを監視対象にする
      // eslint-disable-next-line no-unused-vars
      this.$watch(key, (_) => this.updateUrlParams());

      // URLパラメータの指定がない場合は、コンポーネント側の初期値をそのまま使う
      if (urlParams[key] === undefined) return;

      // コンポーネント側で設定された、同期対象パラメータ設定を取得
      const typeConstructor = this.urlSyncedData[key].type;
      const validator = this.urlSyncedData[key].validator;

      // 有効なURLパラメータが設定されている場合のみ、コンポーネントの状態を初期化
      const parsedValue = this.parseRawValue(urlParams[key], typeConstructor);
      if (validator === undefined || validator(parsedValue)) {
        this.$set(this, key, parsedValue);
      }
    });
  },
  computed: {
    urlSyncedData() {
      return this.$options.urlSyncedData;
    },
  },
  methods: {
    /**
     * 指定した型コンストラクタに応じて、URLパラメータ内の生データを変換する
     * @param {Number|String|Boolean} rawValue
     * @param {Function} typeConstructor
     * @param {Function=} validator
     */
    parseRawValue(rawValue, typeConstructor) {
      return typeConstructor === Boolean
        ? rawValue === "true"
        : typeConstructor(rawValue);
    },

    /**
     * 最新のコンポーネントの状態を元に、URLパラメータを更新する
     */
    updateUrlParams() {
      const newUrlParams = {};
      Object.keys(this.urlSyncedData).forEach((key) => {
        newUrlParams[key] = `${this.$data[key]}`;
      });

      this.$router.replace({
        ...this.$route,
        query: {
          ...this.$route.query,
          ...newUrlParams,
        },
      });
    },
  },
};
