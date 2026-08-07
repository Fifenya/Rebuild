import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Настройки</h1>
      <div className="bg-white p-4 rounded shadow">
        <p className="mb-2"><strong>Имя:</strong> {user?.username}</p>
        <p className="mb-4"><strong>Отображаемое имя:</strong> {user?.displayName || '-'}</p>
        <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Выйти</button>
      </div>
    </div>
  );
}
