const express = require("express");
const { query, handleError } = require("../helpers/query.js");

const auth = require("../middleware/auth.js");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const binder_id = req.query.binder_id;
    const user_id = req.user.id;

    const results = await query(
      `SELECT bc.*,
              c.name, c.cardmarket_id, c.expansion_id,
              cp.avg_sell, cp.trend_price, cp.avg1, cp.avg7, cp.avg30, cp.foil_sell
       FROM binder_card bc
       JOIN binder b ON bc.binder_id = b.id
       JOIN card c ON bc.card_id = c.card_id
       LEFT JOIN card_price cp ON cp.card_id = c.card_id
       WHERE bc.binder_id = ? AND b.user_id = ?`,
      [binder_id, user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const {
      binder_id,
      card_id,
      quantity,
      condition_of_card,
      status,
      foil,
      image_url,
    } = req.body;
    const user_id = req.user.id;

    if(binder_id !== null){
      const binder = await query(
            "SELECT id FROM binder WHERE id = ? AND user_id = ?",
            [binder_id, user_id],
          );
        if (binder.length === 0)
         return res.status(403).json({ message: "Forbidden" });
    }
    
    const results = await query(
      "INSERT INTO binder_card (binder_id, card_id, quantity, condition_of_card, status, foil, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        binder_id,
        card_id,
        quantity,
        condition_of_card,
        status,
        foil,
        image_url,
      ],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const id = req.body.id;
    const user_id = req.user.id;

    const results = await query(
      `DELETE bc FROM binder_card bc
         JOIN binder b ON bc.binder_id = b.id
         WHERE bc.id = ? AND b.user_id = ?`,
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
    const condition_of_card = req.body.condition_of_card;
    const status = req.body.status;
    const foil = req.body.foil;
    const user_id = req.user.id;

    const results = await query(
      `UPDATE binder_card bc
         JOIN binder b ON bc.binder_id = b.id
         SET bc.condition_of_card = ?, bc.status = ?, bc.foil = ?
         WHERE bc.id = ? AND b.user_id = ?`,
      [condition_of_card, status, foil, id, user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});
module.exports = router;
