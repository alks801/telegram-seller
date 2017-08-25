## Basic realization of an online store with telegram bot as a seller and admin site for managing orders.

Let me introduce basic realization of telegram seller bot.

Potencialy it can be powerful instrument for selling your products without site/ calling.
Just a bot for working with clients.

For start using it you should register your own bot via https://t.me/BotFather

* Next step is getting YOUR_BOT_TOKEN (like a 123456789:ADHzXhCJVJMa4tXx8vrFHjqt_5wg4BXoB2U)

* Paste your token into `app.js`

` const bot_token = '3123456789:ADHzXhCJVJMa4tXx8vrFHjqt_5wg4BXoB2U';`

After it install MySQL and add some data to your db.

 Current neccessary tables:

* `product (idproduct, name, description)`
* `basket (id, chatid, productid)`
* `order (id, irder, chatid, productid)`
* `chat (id, username, f_name, l_name)`

Screens with work:

**Start:**

![Start](https://image.ibb.co/jxSfHQ/Capture.png)

**MainMenu:**

![MainMenu](https://image.ibb.co/f9uAHQ/2.png)

**Products:**

![Products](https://image.ibb.co/dT3Fj5/3.png)

**Ordering:**

![Ordering](https://image.ibb.co/kgu7Wk/3333.png)

**Basket:**

![Basket](https://image.ibb.co/nP0pBk/basket.png)
