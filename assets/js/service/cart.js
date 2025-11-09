// Функции для управления корзиной
class CartManager {
    constructor() {
        this.cart = this.loadCart();
    }

    // Загрузка корзины из localStorage
    loadCart() {
        const cardData = window.getStorageItem(window.STORAGE_KEYS?.CART || 'cart', { orders: [] });
        if (!cardData.orders) {
            return { orders: [] };
        }
        return cardData;
    }

    // Сохранение корзины в localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // додавання замовлень
    addOrder(dishes, orderName, price = 0) {
        if (!dishes || dishes.length === 0) {
            return;
        }
        
        const orderId = `order_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;

        const newOrder = {
            id: orderId,
            name: orderName || `Замовлення #${this.cart.length + 1}`,
            dishes: dishes.map(dish => ({
                ...dish,
                quantity: dish.quantity || 1
            })),
            price: price
        };

        this.cart.orders.push(newOrder);
        this.saveCart();

        if (window.isUserAuthenticated()) {
            this.syncWithServer();
        }
    }

    // Добавление товара в корзину
    addItem(item) {
        const orderName = `Окрема страва: ${item.title || 'Без назви'}`;
        this.addOrder([item], orderName);
    }

    // Обновление количества товара
    updateQuantity(orderId, dishId, day, newQuantity) {
        const order = this.cart.orders.find(o => o.id === orderId);
        if (!order) return;

        const dish = order.dishes.find(d => d.id === dishId && d.day === day);
        if (!dish) return;

        dish.quantity = Math.max(1, parseInt(newQuantity) || 1);
        this.saveCart();
        this.syncWithServer();
    }

    // Удаление товара из корзины
    removeDish(orderId, dishId, day) {
        const order = this.cart.orders.find(o => o.id === orderId);
        if (!order) return;

        order.dishes = order.dishes.filter(d => !(d.id === dishId && d.day === day));

        if (order.dishes.length === 0) {
            this. removeOrder(orderId);
        } else {
            this.saveCart();
            this.syncWithServer();
        }
    }

    // Видалити замовлення
    removeOrder(orderId) {
        this.cart.orders = this.cart.orders.filter(o => o.id !== orderId);
        this.saveCart();
        this.syncWithServer();
    }

    // Очистка корзины
    clearCart() {
        this.cart = { orders: [] };
        this.saveCart();
        
        // Синхронизируем с сервером, если пользователь авторизован
        if (window.isUserAuthenticated()) {
            this.syncWithServer();
        }
    }

    // Получение общих макронутриентов
    getTotalMacros() {
        let total = { protein: 0, fat: 0, carbs: 0 };
        this.cart.orders.forEach(order => {
            order.dishes.forEach(item => {
                total.protein += (item.p || 0) * item.quantity;
                total.fat += (item.f || 0) * item.quantity;
                total.carbs += (item.c || 0) * item.quantity;
            });
        });
        return total;
    }

    // Получение общей калорийности
    getTotalCalories() {
        let totalKcal = 0;
        this.cart.orders.forEach(order => {
            order.dishes.forEach(item => {
                const calories = window.calculateCaloriesFromMacros(item.p || 0, item.f || 0, item.c || 0);
                totalKcal += calories * item.quantity;
            });
        });
        return Math.round(totalKcal);
    }

    getTotalPrice() {
        let totalPrice = 0;
        if (this.cart && this.cart.orders) {
            this.cart.orders.forEach(order => {
                totalPrice += order.price || 0;
            });
        }
        return totalPrice;
    }

    // Получение всех заказов
    getOrders() {
        return this.cart.orders;
    }

    // Синхронизация с сервером
    async syncWithServer() {
        try {
            if (!window.isUserAuthenticated()) {
                return;
            }

            // Отправляем корзину на сервер
            await window.addToCart(this.cart);
            
        } catch (error) {
            // Ошибка синхронизации
        }
    }

    // Загрузка корзины с сервера
    async loadFromServer() {
        try {
            if (!window.isUserAuthenticated()) {
                return;
            }

            const serverCart = await window.getCart();
            if (serverCart && Array.isArray(serverCart.orders)) {
                this.cart = serverCart;
                this.saveCart();
            }
            
        } catch (error) {
            // Ошибка загрузки
        }
    }
}

