import React from 'react';
import './FiltersBar.css';

const FiltersBar = () => {
  return (
    <div className="filters-bar">
      <div className="filters-left">
        <button className="filter-btn">Today ▾</button>
        <button className="filter-btn">Filter by ▾</button>
      </div>
      <div className="filters-right">
        <button className="primary-btn">New Order</button>
      </div>
    </div>
  );
};

export default FiltersBar;
