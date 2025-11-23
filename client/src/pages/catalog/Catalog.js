import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import FiltersBar from '../dashboard/components/FiltersBar/FiltersBar';
import ProductModal from './components/ProductModal';
import CartDialog from './components/CartDialog';
import CheckoutDialog from './components/CheckoutDialog';
import './Catalog.css';

const Catalogs = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // { inventoryId, name, type, unitPrice, quantity }
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/inventory/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.items.length > 0) {
        // Map DB items to UI format
        const dbItems = data.items.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          image: item.image || 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format',
          description: item.description,
          note: item.note,
          sliced: { quantity: 0, selected: false },
          unsliced: { quantity: 0, selected: false }
        }));
        
        setProducts(dbItems);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  // Add inventory item (admin uses Inventory page now, so keep for possible future use)
  const handleSaveProduct = async (productData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/inventory/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchInventory();
      } else {
        alert('Failed to save product: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const updateQuantity = (productId, type, change) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const key = type === 'sliced' ? 'sliced' : 'unsliced';
      const currentQty = p[key].quantity;
      const nextQty = Math.max(0, currentQty + change);
      return {
        ...p,
        [key]: {
          ...p[key],
          quantity: nextQty
        }
      };
    }));
  };

  const toggleSelection = (productId, type) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const key = type === 'sliced' ? 'sliced' : 'unsliced';
      return {
        ...p,
        [key]: {
          ...p[key],
          selected: !p[key].selected
        }
      };
    }));
  };

  const addToOrder = (productId) => {
    setProducts(prevProducts => {
      const product = prevProducts.find(p => p.id === productId);
      if (!product) return prevProducts;

      const newCartItems = [];

      ['sliced', 'unsliced'].forEach(type => {
        const opt = product[type];
        if (opt.selected && opt.quantity > 0) {
          newCartItems.push({
            inventoryId: product.id,
            name: product.name,
            type,
            unitPrice: product.price,
            quantity: opt.quantity
          });
        }
      });

      if (newCartItems.length === 0) {
        alert('Please select Sliced or Unsliced and set a quantity before adding to cart.');
        return prevProducts;
      }

      setCart(prevCart => {
        const updated = [...prevCart];
        newCartItems.forEach(item => {
          const existingIndex = updated.findIndex(
            c => c.inventoryId === item.inventoryId && c.type === item.type
          );
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + item.quantity
            };
          } else {
            updated.push(item);
          }
        });
        return updated;
      });

      // Reset selections for this product
      return prevProducts.map(p => {
        if (p.id !== productId) return p;
        return {
          ...p,
          sliced: { quantity: 0, selected: false },
          unsliced: { quantity: 0, selected: false }
        };
      });
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handlePlaceOrder = async ({ form, totals }) => {
    if (cart.length === 0) return;
    try {
      const token = localStorage.getItem('authToken');
      const body = {
        status: 'submitted',
        contact_first_name: form.firstName,
        contact_last_name: form.lastName,
        contact_email: form.email,
        contact_phone: form.phone,
        delivery_address: form.address,
        delivery_city: form.city,
        delivery_country: form.country,
        delivery_postal: form.postal,
        notes: form.notes,
        items: cart.map(item => ({
          inventory_id: item.inventoryId,
          type: item.type,
          unit_price: item.unitPrice,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        console.log('✅ Order created:', data.order);
        setCart([]);
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
        alert('Order placed successfully');
      } else {
        alert(data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      alert('Failed to create order');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="catalog-container">
          <div className="catalog-header-row">
            <h1>Catalogs</h1>
            <FiltersBar 
              primaryAction={{
                label: cartCount > 0 ? `Cart (${cartCount})` : 'Cart',
                onClick: () => {
                  if (cart.length === 0) return;
                  setIsCartOpen(true);
                }
              }}
            />
          </div>
          
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format';
                    }}
                  />
                </div>
                
                <div className="product-info">
                  <div className="product-header">
                    <h3>{product.name}</h3>
                    <span className="product-price">${product.price} / loaf</span>
                  </div>
                  
                  <p className="product-description">{product.description}</p>
                  
                  <p className="product-note">
                    <strong>Note:</strong> {product.note}
                  </p>
                  
                  <div className="product-options">
                    {/* Sliced Option */}
                    <div className="option-row">
                      <div
                        className="option-info"
                        onClick={() => toggleSelection(product.id, 'sliced')}
                      >
                        <div className={`option-indicator ${product.sliced.selected ? 'selected' : ''}`}>
                          <span className="indicator-dot"></span>
                        </div>
                        <span className="option-label">Sliced</span>
                      </div>
                      
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn minus"
                          onClick={() => updateQuantity(product.id, 'sliced', -1)}
                        >
                          −
                        </button>
                        <span className="quantity">{product.sliced.quantity}</span>
                        <button 
                          className="quantity-btn plus"
                          onClick={() => updateQuantity(product.id, 'sliced', 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Unsliced Option */}
                    <div className="option-row">
                      <div
                        className="option-info"
                        onClick={() => toggleSelection(product.id, 'unsliced')}
                      >
                        <div className={`option-indicator ${product.unsliced.selected ? 'selected' : ''}`}>
                          <span className="indicator-dot"></span>
                        </div>
                        <span className="option-label">Unsliced</span>
                      </div>
                      
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn minus"
                          onClick={() => updateQuantity(product.id, 'unsliced', -1)}
                        >
                          −
                        </button>
                        <span className="quantity">{product.unsliced.quantity}</span>
                        <button 
                          className="quantity-btn plus"
                          onClick={() => updateQuantity(product.id, 'unsliced', 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="add-to-order-btn"
                    onClick={() => addToOrder(product.id)}
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveProduct}
      />
      <CartDialog
        isOpen={isCartOpen}
        cart={cart}
        cartTotal={cartTotal}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        cart={cart}
        onClose={() => setIsCheckoutOpen(false)}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
};

export default Catalogs;
