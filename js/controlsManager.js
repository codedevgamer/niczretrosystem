// Gerenciador de Controles - USB e Bluetooth - NiczRetroSystem

class ControlsManager {
    constructor() {
        this.gamepads = [];
        this.pressedButtons = new Set();
        this.previousButtonStates = new Map();
        this.axisStates = new Map();
        
        this.pollInterval = null;
        this.repeatDelayTimer = null;
        this.repeatRateTimer = null;
        
        this.keyBindings = new Map();
        this.setupDefaultBindings();
        this.startPolling();
        
        // Event listeners
        window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnected(e));
    }

    setupDefaultBindings() {
        // Mapeamento de botões para navegação
        const C = CONFIG.CONTROLS.BUTTON_CODES;
        
        this.keyBindings.set(C.BUTTON_X, 'up');      // △
        this.keyBindings.set(C.BUTTON_B, 'down');    // ○
        this.keyBindings.set(C.BUTTON_Y, 'left');    // □
        this.keyBindings.set(C.BUTTON_A, 'right');   // ×
        this.keyBindings.set(C.START, 'start');
        this.keyBindings.set(C.BACK, 'select');
        this.keyBindings.set(C.LB, 'pageUp');        // L1
        this.keyBindings.set(C.RB, 'pageDown');      // R1
    }

    startPolling() {
        this.pollInterval = setInterval(() => this.pollGamepads(), CONFIG.CONTROLS.GAMEPAD_POLL_RATE);
    }

    stopPolling() {
        if (this.pollInterval) clearInterval(this.pollInterval);
    }

    pollGamepads() {
        const gamepads = navigator.getGamepads();
        
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            
            if (!gamepad) {
                this.gamepads[i] = null;
                continue;
            }

            if (!this.gamepads[i]) {
                this.gamepads[i] = gamepad;
            }

            // Processar botões
            this.processButtons(gamepad, i);
            
            // Processar analógico
            this.processAnalogSticks(gamepad, i);
        }
    }

    processButtons(gamepad, index) {
        for (let i = 0; i < gamepad.buttons.length; i++) {
            const button = gamepad.buttons[i];
            const pressed = button.pressed;
            const wasPressed = this.previousButtonStates.get(`${index}-${i}`) || false;

            if (pressed && !wasPressed) {
                this.onButtonPressed(i, index);
            } else if (!pressed && wasPressed) {
                this.onButtonReleased(i, index);
            }

            this.previousButtonStates.set(`${index}-${i}`, pressed);
        }
    }

    processAnalogSticks(gamepad, index) {
        const deadzone = CONFIG.CONTROLS.DEADZONE;
        const axes = gamepad.axes;

        // Eixo X analógico esquerdo
        if (Math.abs(axes[0]) > deadzone) {
            if (axes[0] < -deadzone) {
                this.onButtonPressed(CONFIG.CONTROLS.BUTTON_CODES.BUTTON_Y, index); // Left
            } else if (axes[0] > deadzone) {
                this.onButtonPressed(CONFIG.CONTROLS.BUTTON_CODES.BUTTON_A, index); // Right
            }
        }

        // Eixo Y analógico esquerdo
        if (Math.abs(axes[1]) > deadzone) {
            if (axes[1] < -deadzone) {
                this.onButtonPressed(CONFIG.CONTROLS.BUTTON_CODES.BUTTON_X, index); // Up
            } else if (axes[1] > deadzone) {
                this.onButtonPressed(CONFIG.CONTROLS.BUTTON_CODES.BUTTON_B, index); // Down
            }
        }
    }

    onButtonPressed(buttonCode, gamepadIndex) {
        const action = this.keyBindings.get(buttonCode);
        
        if (action) {
            audioManager.playSoundEffect('nav');
            
            const event = new CustomEvent('gamepadButtonPressed', {
                detail: { action, button: buttonCode, gamepad: gamepadIndex }
            });
            document.dispatchEvent(event);

            // Disparar também como evento de teclado para compatibilidade
            this.simulateKeyPress(action);
        }
    }

    onButtonReleased(buttonCode, gamepadIndex) {
        const action = this.keyBindings.get(buttonCode);
        
        if (action) {
            const event = new CustomEvent('gamepadButtonReleased', {
                detail: { action, button: buttonCode, gamepad: gamepadIndex }
            });
            document.dispatchEvent(event);
        }
    }

    simulateKeyPress(action) {
        const keyMap = {
            'up': 'ArrowUp',
            'down': 'ArrowDown',
            'left': 'ArrowLeft',
            'right': 'ArrowRight',
            'select': 'Enter',
            'start': 'Escape',
            'pageUp': 'PageUp',
            'pageDown': 'PageDown'
        };

        const key = keyMap[action];
        if (key) {
            const event = new KeyboardEvent('keydown', {
                key: key,
                code: key,
                bubbles: true
            });
            document.dispatchEvent(event);
        }
    }

    onGamepadConnected(e) {
        console.log(`Controle conectado: ${e.gamepad.id}`);
        audioManager.playSoundEffect('select');
        this.updateControllersList();
        
        const event = new CustomEvent('controllerConnected', {
            detail: e.gamepad
        });
        document.dispatchEvent(event);
    }

    onGamepadDisconnected(e) {
        console.log(`Controle desconectado: ${e.gamepad.id}`);
        this.updateControllersList();
        
        const event = new CustomEvent('controllerDisconnected', {
            detail: e.gamepad
        });
        document.dispatchEvent(event);
    }

    getConnectedGamepads() {
        return navigator.getGamepads().filter(gp => gp !== null);
    }

    updateControllersList() {
        const controllers = this.getConnectedGamepads();
        const listEl = document.getElementById('controllersList');
        
        if (!listEl) return;

        if (controllers.length === 0) {
            listEl.innerHTML = '<p>Nenhum controle detectado</p>';
            return;
        }

        listEl.innerHTML = controllers.map(gp => 
            `<div class="controller-item">🎮 ${gp.id}</div>`
        ).join('');
    }

    testController() {
        const controllers = this.getConnectedGamepads();
        if (controllers.length === 0) {
            alert('Nenhum controle conectado!');
            return;
        }

        alert('Pressione os botões do controle...');
        
        const testListener = (e) => {
            console.log('Botão pressionado:', e.detail);
        };
        
        document.addEventListener('gamepadButtonPressed', testListener);
        
        setTimeout(() => {
            document.removeEventListener('gamepadButtonPressed', testListener);
            alert('Teste concluído!');
        }, 10000);
    }
}

// Criar instância global
const controlsManager = new ControlsManager();

// Adicionar event listener para navegação por teclado (suporte a teclado também)
document.addEventListener('keydown', (e) => {
    const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'Enter': 'select',
        'Escape': 'start'
    };

    const action = keyMap[e.key];
    if (action) {
        audioManager.playSoundEffect('nav');
        e.preventDefault();
    }
});
