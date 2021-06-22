const fs = require('fs');
const markov = require('./markov');
const discordSetup = require('./discord-setup');
const Discord = require('discord.js');

const MarkovGeneratorWord = markov.MarkovGeneratorWord;
const bot = new MarkovGeneratorWord(2, 50);
const botToken = discordSetup.token.trim() || false;
const botCommand = discordSetup.command.trim() || false;
const randomResponseChance = discordSetup.randomResponseChance / 100 || 0.015;
const randomResponseCooldownMS = discordSetup.randomResponseCooldown * 1000 || 360;
const botCommandStrict = botCommand + '.strict';
const messageOptions = {
  disableMentions: 'everyone',
  split: true,
};
const codeBlockRegex = /(```)(.*?)(```)/gims;
const whitespaceRegex = /\s\s+/g;
let timeCheck = new Date().getTime();
let lastAuthorId; 

const client = new Discord.Client();

client.login(botToken);

client.on('ready', () => {
  const lines = fs.readFileSync('log.txt').toString().split('\n');
  if (!lines.length) return;
  lines.forEach(line => bot.feed(line.trim()));
});


client.on('message', message => {
  if (message.content.startsWith(botCommand)) {
    const isStrictCommand = message.content.startsWith(botCommandStrict);
    const botCommandToRemove = isStrictCommand ? botCommandStrict : botCommand;
    // remove bot command and trim whitespace
    const userMessage = message.content.replace(botCommandToRemove, '').trim() || false;
    // generate user message with optional search parameter
    message.channel.send(bot.generate(userMessage, isStrictCommand), messageOptions);
  } else {
    // not a request; now we do some checks to see if it's worthy of being added to file/markov chain
    // we want to ignore bots (including self!) and disallow DM input
    if (message.author.bot == false && message.guild !== null) {
      // trim and replace code blocks, double spaces, line breaks, etc
      const userMessage = message.content
        .trim()
        .replace(codeBlockRegex, '')
        .replace(whitespaceRegex, ' ');

      // only worth storing if 2 words or more
      if (userMessage.split(' ').length >= 2) {
        fs.appendFile('log.txt', '\n' + userMessage, (err) => { if (err) console.log(err); });
        bot.feed(userMessage);
      }

      // bonus: chance of replying to non-request after certain amount of time has passed
      const chance = message.author.id === lastAuthorId ? randomResponseChance * 0.75 : randomResponseChance;
      if (Math.random() < chance && timeCheck < new Date().getTime() - randomResponseCooldownMS) {
        message.channel.send(bot.generate(userMessage.tokenize().choice()), messageOptions);
        timeCheck = new Date().getTime();
      }

      lastAuthorId = message.author.id;
    }
  }
});