// Глобальный экземпляр менеджера корзины
window.cartManager = new CartManager();

// Функции для работы с корзиной на странице
window.changeQuantity = function(orderId, dishId, day, change) {
    const order = window.cartManager.getOrders().find(o => o.id === index.orderId);
    if (!order) return;
    
    const dish = order.dishes.find(d => d.id === dishId && d.day === day);
    if (!dish) return;
    const newQuantity = Math.max(1, dish.quantity + change);
    window.cartManager.updateQuantity(orderId, dishId, day, newQuantity);
    loadCart();
};

window.updateQuantityInput = function(orderId, dishId, day, inputElement) {
    const newQuantity = Math.max(1, parseInt(inputElement.value) || 1);
    window.cartManager.updateQuantity(orderId, dishId, day, newQuantity);
    loadCart();
};

window.removeDish = function(orderId, dishId, day) {
    window.cartManager.removeItem(orderId, dishId, day);
    if (typeof loadCart === 'function') {
        loadCart();
    }
};

window.removeOrder = function(orderId) {
    if (confirm('Ви впевнені, що хочете видалити це замовлення?')) {
        window.cartManager.removeOrder(orderId);
        if (typeof loadCart === 'function') {
            loadCart();
        }
    }
}

window.clearCart = function() {
    if (confirm('Ви впевнені, що хочете очистити кошик?')) {
        window.cartManager.clearCart();
        if (typeof loadCart === 'function') {
            loadCart();
        }
    }
};

window.proceedToCheckout = function() {
    // Открываем модальное окно с формой заказа
    const modal = document.getElementById('order-modal');
    if (modal) {
        // Загружаем содержимое order.html с правильным путем
        const orderPath = '../../pages/partials/order.html';

        // Пробуем разные пути
        const tryLoadOrder = (pathIndex) => {
            fetch(orderPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    // Извлекаем содержимое main из order.html
                    const mainMatch = html.match(/<main[\s\S]*?<\/main>/);
                    if (mainMatch) {
                        document.getElementById('order-modal-body').innerHTML = mainMatch[0];
                        modal.style.display = 'flex';
                        
                        // Добавляем обработчик закрытия модального окна
                        const closeBtn = document.getElementById('order-modal-close');
                        if (closeBtn) {
                            closeBtn.addEventListener('click', function() {
                                modal.style.display = 'none';
                            });
                        }
                        
                        // Закрытие по клику вне модального окна
                        modal.addEventListener('click', function(e) {
                            if (e.target === modal) {
                                modal.style.display = 'none';
                            }
                        });
                        
                        // После загрузки формы загружаем данные пользователя
                        loadUserDataToOrderForm();
                    }
                })
                .catch(error => {
                    console.error('Помилка завантаження форми замовлення:', error);
                    showError('Помилка завантаження форми замовлення');
                });
        };
        
        tryLoadOrder(0);
    }
};

/**
 * Збирає всі дані з полів форми замовлення.
 */
function getCutomerFromData() {
    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };
    const paymentEl = document.getElementById('order-payment');

    return {
        lastName: getVal('order-lastname'),
        firstName: getVal('order-firstname'),
        phone: getVal('order-phone'),
        email: getVal('order-email'),
        social: getVal('order-social'),
        comment: getVal('order-comment'),
        street: getVal('order-street'),
        house: getVal('order-house'),
        floor: getVal('order-floor'), // 'Під'їзд'
        apartment: getVal('order-apartment'),
        paymentType: paymentEl ? paymentEl.options[paymentEl.selectedIndex].text : 'Невідомо'
    };
}

