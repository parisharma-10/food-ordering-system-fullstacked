import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [foods, setFoods] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);


  const API = "http://127.0.0.1:8080/api/food";

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    const res = await axios.get(API);
    setFoods(res.data);
  };

  // Dummy restaurants
  const restaurants = [
    { name: "Dominos", type: "pizza" },
    { name: "McDonalds", type: "burger" },
    { name: "Shakes & Co", type: "drink" },
    { name: "Subway", type: "sandwich" },
    { name: "KFC", type: "chicken" },
  ];

  const filteredFoods = selectedRestaurant
  ? foods.filter(food => food.category === selectedRestaurant.type)
  : [];



  return (
    <div className="app">
  
      {/* LEFT SIDE */}
      <div className="main">
        <h1>🍔 Foodie App</h1>
  
        {/* STEP 1: RESTAURANTS */}
        {!selectedRestaurant && (
          <div className="restaurants">
            <h2>Select Restaurant</h2>
  
            {restaurants.map((res, index) => (
              <div
                key={index}
                className="restaurant-card"
                onClick={() => setSelectedRestaurant(res)}
              >
                {res.name}
              </div>
            ))}
          </div>
        )}
  
        {/* STEP 2: MENU */}
        {selectedRestaurant && (
          <>
            <button onClick={() => setSelectedRestaurant(null)}>
              ← Back
            </button>
  
            <h2>{selectedRestaurant.name} Menu</h2>
  
            <div className="grid">
              {filteredFoods.map((food) => (
                <div key={food.id} className="card">
                  <h3>{food.name}</h3>
                  <p>₹{food.price}</p>
  
                  <button
                    onClick={() => {
                      setCart((prev) => {
                        const updated = { ...prev };
  
                        if (updated[food.id]) {
                          updated[food.id].qty += 1;
                        } else {
                          updated[food.id] = { item: food, qty: 1 };
                        }
  
                        return updated;
                      });
                    }}
                  >
                    Add 🛒
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
  
      {/* RIGHT SIDE (SIDEBAR CART) */}
      <div className="cart">
        <h2>🛒 Cart</h2>
  
        {Object.keys(cart).length === 0 ? (
          <p>No items</p>
        ) : (
          <>
            {Object.values(cart).map(({ item, qty }) => (
              <div key={item.id} className="cart-item">
                <span>{item.name}</span>
  
                <div>
                  <button onClick={() => {
                    setCart(prev => {
                      const updated = { ...prev };
                      updated[item.id].qty -= 1;
                      if (updated[item.id].qty <= 0) delete updated[item.id];
                      return updated;
                    });
                  }}>➖</button>
  
                  <span>{qty}</span>
  
                  <button onClick={() => {
                    setCart(prev => {
                      const updated = { ...prev };
                      updated[item.id].qty += 1;
                      return updated;
                    });
                  }}>➕</button>
                </div>
              </div>
            ))}
  
            <h3>
              Total: ₹
              {Object.values(cart).reduce(
                (sum, { item, qty }) => sum + item.price * qty,
                0
              )}
            </h3>
  
            <button className="checkout" onClick={() => setShowCheckout(true)}>
  Proceed 
</button>
{showCheckout && (
  <div className="checkout-page">
    <div className="checkout-card">

      <h2>🧾 Order Summary</h2>

      {Object.values(cart).map(({ item, qty }) => (
        <div key={item.id} className="checkout-item">
          <span>{item.name}</span>
          <span>{qty} x ₹{item.price}</span>
        </div>
      ))}

      <h3>
        Total: ₹
        {Object.values(cart).reduce(
          (sum, { item, qty }) => sum + item.price * qty,
          0
        )}
      </h3>

      <h3>📍 Delivery Address</h3>
      <input placeholder="Enter your address" />

      <button
        className="place-order"
        onClick={() => {
          alert("Order placed 🎉");
          setCart({});
          setShowCheckout(false);
        }}
      >
        Place Order ✅
      </button>

      <button
        className="back-btn"
        onClick={() => setShowCheckout(false)}
      >
        ← Back
      </button>

    </div>
  </div>
)}
          </>
        )}
      </div>
  
    </div>
  );
}
export default App;