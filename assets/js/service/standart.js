async function initStandartPage() {
  // Логіка каруселі перенесена в carousel.js
  // Карусель буде ініціалізована автоматично через createMenuCarousel

  // Маппінг днів тижня і калорійності
  const dayButtons = document.querySelectorAll('.menu-day');
  const typeTabs = document.querySelectorAll('.menu-type-tab');
  const weekTabs = document.querySelectorAll('.menu-week-tab'); // Нові кнопки тижнів

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
  let selectedWeek = 1; // Нова змінна для тижня

  // Завантаження даних
  let menuData = {};
  let dishesData = [];

  // Глобальні змінні для доступу до даних меню
  let globalMenuData = {};
  let globalDishesData = [];
  let globalSelectedCalories = '900';
  let globalSelectedWeek = 1;

  async function loadData() {
    try {
      // Використовуємо новий файл menu.json
      const menuResponse = await fetch(window.getDataPath('menu.json'));
      const menu = await menuResponse.json();
      
      const dishesResponse = await fetch(window.getDataPath('dishes.json'));
      const dishes = await dishesResponse.json();
      
      menuData = menu;
      globalMenuData = menu;
      dishesData = dishes;
      globalDishesData = dishes;
    } catch (error) {
      console.error("Помилка завантаження даних:", error);
      menuData = {};
      dishesData = [];
    }
  }

  // Отримати об'єкт меню за калорійністю, днем та ТИЖНЕМ
  function getMenuForSelection(calories, day, week) {
    const menyTypeData = menuData[calories];
    
    if (!menyTypeData || !menyTypeData.menus) {
      return null;
    }
    
    // Нова логіка пошуку з урахуванням weekType
    return menyTypeData.menus.find(item => 
      item.dayOfWeek && item.dayOfWeek.toLowerCase().startsWith(day.toLowerCase()) &&
      item.weekType === week
    );
  }

  // Отримати страву по id
  function getDishById(id) {
    // Використовуємо глобальну функцію, оскільки вона вже є
    return window.getDishById(dishesData, id);
  }

  // Генерація звичайної картки
  function createMenuCard(dish, mealType) {
    if (!dish) {
      return '';
    }

    const dishKcal = (Number(dish.kcal) && Number(dish.kcal) > 0)
      ? dish.kcal
      : window.calculateCaloriesFromMacros(dish.p, dish.f, dish.c);
    
    // Використовуємо window.createStandardMenuCard, якщо він існує
    if (window.createStandardMenuCard) {
      // Переконуємося, що ми передаємо правильні дані в існуючу функцію
      // (можливо, їй потрібен лише dish і mealType, а kcal вона бере сама)
      // Для надійності, використовуємо fallback, який ми точно контролюємо
    }
    
    // Fallback, якщо createStandardMenuCard не знайдено або для гарантії
    return `
      <div class="menu-card" data-dish-id="${dish.id}">
        <div class="menu-card-img-wrap">
          <img src="${window.getDishImage ? window.getDishImage(dish) : (dish.img || 'data/img/food1.jpg')}" alt="${dish.title}" class="menu-card-img">
          <div class="gallery-card-icons">
            ${window.heartIconSVG || '<svg></svg>'}
          </div>
          <span class="menu-card-plus active" data-dish-id="${dish.id}" data-meal-type="${mealType}">−</span>
        </div>
        <div class="menu-card-content">
          <div class="menu-card-title">${mealType}</div>
          <div class="menu-card-macros">${window.formatMacros ? window.formatMacros(dish) : ''} (${dishKcal} ккал)</div>
          <div class="menu-card-desc">${dish.title}</div>
        </div>
      </div>
    `;
  }

  // Нова функція для генерації картки з вибором (радіокнопка)
  function createChoiceMenuCard(dish, mealType, choiceGroupName, isChecked, dishId) {
    if (!dish) return '';

    const dishKcal = (Number(dish.kcal) && Number(dish.kcal) > 0)
      ? dish.kcal
      : window.calculateCaloriesFromMacros(dish.p, dish.f, dish.c);

    return `
        <label class="menu-card-choice-option" data-dish-id="${dishId}">
            <input type="radio" name="${choiceGroupName}" ${isChecked ? 'checked' : ''} data-dish-id="${dishId}">
            <div class="menu-card-content">
                <div class="menu-card-title">${dish.title}</div>
                <div class="menu-card-macros">${window.formatMacros(dish)} (${dishKcal} ккал)</div>
                <div class="menu-card-desc">${dish.subtitle || ''}</div>
            </div>
        </label>
    `;
  }


  // Маппінг типів прийомів їжі
  const mealMap = window.MEAL_MAP || [
    { key: 'breakfastId', name: 'Сніданок' },
    { key: 'additionaldishesId', name: 'Додаткова страва' },
    { key: 'sweetbreakfastId', name: 'Солодкий сніданок' },
    { key: 'afternoonsnaskId', name: 'Полуденок' },
    { key: 'sweetafternoonsnaskId', name: 'Солодкий полуденок' },
    { key: 'dinnerdishId', name: 'Обід' },
    { key: 'eveningmealdishId', name: 'Вечеря' }
  ];

  // Основна функція генерації карток
  function renderMenuCards() {
    const menuSlider = document.querySelector('.menu-slider');
    const menuTotal = document.querySelector('.menu-total');
    
    if (!menuSlider) return;
    
    menuSlider.innerHTML = '';
    const menuObj = getMenuForSelection(selectedCalories, selectedDay, selectedWeek);

    const currentMenuTypeData = menuData[selectedCalories];
    const currentPrice = (currentMenuTypeData && currentMenuTypeData.price) ? currentMenuTypeData.price : 0;
    
    if (!menuObj) {
      menuSlider.innerHTML = '<div style="padding:2rem">Немає меню для цього дня та тижня.</div>';
      if (menuTotal) menuTotal.textContent = 'Загалом у меню: 0 Білки 0 Жири 0 Вуглеводи.';
      return;
    }
    
    let cardsHTML = '';
    let dishesForTotalCalc = []; // Тільки ті страви, що увійдуть в меню
    
    mealMap.forEach(meal => {
        const mealKey = meal.key; // e.g., 'breakfastId'
        const choiceKey = `chose${meal.key.replace('Id', '').toLowerCase()}`; // e.g., 'chosebreakfast'

        if (menuObj[mealKey]) {
            const dishIdOrArray = menuObj[mealKey];

            if (Array.isArray(dishIdOrArray)) {
                // Це масив страв
                if (menuObj[choiceKey] === true) {
                    // === ВИПАДОК 1: КОРИСТУВАЧ МАЄ ОБРАТИ ОДНУ ===
                    const choiceGroupName = `choice-${selectedDay}-${mealKey}`;
                    cardsHTML += `<div class="menu-card-choice-group" data-meal-type="${meal.name}" data-choice-group="${choiceGroupName}">`;
                    cardsHTML += `<legend>Оберіть один ${meal.name.toLowerCase()}:</legend>`;
                    
                    let firstDish = null; // Для розрахунку калорій "за замовчуванням"
                    
                    dishIdOrArray.forEach((dishId, index) => {
                        const dish = getDishById(dishId);
                        if (dish) {
                            if (index === 0) firstDish = dish; // Додаємо першу страву до підрахунку
                            // Передаємо dish.id в createChoiceMenuCard
                            cardsHTML += createChoiceMenuCard(dish, meal.name, choiceGroupName, index === 0, dish.id);
                        }
                    });
                    
                    if(firstDish) dishesForTotalCalc.push(firstDish); // Додаємо обрану за замовчуванням
                    cardsHTML += `</div>`;

                } else {
                    // === ВИПАДОК 2: ВСІ СТРАВИ З МАСИВУ ВКЛЮЧЕНІ ===
                    dishIdOrArray.forEach(dishId => {
                        const dish = getDishById(dishId);
                        if (dish) {
                            dishesForTotalCalc.push(dish);
                            cardsHTML += createMenuCard(dish, meal.name);
                        }
                    });
                }
            } else {
                // === ВИПАДОК 3: ОДНА СТРАВА (ЗВИЧАЙНИЙ ID) ===
                const dish = getDishById(dishIdOrArray);
                if (dish) {
                    dishesForTotalCalc.push(dish);
                    cardsHTML += createMenuCard(dish, meal.name);
                }
            }
        }
    });
    
    menuSlider.innerHTML = cardsHTML;
    
    // Підрахунок макронутрієнтів і калорій
    updateTotalCalories(dishesForTotalCalc, currentPrice);
    
    attachCardEvents();
  }

  // Функція оновлення загальних калорій
  function updateTotalCalories(dishes, price) {
      const menuTotal = document.querySelector('.menu-total');
      // Використовуємо глобальні функції для розрахунку
      const totalMacros = window.calculateTotalMacros(dishes);
      const totalKcal = Math.round(window.calculateTotalCalories(dishes));
      
      if (menuTotal) {
          menuTotal.textContent = `Загалом у меню: ${totalMacros.protein} Білки ${totalMacros.fat} Жири ${totalMacros.carbs} Вуглеводи, ${totalKcal} ккал. Ціна: ${price} грн/день.`;
      }
  }

  // Восстановление интерактивности
  function attachCardEvents() {
    // Сердечки
    if (window.heartsManager) {
      window.heartsManager.refresh();
    }
    
    // Плюсики/мінуси (для звичайних карток)
    document.querySelectorAll('.menu-card-plus').forEach(plus => {
      plus.addEventListener('click', function() {
        this.classList.toggle('active');
        this.textContent = this.classList.contains('active') ? '−' : '+';
        updateTotalAfterToggle(); // Оновлюємо загальну суму
      });
    });

    // Радіокнопки (для карток вибору)
    document.querySelectorAll('.menu-card-choice-group input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalAfterToggle(); // Оновлюємо загальну суму
        });
    });
  }

  // Оновлення загальної суми при будь-якій зміні
  function updateTotalAfterToggle() {
      const selectedDishes = getSelectedDishesFromDOM();
      const price = (globalMenuData[selectedCalories] && globalMenuData[selectedCalories].price) ? globalMenuData[selectedCalories].price : 0;
      updateTotalCalories(selectedDishes, price);
  }

  // Нова функція для отримання обраних страв ПРЯМО З DOM
  function getSelectedDishesFromDOM() {
      const selectedDishes = [];
      const menuSlider = document.querySelector('.menu-slider');
      if (!menuSlider) return [];

      // 1. Збираємо звичайні картки (з плюсиками)
      menuSlider.querySelectorAll('.menu-card-plus.active').forEach(plus => {
          const dishId = plus.getAttribute('data-dish-id');
          const dish = getDishById(dishId);
          if (dish) {
              selectedDishes.push(dish);
          }
      });

      // 2. Збираємо картки з вибором (радіокнопки)
      menuSlider.querySelectorAll('.menu-card-choice-group').forEach(group => {
          const checkedRadio = group.querySelector('input[type="radio"]:checked');
          if (checkedRadio) {
              // Отримуємо ID страви з радіокнопки або її батьківського <label>
              const dishId = checkedRadio.getAttribute('data-dish-id') || checkedRadio.closest('[data-dish-id]').getAttribute('data-dish-id');
              const dish = getDishById(dishId);
              if (dish) {
                  selectedDishes.push(dish);
              }
          }
      });

      return selectedDishes;
  }

  // Функція для отримання всіх обраних страв за ВСІ дні (для кошика)
  // !!! ОНОВЛЕНА ЛОГІКА (ВИПРАВЛЕНА) !!!
  function getAllSelectedDishesForCart() {
    const allSelectedDishes = [];
    const dayMap = {
      'Mon': 'Пн', 'Tue': 'Вт', 'Wed': 'Ср',
      'Thu': 'Чт', 'Fri': 'Пт', 'Sat': 'Сб'
    };
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 1. Отримуємо страви, обрані в DOM на ПОТОЧНОМУ дні
    const currentDayDOMDishes = getSelectedDishesFromDOM().map(dish => ({
        ...dish,
        day: selectedDay.toLowerCase(), // selectedDay is global ('Mon', 'Tue', etc.)
        dayName: dayMap[selectedDay],
        quantity: 1
    }));
    
    // Додаємо страви поточного дня до фінального списку
    allSelectedDishes.push(...currentDayDOMDishes);

    // 2. Збираємо страви "за замовчуванням" для ВСІХ ІНШИХ днів
    allDays.forEach(day => {
        // Пропускаємо поточний день, оскільки ми його вже додали з DOM
        if (day === selectedDay) return; 

        const menuObj = getMenuForSelection(globalSelectedCalories, day, globalSelectedWeek);
        if (!menuObj) return;

        mealMap.forEach(meal => {
            const mealKey = meal.key;
            const choiceKey = `chose${meal.key.replace('Id', '').toLowerCase()}`;

            if (menuObj[mealKey]) {
                const dishIdOrArray = menuObj[mealKey];

                if (Array.isArray(dishIdOrArray)) {
                    if (menuObj[choiceKey] === true) {
                        // === ВИПАДОК 1 (ІНШІ ДНІ): Беремо ПЕРШУ страву за замовчуванням ===
                        const dish = getDishById(dishIdOrArray[0]);
                        if(dish) allSelectedDishes.push({ ...dish, day: day.toLowerCase(), dayName: dayMap[day], quantity: 1 });

                    } else {
                        // === ВИПАДОК 2 (ІНШІ ДНІ): Беремо ВСІ страви з масиву ===
                        dishIdOrArray.forEach(dishId => {
                            const dish = getDishById(dishId);
                            if (dish) allSelectedDishes.push({ ...dish, day: day.toLowerCase(), dayName: dayMap[day], quantity: 1 });
                        });
                    }
                } else {
                    // === ВИПАДОК 3 (ІНШІ ДНІ): Беремо ОДНУ страву ===
                    const dish = getDishById(dishIdOrArray);
                    if (dish) allSelectedDishes.push({ ...dish, day: day.toLowerCase(), dayName: dayMap[day], quantity: 1 });
                }
            }
        });
    }); // Кінець allDays.forEach

    return allSelectedDishes;
  }


  // Функція для збереження шаблону в кошик
  function saveTemplateToCart() {
    // Використовуємо нову функцію, яка збирає вибір з DOM
    const selectedDishes = getAllSelectedDishesForCart();
    
    if (selectedDishes.length === 0) {
      showWarning('Будь ласка, залиште хоча б одну страву в меню');
      return;
    }

    const price = (globalMenuData[globalSelectedCalories] && globalMenuData[globalSelectedCalories].price) ? globalMenuData[globalSelectedCalories].price : 0;

    if (window.cartManager) {
      const calories = globalSelectedCalories || 'Стандартне';
      window.cartManager.addOrder(selectedDishes, `Меню на ${calories} ккал (Тиждень ${globalSelectedWeek})`, price);
    } else {
      // Fallback
      console.error("CartManager не знайдено!");
    }
    
    let cartPath = window.getPagePath('cart');
    window.location.href = cartPath;
  }

  // Обробник для кнопки "Обрати це меню"
  const chooseBtn = document.querySelector('.menu-choose-btn');
  if (chooseBtn) {
    chooseBtn.removeEventListener('click', saveTemplateToCart);
    chooseBtn.addEventListener('click', saveTemplateToCart);
  }

  // Обробники для днів тижня
  dayButtons.forEach(button => {
    button.addEventListener('click', function() {
      dayButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      const dayText = this.textContent.toLowerCase();
      selectedDay = dayMap[dayText] || 'Mon';
      renderMenuCards();
    });
  });

  // Обробники для калорійності
  typeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      typeTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      selectedCalories = this.textContent.trim();
      globalSelectedCalories = selectedCalories;
      renderMenuCards();
    });
  });

  // Обробники для НОВИХ кнопок тижня
  weekTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        weekTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        selectedWeek = parseInt(this.getAttribute('data-week')) || 1;
        globalSelectedWeek = selectedWeek;
        renderMenuCards();
    });
  });

  // Завантаження даних і первинний рендер
  await loadData();
  renderMenuCards();
}

// Експорт функцій для використання в main.js
window.initStandartPage = initStandartPage;