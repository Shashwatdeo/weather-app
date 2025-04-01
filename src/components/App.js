import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { debounce } from "lodash";
import SearchEngine from "./SearchEngine";
import Forecast from "./Forecast";
import "../styles.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const API_URL = "https://weather-app-fwyv.onrender.com";

function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Dark mode effect
  useEffect(() => {
    document.body.style.background = darkMode ? "#1f1c2c" : "#f4f4f4";
  }, [darkMode]);

  // Load search history from localStorage
  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(storedHistory);
  }, []);

  // Date formatting helper
  const toDate = () => {
    const months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const currentDate = new Date();
    return `${days[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (city) => {
      if (!city.trim()) return;

      setWeather(prev => ({ ...prev, loading: true, error: false }));
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await axios.get(`${API_URL}/weather?city=${city}`, {
          signal: controller.signal,
          timeout: 5000,
        });

        clearTimeout(timeoutId);

        setWeather({ data: res.data, loading: false, error: false });

        // Update search history
        const updatedHistory = [city, ...searchHistory.filter(item => item !== city)].slice(0, 5);
        setSearchHistory(updatedHistory);
        localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
        
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        
        let errorMessage = "Failed to load weather data.";
        if (error.code === "ECONNABORTED" || error.message.includes("aborted")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.response?.status === 404) {
          errorMessage = "City not found. Please try another location.";
        } else if (error.response?.status === 429) {
          errorMessage = "Too many requests. Please wait a moment.";
        }

        setWeather({ data: {}, loading: false, error: errorMessage });
        setIsInitialLoad(false);
      }
    }, 500),
    [searchHistory]
  );

  // Handle manual search
  const handleSearch = (city) => {
    if (city.trim()) {
      debouncedSearch(city);
    }
  };

  // Initial load
  useEffect(() => {
    const defaultCity = searchHistory[0] || "Phagwara";
    debouncedSearch(defaultCity);
  }, []);

  return (
    <>
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
      <div className="App">
        <SearchEngine 
          query={query} 
          setQuery={setQuery} 
          search={() => handleSearch(query)} 
        />

        <button 
          className="refresh-btn" 
          onClick={() => handleSearch(weather.data.name || "Phagwara")}
          disabled={weather.loading}
        >
          {weather.loading ? "⏳ Loading..." : "🔄 Refresh"}
        </button>

        {weather.loading && !isInitialLoad && (
          <div className="loading-indicator">
            <h4>Searching for weather data...</h4>
            <div className="spinner"></div>
          </div>
        )}

        {weather.error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{weather.error}</span>
          </div>
        )}

        {!weather.loading && weather.data?.weather && (
          <Forecast weather={weather} toDate={toDate} />
        )}

        {!isInitialLoad && !weather.loading && weather.error && (
          <div className="suggestions">
            <p>Try searching for: Delhi, London, New York, Tokyo</p>
          </div>
        )}

        <div className="recent-searches">
          <h3>Recent Searches</h3>
          <div className="history-buttons">
            {searchHistory.map((city, index) => (
              <button 
                key={index} 
                onClick={() => handleSearch(city)}
                disabled={weather.loading}
              >
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
