import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.scss';
import App from './App.jsx';
import Provides from './context/index.jsx';
import { Provider } from 'react-redux';
import store, { persistor } from './redux/store.js';
import { PersistGate } from 'redux-persist/integration/react';
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Provides>
        <App />
      </Provides>
    </PersistGate>
  </Provider>,
);
