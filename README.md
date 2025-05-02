# Grocery List App

A smart grocery shopping application that helps users find the best prices, optimize shopping routes, and discover recipes based on available ingredients.

## Features

### 🛒 Smart Shopping
- **Price Comparison**: Compare prices across multiple stores
- **Route Optimization**: Find the most efficient shopping route based on your location
- **Store Distance**: Calculate distances to stores from your ZIP code

### 🍳 Recipe Integration
- **Recipe Search**: Find recipes based on available ingredients
- **Meal Prep Suggestions**: Get 5-day meal prep plans based on dietary preferences
- **YouTube Integration**: Find recipe videos for suggested meals

### 🔐 User Features
- **Authentication**: Secure user registration and login
- **Session Management**: Persistent user sessions


## Tech Stack

### Frontend
- React.js
- CSS

### Backend
- Python Flask
- PostgreSQL
- OpenAI API (for recipe generation)
- YouTube Data API
- ZIP Code API

## Setup Instructions

### Prerequisites
- Python 3.8+
- PostgreSQL
- OpenAI API key
- YouTube Data API key

### Backend Setup
1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   # Edit .env with your credentials
   ```
5. Initialize the database:
   ```bash
   python backend/app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Shopping
- `POST /api/compare-prices`: Compare prices across stores
- `POST /api/optimize-stops`: Optimize shopping route
- `GET /stores`: List all stores
- `GET /store/<store_id>`: Get store details

### Recipes
- `POST /api/recipe-search`: Search for recipes
- `POST /api/meal-prep-suggestion`: Get meal prep suggestions

### Authentication
- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: User login
- `POST /api/auth/logout`: User logout
- `GET /api/auth/verify`: Verify session

## Product Synonyms

The app supports smart matching of product names. For example:
- "onions" ↔ "onion"
- "ladies finger" ↔ "okra" ↔ "bhindi"
- "cumin" ↔ "cumin seeds" ↔ "jeera"
- "methi" ↔ "fenugreek seeds"
- "turmeric" ↔ "haldi" ↔ "turmeric powder"

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- OpenAI for recipe generation
- YouTube Data API for recipe videos
- ZIP Code API for location services 