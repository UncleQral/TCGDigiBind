require("dotenv").config();
const { query } = require("../helpers/query.js");
const fs = require("fs");
const path = require("path");
const nodecron = require("node-cron");

const GAMES = [
  { game_id: 1, cm_game_id: 1 },
  { game_id: 2, cm_game_id: 6 },
  { game_id: 3, cm_game_id: 3 },
  { game_id: 4, cm_game_id: 18 },
  { game_id: 5, cm_game_id: 19 },
  { game_id: 6, cm_game_id: 22 },
];

const processNonSingles = async () => {
  const files = fs.readdirSync(path.join(__dirname, "../downloads"));

  for (const file of files) {
    if (!file.startsWith("products_nonsingles_")) continue;

    const cm_game_id = parseInt(
      file.replace("products_nonsingles_", "").replace(".json", ""),
    );
    const game = GAMES.find((g) => g.cm_game_id === cm_game_id);

    if (!game) {
      console.log(`No game found for ${file}, skipping...`);
      continue;
    }

    console.log(`Processing ${file}...`);

    const content = fs.readFileSync(
      path.join(__dirname, "../downloads", file),
      "utf8",
    );
    const data = JSON.parse(content);

    const expansionRows = await query(
      "SELECT id, cm_expansion_id FROM expansion WHERE game_id = ?",
      [game.game_id],
    );
    const expansionMap = new Map(
      expansionRows.map((r) => [r.cm_expansion_id, r.id]),
    );

    const rows = [];
    for (const entry of data.products) {
      const expansion_id = expansionMap.get(entry.idExpansion);
      if (expansion_id === undefined) continue;
      rows.push([
        entry.name,
        entry.idProduct,
        expansion_id,
        entry.idCategory,
        entry.categoryName,
      ]);
    }

    if (rows.length === 0) continue;

    await query(
      `INSERT INTO sealed_prod (name, cardmarket_id, expansion_id, category_id, category_name)
       VALUES ?
       ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       expansion_id = VALUES(expansion_id),
       category_id = VALUES(category_id),
       category_name = VALUES(category_name)`,
      [rows],
    );
    console.log(`${file}: ${rows.length} sealed products inserted!`);
  }
};

nodecron.schedule("0 5 1 * *", async () => {
  await processNonSingles();
});

//processNonSingles();

module.exports = { processNonSingles };
