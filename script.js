const cells = document.querySelectorAll(".cell")
const reset = document.getElementById("reset")
const HUMAN = "X"
const AI = "O"

let board = Array(9).fill(null)
let currentPlayer = HUMAN
let gameOver = false

const WINNING_COMBOS = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6],[1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
]


cells.forEach(cell => {
    cell.addEventListener("click", () =>{
        const index = cell.dataset.index

        if(board[index] || gameOver) return

        board[index] = currentPlayer
        cell.textContent = currentPlayer

        const checkWinner = winner(board)
        if(checkWinner){
            alert(`Wins!`)
            gameOver = true
            return
        }

        if(isDraw(board)){
            alert("Draw!")
            gameOver = true
            return
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X"
    })
})

reset.onclick = () => {
    board.fill(null)
    cells.forEach(cell => cell.textContent = "")
    currentPlayer = "X"
    gameOver = false
}



function winner(board){
    for( const  combo of WINNING_COMBOS)
    {
        const [a,b,c] = combo

        if(board[a] && board[a] === board[b] && board[a] === board[c]){
            return board[a]
        }
    }
    return null
}

function isDraw(board){
    return board.every(cell => cell !==null)
}

function evaluate(board){
    const checkWinner = winner(board)
    if(winner === AI) return 10;
    if (winner === HUMAN) return -10
    return 0
}

function minimax(board, depth, isMaximizing){
    const score = evaluate(board)

    if(score !== 0) return score
    if(isDraw(board)) return 0;

    if(isMaximizing){
        let best = -Infinity

        for(let i = 0; i <9; i++){
            if(board[i] === null){
                board[i] = AI
                best = Math.max(best, miniMax(board, depth +1, false))
                board[i] = null
            }
        }

        return best
    }else{
        let best = Infinity

        for(let i=0; i<9; i++){
            if(board[i]===null){
                board[i] = HUMAN
                best = Math.min(best, minimax(board, depth+1, true))
                board[i]=null
            }
        }
        return best
    }
}