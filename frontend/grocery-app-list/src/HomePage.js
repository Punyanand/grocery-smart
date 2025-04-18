import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";
import { Container, TextField, Typography, Paper, IconButton, List, ListItem, ListItemText, Grid, Card, CardContent, CardMedia, Button, Divider, Box, Chip, Collapse } from "@mui/material";
import { Delete, LocationOn, ExpandMore, ExpandLess } from "@mui/icons-material";
import StoreComparisonCard from "./StoreComparisonCard";

const HomePage = ({ groceryList, setGroceryList }) => {
  const [stores, setStores] = useState([]);
  const [userZip, setUserZip] = useState(""); 
  const [newItem, setNewItem] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [comparisons, setComparisons] = useState({ items: [], totalBestPrice: 0 });
  const [sortByDistance, setSortByDistance] = useState(false);
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
      const url = userZip && sortByDistance 
        ? `${API_BASE_URL}/stores/by-distance/${userZip}`
        : `${API_BASE_URL}/stores`;
      
      const response = await fetch(url);
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

  useEffect(() => {
    fetchStores();
  }, [userZip, sortByDistance]);

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
    setSortByDistance(false);
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
      mt: 4, 
      mb: 6,
      minHeight: '100vh',
      bgcolor: '#121212' // Dark background
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center"
        sx={{ 
          color: '#ffffff',
          fontWeight: 600,
          mb: 4
        }}
      >
        Welcome to Grocery Smart 🛒
      </Typography>

      {/* ZIP Code Input */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          maxWidth: 300, 
          mx: 'auto',
          bgcolor: '#1e1e1e',
          border: '1px solid #333'
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
              '& fieldset': {
                borderColor: '#333',
              },
              '&:hover fieldset': {
                borderColor: '#666',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#90caf9',
              },
              color: '#fff',
              height: '56px',
              marginTop: '16px', // Increased space between label and input
            },
            '& .MuiInputLabel-root': {
              color: '#999',
              '&.Mui-focused': {
                color: '#90caf9',
              },
              transform: 'translate(14px, 16px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
              },
            },
          }}
        />
      </Paper>

      {/* Grocery List Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: '#1e1e1e',
          border: '1px solid #333'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '0.5px'
            }}
          >
            Create Your Grocery List
          </Typography>
          {groceryList.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleClearList}
              startIcon={<Delete />}
              sx={{
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': {
                  borderColor: '#ff1744',
                  color: '#ff1744',
                },
              }}
            >
              Clear List
            </Button>
          )}
        </Box>
        <TextField
          fullWidth
          label="Add Item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          margin="normal"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#333',
              },
              '&:hover fieldset': {
                borderColor: '#666',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#90caf9',
              },
              color: '#fff',
            },
            '& .MuiInputLabel-root': {
              color: '#999',
              '&.Mui-focused': {
                color: '#90caf9',
              },
            },
          }}
        />
        <Button 
          variant="contained"
          color="primary"
          onClick={handleAddItem} 
          disabled={!newItem.trim()}
          sx={{ 
            mt: 2, 
            mb: 2,
            '&.Mui-disabled': {
              bgcolor: '#4a4a6a',
              color: '#a0a0a0'
            }
          }}
        >
          Add Item
        </Button>

        {/* Display Grocery List */}
        <List sx={{ 
          width: '100%', 
          bgcolor: '#1e1e1e',
          '& .MuiListItem-root': {
            borderBottom: '1px solid #333',
            '&:last-child': { borderBottom: 'none' }
          }
        }}>
          {groceryList.map((item, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveItem(item)}>
                  <Delete sx={{ color: '#f44336' }} />
                </IconButton>
              }
            >
              <ListItemText 
                primary={
                  <Typography sx={{ color: '#fff' }}>
                    {item}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

        {groceryList.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCompareClick}
            sx={{ 
              mt: 2,
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0',
              },
            }}
          >
            Compare Prices
          </Button>
        )}

        {groceryList.length > 0 && userZip && (
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleOptimizeStops}
            disabled={optimizing}
            sx={{ 
              mt: 2,
              bgcolor: '#9c27b0',
              '&:hover': {
                bgcolor: '#7b1fa2',
              },
            }}
          >
            {optimizing ? "Optimizing..." : "Optimize Shopping Stops"}
          </Button>
        )}
      </Paper>

      {/* Price Comparison Results */}
      {showComparison && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            bgcolor: '#1e1e1e',
            border: '1px solid #333'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { bgcolor: '#2d2d2d' }
          }} onClick={() => setShowPriceComparison(!showPriceComparison)}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '0.5px'
              }}
            >
              Price Comparison Results
            </Typography>
            <IconButton>
              {showPriceComparison ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />}
            </IconButton>
          </Box>
          <Collapse in={showPriceComparison}>
            <StoreComparisonCard comparisons={comparisons} />
          </Collapse>
        </Paper>
      )}

      {/* Optimized Shopping Route */}
      {optimizedStops && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid #333'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            mb: 1,
            '&:hover': { bgcolor: '#2d2d2d' }
          }} onClick={() => setShowOptimization(!showOptimization)}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '0.5px'
              }}
            >
              Shopping Optimization Strategies
            </Typography>
            <IconButton>
              {showOptimization ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />}
            </IconButton>
          </Box>

          <Collapse in={showOptimization}>
            <Grid container spacing={4} sx={{ mt: 1 }}>
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
      )}

      {/* Stores Section */}
      <Divider sx={{ my: 4, borderColor: '#333' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '0.5px'
          }}
        >
          Available Stores
        </Typography>
        {userZip && (
          <Button
            variant="outlined"
            onClick={() => setSortByDistance(!sortByDistance)}
            startIcon={<LocationOn />}
            size="small"
            sx={{
              borderColor: '#666',
              color: '#fff',
              '&:hover': {
                borderColor: '#90caf9',
                color: '#90caf9',
              },
            }}
          >
            {sortByDistance ? "Show Default Order" : "Sort by Distance"}
          </Button>
        )}
      </Box>

      {error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : loading ? (
        <Typography align="center" sx={{ color: '#fff' }}>Loading stores...</Typography>
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
                  bgcolor: '#1e1e1e',
                  border: '1px solid #333',
                  "&:hover": { 
                    transform: "scale(1.02)",
                    bgcolor: '#2d2d2d'
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
                    <Typography variant="subtitle1" gutterBottom sx={{ color: '#fff', mb: 0.5 }}>
                      {store.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '0.8rem' }}>
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
                      borderColor: '#666',
                      color: '#fff',
                      '&:hover': {
                        borderColor: '#90caf9',
                        color: '#90caf9',
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
    </Container>
  );
};

export default HomePage;
