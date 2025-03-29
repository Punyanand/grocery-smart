import React, { useEffect, useState } from "react";
import API_BASE_URL from "./config";
import { Container, TextField, MenuItem, Button, Typography, Paper, Input } from "@mui/material";

const UploadPage = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [flyer, setFlyer] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState(null);

  // Fetch store list from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/stores`)
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

  // Handle Product Upload
  const handleUpload = () => {
    if (!selectedStore || !productName || !price || !quantity) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      store_id: selectedStore,
      name: productName,
      price: parseFloat(price),
      quantity: quantity,
    };

    fetch(`${API_BASE_URL}/upload_product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        alert(data.message);
        // Clear form after successful upload
        setProductName("");
        setPrice("");
        setQuantity("");
      })
      .catch(error => {
        console.error("Error uploading product:", error);
        alert("Error uploading product. Please try again.");
      });
  };

  // Handle Flyer Upload
  const handleFlyerUpload = async () => {
    if (!selectedStore || !flyer) {
      alert("Please select a store and choose a flyer image.");
      return;
    }

    const formData = new FormData();
    formData.append("store_id", selectedStore);
    formData.append("file", flyer);

    fetch(`${API_BASE_URL}/upload_flyer`, {
      method: "POST",
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message || "Flyer uploaded successfully!");
      })
      .catch(error => console.error("Error uploading flyer:", error));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Upload Product Data 📊
        </Typography>

        {/* Store Selection */}
        <TextField
          select
          label="Select a Store"
          fullWidth
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value)}
          margin="normal"
        >
          {stores.map(store => (
            <MenuItem key={store.id} value={store.id}>
              {store.name} (ID: {store.id})
            </MenuItem>
          ))}
        </TextField>

        {/* Product Name */}
        <TextField
          label="Product Name"
          fullWidth
          value={productName}
          onChange={e => setProductName(e.target.value)}
          margin="normal"
        />

        {/* Price */}
        <TextField
          label="Price ($)"
          type="number"
          fullWidth
          value={price}
          onChange={e => setPrice(e.target.value)}
          margin="normal"
        />

        {/* Quantity */}
        <TextField
          label="Quantity"
          fullWidth
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          margin="normal"
          placeholder="e.g., 1 gallon, 500 ml, 2 lbs"
        />

        {/* Submit Product Button */}
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleUpload}>
          Submit Data
        </Button>
      </Paper>

      {/* Flyer Upload Section */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Store Flyer 📢
        </Typography>

        {/* Store Selection for Flyer */}
        <TextField
          select
          label="Select a Store"
          fullWidth
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value)}
          margin="normal"
        >
          {stores.map(store => (
            <MenuItem key={store.id} value={store.id}>
              {store.name} (ID: {store.id})
            </MenuItem>
          ))}
        </TextField>

        {/* File Input for Flyer */}
        <Input
          type="file"
          fullWidth
          accept="image/*"
          onChange={(e) => {
            setFlyer(e.target.files[0]);
            setFlyerPreview(URL.createObjectURL(e.target.files[0])); // Show preview
          }}
          sx={{ mt: 2 }}
        />

        {/* Flyer Preview */}
        {flyerPreview && (
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <Typography variant="body2">Preview:</Typography>
            <img src={flyerPreview} alt="Flyer Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "5px" }} />
          </div>
        )}

        {/* Submit Flyer Button */}
        <Button variant="contained" color="secondary" fullWidth sx={{ mt: 2 }} onClick={handleFlyerUpload}>
          Upload Flyer
        </Button>
      </Paper>
    </Container>
  );
};

export default UploadPage;
