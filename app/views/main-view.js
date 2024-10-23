export default function MainView(state, emit) {
    let { scriptName } = state.params;
    if (!scriptName) {
      scriptName = 'you-want-to-be-hypnotized';
    }
    if (!state.currentScript) {
      console.log('Loading script:', scriptName);
      emit('load-script', scriptName);
      return html`<div class="loading-screen">Loading...</div>`;
    }
  
    const tapOrClickHandler = () => {
      console.log('Tapped or clicked');
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
          ${state.textToDisplay.split('\n').map(line => html`<p>${line}</p>`)}
        </div>
      </div>
    `;
  }
  