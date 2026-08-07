import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../utils/api';
import { useAuthStore } from '../store/auth.store';

export default function ChatPage() {
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const socketRef = React.useRef<any>(null);

  useEffect(() => {
    api.get(`/chats/${chatId}/messages`).then(res => setMessages(res.data.reverse())).catch(console.error);

    // Подключаемся к сокету через прокси Vite
    const socket = io({ auth: { token } }); 
    socketRef.current = socket;
    socket.emit('chat:join', { chatId });
    
    socket.on('message:new', (msg: any) => setMessages(prev => [...prev, msg]));
    return () => { socket.disconnect(); };
  }, [chatId, token]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit('message:send', { chatId, text });
    setText('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col h-screen">
      <div className="mb-4 flex justify-between items-center">
         <Link to="/" className="text-blue-500">&larr; Назад</Link>
         <h1 className="text-xl font-bold">Чат</h1>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 border p-2 rounded bg-white">
        {messages.map(msg => (
          <div key={msg.id} className={`mb-2 ${msg.senderId === user?.id ? 'text-right' : ''}`}>
            <div className={`inline-block p-2 rounded ${msg.senderId === user?.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {msg.text || 'Вложение'}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input className="flex-1 border p-2 rounded" value={text} onChange={(e) => setText(e.target.value)} placeholder="Сообщение..." />
        <button className="bg-blue-500 text-white px-4 rounded">Отправить</button>
      </form>
    </div>
  );
}
