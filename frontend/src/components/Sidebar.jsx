import React from 'react';
import { Building2, Home, Users, UserPlus, Bell, Plus, LogOut, X } from 'lucide-react';

export default function Sidebar({ user, view, onViewChange, onAddProperty, onLogout, requestsCount, notificationsCount, mobile, onClose }) {
  const isAdmin = user.role === 'admin';
  return (
    <aside className={`sidebar ${mobile ? 'open' : ''}`}>
      <div className="brand"><Building2 /><span>Dashboard</span></div>
      <button className="close-menu" onClick={onClose}><X /></button>
      <nav>
        <Nav active={view === 'dashboard'} icon={<Home />} text="Dashboard" onClick={() => onViewChange('dashboard')} />
        {isAdmin ? (
          <Nav active={view === 'all-properties'} icon={<Building2 />} text="All Properties" onClick={() => onViewChange('all-properties')} />
        ) : (
          <Nav active={view === 'my-properties'} icon={<Building2 />} text="My Properties" onClick={() => onViewChange('my-properties')} />
        )}
        <Nav active={view === 'add-property'} icon={<Plus />} text="Add Property" onClick={onAddProperty} />
        {isAdmin && <>
          <Nav active={view === 'agents'} icon={<Users />} text="Agents" onClick={() => onViewChange('agents')} />
          <Nav active={view === 'requests'} icon={<UserPlus />} text={`Requests`} badge={requestsCount} onClick={() => onViewChange('requests')} />
          <Nav active={view === 'notifications'} icon={<Bell />} text={`Notifications`} badge={notificationsCount} onClick={() => onViewChange('notifications')} />
        </>}
      </nav>
      <button className="logout-btn" onClick={onLogout}><LogOut /><span>Logout</span></button>
    </aside>
  );
}

function Nav({ active, icon, text, badge, onClick }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{text}</span>{badge > 0 && <span className="nav-pill">{badge}</span>}</button>;
}
