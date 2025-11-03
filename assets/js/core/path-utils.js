/**
 * ===== PATH-UTILS.JS - УТИЛИТЫ ДЛЯ РАБОТЫ С ПУТЯМИ =====
 * 
 * Этот файл содержит функции для динамического определения правильных путей
 * в зависимости от текущего расположения страницы.
 */

/**
 * Определение базового пути для текущей страницы
 */
function getRootPath() {
  const path = window.location.pathname;
  
  // Если мы в подпапке pages/main/, то нужно вернуться на 2 уровня вверх
  if (path.includes('/pages/main/')) {
    return '../../';
  }
  
  // Если мы в корне сайта
  return './';
}

/** 
 * Получение пути к главной странице
*/
function getHomePath() {
  return getRootPath() + 'index.html';
}

/**
 * Обновление путей в HTML строке
 */
function updatePathsInHtml(html) {
  const path = window.location.pathname;
  
  if (path.includes('/pages/main/')) {
    // Мы в подпапке pages/main/
    return html
      .replace(/href="\/index\.html"/g, 'href="../../index.html"')
      .replace(/href="\/pages\/main\//g, 'href="')
      .replace(/href="index\.html"/g, 'href="../../index.html"')
      .replace(/href="pages\/main\//g, 'href="')
      .replace(/src="\/data\//g, 'src="../../data/')
      .replace(/src="\/assets\//g, 'src="../../assets/')
      .replace(/src="data\//g, 'src="../../data/')
      .replace(/src="assets\//g, 'src="../../assets/');
  } else {
    // Мы в корне сайта
    return html
      .replace(/href="\/index\.html"/g, 'href="index.html"')
      .replace(/href="\/pages\/main\//g, 'href="pages/main/')
      .replace(/src="\/data\//g, 'src="data/')
      .replace(/src="\/assets\//g, 'src="assets/');
  }
}

/**
 * Получение правильного пути к странице (без дублирования)
 */
function getPagePath(pageName) {
  const rootPath = getRootPath();
  
  // Если мы уже в pages/main/, то используем относительные пути
  if (rootPath === '../../') {
    if (pageName === 'index') {
      return rootPath + 'index.html';
    }
    return `${pageName}.html`;
  }
  
  if (pageName === 'index') {
    return 'index.html';
  }
  // Если мы в корне, то добавляем полный путь
  return `pages/main/${pageName}.html`;
}

/**
 * Получение правильного пути к файлу
 */
function getPath(filePath) {
  const basePath = getRootPath();
  return basePath + filePath;
}

/**
 * Получение пути к данным
 */
function getDataPath(fileName) {
  return getPath(`data/datafiles/${fileName}`);
}

/**
 * Получение пути к изображению
 */
function getImagePath(fileName) {
  return getPath(`data/img/${fileName}`);
}

/**
 * Получение пути к CSS файлу
 */
function getCssPath(fileName) {
  return getPath(`assets/css/${fileName}`);
}

/**
 * Получение пути к JS файлу
 */
function getJsPath(fileName) {
  return getPath(`assets/js/${fileName}`);
}



// Экспорт функций для использования в других модулях
window.getRootPath = getRootPath;
window.updatePathsInHtml = updatePathsInHtml;
window.getHomePath = getHomePath;
window.getPath = getPath;
window.getDataPath = getDataPath;
window.getImagePath = getImagePath;
window.getCssPath = getCssPath;
window.getJsPath = getJsPath;
window.getPagePath = getPagePath;


