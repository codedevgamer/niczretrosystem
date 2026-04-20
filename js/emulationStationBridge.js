// Bridge com EmulationStation - NiczRetroSystem

class EmulationStationBridge {
    constructor() {
        this.isConnected = false;
        this.apiUrl = 'http://localhost:8080/api'; // Ajuste conforme necessário
    }

    // Lançar um jogo via EmulationStation
    launchGame(platform, romFile, gameName) {
        console.log(`Lançando ${gameName} (${platform})`);
        
        // Método 1: Via HTTP request (se ES expõe API)
        this.launchViaAPI(platform, romFile, gameName);
        
        // Método 2: Via script shell (para uso local)
        this.launchViaScript(platform, romFile);
    }

    async launchViaAPI(platform, romFile, gameName) {
        try {
            const payload = {
                command: 'launch',
                platform: platform,
                rom: romFile,
                name: gameName,
                emulator: CONFIG.PLATFORMS[platform].emulator
            };

            const response = await fetch(`${this.apiUrl}/launch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('Jogo lançado via API');
            }
        } catch (error) {
            console.warn('Erro ao lançar via API, tentando script:', error);
            this.launchViaScript(platform, romFile);
        }
    }

    launchViaScript(platform, romFile) {
        // Chamar script shell via API ou diretamente
        const emulatorConfig = CONFIG.PLATFORMS[platform];
        const romPath = `${emulatorConfig.romPath}/${romFile}`;
        
        // Comando para executar o jogo
        const command = this.buildLaunchCommand(platform, romPath);
        
        // Enviar comando para ser executado no servidor
        this.executeCommand(command);
    }

    buildLaunchCommand(platform, romPath) {
        const platformConfig = CONFIG.PLATFORMS[platform];
        
        const commands = {
            psp: `ppsspp "${romPath}"`,
            ps2: `pcsx2 "${romPath}"`,
            nintendo: `retroarch -L /usr/lib/libretro/cores/snes9x_libretro.so "${romPath}"`,
            wii: `dolphin -e "${romPath}"`,
            sega: `retroarch -L /usr/lib/libretro/cores/genesis_plus_gx_libretro.so "${romPath}"`
        };

        return commands[platform] || `${platformConfig.emulator} "${romPath}"`;
    }

    async executeCommand(command) {
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });

            if (!response.ok) {
                console.error('Erro ao executar comando');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            // Tentar fallback
            this.launchGameLocal(command);
        }
    }

    launchGameLocal(command) {
        // Para ambiente de desenvolvimento/debug
        console.log('Comando a executar:', command);
        alert(`Em produção, executaria: ${command}`);
    }

    // Integração com EmulationStation XML
    async getES_GamesList(platform) {
        try {
            const response = await fetch(`/api/games/${platform}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter lista de jogos:', error);
            return [];
        }
    }

    // Sincronizar favoritos com ES
    async syncFavoritesToES() {
        const favorites = getFavorites();
        
        try {
            await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorites })
            });
        } catch (error) {
            console.warn('Não foi possível sincronizar favoritos:', error);
        }
    }

    // Obter caminho do diretório de ROMs
    getROMPath(platform) {
        return CONFIG.PLATFORMS[platform].romPath;
    }

    // Verificar se ES está executando
    async checkConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/status`);
            this.isConnected = response.ok;
            return this.isConnected;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }
}

// Criar instância global
const emulationStationBridge = new EmulationStationBridge();

// Verificar conexão ao iniciar
emulationStationBridge.checkConnection();
