import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import HomePage from './HomePage';
import StorePage from './StorePage';
import RecipeSearch from './components/RecipeSearch';
import UploadPage from './UploadPage';
import Navbar from './Navbar';
import MealPrepPage from './MealPrepPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const sessionToken = localStorage.getItem('sessionToken');
      console.log('Verifying session with token:', sessionToken);
      
      if (!sessionToken) {
        console.log('No session token found');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:10000'}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        });

        console.log('Session verification response:', response.status);
        
        if (response.ok) {
          console.log('Session verified successfully');
          setIsAuthenticated(true);
        } else {
          console.log('Session verification failed');
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('username');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session verification error:', error);
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering protected content');
  return children;
};

function App() {
  const [groceryList, setGroceryList] = useState(() => {
    // Initialize groceryList from localStorage if available, otherwise empty array
    const savedList = localStorage.getItem('groceryList');
    return savedList ? JSON.parse(savedList) : [];
  });

  // Save groceryList to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
  }, [groceryList]);

  // Function to add items to the grocery list
  const handleAddToGroceryList = (items) => {
    setGroceryList(prevList => {
      // Filter out items that are already in the list
      const newItems = items.filter(item => !prevList.includes(item));
      return [...prevList, ...newItems];
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Navbar />
                <HomePage groceryList={groceryList} setGroceryList={setGroceryList} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store/:storeId"
            element={
              <ProtectedRoute>
                <Navbar />
                <StorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipe-search"
            element={
              <ProtectedRoute>
                <Navbar />
                <RecipeSearch onAddToGroceryList={handleAddToGroceryList} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Navbar />
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-prep"
            element={
              <ProtectedRoute>
                <Navbar />
                <MealPrepPage groceryList={groceryList} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;