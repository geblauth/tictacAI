import express from "express"
import fetch from "node-fetch"
import cors from "cors"



const app = express()
app.use(cors())
app.use(express.json())



app.post("/ai-move", async (req, res) =>{
    const {board} = req.body

    if(!Array.isArray(board) || board.length !== 9){
        return res.status(400).json({ error: "Invalid board"})
    }

    const prompt = `
    You are playing Tic Tac Toe as "O".
    
    Rules:
    - Board has 9 cells (index 0 to 8)
    - "X" = human
    - "O" = you
    - null = empty
    - You MUST choose an empty cell
    - No explanations, no text
    - You always say the number of the board first
    
    Board:
    ${JSON.stringify(board)}
     `

     try{  
        const response = await fetch("http://localhost:11434/api/generate",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                model: "phi3",
                prompt,
                stream: false
            })
        })

        const data = await response.json()
        const raw = data.response || "";
        console.log(raw)
        const move = tryParseMove(raw)
        console.log(move)

        if (move === null)
        {throw new Error("move:", move)}

        const text = data.response.trim()
        const parsed = JSON.parse(text)

        if(
            typeof parsed.move !== "number" ||
            parsed.move <0 ||
            parsed.move >8 ||
            board[parsed.move] !== null
        ){
            throw new Error("Invalid Move")
        }

        res.json({move: parsed.move})

     } catch(err){

        console.error("Reason why it failed:", err.message)
        res.status(500).json({error: "Local AI Failed"})
     }
})

app.listen(3000, ()=>{
    console.log("AI Server running on http://localhost:3000")
})


function tryParseMove(text){

    if(!text) return null

    const match = text.match(/\{[\s\S]*?\}/)
    if(!match) return null
    
    try{
        const obj = JSON.parse(
            match[0]
                .replace(/,\s*}/g, "}")
                .replace(/,\s*]/g, "]")
            )

            if(typeof obj.move === "number"){
                return obj.move
            }
        } catch{}
        return null
    }
