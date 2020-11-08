const fs = require('fs');
const markov = require('./markov');
const discordSetup = require('./discord-setup');
const Discord = require('discord.js');

const MarkovGeneratorWord = markov.MarkovGeneratorWord;
const bot = new MarkovGeneratorWord(2, 50);
const botToken = discordSetup.token.trim();
const botCommand = discordSetup.command.trim();
let timeCheck = new Date().getTime();

const client = new Discord.Client();

client.login(botToken);

client.on('ready', () => {
  const lines = fs.readFileSync("log.txt").toString().split('\n');
  if (lines.length) {
    lines.forEach(line => {
      bot.feed(line.trim());
    });
  }
});

client.on('message', message => {
  if (message.content.startsWith(botCommand)) {
    // remove bot command and trim whitespace
    let userMessage = message.content.replace(botCommand, "").trim() || false;
    // generate user message with optional search parameter
    message.channel.send(bot.generate(userMessage));
  } else {
    // not a request; now we do some checks to see if it's worthy of being added to file/markov chain
    // we want to ignore bots (including self!) and disallow DM input
    if (message.author.bot == false && message.guild !== null) {
      // trim and replace double spaces, line breaks, etc
      let userMessage = message.content.trim().replace(/\s\s+/g, ' ');

      // only worth storing if 2 words or more
      if (userMessage.split(' ').length >= 2) {
        fs.appendFile("log.txt", "\n" + userMessage, (err) => { if (err) console.log(err); });
        bot.feed(userMessage);
      }

      // bonus: very small % chance of replying to non-request after certain amount of time has passed
      if (Math.random() > 0.98 && timeCheck < new Date().getTime() - 300000) {
        message.channel.send(bot.generate(userMessage.tokenize().choice()));
        timeCheck = new Date().getTime();
      }
    }
  }
});
