import React from 'react';
import './FiltersBar.css';

const FiltersBar = ({ primaryAction }) => {
  return (
    <div className="filters-bar">
      <div className="filters-left">
        <button className="filter-btn">Today ▾</button>
        <button className="filter-btn">Filter by ▾</button>
      </div>
      <div className="filters-right">
        {primaryAction ? (
          <button className="primary-btn" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </button>
        ) : (
          <button className="primary-btn">New Order</button>
        )}
      </div>
    </div>
  );
};

export default FiltersBar;
