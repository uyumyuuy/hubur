import source from "../src/assets/epsd2_src.json";

module.exports = (req, res) => {
  const id = Number(req.query.id) || 0;
  console.log(req.query);
  res.json(source[id]);
};
