// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api'; // <-- Your centralized API client
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { username, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    // <-- Put your updated handler here
    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            const res = await apiClient.post('/api/auth/login/', { username, password });
            if (res && res.data && res.data.key) {
                localStorage.setItem('authToken', res.data.key);
                navigate('/');
            } else {
                setError('Unexpected server response: No token received.');
            }
        } catch (err) {
            if (err.response && err.response.data) {
                // Backend returned an error, e.g., wrong credentials
                setError('Login failed: ' + (err.response.data.detail || 'Unknown error.'));
            } else if (err.message) {
                setError('Network or server error: ' + err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={onSubmit}>
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={username} onChange={onChange} required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={password} onChange={onChange} required />
                </div>
                <button type="submit">Login</button>
                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
