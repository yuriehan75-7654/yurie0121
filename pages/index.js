import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [djMessages, setDjMessages] = useState([
    { type: 'dj', text: "Welcome! I'm your AI DJ. Let's explore your music taste!" }
  ]);
  const [userInput, setUserInput] = useState('');

  const CLIENT_ID = '2a4445aa9ee94ce9a05641698df5c822';
  const REDIRECT_URI = 'https://yurie0121.vercel.app/api/auth/callback';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('spotifyToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserData(token);
    }
  };

  const handleLogin = () => {
    const scope = 'user-read-private user-read-email user-top-read playlist-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  const fetchUserData = async (token) => {
    try {
      const userRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      setUser(userData);

      const tracksRes = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tracksData = await tracksRes.json();
      setTopTracks(tracksData.items || []);

      const playlistRes = await fetch('https://api.spotify.com/v1/me/playlists?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const playlistData = await playlistRes.json();
      setPlaylists(playlistData.items || []);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const sendDJMessage = () => {
    if (userInput.trim()) {
      setDjMessages([...djMessages, { type: 'user', text: userInput }]);
      
      const responses = [
        "That's interesting! Based on your music taste, I think you'd appreciate artists who blend genres.",
        "I love your music selection! You have great taste in exploring different genres.",
        "Your listening habits show a sophisticated appreciation for music across cultures and styles.",
        "Given your interest in both social consciousness and artistic expression, I recommend exploring protest songs.",
        "I notice you enjoy both introspective ballads and high-energy hip-hop. That's a great balance!"
      ];
      
      setTimeout(() => {
        setDjMessages(prev => [...prev, { type: 'dj', text: responses[Math.floor(Math.random() * responses.length)] }]);
      }, 600);
      
      setUserInput('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spotifyToken');
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>🎵 AI Radio</h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>Experience personalized music with AI DJ commentary</p>
          <button 
            onClick={handleLogin}
            style={{ width: '100%', padding: '15px', fontSize: '16px', background: '#1DB954', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Login with Spotify
          </button>
          <div style={{ marginTop: '30px', background: '#f7f7f7', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
            <h3>Features:</h3>
            <p>✓ Your Spotify Library</p>
            <p>✓ Top Tracks & Playlists</p>
            <p>✓ AI DJ Chat (English)</p>
            <p>✓ Music Recommendations</p>
            <p>✓ Politics & Music</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>🎵 {user?.display_name}'s AI Radio</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          {['home', 'tracks', 'playlists', 'dj', 'politics', 'recommend'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 15px', background: activeTab === tab ? '#1DB954' : '#f0f0f0', color: activeTab === tab ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === tab ? 'bold' : 'normal' }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'home' && (
          <div>
            <h2>Welcome back, {user?.display_name}!</h2>
            <p>Explore your music with AI DJ guidance across different genres and moods.</p>
          </div>
        )}

        {activeTab === 'tracks' && (
          <div>
            <h2>Your Top Tracks</h2>
            {topTracks.map((track, idx) => (
              <div key={idx} style={{ padding: '15px', background: '#f9f9f9', marginBottom: '10px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 'bold' }}>{track.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{track.artists?.map(a => a.name).join(', ')}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div>
            <h2>Your Playlists</h2>
            {playlists.map((playlist, idx) => (
              <div key={idx} style={{ padding: '15px', background: '#f9f9f9', marginBottom: '10px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 'bold' }}>{playlist.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{playlist.tracks?.total || 0} songs</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'dj' && (
          <div>
            <h2>AI DJ Chat</h2>
            <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', minHeight: '300px', marginBottom: '15px', overflowY: 'auto' }}>
              {djMessages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: '10px', textAlign: msg.type === 'dj' ? 'left' : 'right' }}>
                  <div style={{ display: 'inline-block', padding: '10px 15px', background: msg.type === 'dj' ? '#1DB954' : '#007bff', color: 'white', borderRadius: '8px', maxWidth: '70%' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Talk to AI DJ..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendDJMessage()}
                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
              <button onClick={sendDJMessage} style={{ padding: '10px 20px', background: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Send
              </button>
            </div>
          </div>
        )}

        {activeTab === 'politics' && (
          <div>
            <h2>Politics & Music</h2>
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <p>✓ Political Commentary Podcasts</p>
              <p>✓ Protest Songs & Activism</p>
              <p>✓ Artists Speaking Out</p>
              <p>✓ Music for Social Change</p>
            </div>
          </div>
        )}

        {activeTab === 'recommend' && (
          <div>
            <h2>For You</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>🎹 Jazz meets Hip-Hop Production</div>
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>💿 Socially Conscious K-pop</div>
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>🎺 Classical Artists Reimagining Modern Songs</div>
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>📖 Ballads with Political Undertones</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
