let prob = []; 
  
const damage = (pokemon1, pokemon2, move) => {
    // console.log(pokemon1, pokemon2);
    // if (!move.Accuracy) {
    //     return 0;     
    // }
    let { Accuracy, Power, Category } = move;
    Category = Category.split('-')[1].split('.')[0];
    const { atk, spa } = pokemon1;
    const { def, spd , hp} = pokemon2;
    Accuracy = Accuracy === '∞' ? 100 : parseInt(Accuracy);
    for (let i = 1; i <= 100; i++){
        if (i <= Accuracy) prob.push(1);
        else prob.push(0);
    }  
    let probability = prob[Math.floor(Math.random() * 100)];
    let arr = [1, 1.5];
    let crit = arr[Math.floor(arr.length * Math.random())];
    const stab = 1.5;
    let power = Power === '—' ? 0 : parseInt(Power);
    const attack = Category === "physical" ? atk : spa;
    const defence = Category === "physical" ? def : spd;
    let damage = (0.25 * power * (attack / defence) * crit * stab * hp * probability) / 100;
    // console.log(atk,Category,spa,def,spd);
    damage = Math.min(damage, pokemon2.currHp);
    console.log("there : ",damage,pokemon2.currHp)
    return damage; 
    
}
module.exports = damage;