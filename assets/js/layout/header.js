

// Загрузка хедера
function loadHeader() {
  const headerElement = document.getElementById('header');
  
  if (headerElement && headerElement.innerHTML.trim() === '') {
    // Используем прямое вставление хедера вместо загрузки из файла
    insertHeaderDirectly();
  }
}

// Используем глобальные функции из path-utils.js
// getBasePath() и updatePathsInHtml() теперь доступны глобально

function insertHeaderDirectly() {
  const path = window.location.pathname;
  
  // Определяем правильные пути в зависимости от текущего расположения
  let homePath, constructorPath, calculatorPath, standartPath, cartPath, logoPath;
  
  homePath = window.getHomePath();
  constructorPath = window.getPagePath('constructor');
  calculatorPath = window.getPagePath('calculator');;
  standartPath = window.getPagePath('standart');
  cartPath = window.getPagePath('cart');
  logoPath = window.getPath('data/img/logo.png');
  
  const headerHTML = `
    <header class="main-header">
        <a href="${homePath}" class="logo-link">
                            <img src="${logoPath}" alt="Logo" class="logo">
        </a>
        <nav class="main-nav" id="mainNav">
            <a href="${homePath}">Головна</a>
            <a href="${constructorPath}">Конструктор меню</a>
            <a href="${calculatorPath}">Калькулятор раціону</a>
            <a href="${standartPath}">Стандартне меню</a>
        </nav>
        <div class="header-actions">
            <a href="${cartPath}" class="icon-button basket-big">
                <svg class="icon-img basket-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6H21L20 14H7L6 6Z" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="9" cy="20" r="1" stroke="#4CAF50" stroke-width="2"/>
                    <circle cx="18" cy="20" r="1" stroke="#4CAF50" stroke-width="2"/>
                    <path d="M9 6V4C9 2.89543 9.89543 2 11 2H16C17.1046 2 18 2.89543 18 4V6" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                </svg>
                0 <span class="currency">₴</span>
            </a>
            <a href="#" class="icon-button icon-button--wide" id="loginBtn">
                <svg class="icon-img user-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2"/>
                    <path d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20" stroke="#fff" stroke-width="2"/>
                </svg>
                Вхід
            </a>
        </div>
        <button class="burger" id="burgerBtn" aria-label="Открыть меню">
          <span></span><span></span><span></span>
        </button>
    </header>
  `;
  document.getElementById('header').innerHTML = headerHTML;
}

// Инициализация при загрузке DOM или немедленно если DOM уже готов
function initHeader() {
  loadHeader();
}

// Поддержка обеих систем - старой и новой
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader);
} else {
  // DOM уже загружен, инициализируем сразу
  initHeader();
}

// Экспорт функций для использования в main.js
window.loadHeader = loadHeader;
window.initHeader = initHeader;

 