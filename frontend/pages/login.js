import { useState } from 'react';
import Router from 'next/router';
import Image from 'next/image';
import logo from '../public/assets/placeholder_logo.png';  // Adjust the path to your logo if necessary
import ButtonOutline from '../components/misc/ButtonOutline';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // Import signIn from NextAuth

export default function Login() {
  const [userData, setUserData] = useState({
    email: '',
    password: ''
  });

  const [loginError, setLoginError] = useState(''); // State to hold login error messages

  async function handleSubmit(event) {
    event.preventDefault();
    // Use NextAuth.js signIn function to handle the login
    const result = await signIn('credentials', {
      redirect: false,  // Do not redirect automatically
      username: userData.email,
      password: userData.password,
      callbackUrl: `${window.location.origin}/platform`
    });

    if (result.error) {
      // Display any errors if the login fails
      setLoginError(result.error);
    } else {
      // Redirect the user after a successful login
      Router.push(result.url || '/platform');
    }
  }

  function handleEmailChange(e) {
    setUserData({ ...userData, email: e.target.value });
  }
  
  function handlePasswordChange(e) {
    setUserData({ ...userData, password: e.target.value });
  }

  return (
    <div className="bg-white-500 min-h-screen flex justify-center items-center">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={userData.email}
              onChange={handleEmailChange}
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
              onChange={handlePasswordChange}
              className="form-input w-full text-lg p-3 border rounded"
              required
            />
          </div>
          {loginError && <div className="text-red-500 text-center mb-2">Incorrect email or password. Try again</div>}
          <div className="flex justify-center">
            <ButtonOutline type="submit" style={{ width: '300px' }} className="additional-class-names">
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
