import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useState } from 'react';

export default function AuthGuard({ children }) {
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // If the user is logged in, render the protected content (like the Dashboard)
  if (user) {
    return children;
  }

  const glassCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    color: 'white',
    textAlign: 'center'
  };

  // If not logged in, show the auth screens
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      // Subtle dark overlay to make white text pop in case the background is bright
      backgroundColor: 'rgba(0,0,0,0.2)' 
    }}>
      <div style={glassCardStyle}>
        
        {isLogin ? <LoginForm /> : <SignupForm />}
        
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
            marginTop: '25px', cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}