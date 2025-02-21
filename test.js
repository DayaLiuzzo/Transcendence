const phrase = "Hello, world! Hello everyone. Welcome to the world of JavaScript.";


const regex = /[^a-zA-Z0-9 ]/g
trimmed = phrase.replace(regex, '')
lowered = trimmed.toLowerCase()

const words_occurences = {}
const words = lowered.split(' ')

for (let word of words) {
  if (word in words_occurences) {
    words_occurences[word]++
  } else {
    words_occurences[word] = 1
  }
}


