// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { username, email, password, password2 } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== password2) {
            setError('Passwords do not match');
            return;
        }
        try {
            // Note: dj-rest-auth expects password1 and password2
            await apiClient.post('/api/auth/registration/', { username, email, password, password2 });
            navigate('/login'); // Redirect to login after successful registration
        } catch (err) {
            const backendErrors = Object.values(err.response.data).flat().join(' ');
            setError(backendErrors || 'Registration failed.');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={onSubmit}>
                <h2>Create Account</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="input-group">
                    <label>Username</label>
                    <input type="text" name="username" value={username} onChange={onChange} required />
                </div>
                <div className="input-group">
                    <label>Email</label>
                    <input type="email" name="email" value={email} onChange={onChange} required />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input type="password" name="password" value={password} onChange={onChange} required />
                </div>
                <div className="input-group">
                    <label>Confirm Password</label>
                    <input type="password" name="password2" value={password2} onChange={onChange} required />
                </div>
                <button type="submit">Sign Up</button>
                 <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
