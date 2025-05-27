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
            <div className="w-[0] md:w-[25%]"></div>
            <div className="w-full h-screen md:w-[50%]">
                <Main />
            </div>
            <div className="w-[0] md:w-[25%]"></div>
        </div>
    );
}

export default Edit;
