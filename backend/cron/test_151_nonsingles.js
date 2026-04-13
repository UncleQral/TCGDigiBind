const fs = require("fs");
const path = require("path");

const { products } = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../downloads/products_nonsingles_6.json"),
    "utf8",
  ),
);

const filtered = products.filter((p) => p.idExpansion === 5402);
console.log(`Found ${filtered.length} products for idExpansion 5402\n`);

const byCategory = new Map();
for (const p of filtered) {
  if (!byCategory.has(p.categoryName)) byCategory.set(p.categoryName, []);
  byCategory.get(p.categoryName).push(p.name);
}

for (const [category, names] of byCategory) {
  console.log(`[${category}] — ${names.length} product(s)`);
  names.slice(0, 3).forEach((n) => console.log(`  • ${n}`));
  console.log();
}
