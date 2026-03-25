const express = require("express");
const { query, handleError } = require("../helpers/query.js");

const auth = require("../middleware/auth.js");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const id = req.query.id;
    const user_id = req.query.user_id;

    const results = await query(
      "SELECT * FROM sealed_prod WHERE id = ? AND user_id = ?",
      [id, user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const type = req.body.type;
    const name = req.body.name;
    const cardmarket_id = req.body.cardmarket_id;

    const results = await query(
      "INSERT INTO sealed_prod (user_id, type, name, cardmarket_id) VALUES (?, ?, ?, ?)",
      [user_id, type, name, cardmarket_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const id = req.body.id;
    const user_id = req.body.user_id;

    const results = await query(
      "DELETE FROM sealed_prod WHERE id = ? AND user_id = ?",
      [id, user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
