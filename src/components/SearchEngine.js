import React from "react";

function SearchEngine({ query, setQuery, search }) {
  //handler function
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      search(e);
    }
  };

  return (
    <div className="SearchEngine">
      <label htmlFor="city-search">Search for a city:</label>
      <input
        id="city-search"
        type="text"
        className="city-search"
        placeholder="enter city name"
        name="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={search} disabled={!query.trim()}><i className="fas fa-search" style={{ fontSize: "18px" }}></i></button>
    </div>
  );
}

export default SearchEngine;
