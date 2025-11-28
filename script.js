class RandomSoundPlayer {
    constructor() {
        this.isRunning = false;
        this.sounds = {
            metalPipe: null,
            knocking: null
        };
        this.timeouts = {};
        this.audioContext = null;
        this.masterGainNode = null;
        this.lastSoundTime = 0;
        this.lastSoundType = null;
        
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

    async loadSounds() {
        try {
            console.log('Attempting to load audio files...');
            const metalPipe1 = await this.loadAudioFile('sounds/drop1.mp3');
            console.log('Loaded drop1.mp3');
            const metalPipe2 = await this.loadAudioFile('sounds/drop2.mp3');
            console.log('Loaded drop2.mp3');
            const knocking1 = await this.loadAudioFile('sounds/knock1.wav');
            console.log('Loaded knock1.wav');
            const knocking2 = await this.loadAudioFile('sounds/knock2.wav');
            console.log('Loaded knock2.wav');
            
            this.sounds = {
                metalPipe: [metalPipe1, metalPipe2],
                knocking: [knocking1, knocking2]
            };
            console.log('Real sounds loaded successfully!');
        } catch (error) {
            console.error('Failed to load sound files:', error);
            console.log('Falling back to synthetic sounds...');
            // Fallback to synthetic sounds
            this.loadSyntheticSounds();
        }
    }

    loadSyntheticSounds() {
        // Fallback synthetic sounds
        this.sounds = {
            metalPipe: [this.createToneSound(200, 0.1, 'sawtooth')],
            knocking: [this.createKnockingSound()]
        };
    }

    async loadAudioFile(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        // Determine sound type from URL
        let soundType;
        if (url.includes('drop')) soundType = 'metalPipe';
        else if (url.includes('knock')) soundType = 'knocking';
        
        return {
            play: () => {
                const source = this.audioContext.createBufferSource();
                const gainNode = this.audioContext.createGain();
                
                source.buffer = audioBuffer;
                source.connect(gainNode);
                gainNode.connect(this.masterGainNode);
                
                // Get volume from the appropriate control
                const volumeElement = document.getElementById(`${soundType}Volume`);
                const volume = volumeElement ? volumeElement.value / 100 : 0.5;
                
                gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
                
                source.start();
            }
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
                
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
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



    setupEventListeners() {
        // Master controls
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());


        // Volume sliders
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            this.updateMasterVolume();
            this.updateVolumeDisplay(e.target, 'masterVolume');
        });

        // Individual sound volume sliders
        ['metalPipe', 'knocking'].forEach(sound => {
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
        ['metalPipe', 'knocking'].forEach(sound => {
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

    playSound(soundName, isAutomatic = false) {
        if (!this.sounds[soundName] || this.sounds[soundName].length === 0) return;

        // Only apply sound separation for automatic scheduling, not manual tests
        if (isAutomatic) {
            const currentTime = Date.now();
            const separationMs = parseInt(document.getElementById('soundSeparation').value) * 1000;
            
            if (this.lastSoundType && this.lastSoundType !== soundName) {
                const timeSinceLastSound = currentTime - this.lastSoundTime;
                if (timeSinceLastSound < separationMs) {
                    // Too soon for a different sound, reschedule
                    const delay = separationMs - timeSinceLastSound;
                    setTimeout(() => this.playSound(soundName, true), delay);
                    return;
                }
            }
            
            // Update last sound tracking only for automatic sounds
            this.lastSoundTime = currentTime;
            this.lastSoundType = soundName;
        }

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

        // Randomly select from available sound variations
        const soundVariations = this.sounds[soundName];
        const randomSound = soundVariations[Math.floor(Math.random() * soundVariations.length)];
        
        // Play the randomly selected sound
        randomSound.play();
    }

    scheduleNextSound(soundName) {
        if (!document.getElementById(`${soundName}Toggle`).checked) return;

        const interval = this.getRandomInterval(soundName) * 1000; // Convert to milliseconds
        
        this.timeouts[soundName] = setTimeout(() => {
            if (this.isRunning && document.getElementById(`${soundName}Toggle`).checked) {
                this.playSound(soundName, true); // Mark as automatic
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
        ['metalPipe', 'knocking'].forEach(sound => {
            if (document.getElementById(`${sound}Toggle`).checked) {
                this.scheduleNextSound(sound);
            }
        });
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