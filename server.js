const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();
app.use(cors());

const API_KEY = process.env.API_KEY; // Use API key from .env

// Route to get current weather data
app.get("/weather", async (req, res) => {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
    }

    try {
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        res.json(weatherResponse.data);
    } catch (error) {
        console.error("Error fetching weather data:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching weather data" });
    }
});

// Route to get 5-day forecast
app.get("/forecast", async (req, res) => {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
    }

    try {
        const forecastResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );

        // Extract only daily forecasts at 12:00 PM
        const dailyData = forecastResponse.data.list.filter((reading) =>
            reading.dt_txt.includes("12:00:00")
        );

        res.json(dailyData);
    } catch (error) {
        console.error("Error fetching forecast data:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching forecast data" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
