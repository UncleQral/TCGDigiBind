const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const path = require("path");
const nodecron = require("node-cron");
const dotenv = require("dotenv");

dotenv.config({ path: __dirname + "/../.env" });
puppeteer.use(StealthPlugin());

const BASE_URL =
  "https://downloads.s3.cardmarket.com/productCatalog/productList/";

const PRODUCTS = [
  { game: "Magic", id: 1 },
  { game: "Pokemon", id: 6 },
  { game: "YuGiOh", id: 3 },
  { game: "One Piece", id: 18 },
  { game: "Lorcana", id: 19 },
  { game: "Riftbound", id: 22 },
];

const downloadProducts = async () => {
  console.log("Downloading product catalogs...");

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
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await page.waitForSelector('[name="username"]', { timeout: 15000 });
  await page.type('[name="username"]', process.env.CM_USERNAME);
  await page.type('[name="userPassword"]', process.env.CM_PASSWORD);
  await page.click('[type="submit"]');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("Logged in!");

  const client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.join(__dirname, "../downloads"),
  });

  for (const product of PRODUCTS) {
    const singlesUrl = BASE_URL + `products_singles_${product.id}.json`;
    const nonsinglesUrl = BASE_URL + `products_nonsingles_${product.id}.json`;

    await page
      .goto(singlesUrl, { waitUntil: "domcontentloaded" })
      .catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`${product.game} singles downloaded!`);

    await page
      .goto(nonsinglesUrl, { waitUntil: "domcontentloaded" })
      .catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`${product.game} non-singles downloaded!`);
  }

  await new Promise((resolve) => setTimeout(resolve, 5000));
  await browser.close();
  console.log("All product catalogs downloaded!");
};

nodecron.schedule("0 4 1 * *", async () => {
  await downloadProducts();
});

//downloadProducts();

module.exports = { downloadProducts };
