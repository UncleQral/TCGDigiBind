const express = require("express");
const { query, handleError } = require("../helpers/query.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const results = await query(
      "SELECT * FROM tag_color LEFT JOIN game ON tag_color.game_id = game.id WHERE user_id =?",
      [user_id],
    );
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const game_id = req.body.game_id;
    const color = req.body.color;

    const results = await query(
      "INSERT INTO tag_color (user_id, game_id, color) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE color = ?",
      [user_id, game_id, color, color],
    );
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
