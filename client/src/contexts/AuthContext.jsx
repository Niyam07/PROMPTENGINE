import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authAPI } from '@/services/api';

// Create context for auth
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  // State variables
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);
  // Sign up function
  const signUp = async (email, password, name) => {
    try {
      console.log('Attempting signup with:', { name, email });
      const data = await authAPI.register(name, email, password);
      console.log('Signup response:', data);
      
      toast.success(data.message || 'Account created! You can now sign in.');
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response);
      
      const message = error.response?.data?.message || error.message || 'Failed to create account';
      toast.error(message);
      throw error;
    }
  };
  // Sign in function
  const signIn = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      const data = await authAPI.login(email, password);
      console.log('Login response:', data);
      
      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update state
      setToken(data.token);
      setUser(data.user);
      
      toast.success('Welcome back!');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      
      const message = error.response?.data?.message || error.message || 'Failed to sign in';
      toast.error(message);
      throw error;
    }
  };
  // Sign out function
  const signOut = () => {
    // Clear everything
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, token, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}