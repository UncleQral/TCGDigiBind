const nodecron = require("node-cron");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());
const dotenv = require("dotenv");
const { query } = require("../helpers/query.js");
const path = require("path");
const fs = require("fs");

dotenv.config();

const PRICE_GUIDE_URLS = [
  { game: "Magic the Gathering", url: "price_guide_1.json" },
  { game: "Pokémon", url: "price_guide_6.json" },
  { game: "YuGiOh", url: "price_guide_3.json" },
  { game: "One Piece", url: "price_guide_18.json" },
  { game: "Lorcana", url: "price_guide_19.json" },
  { game: "Riftbound", url: "price_guide_22.json" },
  { game: "Flesh and Blood", url: "price_guide_16.json" },
  { game: "Star Wars Unlimited", url: "price_guide_21.json" },
  { game: "Digimon", url: "price_guide_17.json" },
  { game: "Dragon Ball Super", url: "price_guide_13.json" },
  { game: "Cardfight Vanguard", url: "price_guide_8.json" },
  { game: "Weiß Schwarz", url: "price_guide_10.json" },
  { game: "Final Fantasy", url: "price_guide_9.json" },
  { game: "Force of Will", url: "price_guide_7.json" },
  { game: "Battle Spirits Saga", url: "price_guide_20.json" },
  { game: "World of Warcraft", url: "price_guide_2.json" },
  { game: "Star Wars Destiny", url: "price_guide_15.json" },
  { game: "Dragoborne", url: "price_guide_11.json" },
  { game: "My Little Pony", url: "price_guide_12.json" },
  { game: "The Spoils", url: "price_guide_5.json" },
  { game: "Accessories", url: "price_guide_accessories.json" },
];

nodecron.schedule("0 5 * * *", async () => {
  await testRun();

  await processFiles();
});

const testRun = async () => {
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

  await page.goto("https://www.cardmarket.com/en/Magic");
  await page.waitForSelector('[name="username"]');

  await page.type('[name="username"]', process.env.CM_USERNAME);
  await page.type('[name="userPassword"]', process.env.CM_PASSWORD);
  await page.click('[type="submit"]');

  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("Logged in!");

  const baseUrl =
    "https://downloads.s3.cardmarket.com/productCatalog/priceGuide/";

  const client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.join(__dirname, "../downloads"),
  });

  for (const game of PRICE_GUIDE_URLS) {
    const url = baseUrl + game.url;
    await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`${game.game} downloaded!`);
  }

  await new Promise((resolve) => setTimeout(resolve, 5000));
};

const processFiles = async () => {
  try {
    const cardRows = await query("SELECT card_id, cardmarket_id FROM card");
    const cardmarketToId = new Map(
      cardRows.map((row) => [row.cardmarket_id, row.card_id]),
    );

    const sealedRows = await query("SELECT id, cardmarket_id FROM sealed_prod");
    const sealedmarketToId = new Map(
      sealedRows.map((row) => [row.cardmarket_id, row.id]),
    );

    const files = fs.readdirSync(path.join(__dirname, "../downloads"));

    for (const file of files) {
      if (!file.startsWith("price_guide")) continue;

      const content = fs.readFileSync(
        path.join(__dirname, "../downloads", file),
        "utf8",
      );
      const data = JSON.parse(content);
      const date = new Date(data.createdAt).toISOString().split("T")[0];

      const cardRows = [];
      const sealedRows = [];

      for (const entry of data.priceGuides) {
        const cardId = cardmarketToId.get(entry.idProduct);
        if (cardId !== undefined) {
          cardRows.push([
            cardId,
            entry.avg,
            entry.low,
            entry.trend,
            entry.avg1,
            entry.avg7,
            entry.avg30,
            entry["avg-foil"],
            entry["low-foil"],
            entry["trend-foil"],
            entry["avg1-foil"],
            entry["avg7-foil"],
            entry["avg30-foil"],
            date,
          ]);
          continue;
        }

        const sealedId = sealedmarketToId.get(entry.idProduct);
        if (sealedId !== undefined) {
          sealedRows.push([
            sealedId,
            entry.avg,
            entry.low,
            entry.trend,
            entry.avg1,
            entry.avg7,
            entry.avg30,
            date,
          ]);
        }
      }

      for (let i = 0; i < cardRows.length; i += 1000) {
        const chunk = cardRows.slice(i, i + 1000);
        await query(
          `INSERT INTO card_price (card_id, avg_sell, low_price, trend_price, avg1, avg7, avg30, foil_sell, foil_low, foil_trend, foil_avg1, foil_avg7, foil_avg30, date)
           VALUES ?
           ON DUPLICATE KEY UPDATE
           avg_sell = VALUES(avg_sell), low_price = VALUES(low_price), trend_price = VALUES(trend_price),
           avg1 = VALUES(avg1), avg7 = VALUES(avg7), avg30 = VALUES(avg30),
           foil_sell = VALUES(foil_sell), foil_low = VALUES(foil_low), foil_trend = VALUES(foil_trend),
           foil_avg1 = VALUES(foil_avg1), foil_avg7 = VALUES(foil_avg7), foil_avg30 = VALUES(foil_avg30),
           date = VALUES(date)`,
          [chunk],
        );
      }

      for (let i = 0; i < sealedRows.length; i += 1000) {
        const chunk = sealedRows.slice(i, i + 1000);
        await query(
          `INSERT INTO sealed_price (sealed_id, avg_sell, low_price, trend_price, avg1, avg7, avg30, date)
           VALUES ?
           ON DUPLICATE KEY UPDATE
           avg_sell = VALUES(avg_sell), low_price = VALUES(low_price), trend_price = VALUES(trend_price),
           avg1 = VALUES(avg1), avg7 = VALUES(avg7), avg30 = VALUES(avg30),
           date = VALUES(date)`,
          [chunk],
        );
      }

      fs.unlinkSync(path.join(__dirname, "../downloads", file));
      console.log(
        `${file}: ${cardRows.length} card prices, ${sealedRows.length} sealed prices inserted!`,
      );
    }
  } catch (err) {
    console.error("Price update error: ", err);
  }
};
testRun().then(() => processFiles());
