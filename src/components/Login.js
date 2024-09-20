import React, { useState } from 'react';
import { ref, set, get, child } from 'firebase/database';
import { db } from '../firebase';
import '../login.css';

const Login = ({ onLoginSuccess }) => {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleLoginOrSignup = async () => {
    if (teamName.trim() === '' || password.trim() === '') {
      setError('TeamName and Password are required');
      return;
    }

    const teamRef = ref(db, `teams/${teamName}`);
    const snapshot = await get(child(ref(db), `teams/${teamName}`));

    if (isLogin) {
      if (snapshot.exists() && snapshot.val().password === password) {
        onLoginSuccess(teamName);
      } else {
        setError('Invalid TeamName or Password');
      }
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (snapshot.exists()) {
        setError('TeamName already exists');
        return;
      }
      await set(teamRef, {
        password,
        gantt_tasks: []
      });
      onLoginSuccess(teamName);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="TeamName"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />
      {!isLogin && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input"
        />
      )}
      <button onClick={handleLoginOrSignup}>
        {isLogin ? 'Login' : 'Sign Up'}
      </button>
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'No account? Sign up' : 'Have an account? Login'}
      </p>
    </div>
  );
};

export default Login;
