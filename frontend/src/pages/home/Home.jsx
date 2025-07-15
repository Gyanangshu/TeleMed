import React from 'react';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Challenge from './components/Challenge';
import Features from './components/Features';
import Application from './components/Application';
import Technology from './components/Technology';
import Footer from './components/Footer';
import Process from './components/Process';

const Home = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <Challenge />
            <Process />
            <Features />
            <Application />
            <Technology />
            <Footer />
        </>
    )
}

export default Home
