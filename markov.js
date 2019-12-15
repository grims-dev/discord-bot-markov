// Heavily based on code examples from Daniel Shiffman
// https://github.com/shiffman/A2Z-F16/tree/gh-pages/week7-markov/03_markov_byword


// A MarkovGenerate object
function MarkovGeneratorWord(n = 2, max = 50) {
  this.n = n; // Order (or length) of each ngram
  this.max = max; // What is the maximum amount we will generate?
  this.ngrams = {}; // Our program's dictionary -- each ngram is the key, a list of possible next elements are the values
  this.ngramValues = []; // Array of ngrams only

  // A function to feed in text to the markov chain
  this.feed = function (text) {
    let tokens = text.tokenize();

    // Discard this line if it's too short
    if (tokens.length < this.n) return false;

    // Store the first ngram of this line
    // Now let's go through everything and create the dictionary
    let numOfNgrams = tokens.length - this.n;
    for (let i = 0; i < numOfNgrams; i++) {
      // pull out N elements from the array to create new ngram
      gram = tokens.slice(i, i + this.n).join(' ');

      // if this ngram doesn't exist yet, create array for it
      if (!this.ngrams[gram]) {
        this.ngrams[gram] = [];
        this.ngramValues.push(gram);
      }

      // what's the word following this ngram?
      next = tokens[i + this.n];
      // if this word doesn't exist yet, add to the list
      // if you want frequency of word appearance to affect frequency of output, remove "if" section to allow duplicates
      if (!this.ngrams[gram].includes(next)) {
        this.ngrams[gram].push(next);
      }
    }
  }

  // Generate a text from the information ngrams
  this.generate = function (search = false) {
    let ngramValues = this.ngramValues; // local variable version that can be manipulated
    let currentNgram = ""; // current term being used
    let output = []; // array of tokens that we'll add to on each run and join at the end

    if (search) {
      let searchTokens = search.trim().clean().tokenize(); //array of clean search tokens
      let searchFirstWord = searchTokens[0];

      for (let i = 0; i < searchTokens.length; i++) {
        let isFirstRun = i === 0 ? true : false;
        let isLastRun = i >= searchTokens.length - this.n ? true : false;

        // pull out N elements from the array to create new ngram
        let searchNgram = searchTokens.slice(i, i + this.n).join(' ');

        // filter where similar
        let searchResults = ngramValues.filter(ngram => ngram.clean().startsWith(searchNgram));
        if (!searchResults.length) {
          if (isFirstRun) {
            // check if the first word matches
            searchResults = ngramValues.filter(ngram => ngram.split(' ')[0].clean().startsWith(searchFirstWord));
            if (!searchResults.length) break;
          } else {
            break;
          }
        }

        // filter further where exact
        let searchResultsExact = searchResults.filter(ngram => ngram.clean() === searchNgram);
        if (isFirstRun && !searchResultsExact.length) {
          searchResultsExact = searchResults.filter(ngram => ngram.split(' ')[0].clean() === searchFirstWord)
        }

        let searchResult = searchResultsExact.choice() || searchResults.choice();
        if (isFirstRun) output.push(searchResult.tokenize()[0]);
        output.push(searchResult.tokenize()[1]);

        if (isLastRun) break;
      }

      if (output.length) {
        // get last 2 words from match list
        currentNgram = output.getNLastWords(this.n);
      } else {
        // no search matched - get a random beginning
        currentNgram = ngramValues.choice();
        output = currentNgram.tokenize();
      }
    } else {
      // no search - get a random beginning
      currentNgram = ngramValues.choice();
      output = currentNgram.tokenize();
    }

    let numOfRemainingWords = this.max - output.length;
    for (let i = 0; i < numOfRemainingWords; i++) {
      let currentNgramClean = currentNgram.clean();

      // get an ngram where clean ngram === clean current or search for similar
      let currentResults = ngramValues.filter(ngram => ngram.clean().startsWith(currentNgramClean));
      let currentResultsExact = [];
      if (currentResults.length) {
        currentResultsExact = currentResults.filter(ngram => ngram.clean() === currentNgramClean);
      }

      // update next ngram
      let nextNgram = currentResultsExact.choice() || currentResults.choice();

      // get possible next token, if they don't exist break the for loop
      let possibleNextTokens = this.ngrams[nextNgram];
      if (!possibleNextTokens) break;

      // filter this ngram so it's not used again (prevents repeats)
      ngramValues = ngramValues.filter(ngram => ngram !== nextNgram);

      // Pick one of the possible next tokens randomly and add to output
      output.push(possibleNextTokens.choice());

      // Get the last N entries of the output; this is our new ngram that we'll use in the next iteration of the loop
      currentNgram = output.getNLastWords(this.n);
    }
    // Here's what we got!
    return output.join(' ');
  }
}

module.exports = {
  MarkovGeneratorWord: MarkovGeneratorWord
};