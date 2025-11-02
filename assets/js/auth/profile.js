// Переменная для отслеживания показа сообщения об ошибке
let authErrorShown = false;

// Змінна для відстеження завантаження конетну умов та положень
let termLoaded = false;

// Переключение вкладок профиля
async function initProfilePage() {
    // Инициализация переключения вкладок
    initProfileTabs();
    
    // Инициализация валидации полей
    initFieldValidation();
    
    // Инициализация обработчиков кнопок
    initButtonHandlers();
    
    // Загрузка данных профиля
    loadProfileData();
    
    // Инициализация модального окна
    initModalHandlers();
    
    // Загружаем корзину при загрузке страницы, если активна вкладка корзины
    const activeTab = document.querySelector('.profile-tab.active');
    if (activeTab && activeTab.getAttribute('data-tab') === 'cart') {
        loadCart();
    }
    
    // Настройка кнопок очистки корзины
    if (typeof window.setupClearCartButtons === 'function') {
        window.setupClearCartButtons();
    }

    // Инициализация избранных блюд
    await initFavorites();
}

function initProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    
    tabs.forEach(function(tabBtn) {
        tabBtn.addEventListener('click', function() {
            // Убираем активный класс со всех вкладок
            document.querySelectorAll('.profile-tab').forEach(function(btn){
                btn.classList.remove('active');
            });
            
            // Добавляем активный класс к текущей вкладке
            tabBtn.classList.add('active');
            
            // Получаем название вкладки
            var tab = tabBtn.getAttribute('data-tab');
            
            // Скрываем все контенты вкладок
            document.querySelectorAll('.profile-tab-content').forEach(function(content){
                content.style.display = 'none';
            });
            
            // Показываем нужный контент
            const targetContent = document.getElementById('tab-' + tab);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
            
            // Если открыта вкладка корзины, загружаем корзину
            if (tab === 'cart') {
                loadCart();
            }
            // Если открыта вкладка избранных, обновляем избранные
            if (tab === 'favorites') {
                if (typeof renderFavorites === 'function') {
                    renderFavorites();
                }
            }

            // Якщо відкрита вкладка умов та положень, завантажуємо контент
            if (tab === 'terms') {
                loadTermsContent();
            }
        });
    });
}

function initFieldValidation() {
    // Валидация всех обязательных полей
    const requiredFields = [
        {input: 'firstname-input', error: 'firstname-error'},
        {input: 'lastname-input', error: 'lastname-error'},
        {input: 'phone-input', error: 'phone-error'},
        {input: 'email-input', error: 'email-error'},
        {input: 'gender-input', error: 'gender-error'},
        {input: 'telegram-input', error: 'telegram-error'},
        {input: 'instagram-input', error: 'instagram-error'},
        {input: 'street-input', error: 'street-error'},
        {input: 'house-input', error: 'house-error'},
        {input: 'entrance-input', error: 'entrance-error'},
        {input: 'apartment-input', error: 'apartment-error'}
    ];
    
    requiredFields.forEach(({input, error}) => {
        const inputEl = document.getElementById(input);
        const errorEl = document.getElementById(error);
        if (!inputEl || !errorEl) return;
        
        inputEl.addEventListener('blur', function() {
            if (!inputEl.value.trim()) {
                errorEl.style.display = 'block';
            } else {
                errorEl.style.display = 'none';
            }
        });
        
        inputEl.addEventListener('input', function() {
            if (inputEl.value.trim()) {
                errorEl.style.display = 'none';
            }
        });
    });
}

function initButtonHandlers() {
    // Обработчик для кнопки выхода
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../../../index.html';
    });

    // Обработчик для кнопки "Змінити" - сохранение профиля
    document.getElementById('save-profile-btn').addEventListener('click', function() {
        saveProfileData();
    });
}

