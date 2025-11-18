import { Button, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import Statbox from "../../components/Statbox";
import { types } from "../../helper/types";

function Team({ selectedPokemons }) {
  const [selectedPokemon, setSelectedPokemon] = useState(selectedPokemons[0]);

  useEffect(() => {
    setSelectedPokemon(selectedPokemons[0]);
  }, [selectedPokemons]);

  return (
    <div className="bg-[#161616] rounded-xl p-4 flex flex-col gap-4 text-white ">
      {selectedPokemon && (
        <>
          {/* Pokémon Thumbnails */}
          <div className="grid grid-cols-6 gap-3">
            {selectedPokemons.map((p, i) => (
              <Tooltip title={p.name} key={i}>
                <div
                  onClick={() => setSelectedPokemon(p)}
                  className={`rounded-md p-2 bg-[#222] cursor-pointer border 
                  ${
                    selectedPokemon.name === p.name
                      ? "border-green-400"
                      : "border-transparent"
                  }
                  hover:border-green-300 transition `}
                >
                  <img
                    src={`https://raw.githubusercontent.com/KaranRansing2002/pokemon-battle-simulator/old_version/src/images/${p.name}.png`}
                    className="w-full scale-125"
                  />
                </div>
              </Tooltip>
            ))}
          </div>

          {/* Pokémon Details Card */}
          <div className="grid grid-cols-5 gap-4 bg-[#1e1e1e] rounded-lg p-4">
            <div className="col-span-2 flex justify-center items-center">
              <img
                src={`https://play.pokemonshowdown.com/sprites/ani/${selectedPokemon.name.split("-")[0]}.gif`}
                className="scale-125"
              />
            </div>

            <div className="col-span-3 flex flex-col gap-3">
              <h2 className="text-xl font-bold text-green-400">
                {selectedPokemon.name}
              </h2>

              <div className="flex gap-2">
                {selectedPokemon.types.map((type, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs rounded font-semibold border border-black uppercase"
                    style={{ backgroundColor: types[type] }}
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div>
                <h3 className="text-sm mb-1">Ability</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedPokemon.abilities.map((ab, i) => (
                    <Button
                      key={i}
                      variant={
                        selectedPokemon.ability === ab ? "contained" : "outlined"
                      }
                      size="small"
                      sx={{
                        textTransform: "none",
                        color: "white",
                        borderRadius: "6px",
                      }}
                    >
                      {ab}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <Statbox pokemon={selectedPokemon} />

          {/* Moves */}
          <div className="bg-[#1e1e1e] rounded-lg p-4">
            <h3 className="text-xs mb-2 uppercase text-slate-400">
              Moves
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {selectedPokemon.moves.map((move, i) => (
                <Button
                  key={i}
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#4ADE80",
                    color: "black",
                    "&:hover": { backgroundColor: "#4ADE80" }
                  }}
                >
                  {move.Name}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Team;
