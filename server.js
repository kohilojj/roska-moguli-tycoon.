import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

// Käytä Renderin ympäristömuuttujaa
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function getCollection() {
  await client.connect();
  const db = client.db("roskatycoon"); // tietokannan nimi
  return db.collection("scores");      // kokoelman nimi
}

// Tallennetaan pisteet
app.post("/submit", async (req, res) => {
  const { name, score, prestige } = req.body;
  try {
    const scores = await getCollection();
    await scores.updateOne(
      { name },
      { $set: { score, prestige } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

// Haetaan leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const scores = await getCollection();
    const top = await scores.find().sort({ score: -1 }).limit(10).toArray();
    res.json(top);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

// Käynnistetään palvelin
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Backend running on port " + port));
