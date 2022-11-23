'use strict'

var gBoard
var gLevel
var gInterval

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function chooseLevel(level) {
    if (level === 'easy') {
        gLevel = {
            SIZE: 4,
            MINES: 2
        }
    }
    if (level === 'medium') {
        gLevel = {
            SIZE: 8,
            MINES: 14
        }
    }
    if (level === 'expert') {
        gLevel = {
            SIZE: 12,
            MINES: 32
        }
    }

    initGame()
}

function initGame() {
    if (gInterval) clearInterval(gInterval)
    resetTime()
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0

    gBoard = buildBoard()
    renderBoard(gBoard)
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i][j] = cell
        }
    }
    return board
}

function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr class="board-row" >\n`
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]

            var className = ''
            if (cell.isShown) className = 'shown'
            if (cell.isMine) className = 'mine'
            if (cell.isMarked) className = 'mark'

            strHTML += `\t<td class="cell ${className}" id="cell-${i}-${j}" onclick="cellClicked(this, ${i}, ${j})" ></td>\n`
        }
        strHTML += `</tr>\n`
        const elCells = document.querySelector('.board')
        elCells.innerHTML = strHTML
    }
}
function addMines() {
    var randCells = findRandomCells()
    for (var count = 0; count < gLevel.MINES; count++) {
        const indxI = randCells[0].i
        const indxJ = randCells[0].j
        gBoard[indxI][indxJ].isMine = true
        renderBoard()
        randCells.splice(0, 1)
    }
}

function setMinesNegsCount() {

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = MinesCount({ i: i, j: j })
            renderBoard()
        }
    }
}

function MinesCount(pos) {
    var count = 0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === pos.i && j === pos.j) continue
            if (gBoard[i][j].isMine === true) {
                count++
            }
        }
    }
    return count
}


function findRandomCells() {
    const RandomCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            const cell = gBoard[i][j]
            var emptyCell = { i: i, j: j }
            RandomCells.push(emptyCell)
        }
    }
    const shuffledRansomCells = RandomCells.sort(() => Math.random() - 0.5)
    return shuffledRansomCells
}

function cellClicked(elCell, row, col) {
    if (!gGame.isOn) {
        startTimer()
        gGame.isOn = true
        addMines()
        setMinesNegsCount(gBoard)
    }

    if (!gBoard[row][col].isMine) {
        gBoard[row][col].isShown = true
        elCell.innerText = `${gBoard[row][col].minesAroundCount}`

        if (gBoard[row][col].minesAroundCount === 0) {

            for (var i = row - 1; i <= row + 1; i++) {
                if (i < 0 || i >= gBoard.length) continue
                for (var j = col - 1; j <= col + 1; j++) {
                    if (j < 0 || j >= gBoard[i].length) continue
                    if (i === row && j === col) continue
                    if (gBoard[i][j].isMine) continue
                    gBoard[i][j].isShown = true
                    const elNegsCell = document.querySelector(`#cell-${i}-${j}`)
                    elNegsCell.innerText= `${gBoard[i][j].minesAroundCount}`
                }
            }
        }

    
}
if (gBoard[row][col].isMine) {
    gBoard[row][col].isShown = true
    // gLiveLeft--
    elCell.innerText = '💣'
}

  }

function startTimer() {
    var gStartTime = Date.now()
    gInterval = setInterval(() => {
        const seconds = (Date.now() - gStartTime) / 1000
        var elH2 = document.querySelector('.time')
        elH2.innerText = seconds.toFixed(0)
    }, 1);
}

function resetTime() {
    var elH2 = document.querySelector('.time')
    elH2.innerText = '0.000'
}

