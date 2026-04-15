const express = require("express");
const { query, handleError } = require("../helpers/query.js");

const auth = require("../middleware/auth.js");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const binder_id = req.query.binder_id;
    const user_id = req.user.id;

    const results = await query(
      `SELECT bs.id, bs.quantity, bs.image_url,
              sp.name, sp.category_name,
              COALESCE(spr.trend_price, 0) AS trend_price,
              COALESCE(spr.avg_sell, 0) AS avg_sell
       FROM binder_sealed bs
       JOIN sealed_prod sp ON bs.sealed_id = sp.id
       LEFT JOIN sealed_price spr ON spr.sealed_id = sp.id
       JOIN binder b ON bs.binder_id = b.id
       WHERE bs.binder_id = ? AND b.user_id = ?`,
      [binder_id, user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { binder_id, sealed_id, quantity, image_url } = req.body;

    const results = await query(
      "INSERT INTO binder_sealed (binder_id, sealed_id, quantity, image_url) VALUES (?, ?, ?, ?)",
      [binder_id, sealed_id, quantity, image_url || null],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;