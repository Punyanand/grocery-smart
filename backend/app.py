from flask import Flask, request, jsonify
import pandas as pd
import os
import re
from flask_cors import CORS # type: ignore
import psycopg2 # type: ignore
import urllib.parse as up
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from supabase import create_client
from werkzeug.utils import secure_filename
import time
import logging
import traceback
import requests
from math import radians, sin, cos, sqrt, atan2
import json
import openai
from youtube_search import YoutubeSearch
import secrets
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
logging.basicConfig(level=logging.DEBUG)

load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "https://grocery-smart.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.after_request
def add_cors_headers(response):
    """ Ensure CORS headers are applied to every response """
    origin = request.headers.get('Origin')
    if origin in ["http://localhost:3000", "https://grocery-smart.vercel.app"]:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# PostgreSQL connection

DB_CONFIG = os.getenv("DATABASE_URL")  # Use environment variable
print("DB Config:", DB_CONFIG)

def get_db_connection():
    if not DB_CONFIG:
        print("ERROR: DATABASE_URL is not set!")
        return None

    print("Connecting to DB:", DB_CONFIG)  # Debugging: Check if the function runs

    try:
        up.uses_netloc.append("postgres")
        url = up.urlparse(DB_CONFIG)

        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port,
            sslmode="require"
        )
        print("Successfully connected to the database!")
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Get list of all stores
@app.route('/stores', methods=['GET'])
def get_stores():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cur = conn.cursor()
    cur.execute("SELECT * FROM stores ORDER BY id;")
    stores = [{"id": row[0], "name": row[1], "zip_code": row[2]} for row in cur.fetchall()]
    cur.close()
    conn.close()
    
    return jsonify(stores)

