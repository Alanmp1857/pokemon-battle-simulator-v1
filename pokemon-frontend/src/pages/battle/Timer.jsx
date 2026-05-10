import React, { useEffect, useState } from 'react';

function Timer({ setResign, timeUp, setTimeUp, move, oppMove }) {
    const [seconds, setSeconds] = useState(120);
    const [isPaused, setIsPaused] = useState(false);

    // Determine pause state: pause only if THIS player selected but opponent HASN'T
    useEffect(() => {
        // Pause only when this player has selected a move but opponent hasn't
        console.log("Timer useEffect - move:", move, "oppMove:", oppMove);
        if (move && !oppMove) {
            setIsPaused(true);
        } else {
            setIsPaused(false);
        }
    }, [move, oppMove]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prevSeconds) => {
                if (isPaused) {
                    return prevSeconds; // Don't decrement if paused
                }
                return prevSeconds - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPaused]);

    useEffect(() => {
        if (seconds === 0) {
            if (!move) {
                setResign('resigned');
            }
            setSeconds(120);
        }
    }, [seconds, move, setResign]);

    return (
        <div className='text-white text-center flex flex-col justify-center items-center h-full uppercase'>
            <h3 className='text-sm'>time left</h3>
            <h3 className={`text ${isPaused ? 'text-yellow-400' : 'text-blue-400'}`}>{seconds}</h3>
            {isPaused && <p className='text-xs text-yellow-400 mt-1'>paused</p>}
        </div>
    );
}

export default Timer