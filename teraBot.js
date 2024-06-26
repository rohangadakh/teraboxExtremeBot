const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const https = require('https');

// Create an axios instance with forced IPv4
const axiosInstance = axios.create({
    timeout: 20000, // 20 seconds timeout
    httpsAgent: new https.Agent({
        family: 4, // Use IPv4
    }),
});

const API_TOKEN = '7359708528:AAGdWQ8g1Lv7Xj2fFOmi1R5H6EhqG5CMl6M';
const bot = new TelegramBot(API_TOKEN, { polling: true });

const EXTREME_CHANNEL_LINK = "https://t.me/helloextreme";

// Function to handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const startMessage = `
Hi from *Extreme*! Send me a Terabox link to generate the download link.

*Note: Bot will take some time to generate your video, be patient thank you [2 minutes minimum waiting time]*
    `;
    bot.sendMessage(chatId, startMessage, { parse_mode: 'Markdown' });
});

// Function to handle text messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const link = msg.text;

    if (link.startsWith('/start')) {
        return; // Ignore /start command in this handler
    }

    bot.sendChatAction(chatId, 'typing');
    bot.sendMessage(chatId, "🔄️ Generating link......", { parse_mode: 'Markdown' });

    const url = `https://teraboxvideodownloader.nepcoderdevs.workers.dev/?url=${link}`;

    try {
        const response = await axiosInstance.get(url);
        if (response.status === 200) {
            const data = response.data;

            const resolutions = data.response[0].resolutions;
            const hdVideoLink = resolutions["HD Video"];
            const title = data.response[0].title;

            // Shorten the URL
            const tinyUrlApi = `http://tinyurl.com/api-create.php?url=${hdVideoLink}`;
            const shortenedHdVideoLink = await axiosInstance.get(tinyUrlApi);

            const responseMessage = `
*Title:* ${title}
*After clicking on the link, wait a few seconds to start the downloading*
[Click here to download the video](${shortenedHdVideoLink.data})

Join the Extreme channel for more extreme bots: ${EXTREME_CHANNEL_LINK}
            `;

            bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        } else {
            bot.sendMessage(chatId, "❌ *Error fetching data from Terabox API*", { parse_mode: 'Markdown' });
        }
    } catch (error) {
        bot.sendMessage(chatId, `❌ *Join ${EXTREME_CHANNEL_LINK} for error solution*\n Error: ${error.message}`, { parse_mode: 'Markdown' });
    }
});
