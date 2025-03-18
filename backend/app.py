from flask import Flask, request, jsonify
import pandas as pd
import os
from flask_cors import CORS # type: ignore
import psycopg2 # type: ignore
import urllib.parse as up
from dotenv import load_dotenv
from datetime import datetime, timezone
from supabase import create_client
from werkzeug.utils import secure_filename
import time
import logging
import traceback
logging.basicConfig(level=logging.DEBUG)

load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True, allow_headers=["Content-Type"])

@app.after_request
def add_cors_headers(response):
    """ Ensure CORS headers are applied to every response """
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
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

#Price comparison across stores
@app.route('/search', methods=['GET'])
def search_products():
    query = request.args.get("query", "").strip()
    
    if not query:
        return jsonify({"error": "No search query provided"}), 400

    items = query.split(",")
    conn = get_db_connection()
    cur = conn.cursor()
    
    results = []

    for item in items:
        item = item.strip().lower()
        cur.execute("""
            SELECT p.name, s.name AS store, p.price, p.quantity, s.zip_code 
            FROM products p
            JOIN stores s ON p.store_id = s.id
            WHERE LOWER(p.name) = %s
        """, (item,))

        store_results = [{"store": row[1], "price": row[2], "quantity": row[3], "zip": row[4]} for row in cur.fetchall()]
        
        results.append({
            "name": item.upper(),
            "stores": store_results if store_results else []  # Empty array if no stores found
        })

    cur.close()
    conn.close()
    
    return jsonify(results)


@app.route('/check_products', methods=['POST'])
def check_products():
    data = request.get_json()
    items = data.get("items", [])

    results = []
    for item in items:
        matches = df[df["product_name"].str.lower() == item.lower()]  # Get all matching rows
        available_stores = []
        
        for _, row in matches.iterrows():
            if row["availability"].strip().lower() == "in stock":  # Only include available items
                available_stores.append({
                    "store": row["store"],
                    "price": float(row["price"]),
                    "zip": row["zip"]
                })

        if available_stores:  # If at least one store has the product in stock
            results.append({
                "name": item,
                "stores": available_stores
            })

    return jsonify(results)


#  Get list of all stores
@app.route('/stores', methods=['GET'])
def get_stores():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, zip_code FROM stores;")
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
        flyers = [{"image_url": row[0].replace("//", "/")} for row in cur.fetchall()]  # List of flyer image URLs

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

#Test Supabase Storage Connection
@app.route('/test_supabase_storage', methods=['GET'])
def test_supabase_storage():
    try:
        response = supabase.storage.from_("flyers").list()
        print("🗂 Supabase Storage Files:", response)  # Debugging
        return jsonify({"files": response})
    except Exception as e:
        print("🚨 Supabase Storage Error:", str(e))
        return jsonify({"error": str(e)}), 500
    
#Upload product data (Crowdsourced)
@app.route('/upload_product', methods=['POST'])
def upload_product():
    data = request.json
    name, store_id, price, quantity = data.get("name"), data.get("store_id"), data.get("price"), data.get("quantity")

    if not all([name, store_id, price, quantity]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if the store exists
    cur.execute("SELECT id FROM stores WHERE id = %s;", (store_id,))
    if cur.fetchone() is None:
        cur.close()
        conn.close()
        return jsonify({"error": "Store ID does not exist"}), 400

    # Insert the product
    cur.execute("INSERT INTO products (name, store_id, price, quantity) VALUES (%s, %s, %s, %s) RETURNING id;", 
                (name, store_id, price, quantity))
    product_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({"message": "Product uploaded successfully", "product_id": product_id}), 201

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
    


@app.route('/')
def home():
    return jsonify({"message": "Grocery Smart API is running!"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
