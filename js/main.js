// NiczRetroSystem - Main Application Logic
// Orquestrador principal da aplicação

class NiczRetroSystem {
    constructor() {
        this.currentSection = 'games';
        this.isInitialized = false;
        
        // Elementos do DOM
        this.elements = {
            splashScreen: document.getElementById('splashScreen'),
            mainContainer: document.getElementById('mainContainer'),
            navButtons: document.querySelectorAll('.nav-btn'),
            sections: document.querySelectorAll('.section'),
            platformCards: document.querySelectorAll('.platform-card'),
            gameModal: document.getElementById('gameModal'),
            modalClose: document.querySelector('.modal-close'),
            backBtn: document.getElementById('backBtn'),
            
            // Música
            playBtn: document.getElementById('playBtn'),
            pauseBtn: null,
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            playlistItems: document.getElementById('playlistItems'),
            
            // Configurações
            themeSelect: document.getElementById('themeSelect'),
            sfxVolume: document.getElementById('sfxVolume'),
            sfxVolumeDisplay: document.getElementById('sfxVolumeDisplay'),
            musicVolume: document.getElementById('musicVolume'),
            musicVolumeDisplay: document.getElementById('musicVolumeDisplay'),
            soundEnabled: document.getElementById('soundEnabled'),
            testControllerBtn: document.getElementById('testControllerBtn'),
            restartBtn: document.getElementById('restartBtn'),
            shutdownBtn: document.getElementById('shutdownBtn'),
            
            // Game modal
            playGameBtn: document.getElementById('playGameBtn'),
            favGameBtn: document.getElementById('favGameBtn'),
            closeGameBtn: document.getElementById('closeGameBtn'),
        };

        this.init();
    }

