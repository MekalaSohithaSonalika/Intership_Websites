let puzzleImage = null;

// This will now store mapping data including rotation.
// E.g., { '0,1': { sourcePos: [5,6], rotationDelta: 2 } }
let solutionImageMappings = {
    0: {}, // Original solution mapping
    1: {}, // Solution 2 mapping
    2: {}, // Solution 3 mapping
    3: {}  // Solution 4 mapping
};

document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageUpload');
    if (imageInput) {
        imageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    puzzleImage = new Image();
                    puzzleImage.onload = function() {
                        // Re-map images and redisplay solutions if they exist
                        if (globalSolutions && globalSolutions.length > 0) {
                            mapImagesAcrossSolutions();
                            displaySolutions(globalSolutions);
                        }
                    };
                    puzzleImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handler to find rotation difference and direction for a specific tile (by numbers) between solution1 and solution2
    const rotationBtn = document.getElementById('findTileRotationBtn');
    if (rotationBtn) {
        rotationBtn.addEventListener('click', function() {
            const numbersInput = document.getElementById('rotationTileNumbersInput');
            const resultSpan = document.getElementById('tileRotationResult');
            const tileNumbersStr = numbersInput.value.trim();
            if (!tileNumbersStr) {
                resultSpan.textContent = 'Please enter tile numbers.';
                return;
            }
            // Parse tile numbers
            const tileNumbers = tileNumbersStr.split(',').map(s => parseInt(s.trim(), 10));
            if (tileNumbers.some(isNaN) || tileNumbers.length !== 4) {
                resultSpan.textContent = 'Invalid tile numbers.';
                return;
            }
            if (!window.globalSolutions || !window.globalSolutions[0] || !window.globalSolutions[1] || !window.globalSolutions[0].grid || !window.globalSolutions[1].grid) {
                resultSpan.textContent = 'Both solutions must be available.';
                return;
            }
            
            // Helper to find a tile and its rotation relative to its base form in tilesData
            function findTileInSolution(solution, originalTileNumbers) {
                for (let r = 0; r < solution.grid.length; r++) {
                    for (let c = 0; c < solution.grid[r].length; c++) {
                        const tileInGrid = solution.grid[r][c];
                        if (!tileInGrid) continue;
                        
                        let tempTile = [...originalTileNumbers];
                        for(let rot = 0; rot < 4; rot++) {
                            if (arraysEqual(tempTile, tileInGrid)) {
                                 // Found a match. Now find the other rotations.
                                 let rots = getAllRotations(originalTileNumbers);
                                 for (let i = 0; i < rots.length; i++) {
                                     if (arraysEqual(rots[i], tileInGrid)) {
                                         return { pos: [r,c], rotation: i };
                                     }
                                 }
                            }
                            tempTile = rotate(tempTile);
                        }
                    }
                }
                 // A more robust search if direct search fails
                const allRots = getAllRotations(originalTileNumbers);
                for(let r=0; r<solution.grid.length; r++){
                    for(let c=0; c<solution.grid[r].length; c++){
                        const gridTile = solution.grid[r][c];
                        if(!gridTile) continue;
                        for(let rot=0; rot<allRots.length; rot++){
                            if(arraysEqual(allRots[rot], gridTile)){
                                return { pos: [r,c], rotation: rot };
                            }
                        }
                    }
                }

                return null;
            }
            
            const found1 = findTileInSolution(window.globalSolutions[0], tileNumbers);
            const found2 = findTileInSolution(window.globalSolutions[1], tileNumbers);

            if (!found1) {
                resultSpan.textContent = 'Tile not found in solution 1.';
                return;
            }
            if (!found2) {
                resultSpan.textContent = 'Tile not found in solution 2.';
                return;
            }
            // Calculate rotation difference (number of 90-degree clockwise turns)
            let delta = (found2.rotation - found1.rotation + 4) % 4;

            if (delta === 0) {
                resultSpan.textContent = `Tile [${tileNumbers.join(',')}] is at [${found1.pos[0]},${found1.pos[1]}] in Solution 1 and at [${found2.pos[0]},${found2.pos[1]}] in Solution 2 with no rotation difference.`;
            } else if (delta === 2) {
                resultSpan.textContent = `Tile [${tileNumbers.join(',')}] is at [${found1.pos[0]},${found1.pos[1]}] in Solution 1 and at [${found2.pos[0]},${found2.pos[1]}] in Solution 2 rotated 180°.`;
            } else if (delta === 3) { // 3 clockwise rotations = 1 anticlockwise
                resultSpan.textContent = `Tile [${tileNumbers.join(',')}] is at [${found1.pos[0]},${found1.pos[1]}] in Solution 1 and at [${found2.pos[0]},${found2.pos[1]}] in Solution 2 rotated 90° anticlockwise.`;
            } else if (delta === 1) { // 1 clockwise rotation
                resultSpan.textContent = `Tile [${tileNumbers.join(',')}] is at [${found1.pos[0]},${found1.pos[1]}] in Solution 1 and at [${found2.pos[0]},${found2.pos[1]}] in Solution 2 rotated 90° clockwise.`;
            }
        });
    }
});

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
    // [top, right, bottom, left] -> [right, bottom, left, top] (90-deg clockwise)
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

