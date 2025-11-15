// ===== УТИЛИТАРНЫЕ ФУНКЦИИ =====

// ===== РАБОТА С LOCALSTORAGE =====

/**
 * Безопасное получение данных из localStorage
 */
function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    
    return defaultValue;
  }
}

/**
 * Безопасное сохранение данных в localStorage
 */
function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    
    return false;
  }
}

/**
 * Удаление данных из localStorage
 */
function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    
    return false;
  }
}

// ===== РАБОТА С ПОЛЬЗОВАТЕЛЕМ =====

/**
 * Получение ID пользователя
 */
function getUserId() {
  return getStorageItem(window.STORAGE_KEYS?.USER_ID || 'userId');
}

/**
 * Получение имени пользователя
 */
function getUserName() {
  return getStorageItem(window.STORAGE_KEYS?.USER_NAME || 'userName');
}

/**
 * Проверка авторизации пользователя
 */
function isUserAuthenticated() {
  return !!getUserId() && !!getUserName();
}

/**
 * Обрезка имени пользователя до максимальной длины
 */
function truncateUsername(username) {
  if (!username) return '';
  const maxLength = window.MAX_USERNAME_LENGTH || 8;
  return username.length > maxLength 
    ? username.substring(0, maxLength) + '...' 
    : username;
}

// ===== РАБОТА С ИЗОБРАЖЕНИЯМИ =====

/**
 * Получение изображения блюда с fallback
 */
function getDishImage(dish, fallbackPath = null) {
  if (!dish) {

    const fallback = fallbackPath || window.FALLBACK_IMAGE || 'data/img/food1.jpg';
    return getCorrectImagePath(fallback);
  }
  
  const fallback = fallbackPath || window.FALLBACK_IMAGE || 'data/img/food1.jpg';
  const imagePath = dish.img || fallback;
  const correctedPath = getCorrectImagePath(imagePath);
  
  return correctedPath;
}

/**
 * Получение правильного пути к изображению в зависимости от текущего расположения
 */
function getCorrectImagePath(imagePath) {
  if (!imagePath) return '';
  
  // Если путь уже абсолютный или начинается с http, возвращаем как есть
  if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Определяем правильный путь в зависимости от текущего расположения
  const path = window.location.pathname;
  let result = imagePath;
  
  if (path.includes('/pages/main/')) {
    // Мы в подпапке pages/main/
    if (imagePath.startsWith('data/')) {
      result = '../../' + imagePath;
    }
  } else {
    // Мы в корне сайта
    if (imagePath.startsWith('data/')) {
      result = imagePath;
    }
  }
  
  return result;
}

// ===== ФОРМАТИРОВАНИЕ =====

/**
 * Форматирование макронутриентов
 */
function formatMacros(dish) {
  if (!dish) {

    return '';
  }
  
  return `Б: ${dish.p || 0} г, Ж: ${dish.f || 0} г, В: ${dish.c || 0} г`;
}

/**
 * Форматирование калорий
 */
function formatCalories(calories) {
  return `${Math.round(calories)} ккал`;
}

/**
 * Форматирование цены
 */
function formatPrice(price) {
  return `${price} ₴`;
}

// ===== РАСЧЕТЫ =====

/**
 * Расчет калорий по формуле Харриса-Бенедикта
 */
function calculateCalories({ gender, age, weight, height, activity, goal }) {
  // BMR (Basal Metabolic Rate)
  let bmr;
  if (gender === 'male') {
    bmr = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
  } else {
    bmr = 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age);
  }
  
  // Применяем коэффициент активности
  const activityFactors = window.ACTIVITY_FACTORS || {
    '1': 1.2, '2': 1.375, '3': 1.55, '4': 1.725, '5': 1.9
  };
  let calories = bmr * (activityFactors[activity] || 1.2);
  
  // Корректировка по цели
  if (goal === 'lose') {
    calories -= 300; // Для похудения
  } else if (goal === 'gain') {
    calories += 300; // Для набора
  }
  
  return Math.round(calories);
}

/**
 * Поиск ближайшего типа меню по калориям
 */
function getClosestMenuType(calories) {
  const menuTypes = window.MENU_TYPES || [900, 1200, 1600, 1800, 2500, 3000, 3500];
  return menuTypes.reduce((prev, curr) => 
    Math.abs(curr - calories) < Math.abs(prev - calories) ? curr : prev
  );
}

/**
 * Расчет калорий из макронутриентов
 */
