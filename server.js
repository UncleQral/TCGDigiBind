const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const binderRouter = require('./routes/binder.js');
app.use('/binder', binderRouter);

const userRouter = require('./routes/user.js');
app.use('/user', userRouter);

const cardRouter = require('./routes/card.js');
app.use('/card', cardRouter);

const sealedRouter = require('./routes/sealedprod.js');
app.use('/sealed_prod', sealedRouter);

const bindercardRouter = require('./routes/binder_card.js');
app.use('/binder_card', bindercardRouter);

const gamesRouter = require('./routes/game.js');
app.use('/game', gamesRouter);

const expansionsRouter = require('./routes/expansion.js');
app.use('/expansion', expansionsRouter);

const conditionRouter = require('./routes/condition.js');
app.use('/condition', conditionRouter);

const rarityRouter = require('./routes/rarity.js');
app.use('/rarity', rarityRouter);

require('./cron/priceupdater.js');
require('./cron/setupsets.js');

app.listen(process.env.PORT, ()=> {
    console.log("Connection Succsessfully")
});