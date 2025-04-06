import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Backend URL from environment variable or default
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Check for token and fetch user data on page load
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
            fetchUserData(token);
        }
    }, []);

    // Helper function to fetch user data with token
    const fetchUserData = async (token) => {
        try {
            const response = await fetch(`${BACKEND_URL}/user/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                // If token is invalid, clear it
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem('token', data.token);
                
                // Fetch user data
                await fetchUserData(data.token);
                
                // Navigate to profile
                navigate('/profile');
                return null;
            } else {
                return data.message || 'Failed to login';
            }
        } catch (error) {
            console.error('Login error:', error);
            return 'Network error occurred. Please try again.';
        }
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/success".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        try {
            const response = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/success');
                return null;
            } else {
                return data.message || 'Registration failed';
            }
        } catch (error) {
            console.error('Registration error:', error);
            return 'Network error occurred. Please try again.';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
