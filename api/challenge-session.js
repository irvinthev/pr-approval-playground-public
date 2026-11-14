import {
  browserSessionsEnabled,
  clearBrowserSessionCookie,
  createBrowserSessionCookie,
  hasBrowserSession,
  hasChallengeToken,
  isBrowserRequest
} from '../lab/challenge-browser-session.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!browserSessionsEnabled()) return res.status(404).json({ error: 'Browser sessions are available in Preview only.' });
  if (!isBrowserRequest(req)) return res.status(403).json({ error: 'Same-origin lab request required.' });

  if (req.method === 'GET') return res.status(200).json({ active: hasBrowserSession(req) });
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearBrowserSessionCookie());
    return res.status(200).json({ active: false });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!hasChallengeToken(req.headers.authorization)) return res.status(401).json({ error: 'Invalid lab access token.' });
  res.setHeader('Set-Cookie', createBrowserSessionCookie());
  return res.status(200).json({ active: true });
}