    // Inicialização da aplicação
    async init() {
        console.log('🚀 Inicializando NiczRetroSystem...');
        
        try {
            // 1. Configurar temas
            this.setupThemes();
            
            // 2. Precarregar jogos
            await gameLoader.preloadAllGames();
            
            // 3. Configurar event listeners
            this.setupEventListeners();
            
            // 4. Carregar playlist de músicas
            await this.loadMusicPlaylist();
            
            // 5. Atualizar informações do sistema
            this.updateSystemInfo();
            
            // 6. Mostrar interface principal (após splash screen)
            this.showMainUI();
            
            // 7. Iniciar atualização de hora
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
            audioManager.playSoundEffect('startup');
        }, CONFIG.SPLASH_DURATION);
    }

    // Configurar themes
    setupThemes() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'arcade';
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
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, themeName);
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegação principal
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Plataformas
        this.elements.platformCards.forEach(card => {
            card.addEventListener('click', (e) => this.selectPlatform(e.currentTarget.dataset.platform));
        });

        // Modal de jogo
        this.elements.modalClose?.addEventListener('click', () => this.closeGameModal());
        this.elements.backBtn?.addEventListener('click', () => this.backToGames());
        this.elements.playGameBtn?.addEventListener('click', () => this.launchSelectedGame());
        this.elements.favGameBtn?.addEventListener('click', () => this.toggleFavorite());
        this.elements.closeGameBtn?.addEventListener('click', () => this.closeGameModal());

        // Música
        if (this.elements.playBtn) {
            this.elements.playBtn.addEventListener('click', () => this.toggleMusicPlayback());
        }
        this.elements.prevBtn?.addEventListener('click', () => {
            audioManager.previousTrack();
            audioManager.playSoundEffect('nav');
        });
        this.elements.nextBtn?.addEventListener('click', () => {
            audioManager.nextTrack();
            audioManager.playSoundEffect('nav');
        });

        // Configurações
        this.elements.themeSelect?.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
            audioManager.playSoundEffect('select');
        });

        this.elements.sfxVolume?.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            audioManager.setSfxVolume(volume);
            if (this.elements.sfxVolumeDisplay) {
                this.elements.sfxVolumeDisplay.textContent = `${volume}%`;
            }
        });

        this.elements.musicVolume?.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            audioManager.setMusicVolume(volume);
            if (this.elements.musicVolumeDisplay) {
                this.elements.musicVolumeDisplay.textContent = `${volume}%`;
            }
        });

        this.elements.soundEnabled?.addEventListener('change', (e) => {
            const enabled = audioManager.toggleSound();
            console.log('Sons:', enabled ? 'Ativados' : 'Desativados');
        });

        this.elements.testControllerBtn?.addEventListener('click', () => {
            controlsManager.testController();
        });

        this.elements.restartBtn?.addEventListener('click', () => this.restartSystem());
        this.elements.shutdownBtn?.addEventListener('click', () => this.shutdownSystem());

        // Keyboard navigation (fallback)
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Gamepad events
        document.addEventListener('gamepadButtonPressed', (e) => this.handleGamepadInput(e.detail));

        // Modal de clique
        if (this.elements.gameModal) {
            this.elements.gameModal.addEventListener('click', (e) => {
                if (e.target === this.elements.gameModal) {
                    this.closeGameModal();
                }
            });
        }

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.elements.gameModal.classList.contains('hidden')) {
                this.closeGameModal();
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
        audioManager.playSoundEffect('nav');

        console.log(`📍 Seção: ${sectionName}`);
    }

    // Selecionar plataforma
    async selectPlatform(platformName) {
        console.log(`🎮 Plataforma selecionada: ${platformName}`);
        
        const gamesList = document.getElementById('gamesList');
        if (!gamesList) return;

        // Esconder plataformas e mostrar lista de jogos
        document.querySelector('.platforms-grid').classList.add('hidden');
        gamesList.classList.add('active');

        // Carregar e exibir jogos
        await gameLoader.displayGames(platformName);
        
        audioManager.playSoundEffect('select');
    }

    // Voltar à seleção de plataformas
    backToGames() {
        const gamesList = document.getElementById('gamesList');
        const platformsGrid = document.querySelector('.platforms-grid');

        if (gamesList && platformsGrid) {
            gamesList.classList.remove('active');
            platformsGrid.classList.remove('hidden');
            audioManager.playSoundEffect('nav');
        }
    }

    // Fechar modal de jogo
    closeGameModal() {
        this.elements.gameModal.classList.add('hidden');
        audioManager.playSoundEffect('nav');
    }

    // Lançar jogo selecionado
    launchSelectedGame() {
        if (gameLoader.selectedGame) {
            this.closeGameModal();
            audioManager.playSoundEffect('select');
            gameLoader.launchGame(gameLoader.selectedGame);
        }
    }

    // Toggle favorito
    toggleFavorite() {
        if (!gameLoader.selectedGame) return;

        const gameId = gameLoader.selectedGame.id;
        const favorites = getFavorites();

        if (favorites.includes(gameId)) {
            removeFavorite(gameId);
            this.elements.favGameBtn.textContent = '🤍 Favoritar';
        } else {
            addFavorite(gameId);
            this.elements.favGameBtn.textContent = '❤️ Desfavoritar';
        }

        audioManager.playSoundEffect('select');
    }

    // Carregar playlist de músicas
    async loadMusicPlaylist() {
        // Exemplo de playlist (em produção, carregar de arquivos)
        const playlist = [
            {
                name: 'Menu Theme',
                artist: 'NiczRetroSystem',
                path: 'audio/background-music.wav',
                cover: 'images/logo.png'
            },
            {
                name: 'Startup Sound',
                artist: 'NiczRetroSystem',
                path: 'audio/startup-sound.wav',
                cover: 'images/logo.png'
            }
        ];

        await audioManager.loadPlaylist(playlist);
        this.updatePlaylist();
    }

    // Atualizar playlist UI
    updatePlaylist() {
        const playlist = audioManager.getPlaylist();
        const playlistItems = document.getElementById('playlistItems');

        if (!playlistItems) return;

        playlistItems.innerHTML = playlist.map((track, index) => `
            <div class="playlist-item ${index === audioManager.currentTrackIndex ? 'active' : ''}" 
                 data-index="${index}">
                ${track.name} - ${track.artist}
            </div>
        `).join('');

        // Adicionar event listeners
        playlistItems.querySelectorAll('.playlist-item').forEach((item) => {
            item.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                audioManager.playMusic(index);
                this.updatePlaylist();
                audioManager.playSoundEffect('select');
            });
        });
    }

    // Toggle reprodução de música
    toggleMusicPlayback() {
        if (audioManager.isPlaying) {
            audioManager.pauseMusic();
            this.elements.playBtn.textContent = '▶️ Reproduzir';
        } else {
            if (audioManager.playlist.length === 0) {
                audioManager.playMusic(0);
            } else {
                audioManager.resumeMusic();
            }
            this.elements.playBtn.textContent = '⏸️ Pausar';
        }

        audioManager.playSoundEffect('select');
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

    // Manipular input de teclado
    handleKeyboard(event) {
        const keyMap = {
            'ArrowUp': () => console.log('↑'),
            'ArrowDown': () => console.log('↓'),
            'ArrowLeft': () => console.log('←'),
            'ArrowRight': () => console.log('→'),
            'Enter': () => console.log('SELECT'),
            'Escape': () => console.log('START'),
        };

        if (keyMap[event.key]) {
            event.preventDefault();
            keyMap[event.key]();
        }
    }

    // Manipular input de gamepad
    handleGamepadInput(detail) {
        console.log('Gamepad input:', detail.action);
        
        const handlers = {
            'up': () => this.navigateUp(),
            'down': () => this.navigateDown(),
            'left': () => this.navigateLeft(),
            'right': () => this.navigateRight(),
            'select': () => this.handleSelect(),
            'start': () => this.handleStart(),
        };

        if (handlers[detail.action]) {
            handlers[detail.action]();
        }
    }

    // Navegação (stub)
    navigateUp() { console.log('Navegar para cima'); }
    navigateDown() { console.log('Navegar para baixo'); }
    navigateLeft() { console.log('Navegar para esquerda'); }
    navigateRight() { console.log('Navegar para direita'); }
    handleSelect() { console.log('Selecionar'); }
    handleStart() { console.log('Menu'); }

    // Reiniciar sistema
    restartSystem() {
        if (confirm('Deseja reiniciar o sistema?')) {
            console.log('Reiniciando sistema...');
            // Chamar API para reiniciar
            fetch('/api/restart', { method: 'POST' }).catch(() => {
                alert('Sistema será reiniciado em breve');
            });
        }
    }

    // Desligar sistema
    shutdownSystem() {
        if (confirm('Deseja desligar o sistema?')) {
            console.log('Desligando sistema...');
            // Chamar API para desligar
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
