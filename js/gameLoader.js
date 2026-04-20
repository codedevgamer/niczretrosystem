// Carregador de ROMs - NiczRetroSystem

class GameLoader {
    constructor() {
        this.games = new Map(); // platform -> games[]
        this.currentPlatform = null;
        this.selectedGame = null;
        
        this.initializePlatforms();
    }

    initializePlatforms() {
        for (const [platform, config] of Object.entries(CONFIG.PLATFORMS)) {
            this.games.set(platform, []);
        }
    }

    async loadGames(platform) {
        try {
            // Carregar lista de jogos do config.json
            const response = await fetch('config/games.json');
            const data = await response.json();
            
            if (data[platform]) {
                this.games.set(platform, data[platform]);
                return data[platform];
            }
        } catch (error) {
            console.warn(`Erro ao carregar jogos de ${platform}:`, error);
            // Retornar lista vazia ou gerar jogos exemplo
            return this.generateSampleGames(platform);
        }
    }

    generateSampleGames(platform) {
        // Gerar jogos de exemplo para demonstração
        const samples = {
            psp: [
                { id: 1, name: 'Grand Theft Auto: Liberty City Stories', rom: 'gta-lcs.iso', year: 2005, image: 'images/games/psp/gta.jpg' },
                { id: 2, name: 'Metal Gear Solid: Peace Walker', rom: 'mgs-pw.iso', year: 2010, image: 'images/games/psp/mgs.jpg' },
                { id: 3, name: 'Monster Hunter Freedom', rom: 'mh.iso', year: 2005, image: 'images/games/psp/mh.jpg' }
            ],
            ps2: [
                { id: 4, name: 'Metal Gear Solid 2', rom: 'mgs2.iso', year: 2001, image: 'images/games/ps2/mgs2.jpg' },
                { id: 5, name: 'Final Fantasy X', rom: 'ffx.iso', year: 2001, image: 'images/games/ps2/ffx.jpg' },
                { id: 6, name: 'Grand Theft Auto III', rom: 'gta3.iso', year: 2001, image: 'images/games/ps2/gta3.jpg' }
            ],
            nintendo: [
                { id: 7, name: 'Super Mario Bros', rom: 'smb.nes', year: 1985, image: 'images/games/nes/smb.jpg' },
                { id: 8, name: 'The Legend of Zelda', rom: 'zelda.nes', year: 1986, image: 'images/games/nes/zelda.jpg' },
                { id: 9, name: 'Super Mario World', rom: 'smw.snes', year: 1990, image: 'images/games/snes/smw.jpg' }
            ],
            wii: [
                { id: 10, name: 'Super Mario Galaxy', rom: 'smg.iso', year: 2007, image: 'images/games/wii/smg.jpg' },
                { id: 11, name: 'The Legend of Zelda: Twilight Princess', rom: 'zelda-tp.iso', year: 2006, image: 'images/games/wii/zelda-tp.jpg' },
                { id: 12, name: 'Wii Sports', rom: 'wii-sports.iso', year: 2006, image: 'images/games/wii/wii-sports.jpg' }
            ],
            sega: [
                { id: 13, name: 'Sonic The Hedgehog', rom: 'sonic.bin', year: 1991, image: 'images/games/sega/sonic.jpg' },
                { id: 14, name: 'Sonic 2', rom: 'sonic2.bin', year: 1992, image: 'images/games/sega/sonic2.jpg' },
                { id: 15, name: 'Mortal Kombat', rom: 'mk.bin', year: 1992, image: 'images/games/sega/mk.jpg' }
            ]
        };

        const games = samples[platform] || [];
        this.games.set(platform, games);
        return games;
    }

    async displayGames(platform) {
        this.currentPlatform = platform;
        const games = await this.loadGames(platform);
        
        const gamesGrid = document.getElementById('gamesGrid');
        if (!gamesGrid) return;

        if (games.length === 0) {
            gamesGrid.innerHTML = '<p>Nenhum jogo encontrado para esta plataforma</p>';
            return;
        }

        gamesGrid.innerHTML = games.map(game => `
            <div class="game-item" data-game-id="${game.id}">
                <img src="${game.image || 'images/games/placeholder.jpg'}" class="game-thumbnail" alt="${game.name}">
                <p>${game.name}</p>
            </div>
        `).join('');

        // Adicionar event listeners
        gamesGrid.querySelectorAll('.game-item').forEach(item => {
            item.addEventListener('click', (e) => this.selectGame(parseInt(e.currentTarget.dataset.gameId)));
        });
    }

    selectGame(gameId) {
        const games = this.games.get(this.currentPlatform);
        this.selectedGame = games.find(g => g.id === gameId);
        
        if (this.selectedGame) {
            audioManager.playSoundEffect('select');
            this.showGameModal(this.selectedGame);
        }
    }

    showGameModal(game) {
        const modal = document.getElementById('gameModal');
        if (!modal) return;

        document.getElementById('gameImage').src = game.image || 'images/games/placeholder.jpg';
        document.getElementById('gameTitle').textContent = game.name;
        document.getElementById('gameDescription').textContent = `Plataforma: ${CONFIG.PLATFORMS[this.currentPlatform].name}`;
        document.getElementById('gamePlatform').textContent = CONFIG.PLATFORMS[this.currentPlatform].name;
        document.getElementById('gameYear').textContent = game.year || '';

        modal.classList.remove('hidden');
    }

    async launchGame(game) {
        if (!game) game = this.selectedGame;
        if (!game) return;

        console.log(`Iniciando: ${game.name}`);
        
        // Registrar jogo recente
        addRecentlyPlayed(game.id);

        // Chamar EmulationStation via bridge
        emulationStationBridge.launchGame(
            this.currentPlatform,
            game.rom,
            game.name
        );
    }

    updateGameCounts() {
        for (const [platform, games] of this.games) {
            const countEl = document.getElementById(`${platform}-count`);
            if (countEl) {
                const count = games.length;
                countEl.textContent = `${count} ${count === 1 ? 'jogo' : 'jogos'}`;
            }
        }
    }

    async preloadAllGames() {
        for (const platform of Object.keys(CONFIG.PLATFORMS)) {
            await this.loadGames(platform);
        }
        this.updateGameCounts();
    }
}

// Criar instância global
const gameLoader = new GameLoader();
