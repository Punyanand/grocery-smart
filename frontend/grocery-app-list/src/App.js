import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./HomePage";
import UploadPage from "./UploadPage";
import StorePage from "./StorePage";
import RecipeSearch from "./components/RecipeSearch";
import "./styles.css";

const App = () => {
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
    <Router>
      <header className="navbar">
        <h1>Grocery Smart 🛒</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/upload">Upload Data</Link>
          <Link to="/recipes">Recipe Search</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage groceryList={groceryList} setGroceryList={setGroceryList} />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/store/:storeId" element={<StorePage />} />
        <Route path="/recipes" element={<RecipeSearch onAddToGroceryList={handleAddToGroceryList} />} />
      </Routes>
    </Router>
  );
};

export default App;
