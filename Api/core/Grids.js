const x = 10;
const y = 10;
let grid = [];
const initGrid = () => {
    for (let i = 0; i < x; i++){
        grid[i] = []
    }
    let k = 0;
    for (let i = 0; i < x; i++){
        for (let j = 0; j < y; j++){
            k++;
            grid[i][j] = {id:k,letter:'',disabled:false}
        }
    }
    return grid;
};

module.exports = {initGrid};