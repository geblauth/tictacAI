import fetch from "node-fetch"

const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
        model: "phi3",
        primpt: "Return only JSON: {\"move\": 4}",
        stream: false
    })
})

const data = await res.json()
console.log(data)