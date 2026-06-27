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
    const today = new Date().toISOString().split("T")[0];

    const result = await axios.get("https://v3.football.api-sports.io/fixtures", {
        params: { league: 39, season: 2024, date: today, },
        headers: { "x-apisports-key": process.env.API_KEY },
    });

    const fixtures = result.data.response;
    console.log(JSON.stringify(fixtures[0], null, 2), );
    res.render("index.ejs", { fixtures, page: "home" });

    } catch (error) {
        console.log(error.response?.data);
        res.status(500).send("Failed to load sport list!")
    }
});

app.get("/standings", async (req, res) => {
    try {
        const result = await axios.get("https://v3.football.api-sports.io/standings", {
            params: { league: 39, season: 2024 },
            headers: { "x-apisports-key": process.env.API_KEY },
        });
        const leagueData = result.data.response[0].league;
        const teams = leagueData.standings[0];
        res.render("standings.ejs", { 
            leagueName: leagueData.name,
            leagueLogo: leagueData.logo,
            season: leagueData.season,
            teams: teams,
         });
    } catch (error) {
        console.log(error.response?.data);
        res.status(500).send("Failed to load standings!");
    }
});

app.get("/live", async (req, res) => {
    try {
        const result = await axios.get("https://v3.football.api-sports.io/fixtures", {
            params: { live: "all" },
            headers: { "x-apisports-key": process.env.API_KEY },
        })
        console.log(result.data.response);
        
        const fixtures = result.data.response || [];
        // Group as league
        const grouped = {};
        fixtures.forEach(fix => {
            const leagueId = fix.league.id;
            if (!grouped[leagueId]) {
                grouped[leagueId] = {
                    league: fix.league,
                    games: []
                };
            }
            grouped[leagueId].games.push(fix);
        });

        const groupedFixtures = Object.values(grouped);
        res.render("live.ejs", { groupedFixtures, page: "live" });
    
    } catch (error) {
        res.status(500).send("Failed to load live matches!");
    }
});

app.get("/events/:id", async (req, res) => {
    try {
        const result = await axios.get("https://v3.football.api-sports.io/fixtures/events", {
            params: { fixture: req.params.id },
            headers: { "x-apisports-key": process.env.API_KEY },
        });
        res.json(result.data.response);
    } catch (error) {
        console.log(error.response?.data);
        res.status(500).json({ error: "Failed to load events" });
    }
});

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
