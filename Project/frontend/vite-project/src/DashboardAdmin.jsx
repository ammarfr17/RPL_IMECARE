import React, { useState } from 'react';
import './DashboardAdmin.css';
import ManageUser from './ManageUser';
import { useNavigate } from 'react-router-dom';

const dummyReports = [
  {
    id: 1,
    name: 'Ayu Lestari',
    email: 'ayu.lestari@email.com',
    jenis: 'Kerusakan Fasilitas',
    complaint: 'Kursi di ruang kelas rusak dan membahayakan.',
    fileUrl: 'https://via.placeholder.com/120x80.png?text=File1',
  },
  {
    id: 2,
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    jenis: 'Pencarian Beasiswa',
    complaint: 'Ingin info beasiswa semester depan.',
    fileUrl: 'https://via.placeholder.com/120x80.png?text=File2',
  },
  {
    id: 3,
    name: 'Citra Dewi',
    email: 'citra.dewi@email.com',
    jenis: 'Ketidakmampuan Bayar UKT',
    complaint: 'Orang tua kehilangan pekerjaan, mohon bantuan keringanan UKT.',
    fileUrl: 'https://via.placeholder.com/120x80.png?text=File3',
  },
];


function Sidebar({ page, setPage }) {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-title">Admin</div>
      <nav>
        <ul>
          <li className={page === 'pengaduan' ? 'active' : ''} onClick={() => setPage('pengaduan')}>Pengaduan Masuk</li>
          <li className={page === 'progress' ? 'active' : ''} onClick={() => setPage('progress')}>Progress</li>
          <li className={page === 'user' ? 'active' : ''} onClick={() => setPage('user')}>Manage User</li>
        </ul>
      </nav>
    </aside>
  );
}

function Navbar() {
  return (
    <header className="admin-navbar">
      <span className="navbar-title">Dashboard Admin</span>
      <span className="navbar-user">👤 Admin</span>
    </header>
  );
}

const progressOptions = ['Baru', 'Ditinjau', 'Selesai'];

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  React.useEffect(()=>{
    if(!token) navigate('/login');
  },[]);
  const [reports, setReports] = useState(dummyReports.map(r => ({ ...r, status: 'Baru' })));
  const [filePreview, setFilePreview] = useState(null);
  const [page, setPage] = useState('pengaduan');
  const [selectedRow, setSelectedRow] = useState(null);
  const jenisOptions = ['Kerusakan Fasilitas', 'Pencarian Beasiswa', 'Ketidakmampuan Bayar UKT'];
  const [jenisFilters, setJenisFilters] = useState([]);

  // fetch from backend
  const fetchReports = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('http://localhost:4000/api/complaints', { headers });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setReports(data.map(d => ({ ...d, status: d.status || 'Baru' })));
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  // Untuk progress, update status
  const handleStatusChange = (id, status) => {
    // update frontend
    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
    // send to backend
    (async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`http://localhost:4000/api/complaints/${id}/status`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('update failed');
        // refresh list
        fetchReports();
      } catch (err) {
        console.error('Failed to update status', err);
      }
    })();
  };

  return (
    <div className="admin-layout">
      <Sidebar page={page} setPage={setPage} />
      <div className="admin-main-content">
        <Navbar />
        {page === 'pengaduan' && (
          <div className="dashboard-admin-container">
            <h2>Daftar Pengaduan Masuk</h2>

            <div className="controls-row">
              <div className="jenis-filters">
                {jenisOptions.map(j => (
                  <button
                    key={j}
                    className={"filter-pill " + (jenisFilters.includes(j) ? 'active' : '')}
                    onClick={() => setJenisFilters(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j])}
                  >
                    {j}
                  </button>
                ))}
                {jenisFilters.length > 0 && (
                  <button className="clear-filters" onClick={() => setJenisFilters([])}>Clear All</button>
                )}
              </div>
              <div className="found-count">We've found {reports.filter(r => jenisFilters.length === 0 || jenisFilters.includes(r.jenis)).length} complaints</div>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Jenis Keluhan</th>
                    <th>Deskripsi</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {reports
                    .filter(r => jenisFilters.length === 0 || jenisFilters.includes(r.jenis))
                    .map((r, idx) => (
                      <tr
                        key={r.id}
                        className={selectedRow === r.id ? 'selected' : ''}
                        onClick={() => setSelectedRow(prev => (prev === r.id ? null : r.id))}
                        tabIndex={0}
                      >
                        <td>{idx + 1}</td>
                        <td>{r.name}</td>
                        <td>{r.email}</td>
                        <td><span className="jenis-pill">{r.jenis}</span></td>
                        <td>{r.complaint}</td>
                        <td>
                          <button className="btn-file" onClick={() => setFilePreview(r.fileUrl)}>
                            Lihat File
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {filePreview && (
              <div className="file-modal" onClick={() => setFilePreview(null)}>
                <div className="file-modal-content" onClick={e => e.stopPropagation()}>
                  <img src={filePreview} alt="Preview File" />
                  <button className="btn-close" onClick={() => setFilePreview(null)}>Tutup</button>
                </div>
              </div>
            )}
          </div>
        )}
        {page === 'progress' && (
          <div className="dashboard-admin-container">
            <h2>Progress Pengaduan</h2>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Jenis Keluhan</th>
                    <th>Deskripsi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={selectedRow === r.id ? 'selected' : ''}
                      onClick={() => setSelectedRow(prev => (prev === r.id ? null : r.id))}
                      tabIndex={0}
                    >
                      <td>{idx + 1}</td>
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td><span className="jenis-pill">{r.jenis}</span></td>
                      <td>{r.complaint}</td>
                      <td>
                        <select
                          className="status-dropdown"
                          value={r.status}
                          onChange={e => handleStatusChange(r.id, e.target.value)}
                        >
                          {progressOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {page === 'user' && <ManageUser />}
      </div>
    </div>
  );
};

export default DashboardAdmin;
