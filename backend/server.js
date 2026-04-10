const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const binderRouter = require("./routes/binder.js");
app.use("/binder", binderRouter);

const userRouter = require("./routes/user.js");
app.use("/user", userRouter);

const cardRouter = require("./routes/card.js");
app.use("/card", cardRouter);

const sealedRouter = require("./routes/sealed.js");
app.use("/sealed", sealedRouter);

const bindercardRouter = require("./routes/binder_card.js");
app.use("/binder_card", bindercardRouter);

const gamesRouter = require("./routes/game.js");
app.use("/game", gamesRouter);

const expansionsRouter = require("./routes/expansion.js");
app.use("/expansion", expansionsRouter);

const conditionRouter = require("./routes/condition.js");
app.use("/condition", conditionRouter);

const rarityRouter = require("./routes/rarity.js");
app.use("/rarity", rarityRouter);

const gradedCardRouter = require("./routes/graded_card.js");
app.use("/graded_card", gradedCardRouter);

const gradingCompanyRouter = require("./routes/grading_company.js");
app.use("/grading_company", gradingCompanyRouter);

const tag_colorRouter = require("./routes/tag_color");
app.use("/tag_color", tag_colorRouter);

require("./cron/priceupdater.js");
require("./cron/setups/setupsets.js");
require("./cron/setups/setuprarities.js");
require("./cron/downloadproducts.js");
require("./cron/importcards.js");
require("./cron/importnonsingles.js");

app.listen(process.env.PORT || 3000, () => {
  console.log("Connection Succsessfully");
});
