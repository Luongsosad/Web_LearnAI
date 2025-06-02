"use client";
import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import Main from './main'

function Login() {
    useEffect(() => {
        const awake = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ping`);
                console.log('Data fetched successfully:', response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        awake();
    }, []);

    return (
        <div className="overflow-hidden h-screen">
            <Main />
        </div>
    );
}

export default Login;
