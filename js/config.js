// Configurações do Sistema NiczRetroSystem

const CONFIG = {
    SYSTEM_NAME: 'NiczRetroSystem',
    VERSION: '1.0.0',
    SPLASH_DURATION: 3000, // ms
    
    // Plataformas suportadas
    PLATFORMS: {
        psp: {
            name: 'PSP',
            icon: '📱',
            emulator: 'ppsspp',
            romPath: 'roms/psp',
            extensions: ['.iso', '.cso', '.pbp']
        },
        ps2: {
            name: 'PS2',
            icon: '🎮',
            emulator: 'pcsx2',
            romPath: 'roms/ps2',
            extensions: ['.iso', '.bin', '.cue']
        },
        nintendo: {
            name: 'Nintendo',
            icon: '🎯',
            emulator: 'retroarch',
            romPath: 'roms/nintendo',
            extensions: ['.nes', '.snes', '.n64', '.gb', '.gbc', '.gba']
        },
        wii: {
            name: 'Wii',
            icon: '💿',
            emulator: 'dolphin',
            romPath: 'roms/wii',
            extensions: ['.iso', '.wbfs']
        },
        sega: {
            name: 'Sega',
            icon: '⚡',
            emulator: 'retroarch',
            romPath: 'roms/sega',
            extensions: ['.bin', '.gen', '.smd', '.md']
        }
    },

    // Configurações de áudio
    AUDIO: {
        sfxVolume: 70,
        musicVolume: 80,
        soundEnabled: true,
        sounds: {
            nav: 'audio/nav-sound.wav',
            select: 'audio/select-sound.wav',
            startup: 'audio/startup-sound.wav'
        }
    },

    // Configurações visuais
    THEMES: {
        arcade: 'theme-arcade',
        neon: 'theme-neon',
        dark: 'theme-dark',
        light: 'theme-light'
    },

    // Configurações do controle
    CONTROLS: {
        GAMEPAD_POLL_RATE: 100, // ms
        BUTTON_CODES: {
            // Bot��es padrão
            BUTTON_A: 0,      // ×
            BUTTON_B: 1,      // ○
            BUTTON_X: 2,      // △
            BUTTON_Y: 3,      // □
            LB: 4,            // L1
            RB: 5,            // R1
            LT: 6,            // L2
            RT: 7,            // R2
            BACK: 8,          // SELECT
            START: 9,         // START
            LS: 10,           // L3
            RS: 11,           // R3
        },
        AXIS_CODES: {
            LX: 0,     // Analógico esquerdo X
            LY: 1,     // Analógico esquerdo Y
            RX: 2,     // Analógico direito X
            RY: 3,     // Analógico direito Y
        },
        DEADZONE: 0.3,
        REPEAT_DELAY: 500,  // ms
        REPEAT_RATE: 100    // ms
    },

    // Mensagens PT-BR
    MESSAGES: {
        loading: 'Carregando...',
        noGames: 'Nenhum jogo encontrado',
        noController: 'Nenhum controle detectado',
        playing: 'Reproduzindo',
        paused: 'Pausado',
        volume: 'Volume',
        theme: 'Tema',
        language: 'Idioma',
        about: 'Sobre',
        settings: 'Configurações',
        back: 'Voltar',
        select: 'Selecionar',
        confirm: 'Confirmar',
        cancel: 'Cancelar',
        favorites: 'Favoritos',
        recentlyPlayed: 'Jogados Recentemente'
    },

    // Armazenamento local
    STORAGE_KEYS: {
        FAVORITES: 'niczretro_favorites',
        RECENTLY_PLAYED: 'niczretro_recent',
        SETTINGS: 'niczretro_settings',
        THEME: 'niczretro_theme',
        VOLUME: 'niczretro_volume'
    }
};

// Função para carregar configurações do localStorage
function loadSettings() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
    if (saved) {
        const settings = JSON.parse(saved);
        Object.assign(CONFIG.AUDIO, settings.audio || {});
        return settings;
    }
    return null;
}

// Função para salvar configurações
function saveSettings(settings) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Função para obter favoritos
function getFavorites() {
    const fav = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
    return fav ? JSON.parse(fav) : [];
}

// Função para adicionar favorito
function addFavorite(gameId) {
    const favorites = getFavorites();
    if (!favorites.includes(gameId)) {
        favorites.push(gameId);
        localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
}

// Função para remover favorito
function removeFavorite(gameId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(gameId);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
}

// Função para obter jogos recentes
function getRecentlyPlayed() {
    const recent = localStorage.getItem(CONFIG.STORAGE_KEYS.RECENTLY_PLAYED);
    return recent ? JSON.parse(recent) : [];
}

// Função para adicionar jogo recente
function addRecentlyPlayed(gameId, timestamp = Date.now()) {
    const recent = getRecentlyPlayed();
    const filtered = recent.filter(g => g.id !== gameId);
    filtered.unshift({ id: gameId, timestamp });
    localStorage.setItem(CONFIG.STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(filtered.slice(0, 20)));
}

// Carregar configurações ao iniciar
loadSettings();
