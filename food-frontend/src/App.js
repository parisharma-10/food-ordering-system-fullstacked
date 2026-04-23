import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8080/api/food";

const RESTAURANTS = [
  {
    id: 1,
    name: "Dominos",
    emoji: "🍕",
    tag: "Pizza · Italian",
    rating: 4.5,
    time: "25–35 min",
    color: "#E8001D",
    menu: [
      { id: 101, name: "Margherita Pizza", desc: "Classic tomato & mozzarella", price: 249, emoji: "🍕" },
      { id: 102, name: "Pepperoni Feast", desc: "Loaded with pepperoni slices", price: 349, emoji: "🍕" },
      { id: 103, name: "Garlic Breadsticks", desc: "Crispy, buttery, cheesy", price: 129, emoji: "🥖" },
      { id: 104, name: "BBQ Chicken Pizza", desc: "Smoky BBQ sauce & grilled chicken", price: 379, emoji: "🍕" },
    ],
  },
  {
    id: 2,
    name: "McDonalds",
    emoji: "🍔",
    tag: "Burgers · Fast Food",
    rating: 4.2,
    time: "15–25 min",
    color: "#DA9B00",
    menu: [
      { id: 201, name: "McAloo Tikki", desc: "Spiced potato patty burger", price: 99, emoji: "🍔" },
      { id: 202, name: "Big Mac", desc: "Double beef patty, special sauce", price: 249, emoji: "🍔" },
      { id: 203, name: "McChicken", desc: "Crispy chicken fillet", price: 199, emoji: "🍗" },
      { id: 204, name: "Fries (Large)", desc: "Golden & crispy", price: 119, emoji: "🍟" },
    ],
  },
  {
    id: 3,
    name: "Shakes & Co",
    emoji: "🥤",
    tag: "Shakes · Desserts",
    rating: 4.7,
    time: "20–30 min",
    color: "#9B5DE5",
    menu: [
      { id: 301, name: "Chocolate Fudge Shake", desc: "Rich dark chocolate, whipped cream", price: 199, emoji: "🍫" },
      { id: 302, name: "Mango Tango", desc: "Fresh mango pulp shake", price: 179, emoji: "🥭" },
      { id: 303, name: "Strawberry Dream", desc: "Fresh strawberries & cream", price: 189, emoji: "🍓" },
      { id: 304, name: "Oreo Blast", desc: "Crushed Oreo cookie shake", price: 209, emoji: "🍪" },
    ],
  },
  {
    id: 4,
    name: "Subway",
    emoji: "🥪",
    tag: "Subs · Healthy",
    rating: 4.3,
    time: "10–20 min",
    color: "#00833D",
    menu: [
      { id: 401, name: "Veggie Delite", desc: "Fresh veggies in Italian bread", price: 229, emoji: "🥪" },
      { id: 402, name: "Chicken Teriyaki", desc: "Glazed teriyaki chicken", price: 289, emoji: "🥪" },
      { id: 403, name: "Tuna Sub", desc: "Classic tuna with veggies", price: 269, emoji: "🐟" },
      { id: 404, name: "Meatball Marinara", desc: "Spiced meatballs in marinara", price: 299, emoji: "🍝" },
    ],
  },
  {
    id: 5,
    name: "KFC",
    emoji: "🍗",
    tag: "Chicken · Fast Food",
    rating: 4.4,
    time: "20–30 min",
    color: "#F40027",
    menu: [
      { id: 501, name: "Original Recipe", desc: "11 herbs & spices fried chicken", price: 299, emoji: "🍗" },
      { id: 502, name: "Zinger Burger", desc: "Crispy spicy chicken fillet", price: 249, emoji: "🍔" },
      { id: 503, name: "Popcorn Chicken", desc: "Bite-sized crispy pieces", price: 179, emoji: "🍿" },
      { id: 504, name: "Coleslaw", desc: "Creamy & refreshing side", price: 89, emoji: "🥗" },
    ],
  },
];

