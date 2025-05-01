import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, Paper, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  margin: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
  },
}));

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <StyledPaper elevation={3}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                align="center" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#1a237e',
                  mb: 2,
                }}
              >
                Welcome to Grocery Smart
              </Typography>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                align="center" 
                sx={{ 
                  color: '#455a64',
                  mb: 4,
                }}
              >
                Your Intelligent Grocery Shopping Companion
              </Typography>
              <Typography 
                variant="body1" 
                align="center" 
                sx={{ 
                  color: '#455a64',
                  mb: 4,
                  maxWidth: '800px',
                  mx: 'auto',
                }}
              >
                Powered by community contributions, our app helps you make smarter shopping decisions by comparing prices across multiple stores.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            </StyledPaper>
          </Grid>

          {/* Vision & Mission Section */}
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <Typography variant="h4" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                Our Vision
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: '#455a64' }}>
                To revolutionize grocery shopping by making it smarter, more efficient, and cost-effective for everyone.
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <Typography variant="h4" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                Our Mission
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: '#455a64' }}>
                To empower consumers with intelligent tools that help them make informed shopping decisions, save money and time.
              </Typography>
            </StyledPaper>
          </Grid>

          {/* Features Section */}
          <Grid item xs={12}>
            <Typography 
              variant="h3" 
              align="center" 
              gutterBottom 
              sx={{ 
                color: '#1a237e',
                fontWeight: 'bold',
                mb: 6,
              }}
            >
              Key Features
            </Typography>
          </Grid>
          {/* First row with 3 cards */}
          <Grid item xs={12} md={4}>
            <FeatureCard>
              <ShoppingCartIcon sx={{ fontSize: 40, color: '#1a237e', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                Grocery Lists
              </Typography>
              <Typography variant="body1" sx={{ color: '#455a64' }}>
                Create and manage your grocery lists. Add items manually or from recipes to keep track of what you need.
              </Typography>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard>
              <CompareArrowsIcon sx={{ fontSize: 40, color: '#1a237e', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                Price Comparison
              </Typography>
              <Typography variant="body1" sx={{ color: '#455a64' }}>
                Compare prices across multiple stores to find the best deals and save money on your grocery items.
              </Typography>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard>
              <LocalGroceryStoreIcon sx={{ fontSize: 40, color: '#1a237e', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                Store Navigation
              </Typography>
              <Typography variant="body1" sx={{ color: '#455a64' }}>
                Find the most efficient route through stores to save time and energy while shopping.
              </Typography>
            </FeatureCard>
          </Grid>
          {/* Second row with 3 cards, centered */}
          <Grid item xs={12} sx={{ mt: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={4} sx={{ maxWidth: '1200px' }}>
              <Grid item xs={12} md={4}>
                <FeatureCard>
                  <RestaurantIcon sx={{ fontSize: 40, color: '#1a237e', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                    Recipe Search
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#455a64' }}>
                    Search for recipes and easily add their ingredients to your grocery list with a single click.
                  </Typography>
                </FeatureCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <FeatureCard>
                  <CalendarMonthIcon sx={{ fontSize: 40, color: '#1a237e', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                    Meal Planning
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#455a64' }}>
                    Get personalized 5-day meal plans based on items in your pantry and grocery list. Save time and reduce food waste with smart meal suggestions.
                  </Typography>
                </FeatureCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <FeatureCard>
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#1a237e', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                    Community Powered
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#455a64' }}>
                    Our app thrives on community contributions. Upload product prices and store flyers to help everyone find the best deals. The more users share, the better our price comparisons become.
                  </Typography>
                </FeatureCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage; 