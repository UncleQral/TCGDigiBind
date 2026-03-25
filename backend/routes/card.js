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

router.post("/", auth, async (req, res) => {
  try {
    const { name, expansion_id, rarity_id, cardmarket_id } = req.body;
    const results = await query(
      "INSERT INTO card (name, expansion_id, rarity_id, cardmarket_id) VALUES (?, ?, ?, ?)",
      [name, expansion_id, rarity_id, cardmarket_id],
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
    const { name, expansion_id, rarity_id, cardmarket_id } = req.body;
    const results = await query(
      "UPDATE card SET name = ?, expansion_id = ?, rarity_id = ?, cardmarket_id = ? WHERE card_id = ?",
      [name, expansion_id, rarity_id, cardmarket_id, card_id],
    );
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
