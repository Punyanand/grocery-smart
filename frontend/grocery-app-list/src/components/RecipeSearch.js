import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const RecipeSearch = ({ onAddToGroceryList }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(() => {
    // Initialize from localStorage if available
    const savedRecipe = localStorage.getItem('selectedRecipe');
    return savedRecipe ? JSON.parse(savedRecipe) : null;
  });
  const [selectedIngredients, setSelectedIngredients] = useState(new Set());

  // Save recipe to localStorage whenever it changes
  useEffect(() => {
    if (selectedRecipe) {
      localStorage.setItem('selectedRecipe', JSON.stringify(selectedRecipe));
    } else {
      localStorage.removeItem('selectedRecipe');
    }
  }, [selectedRecipe]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setSelectedIngredients(new Set());
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:10000';
      const response = await fetch(`${apiUrl}/api/recipe-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSelectedRecipe(data);
      } else {
        let errorMessage = 'Failed to search for recipe';
        if (response.status === 401) {
          errorMessage = 'OpenAI API key is invalid. Please check your configuration.';
        } else if (response.status === 429) {
          errorMessage = 'API rate limit exceeded. Please try again later.';
        } else if (data.error) {
          errorMessage = data.error;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroceryList = () => {
    if (!selectedRecipe || !selectedRecipe.ingredients) return;
    
    // Get the actual ingredient names from the selected indices
    const selectedItems = Array.from(selectedIngredients)
      .map(index => selectedRecipe.ingredients[index]);
    
    if (selectedItems.length > 0) {
      onAddToGroceryList(selectedItems);
      setSelectedIngredients(new Set());
    }
  };

  const handleIngredientSelect = (index) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: 3,
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          backgroundColor: 'white'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: '#2c3e50',
            fontWeight: 'bold',
            mb: 3
          }}
        >
          Recipe Search
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="What cuisine or recipe are you looking for?"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3498db',
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={!loading && <SearchIcon />}
            sx={{ 
              minWidth: 100,
              backgroundColor: '#3498db',
              '&:hover': {
                backgroundColor: '#2980b9',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {selectedRecipe && (
        <Card sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: 3
        }}>
          <CardContent>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: '#2c3e50',
                fontWeight: 'bold'
              }}
            >
              {selectedRecipe.name}
            </Typography>
            
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: '#2c3e50',
                mt: 2
              }}
            >
              Ingredients
            </Typography>
            
            <List>
              {selectedRecipe.ingredients && selectedRecipe.ingredients.map((ingredient, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      backgroundColor: 'transparent',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                      }
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedIngredients.has(index)}
                          onChange={() => handleIngredientSelect(index)}
                          sx={{
                            color: '#3498db',
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            color: '#2c3e50',
                            fontWeight: 'medium',
                          }}
                        >
                          {ingredient}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < selectedRecipe.ingredients.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: '#2c3e50',
                mt: 2
              }}
            >
              Instructions
            </Typography>
            <List>
              {selectedRecipe.instructions && selectedRecipe.instructions.map((instruction, index) => (
                <ListItem key={index}>
                  <Typography
                    sx={{
                      color: '#2c3e50',
                    }}
                  >
                    {index + 1}. {instruction}
                  </Typography>
                </ListItem>
              ))}
            </List>

            {selectedIngredients.size > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleAddToGroceryList}
                  startIcon={<AddShoppingCartIcon />}
                  sx={{
                    backgroundColor: '#2ecc71',
                    '&:hover': {
                      backgroundColor: '#27ae60',
                    },
                  }}
                >
                  Add {selectedIngredients.size} Item{selectedIngredients.size > 1 ? 's' : ''} to Grocery List
                </Button>
              </Box>
            )}

            {selectedRecipe.videoLinks && selectedRecipe.videoLinks.length > 0 && (
              <>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: '#2c3e50',
                    mt: 2
                  }}
                >
                  Video Tutorials
                </Typography>
                <Grid container spacing={2}>
                  {selectedRecipe.videoLinks.map((video, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Button
                        variant="outlined"
                        startIcon={<YouTubeIcon />}
                        href={video.url}
                        target="_blank"
                        fullWidth
                        sx={{ 
                          borderColor: '#e74c3c',
                          color: '#e74c3c',
                          '&:hover': {
                            backgroundColor: '#fdf2f0',
                            borderColor: '#c0392b',
                          },
                        }}
                      >
                        {video.title}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RecipeSearch; 