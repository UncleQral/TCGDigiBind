const { query, handleError } = require("../helpers/query.js");
const express = require("express");
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const conditions = await query("SELECT name FROM `card_condition`");
    res.json(conditions);
  } catch (err) {
    handleError(res, err);
  }
});
module.exports = router;