function calculateCaloriesFromMacros(protein, fat, carbs) {
  return (protein * 4) + (fat * 9) + (carbs * 4);
}

// ===== ВАЛИДАЦИЯ =====

/**
 * Валидация email
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидация телефона
 */
function validatePhone(phone) {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Валидация числового поля
 */
function validateNumberInput(input) {
  const value = parseInt(input.value);
  const min = parseInt(input.min);
  const max = parseInt(input.max);
  
  if (input.value && (value < min || value > max)) {
    return false;
  }
  return true;
}

/**
 * Расширенная валидация числового поля с отображением ошибок
 */
function validateNumberInputWithErrors(input) {
  const inputField = input.closest('.input-field');
  const errorElement = inputField?.querySelector('.error-message');
  const value = parseInt(input.value);
  
  // Убираем класс ошибки по умолчанию
  if (inputField) {
    inputField.classList.remove('error');
  }
  if (errorElement) {
    errorElement.textContent = '';
  }
  
  // Проверяем минимальные значения
  if (input.value !== '' && value < parseInt(input.min)) {
    if (inputField) {
      inputField.classList.add('error');
    }
    
    if (errorElement) {
      let errorText = '';
      if (input.name === 'age') {
        errorText = `Мінімальний вік: ${input.min} років`;
      } else if (input.name === 'weight') {
        errorText = `Мінімальна вага: ${input.min} кг`;
      } else if (input.name === 'height') {
        errorText = `Мінімальний зріст: ${input.min} см`;
      }
      
      errorElement.textContent = errorText;
    }
    return false;
  }
  
  // Проверяем максимальные значения
  if (input.value !== '' && value > parseInt(input.max)) {
    if (inputField) {
      inputField.classList.add('error');
    }
    
    if (errorElement) {
      let errorText = '';
      if (input.name === 'age') {
        errorText = `Максимальний вік: ${input.max} років`;
      } else if (input.name === 'weight') {
        errorText = `Максимальна вага: ${input.max} кг`;
      } else if (input.name === 'height') {
        errorText = `Максимальний зріст: ${input.max} см`;
      }
      
      errorElement.textContent = errorText;
    }
    return false;
  }
  
  return true;
}

/**
 * Валидация обязательных полей формы
 */
function validateRequiredFields(form) {
  const inputs = form.querySelectorAll('input[required]');
  for (let input of inputs) {
    if ((input.type === 'radio' && !input.checked) || 
        (input.type !== 'radio' && !input.value.trim())) {
      return false;
    }
  }
  return true;
}

// ===== РАБОТА С ДАТАМИ =====

/**
 * Получение дня недели по индексу
 */
function getDayByIndex(index) {
  const dayMap = window.DAY_MAP || {
    'monday': 'Mon', 'tuesday': 'Tue', 'wednesday': 'Wed',
    'thursday': 'Thu', 'friday': 'Fri', 'saturday': 'Sat', 'sunday': 'Sun'
  };
  const days = Object.values(dayMap);
  return days[index] || days[0];
}

/**
 * Получение меню для конкретного дня
 */
function getMenuForDay(menuArr, day) {
  // Маппинг дней недели
  const dayMap = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };
  
  const targetDay = dayMap[day];
  
  const result = menuArr.find(item => item.dayOfWeek === targetDay) || null;
  
  return result;
}

// ===== DOM УТИЛИТЫ =====

/**
 * Безопасное получение элемента по селектору
 */
function getElement(selector) {
  return document.querySelector(selector);
}

/**
 * Безопасное получение элементов по селектору
 */
