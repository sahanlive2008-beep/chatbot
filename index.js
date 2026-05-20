const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// මේක තමයි අපේ රහස් පදය (Verify Token). මේ නම වෙනස් කරන්නේ නැතුව තියාගන්න.
const VERIFY_TOKEN = "my_super_secret_token_123"; 

// 1. Facebook එකෙන් අපේ රොබෝව පරීක්ෂා කරන කොටස (Verify Webhook)
app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Facebook එක සාර්ථකව සම්බන්ධ විය!');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// 2. පාරිභෝගිකයන්ගෙන් එන මැසේජ් ලබාගන්නා කොටස (Receive Messages)
app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object) {
        console.log("ඔන්න අලුත් මැසේජ් එකක් ආවා!");
        // ආපු මැසේජ් එකේ විස්තර අපේ තිරයේ පෙන්නන්න
        console.log(JSON.stringify(body, null, 2)); 
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// අපේ රොබෝට පණ දීම (Start the server)
app.listen(3000, () => {
    console.log('අපේ රොබෝ වැඩ පටන් ගත්තා! (Port 3000)');
});