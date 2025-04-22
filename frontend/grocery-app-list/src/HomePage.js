import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";
import { Container, TextField, Typography, Paper, IconButton, List, ListItem, ListItemText, Grid, Card, CardContent, CardMedia, Button, Box, ListItemSecondaryAction, Collapse } from "@mui/material";
import { Delete, ExpandMore, ExpandLess } from "@mui/icons-material";
import StoreComparisonCard from "./StoreComparisonCard";

const HomePage = ({ groceryList, setGroceryList }) => {
  const [stores, setStores] = useState([]);
  const [userZip, setUserZip] = useState(""); 
  const [newItem, setNewItem] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [comparisons, setComparisons] = useState({ items: [], totalBestPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optimizedStops, setOptimizedStops] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState(true);
  const [showOptimization, setShowOptimization] = useState(true);
  const navigate = useNavigate();

  // Fetch stores
  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/stores`);
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      const data = await response.json();
      console.log('Fetched stores:', data);
      setStores(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to load stores. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStores();
  }, []); // Only run once on component mount

  // Fetch price comparisons when user clicks compare button
  const handleCompareClick = async () => {
    if (groceryList.length === 0) {
      alert("Please add items to your grocery list first!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/compare-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: groceryList,
          userZip: userZip
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch price comparisons');
      }

      const data = await response.json();
      console.log("Comparison data received:", data);
      setComparisons(data);
      setShowComparison(true);
    } catch (error) {
      console.error("Error fetching comparisons:", error);
      alert("Error comparing prices. Please try again.");
    }
  };

  // Add item to grocery list
  const handleAddItem = () => {
    if (newItem.trim() !== "" && !groceryList.includes(newItem)) {
      setGroceryList([...groceryList, newItem]);
      setNewItem("");
    }
  };

  // Remove item from grocery list
  const handleRemoveItem = (item) => {
    setGroceryList(groceryList.filter((i) => i !== item));
    if (groceryList.length <= 1) {
      setShowComparison(false);
    }
  };

  // Clear grocery list
  const handleClearList = () => {
    setGroceryList([]);
    setShowComparison(false);
    setComparisons({ items: [], totalBestPrice: 0 });
    setOptimizedStops(null);
  };

  const handleZipChange = (e) => {
    const newZip = e.target.value;
    setUserZip(newZip);
  };

  // Add this function after handleCompareClick
  const handleOptimizeStops = async () => {
    if (groceryList.length === 0) {
      alert("Please add items to your grocery list first!");
      return;
    }

    if (!userZip) {
      alert("Please enter your ZIP code to optimize shopping stops!");
      return;
    }

    setOptimizing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/optimize-stops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: groceryList,
          userZip: userZip
        })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize shopping stops');
      }

      const data = await response.json();
      console.log("Optimization data received:", data);
      setOptimizedStops(data);
    } catch (error) {
      console.error("Error optimizing stops:", error);
      alert("Error optimizing shopping stops. Please try again.");
    } finally {
      setOptimizing(false);
    }
  };

  // Add this function after the existing state declarations
  const formatProductName = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Container maxWidth="xl" sx={{ 
      mb: 6,
      minHeight: '100vh',
      bgcolor: '#f8fafc', // Lighter, more modern background
      pt: 3
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center"
        sx={{ 
          color: '#1e293b', // Darker, more sophisticated text color
          fontWeight: 600,
          mb: 4,
          letterSpacing: '0.5px'
        }}
      >
        Welcome to Grocery Smart 🛒
      </Typography>

      <Grid container spacing={3}>
        {/* ZIP Code Input - Centered */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                width: '41.67%',
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0'
              }}
            >
              <TextField
                size="medium"
                label="ZIP Code (Optional)"
                type="text"
                value={userZip}
                onChange={handleZipChange}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b',
                    '&.Mui-focused': {
                      color: '#3b82f6',
                    },
                  },
                }}
              />
            </Paper>
          </Box>
        </Grid>

        {/* Grocery List - Centered */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                width: '41.67%',
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0'
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  color: '#1e293b',
                  fontWeight: 500,
                  mb: 2
                }}
              >
                Create Your Grocery List
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add Item"
                  variant="outlined"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      '&.Mui-focused': {
                        color: '#3b82f6',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddItem}
                  sx={{ 
                    minWidth: 100,
                    bgcolor: '#3b82f6',
                    '&:hover': {
                      bgcolor: '#2563eb',
                    },
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Add
                </Button>
              </Box>

              {groceryList.length > 0 && (
                <List sx={{ 
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  {groceryList.map((item, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderBottom: index < groceryList.length - 1 ? '1px solid #e2e8f0' : 'none',
                        '&:hover': {
                          bgcolor: '#f8fafc',
                        },
                      }}
                    >
                      <ListItemText 
                        primary={formatProductName(item)}
                        sx={{ color: '#1e293b' }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveItem(item)}
                          sx={{ color: '#ef4444' }}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {groceryList.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleClearList}
                    sx={{ 
                      color: '#ef4444',
                      borderColor: '#ef4444',
                      '&:hover': {
                        borderColor: '#dc2626',
                        bgcolor: 'rgba(239, 68, 68, 0.04)',
                      },
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Clear List
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCompareClick}
                    disabled={loading}
                    sx={{ 
                      bgcolor: '#3b82f6',
                      '&:hover': {
                        bgcolor: '#2563eb',
                      },
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Compare Prices
                  </Button>
                  {userZip && (
                    <Button
                      variant="contained"
                      onClick={handleOptimizeStops}
                      disabled={optimizing}
                      sx={{ 
                        bgcolor: '#8b5cf6',
                        '&:hover': {
                          bgcolor: '#7c3aed',
                        },
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      {optimizing ? "Optimizing..." : "Optimize Shopping Stops"}
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>

        {/* Price Comparison Results - Centered */}
        <Grid item xs={12}>
          {showComparison && comparisons.items.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  width: '41.67%', // Same width as other centered sections
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  mb: 2
                }} onClick={() => setShowPriceComparison(!showPriceComparison)}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#2c3e50',
                      fontWeight: 500
                    }}
                  >
                    Price Comparison Results
                  </Typography>
                  <IconButton>
                    {showPriceComparison ? <ExpandLess sx={{ color: '#2c3e50' }} /> : <ExpandMore sx={{ color: '#2c3e50' }} />}
                  </IconButton>
                </Box>
                <Collapse in={showPriceComparison}>
                  <StoreComparisonCard comparisons={comparisons} />
                </Collapse>
              </Paper>
            </Box>
          )}
        </Grid>

        {/* Shopping Optimization Strategy - Full Width */}
        {optimizedStops && (
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
                mb: 2
              }} onClick={() => setShowOptimization(!showOptimization)}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: '#2c3e50',
                    fontWeight: 500
                  }}
                >
                  Shopping Optimization Strategies
                </Typography>
                <IconButton>
                  {showOptimization ? <ExpandLess sx={{ color: '#2c3e50' }} /> : <ExpandMore sx={{ color: '#2c3e50' }} />}
                </IconButton>
              </Box>
              <Collapse in={showOptimization}>
                <Grid container spacing={3}>
                  {/* Price Optimized Strategy */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      height: '500px',
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 20px rgba(74, 144, 226, 0.2)',
                      transition: 'transform 0.2s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          letterSpacing: '0.5px'
                        }}
                      >
                        Price-Optimized Strategy
                      </Typography>
                      <Typography 
                        variant="body2" 
                        gutterBottom 
                        sx={{ 
                          opacity: 0.9,
                          mb: 1
                        }}
                      >
                        Best prices for each item, regardless of store location
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          ${Number(optimizedStops.price_optimized.total_cost).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Cost
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {Number(optimizedStops.price_optimized.total_distance).toFixed(1)} miles
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Distance
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {optimizedStops.price_optimized.stores.length}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Number of Stores
                        </Typography>
                      </Box>
                      <List sx={{ 
                        flex: 1,
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '3px',
                        }
                      }}>
                        {Object.entries(optimizedStops.price_optimized.item_breakdown).map(([item, details]) => (
                          <ListItem key={item} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {formatProductName(item)}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                  {details.store} - ${Number(details.price).toFixed(2)}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>

                  {/* Distance Optimized Strategy */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      height: '500px',
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 20px rgba(46, 204, 113, 0.2)',
                      transition: 'transform 0.2s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          letterSpacing: '0.5px'
                        }}
                      >
                        Distance-Optimized Strategy
                      </Typography>
                      <Typography 
                        variant="body2" 
                        gutterBottom 
                        sx={{ 
                          opacity: 0.9,
                          mb: 1
                        }}
                      >
                        Prioritizes closest stores first
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          ${Number(optimizedStops.distance_optimized.total_cost).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Cost
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {Number(optimizedStops.distance_optimized.total_distance).toFixed(1)} miles
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Distance
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {optimizedStops.distance_optimized.stores.length}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Number of Stores
                        </Typography>
                      </Box>
                      <List sx={{ 
                        flex: 1,
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '3px',
                        }
                      }}>
                        {Object.entries(optimizedStops.distance_optimized.item_breakdown).map(([item, details]) => (
                          <ListItem key={item} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {formatProductName(item)}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                  {details.store} - ${Number(details.price).toFixed(2)}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>

                  {/* Convenience Optimized Strategy */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      height: '500px',
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 20px rgba(155, 89, 182, 0.2)',
                      transition: 'transform 0.2s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          letterSpacing: '0.5px'
                        }}
                      >
                        Convenience-Optimized Strategy
                      </Typography>
                      <Typography 
                        variant="body2" 
                        gutterBottom 
                        sx={{ 
                          opacity: 0.9,
                          mb: 1
                        }}
                      >
                        Minimum number of stores to visit
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          ${Number(optimizedStops.convenience_optimized.total_cost).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Cost
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {Number(optimizedStops.convenience_optimized.total_distance).toFixed(1)} miles
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Distance
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {optimizedStops.convenience_optimized.stores.length}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Number of Stores
                        </Typography>
                      </Box>
                      <List sx={{ 
                        flex: 1,
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '3px',
                        }
                      }}>
                        {Object.entries(optimizedStops.convenience_optimized.item_breakdown).map(([item, details]) => (
                          <ListItem key={item} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {formatProductName(item)}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                  {details.store} - ${Number(details.price).toFixed(2)}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>
                </Grid>
              </Collapse>
            </Paper>
          </Grid>
        )}

        {/* Available Stores Section - Full Width */}
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#2c3e50',
                  fontWeight: 500
                }}
              >
                Available Stores
              </Typography>
            </Box>

            {error ? (
              <Typography color="error" align="center">
                {error}
              </Typography>
            ) : loading ? (
              <Typography align="center" sx={{ color: '#2c3e50' }}>Loading stores...</Typography>
            ) : (
              <Grid container spacing={3}>
                {stores.map((store) => (
                  <Grid item xs={12} sm={6} md={4} key={store.id}>
                    <Card 
                      sx={{ 
                        display: 'flex',
                        borderRadius: 2,
                        boxShadow: 3,
                        height: '100%',
                        transition: "transform 0.2s",
                        bgcolor: 'white',
                        border: '1px solid #e0e0e0',
                        "&:hover": { 
                          transform: "scale(1.02)",
                          bgcolor: '#f8f9fa'
                        }
                      }}
                      onClick={() => navigate(`/store/${store.id}`)}
                    >
                      <CardMedia
                        component="img"
                        sx={{ width: 100, height: 100, objectFit: 'cover' }}
                        image={`/images/stores/${store.id}.png`}
                        alt={store.name}
                      />
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1.5 }}>
                        <div>
                          <Typography variant="subtitle1" gutterBottom sx={{ color: '#2c3e50', mb: 0.5 }}>
                            {store.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                            ZIP: {store.zip_code}
                            {store.distance && (
                              <Box component="span" sx={{ ml: 1 }}>
                                • {store.distance.toFixed(1)} miles
                              </Box>
                            )}
                          </Typography>
                        </div>
                        <Button 
                          variant="outlined" 
                          size="small"
                          sx={{ 
                            mt: 0.5, 
                            alignSelf: 'flex-start',
                            borderColor: '#3498db',
                            color: '#3498db',
                            '&:hover': {
                              borderColor: '#2980b9',
                              color: '#2980b9',
                            },
                            py: 0.5,
                            px: 1
                          }} 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/store/${store.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
