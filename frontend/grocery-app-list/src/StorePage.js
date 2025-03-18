import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "./config";
import { Container, Typography, Paper, List, ListItem, ListItemText, Divider, Stack, Card, CardMedia, Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"

const StorePage = () => {
  const { storeId } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [selectedFlyer, setSelectedFlyer] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/store/${storeId}`)
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
  <Container maxWidth="md" sx={{ mt: 4 }}>
    {storeData ? (
      <>
        {/* 🏬 Store Name */}
        <Typography variant="h4" gutterBottom>
          {storeData.name}
        </Typography>

        {/* 🛒 Products Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Products
          </Typography>
          {storeData.products?.length > 0 ? (
            <List>
              {storeData.products.map((product, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`${product.name.toUpperCase()} - $${product.price}`}
                      secondary={`Quantity: ${product.quantity}`}
                    />
                  </ListItem>
                  {index < storeData.products.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary">No products available</Typography>
          )}
        </Paper>

        {/* 🏷️ Flyers & Offers Section */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Flyers & Offers
          </Typography>
          {storeData.flyers?.length > 0 ? (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {storeData.flyers.map((flyer, i) => (
                <Card key={i} sx={{ width: 200, cursor: "pointer" }} onClick={() => {
                    console.log("Flyer clicked:", flyer.image_url);
                    setSelectedFlyer(flyer.image_url)}}>
                    <CardMedia component="img" height="300" image={flyer.image_url} alt="Flyer" />
                </Card>
              ))}
            </Stack>
          ) : (
            <Typography color="textSecondary">No flyers available</Typography>
          )}
        </Paper>
        {/* 📌 Modal for Enlarged Flyer */}
        <Dialog open={Boolean(selectedFlyer)} onClose={() => 
            {console.log("Modal closed");
            setSelectedFlyer(null)}} maxWidth="md">
            <IconButton
                aria-label="close"
                onClick={() => setSelectedFlyer(null)}
                sx={{ position: "absolute", right: 8, top: 8, color: "white" }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{ p: 2 }}>
                {selectedFlyer && <img src={selectedFlyer} alt="Flyer" style={{ width: "100%", height: "auto" }} />}
            </DialogContent>
        </Dialog>
      </>
    ) : (
      <Typography variant="h6" color="textSecondary">
        Loading store data...
      </Typography>
    )}
  </Container>
);
}

export default StorePage;
