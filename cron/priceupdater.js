const nodecron = require("node-cron");
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
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
  console.log("Test started...");

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.cardmarket.com/en/Magic");
  await page.waitForSelector('[name="username"]');

  console.log("Email: ", process.env.CM_EMAIL);
  console.log("Email: ", process.env.CM_PASSWORD);

  await page.type('[name="username"]', process.env.CM_EMAIL);
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

const processFiles = async ()=> {
    try{
        const cardIds = await query("SELECT DISTINCT card_id FROM binder_card");
        const relevantIds = new Set(cardIds.map((row) => row.card_id));

        const files = fs.readdirSync(path.join(__dirname, "../downloads"));

        for (const file of files) {
            const content = fs.readFileSync(
            path.join(__dirname, "../downloads", file),
            "utf8",
            );
            const data = JSON.parse(content);

            for (const entry of data.priceGuides) {
            if (relevantIds.has(entry.idProduct)) {
                await query(
                `INSERT INTO card_price (card_id, avg_sell, low_price, trend_price, avg1, avg7, avg30, foil_sell, foil_low, foil_trend, foil_avg1, foil_avg7, foil_avg30, date)
                        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        avg_sell = VALUES(avg_sell), low_price = VALUES(low_price), trend_price = VALUES(trend_price),
                        avg1 = VALUES(avg1), avg7 = VALUES(avg7), avg30 = VALUES(avg30),
                        foil_sell = VALUES(foil_sell), foil_low = VALUES(foil_low), foil_trend = VALUES(foil_trend),
                        foil_avg1 = VALUES(foil_avg1), foil_avg7 = VALUES(foil_avg7), foil_avg30 = VALUES(foil_avg30),
                        date = VALUES(date)`,
                [
                    entry.idProduct,
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
                    data.createdAt,
                ],
                );
            }
            }
            fs.unlinkSync(path.join(__dirname, "../downloads", file));
            console.log(`${file} processed and deleted!`);
        }
    }
    catch(err){
        console.error("Price update error: ",err);
    }
}