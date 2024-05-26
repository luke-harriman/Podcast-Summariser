// frontend/contexts/authContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (session) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (email, password) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (!result.error) {
      // Handle success here
      console.log('Logged in successfully!');
    } else {
      // Handle errors here
      console.error(result.error);
    }
  };

  const logout = async () => {
    const result = await signOut({ redirect: false });
    if (!result.error) {
      // Handle success here
      setUser(null);
      console.log('Logged out successfully!');
    }
  };

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}




// Now, you can use the useAuth hook in your components to access the current user's authentication state and the login and logout methods. Here's an example of how you might use it in a component:
// import { useAuth } from '../contexts/authContext';

// export default function LoginPage() {
//   const { login } = useAuth();

//   const handleLogin = () => {
//     login('user@example.com', 'password123');
//   };

//   return (
//     <div>
//       <button onClick={handleLogin}>Log In</button>
//     </div>
//   );
// }