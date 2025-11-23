import React, { useState } from 'react';
import './ManageUser.css';

const initialUsers = [
  { id: 1, name: 'Admin Satu', email: 'admin1@email.com', role: 'admin' },
  { id: 2, name: 'Admin Dua', email: 'admin2@email.com', role: 'admin' },
];

const ManageUser = () => {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError('Username, email dan password wajib diisi');
      return;
    }
    setError('');
    // call backend register
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password, role: form.role }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed');
      }
      const created = await res.json();
      setUsers([ ...users, { id: created.id, name: created.username || created.email, email: created.email, role: created.role }]);
      setForm({ username: '', email: '', password: '', role: 'admin' });
    } catch (err) {
      setError(err.message || 'Gagal menambahkan admin');
    }
  };

  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="manage-user-outer-wrapper">
      <div className="manage-user-container">
        <h2>Manajemen User Admin</h2>
        <form className="user-form" onSubmit={handleAdd}>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username admin"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email admin"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password admin"
            required
          />
          <button type="submit">Tambah Admin</button>
        </form>
        {error && <div className="error-message">{error}</div>}
        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id}>
                  <td>{idx + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(u.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
