import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Building2, Home, Users, UserPlus, Bell, Plus, Search, CheckCircle2, Clock3, Menu, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import Sidebar from './Sidebar';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';

export default function DashboardView({ user, onLogout }) {
  const isAdmin = user.role === 'admin';
  const [view, setView] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ ...(search && { search }), ...(status && { status }) });
      const propertyList = await api(`/properties?${query}`);
      setProperties(propertyList);

      if (isAdmin) {
        const [dashboardStats, agentList, pendingRequests, unreadNotifications] = await Promise.all([
          api('/admin/dashboard'),
          api('/admin/agents'),
          api('/admin/agent-requests'),
          api('/notifications'),
        ]);
        setStats(dashboardStats);
        setAgents(agentList);
        setRequests(pendingRequests);
        setNotifications(unreadNotifications);
      } else {
        setStats({
          total: propertyList.length,
          available: propertyList.filter((item) => item.status === 'Available').length,
          rented: propertyList.filter((item) => item.status === 'Rented').length,
          maintenance: propertyList.filter((item) => item.status === 'Maintenance').length,
          myProperties: propertyList,
        });
      }
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 180);
    return () => clearTimeout(timer);
  }, [search, status, isAdmin]);

  const myProperties = useMemo(() => {
    if (!isAdmin) {
      return Array.isArray(stats.myProperties) ? stats.myProperties : [];
    }
    return properties.filter((property) => String(property.createdBy?._id) === String(user.id || user._id));
  }, [properties, user, isAdmin, stats.myProperties]);

  const shownProperties = view === 'my-properties' ? myProperties : properties;

  const saveProperty = (savedProperty) => {
    setProperties((items) => editingProperty ? items.map((item) => item._id === savedProperty._id ? savedProperty : item) : [savedProperty, ...items]);
    setModalOpen(false);
    setEditingProperty(null);
    load();
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('Delete this property permanently?')) return;
    try {
      await api(`/properties/${id}`, { method: 'DELETE' });
      setProperties((items) => items.filter((item) => item._id !== id));
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateAgent = async (id, nextStatus) => {
    await api(`/admin/agents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
    load();
  };

  const readNotification = async (id) => {
    await api(`/notifications/${id}`, { method: 'DELETE' });
    setNotifications((items) => items.filter((item) => item._id !== id));
  };

  const titleMap = {
    dashboard: 'Dashboard',
    'all-properties': 'Properties',
    'my-properties': 'My Properties',
    'add-property': 'Add Property',
    agents: 'Agents',
    requests: 'Agent Requests',
    notifications: 'Notifications',
  };

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        view={view}
        onViewChange={setView}
        onAddProperty={() => {
          setEditingProperty(null);
          setModalOpen(true);
          setView('add-property');
        }}
        onLogout={onLogout}
        requestsCount={requests.length}
        notificationsCount={notifications.length}
        mobile={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}

      <main className="dashboard">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
          <div>
            <span className="welcome">{isAdmin ? 'Admin workspace' : 'Agent workspace'}</span>
            <h1>{titleMap[view] || 'Dashboard'}</h1>
          </div>
          <span className={`role-pill ${user.role}`}>
            <ShieldCheck size={16} />
            {user.role}
          </span>
        </header>

        {error && <div className="alert">{error}</div>}

        {view === 'dashboard' && (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">PROPERTY WORKSPACE</p>
                <h2>Welcome back, {user.name?.split(' ')[0]}</h2>
                <p>{isAdmin ? 'Manage properties, approvals, and updates from one place.' : 'Keep track of your listings and see what is available.'}</p>
              </div>
              <button className="primary-btn" onClick={() => { setEditingProperty(null); setModalOpen(true); setView('add-property'); }}>
                <Plus />
                Add Property
              </button>
            </section>

            <div className="stats-grid">
              <Stat icon={<Building2 />} label={isAdmin ? 'Total Properties' : 'My Properties'} value={isAdmin ? (stats.total ?? properties.length) : (stats.total ?? myProperties.length)} />
              <Stat icon={<CheckCircle2 />} label="Available" value={stats.available ?? 0} />
              <Stat icon={<Home />} label="Rented" value={stats.rented ?? 0} />
              <Stat icon={<Clock3 />} label="Maintenance" value={stats.maintenance ?? 0} />
              {isAdmin && <Stat icon={<Users />} label="Agents" value={stats.totalAgents ?? agents.filter((agent) => agent.approvalStatus === 'approved').length} />}
            </div>

            <PropertySection
              title={isAdmin ? 'Listed Properties' : 'Your uploaded properties'}
              properties={isAdmin ? properties : myProperties}
              loading={loading}
              isAdmin={isAdmin}
              onEdit={(property) => { setEditingProperty(property); setModalOpen(true); }}
              onDelete={deleteProperty}
            />
          </>
        )}

        {(view === 'all-properties' || view === 'my-properties') && (
          <PropertySection
            title={view === 'my-properties' ? 'My Properties' : 'All Properties'}
            properties={shownProperties}
            loading={loading}
            isAdmin={isAdmin}
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            onEdit={(property) => { setEditingProperty(property); setModalOpen(true); }}
            onDelete={deleteProperty}
          />
        )}

        {view === 'agents' && isAdmin && (
          <section className="content-card">
            <SectionHead title="Agents" sub="Review approved, pending, and blocked accounts." />
            <div className="agent-grid">
              {agents.map((agent) => (
                <article className="agent-card" key={agent._id}>
                  <div className="agent-head">
                    <div className="avatar">{agent.name?.[0]}</div>
                    <div>
                      <h3>{agent.name}</h3>
                      <span className={`badge ${agent.approvalStatus}`}>{agent.approvalStatus}</span>
                    </div>
                  </div>
                  <p><b>Email:</b> {agent.email}</p>
                  <p><b>Properties:</b> {agent.propertyCount}</p>
                  <p><b>Joined:</b> {new Date(agent.createdAt).toLocaleDateString()}</p>
                  <div className="actions">
                    <button className="approve" onClick={() => updateAgent(agent._id, 'approved')}>Approve</button>
                    <button className="block" onClick={() => updateAgent(agent._id, 'blocked')}>Block</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === 'requests' && isAdmin && (
          <section className="content-card">
            <SectionHead title="Agent Requests" sub="Approve or block new registrations." />
            {requests.length === 0 ? <Empty text="No pending requests." /> : (
              <div className="request-list">
                {requests.map((agent) => (
                  <div className="request-row" key={agent._id}>
                    <div>
                      <h3>{agent.name}</h3>
                      <p>{agent.email} • {new Date(agent.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="actions">
                      <button className="approve" onClick={() => updateAgent(agent._id, 'approved')}>Accept</button>
                      <button className="block" onClick={() => updateAgent(agent._id, 'blocked')}>Block</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {view === 'notifications' && isAdmin && (
          <section className="content-card">
            <SectionHead title="Notifications" sub="Click a notification to remove it." />
            {notifications.length === 0 ? <Empty text="No unread notifications." /> : (
              <div className="notification-list">
                {notifications.map((item) => (
                  <button className="notification" key={item._id} onClick={() => readNotification(item._id)}>
                    <Bell />
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>
                      <small>{new Date(item.createdAt).toLocaleString()}</small>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {modalOpen && <PropertyModal property={editingProperty} onClose={() => { setModalOpen(false); setEditingProperty(null); }} onSaved={saveProperty} />}
    </div>
  );
}

function PropertySection({ title, properties, loading, isAdmin, search, setSearch, status, setStatus, onEdit, onDelete }) {
  return (
    <section className="content-card">
      <SectionHead title={title} sub={`${properties.length} properties found`} />
      {setSearch && (
        <div className="toolbar">
          <div className="search-box">
            <Search />
            <input placeholder="Search title or location" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All status</option>
            <option>Available</option>
            <option>Rented</option>
            <option>Maintenance</option>
          </select>
        </div>
      )}
      {loading ? <div className="empty"><div className="spinner" /></div> : properties.length === 0 ? <Empty text="No properties found." /> : (
        <div className="property-grid">
          {properties.map((property) => <PropertyCard key={property._id} property={property} canEdit isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      )}
    </section>
  );
}

function Stat({ icon, label, value }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value || 0}</strong>
      </div>
    </article>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="empty">
      <Building2 size={42} />
      <h3>{text}</h3>
    </div>
  );
}
