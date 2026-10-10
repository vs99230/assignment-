import { useState } from 'react';
import { registerUser, loginWithOtp } from './api.js';
import Restaurants from './Restaurants.jsx';

const TOKEN_KEY = 'fastor_token';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setStep('phone');
    setOtp('');
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) return setError('Enter a valid 10-digit mobile number.');
    setError('');
    setLoading(true);
    try {
      await registerUser(phone);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(otp)) return setError('Enter the OTP (default is 123456).');
    setError('');
    setLoading(true);
    try {
      const t = await loginWithOtp(phone, otp);
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (token) return <Restaurants token={token} onLogout={logout} />;

  return (
    <main className="card">
      <h1>Welcome</h1>
      {step === 'phone' ? (
        <form onSubmit={sendOtp}>
          <p className="muted">Enter your mobile number to get an OTP.</p>
          <div className="row">
            <span className="prefix">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <p className="muted">OTP sent to +91 {phone}. (Default OTP: 123456)</p>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
          {error && <p className="error">{error}</p>}
          <button disabled={loading}>{loading ? 'Verifying...' : 'Verify & Login'}</button>
          <button type="button" className="link" onClick={() => { setStep('phone'); setError(''); }}>
            Change number
          </button>
        </form>
      )}
    </main>
  );
}
