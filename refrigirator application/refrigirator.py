from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import sqlite3
from flask_cors import CORS
app = Flask(__name__)
CORS(app)



# Database Initialization
def init_db():
    conn = sqlite3.connect('fridge.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS items (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        quantity REAL,
                        unit TEXT,
                        expiration DATE,
                        history TEXT
                    )''')
    conn.commit()
    conn.close()

init_db()

def db_execute(query, params=(), fetch=False):
    conn = sqlite3.connect('fridge.db')
    cursor = conn.cursor()
    cursor.execute(query, params)
    result = cursor.fetchall() if fetch else None
    conn.commit()
    conn.close()
    return result

@app.route('/insert', methods=['POST'])
def insert_item():
    data = request.json
    name, quantity, unit, expiration = data['name'], data['quantity'], data['unit'], data.get('expiration')
    expiration_date = expiration if expiration else None
    db_execute('INSERT INTO items (name, quantity, unit, expiration, history) VALUES (?, ?, ?, ?, ?)', 
               (name, quantity, unit, expiration_date, f'Added {quantity} {unit} on {datetime.now()}'))
    return jsonify({'message': f'{quantity} {unit} of {name} added.'})

@app.route('/consume', methods=['POST'])
def consume_item():
    data = request.json
    name, quantity = data['name'], data['quantity']
    item = db_execute('SELECT quantity, unit FROM items WHERE name = ?', (name,), fetch=True)
    
    if not item or item[0][0] < quantity:
        return jsonify({'error': 'Not enough stock!'}), 400
    
    new_quantity = item[0][0] - quantity
    db_execute('UPDATE items SET quantity = ? WHERE name = ?', (new_quantity, name))
    return jsonify({'message': f'Consumed {quantity} {item[0][1]} of {name}.'})

@app.route('/status', methods=['GET'])
def status():
    items = db_execute('SELECT name, quantity, unit FROM items', fetch=True)
    return jsonify({'items': [{"name": i[0], "quantity": i[1], "unit": i[2]} for i in items]})

@app.route('/expired', methods=['GET'])
def expired_items():
    today = datetime.now().strftime('%Y-%m-%d')
    expired = db_execute('SELECT name, expiration FROM items WHERE expiration <= ?', (today,), fetch=True)
    return jsonify({'expired_items': [{"name": i[0], "expired_on": i[1]} for i in expired]})

@app.route('/history/<name>', methods=['GET'])
def item_history(name):
    history = db_execute('SELECT history FROM items WHERE name = ?', (name,), fetch=True)
    return jsonify({'history': history[0][0] if history else 'No history found'})

if __name__ == '__main__':
    app.run(debug=True)
