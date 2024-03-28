// /frontend/pages/login.js
import { useState } from 'react';
import Router from 'next/router';
import Image from 'next/image';
import logo from '../public/assets/placeholder_logo.png'; // adjust the path to your logo
import ButtonOutline from '../components/misc/ButtonOutline';
import Link from 'next/link';

export default function Login() {
  const [userData, setUserData] = useState({
    email: '',
    password: ''
  });

  async function handleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission
  
    if (!userData.email || !userData.password) {
      console.error('Email and password are required.');
      return;
    }
  
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
  
    if (response.ok) {
      Router.push('/profile');
    } else {
      const errorData = await response.json();
      console.error(errorData.error);
    }
  }

  return (
    <div className="bg-white-500 min-h-screen flex justify-center items-center">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium mb-2">Email</label>
            <input id="email" type="email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} className="form-input w-full text-lg p-3 border rounded" required />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-medium mb-2">Password</label>
            <input id="password" type="password" value={userData.password} onChange={(e) => setUserData({ ...userData, password: e.target.value })} className="form-input w-full text-lg p-3 border rounded" required />
          </div>
          <div className="flex justify-center"> {/* Add this div */}
            <ButtonOutline
                href="/login"
                style={{ width: '300px' }}
                className="additional-class-names"
                legacyBehavior
                >
                Log In
            </ButtonOutline>
            </div>
          <div className="text-center text-sm mt-4">
            <Link href="/signup" legacyBehavior>
              <a className="text-blue-100 hover:text-blue-800 transition duration-300">
                Haven't created an account?
              </a>
            </Link>
          </div>
        </form>
      </div>
      <div className="fixed top-4 left-4">
        <Image src={logo} alt="Logo" width={100} height={50} />
      </div>
    </div>
  );
}
