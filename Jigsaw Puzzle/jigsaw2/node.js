const getBoundary = (x, y, size) => {
    let temp = []
    if (x == 0) {
        temp.push(0)
    }
    if (y == 0) {
        temp.push(3)
    }
    if (x == size[0] - 1) {
        temp.push(2)
    }
    if (y == size[1] - 1) {
        temp.push(1)
    }
    return temp
}

const rotate = (list) => {
    return [list[1], list[2], list[3], list[0]]
}

const nextCell = (x, y, size) => {
    let dy = y + 1
    if (dy >= size[1]) {
        return [x + 1, 0]
    }
    return [x, dy]
}

let check = (x, y, data, grid, size) => {
    let directions = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1]
    ]
    for (let i = 0; i < 4; i += 1) {
        let dx = x + directions[i][0]
        let dy = y + directions[i][1]
        if (dx < 0 || dx >= size[0] || dy < 0 || dy >= size[1]) {
            if (data[i] != 0) return false
        } else {
            if (!grid[dx][dy]) {
                continue
            }
            if (grid[dx][dy][(i + 2) % 4] + data[i] != 0) {
                return false
            }
        }
    }
    return true
}

const getSolutions = (data) => {
    let size = [10, 7]
    let solutions = []
    let grid = [...Array(size[0])].map((item) => Array(size[1]).fill(null))
    let n = 0
    const dfs = (x, y, grid, data) => {
        if (data.length==0) {
            console.log(`Solution ${n}:`)
            n+=1
            solutions.push({
                grid: JSON.parse(JSON.stringify(grid))
            })
            return
        }
        
        let willPlace = {}

        for (let list of data) {
            let key = `${list}`
            willPlace[key] = []
            let boundarys = getBoundary(x, y, size)
            let temptile = JSON.parse(JSON.stringify(list))
            for (let i = 0; i < 4; i += 1) {
                let suit = true
                for (let j of boundarys) {
                    if (temptile[j] != 0) {
                        suit = false
                        break
                    }
                }
                if (suit && check(x, y, temptile, grid, size)) {
                    willPlace[key].push(temptile)
                }
                temptile = rotate(temptile)
            }
        }
        
        for (let i = 0; i < data.length; i += 1) {
            let key = `${data[i]}`
            let tempData = JSON.parse(JSON.stringify(data))
            tempData = tempData.filter((item, inx) => inx != i)
            let [dx, dy] = nextCell(x, y, size)
            for (let tile of willPlace[key]) {
                grid[x][y] = tile
                dfs(dx, dy, grid, tempData)
                grid[x][y] = null
            }
        }
        return
    }
    
    dfs(0, 0, JSON.parse(JSON.stringify(grid)), JSON.parse(JSON.stringify(data)))
    console.log(JSON.stringify(solutions))
    if (solutions.length > 0) {
        const counts = countNumbersInSolution(solutions[0]);
        console.log(counts);
    }
}

const countNumbersInSolution = (solution) => {
    const counts = {};
    for (let row of solution.grid) {
        for (let tile of row) {
            if (tile) {
                for (let num of tile) {
                    counts[num] = (counts[num] || 0) + 1;
                }
            }
        }
    }
    return counts;
};

let tilesData = [
    [0, 2, 5, 0], [0, 6, 5, -2], [0, -2, 2, -6], [0, -2, -4, 2], [0, -4, -4, 2], [0, 5, 2, 4], [0, -3, -5, -5], [0, 3, 4, 3], [0, 4, 4, -3], [0, 0, -5, -4],
    [-5, -4, 5, 0], [-5, -5, -1, 4], [-2, 5, 1, 5], [4, 4, 4, -5], [4, 2, 3, -4], [-2, 6, -5, -2], [5, 4, 4, -6], [-4, -5, 1, -4], [-4, -5, -4, 5], [5, 0, 1, 5],
    [-5, 5, -3, 0], [1, -5, 2, -5], [-1, 1, -5, 5], [-4, -4, 5, -1], [-3, 3, 1, 4], [5, -4, -3, -3], [-4, 4, -4, 4], [-1, 2, 6, -4], [4, -5, -5, -2], [-1, 0, -5, 5],
    [3, -4, 6, 0], [-2, -5, 5, 4], [5, -5, 2, 5], [-5, -2, 4, 5], [-1, 2, -6, 2], [3, -6, 5, -2], [4, 1, 6, 6], [-6, 3, -2, -1], [5, 4, -3, -3], [5, 0, 6, -4],
    [-6, -4, 2, 0], [-5, -3, 4, 4], [-2, -3, -2, 3], [-4, 4, 4, 3], [6, 1, -3, -4], [-5, -4, -1, -1], [-6, -2, -3, 4], [2, 5, -1, 2], [3, -2, 4, -5], [-6, 0, 1, 2],
    [-2, -6, -2, 0], [-4, 4, -3, 6], [2, 6, 5, -4], [-4, 2, 4, -6], [3, 4, -5, -2], [1, 5, 2, -4], [3, 2, -2, -5], [1, -1, 3, -2], [-4, -6, -6, 1], [-1, 0, 3, 6],
    [2, -6, 0, 0], [3, -6, 0, 6], [-5, 6, 0, 6], [-4, 6, 0, -6], [5, -3, 0, -6], [-2, 3, 0, 3], [2, 4, 0, -3], [-3, 5, 0, -4], [6, 1, 0, -5], [-3, 0, 0, -1]
    
]  

getSolutions(tilesData)

console.log(tilesData.length)