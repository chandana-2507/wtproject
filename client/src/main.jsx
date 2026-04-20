import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import App from './App';
import './index.css';
import { useAuthBootstrap } from './hooks/useAuth';

function Root() {
  useAuthBootstrap();
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm',
          style: { background: '#0f172a', color: '#f8fafc' },
        }}
      />
      <Root />
    </BrowserRouter>
  </Provider>
);
