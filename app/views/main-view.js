import backgroundsDictionary from "../backgrounds-dictionary.js";

export default function MainView (state, emit) {
  if (!state.currentBackground) {
    // set the background to the first one in the dictionary
    state.currentBackgroundFactory = Object.values(backgroundsDictionary)[0];
  }
  /* ───────────────────────── INITIALISATION ─────────────────────────── */
  // one‑time launch of the p5 background
  if (!state._backgroundStarted) {
    state.currentBackgroundFactory();
    state._backgroundStarted = true;
  }

  /* ───────────────────────── ROUTE SETUP ────────────────────────────── */
  let { scriptName } = state.params;
  if (!scriptName) scriptName = "you-want-to-be-hypnotized";

  if (!state.currentScript) {
    emit("load-script", scriptName);
    return html`<div class="loading-screen">Loading...</div>`;
  }

  /* ───────────────────────── EVENT HANDLER ──────────────────────────── */
  const tapOrClickHandler = () => emit("advance-line");

  /* ───────────────────────── RENDER ──────────────────────────────────── */
  return html`
    <div
      class="fullscreen-container"
      onpointerdown=${tapOrClickHandler}
      onmousedown=${tapOrClickHandler}
      ontouchstart=${tapOrClickHandler}
      tabindex="0"
    >
      <div class="centered-text">
        ${
          state.textToDisplay
            .split("\n")       // each explicit newline → paragraph
            .map(
              (line) => html`<div class="paragraph">${html([line])}</div>`
            )
        }
      </div>
    </div>
  `;
}