// Функция для загрузки и заполнения данных пользователя в форме заказа
function loadUserDataToOrderForm() {
    const userId = localStorage.getItem('userId');
    
    // Проверяем, что форма заказа существует
    const orderForm = document.querySelector('.order-form');
    if (!orderForm) {
        return;
    }
    
    // Если пользователь не зарегистрирован, настраиваем только валидацию формы
    if (!userId) {
        setupOrderFormValidation();
        return;
    }
    
            // Используем централизованную функцию загрузки настроек
        window.loadServerSettings()
        .then(settings => {
            const baseUrl = settings.serverBaseUrl || 'http://localhost:3000';
            const fullUrl = baseUrl + '/user/info/' + userId;
            
            
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', fullUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            
                            // Функция для безопасного установки значения
                            const setValue = (id, value) => {
                                const el = document.getElementById(id);
                                if (el && value !== undefined && value !== null && value !== '') {
                                    el.value = value;
                                }
                            };
                            
                            // Заполняем поля формы данными пользователя
                            setValue('order-firstname', data.firstName);
                            setValue('order-lastname', data.lastName);
                            setValue('order-phone', data.number);
                            setValue('order-email', data.email);
                            
                            // Заполняем социальные сети (Telegram или Instagram)
                            if (data.telegram) {
                                setValue('order-social', data.telegram);
                            } else if (data.instagram) {
                                setValue('order-social', data.instagram);
                            }
                            
                            // Заполняем адрес доставки
                            setValue('order-street', data.street);
                            setValue('order-house', data.house);
                            setValue('order-apartment', data.apartment);
                            
                            // Для этажа используем entrance, если есть
                            if (data.entrance) {
                                setValue('order-floor', data.entrance);
                            }
                            
                            // Настраиваем валидацию полей формы
                            setupOrderFormValidation();
                            
                        } catch (e) {
                            setupOrderFormValidation();
                        }
                    } else {
                        // Если запрос не успешен, все равно настраиваем валидацию
                        setupOrderFormValidation();
                    }
                }
            };
            xhr.send(JSON.stringify({ userId: userId }));
        })
        .catch(err => {
            // Ошибка загрузки настроек
            setupOrderFormValidation();
        });
}

