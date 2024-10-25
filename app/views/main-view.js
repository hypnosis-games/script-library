export default function MainView(state, emit) {
  console.log("Rendering MainView with state:", state);
  let { scriptName } = state.params;
  if (!scriptName) {
    scriptName = 'you-want-to-be-hypnotized';
  }
  if (!state.currentScript) {
    emit('load-script', scriptName);
    return html`<div class="loading-screen">Loading...</div>`;
  }

  const tapOrClickHandler = () => {
    emit('advance-line');
  };

  return html`
    <div 
      class="fullscreen-container" 
      onpointerdown=${tapOrClickHandler} 
      onmousedown=${tapOrClickHandler} 
      ontouchstart=${tapOrClickHandler} 
      tabindex="0"
    >
      <div class="centered-text">
        ${state.textToDisplay
          .split('\n') // Split the text by `\n` to create paragraphs
          .map(line => html`<p class="paragraph">${html([line])}</p>`)} <!-- Render each line in <p> -->
      </div>
    </div>
  `;
}
