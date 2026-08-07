import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (err) { alert('Ошибка входа'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4 text-center">Вход</h2>
        <input className="w-full mb-3 p-2 border rounded" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full mb-3 p-2 border rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Войти</button>
        <p className="text-center mt-3 text-sm">Нет аккаунта? <Link to="/register" className="text-blue-500">Регистрация</Link></p>
      </form>
    </div>
  );
}
