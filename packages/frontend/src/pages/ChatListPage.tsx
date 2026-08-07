import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuthStore } from '../store/auth.store';

export default function ChatListPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const user = useAuthStore(s => s.user);

  const fetchChats = () => api.get('/chats').then(res => setChats(res.data)).catch(console.error);

  useEffect(() => { fetchChats(); }, []);

  const handleSearch = async () => {
    if (!search) return;
    const res = await api.get(`/users/search?q=${search}`);
    setUsers(res.data.filter((u: any) => u.id !== user?.id));
  };

  const createChat = async (memberId: string) => {
    await api.post('/chats', { type: 'PRIVATE', memberIds: [memberId] });
    setUsers([]); setSearch(''); fetchChats();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ваши чаты</h1>
        <Link to="/settings" className="text-blue-500">Настройки</Link>
      </div>
      <div className="mb-6 p-4 border rounded bg-white">
        <h2 className="font-bold mb-2">Найти пользователя</h2>
        <div className="flex gap-2 mb-2">
          <input className="flex-1 border p-2 rounded" placeholder="Username" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 rounded">Поиск</button>
        </div>
        {users.map(u => (
          <div key={u.id} className="flex justify-between items-center p-2 border-b last:border-0">
            <span>{u.displayName || u.username}</span>
            <button onClick={() => createChat(u.id)} className="text-green-500">Написать</button>
          </div>
        ))}
      </div>
      {chats.length === 0 && <p>Чатов пока нет.</p>}
      <ul>
        {chats.map(chat => (
          <li key={chat.id} className="border p-3 rounded mb-2 hover:bg-gray-50 bg-white">
            <Link to={`/chat/${chat.id}`} className="block font-medium">{chat.title || `Чат ${chat.id}`}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
