import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, password, displayName);
      navigate('/');
    } catch (err) { alert('Ошибка регистрации'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4 text-center">Регистрация</h2>
        <input className="w-full mb-3 p-2 border rounded" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full mb-3 p-2 border rounded" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <input className="w-full mb-3 p-2 border rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Создать</button>
        <p className="text-center mt-3 text-sm">Уже есть аккаунт? <Link to="/login" className="text-blue-500">Войти</Link></p>
      </form>
    </div>
  );
}
