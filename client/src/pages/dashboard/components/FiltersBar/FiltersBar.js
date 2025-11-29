import React from 'react';
import './FiltersBar.css';

const FiltersBar = ({ primaryAction }) => {
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [dateFilter, setDateFilter] = React.useState('Today');

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleDateSelect = (option) => {
    setDateFilter(option);
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="filters-bar">
      <div className="filters-left">
        <div className="filter-dropdown-container">
          <button 
            className={`filter-btn ${activeDropdown === 'date' ? 'active' : ''}`}
            onClick={() => toggleDropdown('date')}
          >
            {dateFilter} ▾
          </button>
          {activeDropdown === 'date' && (
            <div className="filter-dropdown-menu">
              <div className="dropdown-item" onClick={() => handleDateSelect('Today')}>Today</div>
              <div className="dropdown-item" onClick={() => handleDateSelect('Yesterday')}>Yesterday</div>
              <div className="dropdown-item" onClick={() => handleDateSelect('Last 7 Days')}>Last 7 Days</div>
              <div className="dropdown-item" onClick={() => handleDateSelect('Last 30 Days')}>Last 30 Days</div>
              <div className="dropdown-item" onClick={() => handleDateSelect('All Time')}>All Time</div>
            </div>
          )}
        </div>

        <div className="filter-dropdown-container">
          <button 
            className={`filter-btn ${activeDropdown === 'filter' ? 'active' : ''}`}
            onClick={() => toggleDropdown('filter')}
          >
            Filter by ▾
          </button>
          {activeDropdown === 'filter' && (
            <div className="filter-dropdown-menu">
              <div className="dropdown-item">Status</div>
              <div className="dropdown-item">Type</div>
              <div className="dropdown-item">Price</div>
            </div>
          )}
        </div>
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
