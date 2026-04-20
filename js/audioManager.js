// Gerenciador de Áudio - NiczRetroSystem

class AudioManager {
    constructor() {
        this.sfxVolume = CONFIG.AUDIO.sfxVolume;
        this.musicVolume = CONFIG.AUDIO.musicVolume;
        this.soundEnabled = CONFIG.AUDIO.soundEnabled;
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentMusic = null;
        this.currentMusicSource = null;
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        
        this.sfxGain = this.audioContext.createGain();
        this.sfxGain.connect(this.masterGain);
        
        this.musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.masterGain);
        
        this.updateVolumes();
        this.initializeAudio();
    }

    initializeAudio() {
        // Criar elementos de áudio
        this.musicAudioElement = new Audio();
        this.musicAudioElement.crossOrigin = 'anonymous';
        this.musicSource = this.audioContext.createMediaElementAudioSource(this.musicAudioElement);
        this.musicSource.connect(this.musicGain);
    }

    updateVolumes() {
        this.sfxGain.gain.value = this.soundEnabled ? this.sfxVolume / 100 : 0;
        this.musicGain.gain.value = this.musicVolume / 100;
    }

    playSoundEffect(soundName) {
        if (!this.soundEnabled) return;

        const soundPath = CONFIG.AUDIO.sounds[soundName];
        if (!soundPath) return;

        const audio = new Audio(soundPath);
        const source = this.audioContext.createMediaElementAudioSource(audio);
        source.connect(this.sfxGain);
        
        audio.volume = this.sfxVolume / 100;
        audio.play().catch(e => console.warn('Som não pôde ser reproduzido:', e));
    }

    async loadPlaylist(musicFiles) {
        this.playlist = musicFiles;
        this.currentTrackIndex = 0;
    }

    playMusic(trackIndex = 0) {
        if (trackIndex >= 0 && trackIndex < this.playlist.length) {
            this.currentTrackIndex = trackIndex;
            const track = this.playlist[trackIndex];
            
            this.musicAudioElement.src = track.path;
            this.musicAudioElement.play();
            this.isPlaying = true;

            // Atualizar UI
            this.updateMusicDisplay();
            this.onTrackChange(track);
        }
    }

    pauseMusic() {
        this.musicAudioElement.pause();
        this.isPlaying = false;
    }

    resumeMusic() {
        this.musicAudioElement.play();
        this.isPlaying = true;
    }

    stopMusic() {
        this.musicAudioElement.pause();
        this.musicAudioElement.currentTime = 0;
        this.isPlaying = false;
    }

    nextTrack() {
        if (this.currentTrackIndex < this.playlist.length - 1) {
            this.playMusic(this.currentTrackIndex + 1);
        }
    }

    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.playMusic(this.currentTrackIndex - 1);
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(100, volume));
        this.updateVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(100, volume));
        this.updateVolumes();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateVolumes();
        return this.soundEnabled;
    }

    getCurrentTrack() {
        return this.playlist[this.currentTrackIndex];
    }

    getPlaylist() {
        return this.playlist;
    }

    getCurrentTime() {
        return this.musicAudioElement.currentTime;
    }

    getDuration() {
        return this.musicAudioElement.duration;
    }

    setCurrentTime(time) {
        this.musicAudioElement.currentTime = time;
    }

    updateMusicDisplay() {
        const track = this.getCurrentTrack();
        if (!track) return;

        const titleEl = document.getElementById('musicTitle');
        const artistEl = document.getElementById('musicArtist');
        const coverEl = document.getElementById('musicCover');

        if (titleEl) titleEl.textContent = track.name || 'Música';
        if (artistEl) artistEl.textContent = track.artist || 'NiczRetroSystem';
        if (coverEl && track.cover) coverEl.src = track.cover;
    }

    onTrackChange(track) {
        // Callback quando a música muda
        const event = new CustomEvent('musicChanged', { detail: track });
        document.dispatchEvent(event);
    }
}

// Criar instância global
const audioManager = new AudioManager();

// Atualizar display de tempo em tempo real
setInterval(() => {
    const timeEl = document.getElementById('musicTime');
    const durationEl = document.getElementById('musicDuration');
    const progressFill = document.getElementById('progressFill');

    if (audioManager.musicAudioElement && !isNaN(audioManager.musicAudioElement.duration)) {
        const current = audioManager.getCurrentTime();
        const duration = audioManager.getDuration();

        if (timeEl) timeEl.textContent = formatTime(current);
        if (durationEl) durationEl.textContent = formatTime(duration);
        if (progressFill) progressFill.style.width = (current / duration * 100) + '%';
    }
}, 100);

// Função auxiliar para formatar tempo
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
