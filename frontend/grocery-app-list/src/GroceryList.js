import React, { useState } from "react";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import "./GroceryList.css"; // Import the CSS file
import API_BASE_URL from "./config";

const GroceryList = () => {
    const [items, setItems] = useState("");
    const [results, setResults] = useState([]);

    const checkProducts = async () => {
        const itemList = items.split(",").map(item => item.trim());
        try {
            const response = await axios.post(`${API_BASE_URL}/check_products`, { items: itemList });
            setResults(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <div className="container">
            {/* Header Section */}
            <header className="header">
                <h1><FaShoppingCart className="icon" /> Grocery Smart</h1>
                <p>Compare grocery prices across multiple stores and save money!</p>
            </header>

            {/* Search Section */}
            <main className="main">
                <h2>Enter Your Grocery List</h2>
                <div className="search-box">
                    <input 
                        type="text" 
                        placeholder="Milk, Eggs, Bread..." 
                        value={items} 
                        onChange={(e) => setItems(e.target.value)}
                    />
                    <button onClick={checkProducts}>Check Prices</button>
                </div>

                {/* Results Section */}
                <div className="results">
                    <h3>Results</h3>
                    {results.length > 0 ? (
                        results.map((item, index) => (
                            <div key={index} className="result-card">
                                <h4>{item.name}</h4>
                                <ul>
                                    {item.stores.map((store, storeIndex) => (
                                        <li key={storeIndex}>
                                            🛒 {store.store} - <strong>${store.price.toFixed(2)}</strong> (ZIP: {store.zip})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p className="no-results">No products found. Try searching for something else.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GroceryList;
