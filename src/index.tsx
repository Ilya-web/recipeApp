import React from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/antd.min.css';
import 'index.scss';
import { App } from './components';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
