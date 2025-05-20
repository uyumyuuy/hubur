import Search from "@/../api/search.js";

describe("search.js", () => {
  it("renders props.msg when passed", () => {
    let data = Search({ query: { text: "a" } }, { json: () => null });
    console.log(data);
  });
});
