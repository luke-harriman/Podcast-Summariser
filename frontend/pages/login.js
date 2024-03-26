// /frontend/pages/login.js

import { useState } from 'react';
import Router from 'next/router';

export default function Login() {
  const [userData, setUserData] = useState({ email: '', password: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (response.ok) {
      // Perform action on success
      Router.push('/profile');
    } else {
      // Handle error
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={userData.email}
        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={userData.password}
        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
      />

      <button type="submit">Login</button>
    </form>
  );
}
