from flask import Flask, request, jsonify
import pandas as pd
import os
from flask_cors import CORS # type: ignore
import psycopg2 # type: ignore

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# Load product data from a CSV file
#df = pd.read_csv("products.csv")  # Contains product names, prices, stores
# PostgreSQL connection

DB_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "password",
    "host": "db.fpgilwjlwkzzmlwrylpk.supabase.co",
    "port": "5432"
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

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
            SELECT p.name, s.name AS store, p.price, s.zip_code 
            FROM products p
            JOIN stores s ON p.store_id = s.id
            WHERE LOWER(p.name) = %s
        """, (item,))

        store_results = [{"store": row[1], "price": row[2], "zip": row[3]} for row in cur.fetchall()]
        
        results.append({
            "name": item,
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

# Get products for a specific store
@app.route('/store/<int:store_id>', methods=['GET'])
def get_store_data(store_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch store details
    cur.execute("SELECT name FROM stores WHERE id = %s", (store_id,))
    store = cur.fetchone()

    if not store:
        return jsonify({"error": "Store not found"}), 404

    # Fetch products from this store
    cur.execute("SELECT name, price FROM products WHERE store_id = %s", (store_id,))
    products = [{"name": row[0], "price": row[1]} for row in cur.fetchall()]

    cur.close()
    conn.close()

    return jsonify({"store_name": store[0], "products": products})

#Upload product data (Crowdsourced)
@app.route('/upload_product', methods=['POST'])
def upload_product():
    data = request.json
    name, store_id, price = data.get("name"), data.get("store_id"), data.get("price")

    if not all([name, store_id, price]):
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
    cur.execute("INSERT INTO products (name, store_id, price) VALUES (%s, %s, %s) RETURNING id;", 
                (name, store_id, price))
    product_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({"message": "Product uploaded successfully", "product_id": product_id}), 201


# Upload a flyer for a store
@app.route('/upload_flyer', methods=['POST'])
def upload_flyer():
    data = request.json
    store_id, image_url = data.get("store_id"), data.get("image_url")

    if not all([store_id, image_url]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO flyers (store_id, image_url) VALUES (%s, %s) RETURNING id;", 
                (store_id, image_url))
    flyer_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Flyer uploaded successfully", "flyer_id": flyer_id}), 201

#  Get all flyers for a specific store
@app.route('/store/<int:store_id>/flyers', methods=['GET'])
def get_store_flyers(store_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT image_url FROM flyers WHERE store_id = %s;", (store_id,))
    flyers = [{"image_url": row[0]} for row in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify(flyers)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=True)