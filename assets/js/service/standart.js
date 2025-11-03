async function initStandartPage() {
  // Логика карусели перенесена в carousel.js
  // Карусель будет инициализирована автоматически через createMenuCarousel

  // Маппинг дней недели и калорийности
  const dayButtons = document.querySelectorAll('.menu-day');
  const typeTabs = document.querySelectorAll('.menu-type-tab');

  const dayMap = {
    'пн': 'Mon',
    'вт': 'Tue',
    'ср': 'Wed',
    'чт': 'Thu',
    'пт': 'Fri',
    'сб': 'Sat'
  };

  let selectedCalories = '900';
  let selectedDay = 'Mon';

  // Загрузка данных
  let menuData = {};
  let dishesData = [];
  
  // Глобальные переменные для доступа к данным меню
  let globalMenuData = {};
  let globalDishesData = [];
  let globalSelectedCalories = '900';
  
  async function loadData() {
    try {
      const { menuData: menu, dishesData: dishes } = await window.loadAllData();
      menuData = menu;
      globalMenuData = menu;
      dishesData = dishes;
      globalDishesData = dishes;
    } catch (error) {
      menuData = {};
      dishesData = [];
    }
  }

  // Получить объект меню по калорийности и дню
  function getMenuForSelection(calories, day) {
    const arr = menuData[calories];
    
    if (!arr) {
      return null;
    }
    
    return arr.find(item => item.dayOfWeek && item.dayOfWeek.toLowerCase().startsWith(day.toLowerCase()));
  }

  // Получить блюдо по id
  function getDishById(id) {
    return window.getDishById(dishesData, id);
  }

  // Генерация карточки - логика перенесена в card.js
  function createMenuCard(dish, mealType) {
    if (!dish) {
      return '';
    }
    
    // Используем функцию из card.js
    if (window.createStandardMenuCard) {
      return window.createStandardMenuCard(dish, mealType);
    } else {
      return `
        <div class="menu-card" data-dish-id="${dish.id}">
          <div class="menu-card-img-wrap">
                            <img src="${window.getDishImage ? window.getDishImage(dish) : (dish.img || 'data/img/food1.jpg')}" alt="${dish.title}" class="menu-card-img">
            <div class="gallery-card-icons">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="gallery-heart icon-heart">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                         4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
                         14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                         6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
                            <span class="menu-card-plus active">−</span>
          </div>
          <div class="menu-card-content">
            <div class="menu-card-title">${mealType}</div>
            <div class="menu-card-macros">${window.formatMacros ? window.formatMacros(dish) : `Б: ${dish.p} г, Ж: ${dish.f} г, В: ${dish.c} г`}</div>
            <div class="menu-card-desc">${dish.title}</div>
          </div>
        </div>
      `;
    }
  }

  // Маппинг типов приёмов пищи к ключам в menu.json и названиям для карточек
  const mealMap = window.MEAL_MAP || [
    { key: 'breakfastId', name: 'Сніданок' },
    { key: 'additionaldishesId', name: 'Додаткова страва' },
    { key: 'sweetbreakfastId', name: 'Солодкий сніданок' },
    { key: 'afternoonsnaskId', name: 'Полуденок' },
    { key: 'sweetafternoonsnaskId', name: 'Солодкий полуденок' },
    { key: 'dinnerdishId', name: 'Обід' },
    { key: 'eveningmealdishId', name: 'Вечеря' }
  ];

  const menuTotal = document.querySelector('.menu-total');

  // Основная функция генерации карточек
  function renderMenuCards() {
    const menuSlider = document.querySelector('.menu-slider');
    const menuTotal = document.querySelector('.menu-total');
    
    if (!menuSlider) {
      return;
    }
    
    menuSlider.innerHTML = '';
    const menuObj = getMenuForSelection(selectedCalories, selectedDay);
    
    if (!menuObj) {
      menuSlider.innerHTML = '<div style="padding:2rem">Немає меню для цього дня.</div>';
      if (menuTotal) menuTotal.textContent = 'Загалом у меню: 0 Білки 0 Жири 0 Вуглеводи.';
      return;
    }
    
    let cardsHTML = '';
    let selectedDishes = [];
    
    mealMap.forEach(meal => {
      if (menuObj[meal.key]) {
        const dish = getDishById(menuObj[meal.key]);
        if (dish) {
          selectedDishes.push(dish);
          cardsHTML += createMenuCard(dish, meal.name);
        }
      }
    });
    
    menuSlider.innerHTML = cardsHTML;
    
    // Подсчёт макронутриентов и калорий
    const totalMacros = window.calculateTotalMacros(selectedDishes);
    const totalKcal = Math.round(window.calculateTotalCalories(selectedDishes));
    
    if (menuTotal) {
      menuTotal.textContent = `Загалом у меню: ${totalMacros.protein} Білки ${totalMacros.fat} Жири ${totalMacros.carbs} Вуглеводи, ${totalKcal} ккал.`;
    }
    
    attachCardEvents();
  }

  // Восстановление интерактивности для сердечек и плюсиков
  function attachCardEvents() {
    // Сердечки обрабатываются универсальным HeartsManager
    if (window.heartsManager) {
      window.heartsManager.refresh();
    }
    
    // Добавляем обработчики для плюсиков/минусов с небольшой задержкой
    setTimeout(() => {
      const plusIcons = document.querySelectorAll('.menu-card-plus');
      plusIcons.forEach(plus => {
        plus.addEventListener('click', function() {
          // Переключаем состояние
          const isCurrentlyActive = this.classList.contains('active');
          
          if (isCurrentlyActive) {
            // Если активно (красный минус), то убираем из меню
            this.classList.remove('active');
            this.textContent = '+';
          } else {
            // Если неактивно (зеленый плюс), то добавляем в меню
            this.classList.add('active');
            this.textContent = '−';
          }
        });
      });
    }, 10);
  }

  // Функция для получения выбранных блюд
  function getSelectedDishes() {
    const selectedDishes = [];
    const dayMap = {
      'Mon': 'Пн',
      'Tue': 'Вт', 
      'Wed': 'Ср',
      'Thu': 'Чт',
      'Fri': 'Пт',
      'Sat': 'Сб'
    };

    // Проходим по всем дням недели
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    allDays.forEach(day => {
      // Получаем меню для этого дня
      const menuObj = getMenuForSelection(globalSelectedCalories, day);
      if (menuObj) {
        // Получаем все блюда для этого дня
        mealMap.forEach(meal => {
          if (menuObj[meal.key]) {
            const dish = getDishById(menuObj[meal.key]);
            if (dish) {
              // Проверяем, есть ли карточка с этим блюдом на странице
              const cardElement = document.querySelector(`[data-dish-id="${dish.id}"]`);
              if (cardElement) {
                // Проверяем состояние плюсика/минуса
                const plusButton = cardElement.querySelector('.menu-card-plus');
                if (plusButton && plusButton.classList.contains('active')) {
                  // Если плюсик активен (минус), значит блюдо включено в меню
                  selectedDishes.push({
                    ...dish,
                    day: day.toLowerCase(),
                    dayName: dayMap[day],
                    quantity: 1
                  });
                }
              } else {
                // Если карточки нет на странице, добавляем блюдо по умолчанию
                selectedDishes.push({
                  ...dish,
                  day: day.toLowerCase(),
                  dayName: dayMap[day],
                  quantity: 1
                });
              }
            }
          }
        });
      }
    });

    return selectedDishes;
  }

  // Функция для сохранения шаблона в корзину
  function saveTemplateToCart() {
    const selectedDishes = getSelectedDishes();
    
    if (selectedDishes.length === 0) {
      showWarning('Будь ласка, залиште хоча б одну страву в меню');
      return;
    }

    // Используем CartManager для добавления блюд в корзину
    if (window.cartManager) {
      const calories = globalSelectedCalories || 'Стандартне';
      window.cartManager.addOrder(selectedDishes, `Меню на ${calories} ккал`);
    } else {
      // Fallback для случая, если CartManager не загружен
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      selectedDishes.forEach(dish => {
        const existingDishIndex = cart.findIndex(item => 
          item.id === dish.id && item.day === dish.day
        );
        
        if (existingDishIndex !== -1) {
          cart[existingDishIndex].quantity += 1;
        } else {
          cart.push({
            ...dish,
            quantity: 1
          });
        }
      });

      localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Перенаправляем в корзину с правильным путем
    let cartPath = window.getPagePath('cart');
    
    window.location.href = cartPath;
  }

  // Обработчик для кнопки "Обрати це меню"
  const chooseBtn = document.querySelector('.menu-choose-btn');
  if (chooseBtn) {
    // Удаляем существующие обработчики, чтобы избежать дублирования
    chooseBtn.removeEventListener('click', saveTemplateToCart);
    chooseBtn.addEventListener('click', saveTemplateToCart);
  }

  // Обработчики для дней недели
  dayButtons.forEach(button => {
    button.addEventListener('click', function() {
      dayButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      const dayText = this.textContent.toLowerCase();
      selectedDay = dayMap[dayText] || 'Mon';
      renderMenuCards();
    });
  });

  // Обработчики для калорийности
  typeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      typeTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      selectedCalories = this.textContent.trim();
      globalSelectedCalories = selectedCalories;
      renderMenuCards();
    });
  });

  // Загрузка данных и первичный рендер
  await loadData();
  renderMenuCards();
}

// Экспорт функций для использования в main.js
window.initStandartPage = initStandartPage;