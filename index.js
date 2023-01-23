require('dotenv').config()
// Require express and body-parser
const express = require("express")
const bodyParser = require("body-parser")
const multer = require('multer');

// Initialize express and define a port
const app = express()
const PORT = process.env.PORT
const upload = multer({dest:'upload/'});
const axios = require('axios');

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array()); 

// Route define section
app.post("/hook", async (req, res) => {
  if(req.body.payload){
    const json = JSON.parse(req.body.payload);
    if(json && json.event){
      console.log(json.Player.uuid + " <= Plex Player UUID [" + new Date().toLocaleDateString() + " "+ new Date().toLocaleTimeString() + "]");
      sendAction(
        json, //to zawsze takie samo
        'https://svr11.supla.org/direct/xxxxx', //url do bramki supli
        "xxxxxxxxx", //code od bramki supli (identyfikator)
        "turn-off", //akcja która ma się zrobić na urządzeniu supla Dostępne: turn-on, turn-off, read
        "media.play",//przy jakim evencie ma sie to wykonać. Dostępne eventy: media.pause, media.play, media.rate, media.resume, media.scrobble, media.stop
        "playerId" //na jakim urządzeniu plex ma to działać
      );
    }
  }
  res.status(404).end() 
})

app.get("/", (req, res) =>{
    res.send("Plex <-> Supla WebHook Listener by Xmon <a href='https://Xmon.eu.org/' targen='_BLANK'>https://Xmon.eu.org/</a>");
})

// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

async function sendAction(json, suplaUrl, suplaCode, suplaAction, plexEvent, plexUser){
  if(json.Player.uuid === plexUser &&
    json.event === plexEvent){
      await axios(
        {
          method: "PATCH",
          //url do bramki supli
          url: suplaUrl,
          //jaka wartośc na wysłac | code => unikalny identyfikator danej bramki | action => akcja która ma się zrobić. Dostępne: turn-on, turn-off, read
          data: {"code":suplaCode,"action": suplaAction},
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
  }
}