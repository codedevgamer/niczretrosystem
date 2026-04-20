// Funções Utilitárias - NiczRetroSystem

/**
 * Formata tempo em segundos para formato MM:SS
 * @param {number} seconds - Tempo em segundos
 * @returns {string} Tempo formatado
 */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formata tamanho de arquivo em bytes para formato legível
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
function formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * Cria delay com Promise
 * @param {number} ms - Milissegundos
 * @returns {Promise}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Valida se é um email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Copia texto para clipboard
 * @param {string} text - Texto a copiar
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('✓ Texto copiado');
    } catch (err) {
        console.error('Erro ao copiar:', err);
    }
}

/**
 * Gera ID único
 * @returns {string} ID único
 */
function generateUID() {
    return 'UID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Verifica se dispositivo é mobile
 * @returns {boolean}
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Obtém parametro de URL
 * @param {string} paramName - Nome do parâmetro
 * @returns {string|null}
 */
function getUrlParameter(paramName) {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName);
}

/**
 * Verifica se elemento está visível na viewport
 * @param {HTMLElement} element - Elemento a verificar
 * @returns {boolean}
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Debounce function
 * @param {Function} func - Função a executar
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Função a executar
 * @param {number} limit - Tempo limite em ms
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Ordena array de objetos
 * @param {Array} array - Array a ordenar
 * @param {string} key - Chave para ordenar
 * @param {string} order - 'asc' ou 'desc'
 * @returns {Array}
 */
function sortByKey(array, key, order = 'asc') {
    return array.sort((a, b) => {
        if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Filtra array de objetos
 * @param {Array} array - Array a filtrar
 * @param {string} key - Chave para filtrar
 * @param {*} value - Valor a procurar
 * @returns {Array}
 */
function filterByKey(array, key, value) {
    return array.filter(item => item[key] === value);
}

/**
 * Faz deep clone de objeto
 * @param {Object} obj - Objeto a clonar
 * @returns {Object}
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Mescla dois objetos
 * @param {Object} obj1 - Primeiro objeto
 * @param {Object} obj2 - Segundo objeto
 * @returns {Object}
 */
function mergeObjects(obj1, obj2) {
    return { ...obj1, ...obj2 };
}

/**
 * Converte objeto em array de chave-valor
 * @param {Object} obj - Objeto a converter
 * @returns {Array}
 */
function objectToArray(obj) {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

/**
 * Log com timestamp
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'log', 'warn', 'error', 'info'
 */
function timedLog(message, type = 'log') {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const prefix = `[${timestamp}]`;
    
    if (type === 'warn') console.warn(`${prefix} ⚠️  ${message}`);
    else if (type === 'error') console.error(`${prefix} ❌ ${message}`);
    else if (type === 'info') console.info(`${prefix} ℹ️  ${message}`);
    else console.log(`${prefix} ℹ️  ${message}`);
}

/**
 * Salva dado no localStorage
 * @param {string} key - Chave
 * @param {*} value - Valor
 */
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        timedLog(`Dados salvos: ${key}`);
    } catch (error) {
        console.error('Erro ao salvar:', error);
    }
}

/**
 * Recupera dado do localStorage
 * @param {string} key - Chave
 * @returns {*}
 */
function getFromLocalStorage(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Erro ao recuperar:', error);
        return null;
    }
}

/**
 * Remove dado do localStorage
 * @param {string} key - Chave
 */
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        timedLog(`Dados removidos: ${key}`);
    } catch (error) {
        console.error('Erro ao remover:', error);
    }
}

/**
 * Limpa todo o localStorage
 */
function clearLocalStorage() {
    if (confirm('Deseja limpar todos os dados salvos?')) {
        localStorage.clear();
        timedLog('LocalStorage limpo', 'info');
    }
}

/**
 * Cria notificação toast
 * @param {string} message - Mensagem
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duração em ms
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
        color: white;
        border-radius: 4px;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Cria modal simples
 * @param {string} title - Título
 * @param {string} message - Mensagem
 * @param {Array} buttons - Botões [{text: '', callback: function}]
 */
function createModal(title, message, buttons = []) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #0a0e27;
        border: 3px solid #FF006E;
        padding: 30px;
        border-radius: 10px;
        max-width: 500px;
        color: white;
    `;
    
    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.style.marginBottom = '15px';
    content.appendChild(titleEl);
    
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.marginBottom = '20px';
    content.appendChild(messageEl);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.style.cssText = `
            padding: 10px 20px;
            background: #FF006E;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        button.addEventListener('click', () => {
            if (btn.callback) btn.callback();
            modal.remove();
        });
        buttonsContainer.appendChild(button);
    });
    
    content.appendChild(buttonsContainer);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    return modal;
}

/**
 * Faz requisição com retry
 * @param {string} url - URL
 * @param {Object} options - Opções fetch
 * @param {number} retries - Número de tentativas
 * @returns {Promise}
 */
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await delay(1000 * (i + 1)); // Espera exponencial
        }
    }
}

/**
 * Obtém informações do navegador
 * @returns {Object}
 */
function getBrowserInfo() {
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        onLine: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || 'Não disponível'
    };
}

/**
 * Monitora conexão de internet
 */
function monitorConnection() {
    window.addEventListener('online', () => {
        timedLog('Conexão restaurada', 'info');
        showToast('Conexão restaurada', 'success');
    });
    
    window.addEventListener('offline', () => {
        timedLog('Sem conexão', 'warn');
        showToast('Sem conexão com internet', 'error');
    });
}

// Iniciar monitoramento de conexão
monitorConnection();
