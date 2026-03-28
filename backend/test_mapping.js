const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

const scrapeExpansions = async () => {
  console.log("Username:", process.env.CM_USERNAME);
  console.log("Password:", process.env.CM_PASSWORD);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.cardmarket.com/en/Pokemon");
  await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 sekunden warten
  await page.waitForSelector('[name="username"]', { timeout: 15000 });

  await page.type('[name="username"]', process.env.CM_USERNAME);
  await page.type('[name="userPassword"]', process.env.CM_PASSWORD);
  await page.click('[type="submit"]');

  await new Promise((resolve) => setTimeout(resolve, 3000));

  await page.goto("https://www.cardmarket.com/en/Pokemon/Products/Singles");
  await page.waitForSelector('select[name="idExpansion"]');

  const expansions = await page.evaluate(() => {
    const options = document.querySelectorAll(
      'select[name="idExpansion"] option',
    );
    return Array.from(options)
      .filter((o) => o.value !== "0") // "All" option rausfiltern
      .map((o) => ({ id: o.value, name: o.textContent.trim() }));
  });

  fs.writeFileSync(
    path.join(__dirname, "expansion_mapping.json"),
    JSON.stringify(expansions, null, 2),
  );

  console.log(`Found ${expansions.length} expansions!`);
  await browser.close();
};

scrapeExpansions().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