// Функция для настройки валидации формы заказа
function setupOrderFormValidation() {
    
    // Валидация обязательных полей
    const requiredFields = [
        {input: 'order-lastname', error: 'order-lastname-error'},
        {input: 'order-firstname', error: 'order-firstname-error'},
        {input: 'order-phone', error: 'order-phone-error'},
        {input: 'order-email', error: 'order-email-error'},
        {input: 'order-street', error: 'order-street-error'},
        {input: 'order-house', error: 'order-house-error'},
        {input: 'order-floor', error: 'order-floor-error'},
        {input: 'order-apartment', error: 'order-apartment-error'}
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
    
    // Обработчик отправки формы
    const orderForm = document.querySelector('.order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Предотвращаем стандартную отправку формы
            
            let valid = true;
            requiredFields.forEach(({input, error}) => {
                const inputEl = document.getElementById(input);
                const errorEl = document.getElementById(error);
                if (inputEl && errorEl && !inputEl.value.trim()) {
                    errorEl.style.display = 'block';
                    valid = false;
                }
            });
            
            if (!valid) {
                if (typeof showWarning === 'function') {
                    showWarning('Будь ласка, заповніть всі обов\'язкові поля');
                } else if (typeof window.showWarning === 'function') {
                    window.showWarning('Будь ласка, заповніть всі обов\'язкові поля');
                } else {
                    // Fallback если функция showWarning недоступна
                    alert('Будь ласка, заповніть всі обов\'язкові поля');
                }
                return;
            }
            
            // Если форма валидна, выполняем действия:
            try {
                const selectedPayType = document.getElementById('order-payment');
                if (selectedPayType.selectedIndex === 0) {
                    // 1. Збираємо дані замовлення
                    const totalAmountCents = (window.cartManager.getTotalPrice()*100); // ЗВГЛУШУКА!!! Використовуємо загальну калорійність як суму замовлення
                    const orderId = `EBF-${new Date().getTime()}`; // Для тесту поки не зберігаємо на сервері

                    const paymentData = {
                        amount: totalAmountCents,
                        orderId: orderId,
                        redirectUrl: window.location.href
                    };

                    // 2. Отрмуємо посилання на оплату
                    var res = await window.invoiceMonoPayment(paymentData);
                    if (res.success) {
                        // 3. Закрываем модальное окно заказа
                        const orderModal = document.getElementById('order-modal');
                        if (orderModal) {
                            orderModal.style.display = 'none';
                        } else {
                            // Если модальное окно не найдено, попробуем найти его по классу
                            const modalElements = document.querySelectorAll('[id*="modal"]');
                            modalElements.forEach(modal => {
                                if (modal.style.display === 'flex' || modal.style.display === 'block') {
                                    modal.style.display = 'none';
                                }
                            });
                        }
                        // 4. Очистка корзини
                        if (window.cartManager) {
                            window.cartManager.clearCart();
                        }

                        // 5. Переходим за посиланням на оплату
                        window.location.href = res.pageUrl;
                    } else {
                        throw new Error('Не отрмано посилання на оплату');
                    }
                }
                else {
                    // підготовка даних до відправки
                    const cutomerData = getCutomerFromData();
                    const cartData = window.cartManager.getOrders();

                    const fullOrderData = {
                        customer: cutomerData,
                        cart: cartData,
                        totalAmount: window.cartManager.getTotalPrice()
                    }

                    const res = await window.sendOrderNotify(fullOrderData);

                    if (res.success) {
                        // 1. Закрываем модальное окно заказа
                        const orderModal = document.getElementById('order-modal');
                        if (orderModal) {
                            orderModal.style.display = 'none';
                        } else {
                            // Если модальное окно не найдено, попробуем найти его по классу
                            const modalElements = document.querySelectorAll('[id*="modal"]');
                            modalElements.forEach(modal => {
                                if (modal.style.display === 'flex' || modal.style.display === 'block') {
                                    modal.style.display = 'none';
                                }
                            });
                        }
                        
                        // 2. Очищаем корзину
                        if (window.cartManager) {
                            window.cartManager.clearCart();
                        }
                        
                        // 3. Переходим на главную страницу
                        let homePath = window.getHomePath();
                        
                        // 4. Показываем сообщение об успешном оформлении заказа
                        if (typeof showSuccess === 'function') {
                            showSuccess('Замовлення успішно оформлено!');
                        } else if (typeof window.showSuccess === 'function') {
                            window.showSuccess('Замовлення успішно оформлено!');
                        } else {
                            // Fallback если функция showSuccess недоступна
                            alert('Замовлення успішно оформлено!');
                        }
                        
                        // 5. Переходим на главную страницу с небольшой задержкой
                        setTimeout(() => {
                            window.location.href = homePath;
                        }, 1500); // Задержка 1.5 секунды, чтобы пользователь увидел сообщение
                    } else {
                        window.showError('Помилка при оформленні замовлення. Спробуйте ще раз пізніше.');
                    }
                }
            } catch (error) {
                    // 8. Обробляємо будь-які помилки (мережа, сервер, логіка)
                    console.error("Помилка при оформленні замовлення:", error);
                    if (typeof showError === 'function') {
                        showError(`Помилка при оформленні замовлення: ${error.message}`);
                    } else {
                        alert(`Помилка при оформленні замовлення: ${error.message}`);
                    }
                }   
        });
    }
}

