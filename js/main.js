'use strict'
window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
}, false);

var gBoard
var gLevel
var gInterval
var gGetHintsOn = false
var megaIson

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 2,
}

function chooseLevel(level) {
    if (level === 'easy') {
        gLevel = {
            SIZE: 4,
            MINES: 2,
            LIVES: 2,

        }
    }
    if (level === 'medium') {
        gLevel = {
            SIZE: 8,
            MINES: 14,
            LIVES: 3,

        }
    }
    if (level === 'expert') {
        gLevel = {
            SIZE: 12,
            MINES: 32,
            LIVES: 3,

        }
    }

    initGame()
}

function initGame() {
    var elsmiley = document.querySelector('.smiley')
    elsmiley.innerText = '😊'
    if (gInterval) clearInterval(gInterval)
    resetTime()
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    if (gLevel.SIZE > 4) gLevel.LIVES = 3
    else gLevel.LIVES = 2
    clearHintsButton()
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

            strHTML += `\t<td class="cell ${className}" id="cell-${i}-${j}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this,${i}, ${j})" ></td>\n`
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
            if (!cell.isShown) {
                var emptyCell = { i: i, j: j }
                RandomCells.push(emptyCell)
            }
        }
    }
    const shuffledRansomCells = RandomCells.sort(() => Math.random() - 0.5)
    return shuffledRansomCells
}

function cellClicked(elCell, row, col) {
    checkGameOver()

    if (!gGame.isOn) {
        startTimer()
        gGame.isOn = true
        addMines()
        setMinesNegsCount(gBoard)
        const elCell = document.querySelector(`#cell-${row}-${col}`)
        if (gBoard[row][col].minesAroundCount === 0) {
            checkNegsZeros(row, col)
        }
        else {
            elCell.innerText = `${gBoard[row][col].minesAroundCount} `
            elCell.classList.add('shown')
            gBoard[row][col].isShown = true
            gGame.shownCount++
        }
    }

    if (gGetHintsOn) {
        if (gBoard[row][col].isShown) return
        cellNegsHint(row, col)
        setTimeout(() => { cellNegsHintClear(row, col) }, 1000)
        gGetHintsOn = false
    }

    else {
        checkGameOver()

        if (gBoard[row][col].isMarked) return
        if (gBoard[row][col].isShown) return

        if (!gBoard[row][col].isMine) {
            gGame.shownCount++
            gBoard[row][col].isShown = true
            if (gBoard[row][col].minesAroundCount > 0) elCell.innerText = `${gBoard[row][col].minesAroundCount}`
            elCell.classList.add('shown')
            checkGameOver()


            if (gBoard[row][col].minesAroundCount === 0) {
                checkGameOver()
                checkNegsZeros(row, col)
            }

        }
        if (gBoard[row][col].isMine && gBoard[row][col].isShown) {
            return
        }

        if (gBoard[row][col].isMine) {
            gBoard[row][col].isShown = true
            elCell.innerText = '💣'
            elCell.classList.add('shown')
            gGame.shownCount++
            gLevel.LIVES--
            checkGameOver()

            if (gLevel.LIVES === 0) gameOver('😢')

        }

    }

}

function checkGameOver() {
    var minesMarkedCount = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isMarked)
                minesMarkedCount++
        }
    }
    if (gGame.shownCount === ((gLevel.SIZE ** 2)) && minesMarkedCount + gLevel.LIVES === gLevel.MINES) {
        gameOver('🥳')
    }

    if ((gLevel.LIVES > 0) && gGame.shownCount === ((gLevel.SIZE ** 2)) && minesMarkedCount=== gLevel.MINES) {
        gameOver('🥳')
    }
}

function cellMarked(elCell, i, j) {
    checkGameOver()

    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    if (gGame.markedCount === gLevel.MINES && !gBoard[i][j].isMarked) return
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        elCell.innerText = ''
        gGame.markedCount--
        gGame.shownCount--
    }

    else {
        gBoard[i][j].isMarked = true
        elCell.innerText = '🚩'
        gGame.markedCount++
        gGame.shownCount++
        checkGameOver()
    }
}

