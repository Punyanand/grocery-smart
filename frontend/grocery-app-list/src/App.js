import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./HomePage";
import UploadPage from "./UploadPage";
import StorePage from "./StorePage";
import "./styles.css";

const App = () => {
  return (
    <Router>
      <header className="navbar">
        <h1>Grocery Smart 🛒</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/upload">Upload Data</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/store/:storeId" element={<StorePage />} />
      </Routes>
    </Router>
  );
};

export default App;
