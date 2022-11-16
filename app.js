// generate the board.
// BLOCK statuses
const BLOCK_STATUSES = {
    HIDDEN: 'hidden',
    MINE: 'mine',
    NUMBER: 'number',
    MARKED: 'marked',
}

// generate board
function createBoard(boardSize, numberOfMines) {

    const board = [];
    const minePos = getMinesPos(boardSize, numberOfMines)

    for (let xDirection = 0; xDirection < boardSize; xDirection++) {
        const row = []
        for (let yDirection = 0; yDirection < boardSize; yDirection++) {
            // create the blocks
            const divElements = document.createElement('div');
            divElements.dataset.status = BLOCK_STATUSES.HIDDEN

            const block = {
                divElements,
                xDirection,
                yDirection,

                // CHECK TO SEE IF positions to our mines pos if one of them matchex our xdir or ydir, return true
                mine: minePos.some(positionMatch.bind(null, { xDirection, yDirection })),
                get status() {
                    return divElements.dataset.status
                },
                set status(value) {
                    this.divElements.dataset.status = value
                }
            }
            row.push(block)
        }
        board.push(row)
    }
    return board;

}

// Decide BOARD_SIZE and NUMBER_OF_MINES

let BOARD_SIZE = 10;
let NUMBER_OF_MINES = 10;




// Variable for function passing in the BOARD_SIZE and NUMBER_OF_MINES
const appendBoard = createBoard(BOARD_SIZE, NUMBER_OF_MINES);
const boardDiv = document.querySelector('.board');
const minesLeftCount = document.querySelector('[data-mine-count]');
const anounceText = document.querySelector('.minesLeft');



appendBoard.forEach(row => {
    row.forEach(block => {
        boardDiv.append(block.divElements)
        block.divElements.addEventListener('click', () => {
            revealBlock(appendBoard, block);
            checkGameEnd();
        })
        // prevent rightclick menu pop-up
        block.divElements.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            markBlock(block);
            listMinesLeft();

        })
    })
});
boardDiv.style.setProperty('--size', BOARD_SIZE);
minesLeftCount.textContent = NUMBER_OF_MINES;


function getMinesPos(boardSize, numberOfMines) {
    const positions = []

    // while loop so we dont keep looping and position mines on top of each other
    while (positions.length < numberOfMines) {
        const position = {
            xDirection: randomNumber(boardSize),
            yDirection: randomNumber(boardSize)
        }

        if (!positions.some(positionMatch.bind(null, position))) {
            positions.push(position)
        }

    }
    return positions;


}

// check if booth is true then same exact position
function positionMatch(a, b) {
    return a.xDirection === b.xDirection && a.yDirection === b.yDirection
}

// randomize number to generate mines position
function randomNumber(size) {
    return Math.floor(Math.random() * size)
}

// check to see if a block is marked or hidden
function markBlock(block) {
    if (block.status !== BLOCK_STATUSES.HIDDEN && block.status !== BLOCK_STATUSES.MARKED) {
        return;
    }
    if (block.status === BLOCK_STATUSES.MARKED) {
        block.status = BLOCK_STATUSES.HIDDEN
    } else {
        block.status = BLOCK_STATUSES.MARKED
    }
}

// check to see how many mines are left and display it.
function listMinesLeft() {
    const markedBlocksCount = appendBoard.reduce((count, row) => {
        return count + row.filter(block => block.status === BLOCK_STATUSES.MARKED).length;
    }, 0)

    minesLeftCount.textContent = NUMBER_OF_MINES - markedBlocksCount;
}


// Function to reveal blocks
function revealBlock(appendBoard, block) {
    if (block.status !== BLOCK_STATUSES.HIDDEN) {
        return;
    }

    if (block.mine) {
        block.status = BLOCK_STATUSES.MINE
        return
    }
    block.status = BLOCK_STATUSES.NUMBER;
    const adjacentBlocks = nearbyBlocks(appendBoard, block)
    const mines = adjacentBlocks.filter(t => t.mine)
    if (mines.length === 0) {
        adjacentBlocks.forEach(revealBlock.bind(null, appendBoard))
    } else {
        block.divElements.textContent = mines.length;
    }

}

// Display nearby blocks
function nearbyBlocks(appendBoard, { xDirection, yDirection }) {
    const blocks = []

    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            const block = appendBoard[xDirection + xOffset]?.[yDirection + yOffset]
            if (block) blocks.push(block);
        }

    }

    return blocks;
}


// Check if lose / win
function checkGameEnd() {
    const win = checkWin(appendBoard);
    const lose = checkLose(appendBoard);

    if (win || lose) {

        boardDiv.addEventListener('click', stopProp, { capture: true })
        boardDiv.addEventListener('contextmenu', stopProp, { capture: true })
    }
    if (win) {
        anounceText.textContent = 'You Win! ⭐🏆⭐';

        playAgain(anounceText);

    }
    if (lose) {

        anounceText.textContent = 'You Lose! 😥'
        playAgain(anounceText);

        appendBoard.forEach(row => {
            row.forEach(block => {
                if (block.status === BLOCK_STATUSES.MARKED) markBlock(block);
                if (block.mine) revealBlock(appendBoard, block);

            })
        })
    }
}




function stopProp(e) {
    e.stopPropagation();

}

function checkWin(appendBoard) {

    return appendBoard.every(row => {
        return row.every(block => {
            return block.status === BLOCK_STATUSES.NUMBER ||
                (block.mine &&
                    (block.status === BLOCK_STATUSES.HIDDEN ||
                        block.status === BLOCK_STATUSES.MARKED
                    ))

        })
    })
}


function checkLose(appendBoard) {
    return appendBoard.some(row => {
        return row.some(block => {
            return block.status === BLOCK_STATUSES.MINE
        })
    })
}


function playAgain(anounceText) {

    const PLAY_AGAIN = document.createElement('button');
    PLAY_AGAIN.textContent = 'Play Again ';

    PLAY_AGAIN.addEventListener('click', () => {
        location.reload();
    });
    anounceText.append(PLAY_AGAIN);
}





