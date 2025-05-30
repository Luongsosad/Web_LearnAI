"use client";
import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import Main from './main'
function Edit() {
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
        <div className="overflow-hidden h-screen flex w-full mx-auto custom-scroll">
            <div className="w-[0] md:w-full"></div>
            <div className="w-full h-screen md:min-w-[768px]">
                <Main />
            </div>
            <div className="w-[0] md:w-full"></div>
        </div>
    );
}

export default Edit;