function getElements(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Добавление обработчика события с проверкой существования элемента
 */
function addEventListenerSafe(selector, event, handler) {
  const element = getElement(selector);
  if (element) {
    element.addEventListener(event, handler);
    return true;
  }
  
  return false;
}

/**
 * Показ/скрытие элемента
 */
function toggleElement(selector, show) {
  const element = getElement(selector);
  if (element) {
    element.style.display = show ? 'block' : 'none';
    return true;
  }
  return false;
}

// ===== РАБОТА С КАРТОЧКАМИ =====

/**
 * Получение блюда по ID
 */
function getDishById(dishes, id) {
  // Пробуем разные типы сравнения для совместимости
  const dish = dishes.find(d => d.id === id || d.id == id || String(d.id) === String(id));
  
  return dish;
}

/**
 * Подсчет общих макронутриентов для массива блюд
 */
function calculateTotalMacros(dishes) {
  
  const result = dishes.reduce((total, dish) => ({
    protein: total.protein + (Number(dish.p) || 0),
    fat: total.fat + (Number(dish.f) || 0),
    carbs: total.carbs + (Number(dish.c) || 0)
  }), { protein: 0, fat: 0, carbs: 0 });
  
  return result;
}

function calculateCaloriesFromMacros(protein, fat, carbs) {
  return (Number(protein) * 4) + (Number(fat) * 9) + (Number(carbs) * 4);
}

/**
 * Подсчет общих калорий для массива блюд
 */
function calculateTotalCalories(dishes) {
  if (!Array.isArray(dishes)) return 0;

  const result = dishes.reduce((total, dish) => {
    if (!dish) return total;
    const calories = (Number(dish.kcal) && Number(dish.kcal) > 0)
      ? Number(dish.kcal)
      : calculateCaloriesFromMacros(dish.p, dish.f, dish.c);

    return total + (calories * (dish.quantity || 1));
  }, 0);
  
  return Math.round(result);
}

// ===== ОБРАБОТКА ОШИБОК =====

/**
 * Логирование ошибок
 */
function logError(message, error = null) {
  
}

/**
 * Логирование предупреждений
 */
function logWarning(message, data = null) {
  
}

/**
 * Логирование информации
 */
function logInfo(message, data = null) {
  // Логирование отключено
}

// ===== АСИНХРОННЫЕ УТИЛИТЫ =====

/**
 * Задержка выполнения
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Повтор попытки выполнения функции
 */
async function retry(fn, maxAttempts = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await delay(delayMs * attempt);
    }
  }
}

/**
 * Глобальний обробник для пошкоджених зображень
 * Встановлює 'onerror' для всіх <img>, щоб замінити пошкоджені посилання на дефолтне зображення.
 */
function setDefaultImageOnError() {
    // Використовуємо константу, якщо вона є
    const fallbackConstant = window.FALLBACK_IMAGE || 'data/img/food1.jpg';
    
    // Отримуємо правильний шлях до fallback
    let defaultImagePath;
    if (window.getPath) {
        // getPath (з path-utils.js) - найкращий варіант
        defaultImagePath = window.getPath(fallbackConstant);
    } else {
        // Запасний варіант, якщо path-utils не завантажився
        defaultImagePath = (window.location.pathname.includes('/pages/main/') ? '../../' : './') + fallbackConstant;
    }

    document.addEventListener('error', function(event) {
        const target = event.target;

        // Перевіряємо, що це <img> і що ми ще не застосували fallback
        if (target.tagName === 'IMG' && !target.hasAttribute('data-fallback-applied')) {
            
            // Встановлюємо атрибут, щоб уникнути нескінченного циклу
            target.setAttribute('data-fallback-applied', 'true');
            
            // Встановлюємо дефолтне зображення
            target.src = defaultImagePath;
        }
    }, true); // Використовуємо "capture phase"
}

// Запускаємо наш обробник
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setDefaultImageOnError);
} else {
  setDefaultImageOnError(); // DOM вже завантажений
}

// Экспорт в глобальную область
window.getStorageItem = getStorageItem;
window.setStorageItem = setStorageItem;
window.removeStorageItem = removeStorageItem;
window.getUserId = getUserId;
window.getUserName = getUserName;
window.isUserAuthenticated = isUserAuthenticated;
window.truncateUsername = truncateUsername;
window.getDishImage = getDishImage;
window.getCorrectImagePath = getCorrectImagePath;
window.formatMacros = formatMacros;
window.formatCalories = formatCalories;
window.formatPrice = formatPrice;
window.calculateCalories = calculateCalories;
window.getClosestMenuType = getClosestMenuType;
window.calculateCaloriesFromMacros = calculateCaloriesFromMacros;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateNumberInput = validateNumberInput;
window.validateNumberInputWithErrors = validateNumberInputWithErrors;
window.validateRequiredFields = validateRequiredFields;
window.getDayByIndex = getDayByIndex;
window.getMenuForDay = getMenuForDay;
window.getElement = getElement;
window.getElements = getElements;
window.addEventListenerSafe = addEventListenerSafe;
window.toggleElement = toggleElement;
window.logError = logError;
window.logWarning = logWarning;
window.logInfo = logInfo;
window.delay = delay;
window.getDishById = getDishById;
window.calculateTotalMacros = calculateTotalMacros;
window.calculateTotalCalories = calculateTotalCalories;
window.retry = retry;
