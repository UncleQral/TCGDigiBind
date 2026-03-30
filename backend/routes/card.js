const express = require("express");
const { query, handleError } = require("../helpers/query.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const card_id = req.query.card_id;

    const results = await query("SELECT * FROM card WHERE card_id = ?", [
      card_id,
    ]);

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/search", auth, async (req, res) => {
  try {
    const { name, game_id, expansion_id } = req.query;

    let sql = `SELECT c.*, e.name AS expansion_name, e.game_id, e.cm_expansion_id,
                      cp.avg_sell, cp.trend_price, cp.avg1, cp.avg7, cp.avg30, cp.foil_sell
               FROM card c
               JOIN expansion e ON c.expansion_id = e.id
               LEFT JOIN card_price cp ON cp.card_id = c.id
               WHERE 1=1`;
    const params = [];

    if (name) {
      sql += " AND c.name LIKE ?";
      params.push(`%${name}%`);
    }

    if (game_id) {
      sql += " AND e.game_id = ?";
      params.push(game_id);
    }

    if (expansion_id) {
      sql += " AND c.expansion_id = ?";
      params.push(expansion_id);
    }

    sql += " LIMIT 50";

    const results = await query(sql, params);
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, expansion_id, cardmarket_id } = req.body;
    const results = await query(
      "INSERT INTO card (name, expansion_id, cardmarket_id) VALUES (?, ?, ?)",
      [name, expansion_id, cardmarket_id],
    );
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const card_id = req.params.id;

    const results = await query("DELETE FROM card WHERE card_id = ?", [
      card_id,
    ]);

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/:card_id", auth, async (req, res) => {
  try {
    const card_id = req.params.card_id;
    const { name, expansion_id, cardmarket_id } = req.body;
    const results = await query(
      "UPDATE card SET name = ?, expansion_id = ?, cardmarket_id = ? WHERE card_id = ?",
      [name, expansion_id, cardmarket_id, card_id],
    );
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
