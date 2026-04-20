// NiczRetroSystem - Main Application Logic (NOVO SISTEMA)

class NiczRetroSystem {
    constructor() {
        this.currentSection = 'consoles';
        this.isInitialized = false;
        
        // Elementos do DOM
        this.elements = {
            splashScreen: document.getElementById('splashScreen'),
            mainContainer: document.getElementById('mainContainer'),
            navButtons: document.querySelectorAll('.nav-btn'),
            sections: document.querySelectorAll('.section'),
            consoleCards: document.querySelectorAll('.console-card'),
            
            // Botões de ação
            backFromEmulators: document.getElementById('backFromEmulators'),
            backFromGames: document.getElementById('backFromGames'),
            gameModal: document.getElementById('gameModal'),
            modalClose: document.querySelector('.modal-close'),
            playGameBtn: document.getElementById('playGameBtn'),
            favGameBtn: document.getElementById('favGameBtn'),
            closeGameBtn: document.getElementById('closeGameBtn'),
            
            // Configurações
            themeSelect: document.getElementById('themeSelect'),
            testControllerBtn: document.getElementById('testControllerBtn'),
            restartBtn: document.getElementById('restartBtn'),
            shutdownBtn: document.getElementById('shutdownBtn'),
        };

        this.init();
    }

    // Inicialização da aplicação
    async init() {
        console.log('🚀 Inicializando NiczRetroSystem...');
        
        try {
            // 1. Configurar temas
            this.setupThemes();
            
            // 2. Precarregar todos os jogos
            await gameLoader.loadAllGames();
            
            // 3. Configurar event listeners
            this.setupEventListeners();
            
            // 4. Atualizar informações do sistema
            this.updateSystemInfo();
            
            // 5. Mostrar interface principal (após splash screen)
            this.showMainUI();
            
            // 6. Iniciar atualização de hora
            this.startClockUpdate();
            
            this.isInitialized = true;
            console.log('✅ Sistema inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    }

    // Ocultar splash screen e mostrar interface
    showMainUI() {
        setTimeout(() => {
            this.elements.splashScreen.classList.add('hidden');
            this.elements.mainContainer.classList.remove('hidden');
        }, 3000);
    }

    // Configurar themes
    setupThemes() {
        const savedTheme = localStorage.getItem('niczretro_theme') || 'arcade';
        this.applyTheme(savedTheme);
        
        if (this.elements.themeSelect) {
            this.elements.themeSelect.value = savedTheme;
        }
    }

    // Aplicar tema
    applyTheme(themeName) {
        document.body.className = '';
        
        if (themeName !== 'arcade') {
            document.body.classList.add(`theme-${themeName}`);
        }
        
        localStorage.setItem('niczretro_theme', themeName);
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegação principal
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Consoles
        this.elements.consoleCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const console = e.currentTarget.dataset.console;
                gameLoader.selectConsole(console);
            });
        });

        // Botões de volta
        this.elements.backFromEmulators?.addEventListener('click', () => gameLoader.backToConsoles());
        this.elements.backFromGames?.addEventListener('click', () => gameLoader.backToEmulators());

        // Modal de jogo
        this.elements.modalClose?.addEventListener('click', () => gameLoader.closeGameModal());
        this.elements.playGameBtn?.addEventListener('click', () => gameLoader.launchGame());
        this.elements.favGameBtn?.addEventListener('click', () => gameLoader.toggleFavorite());
        this.elements.closeGameBtn?.addEventListener('click', () => gameLoader.closeGameModal());

