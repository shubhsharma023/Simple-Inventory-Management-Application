import { useState, useEffect } from "react";
import axios from "axios";

export default function RefrigeratorApp() {
  const [items, setItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiration, setExpiration] = useState("");
  const [consumeName, setConsumeName] = useState("");
  const [consumeQuantity, setConsumeQuantity] = useState("");

  useEffect(() => {
    fetchStatus();
    fetchExpiredItems();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/status");
      setItems(response.data.items || []);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const fetchExpiredItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/expired");
      setExpiredItems(response.data.expired_items || []);
    } catch (error) {
      console.error("Error fetching expired items:", error);
    }
  };

  const addItem = async () => {
    await axios.post("http://localhost:5000/insert", {
      name,
      quantity: parseFloat(quantity),
      unit,
      expiration,
    });
    fetchStatus();
    fetchExpiredItems();
  };

  const consumeItem = async () => {
    await axios.post("http://localhost:5000/consume", {
      name: consumeName,
      quantity: parseFloat(consumeQuantity),
    });
    fetchStatus();
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Refrigerator Management</h1>

        {/* Add Item Form */}
        <div className="my-4">
          <h2>Add Item</h2>
          <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <input type="number" placeholder="Quantity" onChange={(e) => setQuantity(e.target.value)} />
          <input type="text" placeholder="Unit" onChange={(e) => setUnit(e.target.value)} />
          <input type="date" onChange={(e) => setExpiration(e.target.value)} />
          <button onClick={addItem}>Add</button>
        </div>

        {/* Consume Item Form */}
        <div className="my-4">
          <h2>Consume Item</h2>
          <input type="text" placeholder="Name" onChange={(e) => setConsumeName(e.target.value)} />
          <input type="number" placeholder="Quantity" onChange={(e) => setConsumeQuantity(e.target.value)} />
          <button onClick={consumeItem}>Consume</button>
        </div>

        {/* Current Items List */}
        <div className="my-4">
          <h2>Current Items</h2>
          <ul>
            {items.length > 0 ? (
              items.map((item, index) => (
                <li key={index}>{item.name} - {item.quantity} {item.unit}</li>
              ))
            ) : (
              <p>No items in the refrigerator.</p>
            )}
          </ul>
        </div>

        {/* Expired Items List */}
        <div className="my-4">
          <h2>Expired Items</h2>
          <ul>
            {expiredItems.length > 0 ? (
              expiredItems.map((item, index) => (
                <li key={index}>{item.name} expired on {item.expired_on}</li>
              ))
            ) : (
              <p>No expired items.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
