import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'; 
import logo from '../public/assets/logo-red.png'; 
import ButtonOutline from '../components/misc/ButtonOutline';
import FeatureItem from '../components/misc/FeatureItem';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // Import signIn

export default function Signup() {
  const [userData, setUserData] = useState({
    id: '', 
    email: '',
    full_name: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  // Define the features array here
  const features = [
    'Choose from 10,000s of podcasts.',
    'Get charts, data tables and headlines.',
    'Clear & concise topic summaries.', 
    'Save 100s of hours.',
    'The first customizable newsletter.'
  ];

  async function handleSubmit(event) {
    event.preventDefault();

    if (!userData.email || !userData.full_name || !userData.password) {
      setError('All fields are required.');
      return;
    }

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      // Attempt to log in the user immediately after signup
      const loginResult = await signIn('credentials', {
        redirect: false,
        username: userData.email,
        password: userData.password,
      });

      if (!loginResult.error) {
        router.push('/platform');
      } else {
        setError(loginResult.error || 'Failed to log in after signup.');
      }
    } else {
      const errorData = await response.json();
      setError(errorData.error || 'An unexpected error occurred');
    }
  }

  return (
    <div className="bg-white-500 min-h-screen flex justify-center items-center px-6 py-8">
      <div className="flex flex-wrap -mx-4 w-full max-w-4xl">
        <div className="w-full lg:w-1/2 px-4 mb-6 lg:mb-0">
          <div className="p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6">Never Miss A Podcast Ever Again!</h2>
            <ul className="text-lg space-y-4">
              {features.map((feature, index) => (
                <FeatureItem key={index}>{feature}</FeatureItem>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-full lg:w-1/2 px-4">
          <div className="p-8 bg-white rounded-lg shadow-lg h-full">
            <h2 className="text-3xl font-bold mb-6">Create Your Account</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4">
                <label htmlFor="email" className="block text-lg font-medium mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={e => setUserData({...userData, email: e.target.value})}
                  className="form-input w-full text-lg p-3 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="full_name" className="block text-lg font-medium mb-2">Full Name</label>
                <input
                  id="full_name"
                  type="text"
                  value={userData.full_name}
                  onChange={e => setUserData({...userData, full_name: e.target.value})}
                  className="form-input w-full text-lg p-3 border rounded"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-lg font-medium mb-2">Password</label>
                <input
                  id="password"
                  type="password"
                  value={userData.password}
                  onChange={e => setUserData({...userData, password: e.target.value})}
                  className="form-input w-full text-lg p-3 border rounded"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-center mb-2">{error}</div>}
              <div className="flex justify-center">
                <ButtonOutline type="submit" style={{ width: '300px' }}>
                  Create Account
                </ButtonOutline>
              </div>
            </form>
            <div className="text-center text-sm mt-4">
              <Link href="/login" legacyBehavior>
                <a className="text-blue-100 hover:text-blue-800 transition duration-300">
                  Already have an account?
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed top-4 left-4">
        <Image src={logo} alt="Logo" width={100} height={50} />
      </div>
    </div>
  );
}
