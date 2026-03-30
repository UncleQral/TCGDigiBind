const fs = require("fs");
const path = require("path");

const data = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "downloads/products_singles_6.json"),
    "utf8",
  ),
);
const results = data.products.filter(
  (p) => p.idExpansion === 1523 && p.name.includes("Charizard"),
);
console.log(results);
