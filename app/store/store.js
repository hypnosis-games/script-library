import scriptDictionary from "../scripts/script-dictionary.js";

export default function store(state, emitter) {
  // Initialize state
  state.currentLine = 0;
  state.currentCharacter = 0;
  state.textToDisplay = "";
  state.readyToAdvance = false;

  function preprocessLine(line) {
    let newLine = line
    .split(/(?<=[.!?])\s+/) // Split by punctuation followed by space
    .map(sentence => `${sentence.trim()}\n`) // Wrap in <p> tags
    .join(""); // Join everything back into a single string
  
    console.log('Preprocessed line:', newLine);
  
    // Ensure ellipses ("...") are followed by a newline
    newLine = newLine.replace(/(\.\.\.)/g, "$1\n");
  
    //split punctuation followed by a quote into \n
    newLine = newLine.replace(/([.!?])"/g, "$1\"\n");
    return newLine;
  }
    
  
  



  emitter.on('load-script', (scriptName) => {
    console.log("scriptDictionary", scriptDictionary);
    console.log('Loading script:', scriptName);
    state.currentLine = 0;
    state.currentCharacter = 0;
    state.currentScript = scriptDictionary[scriptName];

    state.scriptLines = state.currentScript
      .split('\n')
      .filter(line => line.trim() !== '') // Remove empty lines
      .map(preprocessLine); // Preprocess lines into paragraphs

    emitter.emit('render');
    emitter.emit('start-typewriter'); // Start the typewriter effect
  });

  emitter.on('advance-line', () => {
    if (!state.readyToAdvance) return;

    if (state.currentLine >= state.scriptLines.length) {
      state.scriptComplete = true;
      state.readyToAdvance = false;
      return;
    }
    console.log('Advancing line:', state.currentLine);
    state.currentLine++;
    state.currentCharacter = 0;
    state.readyToAdvance = false;


    state.textToDisplay = ""; // Reset the displayed text
    emitter.emit('start-typewriter'); // Start typing the next line
  });

  emitter.on('start-typewriter', () => {
    const line = state.scriptLines[state.currentLine];
    console.log("Typing line:", line);

    const typeNextCharacter = () => {
      if (state.currentCharacter < line.length) {
        state.textToDisplay += line[state.currentCharacter];
        state.currentCharacter++;
        emitter.emit('render'); // Re-render with the next character

        // Schedule the next character
        setTimeout(typeNextCharacter, 35); // Adjust speed as needed
      } else {
        state.readyToAdvance = true; // Allow advancing to the next line
      }
    };

    typeNextCharacter(); // Start typing the line
  });
}
