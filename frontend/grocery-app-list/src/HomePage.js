import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";
import { Container, TextField, Typography, Paper, IconButton, List, ListItem, ListItemText, Grid, Card, CardContent, CardMedia, Button } from "@mui/material";
import { Delete } from "@mui/icons-material";

const HomePage = () => {
  const [stores, setStores] = useState([]);
  const [userZip, setUserZip] = useState(""); 
  const [isZipConfirmed, setIsZipConfirmed] = useState(false);
  const [groceryList, setGroceryList] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/stores`)
      .then((res) => res.json())
      .then((data) => setStores(data))
      .catch((err) => console.error("Error fetching stores:", err));
  }, []);

  // 🔍 Fetch search results when grocery list updates
  useEffect(() => {
    if (groceryList.length > 0) {
      const queryString = groceryList.map(encodeURIComponent).join(",");
      fetch(`${API_BASE_URL}/search?query=${queryString}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data))
        .catch((err) => console.error("Error fetching search results:", err));
    } else {
      setSearchResults([]); // Clear results if list is empty
    }
  }, [groceryList]);

  // ➕ Add item to grocery list
  const handleAddItem = () => {
    if (newItem.trim() !== "" && !groceryList.includes(newItem)) {
      setGroceryList([...groceryList, newItem]);
      setNewItem("");
    }
  };

  // ❌ Remove item from grocery list
  const handleRemoveItem = (item) => {
    setGroceryList(groceryList.filter((i) => i !== item));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Grocery Smart 🛒
      </Typography>

      {/* ZIP Code Input */}
      {!isZipConfirmed ? (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6">Enter Your ZIP Code</Typography>
          <TextField
            fullWidth
            label="ZIP Code"
            type="text"
            value={userZip}
            onChange={(e) => setUserZip(e.target.value)}
            margin="normal"
          />
          <button 
            disabled={!userZip} 
            onClick={() => setIsZipConfirmed(true)}
            style={{ marginTop: "10px", padding: "10px", background: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}>
            Confirm ZIP Code
          </button>
        </Paper>
      ) : (
        <>
          <Typography variant="h6">
            ZIP Code: <strong>{userZip}</strong> ✅
          </Typography>

          {/* 📝 Grocery To-Do List */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6">Create Your Grocery List</Typography>
            <TextField
              fullWidth
              label="Add Item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              margin="normal"
            />
            <button 
              onClick={handleAddItem} 
              disabled={!newItem.trim()}
              style={{ marginTop: "10px", padding: "10px", background: "#28a745", color: "#fff", border: "none", cursor: "pointer" }}>
              Add Item
            </button>

            {/* 📌 Display Grocery List */}
            <List>
              {groceryList.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={item} />
                  <IconButton edge="end" onClick={() => handleRemoveItem(item)}>
                    <Delete color="error" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* 📊 Display Search Results */}
          {searchResults.length > 0 && (
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6">Best Basket Options</Typography>
              {searchResults.map((item, index) => (
                <div key={index} className="item-card">
                  <h3>{item.name}</h3>
                  {item.stores && item.stores.length > 0 ? (
                    item.stores.map((store, i) => (
                      <p key={i}>
                        {store.store} - ${store.price} {store.quantity ? ` - Quantity: ${store.quantity}` : ""} (ZIP: {store.zip})
                      </p>
                    ))
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
              ))}
            </Paper>
          )}
        </>
      )}

      {/* 🏪 Updated Store Grid */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Available Stores
      </Typography>
      <Grid container spacing={3}>
        {stores.length > 0 ? (
          stores.map((store) => (
            <Grid item key={store.id} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: 3, 
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.05)" }
                }}
                onClick={() => navigate(`/store/${store.id}`)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={`/images/stores/${store.id}.png`}
                  alt={store.name}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ textAlign: "center" }}>
                    {store.name}
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    sx={{ mt: 1 }} 
                    onClick={() => navigate(`/store/${store.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center", width: "100%" }}>
            Loading stores...
          </Typography>
        )}
      </Grid>
    </Container>
  );
};

export default HomePage;
