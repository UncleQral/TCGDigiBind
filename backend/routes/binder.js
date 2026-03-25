const express = require("express");
const { query, handleError } = require("../helpers/query.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const results = await query("SELECT * FROM binder WHERE user_id = ?", [
      user_id,
    ]);

    res.json(results);
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
