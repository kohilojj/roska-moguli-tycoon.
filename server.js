const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

// Vaihda tähän oma MongoDB Atlas connection stringisi
const uri = "MONGODB_ATLAS_URI_TÄHÄN";
const client = new MongoClient(uri);

app.use(cors());
app.use(bodyParser.json());

async function main() {
  await client.connect();
  const db = client.db("roskatycoon");
  const leaderboard = db.collection("scores");

  app.post("/submit", async (req, res) => {
    const { name, score, prestige } = req.body;
    await leaderboard.insertOne({ name, score, prestige, date: new Date() });
    res.send({ success: true });
  });

  app.get("/leaderboard", async (req, res) => {
    const top = await leaderboard.find().sort({ score: -1 }).limit(10).toArray();
    res.send(top);
  });

  app.listen(port, () => {
    console.log(`Leaderboard server running on http://localhost:${port}`);
  });
}

main().catch(console.error);
