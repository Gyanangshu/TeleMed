import React, { useEffect, useState } from "react";
import { LuTimer } from "react-icons/lu";

const ConsultationTimer = ({ callExpiryTime }) => {
    const [remainingTime, setRemainingTime] = useState(0); // in seconds
    const [color, setColor] = useState("green");

    useEffect(() => {
        const expiry = new Date(callExpiryTime).getTime();
        let timer; // Declare timer before use

        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((expiry - now) / 1000));
            setRemainingTime(diff);

            // Update color based on remaining time
            if (diff > 25 * 60) {
                setColor("green");
            } else if (diff > 10 * 60) {
                setColor("orange");
            } else {
                setColor("red");
            }

            if (diff === 0) clearInterval(timer); // Now timer is declared
        };

        updateTimer(); // run once immediately
        timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [callExpiryTime]);


    // Format seconds into mm:ss
    const formatTime = (secs) => {
        const m = String(Math.floor(secs / 60)).padStart(2, "0");
        const s = String(secs % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="font-medium flex items-center gap-1" style={{ color }}>
            <LuTimer className='text-lg' />
            {formatTime(remainingTime)}
        </div>
    );
};

export default ConsultationTimer;
