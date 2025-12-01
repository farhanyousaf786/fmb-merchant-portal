import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    orders: 0,
    reviews: 0,
    support: 0
  });

  const [lastSeen, setLastSeen] = useState({
    orders: parseInt(localStorage.getItem('lastSeenOrdersCount') || '0'),
    reviews: parseInt(localStorage.getItem('lastSeenReviewsCount') || '0'),
    support: parseInt(localStorage.getItem('lastSeenSupportCount') || '0')
  });

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      // 1. Check Orders
      const ordersRes = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      
      // 2. Check Reviews
      const reviewsRes = await fetch(`${process.env.REACT_APP_API_URL}/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reviewsData = await reviewsRes.json();

      // 3. Check Support Tickets
      const supportRes = await fetch(`${process.env.REACT_APP_API_URL}/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const supportData = await supportRes.json();

      if (ordersData.success && reviewsData.success && supportData.success) {
        const currentOrdersCount = ordersData.orders.length;
        const currentReviewsCount = reviewsData.reviews.length;
        
        // Only count open and in_progress tickets (not resolved or closed)
        const activeTickets = supportData.tickets.filter(ticket => 
          ticket.status === 'open' || ticket.status === 'in_progress'
        );
        const currentSupportCount = activeTickets.length;

        // Calculate new items
        const newOrders = Math.max(0, currentOrdersCount - lastSeen.orders);
        const newReviews = Math.max(0, currentReviewsCount - lastSeen.reviews);
        const newSupport = Math.max(0, currentSupportCount - lastSeen.support);

        setNotifications({
          orders: newOrders,
          reviews: newReviews,
          support: newSupport,
          // Store raw counts for updating lastSeen later
          rawOrders: currentOrdersCount,
          rawReviews: currentReviewsCount,
          rawSupport: currentSupportCount
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [lastSeen]);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsSeen = (type) => {
    if (type === 'orders') {
      const currentCount = notifications.rawOrders || lastSeen.orders;
      localStorage.setItem('lastSeenOrdersCount', currentCount.toString());
      setLastSeen(prev => ({ ...prev, orders: currentCount }));
      setNotifications(prev => ({ ...prev, orders: 0 }));
    } else if (type === 'reviews') {
      const currentCount = notifications.rawReviews || lastSeen.reviews;
      localStorage.setItem('lastSeenReviewsCount', currentCount.toString());
      setLastSeen(prev => ({ ...prev, reviews: currentCount }));
      setNotifications(prev => ({ ...prev, reviews: 0 }));
    } else if (type === 'support') {
      const currentCount = notifications.rawSupport || lastSeen.support;
      localStorage.setItem('lastSeenSupportCount', currentCount.toString());
      setLastSeen(prev => ({ ...prev, support: currentCount }));
      setNotifications(prev => ({ ...prev, support: 0 }));
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsSeen, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
