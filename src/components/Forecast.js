import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactAnimatedWeather from "react-animated-weather";

const API_URL = "https://weather-app-fwyv.onrender.com"; // Update with your actual Render backend URL

function Forecast({ weather }) {
  const { data } = weather;
  const [forecastData, setForecastData] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);

  useEffect(() => {
    const fetchForecastData = async () => {
      if (!data.name) return; // Prevent API call if no city is selected

      try {
        const response = await axios.get(`${API_URL}/forecast?city=${data.name}`);
        setForecastData(response.data || []);
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    };

    fetchForecastData();
  }, [data.name]);

  const formatDay = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const convertToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

  return (
    <div>
      <div className="city-name">
        <h2>
          {data.name}, <span>{data.sys?.country}</span>
        </h2>
      </div>
      <div className="date">
        <span>{getCurrentDate()}</span>
      </div>
      <div className="temp">
        {data.weather && data.weather[0]?.icon && (
          <img
            src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
            alt={data.weather[0].description}
            className="temp-icon"
          />
        )}
        {Math.round(isCelsius ? data.main.temp : convertToFahrenheit(data.main.temp))}
        <sup className="temp-deg" onClick={toggleTemperatureUnit}>
          {isCelsius ? "°C" : "°F"} | {isCelsius ? "°F" : "°C"}
        </sup>
      </div>
      <p className="weather-des">{data.weather?.[0].description}</p>
      <div className="weather-info">
        <div className="col">
          <ReactAnimatedWeather icon="WIND" size="40" />
          <div>
            <p className="wind">{data.wind?.speed} m/s</p>
            <p>Wind speed</p>
          </div>
        </div>
        <div className="col">
          <ReactAnimatedWeather icon="RAIN" size="40" />
          <div>
            <p className="humidity">{data.main?.humidity}%</p>
            <p>Humidity</p>
          </div>
        </div>
      </div>
      <div className="forecast">
        <h3>5-Day Forecast:</h3>
        <div className="forecast-container">
          {forecastData.length > 0 ? (
            forecastData.map((day) => (
              <div className="day" key={day.dt}>
                <p className="day-name">{formatDay(day.dt)}</p>
                <img
                  className="day-icon"
                  src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
                <p className="day-temperature">
                  {Math.round(isCelsius ? day.main.temp_min : convertToFahrenheit(day.main.temp_min))}° /{" "}
                  <span>{Math.round(isCelsius ? day.main.temp_max : convertToFahrenheit(day.main.temp_max))}°</span>
                </p>
              </div>
            ))
          ) : (
            <p>Loading forecast...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Forecast;
