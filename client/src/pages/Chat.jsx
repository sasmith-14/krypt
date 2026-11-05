import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import socket from '../socket/socket';
import { deriveKey, encrypt, decrypt } from '../crypto/encryption';
import KryptLogo from '../components/KryptLogo';

function getRoomId(a, b) {
  return [a, b].sort().join('_');
}

function getInitials(name = '') {
  return name.trim().charAt(0).toUpperCase();
}

function formatTime(dateStr) {
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function Chat() {
  const navigate = useNavigate();

  const myId       = localStorage.getItem('userId');
  const myUsername = localStorage.getItem('username') || 'Me';

  const [users, setUsers]               = useState([]);
  const [activeUser, setActiveUser]     = useState(null);
  const [messages, setMessages]         = useState([]);
  const [inputText, setInputText]       = useState('');
  const [sending, setSending]           = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const [cryptoKey, setCryptoKey]       = useState(null);
  const [onlineIds, setOnlineIds]       = useState(new Set());

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/users');
        setUsers(data.users || []);
      } catch  finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      socket.emit('register', myId);
    }

    socket.on('connect', onConnect);
    socket.on('onlineUsers', (ids) => setOnlineIds(new Set(ids)));

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('onlineUsers');
      socket.disconnect();
    };
  }, [myId]);

  useEffect(() => {
    if (!activeUser) return;
    let cancelled = false;
    (async () => {
      const key = await deriveKey(myId, activeUser._id);
      if (!cancelled) setCryptoKey(key);
    })();
    return () => { cancelled = true; };
  }, [activeUser, myId]);

  const loadMessages = useCallback(async (user, key) => {
    setLoadingMsgs(true);
    setMessages([]);
    try {
      const { data } = await api.get(`/messages/${user._id}`);
      const rawMsgs  = data.messages || [];

      const decrypted = await Promise.all(
        rawMsgs.map(async (msg) => {
          try {
            const text = await decrypt(msg.text, key);
            return { ...msg, text, decryptFailed: false };
          } catch {
            return { ...msg, text: '⚠️ Could not decrypt message', decryptFailed: true };
          }
        })
      );

      setMessages(decrypted);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  async function openConversation(user) {
    if (activeUser?._id === user._id) return;

    if (activeUser) {
      socket.emit('leaveRoom', getRoomId(myId, activeUser._id));
      socket.off('receiveMessage');
    }

    setActiveUser(user);
    setMessages([]);
    setCryptoKey(null);

    const key    = await deriveKey(myId, user._id);
    const roomId = getRoomId(myId, user._id);

    setCryptoKey(key);
    await loadMessages(user, key);

    socket.emit('joinRoom', roomId);

    socket.on('receiveMessage', async (data) => {
      if (data.sender === myId) return;
      try {
        const text = await decrypt(data.text, key);
        setMessages((prev) => [
          ...prev,
          {
            _id:    Date.now(),
            sender: data.sender,
            text,
            time:   new Date().toISOString(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            _id:    Date.now(),
            sender: data.sender,
            text:   '⚠️ Could not decrypt message',
            time:   new Date().toISOString(),
          },
        ]);
      }
    });
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || !activeUser || !cryptoKey || sending) return;

    setSending(true);
    setInputText('');

    const roomId = getRoomId(myId, activeUser._id);

    try {
      const ciphertext = await encrypt(text, cryptoKey);

      const optimistic = {
        _id:    `opt-${Date.now()}`,
        sender: myId,
        text,
        time:   new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      await api.post('/messages/send', { receiver: activeUser._id, message: ciphertext });

      socket.emit('sendMessage', {
        roomId,
        text:     ciphertext,
        sender:   myId,
        receiver: activeUser._id,
      });
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleLogout() {
    socket.disconnect();
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="chat-layout">

      <aside className="sidebar">

        <div className="sidebar-header">
          <div className="sidebar-logo">
            <KryptLogo size={30} />
            <span className="sidebar-logo-text">Krypt</span>
          </div>
          <button
            id="logout-btn"
            className="sidebar-logout"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <div className="sidebar-me">
          <div className="avatar sm">{getInitials(myUsername)}</div>
          <div className="sidebar-me-info">
            <div className="sidebar-me-name">{myUsername}</div>
            <div className="sidebar-me-tag">You</div>
          </div>
        </div>

        <div className="sidebar-section-label">Direct messages</div>

        <div className="sidebar-users" role="list">
          {loadingUsers ? (
            <div className="sidebar-empty">
              <div className="spinner" style={{ margin: '0 auto 8px' }} />
              Loading…
            </div>
          ) : users.length === 0 ? (
            <div className="sidebar-empty">
              No other users yet.<br />Register another account to start chatting.
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                id={`user-${u._id}`}
                className={`user-item ${activeUser?._id === u._id ? 'active' : ''}`}
                role="listitem"
                onClick={() => openConversation(u)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openConversation(u)}
                aria-label={`Chat with ${u.username}`}
              >
                <div className="user-item-avatar-wrap">
                  <div className="avatar">{getInitials(u.username)}</div>
                  {onlineIds.has(u._id) && <div className="online-dot" aria-label="Online" />}
                </div>
                <div className="user-item-info">
                  <div className="user-item-name">{u.username}</div>
                  <div className="user-item-status">
                    {onlineIds.has(u._id) ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="chat-panel">
        {!activeUser ? (

          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose someone from the sidebar to start a secure, encrypted chat.</p>
          </div>
        ) : (
          <>

            <div className="chat-header">
              <div className="avatar lg">{getInitials(activeUser.username)}</div>
              <div className="chat-header-info">
                <div className="chat-header-name">{activeUser.username}</div>
                <div className="chat-header-enc">
                  <div className="chat-header-enc-dot" aria-hidden="true" />
                  🔒 End-to-end encrypted
                </div>
              </div>
            </div>

            <div className="messages-area" role="log" aria-live="polite" aria-label="Messages">
              {loadingMsgs ? (
                <div className="chat-loading">
                  <div className="spinner" />
                  Decrypting messages…
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-empty" style={{ flex: 'unset', marginTop: 'auto', marginBottom: 'auto' }}>
                  <div className="chat-empty-icon" style={{ fontSize: '2.2rem' }}>🔐</div>
                  <h3>No messages yet</h3>
                  <p>Say hi! Your conversation is end-to-end encrypted.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.sender === myId || msg.sender?.toString() === myId;
                  return (
                    <div
                      key={msg._id}
                      className={`msg-row ${isSent ? 'sent' : 'received'}`}
                    >
                      {!isSent && (
                        <div className="avatar sm" aria-hidden="true">
                          {getInitials(activeUser.username)}
                        </div>
                      )}
                      <div className={`msg-bubble ${isSent ? 'sent' : 'received'}`}>
                        {msg.text}
                        <time className="msg-time">{formatTime(msg.time || msg.createdAt)}</time>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            <div className="input-bar">
              <textarea
                ref={textareaRef}
                id="message-input"
                className="input-bar-field"
                placeholder={`Message ${activeUser.username}…`}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending || !cryptoKey}
                aria-label="Message input"
              />
              <button
                id="send-btn"
                className="send-btn"
                onClick={handleSend}
                disabled={!inputText.trim() || sending || !cryptoKey}
                aria-label="Send message"
              >
                {sending ? (
                  <div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderTopWidth: 2 }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
