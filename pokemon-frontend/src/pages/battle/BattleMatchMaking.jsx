import React, { useContext, useEffect, useReducer, useRef, useState } from "react";
import { userContext } from "../../App";
import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useSWR from "swr";
import axios from "axios";
import FindLoader from "../../components/Loaders/FindLoader";
import { useNavigate } from "react-router-dom";
import Battle from "./Battle";
import io from "socket.io-client";
import api from "../../helper/api"; // your backend base URL

// Create SOCKET INSTANCE ONLY ONCE
const socket = io(api, { autoConnect: false });

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const fetcher = async (url) => {
  const { data } = await axios.get(url);
  return data.map((p) => p.username);
};

const initialState = {
  player1: {
    name: undefined,
    selectedPokemon: undefined,
    selectedMove: undefined,
  },
  player2: {
    name: undefined,
    selectedPokemon: undefined,
    selectedMove: undefined,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "add_entry":
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          [action.payload.key]: action.payload.value,
        },
      };

    case "add_playerinfo":
      return { ...state, player2: action.payload };

    case "set_orignal":
      return {
        ...state,
        player1: { ...state.player1, selectedPokemon: undefined, selectedMove: undefined },
        player2: { ...state.player2, selectedPokemon: undefined, selectedMove: undefined },
      };

    default:
      return state;
  }
};

