const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { query } = require("../../helpers/query.js");
const nodecron = require("node-cron");

puppeteer.use(StealthPlugin());

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

const setupRarities = async (page, game) => {
  console.log(`Fetching ${game.name} rarities...`);

  await page.goto(game.cm_url);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.waitForSelector(".d-grid button");
  await page.$eval(".d-grid button", (btn) => btn.click());
  await page.waitForSelector('select[name="idRarity"]');

  const rarities = await page.evaluate(() => {
    const options = document.querySelectorAll('select[name="idRarity"] option');
    return Array.from(options)
      .filter((o) => o.value !== "0")
      .map((o) => ({
        cm_rarity_id: parseInt(o.value),
        name: o.textContent.trim(),
      }));
  });

  for (const rarity of rarities) {
    await query(
      `INSERT INTO rarity (game_id, name, cm_rarity_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), cm_rarity_id = VALUES(cm_rarity_id)`,
      [game.game_id, rarity.name, rarity.cm_rarity_id],
    );
  }

  console.log(`${game.name}: ${rarities.length} rarities saved!`);
};

const runRaritySetup = async () => {
  console.log("Starting rarity setup...");

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
      await setupRarities(page, game);
    } catch (err) {
      console.error(`${game.name} rarities failed, skipping...`, err.message);
    }
  }

  await browser.close();
  console.log("Rarity setup complete!");
};

nodecron.schedule("0 7 1 * *", async () => {
  await runRaritySetup();
});

//runRaritySetup();

module.exports = { runRaritySetup };
