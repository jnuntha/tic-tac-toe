document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const statusDisplay = document.getElementById('status');
    const resetBtn = document.getElementById('resetBtn');
    const playerSelect = document.getElementById('playerSelect');
    
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let currentTurn = 'X';  // Always 'X' starts first
    let gameActive = true;
    let playerSymbol = 'X';
    let aiSymbol = 'O';
    
    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    
    const isAiTurn = () => currentTurn === aiSymbol;
    const isPlayerTurn = () => currentTurn === playerSymbol;
    
    // AI Move Logic
    const getBestMove = () => {
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === '') {
                gameState[i] = aiSymbol;
                if (checkWin(aiSymbol)) {
                    gameState[i] = '';
                    return i;
                }
                gameState[i] = '';
            }
        }
        
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === '') {
                gameState[i] = playerSymbol;
                if (checkWin(playerSymbol)) {
                    gameState[i] = '';
                    return i;
                }
                gameState[i] = '';
            }
        }
        
        if (gameState[4] === '') return 4;
        
        const corners = [0, 2, 6, 8].filter(i => gameState[i] === '');
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        const sides = [1, 3, 5, 7].filter(i => gameState[i] === '');
        if (sides.length > 0) {
            return sides[Math.floor(Math.random() * sides.length)];
        }
        
        const available = gameState.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : -1;
    };
    
    const checkWin = (symbol) => {
        return winningConditions.some(condition => {
            return condition.every(index => gameState[index] === symbol);
        });
    };
    
    const nextTurn = () => {
        if (!gameActive) return;
        
        currentTurn = currentTurn === 'X' ? 'O' : 'X';
        
        if (isPlayerTurn()) {
            statusDisplay.textContent = `Your turn (${playerSymbol})`;
        } else {
            statusDisplay.textContent = `AI is thinking...`;
            setTimeout(() => {
                if (!gameActive) return;
                const aiMove = getBestMove();
                if (aiMove !== -1) {
                    const cell = board.children[aiMove];
                    gameState[aiMove] = aiSymbol;
                    cell.textContent = aiSymbol;
                    cell.classList.add(aiSymbol.toLowerCase());
                    checkGameStatus();
                }
            }, 500);
        }
    };
    
    const checkGameStatus = () => {
        let roundWon = false;
        let winningCombination = null;
        
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = gameState[winCondition[0]];
            const b = gameState[winCondition[1]];
            const c = gameState[winCondition[2]];
            
            if (a === '' || b === '' || c === '') continue;
            if (a === b && b === c) {
                roundWon = true;
                winningCombination = winCondition;
                break;
            }
        }
        
        if (roundWon) {
            statusDisplay.textContent = `Player ${currentTurn} wins!`;
            gameActive = false;
            winningCombination.forEach(index => {
                board.children[index].classList.add('winning');
            });
            disableAllCells();
            return;
        }
        
        if (!gameState.includes('')) {
            statusDisplay.textContent = 'Game ended in a draw!';
            gameActive = false;
            return;
        }
    };
    
    const disableAllCells = () => {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.add('disabled');
            cell.removeEventListener('click', handleCellClick);
        });
    };
    
    const handleCellClick = (clickedCellEvent) => {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[clickedCellIndex] !== '' || !gameActive || !isPlayerTurn()) {
            return;
        }
        
        gameState[clickedCellIndex] = playerSymbol;
        clickedCell.textContent = playerSymbol;
        clickedCell.classList.add(playerSymbol.toLowerCase());
        checkGameStatus();
        nextTurn();
    };
    
    const handleResetGame = () => {
        gameState = ['', '', '', '', '', '', '', '', ''];
        currentTurn = 'X';
        gameActive = true;
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning', 'disabled');
            cell.addEventListener('click', handleCellClick);
        });
        
        statusDisplay.textContent = isPlayerTurn() ? `Your turn (${playerSymbol})` : `AI is thinking...`;
        
        // If AI starts first (when player selected O)
        if (isAiTurn()) {
            setTimeout(() => {
                if (!gameActive) return;
                const aiMove = getBestMove();
                if (aiMove !== -1) {
                    const cell = board.children[aiMove];
                    gameState[aiMove] = aiSymbol;
                    cell.textContent = aiSymbol;
                    cell.classList.add(aiSymbol.toLowerCase());
                    checkGameStatus();
                    nextTurn();
                }
            }, 500);
        }
    };
    
    const handlePlayerChange = () => {
        playerSymbol = playerSelect.value;
        aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
        handleResetGame();
    };
    
    // Initialize the board
    const initializeBoard = () => {
        board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    };
    
    resetBtn.addEventListener('click', handleResetGame);
    if (playerSelect) {
        playerSelect.addEventListener('change', handlePlayerChange);
    }
    
    initializeBoard();
});
