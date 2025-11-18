import React from "react";
import { TypeAnimation } from "react-type-animation";
import { Link } from "react-router-dom";

const Hero = () => {
    return (
        <div className=" relative text-white flex flex-col justify-center items-center p-6 h-full min-h-[90vh] overflow-hidden">

            {/* Decorative background particles */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="w-96 h-96 bg-green-600/20 blur-[150px] rounded-full absolute top-10 left-10"></div>
                <div className="w-72 h-72 bg-blue-500/20 blur-[120px] rounded-full absolute bottom-10 right-20"></div>
            </div>

            {/* MAIN TITLE */}
            <div className="text-center max-w-3xl z-10">
                <p className="text-[#00df9a] font-semibold tracking-widest uppercase">
                    Welcome to Pokémon Showdown
                </p>

                <h1 className="text-5xl md:text-7xl font-extrabold mt-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,45,45,0.4)]">
                    Master. Dominate. Conquer.
                </h1>

                <p className="md:text-2xl text-lg font-medium mt-6 text-gray-200">
                    Play with over <span className="text-green-300 font-bold">900+</span> unique Pokémon.
                </p>

                <TypeAnimation
                    sequence={[
                        "Strategize", 2000,
                        "Compete", 2000,
                        "Conquer", 2000,
                    ]}
                    wrapper="span"
                    speed={40}
                    className="block mt-4 text-3xl font-semibold text-purple-300"
                    repeat={Infinity}
                />
            </div>

            {/* LOWER SECTION */}
            <div className="grid md:grid-cols-3 grid-cols-1 gap-4 place-items-center w-full max-w-3xl mt-10 z-10">

                {/* Left Pokémon */}
                <img
                    src="https://play.pokemonshowdown.com/sprites/ani/latios.gif"
                    className="hidden md:block md:w-40 drop-shadow-[0_0_20px_rgba(0,200,255,0.4)] animate-[float_4s_ease-in-out_infinite]"
                />

                {/* CTA BUTTON */}
                <Link to="/teambuilder" className="w-full flex justify-center">
                    <button className="px-10 py-3 text-xl font-semibold rounded-xl bg-black/40 backdrop-blur border border-green-400 hover:border-green-300 transition duration-300 shadow-[0_0_10px_rgba(0,255,150,0.6)] hover:shadow-[0_0_20px_rgba(0,255,150,0.9)]">
                        Teambuilder
                    </button>
                </Link>

                {/* Right Pokémon */}
                <img
                    src="https://play.pokemonshowdown.com/sprites/ani/rayquaza-mega.gif"
                    className="md:w-44 drop-shadow-[0_0_25px_rgba(0,255,0,0.4)] animate-[float_5s_ease-in-out_infinite]"
                />
            </div>


            {/* Feature Section */}
            <div className="mt-10 w-full flex flex-col items-center px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
                    Why Play on <span className="text-green-400">Showdown?</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">

                    {/* Feature 1 */}
                    <div className="bg-[#121212] border border-[#2a2a2a] p-6 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Online Battles</h3>
                        <p className="text-gray-300">
                            Battle real opponents worldwide with your customized Pokémon team.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-[#121212] border border-[#2a2a2a] p-6 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Build Teams</h3>
                        <p className="text-gray-300">
                            Choose from 900+ Pokémon and create competitive teams with moves & abilities.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-[#121212] border border-[#2a2a2a] p-6 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Live Ranking</h3>
                        <p className="text-gray-300">
                            Climb the leaderboard and prove your skills as a true Pokémon Master.
                        </p>
                    </div>

                </div>
            </div>

            {/* Popular Pokémon Section */}
            <div className="mt-32 w-full flex flex-col items-center px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
                    Popular Pokémon
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl">

                    {["garchomp", "charizard", "gengar", "greninja"].map((p) => (
                        <div
                            key={p}
                            className="bg-[#121212] border border-[#2a2a2a] p-5 rounded-xl flex justify-center hover:scale-110 transition-all shadow-sm hover:shadow-green-400 hover:shadow-lg border-green-400"
                        >
                            <img
                                src={`https://play.pokemonshowdown.com/sprites/ani/${p}.gif`}
                                className="h-20 drop-shadow-lg "
                            />
                        </div>
                    ))}

                </div>
            </div>

            {/* Footer */}
            <footer className="mt-40 py-10 text-center text-gray-400 border-t border-[#333]">
                <p>© {new Date().getFullYear()} Pokémon Showdown Fan Project.</p>
                <p className="text-sm mt-2">Not affiliated with Nintendo or Game Freak.</p>
            </footer>   


            {/* FLOAT ANIMATION KEYFRAMES */}
            <style>
                {`
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-12px); }
                        100% { transform: translateY(0px); }
                    }
                `}
            </style>
        </div>
    );
};

export default Hero;
