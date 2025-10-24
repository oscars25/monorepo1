export function saveToken(token) { localStorage.setItem('jwt', token); }
export function getToken() { return localStorage.getItem('jwt'); }

export async function fetchMessages(sessionId) {
  const token = getToken();
  const res = await fetch(`http://localhost:8080/api/messages/session/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return res.json();
}