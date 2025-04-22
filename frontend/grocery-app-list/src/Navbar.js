import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
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
        <Box sx={{ display: 'flex', gap: 2 }}>
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