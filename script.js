const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const token='5980450221:AAH8xw2tFKm3O9rUqkpnnQgDxGxeVPogYgQ';

const bot = new TelegramBot(token, { polling: true });

var serviceAccount = require("./AccountKey.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

bot.on('message', function (msg) {
  const messageText = msg.text;
  const newMsg = messageText.split(" ");

  if(newMsg[0] === '/start'){
    const chatId = msg.chat.id;
    bot.sendMessage(chatId , "Welcome  " +msg.from.first_name + " !\nUse The Following Commands To Interact With The Bot :\n\n 1 . Use The Following Format To Insert/Add the data : \n      𝗜𝗡𝗦𝗘𝗥𝗧 <𝗻𝗮𝗺𝗲> 𝗙𝗔𝗩𝗢𝗥𝗜𝗧𝗘_𝗖𝗢𝗟𝗢𝗥 <𝗰𝗼𝗹𝗼𝗿>\n\t 2 . Use The Following Format To Fetch The Data : \n\t      𝗚𝗘𝗧\n 3 . Use The Following Format To Get Random Quote :\n\t     /quote");
  }
  else if (newMsg[0] === 'INSERT') {
    // Insert the name and favorite color to the database with key
    if (newMsg.length === 4 && newMsg[2] === 'FAVORITE_COLOR') {
      const name = newMsg[1];
      const favoriteColor = newMsg[3];

      db.collection('userData').add({
        name: name,
        favoriteColor: favoriteColor,
        userID: msg.from.id
      }).then(() => {
        bot.sendMessage(msg.chat.id, name + "'s favorite color (" + favoriteColor + ") stored successfully.");
      }).catch((error) => {
        bot.sendMessage(msg.chat.id, "Error occurred while storing the data: " + error.message);
      });
    } else {
      bot.sendMessage(msg.chat.id, "Invalid command. Please use the Following Format: \nINSERT <name> FAVORITE_COLOR <color>");
    }
  }
  else if (newMsg[0] === 'GET') {
    // Get the name and favorite color from the database with key
    db.collection('userData').where('userID', '==', msg.from.id).get().then((docs) => {
      docs.forEach((doc) => {
        const name = doc.data().name;
        const favoriteColor = doc.data().favoriteColor;
        bot.sendMessage(msg.chat.id, name + "'s favorite color is " + favoriteColor);
      });
    }).catch((error) => {
      bot.sendMessage(msg.chat.id, "Error occurred while fetching the data: " + error.message);
    });
  }
  else if (newMsg[0] === '/quote') {
    // Fetch a random quote from the Forismatic Quotes API and send it as a message
    fetch('http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en')
      .then((response) => response.json())
      .then((data) => {
        const quote = data.quoteText;
        const author = data.quoteAuthor || "Unknown";
        bot.sendMessage(msg.chat.id, '"' + quote + '"' + "\n       - " + author);
      })
      .catch((error) => {
        bot.sendMessage(msg.chat.id, "Error occurred while fetching a random quote: " + error.message);
      });
  }
  else {
    bot.sendMessage(msg.chat.id, "Please make sure you use GET, INSERT, or /quote in your message to interact with the bot.");
  }
});
