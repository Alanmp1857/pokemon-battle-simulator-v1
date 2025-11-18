import React, { useContext, useEffect, useReducer, useState } from 'react'
import { userContext } from '../../App'
import { Button, createTheme, IconButton, ThemeProvider, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { backgrounds } from '../../helper/battleBackgrounds'
import pokemonAlive from '../../assets/pokeball-alive.png'
import pokemonDead from '../../assets/pokeball-dead.png'
import Timer from './Timer'
import RenderPokemon from './RenderPokemon'
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { types } from '../../helper/types'
import GameEnd from './GameEnd'
import Chat from './Chat'

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

// pick background once
const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

const Slot = ({ info, battleTeam, lostcnt }) => {
    return (
        <div className='grid grid-cols-5 gap-2 h-full'>
            <div className='bg-[#0f0f10] col-span-1 flex flex-col items-center rounded-lg border border-[#232323] p-2'>
                <h3 className='text-xs text-blue-300 w-full text-center'>{info.title}</h3>
                {info.image ? <img src={info.image} className='h-10 mt-1' alt='sprite' /> : <div className='h-10' />}
            </div>
            <div className='bg-[#0f0f10] col-span-4 rounded-lg border border-[#232323] text-white pl-3 text-sm'>
                <div className='flex gap-2 items-center py-2'>
                    <div className='flex gap-1 items-center'>
                        {battleTeam.map((p, index) => <img src={index > lostcnt - 1 ? pokemonAlive : pokemonDead} key={index} className='h-4' alt='ball' />)}
                    </div>
                    <div className='text-slate-300 truncate hidden sm:block'>{info.message}</div>
                </div>
            </div>
        </div>
    )
}

export const ToolTipComp = ({ pokemon }) => {
    return (
        <div className='flex flex-col gap-2 text-xs'>
            <div className='flex gap-2 items-center'>
                {pokemon.types.map((p, index) => (
                    <div key={index} className={`px-2 py-0.5 rounded text-black font-semibold`} style={{ backgroundColor: types[p] }}>
                        {p}
                    </div>
                ))}
                <div className='text-slate-400 ml-2'>BST: <span className='text-white'>{pokemon.bst}</span></div>
            </div>
            <div className='text-slate-400'>
                <div>HP: <span className='text-white'>{pokemon.hp}</span> | ATK: <span className='text-white'>{pokemon.atk}</span> | DEF: <span className='text-white'>{pokemon.def}</span></div>
                <div>SpA: <span className='text-white'>{pokemon.spa}</span> | SpD: <span className='text-white'>{pokemon.spd}</span> | SPE: <span className='text-white'>{pokemon.spe}</span></div>
            </div>
        </div>
    )
}

let user = '', opponent = '';
function Battle({ state, socket, room, dispatch, battleTeam, setRoom }) {

    const { userinfo } = useContext(userContext)
    const navigate = useNavigate();

    const [resign, setResign] = useState('resign');
    const [status, setStatus] = useState(['waiting for action...', 'waiting for action...']);
    const [lostCount, setLostCount] = useState([0, 0]);
    const [gameEnd, setGameEnd] = useState(undefined);
    const [open, setOpen] = useState(false);
    const [timeUp, setTimeUp] = useState(30);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        socket.emit("playerinfo", { player: state.player1, room: room });
        user = userinfo.username;
        // initialize currHp for local team copy
        battleTeam.forEach((x, ind) => {
            battleTeam[ind] = { ...x, currHp: x.hp };
        })
    }, [])

    useEffect(() => {
        let timeoutid = undefined;

        socket.on("playerinfo", (data) => {
            dispatch({ type: 'add_playerinfo', payload: data });
            opponent = data.name;
        })

        socket.on("opponentPokemon", (data) => {
            dispatch({ type: 'add_entry', payload: { player: 'player2', key: 'selectedPokemon', value: data } })
        })

        socket.on("damageInfo", (data) => {
            // map data1/data2 to player1/player2 relative to local user
            let player1 = {}, player2 = {};
            if (data.data1.name === user) {
                player1 = data.data1;
                player2 = data.data2;
            } else {
                player1 = data.data2;
                player2 = data.data1;
            }

            // update UI state and local copies
            dispatch({ type: 'add_entry', payload: { player: 'player1', key: 'selectedPokemon', value: player1.pokemon } });
            dispatch({ type: 'add_entry', payload: { player: 'player2', key: 'selectedPokemon', value: player2.pokemon } });

            // update local battleTeam hp if matched
            battleTeam.forEach((x, index) => {
                if (x.name === player1.pokemon.name) {
                    battleTeam[index] = player1.pokemon;
                }
            });

            setStatus([player1.message, player2.message]);
            setTimeUp(30);

            // delay to show messages & check faint
            timeoutid = setTimeout(() => {
                if (player1.pokemon.currHp <= 0) {
                    setLostCount(p => [p[0] + 1, p[1]]);
                    dispatch({ type: 'add_entry', payload: { player: 'player1', key: 'selectedPokemon', value: undefined } });
                    dispatch({ type: 'add_entry', payload: { player: 'player1', key: 'selectedMove', value: undefined } });
                } else if (player2.pokemon.currHp <= 0) {
                    setLostCount(p => [p[0], p[1] + 1]);
                    dispatch({ type: 'add_entry', payload: { player: 'player2', key: 'selectedPokemon', value: undefined } });
                    dispatch({ type: 'add_entry', payload: { player: 'player2', key: 'selectedMove', value: undefined } });
                }
            }, 1400);
        })

        socket.on("message", (data) => {
            setMessages(m => [...m, data]);
        })

        socket.on("resign", (data) => {
            setGameEnd(data);
            setOpen(true);
        })

        return () => {
            if (timeoutid) clearTimeout(timeoutid);
            socket.emit("user_disconnect", { userid: userinfo['_id'] });
            socket.disconnect();
        }
    }, [socket])

    useEffect(() => {
        let finished = false;
        if (lostCount[0] === 6) {
            finished = true;
            setGameEnd({ winner: opponent, message: `${opponent} won with ${6 - lostCount[1]} remaining!` });
        }
        if (lostCount[1] === 6) {
            finished = true;
            setGameEnd({ winner: user, message: `${user} won with ${6 - lostCount[0]} remaining!` });
        }
        if (resign === 'resigned') {
            finished = true;
            const obj = { winner: opponent, message: `${user} resigned the game!` }
            setGameEnd(obj);
            socket.emit("resign", { ...obj, room })
        }
        setOpen(finished);
    }, [lostCount, resign])

    useEffect(() => {
        if (gameEnd) {
            socket.emit("user_disconnect", { userid: userinfo['_id'] });
            socket.disconnect();
        }
    }, [gameEnd])

    const handlePokemonSelect = (pokemon) => {
        dispatch({ type: 'add_entry', payload: { player: 'player1', key: 'selectedPokemon', value: { currHp: pokemon.hp, ...pokemon } } });
        socket.emit("opponentPokemon", { selectedPokemon: { currHp: pokemon.hp, ...pokemon }, room: room });
    }

    const handleSelectMove = (move) => {
        // ensure we have the most recent selectedPokemon snapshot when sending
        dispatch({ type: 'add_entry', payload: { player: 'player1', key: 'selectedMove', value: move } });
        setStatus(s => [`selected move ${move.Name}`, 'waiting for action...']);
        socket.emit("attack", { player: state.player1.name, pokemon: state.player1.selectedPokemon, move, room })

        // locally decrement PP for display
        let pokemon = { ...state['player1']['selectedPokemon'] }
        pokemon = {
            ...pokemon,
            'moves': pokemon.moves.map(x => {
                if (x.id === move.id) {
                    return { ...x, PP: Math.max(0, x.PP - 1) };
                }
                return x;
            })
        }
        dispatch({ type: 'add_entry', payload: { player: 'player1', key: 'selectedPokemon', value: pokemon } });
    }

    const sendMessage = () => {
        if (message !== '') {
            setMessages(m => [...m, { user, message }]);
            socket.emit("message", { user, message, room });
            setMessage('');
        }
    }

    return (
        <div className='h-full sm:p-1  mx-auto w-full'>
            <div className='flex justify-center items-center h-full w-full'>
                <ThemeProvider theme={darkTheme}>
                    <div className='grid sm:grid-cols-7 grid-cols-1 h-full p-1 sm:p-4 gap-4 xl:min-w-[100rem]'>

                        {/* LEFT / ARENA */}
                        <div className='col-span-1 sm:col-span-4 p-3 rounded-2xl shadow-xl border border-[#1f1f23] bg-[#0b0b0d] flex flex-col'>
                            <div className='rounded-2xl overflow-hidden relative flex-1' style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', minHeight: 380 }}>
                                {/* Top opponent area */}
                                <div className='absolute inset-x-0 top-4 flex justify-end sm:pr-6'>
                                    {state.player2.selectedPokemon && <RenderPokemon pokemon={state.player2.selectedPokemon} front key={state.player2?.selectedPokemon?.name} ToolTip={ToolTipComp} />}
                                </div>

                                {/* bottom player area */}
                                <div className='absolute inset-x-0 bottom-4 flex justify-start sm:pl-6'>
                                    {state.player1.selectedPokemon && <RenderPokemon pokemon={state.player1.selectedPokemon} key={state.player1.selectedPokemon.name} ToolTip={ToolTipComp} />}
                                </div>
                            </div>

                            {/* Moves row or prompt */}
                            {state.player1.selectedPokemon ? (
                                <div className='mt-3 grid grid-cols-4 gap-3'>
                                    {state.player1.selectedPokemon.moves.map((move, index) => (
                                        <Tooltip key={index} arrow placement='bottom' title={
                                            <div className='text-xs'>
                                                <div className='mb-1 px-2 py-1 rounded text-black' style={{ backgroundColor: types[move.Type.toLowerCase()] }}>{move.Type}</div>
                                                <div>Power: <b>{move.Power}</b> | Acc: <b>{move.Accuracy}</b></div>
                                            </div>
                                        }>
                                            <Button
                                                variant='contained'
                                                sx={{
                                                    padding: '10px',
                                                    borderRadius: '10px',
                                                    textTransform: 'none',
                                                    backgroundColor: move.PP === 0 ? '#555' : types[move.Type.toLowerCase()] || '#4ADE80',
                                                    color: move.PP === 0 ? '#ccc' : '#000',
                                                    fontWeight: 700,
                                                }}
                                                disabled={move.PP === 0}
                                                onClick={() => handleSelectMove(move)}
                                            >
                                                <div className='text-left w-full'>
                                                    <div className='text-sm'>{move.Name}</div>
                                                    <div className='text-xs text-slate-800 mt-1'>{move.PP}</div>
                                                </div>
                                            </Button>
                                        </Tooltip>
                                    ))}
                                </div>
                            ) : (
                                <div className='mt-3 p-4 text-center text-red-400 uppercase border border-[#222] rounded-md'>Please select a Pokémon to see their moves!</div>
                            )}

                            {/* Pokemon selector row */}
                            <div className='mt-4 grid grid-cols-6 gap-2 bg-[#0f0f10] p-2 rounded-lg'>
                                {battleTeam.map((pokemon, index) => (
                                    <div
                                        key={index}
                                        className={`rounded-lg p-2 transition transform duration-200 flex items-center justify-center border ${pokemon.currHp <= 0 ? 'opacity-40 grayscale pointer-events-none' : 'hover:scale-105'} `}
                                        style={{ background: '#121214', borderColor: '#222' }}
                                        onClick={() => handlePokemonSelect(pokemon)}
                                    >
                                        <Tooltip arrow placement="top" title={<ToolTipComp pokemon={pokemon} />}><img src={pokemon.image} className='sm:h-16 h-auto sm:scale-105 scale-125' alt={`poke-${index}`} /></Tooltip>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT / CONTROLS & CHAT */}
                        <div className='col-span-1 sm:col-span-3 p-3 rounded-2xl shadow-xl border border-[#1f1f23] bg-[#0b0b0d] grid grid-rows-[auto_auto_1fr] gap-4'>

                            {/* status + timer */}
                            <div className='grid grid-cols-5 gap-3'>
                                <div className='col-span-4 flex flex-col gap-3'>
                                    <Slot info={{ title: state.player1.name, image: state.player1.selectedPokemon?.image, message: status[0] }} battleTeam={battleTeam} lostcnt={lostCount[0]} />
                                    <Slot info={{ title: state.player2.name, image: state.player2.selectedPokemon?.image, message: status[1] }} battleTeam={battleTeam} lostcnt={lostCount[1]} />
                                </div>
                                <div className='col-span-1 flex flex-col gap-3'>
                                    <div className='rounded-lg bg-[#0e0e10] border border-[#232323] p-3 flex items-center justify-center'>
                                        <Timer setResign={setResign} timeUp={timeUp} setTimeUp={setTimeUp} move={state.player1.selectedMove} />
                                    </div>
                                    <div className='rounded-lg bg-[#0e0e10] border border-[#232323] p-2 flex items-center justify-center'>
                                        {resign === 'resign' && <Button size='small' color='error' variant='contained' onClick={() => setResign('confirm')}>Resign</Button>}
                                        {resign === 'confirm' && <div className='flex gap-2'><IconButton onClick={() => setResign('resign')}><CloseIcon /></IconButton> <IconButton onClick={() => setResign('resigned')}><DoneIcon /></IconButton></div>}
                                    </div>
                                </div>
                            </div>

                            {/* battle log */}
                            <div className='rounded-lg bg-[#0e0e10] border border-[#232323] p-2 overflow-y-auto'>
                                <div className='flex flex-col gap-2'>
                                    {/* Simple logs from status */}
                                    <div className='text-slate-300 text-sm'>{status[0]}</div>
                                    <div className='text-slate-300 text-sm'>{status[1]}</div>
                                </div>
                            </div>

                            {/* chat area */}
                            <div className='rounded-lg bg-[#0e0e10] border border-[#232323] p-3 flex flex-col h-full'>
                                <div className='flex-1 overflow-y-auto pr-2'>
                                    <Chat messages={messages} user={user} />
                                </div>

                                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className='mt-3 flex gap-2'>
                                    <input value={message} onChange={(e) => setMessage(e.target.value)} className='flex-1 rounded-lg px-3 py-2 bg-[#0b0b0d] border border-[#2a2a2a] text-white outline-none' placeholder='Type a message...' />
                                    <Button onClick={sendMessage} variant='contained' size='small'>Send</Button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <GameEnd open={open} setOpen={setOpen} {...gameEnd} user={user} setRoom={setRoom} />
                </ThemeProvider>
            </div>
        </div>
    )
}

export default Battle
