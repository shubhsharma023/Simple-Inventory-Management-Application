import { useState, useEffect } from "react";
import axios from "axios";

export default function RefrigeratorApp() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiration, setExpiration] = useState("");
  const [consumeName, setConsumeName] = useState("");
  const [consumeQuantity, setConsumeQuantity] = useState("");
  const [expiredItems, setExpiredItems] = useState([]);

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
    <div className="flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold text-center">Refrigerator Management</h1>
      
      <div className="my-4 w-1/2">
        <h2 className="text-lg font-semibold">Add Item</h2>
        <input className="block w-full p-2 border rounded" type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input className="block w-full p-2 border rounded mt-2" type="number" placeholder="Quantity" onChange={(e) => setQuantity(e.target.value)} />
        <input className="block w-full p-2 border rounded mt-2" type="text" placeholder="Unit" onChange={(e) => setUnit(e.target.value)} />
        <input className="block w-full p-2 border rounded mt-2" type="date" onChange={(e) => setExpiration(e.target.value)} />
        <button className="block w-full p-2 mt-2 bg-blue-500 text-white rounded" onClick={addItem}>Add</button>
      </div>

      <div className="my-4 w-1/2">
        <h2 className="text-lg font-semibold">Consume Item</h2>
        <input className="block w-full p-2 border rounded" type="text" placeholder="Name" onChange={(e) => setConsumeName(e.target.value)} />
        <input className="block w-full p-2 border rounded mt-2" type="number" placeholder="Quantity" onChange={(e) => setConsumeQuantity(e.target.value)} />
        <button className="block w-full p-2 mt-2 bg-red-500 text-white rounded" onClick={consumeItem}>Consume</button>
      </div>

      <div className="my-4 w-1/2">
        <h2 className="text-lg font-semibold">Current Items</h2>
        <ul className="border p-3 rounded w-full">
          {items.length > 0 ? items.map((item, index) => (
            <li key={index} className="py-1 border-b">{item.name} - {item.quantity} {item.unit}</li>
          )) : <p className="text-gray-500">No items in the refrigerator.</p>}
        </ul>
      </div>

      <div className="my-4 w-1/2">
        <h2 className="text-lg font-semibold">Expired Items</h2>
        <ul className="border p-3 rounded w-full">
          {expiredItems.length > 0 ? expiredItems.map((item, index) => (
            <li key={index} className="py-1 border-b">{item.name} expired on {item.expired_on}</li>
          )) : <p className="text-gray-500">No expired items.</p>}
        </ul>
      </div>
    </div>
  );
}