function gameOver(smiley) {
    var elsmiley = document.querySelector('.smiley')
    elsmiley.innerText = smiley
    if (gInterval) clearInterval(gInterval)
    resetTime()

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            const elNegsCell = document.querySelector(`#cell-${i}-${j}`)
            if (gBoard[i][j].isMine) elNegsCell.innerText = '💣'
            else elNegsCell.innerText = `${gBoard[i][j].minesAroundCount}`
        }
    }
}

function startTimer() {
    var gStartTime = Date.now()
    gInterval = setInterval(() => {
        const seconds = (Date.now() - gStartTime) / 1000
        var elH2 = document.querySelector('.time')
        elH2.innerText = `🕑: ${seconds.toFixed(0)} 🚩:${gLevel.MINES - gGame.markedCount} ❤️:${gLevel.LIVES} cells:${gGame.shownCount}`
    }, 1);
}

function resetTime() {
    var elH2 = document.querySelector('.time')
    elH2.innerText = '🕑: 🚩: ❤️: cells:'
}

function getHints(button) {
    if (!gGame.isOn || clickCount > 0) {
        return
    }
    button.classList.add('is-clicked')
    var clickCount = 0
    gGetHintsOn = true
    clickCount++
}

function cellNegsHint(row, col) {

    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].isShown) continue
            const elNegsCell = document.querySelector(`#cell-${i}-${j}`)

            if (gBoard[i][j].minesAroundCount === 0) {
                elNegsCell.innerText = ' '
            }
            if (gBoard[i][j].minesAroundCount > 0) {
            } elNegsCell.innerText = `${gBoard[i][j].minesAroundCount}`

            if (gBoard[i][j].isMine) {
                elNegsCell.innerText = '💣'
            }
            if (gBoard[i][j].isMarked) {
                elNegsCell.innerText = '🚩'
            }

        }
    }
}

function cellNegsHintClear(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue
            const elNegsCellClear = document.querySelector(`#cell-${i}-${j}`)
            elNegsCellClear.innerText = ' '
            elNegsCellClear.classList.remove('shown')
        }
    }
}

function clearHintsButton() {
    var hintsButtons = document.querySelectorAll('h4 button')
    for (var i = 0; i < hintsButtons.length; i++) {
        var btn = hintsButtons[i]
        btn.classList.remove('is-clicked')
    }
}

function checkNegsZeros(row, col) {

    const elNegsCell = document.querySelector(`#cell-${row}-${col}`)
    elNegsCell.innerText = ' '
    elNegsCell.classList.add('shown')

    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === row && j === col) continue
            if (gBoard[i][j].isMine || gBoard[i][j].isMarked || gBoard[i][j].isShown) continue
            gBoard[i][j].isShown = true
            gGame.shownCount++
            const elNegsCell = document.querySelector(`#cell-${i}-${j}`)
            if (gBoard[i][j].minesAroundCount > 0) {
                elNegsCell.innerText = `${gBoard[i][j].minesAroundCount}`
                elNegsCell.classList.add('shown')
            }
            if (gBoard[i][j].minesAroundCount === 0) {
                elNegsCell.classList.add('shown')
                checkNegsZeros(i, j)
            }
        }
    }
}

function safeClick(){

    const randomCell = getRandomSafeCell()
    const row = randomCell.i
    const col = randomCell.j
    const elCell = document.querySelector(`#cell-${row}-${col}`)
    elCell.classList.add('shown')
    setTimeout(() => {
        elCell.classList.remove('shown') }, 1000)
        
}

function getRandomSafeCell(){
    const RandomSafeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isShown&&!gBoard[i][j].isMine) {
                const safeCell = { i: i, j: j }
                RandomSafeCells.push(safeCell)
            }
        }
    }
    const shuffledRansomCells = RandomSafeCells.sort(() => Math.random() - 0.5)
    return shuffledRansomCells[0]
}