// Функция для отображения корзины на странице cart.html
function loadCart() {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) {
        return;
    }

    const orders = window.cartManager.getOrders();
    
    if (!orders || orders.length === 0) {
        // Кошик порожній
        const clearCartBtn = document.querySelector('.clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.style.display = 'none';
        }
        
        cartContent.innerHTML = `
            <div class="profile-cart-empty">
                <div class="profile-cart-empty-title">Упс! Кошик порожній</div>
                <div class="profile-cart-empty-desc">Саме час для правильного харчування!</div>
                <div class="profile-cart-btns">
                    <a href="${window.getHomePath()}" class="profile-cart-btn">Повернутися на головну</a>
                </div>
            </div>
        `;
        // Ховаємо загальний підсумок, якщо він є
        const summary = document.getElementById('cart-summary-total');
        if(summary) summary.style.display = 'none';

        return;
    }

    // Показуємо кнопку "Очистити кошик"
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.style.display = 'block';
    }
    
    let cartHTML = '';

    // --- Цикл по Замовленнях ---
    orders.forEach((order, orderIndex) => {
        // Групуємо страви за днем
        const dishesByDay = {};
        order.dishes.forEach(dish => {
            if (!dishesByDay[dish.day]) {
                dishesByDay[dish.day] = {
                    dayName: dish.dayName || dish.day, // Використовуємо dayName, якщо є
                    dishes: []
                };
            }
            dishesByDay[dish.day].dishes.push(dish);
        });

        // Сортуємо дні (Пн, Вт, Ср...)
        const sortedDays = Object.keys(dishesByDay).sort((a, b) => {
            const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            return dayOrder.indexOf(a) - dayOrder.indexOf(b);
        });
        
        // Унікальний ID для тіла замовлення
        const orderCollapseId = `order-body-${order.id}`;

        // Ціна замовлення
        const orderPrice = order.price || 0;

        cartHTML += `
            <div class="cart-order-group">
                <div class="cart-order-header" onclick="toggleCartCollapse('${orderCollapseId}')">
                    <div>
                        <h2 class="cart-order-title">${order.name} (Замовлення ${orderIndex + 1})</h2>
                        <div style="cart-order-price">Ціна: ${orderPrice} грн</div>
                    </div>
                    <div class="cart-order-header-right">
                        <span class="order-toggle-icon" id="toggle-icon-${orderCollapseId}">+</span>
                        <button class="delete-btn order-delete-btn" onclick="event.stopPropagation(); removeOrder('${order.id}')">Видалити</button>
                    </div>
                </div>
                
                <div class="collapsible-content" id="${orderCollapseId}">
        `;

        // --- Цикл по Днях ---
        sortedDays.forEach((dayKey, dayIndex) => {
            const dayData = dishesByDay[dayKey];
            
            // Унікальний ID для блоку страв дня
            const dayCollapseId = `order-${order.id}-day-${dayIndex}`;
            
            cartHTML += `
                <div class="cart-day-group">
                    <h3 class="cart-day-title" onclick="toggleCartCollapse('${dayCollapseId}')">
                        ${dayData.dayName}
                        <span class="day-toggle-icon" id="toggle-icon-${dayCollapseId}">+</span>
                    </h3>
                    
                    <div class="cart-items collapsible-content" id="${dayCollapseId}">
            `;

            // --- Цикл по Стравах ---
            dayData.dishes.forEach(item => {
                const calories = Math.round(window.calculateCaloriesFromMacros(item.p || 0, item.f || 0, item.c || 0));
                
                cartHTML += `
                    <div class="cart-item">
                        <img src="${window.getDishImage ? window.getDishImage(item) : (item.img || 'data/img/food1.jpg')}" alt="${item.title}" class="cart-item-img">
                        <div class="cart-item-content">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-macros">Б: ${item.p}г Ж: ${item.f}г В: ${item.c}г, ${calories} ккал</div>
                            <div class="cart-item-description">${item.subtitle || ''}</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <span class="quantity-label">К-ть:</span>
                                <button class="quantity-btn" onclick="changeQuantity('${order.id}', ${item.id}, '${item.day}', -1)">−</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                                       onchange="updateQuantityInput('${order.id}', ${item.id}, '${item.day}', this)" 
                                       oninput="updateQuantityInput('${order.id}', ${item.id}, '${item.day}', this)">
                                <button class="quantity-btn" onclick="changeQuantity('${order.id}', ${item.id}, '${item.day}', 1)">+</button>
                            </div>
                            <div class="cart-item-actions">
                                <button class="delete-btn" onclick="removeDish('${order.id}', ${item.id}, '${item.day}')">Видалити</button>
                            </div>
                        </div>
                    </div>
                `;
            }); // Кінець циклу страв

            cartHTML += `
                    </div> </div> `;
        }); // Кінець циклу днів

        cartHTML += `
                </div> </div> `;
    }); // Кінець циклу замовлень

    cartContent.innerHTML = cartHTML;
    
    // --- Оновлюємо загальний підсумок ---
    const macros = window.cartManager.getTotalMacros();
    const totalCalories = window.cartManager.getTotalCalories();
    const totalPrice = window.cartManager.getTotalPrice();

    const summaryDiv = document.getElementById('cart-summary-total');
    if (summaryDiv) {
        summaryDiv.style.display = 'block'; // Показуємо його
        summaryDiv.innerHTML = `
            <div class="cart-total">Загалом у замовленні: ${Math.round(macros.protein)} Білки ${Math.round(macros.fat)} Жири ${Math.round(macros.carbs)} Вуглеводи, ${totalCalories} ккал.</div>
            <div class="cart-total">Загальна сума: ${totalPrice} грн.</div>
            <div class="cart-actions">
                <button class="checkout-btn" onclick="proceedToCheckout()">Оформити замовлення</button>
                <a href="${window.getHomePath()}" class="continue-shopping-btn">Повернутися на головну</a>
            </div>
        `;
    }
}

