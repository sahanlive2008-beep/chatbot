const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // රොබෝට උත්තර යවන්න මේක අවශ්‍යයි

const app = express();
app.use(bodyParser.json());

// ⚠️ ඔයාගේ රහස් යතුරු මෙතනට දාන්න
const VERIFY_TOKEN = "my_super_secret_token_123"; 
const WHATSAPP_TOKEN = "EAAObtMYm7YQBRs2Yu6sP2e8GhDJ7n98z0ZCblwOtQL0bIos7OVC9qrjrQ6UXrzk8rBSwkuoFRdfGZCVXuwuOGjbuXodmlLhMFPiwzw01uLjaqY7taojpQuazi1ECdELrRx8RPBfSfEUzSpwna3PQZBEjsyg9o2OmmWxE1dkZCSDkKWL3IcDgVHjZCmBIUQZCQ3AH6fs6ybnsYFyuXbo3FSAti7pVAkXvYJWipvZAHbiPiQDp72vtXeNMigJJmLGiDWAu1RPBUWJlE2TbDKXzhAisrnMBwZDZD";
const PHONE_NUMBER_ID = "1064438050096039";

// 1. Facebook Webhook පරීක්ෂාව
app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// 2. මැසේජ් කියවා ආපසු උත්තර යැවීම (Auto-reply)
app.post('/webhook', async (req, res) => {
    let body = req.body;

    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            
            let from = body.entry[0].changes[0].value.messages[0].from; 
            let msg_body = body.entry[0].changes[0].value.messages[0].text.body;

            console.log("පණිවිඩයක් ආවා: " + msg_body);

            // ආපසු උත්තරය යැවීම
            try {
                await axios({
                    method: 'POST',
                    url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
                    data: {
                        messaging_product: 'whatsapp',
                        to: from,
                        text: { body: "ආයුබෝවන්! 🤖 මම ඔයාගේ 24/7 වැඩ කරන අලුත් රොබෝ. ඔයා එව්වේ: " + msg_body }
                    },
                    headers: {
                        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error("දෝෂයකි:", error.message);
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// ⚠️ Vercel සඳහා අවශ්‍ය විශේෂ වෙනස (app.listen වෙනුවට)
module.exports = app;
