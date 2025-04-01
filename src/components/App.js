import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchEngine from "./SearchEngine";
import Forecast from "./Forecast";
import "../styles.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const API_URL = "https://weather-app-fwyv.onrender.com"; 

function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState({
    loading: true,
    data: {},
    error: false
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.style.background = darkMode ? "#1f1c2c" : "#f4f4f4";
  }, [darkMode]);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(storedHistory);
  }, []);

  const toDate = () => {
    const months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const currentDate = new Date();
    return `${days[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
  };

  const search = async (city) => {
    setWeather((prev) => ({ ...prev, loading: true, error: false }));
  
    const url = `${API_URL}/weather?city=${city}`;
  
    try {
      const controller = new AbortController(); 
      const timeoutId = setTimeout(() => controller.abort(), 1000); 
  
      const res = await axios.get(url, {
        signal: controller.signal, 
        timeout: 1000,
      });
  
      clearTimeout(timeoutId); 
  
      setWeather({ data: res.data, loading: false, error: false });
  
      let updatedHistory = [city, ...searchHistory.filter((item) => item !== city)];
      if (updatedHistory.length > 5) updatedHistory.pop();
  
      setSearchHistory(updatedHistory);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error fetching weather data:", error);
  
      let errorMessage = "Failed to load weather data.";
      if (error.code === "ECONNABORTED" || error.message.includes("aborted")) {
        errorMessage = "Request timed out. Try again.";
      } else if (error.response?.status === 404) {
        errorMessage = "City not found. Try another.";
      }
  
      setWeather({ data: {}, loading: false, error: errorMessage });
    }
  };
  

  useEffect(() => {
    search("Phagwara");
  }, []);

  return (
    <>
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
      <div className="App">
        <SearchEngine query={query} setQuery={setQuery} search={() => search(query)} />

        <button className="refresh-btn" onClick={() => search(weather.data.name || "Phagwara")}>
          🔄 Refresh
        </button>

        {weather.loading && <h4>Searching..</h4>}
        {weather.error && <span className="error-message">Sorry, city not found. Try again.</span>}

        {weather && weather.data && weather.data.weather && (
          <Forecast weather={weather} toDate={toDate} />
        )}

        <div className="recent-searches">
          <h3>Recent Searches</h3>
          <div className="history-buttons">
            {searchHistory.map((city, index) => (
              <button key={index} onClick={() => search(city)}>
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
