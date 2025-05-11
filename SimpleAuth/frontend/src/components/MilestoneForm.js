import React from 'react';
import './MilestoneForm.css';

function MilestoneForm({ isVisible = true }) {
  // Milestone creation is now only for admin, not team leaders
  if (!isVisible) {
    return null;
  }

  // Show a message explaining that milestone creation is admin-only
  return (
    <div className="milestone-form-container">
      <div className="milestone-form-info">
        <h3>Kilometre Taşları Bilgisi</h3>
        <p>Kilometre taşları oluşturma yetkisi sadece yöneticilere aittir.</p>
        <p>Kilometre taşları yönetici tarafından takım liderlerine atanır.</p>
      </div>
    </div>
  );
}

export default MilestoneForm;