const { query, handleError } = require("../helpers/query.js");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const gCompanyNames = await query("SELECT id, name FROM grading_company");
    res.json(gCompanyNames);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
