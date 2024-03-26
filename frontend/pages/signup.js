// /frontend/pages/signup.js

import { useState } from 'react';
import Router from 'next/router';

export default function Signup() {
  const [userData, setUserData] = useState({ email: '', password: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (response.ok) {
      // Perform action on success
      Router.push('/login');
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

      <button type="submit">Sign Up</button>
    </form>
  );
}