// Global variable to store solutions
let globalSolutions = [];

const getSolutions = (data) => {
    let size = [10, 10]
    let solutions = []
    let grid = [...Array(size[0])].map((item) => Array(size[1]).fill(null))
    
    const dfs = (x, y, grid, data) => {
        if (data.length==0) {
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
    
    // Store solutions globally
    globalSolutions = solutions;
    
    // Map images across all solutions with rotation
    mapImagesAcrossSolutions();
    
    // Display solutions visually
    displaySolutions(solutions);
    
    if (solutions.length > 0) {
        const counts = countNumbersInSolution(solutions[0]);
        console.log(counts);
    }
}

const displaySolutions = (solutions) => {
    const tilesDisplay = document.getElementById('tilesDisplay');
    const resultDiv = document.getElementById('result');
    
    if (solutions.length === 0) {
        resultDiv.textContent = 'No solutions found.';
        tilesDisplay.innerHTML = '';
        return;
    }
    
    resultDiv.textContent = `Found ${solutions.length} solution(s).`;
    
    const container = document.createElement('div');
    container.style.marginTop = '20px';
    
    const title = document.createElement('h3');
    title.textContent = 'Solutions:';
    title.style.marginBottom = '15px';
    container.appendChild(title);
    
    // Create navigation controls
    const navContainer = document.createElement('div');
    navContainer.style.display = 'flex';
    navContainer.style.justifyContent = 'center';
    navContainer.style.alignItems = 'center';
    navContainer.style.gap = '15px';
    navContainer.style.marginBottom = '20px';
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.style.padding = '8px 16px';
    prevBtn.style.background = '#4f8cff';
    prevBtn.style.color = 'white';
    prevBtn.style.border = 'none';
    prevBtn.style.borderRadius = '4px';
    prevBtn.style.cursor = 'pointer';
    
    const solutionLabel = document.createElement('span');
    solutionLabel.style.fontWeight = 'bold';
    solutionLabel.style.fontSize = '16px';
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.style.padding = '8px 16px';
    nextBtn.style.background = '#4f8cff';
    nextBtn.style.color = 'white';
    nextBtn.style.border = 'none';
    nextBtn.style.borderRadius = '4px';
    nextBtn.style.cursor = 'pointer';
    
    const blankGridBtn = document.createElement('button');
    blankGridBtn.textContent = 'Blank Grid';
    blankGridBtn.style.padding = '8px 16px';
    blankGridBtn.style.background = '#6c757d';
    blankGridBtn.style.color = 'white';
    blankGridBtn.style.border = 'none';
    blankGridBtn.style.borderRadius = '4px';
    blankGridBtn.style.cursor = 'pointer';
    blankGridBtn.style.marginLeft = '20px';
    
    navContainer.appendChild(prevBtn);
    navContainer.appendChild(solutionLabel);
    navContainer.appendChild(nextBtn);
    navContainer.appendChild(blankGridBtn);
    container.appendChild(navContainer);
    
    // Create solution grid container
    const solutionGridContainer = document.createElement('div');
    solutionGridContainer.style.display = 'flex';
    solutionGridContainer.style.justifyContent = 'center';
    solutionGridContainer.style.gap = '40px';
    solutionGridContainer.style.alignItems = 'flex-start';
    solutionGridContainer.style.overflow = 'auto';
    solutionGridContainer.style.maxWidth = '100vw';
    container.appendChild(solutionGridContainer);
    
    let currentSolutionIndex = 0;
    
    const displaySolution = (index) => {
        const solution = solutions[index];
        const grid = solution.grid;
        
        solutionLabel.textContent = `Solution ${index + 1} of ${solutions.length}`;
        
        // Update button states
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === solutions.length - 1;
        prevBtn.style.background = index === 0 ? '#ccc' : '#4f8cff';
        nextBtn.style.background = index === solutions.length - 1 ? '#ccc' : '#4f8cff';
        
        // Clear previous solution
        solutionGridContainer.innerHTML = '';
        
        // Create solution grid
        const solutionGrid = document.createElement('div');
        solutionGrid.className = 'tiles-grid';
        
        // Add solution title
        const solutionTitle = document.createElement('h4');
        solutionTitle.textContent = 'Solution Grid:';
        solutionTitle.style.marginBottom = '15px';
        solutionTitle.style.color = '#495057';
        solutionTitle.style.fontSize = '18px';
        solutionTitle.style.textAlign = 'center';
        
        const solutionSection = document.createElement('div');
        solutionSection.appendChild(solutionTitle);
        solutionSection.appendChild(solutionGrid);
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const tile = grid[row][col];
                if (tile) {
                    const tileElement = createCompositeTileElement(grid, row, col, false, index);
                    solutionGrid.appendChild(tileElement);
                } else {
                    const emptyCell = document.createElement('div');
                    emptyCell.style.width = '100px';
                    emptyCell.style.height = '100px';
                    emptyCell.style.background = '#ddd';
                    solutionGrid.appendChild(emptyCell);
                }
            }
        }
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download This Solution';
        downloadBtn.className = 'download-solution-btn';
        downloadBtn.style.marginBottom = '10px';
        downloadBtn.style.background = '#4CAF50';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '6px';
        downloadBtn.style.padding = '10px 24px';
        downloadBtn.style.fontSize = '1em';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.addEventListener('click', () => {
            const jsonString = JSON.stringify(solution, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `solution-${index + 1}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        solutionSection.insertBefore(downloadBtn, solutionSection.firstChild);
        
        const downloadPngBtn = document.createElement('button');
        downloadPngBtn.textContent = 'Download as PNG';
        downloadPngBtn.className = 'download-solution-btn';
        downloadPngBtn.style.marginBottom = '10px';
        downloadPngBtn.style.marginLeft = '10px';
        downloadPngBtn.style.background = '#2563eb';
        downloadPngBtn.style.color = 'white';
        downloadPngBtn.style.border = 'none';
        downloadPngBtn.style.borderRadius = '6px';
        downloadPngBtn.style.padding = '10px 24px';
        downloadPngBtn.style.fontSize = '1em';
        downloadPngBtn.style.cursor = 'pointer';
        downloadPngBtn.addEventListener('click', async () => {
            const tileSize = 100;
            const rows = 10, cols = 10;
            const canvas = document.createElement('canvas');
            canvas.width = cols * tileSize;
            canvas.height = rows * tileSize;
            const ctx = canvas.getContext('2d');
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const tile = grid[row][col];
                    if (tile) {
                        const mapping = solutionImageMappings[index] ? solutionImageMappings[index][`${row},${col}`] : null;
                        let sourcePos = [row, col];
                        let rotationDelta = 0;
                        if(index > 0 && mapping) {
                            sourcePos = mapping.sourcePos;
                            rotationDelta = mapping.rotationDelta || 0;
                        }

                        // Create a clipping region for the composite shape
                        ctx.save();
                        ctx.beginPath();
                        drawCompositePath(ctx, grid, row, col, tileSize);
                        ctx.clip();
                        
                        // Draw the rotated image inside the clipped region
                        const angle = rotationDelta * Math.PI / 2;
                        const destX = col * tileSize;
                        const destY = row * tileSize;

                        ctx.translate(destX + tileSize / 2, destY + tileSize / 2);
                        ctx.rotate(angle);
                        
                        // We need to figure out where the source image should be drawn from.
                        // Since we are rotated around the center of the destination tile,
                        // we need to draw the source image relative to that center.
                        ctx.drawImage(
                            window.puzzleImage,
                            sourcePos[1] * tileSize, sourcePos[0] * tileSize, tileSize, tileSize,
                            -tileSize / 2, -tileSize / 2, tileSize, tileSize
                        );
                        
                        ctx.restore();
                    }
                }
            }
            const link = document.createElement('a');
            link.download = `solution-${index + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        solutionSection.insertBefore(downloadPngBtn, solutionSection.firstChild);
        
        solutionGridContainer.appendChild(solutionSection);
    };
    
    prevBtn.addEventListener('click', () => {
        if (currentSolutionIndex > 0) {
            currentSolutionIndex--;
            displaySolution(currentSolutionIndex);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentSolutionIndex < solutions.length - 1) {
            currentSolutionIndex++;
            displaySolution(currentSolutionIndex);
        }
    });
    
    blankGridBtn.addEventListener('click', () => {
        displayBlankGrid();
    });
    
    displaySolution(0);
    
    tilesDisplay.innerHTML = '';
    tilesDisplay.appendChild(container);
};


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


// This new function creates the composite visual shape based on neighbors.
function createCompositeTileElement(grid, row, col, highlight = false, solutionIndex = 0) {
    const size = 100;
    const tile = grid[row][col];
    if (!tile) return document.createElement('div'); // Should not happen

    // The container div for the composite tile
    const tileDiv = document.createElement('div');
    tileDiv.className = 'tile';
    tileDiv.style.position = 'relative';
    tileDiv.style.width = size + 'px';
    tileDiv.style.height = size + 'px';
    tileDiv.dataset.tileIndex = `${row},${col}`;

    // --- Create the SVG for the composite shape ---
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.style.position = 'absolute';
    svg.style.overflow = 'visible';
    svg.style.zIndex = '1';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = getCompositePathData(grid, row, col, size);
    path.setAttribute('d', pathData);

    const fillId = `fill-${row}-${col}-${solutionIndex}`;
    path.setAttribute('fill', puzzleImage ? `url(#${fillId})` : (highlight ? '#4f8cff' : '#4ade80'));
    path.setAttribute('stroke', highlight ? '#2563eb' : '#333');
    path.setAttribute('stroke-width', '2');
    
    // --- Handle Image Fill and Rotation ---
    if (puzzleImage) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        
        pattern.setAttribute('id', fillId);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        pattern.setAttribute('width', '1000');
        pattern.setAttribute('height', '1000');

        const mappingInfo = solutionImageMappings[solutionIndex] ? solutionImageMappings[solutionIndex][`${row},${col}`] : null;
        let sourcePos = [row, col];
        let rotationAngle = 0;

        if (solutionIndex > 0 && mappingInfo) {
            sourcePos = mappingInfo.sourcePos;
            rotationAngle = (mappingInfo.rotationDelta || 0) * 90;
        }
        
        image.setAttribute('href', puzzleImage.src);
        image.setAttribute('width', '1000');
        image.setAttribute('height', '1000');
        
        const tx = -sourcePos[1] * size;
        const ty = -sourcePos[0] * size;
        const cx = sourcePos[1] * size + size / 2;
        const cy = sourcePos[0] * size + size / 2;
        
        pattern.setAttribute('patternTransform', `translate(${tx}, ${ty}) rotate(-${rotationAngle}, ${cx}, ${cy})`);
        
        pattern.appendChild(image);
        defs.appendChild(pattern);
        svg.appendChild(defs);
    }

    svg.appendChild(path);
    tileDiv.appendChild(svg);
    
    return tileDiv;
}

function getRadius(val, size) {
    const tabMin = size * 0.10;
    const tabMax = size * 0.25;
    const absVal = Math.abs(val);
    const clamped = Math.max(1, Math.min(absVal, 10));
    return tabMin + (tabMax - tabMin) * (clamped - 1) / 9;
}

// Generates a composite path for SVG
function getCompositePathData(grid, row, col, size) {
    const tile = grid[row][col];
    const center = size / 2;
    let path = `M0,0`;

    // TOP EDGE
    if (tile[0] > 0) { // My tab
        const r = getRadius(tile[0], size);
        path += ` L${center-r},0 A${r},${r} 0 0,1 ${center+r},0 L${size},0`;
    } else { // My notch (neighbor's tab) or flat
        const topNeighbor = (row > 0) ? grid[row-1][col] : null;
        if(topNeighbor && topNeighbor[2] > 0) {
            const r = getRadius(topNeighbor[2], size);
            path += ` L${center-r},0 A${r},${r} 0 0,0 ${center+r},0 L${size},0`;
        } else {
            path += ` L${size},0`;
        }
    }

    // RIGHT EDGE
    if (tile[1] > 0) { // My tab
        const r = getRadius(tile[1], size);
        path += ` L${size},${center-r} A${r},${r} 0 0,1 ${size},${center+r} L${size},${size}`;
    } else {
        const rightNeighbor = (col < 9) ? grid[row][col+1] : null;
        if(rightNeighbor && rightNeighbor[3] > 0) {
            const r = getRadius(rightNeighbor[3], size);
            path += ` L${size},${center-r} A${r},${r} 0 0,0 ${size},${center+r} L${size},${size}`;
        } else {
            path += ` L${size},${size}`;
        }
    }

    // BOTTOM EDGE
    if (tile[2] > 0) { // My tab
        const r = getRadius(tile[2], size);
        path += ` L${center+r},${size} A${r},${r} 0 0,1 ${center-r},${size} L0,${size}`;
    } else {
        const bottomNeighbor = (row < 9) ? grid[row+1][col] : null;
        if(bottomNeighbor && bottomNeighbor[0] > 0) {
            const r = getRadius(bottomNeighbor[0], size);
            path += ` L${center+r},${size} A${r},${r} 0 0,0 ${center-r},${size} L0,${size}`;
        } else {
            path += ` L0,${size}`;
        }
    }

    // LEFT EDGE
    if (tile[3] > 0) { // My tab
        const r = getRadius(tile[3], size);
        path += ` L0,${center+r} A${r},${r} 0 0,1 0,${center-r} L0,0`;
    } else {
        const leftNeighbor = (col > 0) ? grid[row][col-1] : null;
        if(leftNeighbor && leftNeighbor[1] > 0) {
            const r = getRadius(leftNeighbor[1], size);
            path += ` L0,${center+r} A${r},${r} 0 0,0 0,${center-r} L0,0`;
        } else {
            path += ` L0,0`;
        }
    }
    
    return path + 'Z';
}


// Draws the composite path on a 2D canvas context
function drawCompositePath(ctx, grid, row, col, size) {
    const tile = grid[row][col];
    const center = size / 2;
    const destX = col * size;
    const destY = row * size;

    ctx.moveTo(destX, destY);

    // TOP EDGE
    if (tile[0] > 0) { // My tab
        const r = getRadius(tile[0], size);
        ctx.lineTo(destX + center - r, destY);
        ctx.arc(destX + center, destY, r, Math.PI, 0, false);
        ctx.lineTo(destX + size, destY);
    } else {
        const topNeighbor = (row > 0) ? grid[row-1][col] : null;
        if(topNeighbor && topNeighbor[2] > 0) {
            const r = getRadius(topNeighbor[2], size);
            ctx.lineTo(destX + center - r, destY);
            ctx.arc(destX + center, destY, r, Math.PI, 0, true);
            ctx.lineTo(destX + size, destY);
        } else {
            ctx.lineTo(destX + size, destY);
        }
    }
    
    // RIGHT EDGE
    if (tile[1] > 0) { // My tab
        const r = getRadius(tile[1], size);
        ctx.lineTo(destX + size, destY + center - r);
        ctx.arc(destX + size, destY + center, r, -Math.PI/2, Math.PI/2, false);
        ctx.lineTo(destX + size, destY + size);
    } else {
        const rightNeighbor = (col < 9) ? grid[row][col+1] : null;
        if(rightNeighbor && rightNeighbor[3] > 0) {
            const r = getRadius(rightNeighbor[3], size);
            ctx.lineTo(destX + size, destY + center - r);
            ctx.arc(destX + size, destY + center, r, -Math.PI/2, Math.PI/2, true);
            ctx.lineTo(destX + size, destY + size);
        } else {
            ctx.lineTo(destX + size, destY + size);
        }
    }

    // BOTTOM EDGE
    if (tile[2] > 0) { // My tab
        const r = getRadius(tile[2], size);
        ctx.lineTo(destX + center + r, destY + size);
        ctx.arc(destX + center, destY + size, r, 0, Math.PI, false);
        ctx.lineTo(destX, destY + size);
    } else {
        const bottomNeighbor = (row < 9) ? grid[row+1][col] : null;
        if(bottomNeighbor && bottomNeighbor[0] > 0) {
            const r = getRadius(bottomNeighbor[0], size);
            ctx.lineTo(destX + center + r, destY + size);
            ctx.arc(destX + center, destY + size, r, 0, Math.PI, true);
            ctx.lineTo(destX, destY + size);
        } else {
            ctx.lineTo(destX, destY + size);
        }
    }

    // LEFT EDGE
    if (tile[3] > 0) { // My tab
        const r = getRadius(tile[3], size);
        ctx.lineTo(destX, destY + center + r);
        ctx.arc(destX, destY + center, r, Math.PI/2, -Math.PI/2, false);
        ctx.lineTo(destX, destY);
    } else {
        const leftNeighbor = (col > 0) ? grid[row][col-1] : null;
        if(leftNeighbor && leftNeighbor[1] > 0) {
            const r = getRadius(leftNeighbor[1], size);
            ctx.lineTo(destX, destY + center + r);
            ctx.arc(destX, destY + center, r, Math.PI/2, -Math.PI/2, true);
            ctx.lineTo(destX, destY);
        } else {
            ctx.lineTo(destX, destY);
        }
    }
    
    ctx.closePath();
}

let tilesData = [
    [0, -1, 5, 0], [0, 2, 7, 1], [0, 6, 2, -2], [0, -9, -8, -6], [0, 5, 8, 9], [0, 5, -6, -5], [0, -5, -1, -5], [0, -7, 9, 5], [0, 9, -8, 7], [0, 0, -3, -9],
    [-5, 8, 10, 0], [-7, 3, 2, -8], [-2, 8, -6, -3], [8, 10, 5, -8], [-8, -3, -3, -10], [6, -5, -9, 3], [1, 8, -7, 5], [-9, 8, 2, -8], [8, 1, 8, -8], [3, 0, 6, -1],
    [-10, 9, 7, 0], [-2, 3, 2, -9], [6, 4, 7, -3], [-5, -4, 4, -4], [3, 2, 2, 4], [9, -2, -2, -2], [7, 6, 4, 2], [-2, 6, -9, -6], [-8, 6, 8, -6], [-6, 0, 6, -6],
    [-7, -5, -4, 0], [-2, -4, 5, 5], [-7, -1, -6, 4], [-4, 1, 9, 1], [-2, -2, 5, -1], [2, 7, -6, 2], [-4, -10, 2, -7], [9, -8, -1, 10], [-8, 9, -7, 8], [-6, 0, -3, -9],
    [4, -8, 10, 0], [-5, 1, -10, 8], [6, 1, -1, -1], [-9, -3, 7, -1], [-5, 7, 7, 3], [6, 10, -9, -7], [-2, -9, 7, -10], [1, 5, 4, 9], [7, -5, 2, -5], [3, 0, 4, 5],
    [-10, -6, 9, 0], [10, 4, -10, 6], [1, -10, 2, -4], [-7, 8, -9, 10], [-7, 1, 1, -8], [9, -8, -9, -1], [-7, -8, -9, 8], [-4, -5, -5, 8], [-2, 8, 6, 5], [-4, 0, -2, -8],
    [-9, 4, 1, 0], [10, 6, -5, -4], [-2, -4, 6, -6], [9, -1, -8, 4], [-1, -2, -6, 1], [9, -1, -10, 2], [9, -7, -5, 1], [5, 9, 8, 7], [-6, -5, -4, -9], [2, 0, -9, 5],
    [-1, 8, 7, 0], [5, -2, -6, -8], [-6, -9, -7, 2], [8, -4, -9, 9], [6, 2, 3, 4], [10, 5, 10, -2], [5, -2, -1, -5], [-8, -7, -8, 2], [4, 1, -5, 7], [9, 0, -3, -1],
    [-7, 5, 5, 0], [6, 2, -6, -5], [7, -1, 10, -2], [9, -10, 6, 1], [-3, -4, -9, 10], [-10, 4, 6, 4], [1, 2, -1, -4], [8, -6, 5, -2], [5, -3, 8, 6], [3, 0, -10, 3],
    [-5, -2, 0, 0], [6, 6, 0, 2], [-10, 6, 0, -6], [-6, 10, 0, -6], [9, 10, 0, -10], [-6, -8, 0, -10], [1, 7, 0, 8], [-5, -5, 0, -7], [-8, 1, 0, 5], [10, 0, 0, -1]    
]  
getSolutions(tilesData);

function arraysEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function getAllRotations(tile) {
    let rots = [];
    let t = tile.slice();
    for (let i = 0; i < 4; i++) {
        rots.push(t.slice());
        t = rotate(t);
    }
    return rots;
}

function identifyPiece(tileInGrid, originalPiecesData) {
    for (let i = 0; i < originalPiecesData.length; i++) {
        const allRots = getAllRotations(originalPiecesData[i]);
        for (let rot = 0; rot < allRots.length; rot++) {
            if (arraysEqual(allRots[rot], tileInGrid)) {
                return { originalIndex: i, rotation: rot };
            }
        }
    }
    return null;
}

function mapImagesAcrossSolutions() {
    if (!globalSolutions || globalSolutions.length < 1) return;

    const solution1Grid = globalSolutions[0].grid;
    const solution1PieceLocations = {}; 
    for (let r1 = 0; r1 < 10; r1++) {
        for (let c1 = 0; c1 < 10; c1++) {
            const tile1 = solution1Grid[r1][c1];
            if (tile1) {
                const identity = identifyPiece(tile1, tilesData);
                if (identity) {
                    solution1PieceLocations[identity.originalIndex] = {
                        pos: [r1, c1],
                        rotation: identity.rotation
                    };
                }
            }
        }
    }
    
    solutionImageMappings = { 0: {} };

    for (let solIdx = 1; solIdx < globalSolutions.length; solIdx++) {
        solutionImageMappings[solIdx] = {};
        const currentGrid = globalSolutions[solIdx].grid;
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const currentTile = currentGrid[row][col];
                if (!currentTile) continue;

                const identityCurrent = identifyPiece(currentTile, tilesData);
                if (identityCurrent) {
                    const originalIndex = identityCurrent.originalIndex;
                    const rotationCurrent = identityCurrent.rotation;
                    const locationInSol1 = solution1PieceLocations[originalIndex];

                    if (locationInSol1) {
                        const rotationDelta = (rotationCurrent - locationInSol1.rotation + 4) % 4;
                        solutionImageMappings[solIdx][`${row},${col}`] = {
                            sourcePos: locationInSol1.pos,
                            rotationDelta: rotationDelta
                        };
                    }
                }
            }
        }
    }
}