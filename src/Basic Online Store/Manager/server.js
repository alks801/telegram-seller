var okta_org = '';
var okta_token = '';

var express = require('express');
//var stormpath = require('express-stormpath');
var mysql = require('mysql');

var connection = mysql.createConnection({
    connectionLimit: 100,
    host: 'localhost',
    user: 'sa',
    password: '1111',
    database: 'shop-nodejs',
    debug: false
});
var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

/*app.use(stormpath.init(app, {
    expand: {
        customData: true
    }
}));*/

app.get('/',/* stormpath.getUser,*/ function (req, res) {
    connection.query('SELECT * FROM `shop-nodejs`.order;', (err, result, fields) => {
        if (err) throw err;
        res.render('home', {
            title: 'Orders',
            data: result
        });
    });
});

/*app.on('stormpath.ready', function () {
    console.log('Stormpath Ready');
});*/

app.listen(3000);
