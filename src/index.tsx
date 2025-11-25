import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Display mock mode info in console
console.log('%c═══════════════════════════════════════════════════════════════', 'color: #2196F3; font-weight: bold;');
console.log('%c  АДМИН-ПАНЕЛЬ - РЕЖИМ ТЕСТИРОВАНИЯ С МОК-ДАННЫМИ', 'color: #2196F3; font-weight: bold; font-size: 14px;');
console.log('%c═══════════════════════════════════════════════════════════════', 'color: #2196F3; font-weight: bold;');
console.log('%c✅ Админ-панель настроена для работы БЕЗ backend!', 'color: #4CAF50; font-weight: bold;');
console.log('');
console.log('%c📝 ДАННЫЕ ДЛЯ ВХОДА:', 'color: #FF9800; font-weight: bold;');
console.log('   Телефон: %c+79999999999', 'color: #2196F3; font-weight: bold;');
console.log('   Пароль:  %cadmin123', 'color: #2196F3; font-weight: bold;');
console.log('');
console.log('%c📊 ДОСТУПНЫЕ ТЕСТОВЫЕ ДАННЫЕ:', 'color: #FF9800; font-weight: bold;');
console.log('   • Заказы:        3 шт');
console.log('   • Пользователи:  5 шт');
console.log('   • Платежи:       2 шт');
console.log('   • Тикеты:        3 шт');
console.log('   • Аналитика:     Полная статистика');
console.log('');
console.log('%c⚠️  ВАЖНО:', 'color: #f44336; font-weight: bold;');
console.log('   • Все изменения НЕ сохраняются при перезагрузке');
console.log('   • Backend НЕ требуется для тестирования');
console.log('');
console.log('%c📖 Подробная инструкция: см. TESTING.md', 'color: #9C27B0;');
console.log('%c═══════════════════════════════════════════════════════════════', 'color: #2196F3; font-weight: bold;');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
