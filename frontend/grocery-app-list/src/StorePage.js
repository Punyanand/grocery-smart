import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "./config";
import { Container, Typography, Paper, Grid, Card, CardMedia, Dialog, DialogContent, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"

const StorePage = () => {
  const { storeId } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [selectedFlyer, setSelectedFlyer] = useState(null);

  // Add formatProductName function
  const formatProductName = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/store/${storeId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched store data:", data);
        setStoreData(data);
      })
      .catch((err) => console.error("Error fetching store data:", err));
  }, [storeId]);

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 4, 
      mb: 6,
      bgcolor: '#f8fafc',
      minHeight: '100vh',
      py: 4
    }}>
      {storeData ? (
        <>
          {/* Store Name */}
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: '#1e293b',
              fontWeight: 600,
              mb: 4,
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}
          >
            {storeData.name}
          </Typography>

          {/* Products Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                color: '#1e293b',
                fontWeight: 600,
                mb: 3
              }}
            >
              Products
            </Typography>
            {storeData.products?.length > 0 ? (
              <Grid container spacing={2}>
                {storeData.products.map((product, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'white',
                        border: '1px solid #e2e8f0',
                        transition: 'transform 0.2s',
                        aspectRatio: '1/1',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          bgcolor: '#f8fafc'
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{ 
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0
                        }}
                        image={`/images/products/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                        alt={product.name}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
                          p: 1,
                          color: '#ffffff'
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            mb: 0.25,
                            lineHeight: 1.2,
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                          }}
                        >
                          {formatProductName(product.name)}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center'
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#10b981',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                            }}
                          >
                            ${product.price}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#ffffff',
                              bgcolor: 'rgba(0,0,0,0.4)',
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              backdropFilter: 'blur(4px)'
                            }}
                          >
                            Stock: {product.quantity}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography sx={{ color: '#64748b' }}>No products available</Typography>
            )}
          </Paper>

          {/* Flyers & Offers Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                color: '#1e293b',
                fontWeight: 600,
                mb: 3
              }}
            >
              Flyers & Offers
            </Typography>
            {storeData.flyers?.length > 0 ? (
              <Grid container spacing={2}>
                {storeData.flyers.map((flyer, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        bgcolor: 'white',
                        border: '1px solid #e2e8f0',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          bgcolor: '#f8fafc'
                        }
                      }} 
                      onClick={() => setSelectedFlyer(flyer.image_url)}
                    >
                      <CardMedia 
                        component="img" 
                        height="300" 
                        image={flyer.image_url} 
                        alt="Flyer" 
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography sx={{ color: '#64748b' }}>No flyers available</Typography>
            )}
          </Paper>

          {/* Modal for Enlarged Flyer */}
          <Dialog 
            open={Boolean(selectedFlyer)} 
            onClose={() => setSelectedFlyer(null)} 
            maxWidth="md"
            PaperProps={{
              sx: {
                bgcolor: 'white',
                color: '#1e293b'
              }
            }}
          >
            <IconButton
              aria-label="close"
              onClick={() => setSelectedFlyer(null)}
              sx={{ 
                position: "absolute", 
                right: 8, 
                top: 8, 
                color: "#1e293b",
                '&:hover': {
                  bgcolor: '#f8fafc'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent sx={{ p: 2 }}>
              {selectedFlyer && (
                <img 
                  src={selectedFlyer} 
                  alt="Flyer" 
                  style={{ 
                    width: "100%", 
                    height: "auto",
                    borderRadius: '4px'
                  }} 
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Typography variant="h6" sx={{ color: '#64748b' }}>
          Loading store data...
        </Typography>
      )}
    </Container>
  );
}

export default StorePage;
