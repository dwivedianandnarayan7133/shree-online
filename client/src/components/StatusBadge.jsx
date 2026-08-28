import React from 'react';
import { Clock, CheckCircle2, AlertCircle, XCircle, FileText } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getBadgeDetails = () => {
    switch (String(status).toLowerCase()) {
      case 'new':
        return { className: 'badge-new', label: 'New Request', icon: AlertCircle };
      case 'processing':
        return { className: 'badge-processing', label: 'Processing', icon: Clock };
      case 'waiting_customer':
        return { className: 'badge-waiting', label: 'Waiting for Customer', icon: Clock };
      case 'completed':
      case 'paid':
        return { className: 'badge-completed', label: 'Completed', icon: CheckCircle2 };
      case 'cancelled':
        return { className: 'badge-cancelled', label: 'Cancelled', icon: XCircle };
      case 'pending':
        return { className: 'badge-processing', label: 'Pending Queue', icon: Clock };
      default:
        return { className: 'badge-primary', label: status || 'Active', icon: FileText };
    }
  };

  const { className, label, icon: Icon } = getBadgeDetails();

  return (
    <span className={`badge ${className}`}>
      <Icon size={12} />
      <span>{label}</span>
    </span>
  );
};
