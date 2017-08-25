//node-telegram-bot-api using
const TelegramBot = require('node-telegram-bot-api');
const _ = require('lodash');

const bot_token = '369838448:AAHzXhCJVNMa4tXx7vsFHjqt_5wg4RXoB2U';
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
const getBasketMenuScreen = (chatid) => {
    connection.query('SELECT * FROM `shop-nodejs`.basket WHERE chatid = ' + chatid, (err, result, fields) => {
        if (err) throw err;
        let basketItems = result;
        let total = 0;
        let text = '*Basket:*\r\n';
        let counter = 1;
        _.forEach(basketItems, (b) => {
            text = `${text}${counter}|${b.productname}|$${b.productcost}\r\n`;
            total += b.productcost;
            counter++;
        })
        text = text + 'Total:' + total;
        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Order!', callback_data: 'basket_order' }]
                ]
            },
            parse_mode: 'Markdown'
        };
        bot.sendMessage(chatid, text, options);
    });
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
                    [{ text: 'Add to basket', callback_data: `product_basket_${product.idproduct}` }]
                ]
            },
            parse_mode: 'Markdown'
        }
    };
    bot.sendMessage(chatId, productScreen.text, productScreen.options);
}

//db
var mysql = require('mysql');
var connection = mysql.createConnection({
    connectionLimit: 100, //important
    host: 'localhost',
    user: 'sa',
    password: '1111',
    database: 'shop-nodejs',
    debug: false
});

//guid generator
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
            getBasketMenuScreen(msg.chat.id);
            break;
        default:
    }
});

//callback clicks
bot.on('callback_query', (cbq) => {
    switch (cbq.data) {
        case 'main_products':
            connection.query('SELECT * FROM `shop-nodejs`.product;', (err, result, fields) => {
                if (err) throw err;
                var products = result;
                if (products && products.length > 0) {
                    _.forEach(products, (p) => {
                        showProduct(cbq.from.id, p);
                    })
                }
            });
            break;
        case 'basket_order':
            connection.query('SELECT * FROM `shop-nodejs`.basket WHERE chatid=' + cbq.from.id + ';', (err, result, fields) => {
                if (err) throw err;
                var basketItems = result;
                if (basketItems && basketItems.length > 0) {
                    let insertetCount = 0;
                    let orderid = uuidv4();//for fun
                    _.forEach(basketItems,
                        (b) => {
                            connection.query(`INSERT INTO \`shop-nodejs\`.order (idorder, chatid, productid) VALUES('${orderid}',${b.chatid}, ${b.productid})`, (err, result, fields) => {
                                if (err) throw err;
                                insertetCount++;
                                if (insertetCount == basketItems.length) {
                                    connection.query('DELETE FROM \`shop-nodejs\`.basket WHERE chatid = ' + b.chatid, (err, result, fields) => {
                                        if (err) throw err;
                                        bot.sendMessage(cbq.from.id, 'Successful!');
                                    });
                                }
                            });
                        });
                }
            });
            break;
    }
    if (cbq.data.startsWith('product_basket')) {
        let productid = cbq.data.split('_')[2];
        connection.query('SELECT * FROM `shop-nodejs`.product WHERE idproduct = ' + productid, (err, result, fields) => {
            if (err) throw err;
            let product = result[0];
            connection.query(`INSERT INTO \`shop-nodejs\`.basket (chatid, productid, productname,productcost) VALUES (${cbq.from.id}, ${productid}, '${product.name}', ${product.cost})`, (err, result, fields) => {
                if (err) throw err;
                bot.sendMessage(cbq.from.id, `${product.name} successful added to basket!`);
            });
        })

    }
    bot.answerCallbackQuery({ callback_query_id: cbq.id });
});
