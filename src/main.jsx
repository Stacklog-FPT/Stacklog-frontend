import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.scss';
import App from './App.jsx';
import Provides from './context/index.jsx';
import { Provider } from 'react-redux';
import store from './redux/store.js';
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Provides>
      <App />
    </Provides>
  </Provider>,
);
