const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');

const app = express();
app.use(express.json());

// ⚠️ අර කලින් දාපු රහස් යතුරු 3 ආයෙත් මෙතනට දාන්න
const VERIFY_TOKEN = "my_super_secret_token_123"; 
const WHATSAPP_TOKEN = "EAAObtMYm7YQBRtEAfHNLWFPXKndHcgPEQSztIQDPXV3UZAsha2BVrXXiPF0ZCF1tFZCuw95i8F8aRZCA8i7USUyIGBySqGuTMmFTrva3Rczwhv16Y60UHixoyURVU3notZCpQbVdoZC3PH9EeIWZCEq3UQ7yytehx10q5ABSaWiFjpXzmWE75E024diyCHE4ZCDutAZDZD";
const PHONE_NUMBER_ID = "1064438050096039";

const router = express.Router();

router.get('/webhook', (req, res) => {
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

router.post('/webhook', async (req, res) => {
    let body = req.body;

    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            let from = body.entry[0].changes[0].value.messages[0].from; 
            let msg_body = body.entry[0].changes[0].value.messages[0].text.body;
            
            // කස්ටමර්ගේ මැසේජ් එකේ හිස්තැන් අයින් කරලා simple අකුරු වලට හරවනවා
            let text = msg_body.toLowerCase().trim();
            let reply_text = "";

            // 🤖 රොබෝගේ මොළය (Conditions)
            if (text === "hi" || text === "hello" || text === "hai") {
                reply_text = "1. අපගේ නිෂ්පාදන පිළිබඳ දැනගැනීමට\n2. අපගේ සේවාවන් දැනගැනීමට\n\n*(අදාළ අංකය Reply කරන්න)*";
                
            } else if (text === "1") {
                reply_text = "📦 *අපගේ නිෂ්පාදන*\n\n11. බිල් සිස්ටම් (Bill System) සෑදීම\n12. වෙබ්පිටු සෑදීම\n13. ඇප් සෑදීම\n14. බල්ක් SMS (Bulk SMS) ලබාදීම\n15. මිනි ගේම් සෑදීම\n16. වෙබ් ඇප් සෑදීම\n17. මොබයිල් ඇප් සෑදීම\n18. ලෝගෝ (Logo) නිර්මාණය\n\n*(විස්තර බැලීමට 11, 12 ආදී ලෙස අදාළ අංකය Reply කරන්න)*";
                
            } else if (text === "2") {
                reply_text = "✨ *අපගේ සේවාවන්*\n\n• පැය 24 පුරා AI චැට් සේවාව\n• පැය 6ක් පුරා ඇමතුම් සේවාව\n• ලංකාවේ අඩුම මිල\n• මිත්‍රශීලී ගනුදෙනු\n• සියලුම නිෂ්පාදන සඳහා වගකීම\n• උසස් නිමාව";
                
            } else if (text === "11") {
                reply_text = "💻 *බිල් සිස්ටම් සෑදීම*\n\n11.1 ඩෙමෝ එක අරන් චෙක් කරන්න\n11.2 මිල ගණන් (Price)\n\n*(අදාළ අංකය - 11.1 හෝ 11.2 - Reply කරන්න)*";
                
            } else if (text === "11.1") {
                reply_text = "ඔබට තාවකාලික ඇප් එක පැය 6ක් භාවිතා කළ හැක : https://sahanlive2008-beep.github.io/demo/";
                
            } else if (text === "11.2") {
                reply_text = "පැකේජ් තුනක් යටතේ ඇත. SG Developers මගින් හැඳින්වීමක් අයදුම් කරන්නම්.";
                
            } else if (["12", "13", "14", "15", "16", "17", "18"].includes(text)) {
                reply_text = "මෙම සේවාවන් යාවත්කාලීන වෙමින් පවතී. ඉතා ඉක්මනින් බලාපොරොත්තු වන්න 🚧 (Coming soon)";
                
            } else {
                // වෙන ඕනෑම මැසේජ් එකකට (මුල්ම මැසේජ් එක)
                reply_text = "හලෝ! මම SG Graphic Designer ඔටෝ චැට් බොට් එක. ඔබට සේවාව ඉදිරියට පවත්වාගෙන යාමට 'Hi' ලෙස දාන්න.";
            }

            // උත්තරය යැවීම
            try {
                await axios({
                    method: 'POST',
                    url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
                    data: {
                        messaging_product: 'whatsapp',
                        to: from,
                        text: { body: reply_text }
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

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
