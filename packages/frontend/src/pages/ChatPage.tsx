import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ArrowLeft, CheckCheck, MoreVertical, Search, Send } from 'lucide-react';
import { api } from '../utils/api';
import { useAuthStore } from '../store/auth.store';
import ChatSidebar from '../components/ChatSidebar';
import { Avatar, dayLabel, fmtTime } from '../components/ui';

export default function ChatPage() {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [chat, setChat] = useState<any>(null);
  const [text, setText] = useState('');
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);
  const socketRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.get(`/chats/${chatId}/messages`).then(r => setMessages(r.data.reverse())).catch(console.error);
    api.get('/chats').then(r => setChat(r.data.find((c: any) => c.id === chatId))).catch(console.error);

    const socket = io({ auth: { token } });
    socketRef.current = socket;
    socket.emit('chat:join', { chatId });
    socket.on('message:new', (msg: any) => setMessages(prev => [...prev, msg]));
    return () => { socket.disconnect(); };
  }, [chatId, token]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const peer = chat?.type === 'PRIVATE'
    ? chat?.members?.map((m: any) => m.user).find((u: any) => u && u.id !== user?.id)
    : null;
  const title = chat?.title || peer?.displayName || peer?.username || 'Чат';
  const subtitle = chat?.type === 'GROUP'
    ? `${chat?.members?.length || 0} участников`
    : peer?.onlineStatus === 'online' ? 'в сети' : 'был(а) недавно';

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit('message:send', { chatId, text: text.trim() });
    setText('');
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  return (
    <div className="h-screen flex">
      <div className="hidden lg:block h-full">
        <ChatSidebar activeId={chatId} />
      </div>

      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Шапка чата */}
        <header className="flex items-center gap-3 px-3 py-2.5 border-b z-10"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background-secondary)' }}>
          <button className="icon-btn lg:hidden" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <Avatar name={title} imageUrl={chat?.avatarUrl || peer?.avatarUrl} size={40}
            online={peer?.onlineStatus === 'online'} />
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate leading-tight">{title}</div>
            <div className="text-xs truncate" style={{ color: peer?.onlineStatus === 'online' ? 'var(--color-accent-hover)' : 'var(--color-text-muted)' }}>
              {subtitle}
            </div>
          </div>
          <button className="icon-btn"><Search size={20} /></button>
          <button className="icon-btn"><MoreVertical size={20} /></button>
        </header>

        {/* Сообщения */}
        <div ref={listRef} className="flex-1 overflow-y-auto chat-wallpaper px-3 md:px-8 py-4 flex flex-col gap-1.5">
          {messages.map((msg, i) => {
            const own = msg.senderId === user?.id;
            const prev = messages[i - 1];
            const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
            return (
              <React.Fragment key={msg.id}>
                {newDay && <div className="date-chip my-2">{dayLabel(msg.createdAt)}</div>}
                <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                  <div className={`bubble ${own ? 'bubble-out' : 'bubble-in'}`}>
                    {msg.text || 'Вложение'}
                    <span className="bubble-time">
                      {fmtTime(msg.createdAt)}
                      {own && <CheckCheck size={13} />}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          {messages.length === 0 && (
            <div className="m-auto text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Сообщений пока нет — напиши первым!
            </div>
          )}
        </div>

        {/* Ввод */}
        <form onSubmit={sendMessage} className="flex items-end gap-2 px-3 py-3 border-t"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background-secondary)' }}>
          <textarea
            ref={taRef}
            rows={1}
            className="nexus-input resize-none flex-1 max-h-[140px]"
            placeholder="Сообщение…"
            value={text}
            onChange={e => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
          />
          <button type="submit" disabled={!text.trim()}
            className="btn-accent !rounded-full w-12 h-12 !p-0 shrink-0">
            <Send size={20} />
          </button>
        </form>
      </main>
    </div>
  );
}
