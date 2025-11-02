async function initConstructorPage() {
  // Логика карусели перенесена в carousel.js
  // Карусель будет инициализирована автоматически через createMenuCarousel

  const typeTabs = document.querySelectorAll('.menu-type-tab');
  let currentType = 'breakfast';

  // Маппинг вкладок к type в dishes.json
  const typeMap = window.TYPE_MAP || {
    'сніданок': 'breakfast',
    'полуденок': 'afternoonsnask',
    'обід': 'dinnerdish',
    'вечеря': 'eveningmealdish'
  };

  // Загрузка блюд
  let dishesData = [];
  async function loadDishes() {
    try {
      dishesData = await window.loadDishesData();
    } catch (error) {
      dishesData = [];
    }
  }

  // Сохраняем состояние плюса/минуса для каждого блюда по id и дню недели
  const cardState = {};
  let currentDay = 'monday';
  
  // Инициализируем cardState для всех дней недели (с понедельника по субботу)
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  days.forEach(day => {
    cardState[day] = {};
  });

  // Логика создания карточек перенесена в card.js
  function createMenuCard(dish) {
    if (!cardState[currentDay]) cardState[currentDay] = {};
    
    // По умолчанию все блюда НЕ выбраны (неактивны)
    if (cardState[currentDay][dish.id] === undefined) {
      cardState[currentDay][dish.id] = false;
    }
    
    const isActive = cardState[currentDay][dish.id] === true;
    
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
          <span class="menu-card-plus${isActive ? ' active' : ''}" data-dish-id="${dish.id}">${isActive ? '−' : '+'}</span>
        </div>
        <div class="menu-card-content">
          <div class="menu-card-title">${dish.title}</div>
          <div class="menu-card-macros">${window.formatMacros ? window.formatMacros(dish) : `Б: ${dish.p} г, Ж: ${dish.f} г, В: ${dish.c} г`}</div>
          <div class="menu-card-desc">${dish.subtitle || ''}</div>
        </div>
      </div>
    `;
  }

  function renderCards(type) {
    const menuSlider = document.querySelector('.menu-slider');
    if (!menuSlider) return;
    
    menuSlider.innerHTML = '';
    const filtered = dishesData.filter(d => d.type === type);
    if (filtered.length === 0) {
      menuSlider.innerHTML = '<div style="padding:2rem">Немає страв для цієї категорії.</div>';
      return;
    }
    menuSlider.innerHTML = filtered.map(createMenuCard).join('');
    attachCardEvents();
  }

  function attachCardEvents() {
    // Сердечки обрабатываются универсальным HeartsManager
    if (window.heartsManager) {
      window.heartsManager.refresh();
    }
    
    document.querySelectorAll('.menu-card-plus').forEach(plus => {
      plus.addEventListener('click', function() {
        const dishId = this.getAttribute('data-dish-id');
        
        if (!cardState[currentDay]) cardState[currentDay] = {};
        
        // Переключаем состояние
        const isCurrentlyActive = this.classList.contains('active');
        
        if (isCurrentlyActive) {
          // Если активно (красный минус), то убираем из меню
          this.classList.remove('active');
          this.textContent = '+';
          cardState[currentDay][dishId] = false;
        } else {
          // Если неактивно (зеленый плюс), то добавляем в меню
          this.classList.add('active');
          this.textContent = '−';
          cardState[currentDay][dishId] = true;
        }
        
        updateTotal();
      });
    });
  }

  // Функция для обновления общего количества выбранных блюд
  function updateTotal() {
    const selectedDishes = getSelectedDishes();
    const totalElement = document.querySelector('.menu-total');
    
    if (totalElement && selectedDishes.length > 0) {
      // Подсчитываем общие макронутриенты и калории
      const totalMacros = window.calculateTotalMacros(selectedDishes);
      const totalCalories = Math.round(window.calculateTotalCalories(selectedDishes));
      
      totalElement.textContent = `Загалом у меню: ${totalMacros.protein} Білки ${totalMacros.fat} Жири ${totalMacros.carbs} Вуглеводи, ${totalCalories} ккал.`;
    } else if (totalElement) {
      totalElement.textContent = 'Загалом у меню: 0 Білки 0 Жири 0 Вуглеводи, 0 ккал.';
    }
  }

  // Функция для получения выбранных блюд
  function getSelectedDishes() {
    const selectedDishes = [];
    const dayMap = {
      'monday': 'Пн',
      'tuesday': 'Вт', 
      'wednesday': 'Ср',
      'thursday': 'Чт',
      'friday': 'Пт',
      'saturday': 'Сб'
    };

    // Проходим по всем дням недели
    Object.keys(cardState).forEach(day => {
      if (cardState[day]) {
        Object.keys(cardState[day]).forEach(dishId => {
          if (cardState[day][dishId] === true) {
            const dish = dishesData.find(d => d.id == dishId);
            if (dish) {
              const dishWithDay = {
                ...dish,
                day: day,
                dayName: dayMap[day],
                quantity: 1
              };
              selectedDishes.push(dishWithDay);
            }
          }
        });
      }
    });

    return selectedDishes;
  }

  // Функция для проверки минимального количества дней
  function checkMinimumDays(selectedDishes) {
    const uniqueDays = new Set(selectedDishes.map(dish => dish.day));
    const daysCount = uniqueDays.size;
    
    
    
    if (daysCount < 3) {
      const remainingDays = 3 - daysCount;
      const dayNames = {
        1: 'день',
        2: 'дні',
        3: 'днів'
      };
      
      const dayMap = {
        'monday': 'Понеділок',
        'tuesday': 'Вівторок',
        'wednesday': 'Середа',
        'thursday': 'Четвер',
        'friday': 'П\'ятниця',
        'saturday': 'Субота'
      };
      
      const selectedDayNames = Array.from(uniqueDays).map(day => dayMap[day]).join(', ');
      
      
      showWarning(`Мінімум потрібно додати страви для 3 днів.\n\nВи додали страви для: ${selectedDayNames}\n\nВам залишилося додати страви ще для ${remainingDays} ${dayNames[remainingDays]}.`);
      return false;
    }
    
    
    return true;
  }

  // Переменная для отслеживания состояния сохранения
  let isSaving = false;

  // Функция для сохранения шаблона в корзину
  function saveTemplateToCart() {
    // Защита от повторного вызова
    if (isSaving) {
      return;
    }
    
    isSaving = true;
    
    const selectedDishes = getSelectedDishes();
    
    if (selectedDishes.length === 0) {
      showWarning('Будь ласка, додайте хоча б одну страву до меню, натиснувши на "+" біля страви');
      isSaving = false;
      return;
    }

    // Проверяем минимальное количество дней
    if (!checkMinimumDays(selectedDishes)) {
      isSaving = false;
      return;
    }

    // Используем CartManager для добавления блюд в корзину
    if (window.cartManager) {
      window.cartManager.addOrder(selectedDishes, 'Меню з конструктора');
      
      // Проверяем, что данные действительно сохранились
      setTimeout(() => {
        const savedOrders = window.cartManager.getOrders();
        
        if (savedOrders.length === 0) {
          showError('Помилка: дані не збереглися в корзині. Спробуйте ще раз.');
          isSaving = false;
          return;
        }
      }, 100);
      
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
    
    // Показываем уведомление об успешном добавлении
    showSuccess(`Успішно додано ${selectedDishes.length} страв до корзини!`);
    
    // Сбрасываем флаг перед перенаправлением
    isSaving = false;
    
    // Перенаправляем в корзину с правильным путем
    const path = window.location.pathname;
    let cartPath;
    
    if (path.includes('/pages/main/')) {
      // Мы в подпапке pages/main/
      cartPath = 'cart.html';
    } else {
      // Мы в корне сайта
      cartPath = 'pages/main/cart.html';
    }
    
    window.location.href = cartPath;
  }

  // Обработчики для вкладок
  typeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      typeTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const typeText = this.textContent.toLowerCase();
      currentType = typeMap[typeText] || 'breakfast';
      renderCards(currentType);
    });
  });

  // Обработчики для дней недели
  const dayButtons = document.querySelectorAll('.menu-day');
  const dayMap = {
    'пн': 'monday',
    'вт': 'tuesday',
    'ср': 'wednesday',
    'чт': 'thursday',
    'пт': 'friday',
    'сб': 'saturday'
  };
  dayButtons.forEach(button => {
    button.addEventListener('click', function() {
      dayButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      const dayText = this.textContent.toLowerCase();
      const newDay = dayMap[dayText] || 'monday';
      
      currentDay = newDay;
      renderCards(currentType);
    });
  });

  // Обработчик для кнопки "Затвердити шаблон"
  const confirmBtn = document.querySelector('.menu-choose-btn');
  if (confirmBtn) {
    // Удаляем существующие обработчики, чтобы избежать дублирования
    confirmBtn.removeEventListener('click', saveTemplateToCart);
    confirmBtn.addEventListener('click', saveTemplateToCart);
  }

  // Загрузка и первичный рендер
  await loadDishes();
  renderCards(currentType);
  updateTotal(); // Обновляем общее количество при загрузке страницы
}

// Экспорт функций для использования в main.js
window.initConstructorPage = initConstructorPage;