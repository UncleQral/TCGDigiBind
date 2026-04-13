const express = require("express");
const { query, handleError } = require("../helpers/query");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const game_id = req.query.game_id;
    const expansion_id = req.query.expansion_id;

    const results = await query(
      `SELECT sp.id, sp.name, sp.cardmarket_id, sp.expansion_id,
              sp.category_id, sp.category_name,
              e.name AS expansion_name, e.cm_expansion_id,
              COALESCE(spr.trend_price, 0) AS trend_price,
              COALESCE(spr.avg_sell, 0) AS avg_sell
       FROM sealed_prod sp
       LEFT JOIN expansion e ON sp.expansion_id = e.id
       LEFT JOIN sealed_price spr ON spr.sealed_id = sp.id
       WHERE e.game_id = ? AND sp.expansion_id = ?`,
      [game_id, expansion_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
