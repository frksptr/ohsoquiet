# Random Sound Player

A web application that plays random sounds at configurable intervals. Perfect for ambient sound effects, notification testing, or just having fun with unexpected sounds.

## Features

- **Three Built-in Sounds**: Metal pipe drop, knocking, and ringing bell
- **Configurable Intervals**: Set minimum and maximum time between each sound
- **Individual Controls**: Toggle each sound on/off and adjust volume independently
- **Master Volume Control**: Global volume adjustment
- **Fade Effects**: Configurable fade in/out times
- **Test Buttons**: Preview sounds before starting
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. Open `index.html` in any modern web browser
2. Adjust the settings for each sound as desired
3. Click "Start" to begin random playback
4. Use "Test" buttons to preview sounds
5. Click "Stop" to end playback

## Sound Settings

Each sound has the following configurable parameters:

- **Toggle**: Enable/disable the sound
- **Min Interval**: Minimum seconds between plays (1-3600)
- **Max Interval**: Maximum seconds between plays (1-3600)
- **Volume**: Individual sound volume (0-100%)

## Global Settings

- **Master Volume**: Overall volume control
- **Fade In**: How long sounds take to fade in (0-5000ms)
- **Fade Out**: How long sounds take to fade out (0-5000ms)

## Browser Compatibility

- Chrome 66+
- Firefox 60+
- Safari 11.1+
- Edge 79+

Requires modern browsers with Web Audio API support.

## Hosting Options

### Option 1: GitHub Pages (Recommended - Free)

1. Create a GitHub account at https://github.com
2. Create a new repository named "random-sound-player"
3. Upload all files (index.html, style.css, script.js, sounds folder if added)
4. Go to repository Settings > Pages
5. Select "Deploy from a branch" and choose "main"
6. Your site will be available at: `https://yourusername.github.io/random-sound-player`

### Option 2: Netlify (Free)

1. Go to https://netlify.com
2. Drag and drop your project folder onto the Netlify deploy area
3. Your site will be live instantly with a random URL
4. Optional: Connect to GitHub for continuous deployment

### Option 3: Vercel (Free)

1. Go to https://vercel.com
2. Import your GitHub repository or drag & drop files
3. Deploy with one click
4. Get a custom domain or use the provided vercel.app URL

### Option 4: Firebase Hosting (Free)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

## Adding Real Sound Files

To replace the synthetic sounds with real audio files:

1. Create a `sounds` folder in your project directory
2. Add your sound files (MP3, WAV, or OGG format recommended)
3. Update the `loadSounds()` method in `script.js`:

```javascript
async loadSounds() {
    try {
        this.sounds = {
            metalPipe: await this.loadAudioFile('sounds/metal-pipe.mp3'),
            knocking: await this.loadAudioFile('sounds/knocking.wav'),
            bell: await this.loadAudioFile('sounds/bell.mp3')
        };
    } catch (error) {
        console.error('Failed to load sounds:', error);
        // Fallback to synthetic sounds
        this.loadSyntheticSounds();
    }
}

async loadAudioFile(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    return {
        play: () => {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = audioBuffer;
            source.connect(gainNode);
            gainNode.connect(this.masterGainNode);
            
            // Apply volume and fade settings
            const volume = document.getElementById('metalPipeVolume').value / 100; // Adjust for each sound
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
            
            source.start();
        }
    };
}
```

## Customization

- **Add New Sounds**: Extend the `sounds` object and add corresponding HTML controls
- **Change Styling**: Modify `style.css` for different themes
- **Add Features**: Extend `script.js` with new functionality like sound scheduling patterns
- **Mobile Optimization**: The app is already responsive but can be further customized

## Troubleshooting

- **No Sound**: Check browser audio permissions and master volume
- **Performance Issues**: Reduce max intervals or limit concurrent sounds
- **Mobile Issues**: Some mobile browsers require user interaction before playing audio

## License

This project is open source and available under the MIT License.