function BattleMatchMaking() {
  const { battleTeam, setBattleTeam, userinfo } = useContext(userContext);

  const [roomid, setRoomid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const [state, dispatch] = useReducer(reducer, initialState);
  const myteam = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!battleTeam) {
      const team = localStorage.getItem("team");
      if (team) {
        const parsed = JSON.parse(team);
        setBattleTeam(parsed);
        myteam.current = [...parsed];
      }
    }
  }, []);

  useEffect(() => {
    if (userinfo) {
      dispatch({
        type: "add_entry",
        payload: { player: "player1", key: "name", value: userinfo.username },
      });
    }
  }, [userinfo]);

  // SOCKET EVENT LISTENERS — only once
  useEffect(() => {
    // game start event
    socket.on("game_start", (data) => {
      console.log("GAME START:", data);
      setRoomid(data.room);
      setLoading(false);
    });

    return () => {
      socket.off("game_start");
    };
  }, []);

  // load users
  const { data } = useSWR(`${api}/user/all`, fetcher);

  const handleSearchPlayers = () => {
    setLoading(true);
    socket.connect();

    if (battleTeam) myteam.current = [...battleTeam];

    dispatch({ type: "set_orignal" });

    socket.emit("searchForOnlineMatch", {
      player: state.player1,
      userid: userinfo._id,
    });
  };

  const handleStopSearch = () => {
    setLoading(false);
    socket.emit("user_disconnect", { userid: userinfo._id });
    socket.disconnect();
  };

  // No team selected
  if (!battleTeam || !userinfo || battleTeam.length === 0) {
    return (
      <div className="p-4 h-full flex flex-col justify-center items-center gap-4 uppercase text-red-400 text-2xl">
        <h2>Please Select a Team First</h2>
        <Button color="success" variant="contained" onClick={() => navigate("/myteams")}>
          My Teams
        </Button>
      </div>
    );
  }

  // BEFORE MATCH FOUND
  if (!roomid) {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="h-full flex flex-col items-center gap-10 py-12 p-4 sm:p-2 ">

          {/* TITLE */}
          {/* <h1 className="uppercase text-center text-5xl font-extrabold tracking-wide
          text-transparent bg-gradient-to-r from-green-300 via-yellow-300 to-red-400 
          bg-clip-text drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]
          animate-pulse
        ">
            Get Ready For Battle
          </h1> */}

          {/* CARD WRAPPER */}
          <div className="w-full max-w-3xl bg-[#111] rounded-2xl shadow-xl border border-[#1f1f1f] p-8 flex flex-col gap-10">

            {/* CHALLENGE FRIEND */}
            <div className="flex flex-col gap-4 items-center">
              <h3 className="text-green-400 text-2xl font-bold tracking-wider">
                Challenge a Friend
              </h3>

              <Autocomplete
                value={value}
                onChange={(e, val) => setValue(val)}
                inputValue={inputValue}
                onInputChange={(e, val) => setInputValue(val)}
                options={data?.filter((u) => u !== userinfo.username) || []}
                sx={{
                  width: 350,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Search user..." />
                )}
              />

              {/* Challenge Button */}
              {value && !loading && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-blue-300 text-xl">{value}</span>
                  <Button variant="contained" color="success">
                    Challenge
                  </Button>
                </div>
              )}
            </div>

            {/* SEPARATOR */}
            <div className="w-full h-[1px] bg-[#222]"></div>

            {/* SEARCH ONLINE */}
            <div className="flex flex-col items-center gap-6">
              <h3 className="text-slate-300 tracking-wide text-lg uppercase">
                Or search for a random opponent
              </h3>

              {loading ? (
                <div className="flex flex-col items-center gap-6">
                  <Button variant="contained" color="error" onClick={handleStopSearch}>
                    Cancel Search
                  </Button>

                  <FindLoader />

                  <p className="text-slate-400 animate-pulse">
                    Searching players...
                  </p>
                </div>
              ) : (
                <Button
                  variant="contained"
                  disabled={inputValue !== ""}
                  onClick={handleSearchPlayers}
                  color="success"
                  sx={{ px: 6, py: 1.4, borderRadius: "10px" }}
                >
                  Find Match
                </Button>
              )}
            </div>
          </div>
          {/* HOW THE GAME WORKS SECTION */}
          <div className="bg-[#101010] mt-4 rounded-xl border border-[#1f1f1f] p-6 shadow-lg text-slate-300">
            <h2 className="text-xl font-bold text-green-400 uppercase tracking-wider mb-3">
              How the Battle Works
            </h2>

            <ul className="list-disc ml-5 space-y-2 leading-relaxed">
              <li>
                When two players connect, the battle begins. Each round both players must
                <span className="text-green-300 font-semibold"> choose a Pokémon and a move</span>.
              </li>

              <li>
                <span className="text-yellow-300 font-semibold">Both players must lock in their move</span>.
                Only after both have selected moves do the attacks begin.
              </li>

              <li>
                Every round has a <span className="text-red-400 font-bold">30-second timer</span>.
                You must select both Pokémon and a move before it ends.
              </li>

              <li>
                Moves have <span className="text-blue-300 font-semibold">PP (Power Points)</span>.
                PP determines how many times you can use a particular move.
              </li>

              <li>
                If you fail to choose a Pokémon or a move within time:
                <span className="text-red-500 font-bold"> you automatically resign</span>.
              </li>

              <li>
                If all your Pokémon’s HP reaches zero, you
                <span className="text-red-400 font-bold"> lose the battle</span>.
              </li>

              <li>
                A chat window is provided —
                <span className="text-purple-300 font-semibold"> please be respectful</span>.
              </li>
            </ul>

            {/* DAMAGE CALC EXPLANATION */}
            <h3 className="text-lg font-semibold text-blue-300 mt-6 mb-2">
              How Damage Is Calculated
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed">
              Every attack uses your Pokémon’s stats, the opponent’s stats,
              move power, crit chance and accuracy. The formula is simplified below:
            </p>

            <div className="bg-[#0d0d0d] border border-[#222] rounded-lg p-4 mt-3 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2 text-green-300 font-bold">Damage Factors:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Move Power</li>
                <li>Your Pokémon’s <span className="text-green-200">Attack / Sp. Attack</span></li>
                <li>Opponent’s <span className="text-red-200">Defense / Sp. Defense</span></li>
                <li>Critical Hit (50% chance)</li>
                <li>STAB – Same Type Attack Bonus (×1.5)</li>
                <li>Accuracy Check (Move can miss!)</li>
                <li>Attack order (higher Speed Pokémon attacks first)</li>
              </ul>

              <p className="mt-4 italic text-slate-400">
                In simple terms:
                <span className="text-green-300">
                  Higher attack, faster speed, and strong moves = more damage.
                </span>
                Higher defense and HP reduce the damage you take.
              </p>
            </div>
          </div>

        </div>
      </ThemeProvider>
    );
  }


  // AFTER MATCH FOUND → BATTLE PAGE
  return (
    <div className="h-full">
      <Battle
        state={state}
        socket={socket}
        room={roomid}
        dispatch={dispatch}
        battleTeam={battleTeam}
        setRoom={setRoomid}
      />
    </div>
  );
}

export default BattleMatchMaking;