// Инициализация корзины при загрузке страницы
function initCartPage() {
    if (document.getElementById('cart-content')) {
        loadCart();
    }
    
    // Настройка кнопок очистки корзины
    setupClearCartButtons();
    
    // Добавляем функцию для отладки в глобальную область
    window.debugCart = function() {
        const cartData = localStorage.getItem('cart');
        
        if (cartData) {
            try {
                const parsedCart = JSON.parse(cartData);
            } catch (e) {
                // Ошибка парсинга
            }
        }
        
        if (window.cartManager) {
            const managerCart = window.cartManager.loadCart();
        }
    };
    
    // Автоматически вызываем отладку при загрузке страницы корзины
    if (document.getElementById('cart-content')) {
        setTimeout(() => {
            window.debugCart();
        }, 1000);
    }
    
    // Создаем экземпляр менеджера корзины
    window.cartManager = new CartManager();
}

// Инициализация теперь происходит через main.js

// Настройка кнопок очистки корзины
function setupClearCartButtons() {
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const clearCartBtnProfile = document.getElementById('clear-cart-btn-profile');
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (typeof clearCart === 'function') {
                clearCart();
            }
        });
    }
    
    if (clearCartBtnProfile) {
        clearCartBtnProfile.addEventListener('click', function() {
            if (typeof clearCart === 'function') {
                clearCart();
            }
        });
    }
}

// --- УНІВЕРСАЛЬНА ФУНКЦІЯ ЗГОРТАННЯ/РОЗГОРТАННЯ ---
window.toggleCartCollapse = function(contentId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(`toggle-icon-${contentId}`);
    
    if (content) {
        // Перевіряємо, чи блок зараз видимий (має клас 'show')
        if (content.classList.contains('show')) {
            // Згортаємо
            content.classList.remove('show');
            if (icon) icon.textContent = '+';
        } else {
            // Розгортаємо
            content.classList.add('show');
            if (icon) icon.textContent = '−';
        }
    }
};

// Экспорт функций для использования в main.js
window.initCartPage = initCartPage;
window.setupClearCartButtons = setupClearCartButtons;
window.proceedToCheckout = proceedToCheckout;
window.clearCart = clearCart;
window.loadCart = loadCart;