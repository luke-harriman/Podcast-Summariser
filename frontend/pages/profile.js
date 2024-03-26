// /frontend/pages/profile.js

import { useEffect, useState } from 'react';
import Router from 'next/router';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data from your auth system
    // setUser(...);
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h1>Profile</h1>
          <p>Welcome, {user.name}!</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
