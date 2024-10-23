import MainView from './views/main-view.js';
import store from './store/store.js';
console.log('index.js loaded v1');
const choo = Choo({ hash: true });  // Enable hash-based routing
choo.use(store);

// Define routes with and without script name
choo.route('/', MainView);  // Default route for localhost
choo.route('/script-library/:scriptName', MainView);  // Route with script name
choo.route('/script-library', MainView);  // Route without script name
choo.route('/:scriptName', MainView);  // Route with script name
// Mount the app
choo.mount('#app');

window.choo = choo;  // Expose Choo globally for debugging
