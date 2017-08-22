//node-telegram-bot-api using
const TelegramBot = require('node-telegram-bot-api');

const bot_token = '369838448:AAH8YAfPxmlvp2RD1HXxFPUKEtMI8xF9gjM';
const bot = new TelegramBot(bot_token, { polling: true });

//Main menu buttons strings
const mainMenuString = '📲Main menu';
const basketString = '🗑Basket';
const helpString = '⚠️Help';

//Texts and options for screens (mostly inline keyboard keys)
//mainMenu
const mainMenuScreen = {
    text: `*${mainMenuString}* \r\nPlease choose option:`,
    options: {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'News', callback_data: 'main_news' }],
                [{ text: 'Products', callback_data: 'main_products' }],
                [{ text: 'Favorites', callback_data: 'main_favs' }],
            ]
        },
        parse_mode: 'Markdown'
    }
};

//help
const helpScreen = {
    text: `*${helpString}*\r\nIf you have some troubles, pls contact with us:\r\nhttp://t.me/test`,
    options: {
        parse_mode: 'Markdown'
    }
};

//mainMenu keyBoard
const mainMenuKB = [
    [mainMenuString],
    [basketString],
    [helpString]
];

//---events---

//start
bot.onText(/\/start/, (msg, match) => {
    bot.sendMessage(msg.chat.id, 'Welcome to our telegram shop! \r\nPlease choose the action.', {
        'reply_markup': {
            'keyboard': mainMenuKB,
            'one_time_keyboard': false,
            'resize_keyboard': true
        }
    });
});

//Main menu keys. (+ any message which won't implement)
bot.on('message', (msg) => {
    switch (msg.text) {
        case mainMenuString:
            bot.sendMessage(msg.chat.id, mainMenuScreen.text, mainMenuScreen.options);
            break;
        case helpString:
            bot.sendMessage(msg.chat.id, helpScreen.text, helpScreen.options);
            break;
        default:
    }
});

//callback clicks
bot.on('callback_query', (cbq) => {
    switch (cbq.data) {
        case 'main_products': bot.sendMessage(cbq.from.id, helpScreen.text, helpScreen.options);
            break;
        case 'main_news':
        case 'main_favs':
    }
    bot.answerCallbackQuery({ callback_query_id: cbq.id });
});