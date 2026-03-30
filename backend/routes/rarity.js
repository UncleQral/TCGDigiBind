const { query, handleError } = require("../helpers/query.js");
const express = require("express");
const router = express.Router();

router.get("/:game_id", async (req, res) => {
  try {
    const rarities = await query(
      "SELECT id, name FROM rarity WHERE game_id = ?",
      [req.params.game_id],
    );
    res.json(rarities);
  } catch (err) {
    handleError(res, err);
  }
});
module.exports = router;