const StarRating = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        onClick={() => onChange(s)}
        style={{
          fontSize: 28,
          cursor: "pointer",
          color: s <= value ? "#F59E0B" : "#D1D5DB",
          transition: "color 0.15s, transform 0.1s",
          transform: s <= value ? "scale(1.15)" : "scale(1)",
          userSelect: "none",
        }}
      >
        ★
      </span>
    ))}
  </div>
);

export default function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Review state
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Checkout form
  const [form, setForm] = useState({ name: "", address: "", phone: "", payment: "cash" });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (item, restaurant) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        showToast(`${item.name} quantity updated`);
        return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      showToast(`${item.emoji} ${item.name} added to cart`);
      return [...prev, { ...item, qty: 1, restaurant: restaurant.name }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id));
  const updateQty = (id, delta) => setCart((prev) =>
    prev.map((c) => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0)
  );

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const placeOrder = () => {
    setCheckoutOpen(false);
    setOrderPlaced(true);
    setCart([]);
    setTimeout(() => {
      setOrderPlaced(false);
      setReviewOpen(true);
    }, 2500);
  };

  const submitReview = () => {
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewOpen(false);
      setReviewSubmitted(false);
      setFoodRating(0);
      setDeliveryRating(0);
      setReviewText("");
    }, 2000);
  };

  const restaurant = selectedRestaurant ? RESTAURANTS.find((r) => r.id === selectedRestaurant) : null;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#F9F5F0", minHeight: "100vh" }}>
      {/* NAVBAR */}
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #F0EBE3",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🍔</span>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px", color: "#1A1A1A" }}>
            Taste<span style={{ color: "#EF4444" }}>Now</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {["Home", "About us", "Blog", "Contact us"].map((l) => (
            <span key={l} style={{ fontSize: 14, color: "#555", cursor: "pointer", fontWeight: 500 }}>{l}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              position: "relative", background: "none", border: "none", cursor: "pointer",
              fontSize: 22, padding: "6px 8px",
            }}
          >
            🛒
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 0, right: 0,
                background: "#EF4444", color: "#fff", borderRadius: "50%",
                width: 18, height: 18, fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{cartCount}</span>
            )}
          </button>
          <button style={{
            background: "#EF4444", color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Sign up</button>
        </div>
      </nav>

      {/* HERO */}
      {!selectedRestaurant && (
        <div style={{
          background: "linear-gradient(135deg, #FFF5F5 0%, #FFF9F0 50%, #F0F9FF 100%)",
          padding: "4rem 2rem 3rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{
              display: "inline-block",
              background: "#FEE2E2", color: "#EF4444",
              borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600,
              marginBottom: 16,
            }}>🔥 Fast delivery in your area</div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, lineHeight: 1.15, margin: "0 0 16px", color: "#1A1A1A", letterSpacing: "-1px" }}>
              Experience food<br />
              <span style={{ color: "#EF4444" }}>Delivery</span> like no other
            </h1>
            <p style={{ fontSize: 16, color: "#777", maxWidth: 460, margin: "0 auto 2rem", lineHeight: 1.7 }}>
              We deliver the food of your choice wherever, whenever. Select from the top restaurants in your area and get it in a flash.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <input
                placeholder="🔍  Search restaurants or dishes..."
                style={{
                  border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "12px 20px",
                  fontSize: 15, outline: "none", width: 320, background: "#fff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              />
              <button style={{
                background: "#EF4444", color: "#fff", border: "none", borderRadius: 12,
                padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}>Order Now</button>
            </div>
          </div>
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(239,68,68,0.07)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(251,191,36,0.08)", pointerEvents: "none" }} />
        </div>
      )}

      {/* RESTAURANT SELECTION */}
      {!selectedRestaurant && (
        <div style={{ maxWidth: 1100, margin: "2.5rem auto", padding: "0 2rem" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1A1A1A", marginBottom: 6 }}>
            Our Popular <span style={{ color: "#EF4444" }}>Restaurants</span>
          </h2>
          <p style={{ color: "#888", marginBottom: 28, fontSize: 15 }}>Choose your favourite restaurant to start ordering</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {RESTAURANTS.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRestaurant(r.id)}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "1.5rem 1rem",
                  cursor: "pointer",
                  border: "1.5px solid #F0EBE3",
                  textAlign: "center",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.12)`;
                  e.currentTarget.style.borderColor = r.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "#F0EBE3";
                }}
              >
                <div style={{ fontSize: 44, marginBottom: 12 }}>{r.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1A1A1A", marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>{r.tag}</div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, fontSize: 13 }}>
                  <span style={{ color: "#F59E0B", fontWeight: 700 }}>★ {r.rating}</span>
                  <span style={{ color: "#aaa" }}>·</span>
                  <span style={{ color: "#777" }}>⏱ {r.time}</span>
                </div>
                <div style={{
                  marginTop: 16, background: r.color, color: "#fff",
                  borderRadius: 8, padding: "7px 0", fontSize: 13, fontWeight: 700,
                }}>View Menu →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MENU PAGE */}
      {restaurant && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 2rem" }}>
          <button
            onClick={() => setSelectedRestaurant(null)}
            style={{
              background: "none", border: "1.5px solid #E5E7EB", borderRadius: 8,
              padding: "8px 16px", fontSize: 14, cursor: "pointer", color: "#555",
              marginBottom: 24, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
            }}
          >← Back to Restaurants</button>

          <div style={{
            background: "#fff", borderRadius: 20, padding: "1.5rem 2rem",
            border: "1.5px solid #F0EBE3", marginBottom: 28,
            display: "flex", alignItems: "center", gap: 20,
          }}>
            <div style={{ fontSize: 52 }}>{restaurant.emoji}</div>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "#1A1A1A" }}>{restaurant.name}</h2>
              <div style={{ color: "#888", fontSize: 14, marginTop: 4 }}>{restaurant.tag}</div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 14 }}>
                <span style={{ color: "#F59E0B", fontWeight: 700 }}>★ {restaurant.rating}</span>
                <span style={{ color: "#777" }}>⏱ {restaurant.time}</span>
                <span style={{
                  background: "#DCFCE7", color: "#16A34A", borderRadius: 6,
                  padding: "1px 8px", fontSize: 12, fontWeight: 600,
                }}>Open Now</span>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1A1A1A", marginBottom: 16 }}>
            Popular <span style={{ color: "#EF4444" }}>Items</span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {restaurant.menu.map((item) => {
              const inCart = cart.find((c) => c.id === item.id);
              return (
                <div key={item.id} style={{
                  background: "#fff", borderRadius: 16, padding: "1.25rem",
                  border: "1.5px solid #F0EBE3", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.2s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"}
                >
                  <div style={{ fontSize: 42, textAlign: "center", marginBottom: 12 }}>{item.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#1A1A1A", marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 14, lineHeight: 1.5 }}>{item.desc}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 18, color: "#1A1A1A" }}>₹{item.price}</span>
                    {inCart ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{
                          width: 28, height: 28, borderRadius: 6, border: "1.5px solid #EF4444",
                          background: "none", color: "#EF4444", fontSize: 16, cursor: "pointer", fontWeight: 700,
                        }}>−</button>
                        <span style={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>{inCart.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{
                          width: 28, height: 28, borderRadius: 6, border: "none",
                          background: "#EF4444", color: "#fff", fontSize: 16, cursor: "pointer", fontWeight: 700,
                        }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item, restaurant)} style={{
                        background: "#EF4444", color: "#fff", border: "none",
                        borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}>Add to cart</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FLOATING CART BUTTON */}
      {cart.length > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: "fixed", bottom: 28, right: 28,
            background: "#EF4444", color: "#fff",
            border: "none", borderRadius: 50, padding: "14px 24px",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
            display: "flex", alignItems: "center", gap: 10, zIndex: 200,
          }}
        >
          🛒 View Cart · ₹{total}
          <span style={{
            background: "rgba(255,255,255,0.25)", borderRadius: 20,
            padding: "2px 8px", fontSize: 13,
          }}>{cartCount}</span>
        </button>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", justifyContent: "flex-end",
        }}>
          <div onClick={() => setCartOpen(false)} style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
          }} />
          <div style={{
            position: "relative", width: 380, maxWidth: "95vw",
            background: "#fff", height: "100vh", overflowY: "auto",
            boxShadow: "-4px 0 40px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "1.5rem", borderBottom: "1.5px solid #F0EBE3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1A1A1A" }}>🛒 Your Cart</h2>
              <button onClick={() => setCartOpen(false)} style={{
                background: "#F3F4F6", border: "none", borderRadius: 8,
                width: 32, height: 32, cursor: "pointer", fontSize: 16,
              }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: "1rem 1.5rem", overflowY: "auto" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "#aaa" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 0", borderBottom: "1px solid #F9F5F0",
                  }}>
                    <span style={{ fontSize: 28 }}>{item.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1A1A1A" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{item.restaurant}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{
                        width: 24, height: 24, borderRadius: 4, border: "1.5px solid #E5E7EB",
                        background: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
                      }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={{
                        width: 24, height: 24, borderRadius: 4, border: "none",
                        background: "#EF4444", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
                      }}>+</button>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, minWidth: 50, textAlign: "right" }}>₹{item.price * item.qty}</span>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: "1.5rem", borderTop: "1.5px solid #F0EBE3" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#888" }}>
                  <span>Subtotal</span><span>₹{total}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 14, color: "#888" }}>
                  <span>Delivery fee</span><span style={{ color: "#16A34A" }}>FREE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontWeight: 800, fontSize: 18, color: "#1A1A1A" }}>
                  <span>Total</span><span>₹{total}</span>
                </div>
                <button
                  onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  style={{
                    width: "100%", background: "#EF4444", color: "#fff",
                    border: "none", borderRadius: 12, padding: "14px",
                    fontSize: 16, fontWeight: 800, cursor: "pointer",
                  }}
                >Proceed to Checkout →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 400,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "2rem",
            width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Checkout</h2>
              <button onClick={() => setCheckoutOpen(false)} style={{
                background: "#F3F4F6", border: "none", borderRadius: 8,
                width: 32, height: 32, cursor: "pointer", fontSize: 16,
              }}>✕</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                style={{
                  width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10,
                  padding: "10px 14px", fontSize: 15, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Delivery Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, City, PIN"
                rows={3}
                style={{
                  width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10,
                  padding: "10px 14px", fontSize: 15, outline: "none",
                  resize: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                style={{
                  width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10,
                  padding: "10px 14px", fontSize: 15, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 8 }}>Payment Method</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[["cash", "💵 Cash on Delivery"], ["card", "💳 Card"], ["upi", "📱 UPI"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setForm({ ...form, payment: val })}
                    style={{
                      flex: 1, padding: "10px 8px", borderRadius: 10, fontSize: 13, cursor: "pointer",
                      fontWeight: 600,
                      border: form.payment === val ? "2px solid #EF4444" : "1.5px solid #E5E7EB",
                      background: form.payment === val ? "#FEF2F2" : "#fff",
                      color: form.payment === val ? "#EF4444" : "#555",
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>

            <div style={{ background: "#F9F5F0", borderRadius: 12, padding: "1rem", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Order Summary</div>
              {cart.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#666", marginBottom: 4 }}>
                  <span>{c.name} × {c.qty}</span>
                  <span>₹{c.price * c.qty}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16 }}>
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={!form.name || !form.address || !form.phone}
              style={{
                width: "100%", background: !form.name || !form.address || !form.phone ? "#F3F4F6" : "#EF4444",
                color: !form.name || !form.address || !form.phone ? "#aaa" : "#fff",
                border: "none", borderRadius: 12, padding: "14px",
                fontSize: 16, fontWeight: 800, cursor: !form.name || !form.address || !form.phone ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >Place Order 🎉</button>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS POPUP */}
      {orderPlaced && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: "3rem 2.5rem",
            textAlign: "center", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A", margin: "0 0 8px" }}>Order Placed!</h2>
            <p style={{ color: "#888", fontSize: 15, margin: "0 0 20px", lineHeight: 1.6 }}>
              Your order is confirmed and will be delivered soon. 🚀
            </p>
            <div style={{
              background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 12,
              padding: "12px", fontSize: 14, color: "#16A34A", fontWeight: 600,
            }}>Estimated delivery: 25–35 minutes ⏱</div>
          </div>
        </div>
      )}

      {/* REVIEW POPUP */}
      {reviewOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: "2.5rem",
            width: "100%", maxWidth: 440,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            {reviewSubmitted ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🙏</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1A1A1A", margin: "0 0 8px" }}>Thank you!</h2>
                <p style={{ color: "#888", fontSize: 15 }}>Your review helps us serve you better.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#1A1A1A" }}>Review Your Experience</h2>
                    <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>How was your order? Your feedback matters!</p>
                  </div>
                  <button onClick={() => setReviewOpen(false)} style={{
                    background: "#F3F4F6", border: "none", borderRadius: 8,
                    width: 32, height: 32, cursor: "pointer", fontSize: 16, flexShrink: 0,
                  }}>✕</button>
                </div>

                <div style={{ borderTop: "1.5px solid #F0EBE3", marginTop: 16, paddingTop: 20 }}>
                  {/* Food Rating */}
                  <div style={{
                    background: "#FFF5F5", borderRadius: 14, padding: "1rem 1.25rem", marginBottom: 16,
                    border: "1.5px solid #FEE2E2",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 20 }}>🍽️</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#1A1A1A" }}>Food Quality</span>
                    </div>
                    <StarRating value={foodRating} onChange={setFoodRating} />
                    <div style={{ marginTop: 6, fontSize: 13, color: foodRating > 0 ? "#EF4444" : "#ccc", fontWeight: 600 }}>
                      {["", "Poor 😞", "Fair 😐", "Good 😊", "Great 😄", "Excellent 🤩"][foodRating] || "Tap to rate"}
                    </div>
                  </div>

                  {/* Delivery Rating */}
                  <div style={{
                    background: "#F0FDF4", borderRadius: 14, padding: "1rem 1.25rem", marginBottom: 16,
                    border: "1.5px solid #BBF7D0",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 20 }}>🚴</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#1A1A1A" }}>Delivery Experience</span>
                    </div>
                    <StarRating value={deliveryRating} onChange={setDeliveryRating} />
                    <div style={{ marginTop: 6, fontSize: 13, color: deliveryRating > 0 ? "#16A34A" : "#ccc", fontWeight: 600 }}>
                      {["", "Very Late 😤", "Late 😟", "On Time 😊", "Quick 😃", "Lightning Fast ⚡"][deliveryRating] || "Tap to rate"}
                    </div>
                  </div>

                  {/* Comment */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>
                      💬 Additional Comments (optional)
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Tell us more about your experience..."
                      rows={3}
                      style={{
                        width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10,
                        padding: "10px 14px", fontSize: 14, outline: "none",
                        resize: "none", boxSizing: "border-box", color: "#1A1A1A",
                      }}
                    />
                  </div>

                  <button
                    onClick={submitReview}
                    disabled={foodRating === 0 || deliveryRating === 0}
                    style={{
                      width: "100%",
                      background: foodRating === 0 || deliveryRating === 0 ? "#F3F4F6" : "#EF4444",
                      color: foodRating === 0 || deliveryRating === 0 ? "#aaa" : "#fff",
                      border: "none", borderRadius: 12, padding: "14px",
                      fontSize: 16, fontWeight: 800,
                      cursor: foodRating === 0 || deliveryRating === 0 ? "not-allowed" : "pointer",
                      transition: "background 0.2s",
                    }}
                  >Submit Review ✨</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%",
          transform: "translateX(-50%)",
          background: "#1A1A1A", color: "#fff",
          borderRadius: 12, padding: "12px 24px",
          fontSize: 14, fontWeight: 600, zIndex: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          whiteSpace: "nowrap",
          animation: "fadeInUp 0.3s ease",
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #EF4444 !important; }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F9F5F0; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
      `}</style>
    </div>
  );
}