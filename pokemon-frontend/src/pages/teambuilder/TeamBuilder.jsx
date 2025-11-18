import React, { useEffect, useRef, useState } from 'react'
import Pokedex from './Pokedex'
import { Button, Snackbar, TextField, Tooltip } from '@mui/material'
import { types } from '../../helper/types'
import Statbox from '../../components/Statbox'
import MovesTable from './MovesTable'
import SnackBar from '../../components/SnackBar'
import axios from 'axios'
import api from '../../helper/api'
import { v4 as uuid } from 'uuid';


const TeamBuilder = () => {
  const [selectedPokemons, setSelectedPokemons] = useState(() => localStorage.getItem('team') ? JSON.parse(localStorage.getItem('team')) : [])
  const [selectedPokemon, setSelectedPokemon] = useState(undefined);
  const [selectedMoves, setSelectedMoves] = useState(() => (!selectedPokemon ? [] : selectedPokemon.moves))
  const [toggle, setToggle] = useState(false)
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('success')

  useEffect(() => {
    localStorage.setItem('team', JSON.stringify(selectedPokemons))
    if (selectedPokemons.length > 0 && (selectedPokemon === undefined || (!selectedPokemons.includes(selectedPokemon))))
      setSelectedPokemon(selectedPokemons[0])
    if (selectedPokemons.length === 0)
      setSelectedPokemon(undefined)
  }, [selectedPokemons])

  useEffect(() => {
    if (selectedPokemon) {
      const team = selectedPokemons.map((p) => {
        if (p.name === selectedPokemon.name) {
          p.moves = [...selectedMoves]
        }
        return p
      })
      // localStorage.setItem('team', JSON.stringify(team)) 
      setSelectedPokemons([...team])
    }
  }, [selectedMoves])

  useEffect(() => {
    if (selectedPokemon) {
      setSelectedMoves(selectedPokemon.moves ? [...selectedPokemon['moves']] : [])
    }
  }, [selectedPokemon])

  const handleAbility = (ability) => {
    const team = selectedPokemons.map(p => {
      if (p.name === selectedPokemon.name) {
        p.ability = ability
      }
      return p
    })
    setSelectedPokemons([...team]);
  }

  console.log(types);

  const handleSave = async () => {
    let isVaildTeam = true;
    if (selectedPokemons.length === 0) isVaildTeam = false;
    let reason = ''
    for (let x of selectedPokemons) {
      if (!x.moves || x.moves.length === 0) {
        isVaildTeam = false;
        reason = `${x.name}'s moves not added !`
        break;
      }
    }
    if (isVaildTeam) {
      try {
        const teamid = selectedPokemons[0].teamid ? selectedPokemons[0].teamid : uuid();
        const resp = await axios.post(`${api}/user/team`, { id: teamid, team: [...selectedPokemons] }, {
          withCredentials: true
        })
        if (resp.data.successfull) {
          setSeverity('success');
          setTitle('saved successfully visit myteams to see more')
        }
      } catch (error) {
        setSeverity('error')
        setTitle(error.message)
      }
    }
    else {
      setTitle(reason)
      setSeverity('error')
    }
    // console.log(title,severity)
  }

  return (
    <div className="h-full w-full grid place-items-center sm:px-4  ">
      <div className="h-full w-full max-w-7xl xl:max-w-[100rem] grid grid-cols-1 sm:grid-cols-6 gap-4 p-4">
        {/* LEFT SIDE – POKEMON LIST OR MOVES TABLE */}
        <div className="sm:col-span-4 rounded-lg shadow-lg ">
          <div className="h-full overflow-auto rounded-lg">
            {toggle ? (
              <MovesTable pokemon={selectedPokemon} selectedMoves={selectedMoves} setSelectedMoves={setSelectedMoves} />
            ) : (
              <Pokedex setSelectedPokemons={setSelectedPokemons} selectedPokemons={selectedPokemons} />
            )}
          </div>
        </div>

        {/* RIGHT SIDE – SELECTED POKEMON PANEL */}
        <div className="  flex flex-col justify-center sm:col-span-2 ">
          {selectedPokemon ? (
            <div className='bg-[#1E1F22] p-4 rounded-xl shadow-lg border border-[#2a2a2a] '>
              <h2 className='text-center text-white font-semibold text-lg py-2'>T E A M</h2>
              {/* TEAM PANEL */}
              <div className="grid grid-cols-6 gap-2 pb-2">
                {selectedPokemons.map((pokemon, ind) => (
                  <Tooltip title={pokemon.name} key={ind}>
                    <div
                      className={`rounded-lg bg-[#2e2e2e] p-1 cursor-pointer transition-all duration-200 border hover:scale-[1.05]
                ${pokemon.name === selectedPokemon.name ? "border-green-400 shadow-md" : "border-transparent"}`}
                      onClick={() => setSelectedPokemon(pokemon)}
                    >
                      <img
                        src={`https://raw.githubusercontent.com/KaranRansing2002/pokemon-battle-simulator/old_version/src/images/${pokemon.name}.png`}
                        className="rounded"
                      />
                    </div>
                  </Tooltip>
                ))}
              </div>

              {/* SELECTED POKEMON CARD */}
              <div className="w-full bg-[#252525] rounded-xl px-3 py-4 flex gap-3 shadow-lg border border-[#333]">
                {/* Sprite */}
                <div className="w-2/5 flex justify-center items-center bg-[#2f2f2f] rounded-lg p-3 shadow-inner">
                  <img
                    src={`https://play.pokemonshowdown.com/sprites/ani/${selectedPokemon.name.split('-')[0]}.gif`}
                    className="scale-110 drop-shadow-lg"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col gap-3 w-3/5">
                  <h2 className="text-xl font-extrabold text-green-400 capitalize tracking-wide">
                    {selectedPokemon.name}
                  </h2>

                  {/* Types */}
                  <div className="flex flex-wrap gap-2">
                    {selectedPokemon.types.map((type, ind) => (
                      <span
                        key={ind}
                        className="px-2 py-1 text-xs rounded-md border border-black shadow-sm font-semibold"
                        style={{ backgroundColor: types[type] }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Abilities */}
                  <div className="flex flex-col">
                    <h3 className="text-sm text-slate-300 mb-1">Choose Ability</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPokemon.abilities.map((ability, ind) => (
                        <Button
                          key={ind}
                          size="small"
                          variant={selectedPokemon.ability === ability ? "contained" : "outlined"}
                          onClick={() => handleAbility(ability)}
                          sx={{
                            color: "white",
                            borderRadius: "10px",
                            textTransform: "capitalize",
                            padding: "4px 10px",
                          }}
                        >
                          {ability}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN SCROLL AREA — removes empty space issue */}
              <div className="flex-grow overflow-y-auto my-3 scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-[#222] pr-1">

                {/* STATBOX SECTION */}
                <div className="bg-[#252525] rounded-xl p-4 shadow-inner border border-[#333] mb-4">
                  <Statbox pokemon={selectedPokemon} />
                </div>

                {/* MOVES SECTION */}
                <div className="bg-[#252525] rounded-xl p-4 shadow-xl border border-[#333] flex flex-col gap-4">
                  <h3 className="text-sm uppercase font-semibold text-slate-300 text-center tracking-wide">
                    Select At Least 1 Move
                  </h3>

                  {/* move buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMoves.map((move, index) => (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#4ADE80",
                          color: "black",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          "&:hover": { backgroundColor: "#3ec66f" },
                        }}
                        key={index}
                      >
                        {move.Name}
                      </Button>
                    ))}
                  </div>

                  {/* action buttons */}
                  <div className="flex justify-center gap-4 mt-3">
                    <Button variant="contained" size="small" onClick={() => setToggle((p) => !p)}>
                      {toggle ? "Back to Pokémons" : "Add Moves"}
                    </Button>

                    {/* <Button variant="contained" size="small" color="success" onClick={handleSave}>
                      Save Team
                    </Button> */}
                    {/* save button in here */}
                    <SnackBar title={title} severity={severity} func={handleSave} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid place-items-center h-full text-center px-4">
              <h1 className="text-lg text-blue-300 font-bold">
                Please select six Pokémon to begin building your team
              </h1>
            </div>
          )}
        </div>

      </div>
    </div>
  );

}

export default TeamBuilder
