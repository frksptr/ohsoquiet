class RandomSoundPlayer {
    constructor() {
        this.isRunning = false;
        this.sounds = {
            metalPipe: null,
            knocking: null,
            bell: null
        };
        this.timeouts = {};
        this.audioContext = null;
        this.masterGainNode = null;
        
        this.init();
    }

    async init() {
        await this.initAudioContext();
        this.setupEventListeners();
        this.loadSounds();
        this.updateVolumeDisplays();
    }

    async initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.connect(this.audioContext.destination);
            this.updateMasterVolume();
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }

    loadSounds() {
        // Using placeholder sounds - you'll replace these with actual audio files
        this.sounds = {
            metalPipe: this.createToneSound(200, 0.1, 'sawtooth'), // Low metallic sound
            knocking: this.createKnockingSound(),
            bell: this.createBellSound()
        };
    }

    createToneSound(frequency, duration, type = 'sine') {
        // Create a synthetic sound for demonstration
        return {
            play: () => {
                if (!this.audioContext) return;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.masterGainNode);
                
                oscillator.type = type;
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                
                const fadeIn = parseInt(document.getElementById('fadeIn').value) / 1000;
                const fadeOut = parseInt(document.getElementById('fadeOut').value) / 1000;
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + fadeIn);
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration + fadeOut);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration + fadeOut);
            }
        };
    }

    createKnockingSound() {
        return {
            play: () => {
                if (!this.audioContext) return;
                
                // Create a knocking sound with multiple tones
                const frequencies = [80, 120, 200];
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = this.audioContext.createOscillator();
                        const gainNode = this.audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(this.masterGainNode);
                        
                        oscillator.type = 'square';
                        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                        
                        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
                        
                        oscillator.start(this.audioContext.currentTime);
                        oscillator.stop(this.audioContext.currentTime + 0.1);
                    }, index * 100);
                });
            }
        };
    }

    createBellSound() {
        return {
            play: () => {
                if (!this.audioContext) return;
                
                // Create a bell-like sound with harmonics
                const fundamental = 440;
                const harmonics = [1, 2, 3, 4, 5];
                
                harmonics.forEach((harmonic, index) => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.masterGainNode);
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(fundamental * harmonic, this.audioContext.currentTime);
                    
                    const amplitude = 0.1 / (harmonic * harmonic); // Decreasing amplitude for higher harmonics
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(amplitude, this.audioContext.currentTime + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 2);
                });
            }
        };
    }

    setupEventListeners() {
        // Master controls
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('testAllBtn').addEventListener('click', () => this.testAllSounds());

        // Volume sliders
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            this.updateMasterVolume();
            this.updateVolumeDisplay(e.target, 'masterVolume');
        });

        // Individual sound volume sliders
        ['metalPipe', 'knocking', 'bell'].forEach(sound => {
            const volumeSlider = document.getElementById(`${sound}Volume`);
            volumeSlider.addEventListener('input', (e) => {
                this.updateVolumeDisplay(e.target, `${sound}Volume`);
            });
        });

        // Volume display updates
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const display = e.target.nextElementSibling;
                if (display && display.classList.contains('volume-display')) {
                    display.textContent = e.target.value + '%';
                }
            });
        });

        // Toggle switches
        ['metalPipe', 'knocking', 'bell'].forEach(sound => {
            document.getElementById(`${sound}Toggle`).addEventListener('change', (e) => {
                this.updateSoundState(sound, e.target.checked);
            });
        });
    }

    updateVolumeDisplays() {
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const display = slider.nextElementSibling;
            if (display && display.classList.contains('volume-display')) {
                display.textContent = slider.value + '%';
            }
        });
    }

    updateVolumeDisplay(slider, id) {
        const display = slider.nextElementSibling;
        if (display && display.classList.contains('volume-display')) {
            display.textContent = slider.value + '%';
        }
    }

    updateMasterVolume() {
        if (this.masterGainNode) {
            const volume = document.getElementById('masterVolume').value / 100;
            this.masterGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }

    updateSoundState(soundName, isEnabled) {
        const soundControl = document.getElementById(`${soundName}Toggle`).closest('.sound-control');
        if (isEnabled) {
            soundControl.classList.remove('disabled-sound');
            if (this.isRunning) {
                this.scheduleNextSound(soundName);
            }
        } else {
            soundControl.classList.add('disabled-sound');
            if (this.timeouts[soundName]) {
                clearTimeout(this.timeouts[soundName]);
                delete this.timeouts[soundName];
            }
        }
    }

    getRandomInterval(soundName) {
        const minSeconds = parseInt(document.getElementById(`${soundName}Min`).value);
        const maxSeconds = parseInt(document.getElementById(`${soundName}Max`).value);
        return Math.random() * (maxSeconds - minSeconds) + minSeconds;
    }

    playSound(soundName) {
        if (!this.sounds[soundName]) return;

        // Resume audio context if needed (browsers require user interaction)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Visual feedback
        const soundControl = document.getElementById(`${soundName}Toggle`).closest('.sound-control');
        soundControl.classList.add('sound-playing');
        setTimeout(() => {
            soundControl.classList.remove('sound-playing');
        }, 1000);

        // Apply individual sound volume
        const soundVolume = document.getElementById(`${soundName}Volume`).value / 100;
        
        // Play the sound
        this.sounds[soundName].play();

        this.updateStatus(`Playing ${soundName.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }

    scheduleNextSound(soundName) {
        if (!document.getElementById(`${soundName}Toggle`).checked) return;

        const interval = this.getRandomInterval(soundName) * 1000; // Convert to milliseconds
        
        this.timeouts[soundName] = setTimeout(() => {
            if (this.isRunning && document.getElementById(`${soundName}Toggle`).checked) {
                this.playSound(soundName);
                this.scheduleNextSound(soundName); // Schedule next occurrence
            }
        }, interval);
    }

    start() {
        if (!this.audioContext) {
            this.initAudioContext();
        }

        this.isRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;

        // Schedule all enabled sounds
        ['metalPipe', 'knocking', 'bell'].forEach(sound => {
            if (document.getElementById(`${sound}Toggle`).checked) {
                this.scheduleNextSound(sound);
            }
        });

        this.updateStatus('Running - Random sounds will play based on your settings');
        this.updateNextSoundDisplay();
    }

    stop() {
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;

        // Clear all timeouts
        Object.keys(this.timeouts).forEach(sound => {
            clearTimeout(this.timeouts[sound]);
            delete this.timeouts[sound];
        });

        this.updateStatus('Stopped');
        this.updateNextSoundDisplay();
    }

    testAllSounds() {
        ['metalPipe', 'knocking', 'bell'].forEach((sound, index) => {
            setTimeout(() => {
                this.playSound(sound);
            }, index * 500);
        });
    }

    updateStatus(message) {
        document.getElementById('statusDisplay').textContent = message;
    }

    updateNextSoundDisplay() {
        const nextSoundDiv = document.getElementById('nextSoundDisplay');
        if (this.isRunning) {
            const enabledSounds = ['metalPipe', 'knocking', 'bell'].filter(sound => 
                document.getElementById(`${sound}Toggle`).checked
            );
            nextSoundDiv.textContent = `Active sounds: ${enabledSounds.map(s => 
                s.replace(/([A-Z])/g, ' $1').toLowerCase()
            ).join(', ')}`;
        } else {
            nextSoundDiv.textContent = '';
        }
    }
}

// Global function for test buttons
function testSound(soundName) {
    if (window.soundPlayer) {
        window.soundPlayer.playSound(soundName);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.soundPlayer = new RandomSoundPlayer();
});