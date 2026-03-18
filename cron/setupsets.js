const { query } = require("../helpers/query.js");
const axios = require("axios");
const dotenv = require("dotenv");
const nodecron = require("node-cron");

dotenv.config();

console.log("setupsets.js loaded!")

const getMagicSets = async () => {
    const response = await axios.get('https://api.scryfall.com/sets');
    return response.data.data.map(set => ({ name: set.name, external_id: set.id }));
};

const getPokemonSets = async () => {
    const response = await axios.get('https://api.pokemontcg.io/v2/sets');
    return response.data.data.map(set => ({ name: set.name, external_id: set.id }));
};

const getYugiohSets = async () =>{
    const response = await axios.get('https://db.ygoprodeck.com/api/v7/cardsets.php');
    return response.data.map(set => ({ name: set['set_name'], external_id: set['set_code'] }));
}

const getOnepieceSets = async () =>{
    const response = await axios.get('https://www.optcgapi.com/api/allSets/?format=json');
    return response.data.map(set => ({ name: set['set_name'], external_id: set['set_id'] }));
}

const getLorcanaSets = async () =>{
    const response = await axios.get('https://api.lorcast.com/v0/sets');
    return response.data.results.map(set => ({ name: set.name, external_id: set.id }));
}

const getRiftboundSets = async () =>{
    const response = await axios.get('https://api.riftcodex.com/sets');
    return response.data.items.map(set => ({ name: set.name, external_id: set['set_id'] }));
}

const TCG_APIS = [
    { game_id: 1, name: "Magic", fetch: getMagicSets },
    { game_id: 2, name: "Pokemon", fetch: getPokemonSets },
    { game_id: 3, name: "YuGiOh", fetch: getYugiohSets },
    { game_id: 4, name: "One Piece", fetch: getOnepieceSets },
    { game_id: 5, name: "Lorcana", fetch: getLorcanaSets },
    { game_id: 6, name: "Riftbound", fetch: getRiftboundSets },
];

const saveSets = async (game_id, sets) => {
    console.log(`saveSets started for game_id: ${game_id}`);
    
  try {
    for (const set of sets) {
      await query(
        "INSERT INTO expansion (game_id, name, external_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)",
        [game_id, set.name, set.external_id],
      );
    }
  } catch (err) {
    console.error("Set update error: ", err);
  }
};

nodecron.schedule('0 6 * * *', async ()=>{
    for (const tcg of TCG_APIS){
        try{
            const sets = await tcg.fetch();
            await saveSets(tcg.game_id, sets);
            console.log(`${tcg.name} done!`);
        }catch(err){
            console.error(`${tcg.name} failed, skipping...`, err.message);
        }
    }
})

const runSetup = async ()=>{
    for (const tcg of TCG_APIS){
        try{
            const sets = await tcg.fetch();
            await saveSets(tcg.game_id, sets);
            console.log(`${tcg.name} done!`);
        }catch(err){
            console.error(`${tcg.name} failed, skipping...`, err.message);
        }
    }
}

// runSetup();