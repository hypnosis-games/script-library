import scriptDictionary from "../scripts/script-dictionary.js";

export default function store(state, emitter) {
  //get style from url params
  const urlParams = new URLSearchParams(window.location.search);
  const style = urlParams.get("style");
  const scriptUrl = urlParams.get("script");
  state.style = "typewriter-fade";
  const NOT_MY_SCRIPT_WARNING = `
This script was not written by the author of this piece of software. It was written by someone else. I am not responsible for its content. 
If you would like to see the original script, look at the url in the address bar.
Make sure you trust the person who gave you this URL before you proceed.
Play safe!
...
...`;

  if (style) {
    if (
      style === "typewriter" ||
      style === "typewriter-fade" ||
      style === "line-fade"
    ) {
      state.style = style;
    }
  }
  // Initialize state
  state.currentLine = 0;
  state.currentCharacter = 0;
  state.textToDisplay = "";
  state.readyToAdvance = false;

  function addExplicitLineBreaks(line) {
    const containerDiv = document.getElementById("app");
    const containerWidth = containerDiv.offsetWidth;
    // this function creates a hidden div and then adds the line to it one word at a time
    // until the line is too long to fit in the div. Then it adds a newline character ("\n") before the last word
    // and starts a new line with the last word and continues from there until it's done.

    // Create a hidden div to calculate the line length
    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.visibility = "hidden";
    hiddenDiv.classList.add("centered-text");
    hiddenDiv.style.width = "auto";
    hiddenDiv.style.display = "inline-block";
    hiddenDiv.style.position = "absolute";
    // append the hidden div to the container div
    containerDiv.appendChild(hiddenDiv);

    // Split the line into words
    const words = line.split(" ");
    let currentLine = "";
    let length = 0;
    let sublines = [];
    words.forEach((word) => {
      // Add the word to the current line
      currentLine += word + " ";
      hiddenDiv.innerHTML = currentLine;
      // Get the width of the current line
      length = hiddenDiv.offsetWidth;
      // If the line is too long, add a newline character before the last word
      if (length >= containerWidth * 0.9) {
        // Remove the last word from the current line
        currentLine = currentLine.slice(
          0,
          currentLine.length - word.length - 1
        );
        // Add the current line to the sublines array
        sublines.push(currentLine);
        // Start a new line with the last word
        currentLine = word + " ";
      }
    });
    sublines.push(currentLine);
    sublines.push("¶");
    return sublines;
  }

  function preprocessLine(line) {
    let sublines = line.split(/(?<=[.!?])\s+/); // Split by punctuation followed by space
    let newSubLines = [];
    sublines.forEach((l) => {
      newSubLines = newSubLines.concat(addExplicitLineBreaks(l));
    });

    let newLine = newSubLines
      .map((sentence) => `${sentence.trim()}\n`) // Wrap in <p> tags
      .join(""); // Join everything back into a single string

    // Ensure ellipses ("...") are followed by a newline
    newLine = newLine.replace(/(\.\.\.)/g, "$1\n");

    //split punctuation followed by a quote into \n
    newLine = newLine.replace(/([.!?])"/g, '$1"\n');
    return newLine;
  }

  emitter.on("load-script", (scriptName) => {
    // if params includes scriptUrl, load script from url
    console.log("Loading script:", scriptName);
    if (scriptUrl) {
      const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(scriptUrl);
      fetch(proxyUrl)
        .then((response) => response.text())
        .then((text) => {
          state.currentScript = NOT_MY_SCRIPT_WARNING + text;
          state.scriptLines = state.currentScript
            .split("\n")
            .filter((line) => line.trim() !== "") // Remove empty lines
            .map(preprocessLine); // Preprocess lines into paragraphs
          emitter.emit("render");
          emitter.emit("start-typewriter", state.style); // Start the typewriter effect
        });
      return;
    }

    state.currentLine = 0;
    state.currentCharacter = 0;
    state.currentScript = scriptDictionary[scriptName];

    state.scriptLines = state.currentScript
      .split("\n")
      .filter((line) => line.trim() !== "") // Remove empty lines
      .map(preprocessLine); // Preprocess lines into paragraphs

    emitter.emit("render");
    emitter.emit("start-typewriter", state.style); // Start the typewriter effect
  });

  emitter.on("advance-line", () => {
    if (!state.readyToAdvance) return;

    if (state.currentLine >= state.scriptLines.length) {
      state.scriptComplete = true;
      state.readyToAdvance = false;
      return;
    }
    state.currentLine++;
    state.currentCharacter = 0;
    state.readyToAdvance = false;

    state.textToDisplay = ""; // Reset the displayed text
    emitter.emit("start-typewriter", state.style); // Start typing the next line
  });

  emitter.on("start-typewriter", (style) => {
    const line = state.scriptLines[state.currentLine];
    console.log("Typing line:", line);
    if (style === "typewriter-fade") {
      startTypewriterFade(line);
    } else if (style === "typewriter") {
      startTypewriter(line);
    } else if (style === "line-fade") {
      state.textToDisplay = ""; // Reset the displayed text
      emitter.emit("render"); // Re-render with the new text
      setTimeout(() => startLineFade(line), 10);
    }
  });

  function startLineFade(line) {
    console.log("Starting line fade effect", line);
    let currentSentence = 0; // Track the current sentence being typed
    let sentences = line.split("\n"); // Split the line into sentences
    sentences = sentences.filter((sentence) => sentence.trim() !== ""); // Remove empty lines
    console.log(
      "currentSentence",
      currentSentence,
      "sentences",
      sentences.length
    );
    const showNextSentence = () => {
      if (currentSentence < sentences.length) {
        console.log("Showing next sentence:", currentSentence);
        const sentence = sentences[currentSentence];
        let sentenceDelay = Math.max(
          sentences[currentSentence].length * 35,
          1000
        );

        state.textToDisplay += `<span class="character">${sentence}</span>\n`; // Append the sentence to the text
        currentSentence++; // Move to the next sentence
        console.log("Typing sentence:", sentence);
        emitter.emit("render"); // Re-render with the new sentence

        if (sentences[currentSentence]) {
          console.log("Scheduling next sentence", currentSentence, sentences);
          // Schedule the next sentence
          setTimeout(showNextSentence, sentenceDelay); // Adjust speed as needed
        } else {
          state.readyToAdvance = true; // Allow advancing to the next line
        }
      } else {
        state.readyToAdvance = true; // Allow advancing to the next line
      }
    };
    let sentenceDelay = sentences[currentSentence].length * 35;

    state.textToDisplay = `<span class="character">${sentences[currentSentence]}</span>\n`; // Initialize as the first sentence
    setTimeout(() => emitter.emit("render"), 1);

    currentSentence++; // Move to the next sentence
    setTimeout(showNextSentence, 1000); // Start typing the line
  }

  function startTypewriter(line) {
    const typeNextCharacter = () => {
      if (state.currentCharacter < line.length) {
        let char = line[state.currentCharacter];
        let isWhitespace = char.match(/\s/);
        if (isWhitespace) {
          state.textToDisplay += char;
        } else {
          state.textToDisplay += `<span class="character">${char}</span>`;
        }
        state.currentCharacter++;
        emitter.emit("render"); // Re-render with the next character

        // Schedule the next character
        setTimeout(typeNextCharacter, 35); // Adjust speed as needed
      } else {
        state.readyToAdvance = true; // Allow advancing to the next line
      }
    };

    typeNextCharacter(); // Start typing the line
  }

  function startTypewriterFade(line) {
    state.textToDisplay = ""; // Initialize as an empty string for new text
    const typeNextCharacter = () => {
      state.textToDisplay = ""; // Initialize as an empty string for new text
      for (let i = 0; i < line.length; i++) {
        let char = line[i];
        if (char === "¶") {
          const restOfString = line.slice(i + 1);
          const isRestOfLineWhitespaceOrParagraphSymbol =
            restOfString.match(/^\s*$/) || restOfString.match(/^¶/);
          if (isRestOfLineWhitespaceOrParagraphSymbol) {
            line = line.slice(0, i);
            break;
          } else {
            char = "<p></p>";
          }
        }
        const isWhitespace = char.match(/\s/);
        if (i < state.currentCharacter) {
          // Add raw text for whitespace, and wrap non-whitespace in <span>
          state.textToDisplay += isWhitespace
            ? char // Keep raw whitespace
            : `<span class="character">${char}</span>`; // Wrap non-whitespace characters in spans
        } else {
          // Add raw text for whitespace, and wrap non-whitespace in <span>
          state.textToDisplay += isWhitespace
            ? char // Keep raw whitespace
            : `<span class="character-hidden">${char}</span>`; // Wrap non-whitespace characters in spans
        }
      }
      if (state.currentCharacter < line.length) {
        state.currentCharacter++;
        emitter.emit("render"); // Re-render with the new character

        // Schedule the next character
        setTimeout(typeNextCharacter, 35); // Adjust speed as needed
      } else {
        state.readyToAdvance = true; // Allow advancing to the next line
      }
    };

    typeNextCharacter(); // Start typing the line
  }
}
