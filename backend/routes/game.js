const { query, handleError } = require("../helpers/query.js");
const express = require("express");
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const games = await query("SELECT id, name FROM game");
    res.json(games);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
