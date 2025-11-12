import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import FiltersBar from '../dashboard/components/FiltersBar/FiltersBar';
import './Catalog.css';

const Catalogs = ({ user, onLogout }) => {
  const [products] = useState([
    {
      id: 1,
      name: 'Raisin Bread',
      price: 50,
      image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format',
      description: 'Convenient Weighing in at 227 grams (0.5 lbs) (8 oz), the "High Fiber Bread."',
      note: 'Total quantities should not be less than 10 loaves.',
      sliced: { quantity: 10, selected: true },
      unsliced: { quantity: 10, selected: false }
    },
    {
      id: 2,
      name: 'Bran Bread',
      price: 50,
      image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop&auto=format',
      description: 'Convenient Weighing in at 227 grams (0.5 lbs) (8 oz), the "High Fiber Bread."',
      note: 'Total quantities should not be less than 10 loaves.',
      sliced: { quantity: 10, selected: true },
      unsliced: { quantity: 0, selected: true }
    },
    {
      id: 3,
      name: 'Whole Wheat Bread',
      price: 45,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format',
      description: 'Convenient Weighing in at 227 grams (0.5 lbs) (8 oz), the "High Fiber Bread."',
      note: 'Total quantities should not be less than 10 loaves.',
      sliced: { quantity: 8, selected: false },
      unsliced: { quantity: 12, selected: false }
    },
    {
      id: 4,
      name: 'Sourdough Bread',
      price: 55,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format',
      description: 'Convenient Weighing in at 227 grams (0.5 lbs) (8 oz), the "High Fiber Bread."',
      note: 'Total quantities should not be less than 10 loaves.',
      sliced: { quantity: 15, selected: false },
      unsliced: { quantity: 5, selected: false }
    }
  ]);

  const updateQuantity = (productId, type, change) => {
    // Quantity update logic would go here
    console.log(`Update ${productId} ${type} by ${change}`);
  };

  const toggleSelection = (productId, type) => {
    // Selection toggle logic would go here
    console.log(`Toggle ${productId} ${type}`);
  };

  const addToOrder = (productId) => {
    // Add to order logic would go here
    console.log(`Add product ${productId} to order`);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="catalog-container">
          <div className="catalog-header-row">
            <h1>Catalogs</h1>
            <FiltersBar />
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
                      <div className="option-info">
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
                      <div className="option-info">
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
    </div>
  );
};

export default Catalogs;
