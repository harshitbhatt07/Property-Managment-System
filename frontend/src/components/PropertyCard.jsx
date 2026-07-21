import React from 'react';
import { Building2, MapPin, BedDouble, Bath, IndianRupee, Pencil, Trash2 } from 'lucide-react';

export default function PropertyCard({ property, canEdit, isAdmin, onEdit, onDelete }) {
  return (
    <article className="property-card">
      <div className="property-cover">
        <Building2 size={42} />
        <span className={`status ${property.status.toLowerCase()}`}>{property.status}</span>
      </div>
      <div className="property-body">
        <div className="property-title">
          <div>
            <span className="property-type">{property.type}</span>
            <h3>{property.title}</h3>
          </div>
          <div className="card-actions">
            {canEdit && (
              <button className="edit-action" onClick={() => onEdit(property)}>
                <Pencil />
                Edit
              </button>
            )}
            {isAdmin && (
              <button className="delete-action" onClick={() => onDelete(property._id)}>
                <Trash2 />
                Delete
              </button>
            )}
          </div>
        </div>
        <p className="location">
          <MapPin />
          {property.location}
        </p>
        <div className="property-meta">
          <span><BedDouble />{property.bedrooms} Beds</span>
          <span><Bath />{property.bathrooms} Baths</span>
        </div>
        <div className="property-footer">
          <div>
            <span>Monthly rent</span>
            <strong><IndianRupee />{Number(property.rent).toLocaleString('en-IN')}</strong>
          </div>
          <small>By {property.createdBy?.name || 'Agent'}</small>
        </div>
      </div>
    </article>
  );
}
