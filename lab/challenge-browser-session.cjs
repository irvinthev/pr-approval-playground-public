'use strict';

const { createHmac, randomBytes, timingSafeEqual } = require('node:crypto');

const cookieName = '__Host-challenge-lab';
const lifetime = 8 * 60 * 60;
const attributes = 'Path=/; HttpOnly; Secure; SameSite=Strict';

function hasChallengeToken(authorization) {
  const token = process.env.CHALLENGE_API_TOKEN;
  if (!token || typeof authorization !== 'string') return false;
  const actual = Buffer.from(authorization);
  const expected = Buffer.from('Bearer ' + token);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function browserSessionsEnabled() {
  return process.env.VERCEL_ENV === 'preview' && Boolean(process.env.CHALLENGE_API_TOKEN);
}

function isBrowserRequest(req) {
  return req.headers['x-challenge-lab'] === '1';
}

function sign(payload) {
  return createHmac('sha256', process.env.CHALLENGE_API_TOKEN)
    .update('challenge-lab/browser-session/v1:' + payload)
    .digest();
}

function hasBrowserSession(req) {
  if (!browserSessionsEnabled() || !isBrowserRequest(req)) return false;
  const entry = (req.headers.cookie || '').split(';').map(part => part.trim())
    .find(part => part.startsWith(cookieName + '='));
  const value = entry?.slice(cookieName.length + 1);
  const match = /^(\d{1,12})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(value || '');
  if (!match || Number(match[1]) <= Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(Buffer.from(match[3], 'hex'), sign(match[1] + '.' + match[2]));
}

function createBrowserSessionCookie() {
  const expires = Math.floor(Date.now() / 1000) + lifetime;
  const payload = expires + '.' + randomBytes(16).toString('hex');
  return cookieName + '=' + payload + '.' + sign(payload).toString('hex') +
    '; Max-Age=' + lifetime + '; ' + attributes;
}

function clearBrowserSessionCookie() {
  return cookieName + '=; Max-Age=0; ' + attributes;
}

exports.hasChallengeToken = hasChallengeToken;
exports.browserSessionsEnabled = browserSessionsEnabled;
exports.isBrowserRequest = isBrowserRequest;
exports.hasBrowserSession = hasBrowserSession;
exports.createBrowserSessionCookie = createBrowserSessionCookie;
exports.clearBrowserSessionCookie = clearBrowserSessionCookie;
