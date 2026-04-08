const express = require("express");
const { query, handleError } = require("../helpers/query.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const results = await query(
      `SELECT b.*, g.id as game_id, 
        COALESCE(SUM(cp.trend_price), 0) as total_value
      FROM binder b
      LEFT JOIN game g ON b.game = g.name
      LEFT JOIN binder_card bc ON bc.binder_id = b.id
      LEFT JOIN card_price cp ON cp.card_id = bc.card_id
      WHERE b.user_id = ?
      GROUP BY b.id`,
      [user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user.id;

    const results = await query(
      `SELECT b.*, g.id as game_id,
        COALESCE(SUM(cp.trend_price), 0) as total_value
      FROM binder b
      LEFT JOIN game g ON b.game = g.name
      LEFT JOIN binder_card bc ON bc.binder_id = b.id
      LEFT JOIN card_price cp ON cp.card_id = bc.card_id
      WHERE b.id = ? AND b.user_id = ?
      GROUP BY b.id`,
      [id, user_id],
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Binder not found" });
    }

    res.json(results[0]);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const name = req.body.name;
    const game = req.body.game;
    const binder_set = req.body.binder_set ?? null;
    const image_url = req.body.image_url ?? null;

    const results = await query(
      "INSERT INTO binder (user_id, name, game, binder_set, image_url) VALUES (?, ?, ?, ?, ?)",
      [user_id, name, game, binder_set, image_url],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user.id;

    const results = await query(
      "DELETE FROM binder WHERE id = ? AND user_id = ?",
      [id, user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const id = req.body.id;
    const user_id = req.user.id;
    const name = req.body.name;
    const game = req.body.game;
    const binder_set = req.body.binder_set ?? null;
    const image_url = req.body.image_url ?? null;

    const results = await query(
      "UPDATE binder SET name = ?, game = ?, binder_set = ?, image_url = ? WHERE id = ? AND user_id = ?",
      [name, game, binder_set, image_url, id, user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
