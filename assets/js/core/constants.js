// ===== КОНСТАНТЫ ПРОЕКТА =====

// API эндпоинты
const API_ENDPOINTS = {
  // Пользователи
  REGISTRATION: '/user/registration',
  LOGIN: '/user/login',
  PROFILE: '/user/profile',
  
  // Избранное
  FAVORITE_ADD: '/user/favorite/add',
  FAVORITE_REMOVE: '/user/favorite/remove',
  FAVORITE_GET: '/user/favorite',
  FAVORITE_CLEAR: '/user/favorite/clear',
  
  // Корзина
  CART_ADD: '/cart/add',
  CART_REMOVE: '/cart/remove',
  CART_GET: '/cart/get',
  CART_CLEAR: '/cart/clear'
};

// Ключи localStorage
const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_NAME: 'userName',
  CART: 'cart',
  HEARTS_STATE: 'heartsState',
  CALCULATOR_DATA: 'calculatorData',
  PROFILE_DATA: 'profileData'
};

// Пути к файлам данных
const DATA_PATHS = {
  MENU: 'data/datafiles/menu.json',
  DISHES: 'data/datafiles/dishes.json'
};

// Настройки сервера
const SERVER_SETTINGS = {
  serverBaseUrl: '__SERVER_URL__',
  apiVersion: '1.0',
  timeout: 5000,
  retryAttempts: 3
};

// CSS селекторы
const SELECTORS = {
  // Сердечки
  HEARTS: [
    '.gallery-heart',
    '.gallery-heart-alt', 
    '.menu-card-heart',
    '.menu-card-heart-alt',
    '.menu-constructor-card-heart',
    '.menu-constructor-card-heart-alt'
  ],
  
  // Карточки
  CARDS: [
    '.gallery-card',
    '.menu-card',
    '.menu-card-alt',
    '.menu-constructor-card',
    '.menu-constructor-card-alt'
  ],
  
  // Формы
  FORMS: {
    LOGIN: '#loginForm',
    REGISTER: '#registerForm',
    CALCULATOR: '#calculator-form',
    ORDER: '#order-form'
  }
};

// Типы меню
const MENU_TYPES = [900, 1200, 1600, 1800, 2500, 3000, 3500];

// Коэффициенты активности для расчета калорий
const ACTIVITY_FACTORS = {
  '1': 1.2,    // Очень низкая
  '2': 1.375,  // Низкая
  '3': 1.55,   // Средняя
  '4': 1.725,  // Высокая
  '5': 1.9     // Очень высокая
};

// Дни недели
const DAYS_OF_WEEK = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday'
};

// Маппинг дней для API
const DAY_MAP = {
  'monday': 'Mon',
  'tuesday': 'Tue',
  'wednesday': 'Wed',
  'thursday': 'Thu',
  'friday': 'Fri',
  'saturday': 'Sat',
  'sunday': 'Sun'
};

// HTTP статусы
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// Максимальная длина имени пользователя
const MAX_USERNAME_LENGTH = 8;

// Fallback изображение
const FALLBACK_IMAGE = 'data/img/food1.jpg';

// Маппинг приёмов пищи
const MEAL_MAP = [
  { key: 'breakfastId', name: 'Сніданок' },
  { key: 'additionaldishesId', name: 'Додаткова страва' },
  { key: 'sweetbreakfastId', name: 'Солодкий сніданок' },
  { key: 'afternoonsnaskId', name: 'Полуденок' },
  { key: 'sweetafternoonsnaskId', name: 'Солодкий полуденок' },
  { key: 'dinnerdishId', name: 'Обід' },
  { key: 'eveningmealdishId', name: 'Вечеря' }
];

// Маппинг типов меню
const TYPE_MAP = {
  'сніданок': 'breakfast',
  'полуденок': 'afternoonsnask',
  'обід': 'dinnerdish',
  'вечеря': 'eveningmealdish'
};

// Экспорт в глобальную область
window.API_ENDPOINTS = API_ENDPOINTS;
window.STORAGE_KEYS = STORAGE_KEYS;
window.DATA_PATHS = DATA_PATHS;
window.SERVER_SETTINGS = SERVER_SETTINGS;
window.SELECTORS = SELECTORS;
window.MENU_TYPES = MENU_TYPES;
window.ACTIVITY_FACTORS = ACTIVITY_FACTORS;
window.DAYS_OF_WEEK = DAYS_OF_WEEK;
window.DAY_MAP = DAY_MAP;
window.HTTP_STATUS = HTTP_STATUS;
window.MAX_USERNAME_LENGTH = MAX_USERNAME_LENGTH;
window.FALLBACK_IMAGE = FALLBACK_IMAGE;
window.MEAL_MAP = MEAL_MAP;
window.TYPE_MAP = TYPE_MAP;
