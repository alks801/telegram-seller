//node-telegram-bot-api using
const TelegramBot = require('node-telegram-bot-api');
const _ = require('lodash');

const bot_token = '';
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

//basket
const getBasketMenuScreen = () => {
    let basketItems = await executeSql('SELECT * FROM `shop-nodejs`.basket;', true);

    let res = {};
    let total = 0;
    res.text = '*Basket:*\r\n';
    _.forEach(basketItems, (b) => {
        res.text = `${res.text}${b.productid}|${b.productname}|${b.productcost}\r\n`;
        total += b.cost;
    })
    res.text = res.text + 'Total:' + total;
    res.option = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Order!', callback_data: 'basket_order' }]
            ]
        },
        parse_mode: 'Markdown'
    };
    return res;
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

//showProduct function
const showProduct = (chatId, product) => {
    let productScreen = {
        text: `*${product.name}* \r\n${product.description}\r\n$${product.cost}`,
        options: {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Order!', callback_data: `product_basket_${product.idproduct}` }]
                ]
            },
            parse_mode: 'Markdown'
        }
    };
    bot.sendMessage(chatId, productScreen.text, productScreen.options);
}

//db
const getConnectionAsync = async () => {
    var mysql = require('mysql');
    return mysql.createPool({
        host: 'localhost',
        user: 'sa',
        password: '1111',
        database: 'shop-nodejs'
    });
};

const executeSql = async (q, isReturn) => {
    const pool = await getConnectionAsync();
    let res = await pool.query(q/*, (e, r, f) => {
        return r;
    }*/);
    if (isReturn)
        return res;
    return;
}

//
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
        case basketString:
            let basketMenuScreen = getBasketMenuScreen();
            bot.sendMessage(msg.chat.id, basketMenuScreen.text, basketMenuScreen.options);
            break;
        default:
    }
});

//callback clicks
bot.on('callback_query', async (cbq) => {
    switch (cbq.data) {
        case 'main_products':
            var products = await executeSql('SELECT * FROM `shop-nodejs`.product;', true);
            if (roducts && products.length > 0) {
                _.forEach(products, (p) => {
                    showProduct(cbq.from.id, p);
                })
            }
            break;
        case 'basket_order':
            let basketItems = await executeSql('SELECT * FROM `shop-nodejs`.basket WHERE chatid=' + cbq.from.id + ';', true);
            _.forEach(basketItems,
                (b) => {
                    await executeSql($`INSERT INTO order (chatid, productid) VALUES (${cbq.from.id}, ${b.productid})`, false);
                });
            bot.sendMessage(msg.chat.id, 'Successful!');
    }
    if (cdq.data.startWith('product_basket')) {
        let productid = cdq.data.split('_')[2];
        await executeSql($`INSERT INTO basket (chatid, productid) VALUES (${cbq.from.id}, ${productid})`, false);
    }
    bot.answerCallbackQuery({ callback_query_id: cbq.id });
});
