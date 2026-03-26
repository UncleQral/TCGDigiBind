const { query, handleError } = require("../helpers/query.js");
const express = require("express");
const router = express.Router();

router.get("/:game_id", async (req, res) => {
  try {
    const expansions = await query(
      "SELECT id, name FROM expansion WHERE game_id = ?",
      [req.params.game_id],
    );
    res.json(expansions);
  } catch (err) {
    handleError(res, err);
  }
});
module.exports = router;
