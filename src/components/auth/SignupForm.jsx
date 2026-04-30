import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SignupForm() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', marginBottom: '20px',
    background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px', color: 'white', fontSize: '16px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.3s ease'
  };

  const buttonStyle = {
    width: '100%', padding: '14px', background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '12px',
    color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
    transition: 'all 0.3s ease', marginTop: '10px'
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '28px', fontWeight: '800' }}>Check Your Email</h2>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9, lineHeight: '1.5' }}>
          We've sent a confirmation link to <strong>{email}</strong>. Please click the link to finish setting up your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ margin: '0 0 30px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '1px' }}>
        Create Account
      </h2>
      
      {error && (
        <p style={{ color: '#ff6b6b', backgroundColor: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', width: '100%' }}>
          {error}
        </p>
      )}
      
      <input 
        type="email" 
        placeholder="Email address"
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
        style={inputStyle}
        onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.6)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
      />
      
      <input 
        type="password" 
        placeholder="Password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
        style={inputStyle}
        onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.6)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
      />
      
      <button 
        type="submit" 
        disabled={loading}
        style={buttonStyle}
        onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.3)'; e.target.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.2)'; e.target.style.transform = 'translateY(0)'; }}
      >
        {loading ? 'Processing...' : 'Create Account'}
      </button>
    </form>
  );
}