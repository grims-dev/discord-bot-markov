// your Discord developer application's bot token: https://discordapp.com/developers/applications/me (string)
const token = '';

// the command you want the bot to respond to when at the start of the message (string)
const command = '';

// percentage chance to randomly respond to a message (number, 0-100)
const randomResponseChance = 1.5;

// time in seconds before another random message can be sent (number)
const randomResponseCooldown = 360;

module.exports = {
  token,
  command,
  randomResponseChance,
  randomResponseCooldown,
}