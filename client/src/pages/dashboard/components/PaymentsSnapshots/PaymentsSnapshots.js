import React from 'react';
import './PaymentsSnapshots.css';

const SnapshotCard = ({ label, amount, status }) => (
  <div className="snapshot-card">
    <div className="snapshot-top">
      <span className="inv">#INV-00000</span>
      {status ? <span className={`badge ${status.toLowerCase()}`}>{status}</span> : <span className="badge gray">No data</span>}
    </div>
    <div className="snapshot-amount">${amount}</div>
    <button className="pay-btn" disabled>Pay</button>
  </div>
);

const PaymentsSnapshots = () => {
  return (
    <div className="payments-snapshots">
      <div className="section-header">
        <h3>Payments and Invoices Snapshots</h3>
        <button className="link-btn" disabled>See all</button>
      </div>
      <div className="snapshots-grid">
        <SnapshotCard label="Paid" amount="0" status="Paid" />
        <SnapshotCard label="Unpaid" amount="0" status="Unpaid" />
        <SnapshotCard label="Paid" amount="0" status="Paid" />
      </div>
    </div>
  );
};

export default PaymentsSnapshots;
