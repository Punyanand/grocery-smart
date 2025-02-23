import React, { useState } from "react";
import "./ItemSearch.css";

const ItemSearch = ({ onSearch }) => {
  const [items, setItems] = useState("");

  const handleInputChange = (event) => {
    setItems(event.target.value);
  };

  const handleSearch = () => {
    if (!onSearch) {
      console.error("Error: onSearch function is not provided!");
      return;
    }

    if (items.trim() !== "") {
      const itemList = items.split(",").map(item => item.trim());
      console.log("Triggering search for:", itemList);
      onSearch(itemList);
    }
  };

  // Trigger search when pressing Enter
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <h2>Compare Prices Across Stores 🛍️</h2>
      <p>Enter grocery items (comma-separated) to check their prices:</p>

      <textarea
        className="item-input"
        placeholder="e.g., Milk, Bread, Rice, Eggs"
        value={items}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />

      <button className="search-button" onClick={handleSearch}>Search</button>
    </div>
  );
};

export default ItemSearch;
