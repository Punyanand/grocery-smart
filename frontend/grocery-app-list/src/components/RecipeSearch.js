
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
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const RecipeSearch = ({ onAddToGroceryList }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(() => {
    const savedRecipe = localStorage.getItem('selectedRecipe');
    return savedRecipe ? JSON.parse(savedRecipe) : null;
  });
  const [selectedIngredients, setSelectedIngredients] = useState(new Set());
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [mealPrepSuggestion, setMealPrepSuggestion] = useState("");
  const [mealPrepLoading, setMealPrepLoading] = useState(false);
  const [mealPrepVideos, setMealPrepVideos] = useState([]);

  const dietaryOptions = [
    "Vegetarian", "Non-Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free"
  ];

  useEffect(() => {
    if (selectedRecipe) {
      localStorage.setItem('selectedRecipe', JSON.stringify(selectedRecipe));
    } else {
      localStorage.removeItem('selectedRecipe');
    }
  }, [selectedRecipe]);

  const handleExportPDF = async () => {
    const content = document.getElementById('meal-prep-content');
    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('meal-prep.pdf');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedIngredients(new Set());
    setMealPrepSuggestion("");
    setMealPrepVideos([]);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:10000';
      const response = await fetch(`${apiUrl}/api/recipe-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedRecipe(data);
      } else {
        setError(data.error || 'Failed to search for recipe');
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroceryList = () => {
    if (!selectedRecipe || !selectedRecipe.ingredients) return;

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

  const handlePreferenceToggle = (option) => {
    setSelectedPreferences(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleMealPrepSuggestion = async () => {
    if (selectedPreferences.length === 0 || !selectedRecipe) return;

    setMealPrepLoading(true);
    setMealPrepSuggestion("");
    setMealPrepVideos([]);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:10000';
      const response = await fetch(`${apiUrl}/api/meal-prep-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: selectedPreferences,
          ingredients: selectedRecipe.ingredients || [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMealPrepSuggestion(data.suggestion);
        setMealPrepVideos(data.videos || []);
      } else {
        setMealPrepSuggestion("Couldn't generate meal prep. Please try again.");
      }
    } catch (error) {
      console.error('Error fetching meal prep suggestion:', error);
      setMealPrepSuggestion("Failed to connect to server.");
    } finally {
      setMealPrepLoading(false);
    }
  };

  const preferenceCategories = [
  {
    title: "Dietary Preferences",
    examples: ["Vegetarian", "Vegan", "Paleo", "Keto"],
    note: "Based on choice or lifestyle."
  },
  {
    title: "Dietary Restrictions",
    examples: ["Gluten-Free", "Lactose-Intolerant", "Nut-Free"],
    note: "Based on allergies, intolerances, medical conditions."
  },
  {
    title: "Macronutrient Focused Diets",
    examples: ["High-Carb", "Low-Carb", "High-Protein"],
    note: "Based on nutrient ratios (not ingredient exclusions)."
  },
  {
    title: "Ingredient Inclusion/Exclusion",
    examples: ["Dairy-Free", "Sugar-Free", "No-Red-Meat"],
    note: "Focused on specific ingredient presence or absence."
  }
];


  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Search Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2, backgroundColor: 'white' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold', mb: 3 }}>
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
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={!loading && <SearchIcon />}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Selected Recipe Section */}
      {selectedRecipe && (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
              {selectedRecipe.name}
            </Typography>

            {/* Ingredients */}
            <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', mt: 2 }}>
              Ingredients
            </Typography>
            <List>
              {selectedRecipe.ingredients && selectedRecipe.ingredients.map((ingredient, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedIngredients.has(index)}
                          onChange={() => handleIngredientSelect(index)}
                          sx={{ color: '#3498db' }}
                        />
                      }
                      label={<Typography>{ingredient}</Typography>}
                    />
                  </ListItem>
                  {index < selectedRecipe.ingredients.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {/* Add to Grocery List */}
            {selectedIngredients.size > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleAddToGroceryList}
                  startIcon={<AddShoppingCartIcon />}
                  sx={{ backgroundColor: '#2ecc71' }}
                >
                  Add {selectedIngredients.size} Item{selectedIngredients.size > 1 ? 's' : ''} to Grocery List
                </Button>
              </Box>
            )}

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {preferenceCategories.map((category, idx) => (
                <Box key={idx} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#34495e' }}>
                    {category.title}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'gray' }}>
                    {category.note}
                  </Typography>
                  <Grid container spacing={1}>
                    {category.examples.map((option) => (
                      <Grid item key={option}>
                        <Button
                          variant={selectedPreferences.includes(option) ? "contained" : "outlined"}
                          onClick={() => handlePreferenceToggle(option)}
                          sx={{
                            backgroundColor: selectedPreferences.includes(option) ? '#3498db' : 'white',
                            color: selectedPreferences.includes(option) ? 'white' : '#3498db',
                            borderColor: '#3498db',
                            textTransform: 'none'
                          }}
                        >
                          {option}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </motion.div>

            {/* Meal Prep Suggestion Button */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleMealPrepSuggestion}
                disabled={mealPrepLoading || selectedPreferences.length === 0}
                sx={{ backgroundColor: '#1c6692', '&:hover': { backgroundColor: '#2c3e50' } }}
              >
                {mealPrepLoading ? <CircularProgress size={24} color="inherit" /> : 'Suggest Meal Prep'}
              </Button>
            </Box>
            <div id="meal-prep-content">
            {/* Meal Prep Suggestion with Icons */}
            {mealPrepSuggestion && (
              <Paper elevation={2} sx={{ mt: 3, p: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
                    Personalized Meal Prep Suggestion
                  </Typography>
                  <Button variant="outlined" onClick={handleExportPDF}>
                    Download as PDF
                  </Button>
                </Box>
                {mealPrepSuggestion.split(/Day \d:/).filter(Boolean).map((block, i) => {
                  const lines = block.trim().split('\n');
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.2 }}
                    >
                    <Paper key={i} elevation={1} sx={{ p: 2, mb: 2, backgroundColor: 'white', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2980b9', mb: 1 }}>
                        <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Day {i + 1}
                      </Typography>
                      {lines.map((line, idx) => {
                      const [meal, description] = line.includes(':') ? line.split(':') : [line, ''];
                      const icon = meal.toLowerCase().includes('breakfast') ? <FreeBreakfastIcon sx={{ mt: '2px', mr: 1 }} /> :
                                    meal.toLowerCase().includes('lunch') ? <LunchDiningIcon sx={{ mt: '2px', mr: 1 }} /> :
                                    <DinnerDiningIcon sx={{ mt: '2px', mr: 1 }} />;
                      return (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          {icon}
                          <Typography sx={{ lineHeight: 1.6 }}>
                            <strong>{meal?.trim()}:</strong> {description?.trim()}
                          </Typography>
                        </Box>
                      );
                      })}
                    </Paper>
                    </motion.div>
                  );
                })}
              </Paper>
            )}
            </div>

            {/* Video Thumbnails */}
            {mealPrepVideos.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', mt: 3 }}>
                  Video Guides for Your Meals
                </Typography>
                <Grid container spacing={2}>
                  {mealPrepVideos.map((item, index) => {
                    const videoIdMatch = item.video.url.match(/v=([^&]+)/);
                    const videoId = videoIdMatch ? videoIdMatch[1] : null;
                    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

                    return (
                      <Grid item xs={12} sm={6} key={index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.0 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <a href={item.video.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Paper elevation={3} sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                              {thumbnailUrl && (
                                <img src={thumbnailUrl} alt={item.meal} style={{ width: '100%', borderRadius: '12px', marginBottom: '8px' }} />
                              )}
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                {item.meal.length > 30 ? `${item.meal.substring(0, 27)}...` : item.meal}
                              </Typography>
                            </Paper>
                          </a>
                        </motion.div>
                      </Grid>
                    );
                  })}
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
