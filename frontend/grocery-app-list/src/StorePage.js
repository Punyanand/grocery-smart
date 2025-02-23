import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./StorePage.css";

const StorePage = () => {
  const { storeId } = useParams();
  const [storeData, setStoreData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/store/${storeId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched store data:", data); // Debugging
        setStoreData(data);
      })
      .catch((err) => console.error("Error fetching store data:", err));
  }, [storeId]);

  return (
    <div className="container">
      {storeData ? (
        <>
          <h1>{storeData.name}</h1>

          {/* 🛒 Products Section */}
          <h2>Products</h2>
          {storeData.products && storeData.products.length > 0 ? (
            <ul>
              {storeData.products.map((product, index) => (
                <li key={index}>
                  {product.name} - ${product.price}
                </li>
              ))}
            </ul>
          ) : (
            <p>No products available</p>
          )}

          {/* 🏷️ Flyers & Offers Section */}
          <h2>Flyers & Offers</h2>
          {storeData.flyers && storeData.flyers.length > 0 ? (
            <div className="flyers">
              {storeData.flyers.map((flyer, i) => (
                <img key={i} src={flyer.url} alt="Flyer" className="flyer-img" />
              ))}
            </div>
          ) : (
            <p>No flyers available</p>
          )}
        </>
      ) : (
        <p>Loading store data...</p>
      )}
    </div>
  );
};

export default StorePage;
