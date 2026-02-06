const cells = document.querySelectorAll(".cell")
const reset = document.getElementById("reset")
const statusE1 = document.getElementById("status")

const HUMAN = "X"
const AI = "O"

let board = Array(9).fill(null)
let currentPlayer = HUMAN
let gameOver = false


//Rules
const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
]

function winner(board) {
    for (const combo of WINNING_COMBOS) {
        const [a, b, c] = combo

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]
        }
    }
    return null
}


function isDraw(board) {
    return board.every(cell => cell !== null)
}

//Moves

function makeMove(index, player) {


    if(index === null || index === undefined){
        console.warn("Invalid Move index", index)
        return
    }

    board[index] = player
    cells[index].textContent = player

    const win = winner(board)
    if (win) {
        alert(`${win} wins!`)
        gameOver = true
        return
    }


    if (isDraw(board)) {
        alert("Draw!")
        gameOver = true
        return
    }

    currentPlayer = player === HUMAN ? AI: HUMAN
}



//UI Control
cells.forEach(cell => {
    cell.addEventListener("click", async () => {
        const index = Number(cell.dataset.index)

        if(!Number.isInteger(index)) return
        if (board[index] || gameOver || currentPlayer !== HUMAN) return

        makeMove(index, HUMAN)
        
        if(!gameOver){
            aiThinking(true)
            const result = await aiMove()
            aiThinking(false)

            if(result && Number.isInteger(result.move)){
            makeMove(result.move, AI)
            statusE1.textContent = `AI (${result.source})`}
        }

    })
})



reset.onclick = () => {
    board.fill(null)
    cells.forEach(cell => cell.textContent = "")
    currentPlayer = HUMAN
    gameOver = false
}

//AI API

async function aiMoveFromAPI() {
    const response = await fetch("http://localhost:3000/ai-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board })
    })

    const data = await response.json()
    return data.move
}

//Fallback minimax


function evaluate(board) {
    const checkWinner = winner(board)
    if (winner === AI) return 10;
    if (winner === HUMAN) return -10
    return 0
}


function minimax(board, isMaximizing) {
    const score = evaluate(board)

    if (score !== 0) return score
    if (isDraw(board)) return 0;

    if (isMaximizing) {
        let best = -Infinity

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = AI
                best = Math.max(best, minimax(board, false))
                board[i] = null
            }
        }

        return best
    } else {
        let best = Infinity

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = HUMAN
                best = Math.min(best, minimax(board, true))
                board[i] = null
            }
        }
        return best
    }
}

function bestMove(){
    let bestScore = -Infinity
    let move = null

    for(let i= 0; i<9; i++){
        if(board[i]===null){
            board[i] =AI
            const score = minimax(board, false)
            board[i] = null

            if(score > bestScore){
                bestScore = score
                move = i
            }
        }
    }
    return move
}

//AI CONTROLLER
async function aiMove() {
    try{
        const move = await aiMoveFromAPI()
        if(Number.isInteger(move) && board[move] === null){
            return {move, source:"Ollama"}
        }
    }catch(e){
        console.warn("API Failed, MiniMax")
    }

    return {move: bestMove(), source: "minimax"}
    
}

function aiThinking(isThinking){
    statusE1.textContent = isThinking ? "AI is thinking..." : ""
}

