const express = require("express");
const {query, handleError} = require ("../helpers/query");
const auth = require ("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const game_id = req.query.game_id;
    const expansion_id = req.query.expansion_id

    const results = await query("SELECT * FROM sealed_prod LEFT JOIN expansion ON sealed_prod.expansion_id = expansion.id WHERE expansion.game_id = ? AND sealed_prod.expansion_id = ?", [
      game_id, expansion_id
    ]);

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports =router;