import React, { useContext, useEffect, useState } from "react";
import Team from "../teambuilder/Team";
import useSWR, { mutate } from "swr";
import api from "../../helper/api";
import Loader from "../../components/Loaders/Loader";
import axios from "axios";
import { Button, Snackbar, SnackbarContent } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { userContext } from "../../App";
import { useNavigate } from "react-router-dom";

const fetcher = async (...args) => {
    const resp = await axios.get(...args, { withCredentials: true });
    if (!resp.data.data || resp.data.data.length === 0)
        throw new Error("No teams found! Create your first team.");
    return resp.data.data;
};

const darkTheme = createTheme({
    palette: { mode: "dark" },
});

// ─────────────────────────────────────────
// A cleaner & more modern team preview card
// ─────────────────────────────────────────
export const TeamSlots = ({ team, selected }) => {
    return (
        <div
            className={`
                            grid grid-cols-6 gap-2 p-3 rounded-lg cursor-pointer transition-all
                            ${selected ? "border-2 border-green-400 bg-[#1f1f1f]" : "border border-[#333] bg-[#171717]"}
                            hover:border-green-300 hover:bg-[#1d1d1d]
                        `}
        >
            {team.map((pokemon, i) => (
                <div
                    key={i}
                    className="
                                flex justify-center items-center 
                                rounded-lg p-2
                                bg-[#121212]
                                border border-[#1f1f1f]
                                shadow-inner 
                                transition-all duration-200
                            
                                hover:shadow-[0_0_10px_rgba(0,255,150,0.15)]
                            "
                >
                    <img
                        className="h-14 sm:h-16 drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                        src={pokemon.image}
                    />
                </div>

            ))}
        </div>
    );
};

function MyTeams() {
    const { battleTeam, setBattleTeam } = useContext(userContext);
    const { data, isLoading, error } = useSWR(`${api}/user/team`, fetcher);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (data && selectedIndex === undefined) setSelectedIndex(0);
    }, [data]);

    const handleBattle = () => {
        setBattleTeam(data[selectedIndex].team);
        navigate("/battle");
        setLoading(true);
    };

    const handleEdit = () => {
        const team = [...data[selectedIndex].team];
        team[0].teamid = data[selectedIndex].id;
        localStorage.setItem("team", JSON.stringify(team));
        navigate("/teambuilder");
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${api}/user/teams/${data[selectedIndex].id}`, {
                withCredentials: true,
            });
            setSnackbarOpen(true);
            mutate(`${api}/user/team`);
            setSelectedIndex(0);
        } catch {
            alert("Something went wrong");
        }
    };

    if (error)
        return (
            <div className="grid place-items-center h-full text-white">
                <Loader />
                <h2 className="text-xl mt-4">{error.message}</h2>
            </div>
        );

    if (isLoading)
        return (
            <div className="grid place-items-center h-full text-white">
                <Loader />
                <h2 className="text-xl mt-4">Loading teams...</h2>
            </div>
        );

    return (
        <div className="grid  gap-6 p-4 h-full max-w-7xl xl:max-w-[100rem] place-items-center mx-auto ">
            <div className="grid sm:grid-cols-3 grid-cols-1 gap-6 p-4">
                {/* LEFT SIDE — Team Selection */}
                <div className="sm:col-span-2 flex flex-col gap-6">

                    {/* Selected Team Card */}
                    <div className="bg-[#111] rounded-xl p-5 shadow-lg border border-[#1f1f1f]">
                        <TeamSlots team={data[selectedIndex].team} selected />

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-3 mt-4 justify-center">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleEdit}
                                endIcon={<EditIcon />}
                                sx={{ textTransform: "none" }}
                            >
                                Edit
                            </Button>

                            <ThemeProvider theme={darkTheme}>
                                <LoadingButton
                                    loading={loading}
                                    loadingPosition="center"
                                    variant="contained"
                                    color="success"
                                    onClick={handleBattle}
                                    sx={{ textTransform: "none" }}
                                >
                                    Battle
                                </LoadingButton>
                            </ThemeProvider>

                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleDelete}
                                endIcon={<DeleteIcon />}
                                sx={{ textTransform: "none" }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>

                    {/* TEAM LIST (scrollable) */}
                    <div className="bg-[#111] rounded-xl p-4 shadow-lg border border-[#1f1f1f] h-[500px] overflow-y-auto">
                        <h2 className="text-green-400 mb-2 text-sm font-bold tracking-wide uppercase">
                            Your Teams ({data.length})
                        </h2>

                        <div className="flex flex-col gap-4">
                            {data.map((teamWrapper, i) => (
                                <div key={i} onClick={() => setSelectedIndex(i)}>
                                    <TeamSlots
                                        team={teamWrapper.team}
                                        selected={selectedIndex === i}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE — Pokémon Details */}
                <div className="bg-[#111] rounded-xl shadow-lg border border-[#1f1f1f] p-4 flex items-center flex-col justify-center gap-4">
                    <h2 className="text-white font-bold text-lg">SELECTED   &nbsp;  TEAM</h2>
                    <Team selectedPokemons={data[selectedIndex].team} />
                </div>

                {/* SNACKBAR */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={() => setSnackbarOpen(false)}
                >
                    <SnackbarContent
                        sx={{ backgroundColor: "green" }}
                        message="Team deleted successfully"
                    />
                </Snackbar>
            </div>
        </div>
    );
}

export default MyTeams;