        // Configurações
        this.elements.themeSelect?.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
        });

        this.elements.testControllerBtn?.addEventListener('click', () => {
            controlsManager.testController();
        });

        this.elements.restartBtn?.addEventListener('click', () => this.restartSystem());
        this.elements.shutdownBtn?.addEventListener('click', () => this.shutdownSystem());

        // Modal de clique (fechar ao clicar fora)
        if (this.elements.gameModal) {
            this.elements.gameModal.addEventListener('click', (e) => {
                if (e.target === this.elements.gameModal) {
                    gameLoader.closeGameModal();
                }
            });
        }

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.elements.gameModal.classList.contains('hidden')) {
                gameLoader.closeGameModal();
            }
        });
    }

    // Trocar seção
    switchSection(sectionName) {
        if (sectionName === this.currentSection) return;

        // Remover classe active de todas as seções
        this.elements.sections.forEach(section => {
            section.classList.remove('active');
        });

        // Remover classe active de todos os botões de navegação
        this.elements.navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Ativar seção selecionada
        const sectionEl = document.getElementById(`${sectionName}Section`);
        if (sectionEl) {
            sectionEl.classList.add('active');
        }

        // Ativar botão correspondente
        const navBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }

        this.currentSection = sectionName;
        console.log(`📍 Seção: ${sectionName}`);
    }

    // Atualizar informações do sistema
    updateSystemInfo() {
        const platformEl = document.getElementById('platformInfo');
        const storageEl = document.getElementById('storageInfo');

        if (platformEl) {
            platformEl.textContent = this.getPlatformInfo();
        }

        if (storageEl) {
            this.getStorageInfo().then(info => {
                if (storageEl) storageEl.textContent = info;
            });
        }
    }

    // Obter informação da plataforma
    getPlatformInfo() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Raspbian') || userAgent.includes('armv7l')) {
            return '🥧 Raspberry Pi';
        } else if (userAgent.includes('Linux')) {
            return '🐧 Linux';
        } else if (userAgent.includes('Windows')) {
            return '🪟 Windows';
        } else if (userAgent.includes('Mac')) {
            return '🍎 macOS';
        }
        
        return 'Desconhecido';
    }

    // Obter informações de armazenamento
    async getStorageInfo() {
        try {
            const storage = await navigator.storage.estimate();
            const used = (storage.usage / (1024 * 1024 * 1024)).toFixed(2);
            const quota = (storage.quota / (1024 * 1024 * 1024)).toFixed(2);
            return `${used}GB / ${quota}GB`;
        } catch (error) {
            return 'Não disponível';
        }
    }

    // Iniciar atualização de relógio
    startClockUpdate() {
        setInterval(() => {
            const now = new Date();
            const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const clockEl = document.getElementById('currentTime');
            if (clockEl) clockEl.textContent = time;
        }, 1000);
    }

    // Reiniciar sistema
    restartSystem() {
        if (confirm('Deseja reiniciar o sistema?')) {
            console.log('Reiniciando sistema...');
            fetch('/api/restart', { method: 'POST' }).catch(() => {
                alert('Sistema será reiniciado em breve');
            });
        }
    }

    // Desligar sistema
    shutdownSystem() {
        if (confirm('Deseja desligar o sistema?')) {
            console.log('Desligando sistema...');
            fetch('/api/shutdown', { method: 'POST' }).catch(() => {
                alert('Sistema será desligado em breve');
            });
        }
    }
}

// Animar canvas de fundo
function initBackgroundAnimation() {
    const canvas = document.getElementById('backgroundCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar animação de fundo simples
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 0, 110, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 217, 255, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Padrão de partículas
        for (let i = 0; i < 5; i++) {
            const x = (Math.sin(time * 0.001 + i) + 1) * canvas.width / 2;
            const y = (Math.cos(time * 0.0007 + i) + 1) * canvas.height / 2;
            
            ctx.fillStyle = `rgba(0, 217, 255, ${0.3 - Math.sin(time * 0.002 + i) * 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, 50, 0, Math.PI * 2);
            ctx.fill();
        }

        time++;
        requestAnimationFrame(animate);
    }

    animate();
}

// Redimensionar canvas ao mudar tamanho de janela
window.addEventListener('resize', () => {
    const canvas = document.getElementById('backgroundCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Carregado');
    initBackgroundAnimation();
    window.app = new NiczRetroSystem();
});

// Tratamento de erros global
window.addEventListener('error', (e) => {
    console.error('Erro global:', e.error);
});
