import React from 'react';
import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api';

const emptyProperty = { title: '', type: 'Apartment', location: '', rent: '', status: 'Available', bedrooms: 1, bathrooms: 1, description: '' };

export default function PropertyModal({ property, onClose, onSaved }) {
  const [form, setForm] = useState(property ? { ...property } : emptyProperty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { ...form, rent: Number(form.rent), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms) };
      const saved = await api(property ? `/properties/${property._id}` : '/properties', {
        method: property ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <h2>{property ? 'Edit Property' : 'Add Property'}</h2>
            <p>Fill the details below to save the listing.</p>
          </div>
          <button type="button" onClick={onClose}><X /></button>
        </div>
        {error && <div className="alert">{error}</div>}
        <div className="form-grid">
          <Field label="Title" value={form.title} onChange={(value) => set('title', value)} />
          <Select label="Type" value={form.type} onChange={(value) => set('type', value)} options={['Apartment', 'House', 'Villa', 'Commercial', 'Office', 'Shop']} />
          <div className="wide">
            <Field label="Location" value={form.location} onChange={(value) => set('location', value)} />
          </div>
          <Field label="Rent" type="number" value={form.rent} onChange={(value) => set('rent', value)} />
          <Select label="Status" value={form.status} onChange={(value) => set('status', value)} options={['Available', 'Rented', 'Maintenance']} />
          <Field label="Bedrooms" type="number" value={form.bedrooms} onChange={(value) => set('bedrooms', value)} />
          <Field label="Bathrooms" type="number" value={form.bathrooms} onChange={(value) => set('bathrooms', value)} />
          <label className="field wide">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => set('description', event.target.value)} />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Save property'}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input required type={type} value={value} onChange={(event) => onChange(event.target.value)} min={type === 'number' ? 0 : undefined} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
