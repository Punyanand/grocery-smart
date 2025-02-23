import React, { useEffect, useState } from "react";

const UploadPage = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");

  // Fetch store list from backend
  useEffect(() => {
    fetch("http://127.0.0.1:5000/stores")
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStores(data);
        } else {
          console.error("Invalid store data:", data);
        }
      })
      .catch(error => console.error("Error fetching stores:", error));
  }, []);

  const handleUpload = () => {
    if (!selectedStore || !productName || !price) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      store_id: selectedStore,
      name: productName,
      price: parseFloat(price)
    };

    fetch("http://127.0.0.1:5000/upload_product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message || "Product uploaded successfully!");
      })
      .catch(error => console.error("Error uploading product:", error));
  };

  return (
    <div className="upload-container">
      <h2>Upload Product Data 📊</h2>

      <label>Store Name:</label>
      <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)}>
        <option value="">Select a Store</option>
        {stores.map(store => (
          <option key={store.id} value={store.id}>
            {store.name} (ID: {store.id})
          </option>
        ))}
      </select>

      <label>Product Name:</label>
      <input
        type="text"
        placeholder="Enter product name"
        value={productName}
        onChange={e => setProductName(e.target.value)}
      />

      <label>Price ($):</label>
      <input
        type="number"
        placeholder="Enter price"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />

      <button onClick={handleUpload}>Submit Data</button>
    </div>
  );
};

export default UploadPage;
