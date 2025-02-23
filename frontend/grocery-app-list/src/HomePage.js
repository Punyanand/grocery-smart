import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import ItemSearch from "./components/ItemSearch";  
import API_BASE_URL from "./config";

const HomePage = () => {
  const [stores, setStores] = useState([]);
  const [results, setResults] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/stores`)
      .then((res) => res.json())
      .then((data) => setStores(data))
      .catch((err) => console.error("Error fetching stores:", err));
  }, []);

  const handleSearch = (itemList) => {
    if (!itemList || itemList.length === 0) return;

    const queryString = itemList.map(encodeURIComponent).join(",");
    console.log("Searching for:", queryString);

    fetch(`${API_BASE_URL}/search?query=${queryString}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Search results:", data);
        setResults(data);
      })
      .catch((err) => console.error("Error fetching search results:", err));
  };

  const handleStoreClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  return (
    <div className="homepage"
    style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/homepage-bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}>
      <h1>Welcome to Grocery Smart 🛒</h1>

      {/* 🔍 Pass handleSearch to ItemSearch */}
      <ItemSearch onSearch={handleSearch} /> 

      {/* 📊 Display Search Results */}
      {results.length > 0 && (
        <div className="results">
          <h2>Price Comparison</h2>
          {results.map((item, index) => (
            <div key={index} className="item-card">
              <h3>{item.name}</h3>
              {item.stores && item.stores.length > 0 ? (
                item.stores.map((store, i) => (
                  <p key={i}>
                    {store.store} - ${store.price} (ZIP: {store.zip})
                  </p>
                ))
              ) : (
                <p>No data available</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🏪 Store Grid */}
      <div className="store-section">
        <h2>All Stores</h2>
        <div className="store-grid">
          {stores.length > 0 ? (
            stores.map((store) => (
              <div key={store.id} className="store-card" onClick={() => handleStoreClick(store.id)}>
                <img src={`/images/stores/${store.id}.png`} alt={store.name} className="store-icon" />
                <p>{store.name}</p>
              </div>
            ))
          ) : (
            <p>Loading stores...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
