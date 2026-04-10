const fs = require("fs");
const path = require("path");

const downloadsDir = path.join(__dirname, "../downloads");

const files = fs
  .readdirSync(downloadsDir)
  .filter((f) => f.match(/^products_nonsingles_.*\.json$/));

const seen = new Map();

for (const file of files) {
  const { products } = JSON.parse(
    fs.readFileSync(path.join(downloadsDir, file), "utf8")
  );
  for (const p of products) {
    if (!seen.has(p.idCategory)) {
      seen.set(p.idCategory, p.categoryName);
    }
  }
}

const sorted = [...seen.entries()].sort(([a], [b]) => a - b);

console.log(`Found ${sorted.length} unique categories:\n`);
for (const [idCategory, categoryName] of sorted) {
  console.log(`  ${idCategory}: ${categoryName}`);
}
