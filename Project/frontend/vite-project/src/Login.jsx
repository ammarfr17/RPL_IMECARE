import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComplaintForm.css';

export default function Login(){
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try{
      // use the auth route the backend exposes
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if(!res.ok){
        const txt = await res.text();
        throw new Error(txt || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      navigate('/admin');
    }catch(err){
      setError(err.message || 'Login failed');
    }finally{setLoading(false);}
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:380,background:'#e9f6ff',padding:24,borderRadius:12,boxShadow:'0 20px 40px rgba(2,6,23,0.08)'}}>
        <h2 style={{textAlign:'center',color:'#0747a6'}}>Login Admin</h2>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username or email" />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
          {error && <div style={{color:'#b91c1c'}}>{error}</div>}
          <button type="submit" disabled={loading} style={{background:'#0b69ff',color:'#fff',padding:12,borderRadius:8,border:'none',fontWeight:800}}>{loading? 'Signing in...':'Sign in'}</button>
        </form>
        <div style={{fontSize:12,marginTop:12,color:'#333'}}>Top admin: username <b>ammar</b>. If you didn't set ADMIN_PASSWORD, default password is <code>ChangeMe123!</code></div>
      </div>
    </div>
  );
}