function saveProfileData() {
    const userId = localStorage.getItem('userId');
    
    // Собираем данные из формы
    const profileData = {
        firstName: document.getElementById('firstname-input').value,
        lastName: document.getElementById('lastname-input').value,
        number: document.getElementById('phone-input').value,
        email: document.getElementById('email-input').value,
        gender: document.getElementById('gender-input').value === 'male' ? 'Мужской' : 'Женский',
        allergies: document.getElementById('allergens-input').value
    };
    
    const addressData = {};
    const street = document.getElementById('street-input').value;
    const house = document.getElementById('house-input').value;
    const apartment = document.getElementById('apartment-input').value;
    const entrance = document.getElementById('entrance-input').value;
    
    if (street) addressData.Street = street;
    if (house) addressData.House = house ? parseInt(house) : undefined;
    if (apartment) addressData.Apartment = apartment;
    
    // Добавляем город
    const city = document.getElementById('city-input').value;
    if (city) addressData.Sity = city;
    
    if (entrance) {
        addressData.Entrance = parseInt(entrance);
    }

    const socialsData = {
        telegram: document.getElementById('telegram-input').value,
        instagram: document.getElementById('instagram-input').value
    };



    // Отправляем три запроса
    window.loadServerSettings()
        .then(settings => {
            const baseUrl = settings.serverBaseUrl || 'http://localhost:3000';
            
            // Основная информация
            const infoPromise = fetch(baseUrl + '/user/addinfo?userId=' + userId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profileData)
            });
            
            // Адрес
            const addressPromise = fetch(baseUrl + '/user/address?userId=' + userId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(addressData)
            }).then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error('Ошибка адреса: ' + text);
                    });
                }
                return response;
            });
            
            // Соцсети
            const socialsPromise = fetch(baseUrl + '/user/social?userId=' + userId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(socialsData)
            });
            
            return Promise.all([infoPromise, addressPromise, socialsPromise]);
        })
        .then(([infoRes, addressRes, socialsRes]) => {
            if (infoRes.ok && addressRes.ok && socialsRes.ok) {
                showSuccess('Профіль, адресу і соцмережі успішно оновлено!');
            } else {
                let errorMsg = 'Помилка оновлення:';
                if (!infoRes.ok) errorMsg += ' профілю;';
                if (!addressRes.ok) errorMsg += ' адреси;';
                if (!socialsRes.ok) errorMsg += ' соцмереж;';
                throw new Error(errorMsg);
            }
        })
        .catch(error => {
            showError('Помилка при оновленні: ' + error.message);
        });
}

function clearProfileFields() {
    const ids = [
        'firstname-input', 'lastname-input', 'phone-input', 'email-input',
        'telegram-input', 'instagram-input', 'street-input', 'house-input',
        'entrance-input', 'apartment-input', 'gender-input', 'allergens-input', 'city-input'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function loadProfileData() {
    // Сначала очищаем все поля профиля
    clearProfileFields();
    
    window.loadServerSettings()
        .then(settings => {
            const baseUrl = settings.serverBaseUrl || 'http://localhost:3000';
            
            // Здесь можно получить userID из localStorage/sessionStorage/cookie, если нужно
            const userId = localStorage.getItem('userId');
            
            // Проверяем, что userId существует
            if (!userId) {
                if (!authErrorShown) {
                    showError('Помилка: користувач не авторизований. Будь ласка, увійдіть в систему.');
                    authErrorShown = true;
                }
                return;
            }
            
            const fullUrl = baseUrl + '/user/info/' + userId;
            
            // Для примера просто делаем POST на /user/profile (так как GET не работает с ngrok)
            const xhr = new XMLHttpRequest();
            xhr.open('POST', fullUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            
                            // Заполняем поля формы только если значение есть, иначе оставляем пустым
                            const setValue = (id, value) => {
                                const el = document.getElementById(id);
                                if (el) el.value = (value !== undefined && value !== null) ? value : '';
                            };
                            
                            setValue('firstname-input', data.firstName);
                            setValue('lastname-input', data.lastName);
                            setValue('phone-input', data.number);
                            setValue('email-input', data.email);
                            setValue('telegram-input', data.telegram);
                            setValue('instagram-input', data.instagram);
                            setValue('street-input', data.street);
                            setValue('house-input', data.house);
                            setValue('apartment-input', data.apartment);
                            
                            // Для пола (gender)
                            if (data.userSex === 'Мужской' || data.userSex === 'Чоловіча') {
                                setValue('gender-input', 'male');
                            } else if (data.userSex === 'Женский' || data.userSex === 'Жіноча') {
                                setValue('gender-input', 'female');
                            } else {
                                setValue('gender-input', '');
                            }
                            
                            setValue('allergens-input', data.userAllergens);
                            // Для города
                            setValue('city-input', data.city);
                            // Для этажа (floor-input) — если entrance есть, иначе пусто
                            setValue('entrance-input', data.entrance ? data.entrance : '');
                        } catch (e) {
                            // Ошибка парсинга JSON
                        }
                    } else {
                        // Ошибка загрузки профиля
                    }
                }
            };
            xhr.send(JSON.stringify({ userId: userId }));
        })
        .catch(err => {
            // Ошибка загрузки настроек
        });
}

function initModalHandlers() {
    var closeBtn = document.getElementById('order-modal-close');
    
    document.getElementById('order-modal').addEventListener('click', function(e) {
        if(e.target === this) {
            this.style.display = 'none';
        }
    });
    
    if(closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('order-modal').style.display = 'none';
        });
    }
}

// ===== ФУНКЦИОНАЛЬНОСТЬ ИЗБРАННЫХ БЛЮД =====

let dishesData = [];

// Загрузка данных блюд
async function loadDishes() {
    try {
        dishesData = await window.loadDishesData();
    } catch (error) {
        // Ошибка загрузки данных блюд
    }
}

