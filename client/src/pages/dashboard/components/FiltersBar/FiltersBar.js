import React from 'react';
import './FiltersBar.css';

const FiltersBar = ({ primaryAction, onFilterChange }) => {
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [dateFilter, setDateFilter] = React.useState('Today');
  const [statusFilter, setStatusFilter] = React.useState('All Status');

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleDateSelect = (option) => {
    setDateFilter(option);
    setActiveDropdown(null);
    if (onFilterChange) {
      onFilterChange({ date: option, status: statusFilter });
    }
  };

  const handleStatusSelect = (option) => {
    setStatusFilter(option);
    setActiveDropdown(null);
    if (onFilterChange) {
      onFilterChange({ date: dateFilter, status: option });
    }
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
            className={`filter-btn ${activeDropdown === 'status' ? 'active' : ''}`}
            onClick={() => toggleDropdown('status')}
          >
            {statusFilter} ▾
          </button>
          {activeDropdown === 'status' && (
            <div className="filter-dropdown-menu">
              <div className="dropdown-item" onClick={() => handleStatusSelect('All Status')}>All Status</div>
              <div className="dropdown-item" onClick={() => handleStatusSelect('Submitted')}>Submitted</div>
              <div className="dropdown-item" onClick={() => handleStatusSelect('Processing')}>Processing</div>
              <div className="dropdown-item" onClick={() => handleStatusSelect('Shipped')}>Shipped</div>
              <div className="dropdown-item" onClick={() => handleStatusSelect('Delivered')}>Delivered</div>
              <div className="dropdown-item" onClick={() => handleStatusSelect('Cancelled')}>Cancelled</div>
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
