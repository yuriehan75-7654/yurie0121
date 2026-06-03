import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [activeTab, setActiveTab] = useState('tracks');
  const [loading, setLoading] = useState(false);
  const [djMessages, setDjMessages] = useState([
    { type: 'dj', text: "Hey! I've been analyzing your music taste. You've got an amazing mix of genres!" },
    { type: 'dj', text: "I see you enjoy everything from jazz to K-pop. That versatility shows a deep appreciation for music." },
  ]);
  const [userInput, setUserInput] = useState('');

  const CLIENT_ID = '2a4445aa9ee94ce9a05641698df5c822';
  const REDIRECT_URI = 'https://yurie0121.vercel.app/api/auth/callback';
  const SCOPES = 'user-read-private user-read-email user-top-read playlist-read-private';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      localStorage.setItem('spotify_token', t);
      setToken(t);
      window.history.replaceState({}, '', '/');
    } else {
      const saved = localStorage.getItem('spotify_token');
      if (saved) setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [u, t, p] = await Promise.all([
        fetch('https://api.spotify.com/v1/me', { headers }).then(r => r.json()),
        fetch('https://api.spotify.com/v1/me/top/tracks?limit=8', { headers }).then(r => r.json()),
        fetch('https://api.spotify.com/v1/me/playlists?limit=8', { headers }).then(r => r.json()),
      ]);
      if (u.error) { localStorage.removeItem('spotify_token'); setToken(null); return; }
      setUser(u);
      setTopTracks(t.items || []);
      setPlaylists(p.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const login = () => {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
  };

  const logout = () => {
    localStorage.removeItem('spotify_token');
    setToken(null); setUser(null);
  };

  const sendMessage = () => {
    if (!userInput.trim()) return;
    setDjMessages(prev => [...prev, { type: 'user', text: userInput }]);
    setUserInput('');
    const responses = [
      "Great taste! Your music profile shows someone who appreciates both emotional depth and artistic sophistication.",
      "Interesting! The intersection of politics and music is powerful — many of your favorite artists are known for their activism too.",
      "Based on your listening history, you'd probably love artists who blend genres while keeping a strong artistic vision.",
      "I love your curiosity! Jazz, K-pop, hip-hop, ballads — you appreciate music from so many different cultural contexts.",
      "You know, the artists you listen to most often tend to use music as a form of storytelling. That's a real sign of depth.",
    ];
    setTimeout(() => {
      setDjMessages(prev => [...prev, { type: 'dj', text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 700);
  };

  const s = {
    page: { minHeight: '100vh', background: '#0f0f0f', fontFamily: 'system-ui, -apple-system, sans-serif' },
    header: { background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    card: { background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a' },
  };

  if (!token) return (
    <>
      <Head><title>AI Radio</title></Head>
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px', background: '#1a1a1a', borderRadius: '16px', textAlign: 'center', border: '1px solid #2a2a2a' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎵</div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: '0 0 8px' }}>AI Radio</h1>
          <p style={{ color: '#888', fontSize: '15px', margin: '0 0 28px' }}>Your personal AI DJ powered by Spotify</p>
          <button onClick={login} style={{ width: '100%', padding: '15px', background: '#1DB954', color: 'white', border: 'none', borderRadius: '50px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginBottom: '24px' }}>
            Login with Spotify
          </button>
          <div style={{ background: '#111', borderRadius: '10px', padding: '16px', textAlign: 'left' }}>
            {['Your Spotify library & top tracks', 'Real playlists from your account', 'AI DJ chat in English', 'Politics & music discussions', 'Personalized recommendations'].map((f, i) => (
              <div key={i} style={{ color: '#888', fontSize: '13px', padding: '5px 0' }}>
                <span style={{ color: '#1DB954', marginRight: '8px' }}>✓</span>{f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white', fontSize: '18px' }}>Loading your music... 🎵</div>
    </div>
  );

  return (
    <>
      <Head><title>AI Radio — {user?.display_name}</title></Head>
      <div style={s.page}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎵</span>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>AI Radio</div>
              <div style={{ color: '#1DB954', fontSize: '12px' }}>● Spotify Connected</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user?.images?.[0] && <img src={user.images[0].url} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
            <div>
              <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{user?.display_name}</div>
              <div style={{ color: '#666', fontSize: '12px' }}>{user?.product === 'premium' ? '✦ Premium' : 'Free'}</div>
            </div>
            <button onClick={logout} style={{ padding: '7px 14px', background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              Logout
            </button>
          </div>
        </div>

        <div style={{ background: '#141414', borderBottom: '1px solid #2a2a2a', padding: '0 20px', display: 'flex', overflowX: 'auto' }}>
          {[
            { id: 'tracks', label: '🔥 Top Tracks' },
            { id: 'playlists', label: '🎵 Playlists' },
            { id: 'dj', label: '🤖 AI DJ' },
            { id: 'politics', label: '🌍 Politics & Music' },
            { id: 'recommend', label: '⭐ For You' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '14px 16px', background: 'transparent', color: activeTab === tab.id ? 'white' : '#555',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid #1DB954' : '2px solid transparent',
              cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === tab.id ? 600 : 400, whiteSpace: 'nowrap'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>

          {activeTab === 'tracks' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>Your Top Tracks</h2>
              <div style={{ display: 'grid', gap: '10px' }}>
                {topTracks.map((track, i) => (
                  <div key={i} style={{ ...s.card, padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <span style={{ color: '#444', fontSize: '13px', width: '20px', textAlign: 'center' }}>{i + 1}</span>
                    {track.album?.images?.[0] && <img src={track.album.images[0].url} style={{ width: '46px', height: '46px', borderRadius: '6px' }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{track.name}</div>
                      <div style={{ color: '#777', fontSize: '12px', marginTop: '2px' }}>{track.artists?.map(a => a.name).join(', ')}</div>
                    </div>
                    <div style={{ color: '#444', fontSize: '12px' }}>
                      {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'playlists' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>Your Playlists</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {playlists.map((pl, i) => (
                  <div key={i} style={{ ...s.card, padding: '14px', cursor: 'pointer' }}>
                    {pl.images?.[0]
                      ? <img src={pl.images[0].url} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                      : <div style={{ width: '100%', aspectRatio: '1', background: '#222', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎵</div>
                    }
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{pl.name}</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>{pl.tracks?.total} songs</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dj' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>AI DJ Chat</h2>
              <div style={s.card}>
                <div style={{ padding: '20px', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {djMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.type === 'dj' ? 'flex-start' : 'flex-end' }}>
                      <div style={{
                        maxWidth: '72%', padding: '11px 15px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.5,
                        background: msg.type === 'dj' ? '#1DB954' : '#2a2a2a', color: 'white'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #2a2a2a', padding: '14px', display: 'flex', gap: '10px' }}>
                  <input
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Talk to your AI DJ..."
                    style={{ flex: 1, padding: '11px 14px', background: '#111', color: 'white', border: '1px solid #333', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                  <button onClick={sendMessage} style={{ padding: '11px 20px', background: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'politics' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>Politics & Music</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { icon: '🎙', title: 'Political Commentary Podcasts', desc: 'Deep discussions on music and social change' },
                  { icon: '✊', title: 'Protest Songs Throughout History', desc: 'From civil rights to modern activism' },
                  { icon: '📢', title: 'Artists Speaking Out', desc: 'Musicians who use their platform for change' },
                  { icon: '🌍', title: 'Music & Social Movements', desc: 'How music has shaped political history worldwide' },
                ].map((item, i) => (
                  <div key={i} style={{ ...s.card, padding: '20px', display: 'flex', gap: '16px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '28px' }}>{item.icon}</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '5px' }}>{item.title}</div>
                      <div style={{ color: '#777', fontSize: '13px' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommend' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>Made for You</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { icon: '🎷', title: 'Jazz meets Hip-Hop', desc: 'Artists blending classical sophistication with modern production' },
                  { icon: '💿', title: 'Socially Conscious K-pop', desc: 'K-pop with powerful political messages' },
                  { icon: '🌙', title: 'Late Night Ballads', desc: 'Deep emotional tracks for quiet moments' },
                  { icon: '💎', title: 'Indie Hidden Gems', desc: 'Underrated artists matching your taste profile' },
                  { icon: '🎻', title: 'Classical Reimagined', desc: 'Classical musicians covering modern songs' },
                ].map((item, i) => (
                  <div key={i} style={{ ...s.card, padding: '20px', display: 'flex', gap: '16px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '28px' }}>{item.icon}</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '5px' }}>{item.title}</div>
                      <div style={{ color: '#777', fontSize: '13px' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