# Get store details, products, and flyers
@app.route('/store/<int:store_id>', methods=['GET'])
def get_store_data(store_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Fetch store details
        cur.execute("SELECT name FROM stores WHERE id = %s", (store_id,))
        store = cur.fetchone()

        if not store:
            return jsonify({"error": "Store not found"}), 404

        store_name = store[0]

        # Fetch products from this store (including quantity)
        cur.execute("SELECT name, price, quantity FROM products WHERE store_id = %s", (store_id,))
        products = [{"name": row[0], "price": row[1], "quantity": row[2]} for row in cur.fetchall()]

        # Fetch flyers for this store
        cur.execute("SELECT image_url FROM flyers WHERE store_id = %s", (store_id,))
        flyers = [{"image_url": re.sub(r'(?<!:)//', '/', row[0])} for row in cur.fetchall()]  # List of flyer image URLs

        return jsonify({
            "name": store_name,
            "products": products,
            "flyers": flyers  # Added flyers
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
   
#Upload product data (Crowdsourced)
@app.route('/upload_product', methods=['POST'])
def upload_product():
    data = request.json
    name, store_id, price, quantity = data.get("name"), data.get("store_id"), data.get("price"), data.get("quantity")

    if not all([name, store_id, price, quantity]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Check if the store exists
        cur.execute("SELECT id FROM stores WHERE id = %s;", (store_id,))
        if cur.fetchone() is None:
            return jsonify({"error": "Store ID does not exist"}), 400

        # Check if the product with exact same name and quantity exists for this store
        cur.execute("""
            SELECT id FROM products 
            WHERE name = %s AND store_id = %s AND quantity = %s;
        """, (name, store_id, quantity))
        existing_product = cur.fetchone()

        if existing_product:
            # Update existing product only if name and quantity match exactly
            cur.execute("""
                UPDATE products 
                SET price = %s 
                WHERE id = %s
                RETURNING id;
            """, (price, existing_product[0]))
            product_id = existing_product[0]
            message = "Product price updated successfully"
        else:
            # Insert new product if no exact match found
            cur.execute("""
                INSERT INTO products (name, store_id, price, quantity) 
                VALUES (%s, %s, %s, %s) 
                RETURNING id;
            """, (name, store_id, price, quantity))
            product_id = cur.fetchone()[0]
            message = "New product added successfully"

        conn.commit()
        return jsonify({"message": message, "product_id": product_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

#Upload flyer image
@app.route('/upload_flyer', methods=['POST'])
def upload_flyer():
    logging.debug(f"Request received: {request.form}, Files: {request.files}")
    if 'file' not in request.files or 'store_id' not in request.form:
        return jsonify({"error": "Missing required fields"}), 400

    file = request.files['file']
    store_id = request.form['store_id']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Secure the filename and generate a unique name
    filename = secure_filename(f"{int(time.time())}_{file.filename}")
    print(f"File to be uploaded: {filename}")
    # Upload to Supabase Storage
    try:
        # Verify if Supabase Upload is Working
        # Convert file to binary before sending to Supabase
        file_data = file.read()  

        response = supabase.storage.from_("flyers").upload(
            f"{filename}",  # File path in storage
            file_data,  # Binary content
            file_options={"content-type": file.content_type}  # Ensure correct MIME type
        )

        image_url = f"{SUPABASE_URL}/storage/v1/object/public/flyers/{filename}"
        print(f"Image URL: {image_url}")
        updated_at = datetime.now(timezone.utc)

        # Insert flyer details into the database
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO flyers (store_id, image_url, uploaded_at) 
            VALUES (%s, %s, %s) RETURNING id;
        """, (store_id, image_url, updated_at))
        
        flyer_id = cur.fetchone()
        if not flyer_id:
            print("Database insertion failed!")
        else:
            print(f"Flyer inserted with ID: {flyer_id[0]}")
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "message": "Flyer uploaded successfully", 
            "flyer_id": flyer_id[0], 
            "store_id": store_id, 
            "image_url": image_url, 
            "updated_at": updated_at
        }), 201

    except Exception as e:
        print("Upload error:", str(e))
        traceback.print_exc()  # Prints full error traceback
        return jsonify({"error": str(e)}), 500

# Function to get ZIP code coordinates
def get_zip_coordinates(zip_code):
    try:
        # Using the free ZIP code API
        response = requests.get(f"https://api.zippopotam.us/us/{zip_code}")
        if response.status_code == 200:
            data = response.json()
            return {
                "lat": float(data["places"][0]["latitude"]),
                "lng": float(data["places"][0]["longitude"])
            }
        return None
    except Exception as e:
        print(f"Error getting coordinates for ZIP code: {e}")
        return None

# Calculate distance between two ZIP codes using Haversine formula
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 3959.87433  # Earth's radius in miles

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return round(distance, 2)

# Get stores sorted by distance from user's ZIP code
@app.route('/stores/by-distance/<user_zip>', methods=['GET'])
def get_stores_by_distance(user_zip):
    try:
        # Get user's coordinates
        user_coords = get_zip_coordinates(user_zip)
        if not user_coords:
            return jsonify({"error": "Invalid ZIP code"}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get all stores
        cur.execute("SELECT id, name, zip_code FROM stores")
        stores = cur.fetchall()
        
        # Calculate distances and sort stores
        stores_with_distance = []
        for store in stores:
            store_id, store_name, store_zip = store
            store_coords = get_zip_coordinates(store_zip)
            
            if store_coords:
                distance = calculate_distance(
                    user_coords["lat"], user_coords["lng"],
                    store_coords["lat"], store_coords["lng"]
                )
                
                stores_with_distance.append({
                    "id": store_id,
                    "name": store_name,
                    "zip_code": store_zip,
                    "distance": distance
                })
        
        # Sort stores by distance
        stores_with_distance.sort(key=lambda x: x["distance"])
        
        cur.close()
        conn.close()
        
        return jsonify(stores_with_distance)
    
    except Exception as e:
        print(f"Error in get_stores_by_distance: {e}")
        return jsonify({"error": str(e)}), 500

# Modified compare_prices endpoint to include distance information
@app.route('/api/compare-prices', methods=['POST'])
def compare_prices():
    try:
        data = request.get_json()
        print("Received request data:", data)  # Debug log
        
        items = data.get('items', [])
        user_zip = data.get('userZip')
        
        print(f"Processing items: {items}, user_zip: {user_zip}")  # Debug log
        
        if not items:
            return jsonify({"error": "No items provided"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        cur = conn.cursor()
        
        # Create a placeholder string for the SQL IN clause
        items_placeholder = ','.join(['%s'] * len(items))
        
        query = f"""
            SELECT p.name, s.name as store_name, p.price, s.zip_code
            FROM products p
            JOIN stores s ON p.store_id = s.id
            WHERE LOWER(p.name) IN ({items_placeholder})
            ORDER BY p.name, p.price ASC
        """
        
        # Convert items to lowercase for case-insensitive comparison
        query_params = tuple(item.lower() for item in items)
        print(f"Executing query with params: {query_params}")  # Debug log
        
        cur.execute(query, query_params)
        data = cur.fetchall()
        print(f"Query returned {len(data)} rows")  # Debug log
        
        cur.close()
        conn.close()

        # Process data into best price format with actual savings calculation
        comparisons = {}
        total_best_price = 0
        
        # Get user coordinates if ZIP provided
        user_coords = get_zip_coordinates(user_zip) if user_zip else None
        
        # First pass to find the price range for each product
        for product_name, store_name, price, store_zip in data:
            store_distance = None
            if user_coords and store_zip:
                store_coords = get_zip_coordinates(store_zip)
                if store_coords:
                    store_distance = calculate_distance(
                        user_coords["lat"], user_coords["lng"],
                        store_coords["lat"], store_coords["lng"]
                    )

            if product_name not in comparisons:
                comparisons[product_name] = {
                    "bestStore": store_name,
                    "bestPrice": float(price),  # Convert to float
                    "worstPrice": float(price),  # Convert to float
                    "bestStoreDistance": store_distance,
                    "allPrices": [(store_name, float(price), store_distance)]  # Convert to float
                }
            else:
                comparisons[product_name]["allPrices"].append((store_name, float(price), store_distance))
                if price < comparisons[product_name]["bestPrice"]:
                    comparisons[product_name]["bestPrice"] = float(price)
                    comparisons[product_name]["bestStore"] = store_name
                    comparisons[product_name]["bestStoreDistance"] = store_distance
                if price > comparisons[product_name]["worstPrice"]:
                    comparisons[product_name]["worstPrice"] = float(price)

        # Calculate savings and format response
        result = []
        for product_name, data in comparisons.items():
            savings = data["worstPrice"] - data["bestPrice"]
            total_best_price += data["bestPrice"]
            
            result.append({
                "product": product_name,
                "bestStore": data["bestStore"],
                "bestPrice": data["bestPrice"],
                "bestStoreDistance": data["bestStoreDistance"],
                "savings": round(savings, 2),
                "allPrices": data["allPrices"]
            })

        response_data = {
            "items": result,
            "totalBestPrice": round(total_best_price, 2)
        }
        print("Sending response:", response_data)  # Debug log
        return jsonify(response_data)

    except Exception as e:
        print(f"Error in compare_prices: {str(e)}")
        print("Traceback:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

def optimize_shopping_stops(items, user_zip):
    try:
        print(f"Optimizing shopping stops for items: {items}")
        print(f"User ZIP: {user_zip}")
        
        if not items:
            return {"error": "No items provided"}, 400
            
        if not user_zip:
            return {"error": "ZIP code is required for optimization"}, 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Get coordinates for user's ZIP code
        user_coords = get_zip_coordinates(user_zip)
        if not user_coords:
            return {"error": "Invalid ZIP code"}, 400

        # Get prices for all items at all stores
        placeholders = ','.join(['%s'] * len(items))
        query = f"""
            SELECT p.store_id, p.name as product_name, p.price, s.name as store_name, s.zip_code
            FROM products p
            JOIN stores s ON p.store_id = s.id
            WHERE LOWER(p.name) IN ({placeholders})
        """
        print(f"Executing query: {query}")
        print(f"With parameters: {[item.lower() for item in items]}")
        
        cursor.execute(query, [item.lower() for item in items])
        prices = cursor.fetchall()
        print(f"Found {len(prices)} price entries")

        if not prices:
            return {"error": "No items found in any stores"}, 404

        # Group prices by store
        store_prices = {}
        for price in prices:
            store_id = price[0]
            if store_id not in store_prices:
                store_prices[store_id] = {
                    'name': price[3],
                    'zip_code': price[4],
                    'items': {}
                }
            store_prices[store_id]['items'][price[1]] = float(price[2])  # Convert price to float

        print(f"Found {len(store_prices)} stores with items")
        for store_id, store_data in store_prices.items():
            print(f"Store {store_data['name']} has {len(store_data['items'])} items")

        # Calculate distances from user's location to each store
        for store_id, store_data in store_prices.items():
            store_coords = get_zip_coordinates(store_data['zip_code'])
            if store_coords:
                store_data['distance'] = calculate_distance(
                    user_coords["lat"], user_coords["lng"],
                    store_coords["lat"], store_coords["lng"]
                )
            else:
                store_data['distance'] = float('inf')

        # Strategy 1: Price-optimized (best price for each item)
        price_optimized = find_price_optimized_stops(store_prices, items)
        print("Price optimized result:", price_optimized)
        
        # Strategy 2: Distance-optimized (closest stores first)
        distance_optimized = find_distance_optimized_stops(store_prices, items)
        print("Distance optimized result:", distance_optimized)
        
        # Strategy 3: Convenience-optimized (minimum stops)
        convenience_optimized = find_optimal_stops(store_prices, items)
        print("Convenience optimized result:", convenience_optimized)

        # Format response with all three strategies
        response = {
            "price_optimized": {
                "stores": price_optimized["stores"],
                "total_cost": float(price_optimized["total_cost"]),  # Ensure it's a number
                "total_distance": float(price_optimized["total_distance"]),  # Ensure it's a number
                "item_breakdown": price_optimized["item_breakdown"]
            },
            "distance_optimized": {
                "stores": distance_optimized["stores"],
                "total_cost": float(distance_optimized["total_cost"]),  # Ensure it's a number
                "total_distance": float(distance_optimized["total_distance"]),  # Ensure it's a number
                "item_breakdown": distance_optimized["item_breakdown"]
            },
            "convenience_optimized": {
                "stores": convenience_optimized["stores"],
                "total_cost": float(convenience_optimized["total_cost"]),  # Ensure it's a number
                "total_distance": float(convenience_optimized["total_distance"]),  # Ensure it's a number
                "item_breakdown": convenience_optimized["item_breakdown"]
            }
        }

        print("Final optimization response:", response)
        return response

    except Exception as e:
        print(f"Error in optimize_shopping_stops: {str(e)}")
        print("Traceback:", traceback.format_exc())
        return {"error": str(e)}, 500
    finally:
        if 'conn' in locals():
            conn.close()

def find_price_optimized_stops(store_prices, items):
    """Find the best price for each item, regardless of store."""
    result = {
        "stores": [],
        "total_cost": 0,
        "total_distance": 0,
        "item_breakdown": {}
    }
    
    print(f"Finding price-optimized stops for items: {items}")
    print(f"Available stores: {[store_data['name'] for store_data in store_prices.values()]}")
    
    # Find best price for each item
    for item in items:
        best_price = float('inf')
        best_store = None
        
        for store_id, store_data in store_prices.items():
            # Create case-insensitive mapping of items
            store_items = {k.lower(): (k, v) for k, v in store_data['items'].items()}
            if item.lower() in store_items:
                original_name, price = store_items[item.lower()]
                if price < best_price:
                    best_price = price
                    best_store = store_id
        
        if best_store is not None:
            if best_store not in result["stores"]:
                result["stores"].append(best_store)
            result["total_cost"] += best_price
            result["item_breakdown"][item] = {
                "store": store_prices[best_store]["name"],
                "price": best_price
            }
            print(f"Found {item} at {store_prices[best_store]['name']} for ${best_price}")
    
    # Calculate total distance
    for store_id in result["stores"]:
        result["total_distance"] += store_prices[store_id]["distance"]
    
    print(f"Price-optimized result: {result}")
    return result

def find_distance_optimized_stops(store_prices, items):
    """Find stores to visit based on distance, getting items from closest stores first."""
    result = {
        "stores": [],
        "total_cost": 0,
        "total_distance": 0,
        "item_breakdown": {}
    }
    
    print(f"Finding distance-optimized stops for items: {items}")
    
    # Sort stores by distance
    sorted_stores = sorted(
        store_prices.items(),
        key=lambda x: x[1]['distance']
    )
    
    remaining_items = set(items)
    print(f"Remaining items: {remaining_items}")
    
    # Try to get items from closest stores first
    for store_id, store_data in sorted_stores:
        if not remaining_items:
            break
            
        # Create case-insensitive mapping of items
        store_items = {k.lower(): (k, v) for k, v in store_data['items'].items()}
        available_items = {item for item in remaining_items if item.lower() in store_items}
        
        if available_items:
            result["stores"].append(store_id)
            result["total_distance"] += store_data["distance"]
            
            for item in available_items:
                original_name, price = store_items[item.lower()]
                result["total_cost"] += price
                result["item_breakdown"][item] = {
                    "store": store_data["name"],
                    "price": price
                }
                print(f"Found {item} at {store_data['name']} for ${price}")
            
            remaining_items -= available_items
    
    print(f"Distance-optimized result: {result}")
    return result

def find_optimal_stops(store_prices, items):
    """Find the minimum number of stores to visit."""
    result = {
        "stores": [],
        "total_cost": 0,
        "total_distance": 0,
        "item_breakdown": {}
    }
    
    print(f"Finding convenience-optimized stops for items: {items}")
    
    # First, find stores that have the most items
    store_coverage = {}
    for store_id, store_data in store_prices.items():
        # Create case-insensitive mapping of items
        store_items = {k.lower(): (k, v) for k, v in store_data['items'].items()}
        coverage = len({item for item in items if item.lower() in store_items})
        if coverage > 0:
            store_coverage[store_id] = coverage
    
    print(f"Store coverage: {store_coverage}")
    
    # Sort stores by coverage (descending) and then by distance
    sorted_stores = sorted(
        store_coverage.items(),
        key=lambda x: (-x[1], store_prices[x[0]]['distance'])
    )
    
    remaining_items = set(items)
    print(f"Remaining items: {remaining_items}")
    
    # Try to get items from stores with the most coverage first
    for store_id, _ in sorted_stores:
        if not remaining_items:
            break
            
        store_data = store_prices[store_id]
        # Create case-insensitive mapping of items
        store_items = {k.lower(): (k, v) for k, v in store_data['items'].items()}
        available_items = {item for item in remaining_items if item.lower() in store_items}
        
        if available_items:
            result["stores"].append(store_id)
            result["total_distance"] += store_data["distance"]
            
            for item in available_items:
                original_name, price = store_items[item.lower()]
                result["total_cost"] += price
                result["item_breakdown"][item] = {
                    "store": store_data["name"],
                    "price": price
                }
                print(f"Found {item} at {store_data['name']} for ${price}")
            
            remaining_items -= available_items
    
    print(f"Convenience-optimized result: {result}")
    return result

@app.route('/api/optimize-stops', methods=['POST'])
def optimize_stops():
    data = request.get_json()
    items = data.get('items', [])
    user_zip = data.get('userZip')
    
    result = optimize_shopping_stops(items, user_zip)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result)

@app.route('/api/recipe-search', methods=['POST'])
def recipe_search():
    try:
        data = request.get_json()
        query = data.get('query')
        
        if not query:
            return jsonify({'error': 'No search query provided'}), 400
            
        # Generate recipe using OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """You are a helpful recipe assistant. Provide recipes in a structured JSON format with:
                - name: The recipe name
                - ingredients: An array of clean ingredient names (just the ingredient, no measurements or descriptions)
                - instructions: An array of cooking steps
                
                Important rules for ingredients:
                1. List each vegetable separately, don't group them
                2. Don't use parentheses or "like" in ingredient names
                3. Don't use categories like "Vegetables" or "Spices"
                4. Each ingredient should be a single item
                
                Example:
                {
                    "name": "Vegetable Curry",
                    "ingredients": ["drumsticks", "carrots", "potatoes", "eggplant", "onions", "tomatoes", "ginger", "garlic", "turmeric", "cumin"],
                    "instructions": ["Chop all vegetables...", "Heat oil in a pan..."]
                }"""},
                {"role": "user", "content": f"Give me a recipe for {query}. List each vegetable and ingredient separately without any grouping or categories."}
            ],
            temperature=0.7
        )
        
        # Parse the response
        try:
            recipe_data = json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract the recipe data
            content = response.choices[0].message.content
            recipe_data = {
                "name": "",
                "ingredients": [],
                "instructions": []
            }
            
            # Try to find the recipe name
            name_match = re.search(r'"name":\s*"([^"]+)"', content)
            if name_match:
                recipe_data["name"] = name_match.group(1)
            
            # Try to find ingredients array
            ingredients_match = re.search(r'"ingredients":\s*\[(.*?)\]', content, re.DOTALL)
            if ingredients_match:
                ingredients_str = ingredients_match.group(1)
                recipe_data["ingredients"] = [ing.strip(' "') for ing in ingredients_str.split(',')]
            
            # Try to find instructions array
            instructions_match = re.search(r'"instructions":\s*\[(.*?)\]', content, re.DOTALL)
            if instructions_match:
                instructions_str = instructions_match.group(1)
                recipe_data["instructions"] = [inst.strip(' "') for inst in instructions_str.split(',')]
        
        # Search for YouTube videos
        video_links = search_youtube_videos(f"{query} recipe")
        recipe_data["videoLinks"] = video_links
        
        return jsonify(recipe_data)
        
    except Exception as e:
        print(f"Error in recipe search: {str(e)}")
        return jsonify({'error': 'Failed to generate recipe'}), 500

def search_youtube_videos(query, max_results=2):
    try:
        results = YoutubeSearch(query, max_results=max_results).to_dict()
        return [
            {
                "title": result["title"],
                "url": f"https://www.youtube.com/watch?v={result['id']}"
            }
            for result in results
        ]
    except Exception as e:
        print(f"Error searching YouTube videos: {str(e)}")
        return []

@app.route('/')
def home():
    return jsonify({"message": "Grocery Smart API is running!"})

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create user_sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            session_token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# User Authentication Endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Hash password
    password_hash = generate_password_hash(password)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)',
            (username, email, password_hash)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, password_hash FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user or not check_password_hash(user[2], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate session token
        session_token = secrets.token_hex(32)
        expires_at = datetime.now() + timedelta(days=7)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)',
            (user[0], session_token, expires_at)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Login successful',
            'session_token': session_token,
            'username': user[1]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No valid authorization token provided'}), 401
    
    session_token = auth_header.split(' ')[1]
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM user_sessions WHERE session_token = %s', (session_token,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify', methods=['GET'])
def verify_session():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No valid authorization token provided'}), 401
    
    session_token = auth_header.split(' ')[1]
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT u.username, u.email 
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP
        ''', (session_token,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'Invalid or expired session'}), 401
        
        return jsonify({
            'username': user[0],
            'email': user[1]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
