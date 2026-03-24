const express = require("express");
const { query, handleError } = require("../helpers/query.js");
const auth = require("../middleware/auth.js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const results = await query("SELECT * FROM user WHERE email = ?", [email]);

    if (results.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ message: "Wrong Password!" });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    delete user.password;

    res.json({ token, user });
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/register", async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);

    const results = await query(
      "INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
    );

    res.json(results);
  } catch (err) {
    if (err.errno === 1062) {
      return res.status(409).json({ message: "Email already in use" });
    }
    handleError(res, err);
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const user_id = req.body.user_id;

    const results = await query("DELETE FROM user WHERE id = ?", [user_id]);

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const email = req.body.email;

    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 10);

    const results = await query(
      "UPDATE user SET email = ?, password = ? WHERE id = ?",
      [email, hashedPassword, user_id],
    );

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
