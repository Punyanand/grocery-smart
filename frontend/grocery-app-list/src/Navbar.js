import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import API_BASE_URL from './config';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/home"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
          }}
        >
          Grocery Smart 🛒
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/home"
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/recipe-search"
          >
            Recipe Search
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/upload"
          >
            Upload
          </Button>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            style={{ display: 'inline-block' }}
          >
            <IconButton
              component={Link}
              to="/meal-prep"
              color="inherit"
            >
              <RestaurantMenuIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </motion.div>
          {username && (
            <Button
              color="inherit"
              onClick={handleLogout}
            >
              Logout ({username})
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;