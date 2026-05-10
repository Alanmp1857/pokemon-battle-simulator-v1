import React, { useEffect, useState } from 'react';
import './RenderPokemon.css';
import { Tooltip } from '@mui/material';

function RenderPokemon({ pokemon, ToolTip, front }) {
  const [hp, setHp] = useState(0);
  const [scale, setScale] = useState('');
  const [spriteSrc, setSpriteSrc] = useState('');

  console.log("Rendering Pokemon:", pokemon?.name, "HP:", pokemon?.currHp, "/", pokemon?.hp);

  useEffect(() => {
    const percent = pokemon && pokemon.currHp != null ? (pokemon.currHp / pokemon.hp * 100) : 0;
    setHp(Number(percent.toFixed(2)));
  }, [pokemon?.currHp, pokemon?.hp]);

  useEffect(() => {
    if (!pokemon?.name) {
      setSpriteSrc('');
      return;
    }

    let showdownName = pokemon.name.toLowerCase().replace(/[\s.']/g, '');
    showdownName = showdownName.includes("-") ? showdownName.split("-")[0] : showdownName; // Showdown uses the normal form name for the sprite
    setSpriteSrc(`https://play.pokemonshowdown.com/sprites/ani${front ? '' : '-back'}/${showdownName}.gif`);
  }, [front, pokemon?.name]);

  useEffect(() => {
    setScale('scaled')
  }, [pokemon?.name])

  useEffect(() => {
    if (pokemon?.currHp <= 0) setScale('dead');
  }, [pokemon?.currHp])

  return (
    <div className={`flex flex-col items-center scale-75 sm:scale-100 ${front ? 'sm:pl-6' : 'sm:pr-6'}`}>
      <div className='flex items-center gap-2'>
        <div className='bg-[#0d0d0d] rounded-full w-40 h-3 overflow-hidden shadow-inner'>
          <div
            className='h-full transition-all duration-500'
            style={{
              width: `${Math.max(0, Math.min(100, hp))}%`,
              background: 'linear-gradient(90deg,#16a34a,#84cc16)'
            }}
          />
        </div>
        <div className='text-xs text-slate-200'>{hp}%</div>
      </div>

      <div className='mt-2'>
        <Tooltip arrow placement={front ? "left" : "right"} title={<ToolTip pokemon={pokemon} />}>
          <img
            src={spriteSrc}
            className={`pokemon-image ${scale} sm:h-auto `}
            alt={pokemon.name}
            key={pokemon.name}
            onError={(e) => {
              if (e.currentTarget.src !== pokemon.image) {
                e.currentTarget.src = pokemon.image;
              }
            }}
          />
        </Tooltip>
      </div>
    </div>
  );
}

export default RenderPokemon;
