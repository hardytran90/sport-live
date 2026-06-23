import express from "express";
import axios from "axios";
import "dotenv/config";

const app = express();
const port = 5005;
const API_KEY = process.env.API_KEY;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    try {
    const result = await axios.get(`https://api.the-odds-api.com/v4/sports/?apiKey=${API_KEY}`);
    const soccerSports = result.data.filter(item => item.group === "Soccer");
    res.render("index.ejs", {sports: soccerSports});
    } catch (error) {
        console.log(error.response.data);
        res.status(500).send("Failed to load sport list!")
    }
});

app.post("/sports", async (req, res) => {
    try {
    const sportKey = req.body.sport;
    const [sportsResult, scoresResult] = await Promise.all([
        axios.get(`https://api.the-odds-api.com/v4/sports/?apiKey=${API_KEY}`),
        axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/scores/?apiKey=${API_KEY}&daysFrom=3`),
    ]);
    const soccerSports = sportsResult.data.filter(item => item.group === "Soccer");
    const games = scoresResult.data
    .filter(game => game.completed === true || game.scores !== null)
    .sort((a,b) => a.completed - b.completed);
    
    res.render("index.ejs", {
        sports: soccerSports,
        games: games,
    });
    
    } catch (error) {
        console.log(error.response.data);
        res.status(404).send("Data not found!")
    }
});

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
})
