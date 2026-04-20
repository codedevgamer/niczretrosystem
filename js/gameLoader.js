// Carregador de ROMs - NiczRetroSystem (NOVO SISTEMA)

class GameLoader {
    constructor() {
        this.games = new Map(); // console -> games[]
        this.currentConsole = null;
        this.currentEmulator = null;
        this.selectedGame = null;
        
        this.initializePlatforms();
    }

    initializePlatforms() {
        for (const [platform, config] of Object.entries(CONFIG.PLATFORMS)) {
            this.games.set(platform, []);
        }
    }

    // Carregar todos os jogos
    async loadAllGames() {
        for (const console of Object.keys(CONFIG.PLATFORMS)) {
            await this.loadGamesForConsole(console);
        }
        this.updateConsoleCounts();
    }

    // Carregar jogos de um console específico
    async loadGamesForConsole(console) {
        try {
            const response = await fetch('config/games.json');
            const data = await response.json();
            
            if (data[console]) {
                this.games.set(console, data[console]);
                return data[console];
            }
        } catch (error) {
            console.warn(`Erro ao carregar jogos de ${console}:`, error);
            return [];
        }
    }

    // Obter lista de consoles
    getConsoles() {
        return Object.keys(CONFIG.PLATFORMS);
    }

    // Obter informações do console
    getConsoleInfo(console) {
        return CONFIG.PLATFORMS[console];
    }

    // Selecionar console
    async selectConsole(console) {
        this.currentConsole = console;
        console.log(`🎮 Console selecionado: ${console}`);
        
        await this.loadGamesForConsole(console);
        this.showEmulators(console);
    }

    // Mostrar lista de emuladores do console
    showEmulators(console) {
        const section = document.getElementById('emulatorsSection');
        const title = document.getElementById('emulatorTitle');
        const list = document.getElementById('emulatorsList');
        
        const consoleName = CONFIG.PLATFORMS[console].name;
        title.textContent = `Escolha o Emulador - ${consoleName}`;
        
        // Limpar lista anterior
        list.innerHTML = '';
        
        // Mostrar console único ou múltiplos emuladores
        const platformConfig = CONFIG.PLATFORMS[console];
        const emulatorName = platformConfig.emulator;
        
        const emulatorCard = document.createElement('div');
        emulatorCard.className = 'emulator-card';
        emulatorCard.innerHTML = `
            <div class="emulator-icon">⚙️</div>
            <h3>${emulatorName}</h3>
            <p>${this.games.get(console).length} jogos disponíveis</p>
        `;
        
        emulatorCard.addEventListener('click', () => this.selectEmulator(console, emulatorName));
        list.appendChild(emulatorCard);
        
        // Trocar para seção de emuladores
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        section.classList.add('active');
    }

    // Selecionar emulador
    selectEmulator(console, emulator) {
        this.currentEmulator = emulator;
        console.log(`📂 Emulador selecionado: ${emulator}`);
        
        this.showGames(console);
    }

    // Mostrar lista de jogos
    showGames(console) {
        const section = document.getElementById('gamesSection');
        const title = document.getElementById('gamesTitle');
        const list = document.getElementById('gamesList');
        
        const games = this.games.get(console) || [];
        
        title.textContent = `${CONFIG.PLATFORMS[console].name} - ${games.length} Jogos`;
        
        // Limpar lista anterior
        list.innerHTML = '';
        
        if (games.length === 0) {
            list.innerHTML = '<p class="no-games">Nenhum jogo encontrado</p>';
        } else {
            // Criar lista de nomes (sem imagens)
            const gamesList = document.createElement('div');
            gamesList.className = 'games-names-list';
            
            games.forEach((game, index) => {
                const gameItem = document.createElement('div');
                gameItem.className = 'game-name-item';
                gameItem.innerHTML = `
                    <span class="game-number">${index + 1}.</span>
                    <span class="game-name">${game.name}</span>
                    <span class="game-year">(${game.year})</span>
                `;
                
                gameItem.addEventListener('click', () => this.selectGame(console, game));
                gamesList.appendChild(gameItem);
            });
            
            list.appendChild(gamesList);
        }
        
        // Trocar para seção de jogos
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        section.classList.add('active');
    }

    // Selecionar jogo
    selectGame(console, game) {
        this.currentConsole = console;
        this.selectedGame = game;
        
        console.log(`🎮 Jogo selecionado: ${game.name}`);
        
        this.showGameModal(game);
    }

    // Mostrar modal do jogo
    showGameModal(game) {
        const modal = document.getElementById('gameModal');
        
        document.getElementById('gameTitle').textContent = game.name;
        document.getElementById('gameDescription').textContent = game.description;
        document.getElementById('gameGenre').textContent = `📌 ${game.genre}`;
        document.getElementById('gameYear').textContent = `📅 ${game.year}`;
        document.getElementById('gameDeveloper').textContent = `👨‍💻 Desenvolvedor: ${game.developer}`;
        document.getElementById('gameRating').textContent = `⭐ Avaliação: ${game.rating}/5.0`;
        
        modal.classList.remove('hidden');
    }

    // Fechar modal
    closeGameModal() {
        document.getElementById('gameModal').classList.add('hidden');
    }

    // Lançar jogo
    async launchGame(game) {
        if (!game) game = this.selectedGame;
        if (!game) return;

        console.log(`🚀 Iniciando: ${game.name}`);
        
        this.closeGameModal();
        
        // Registrar jogo recente
        addRecentlyPlayed(game.id);

        // Chamar EmulationStation via bridge
        emulationStationBridge.launchGame(
            this.currentConsole,
            game.rom,
            game.name
        );
    }

    // Toggle favorito
    toggleFavorite(game) {
        if (!game) game = this.selectedGame;
        if (!game) return;

        const gameId = game.id;
        const favorites = getFavorites();
        const isFavorite = favorites.includes(gameId);

        if (isFavorite) {
            removeFavorite(gameId);
            const btn = document.getElementById('favGameBtn');
            if (btn) btn.textContent = '🤍 Favoritar';
        } else {
            addFavorite(gameId);
            const btn = document.getElementById('favGameBtn');
            if (btn) btn.textContent = '❤️ Desfavoritar';
        }
    }

    // Atualizar contador de consoles
    updateConsoleCounts() {
        for (const [console, games] of this.games) {
            const countEl = document.getElementById(`${console}-count`);
            if (countEl) {
                const count = games.length;
                countEl.textContent = `${count} ${count === 1 ? 'jogo' : 'jogos'}`;
            }
        }
    }

    // Voltar para consoles
    backToConsoles() {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('consolesSection').classList.add('active');
    }

    // Voltar para emuladores
    backToEmulators() {
        if (this.currentConsole) {
            this.showEmulators(this.currentConsole);
        } else {
            this.backToConsoles();
        }
    }
}

// Criar instância global
const gameLoader = new GameLoader();
