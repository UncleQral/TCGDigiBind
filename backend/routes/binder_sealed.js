const express = require("express");
const { query, handleError } = require("../helpers/query.js");

const auth = require("../middleware/auth.js");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const { binder_id, singles } = req.query;
    const user_id = req.user.id;

    if (singles === "true") {
      const results = await query(
        `SELECT bs.id, bs.quantity, bs.image_url,
                sp.name, sp.category_name,
                COALESCE(spr.trend_price, 0) AS trend_price,
                COALESCE(spr.avg_sell, 0) AS avg_sell
         FROM binder_sealed bs
         JOIN sealed_prod sp ON bs.sealed_id = sp.id
         LEFT JOIN sealed_price spr ON spr.sealed_id = sp.id
         WHERE bs.binder_id IS NULL AND bs.user_id = ?`,
        [user_id],
      );
      return res.json(results);
    }

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
    const user_id = req.user.id;

    if (binder_id !== null && binder_id !== undefined) {
      const binder = await query(
        "SELECT id FROM binder WHERE id = ? AND user_id = ?",
        [binder_id, user_id],
      );
      if (binder.length === 0)
        return res.status(403).json({ message: "Forbidden" });
    }

    const results = await query(
      "INSERT INTO binder_sealed (binder_id, sealed_id, quantity, image_url, user_id) VALUES (?, ?, ?, ?, ?)",
      [binder_id || null, sealed_id, quantity, image_url || null, user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;