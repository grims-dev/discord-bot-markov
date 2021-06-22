// split a text up into tokens where there are spaces
String.prototype.tokenize = function () {
  return this.split(/\s+/);
}

// clear all non-alphanumeric characters (punctuation) and make it lowercase - fall back to removing only alphanumeric
String.prototype.clean = function () {
  const punctuationRegex = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
  return this.replace(punctuationRegex, '').toLowerCase() || this.replace(/[A-z 0-9]/g, '');
}

// return a random element from an array
Array.prototype.choice = function () {
  return this[Math.floor(Math.random() * this.length)];
}

// return N amount of last values from an array
Array.prototype.getNLastWords = function (n = 2) {
  return this.slice(this.length - n, this.length).join(' ');
}