export default async function handler(req, res) {
  const { code } = req.query;
  const CLIENT_ID = '2a4445aa9ee94ce9a05641698df5c822';
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REDIRECT_URI = 'https://yurie0121.vercel.app/api/auth/callback';

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    const data = await response.json();

    if (data.access_token) {
      res.redirect(`/?token=${data.access_token}`);
    } else {
      res.status(400).json({ error: 'Failed to get token' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
