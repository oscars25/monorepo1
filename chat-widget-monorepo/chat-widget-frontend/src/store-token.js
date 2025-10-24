export async function login(username, password) {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    // usar credentials:'include' sólo si el backend establece cookie httpOnly
    // credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (data.token) {
    localStorage.setItem('jwt', data.token);
  }
  return data;
}

export async function fetchMessages(sessionId) {
  const token = localStorage.getItem('jwt');
  const res = await fetch(`http://localhost:8080/api/messages/session/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!res.ok) {
    throw new Error(`Fetch messages failed: ${res.status}`);
  }
  return res.json();
}