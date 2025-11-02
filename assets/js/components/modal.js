// Показ модального окна регистрации
function showRegisterModal() {
  const modal = document.getElementById('register-modal');
  if (modal) {
    modal.style.display = 'flex';
  } else {

  }
}

// Показ модального окна входа
function showLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.style.display = 'flex';
  } else {

  }
}

// Закрытие модального окна
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Настройка обработчиков событий для модальных окон
function setupModalEvents() {
  // Обработчики для кнопок закрытия
  const closeButtons = document.querySelectorAll('.auth-modal__close');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.auth-modal-wrapper');
      if (modal) {
        modal.style.display = 'none';
        hideAuthError(modal.id);
      }
    });
  });

  // Обработчик для формы регистрации
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Обработчик для формы входа
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Обработчики для переключения между модальными окнами
  const openLoginLink = document.getElementById('openLoginModal');
  if (openLoginLink) {
    openLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal('register-modal');
      hideAuthError('register-modal');
      showLoginModal();
    });
  }

  const openRegisterLink = document.getElementById('openRegisterModal');
  if (openRegisterLink) {
    openRegisterLink.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal('login-modal');
      hideAuthError('login-modal');
      showRegisterModal();
    });
  }

  // Закрытие по клику вне модального окна
  const modals = document.querySelectorAll('.auth-modal-wrapper');
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  });
}

// Обработка регистрации
async function handleRegister(event) {
  event.preventDefault();
  hideAuthError('register-modal');
  
  const form = event.target;
  const formData = new FormData(form);
  
  const data = {
    FirstName: formData.get('FirstName'),
    SecondName: formData.get('SecondName'),
    Email: formData.get('Email'),
    PhoneNumber: formData.get('PhoneNumber'),
    Password: formData.get('Password'),
    ConfirmPassword: formData.get('ConfirmPassword')
  };

  if (data.Password !== data.ConfirmPassword) {
    showAuthError('register-modal', 'Паролі не співпадають');
    return;
  }
  
  try {
    const result = await window.registerUser(data);
    
    if (result.success) {
      // Закрываем модальное окно
      closeModal('register-modal');
      
      // Показываем уведомление об успехе
      showSuccess('Реєстрація пройшла успішно!');
      
      // Обновляем интерфейс
      if (typeof window.updateAuthUI === 'function') {
        window.updateAuthUI();
      }
    } else {
      showAuthError('register-modal', result.message || 'Помилка при реєстрації');
    }
  } catch (err) {
    showAuthError('Помилка при реєстрації');
  }
}

// Обработка входа
async function handleLogin(event) {
  event.preventDefault();
  hideAuthError('login-modal');
  
  const form = event.target;
  const formData = new FormData(form);
  
  const data = {
    Email: formData.get('Email'),
    Password: formData.get('Password')
  };
  
  try {
    const result = await window.loginUser(data);
    
    if (result.success) {
      // Закрываем модальное окно
      closeModal('login-modal');
      
      // Показываем уведомление об успехе
      showSuccess('Вхід виконано успішно!');
      
      // Обновляем интерфейс
      if (typeof window.updateAuthUI === 'function') {
        window.updateAuthUI();
      }
    } else {
      showAuthError('login-modal', result.message || 'Помилка при вході');
    }
  } catch (err) {
    showAuthError('login-modal', 'Помилка при вході');
  }
}

// Показать сообщение об ошибке
function showAuthError(modalId, message) {
  const errorId = modalId === 'register-modal' ? 'registerError' : 'loginError';
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// Скрить сообщение об ошибке
function hideAuthError(modalId) {
  const errorId = modalId === 'register-modal' ? 'registerError' : 'loginError';
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

// Загрузка модальных окон
async function loadModals() {
  try {
    // Определяем правильный путь к файлам
    const currentPath = window.location.pathname;
    let basePath = '';
    
    if (currentPath.includes('/pages/main/')) {
      basePath = '../../';
    } else if (currentPath.includes('/pages/partials/')) {
      basePath = '../';
    } else {
      basePath = './';
    }
    
    // Загружаем модальные окна
    const registerResponse = await fetch(basePath + 'pages/partials/register.html');
    const loginResponse = await fetch(basePath + 'pages/partials/login.html');
    
    if (registerResponse.ok && loginResponse.ok) {
      const registerHTML = await registerResponse.text();
      const loginHTML = await loginResponse.text();
      
      // Создаем обертки для модальных окон
      const registerModalWrapper = `
        <div id="register-modal" class="auth-modal-wrapper">
          <div class="auth-modal-container">
            ${registerHTML}
          </div>
        </div>
      `;
      
      const loginModalWrapper = `
        <div id="login-modal" class="auth-modal-wrapper">
          <div class="auth-modal-container">
            ${loginHTML}
          </div>
        </div>
      `;
      
      // Добавляем модальные окна в DOM
      document.body.insertAdjacentHTML('beforeend', registerModalWrapper);
      document.body.insertAdjacentHTML('beforeend', loginModalWrapper);
      
      // Добавляем обработчики событий
      setupModalEvents();
    } else {
      // Один из файлов не загрузился
      
      // Попробуем альтернативные пути
      try {
        const altRegisterResponse = await fetch('/pages/partials/register.html');
        const altLoginResponse = await fetch('/pages/partials/login.html');
        
        if (altRegisterResponse.ok && altLoginResponse.ok) {
          const registerHTML = await altRegisterResponse.text();
          const loginHTML = await altLoginResponse.text();
          
          // Создаем обертки для модальных окон
          const registerModalWrapper = `
            <div id="register-modal" class="auth-modal-wrapper">
              <div class="auth-modal-container">
                ${registerHTML}
              </div>
            </div>
          `;
          
          const loginModalWrapper = `
            <div id="login-modal" class="auth-modal-wrapper">
              <div class="auth-modal-container">
                ${loginHTML}
              </div>
            </div>
          `;
          
          // Добавляем модальные окна в DOM
          document.body.insertAdjacentHTML('beforeend', registerModalWrapper);
          document.body.insertAdjacentHTML('beforeend', loginModalWrapper);
          
          // Добавляем обработчики событий
          setupModalEvents();
        }
      } catch (altError) {
        
      }
    }
  } catch (error) {
    
  }
}

function initModal() {
  loadModals();
}

// Поддержка обеих систем - старой и новой
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModal);
} else {
  // DOM уже загружен, инициализируем сразу
  initModal();
}

// Экспортируем функции в глобальную область
window.showRegisterModal = showRegisterModal;
window.showLoginModal = showLoginModal;
window.closeModal = closeModal;
window.loadModals = loadModals;
window.initModal = initModal;
