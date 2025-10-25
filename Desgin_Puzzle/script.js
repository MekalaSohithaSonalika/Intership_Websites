document.addEventListener('DOMContentLoaded', function() {
    const symbols = ['+', '−', '×', '÷'];
    const squarePatterns = [
        ['+', '×', '÷', '−'], ['+', '×', '÷', '−'], ['+', '×', '−', '÷'],
        ['+', '−', '÷', '×'], ['+', '÷', '−', '×'], ['+', '×', '−', '÷'],
        ['+', '−', '÷', '×'], ['+', '÷', '−', '×'], ['+', '×', '÷', '−']
    ];
    const piecesContainer = document.getElementById('pieces-container');
    const gridCells = document.querySelectorAll('.cell');
    const SNAP_THRESHOLD = 30;
    const CELL_SIZE = 100;
    let draggedPiece = null;
    let selectedPiece = null;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let wasInGrid = false;
    let lastTap = 0;
    const DOUBLE_TAP_DELAY = 300;

    for (let i = 0; i < 9; i++) {
        const piece = createPuzzlePiece(i, squarePatterns[i]);
        piecesContainer.appendChild(piece);
        initializePiecePosition(piece);
    }

    function createPuzzlePiece(index, pattern) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.setAttribute('draggable', 'true');
        piece.setAttribute('data-rotation', '0');
        piece.id = `piece-${index}`;
        
        const symbolContainer = document.createElement('div');
        symbolContainer.className = 'symbol-container';
        
        const edges = ['top', 'right', 'bottom', 'left'];
        edges.forEach((edge, idx) => {
            const circle = document.createElement('div');
            circle.className = `symbol-circle ${edge}-circle`;
            
            const symbol = document.createElement('div');
            symbol.className = `symbol ${edge}`;
            symbol.textContent = pattern[idx];
            
            if (pattern[idx] === '−') {
                symbol.classList.add(edge === 'top' || edge === 'bottom' ? 'minus-horizontal' : 'minus-vertical');
            } else if (pattern[idx] === '÷') {
                symbol.classList.add(edge === 'top' || edge === 'bottom' ? 'division-horizontal' : 'division-vertical');
            }
            
            circle.appendChild(symbol);
            symbolContainer.appendChild(circle);
        });
        
        piece.appendChild(symbolContainer);
        piece.addEventListener('touchstart', handleTouchStart, { passive: false });
        piece.addEventListener('click', handlePieceClick);
        piece.addEventListener('dblclick', handleDoubleClick);
        piece.addEventListener('mousedown', startDrag);
        
        return piece;
    }

    function handleTouchStart(e) {
        const now = Date.now();
        const piece = e.target.closest('.puzzle-piece');
        if (now - lastTap < DOUBLE_TAP_DELAY) {
            e.preventDefault();
            rotateClockwise(piece);
            lastTap = 0;
        } else {
            lastTap = now;
        }
    }

    function initializePiecePosition(piece) {
        piece.style.position = 'absolute';
        piece.style.width = '100px';
        piece.style.height = '100px';
        moveToRandomPosition(piece);
    }

    function moveToRandomPosition(element) {
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 150;
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        element.style.left = `${randomX}px`;
        element.style.top = `${randomY}px`;
    }

    function initDragAndDrop() {
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'r' && selectedPiece) {
                rotateClockwise(selectedPiece);
            }
        });
    }

    function handlePieceClick(e) {
        // Prevent selection during drag
        if (isDragging) return;
        
        const piece = e.target.closest('.puzzle-piece');
        if (piece) {
            selectPiece(piece);
            e.stopPropagation();
            // Bring to front if not in grid
            if (!piece.parentNode.classList.contains('cell')) {
                piece.style.zIndex = '10';
                document.querySelectorAll('.puzzle-piece').forEach(p => {
                    if (p !== piece) p.style.zIndex = '1';
                });
            }
        }
    }

    function handleDoubleClick(e) {
        const piece = e.target.closest('.puzzle-piece');
        if (piece) {
            rotateClockwise(piece);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    function selectPiece(piece) {
        if (!piece) return;
        
        // Deselect previous piece
        if (selectedPiece && selectedPiece !== piece) {
            selectedPiece.classList.remove('selected');
            if (!selectedPiece.parentNode.classList.contains('cell')) {
                selectedPiece.style.zIndex = '1';
            }
        }
        
        // Select new piece
        selectedPiece = piece;
        selectedPiece.classList.add('selected');
        if (!selectedPiece.parentNode.classList.contains('cell')) {
            selectedPiece.style.zIndex = '10';
        }
    }

    function rotateClockwise(piece) {
        if (!piece) piece = selectedPiece;
        if (!piece) return;
        
        let currentRotation = parseInt(piece.getAttribute('data-rotation')) || 0;
        currentRotation = (currentRotation + 90) % 360;
        piece.setAttribute('data-rotation', currentRotation);
        piece.style.transform = `rotate(${currentRotation}deg)`;
        
        // Keep the piece selected after rotation
        selectPiece(piece);
    }

    function startDrag(e) {
        if (e.button !== 0) return;
        
        draggedPiece = e.target.closest('.puzzle-piece');
        if (!draggedPiece) return;
        
        wasInGrid = draggedPiece.parentNode.classList.contains('cell');
        const rect = draggedPiece.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        if (wasInGrid) {
            convertToAbsolutePosition(draggedPiece, e.clientX, e.clientY);
        }
        
        // Select the piece when starting to drag
        selectPiece(draggedPiece);
        
        draggedPiece.style.zIndex = '1000';
        draggedPiece.style.cursor = 'grabbing';
        isDragging = true;
        e.preventDefault();
    }

    function convertToAbsolutePosition(piece, clientX, clientY) {
        piece.parentNode.removeChild(piece);
        document.body.appendChild(piece);
        piece.style.position = 'absolute';
        piece.style.width = '100px';
        piece.style.height = '100px';
        piece.style.left = `${clientX - offsetX}px`;
        piece.style.top = `${clientY - offsetY}px`;
        piece.style.margin = '0';
    }

    function drag(e) {
        if (!isDragging || !draggedPiece) return;
        
        draggedPiece.style.left = `${e.clientX - offsetX}px`;
        draggedPiece.style.top = `${e.clientY - offsetY}px`;
    }

    function endDrag(e) {
        if (!isDragging || !draggedPiece) return;
        
        const nearestCell = findNearestEmptyCell(draggedPiece);
        if (nearestCell) {
            snapToCell(draggedPiece, nearestCell);
        } else if (!piecesContainer.contains(draggedPiece)) {
            piecesContainer.appendChild(draggedPiece);
        }
        
        cleanupAfterDrag();
    }

    function findNearestEmptyCell(piece) {
        const pieceRect = piece.getBoundingClientRect();
        const pieceCenter = {
            x: pieceRect.left + pieceRect.width/2,
            y: pieceRect.top + pieceRect.height/2
        };
        
        let nearestCell = null;
        let minDistance = Infinity;
        
        gridCells.forEach(cell => {
            if (cell.children.length === 0) {
                const cellRect = cell.getBoundingClientRect();
                const cellCenter = {
                    x: cellRect.left + cellRect.width/2,
                    y: cellRect.top + cellRect.height/2
                };
                
                const dx = cellCenter.x - pieceCenter.x;
                const dy = cellCenter.y - pieceCenter.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < minDistance && distance < SNAP_THRESHOLD) {
                    minDistance = distance;
                    nearestCell = cell;
                }
            }
        });
        
        return nearestCell;
    }

    function snapToCell(piece, cell) {
        // Remove from current parent
        if (piece.parentNode) {
            piece.parentNode.removeChild(piece);
        }
        
        // Add to new cell
        cell.appendChild(piece);
        
        // Style for grid placement
        piece.style.position = 'relative';
        piece.style.left = '0';
        piece.style.top = '0';
        piece.style.width = '100%';
        piece.style.height = '100%';
        piece.style.margin = '0';
        piece.style.transform = `rotate(${piece.getAttribute('data-rotation') || 0}deg)`;
        
        // Keep it selected if it was selected
        if (selectedPiece === piece) {
            piece.classList.add('selected');
        }
        
        // Make sure the piece is still clickable in the grid
        piece.style.pointerEvents = 'auto';
    }

    function cleanupAfterDrag() {
        if (draggedPiece) {
            if (selectedPiece === draggedPiece) {
                draggedPiece.style.zIndex = '10';
            } else {
                draggedPiece.style.zIndex = '1';
            }
            draggedPiece.style.cursor = 'grab';
            draggedPiece = null;
        }
        
        isDragging = false;
        wasInGrid = false;
    }

    document.addEventListener('click', function(e) {
        if (isDragging) return;
        
        // Don't deselect if clicking on controls
        if (e.target.closest('#rotate-btn') || e.target.closest('.controls')) {
            return;
        }
        
        // Only deselect if clicking outside any puzzle piece
        if (!e.target.closest('.puzzle-piece') && selectedPiece) {
            selectedPiece.classList.remove('selected');
            if (!selectedPiece.parentNode.classList.contains('cell')) {
                selectedPiece.style.zIndex = '1';
            }
            selectedPiece = null;
        }
    });

    document.getElementById('rotate-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        if (selectedPiece) {
            rotateClockwise(selectedPiece);
        } else {
            showMessage('Please select a piece to rotate');
        }
    });

    document.getElementById('check-solution').addEventListener('click', checkSolution);

    function checkSolution() {
        const cells = document.querySelectorAll('.cell');
        let isSolved = true;
        
        if (Array.from(cells).some(cell => cell.children.length === 0)) {
            showMessage('Place all pieces on the grid first!');
            return;
        }
        
        // Check horizontal matches
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
                const currentCell = cells[row * 3 + col];
                const nextCell = cells[row * 3 + col + 1];
                if (!edgesMatch(currentCell, 'right', nextCell, 'left')) {
                    isSolved = false;
                }
            }
        }
        
        // Check vertical matches
        for (let col = 0; col < 3; col++) {
            for (let row = 0; row < 2; row++) {
                const currentCell = cells[row * 3 + col];
                const nextCell = cells[(row + 1) * 3 + col];
                if (!edgesMatch(currentCell, 'bottom', nextCell, 'top')) {
                    isSolved = false;
                }
            }
        }
        
        showMessage(isSolved ? 'Puzzle Solved!' : 'Not quite right. Keep trying!');
    }

    function edgesMatch(cell1, edge1, cell2, edge2) {
        const piece1 = cell1.children[0];
        const piece2 = cell2.children[0];
        const symbol1 = getSymbolAfterRotation(piece1, edge1);
        const symbol2 = getSymbolAfterRotation(piece2, edge2);
        return symbol1 === symbol2;
    }

    function getSymbolAfterRotation(piece, originalEdge) {
        const rotation = parseInt(piece.getAttribute('data-rotation')) || 0;
        const edges = ['top', 'right', 'bottom', 'left'];
        const originalIndex = edges.indexOf(originalEdge);
        const rotationSteps = rotation / 90;
        const newIndex = (originalIndex - rotationSteps + 4) % 4;
        const symbolElement = piece.querySelector(`.${edges[newIndex]}-circle .symbol`);
        return symbolElement.textContent;
    }

    function showMessage(text) {
        const resultElement = document.getElementById('result');
        resultElement.textContent = text;
        if (text) {
            setTimeout(() => {
                resultElement.textContent = '';
            }, 2000);
        }
    }

    initDragAndDrop();
});
