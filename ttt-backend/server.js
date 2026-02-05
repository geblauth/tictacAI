import express from "express"
import dotenv from "dotenv"
import OpenAI from "openai"
import cors from "cors"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

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
    - You MUST return ONLY valid JSON
    - You MUST choose an empty cell
    - No explanations, no text
    
    Board:
    ${JSON.stringify(board)}
    
    return exactly:
    { "move": number}
     `

     try{
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt}],
            temperature: 0
        })

        const text = response.choices[0].message.content.trim()
        const parsed = JSON.parse(text)

        if(
            typeof parsed.move !== "number" ||
            parsed.move < 0 ||
            parsed.move > 8 ||
            board[parsed.move] !== null
        ){
            return res.status(400).json({ error: "AI returned invalid move"})
        }

        res.json({move: parsed.move})
     } catch(err){
        console.error(err)
        res.status(500).json({error: "AI Failure"})
     }
})

app.listen(3000, ()=>{
    console.log("AI Server running on http://localhost:3000")
})