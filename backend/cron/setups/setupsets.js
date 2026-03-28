const puppeteer = require("puppeteer");
const { query } = require("../../helpers/query.js");
const nodecron = require("node-cron");

const GAMES = [
  {
    game_id: 1,
    name: "Magic",
    cm_url: "https://www.cardmarket.com/en/Magic/Products/Singles",
  },
  {
    game_id: 2,
    name: "Pokemon",
    cm_url: "https://www.cardmarket.com/en/Pokemon/Products/Singles",
  },
  {
    game_id: 3,
    name: "YuGiOh",
    cm_url: "https://www.cardmarket.com/en/YuGiOh/Products/Singles",
  },
  {
    game_id: 4,
    name: "One Piece",
    cm_url: "https://www.cardmarket.com/en/OnePiece/Products/Singles",
  },
  {
    game_id: 5,
    name: "Lorcana",
    cm_url: "https://www.cardmarket.com/en/Lorcana/Products/Singles",
  },
  {
    game_id: 6,
    name: "Riftbound",
    cm_url: "https://www.cardmarket.com/en/Riftbound/Products/Singles",
  },
];

const setupGame = async (page, game) => {
  console.log(`Fetching ${game.name} expansions...`);

  await page.goto(game.cm_url);
  await page.waitForSelector('select[name="idExpansion"]');

  const expansions = await page.evaluate(() => {
    const options = document.querySelectorAll(
      'select[name="idExpansion"] option',
    );
    return Array.from(options)
      .filter((o) => o.value !== "0")
      .map((o) => ({ cm_expansion_id: o.value, name: o.textContent.trim() }));
  });

  for (const exp of expansions) {
    await query(
      `INSERT INTO expansion (game_id, name, cm_expansion_id) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [game.game_id, exp.name, exp.cm_expansion_id],
    );
  }

  console.log(`${game.name}: ${expansions.length} expansions saved!`);
};

const runSetup = async () => {
  console.log("Starting setup...");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ],
  });

  const page = await browser.newPage();

  for (const game of GAMES) {
    try {
      await setupGame(page, game);
    } catch (err) {
      console.error(`${game.name} failed, skipping...`, err.message);
    }
  }

  await browser.close();
  console.log("Setup complete!");
};

nodecron.schedule("0 6 1 * *", async () => {
  await runSetup();
});

//runSetup();

module.exports = { runSetup };