// Получить блюдо по id
function getDishById(id) {
    return dishesData.find(dish => dish.id === parseInt(id));
}

// Генерация карточки избранного блюда в стиле корзины
function createFavoriteCard(dish) {
    if (!dish) return '';
    
    const calories = (dish.p * 4) + (dish.f * 9) + (dish.c * 4);
    
    return `
        <div class="cart-item" data-dish-id="${dish.id}">
                            <img src="${window.getDishImage ? window.getDishImage(dish) : (dish.img || 'data/img/food1.jpg')}" alt="${dish.title}" class="cart-item-img">
            <div class="cart-item-content">
                <div class="cart-item-title">${dish.title}</div>
                <div class="cart-item-macros">Б: ${dish.p}г Ж: ${dish.f}г В: ${dish.c}г, ${calories} ккал</div>
                <div class="cart-item-description">${dish.subtitle || ''}</div>
                ${dish.allergens ? `<div class="cart-item-allergens">Алергени: ${dish.allergens}</div>` : ''}
            </div>
            <div class="cart-item-controls">
                <div class="cart-item-actions">
                    <button class="delete-btn" onclick="removeFromFavorites(${dish.id})">Видалити з улюблених</button>
                </div>
            </div>
        </div>
    `;
}

// Функция удаления из избранного
window.removeFromFavorites = function(dishId) {
    if (confirm('Ви впевнені, що хочете видалити це блюдо з улюблених?')) {
        const heartsState = JSON.parse(localStorage.getItem('heartsState') || '{}');
        heartsState[dishId] = false;
        localStorage.setItem('heartsState', JSON.stringify(heartsState));
        renderFavorites();
    }
};

// Отображение избранных блюд в стиле корзины
window.renderFavorites = function() {
    const favoritesContainer = document.getElementById('tab-favorites');
    if (!favoritesContainer) return;

    const heartsState = JSON.parse(localStorage.getItem('heartsState') || '{}');
    const favoriteIds = Object.keys(heartsState).filter(id => heartsState[id] === true);
    
    if (favoriteIds.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="cart-container">
                <div class="cart-header">
                    <h1 class="profile-header-title">Улюблені страви</h1>
                </div>
                <div class="profile-cart-empty">
                    <div class="profile-cart-empty-title">У вас поки немає улюблених страв</div>
                    <div class="profile-cart-empty-desc">Додайте їх, натиснувши на сердечко біля блюда!</div>
                    <div class="profile-cart-btns">
                        <a href="../../index.html" class="profile-cart-btn">Повернутися на головну</a>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const favoriteDishes = favoriteIds.map(id => getDishById(id)).filter(dish => dish);
    
    // Подсчет общих макронутриентов
    const totalMacros = favoriteDishes.reduce((total, dish) => ({
        protein: total.protein + dish.p,
        fat: total.fat + dish.f,
        carbs: total.carbs + dish.c
    }), { protein: 0, fat: 0, carbs: 0 });
    
    const totalCalories = favoriteDishes.reduce((total, dish) => {
        const calories = (dish.p * 4) + (dish.f * 9) + (dish.c * 4);
        return total + calories;
    }, 0);
    
    favoritesContainer.innerHTML = `
        <div class="cart-container">
            <div class="cart-header">
                <h1 class="profile-header-title">Улюблені страви</h1>
            </div>
            
            <div class="cart-items">
                ${favoriteDishes.map(dish => createFavoriteCard(dish)).join('')}
            </div>
            
            <div class="cart-summary">
                <div class="cart-total">Загалом у улюблених: ${totalMacros.protein} Білки ${totalMacros.fat} Жири ${totalMacros.carbs} Вуглеводи, ${totalCalories} ккал.</div>
                <div class="cart-actions">
                    <a href="../../index.html" class="continue-shopping-btn">Повернутися на головну</a>
                </div>
            </div>
        </div>
    `;
};

// Инициализация избранных
async function initFavorites() {
    await loadDishes();
    renderFavorites();

    // Обновляем избранное при изменении localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'heartsState') {
            renderFavorites();
        }
    });
}

// Завантеження контенту умов та положень
function loadTermsContent() {
    if (termLoaded) return;

    const container = document.getElementById('tab-terms');
    if (!container) return;

    fetch('../partials/terms-content.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка завантаження умов та положень.');
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            termLoaded = true; // Відмічаємо, що контент завантажено
        })
        .catch(error => {
            container.innerHTML = `<p style="color:red;">${error.message}</p>`;
        });
}

// Поддержка обеих систем - старой и новой
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfilePage);
} else {
  // DOM уже загружен, инициализируем сразу
  initProfilePage();
}

// Экспорт функций для использования в main.js
window.initProfilePage = initProfilePage;