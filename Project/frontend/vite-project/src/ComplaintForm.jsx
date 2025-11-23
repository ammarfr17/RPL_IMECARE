import React, { useState } from 'react';
import './ComplaintForm.css';
import { useNavigate } from 'react-router-dom';

const ComplaintForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    jenis: '',
    complaint: '',
    file: null,
  });
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm({ ...form, file: files[0] });
      setPreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.jenis || !form.complaint) {
      setError('Semua field wajib diisi!');
      return;
    }
  setError('');
  setLoading(true);
    // Kirim data ke backend
    const submit = async () => {
      try {
        let body;
        let headers = {};
        if (form.file) {
          body = new FormData();
          body.append('name', form.name);
          body.append('email', form.email);
          body.append('jenis', form.jenis);
          body.append('complaint', form.complaint);
          body.append('file', form.file);
        } else {
          body = JSON.stringify({ name: form.name, email: form.email, jenis: form.jenis, complaint: form.complaint });
          headers['Content-Type'] = 'application/json';
        }

        const res = await fetch('http://localhost:4000/api/complaints', {
          method: 'POST',
          headers,
          body,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to submit: ${res.status} ${text}`);
        }
        setSubmitted(true);
        setForm({ name: '', email: '', jenis: '', complaint: '', file: null });
        setPreview(null);
        // navigate to admin to show the new complaint
      } catch (err) {
        console.error(err);
        setError(err.message || 'Gagal mengirim pengaduan. Coba lagi.');
        setSubmitted(false);
      } finally {
        setLoading(false);
      }
    };
    submit();
  };

  return (
    <div className="complaint-page">
      <div className="left-hero">
        <div className="hero-brand">
          <div className="brand-title">WELCOME to</div>
          <div className="brand-name">IME CARE</div>
        </div>
      </div>

      <div className="right-panel">
        <div className="complaint-card">
          <h2>Form Pengaduan</h2>
          <form className="complaint-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nama</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Masukkan nama Anda"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan email Anda"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="file">File (opsional)</label>
              <input
                id="file"
                type="file"
                name="file"
                accept="image/*,application/pdf"
                onChange={handleChange}
              />
              {preview && (
                <div className="file-preview">
                  <span>Preview:</span>
                  <img src={preview} alt="Preview" style={{ maxWidth: 200, marginTop: 8 }} />
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="jenis">Jenis Keluhan</label>
              <select
                id="jenis"
                name="jenis"
                value={form.jenis}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Pilih jenis keluhan</option>
                <option value="Kerusakan Fasilitas">Kerusakan Fasilitas</option>
                <option value="Pencarian Beasiswa">Pencarian Beasiswa</option>
                <option value="Ketidakmampuan Bayar UKT">Ketidakmampuan Bayar UKT</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="complaint">Deskripsi</label>
              <textarea
                id="complaint"
                name="complaint"
                value={form.complaint}
                onChange={handleChange}
                placeholder="Deskripsikan keluhan Anda di sini..."
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Pengaduan'}</button>
            {submitted && <div className="success-message">Pengaduan berhasil dikirim!</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;