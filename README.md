# PLAYSIC Music Player

A Spotify-inspired music player that lets you upload and play your own MP3 files directly in the browser.

## Features

- Upload and play MP3 files
- Modern Spotify-like UI
- Automatically extracts artist and song names (if filename follows "Artist - Title.mp3" format)
- Auto-generates playlists by artist
- Full playback controls (play/pause, previous/next track, seek)
- Volume control
- Responsive design that works on desktop and mobile

## How to Use

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Click "Upload Music" button to select MP3 files from your computer
4. Your uploaded music will appear as cards in the main content area
5. Click on any song card to play it
6. Use the player controls at the bottom to control playback

## File Organization

- `index.html` - Main HTML structure
- `css/styles.css` - Styling for the music player
- `js/app.js` - JavaScript functionality
- `assets/` - Folder for storing images and other assets

## Technical Notes

- The music player uses the browser's built-in audio capabilities
- Music files are processed client-side (no server upload)
- Basic metadata is stored in localStorage, but actual audio files aren't saved between sessions

## Limitations

- Audio files are loaded into memory, so very large files might cause performance issues
- Browser support for different audio formats may vary
- Custom album artwork is not currently supported (default placeholder is used)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is free to use for personal and educational purposes.

## Screenshots

![Screenshot 2024-08-11 161312](https://github.com/user-attachments/assets/f234dbad-986f-4c24-bffa-a7c1e81c0331)
![Screenshot 2024-08-11 161408](https://github.com/user-attachments/assets/c47a6047-b440-4b53-abac-af0c612301e6)
![Screenshot 2024-08-11 161331](https://github.com/user-attachments/assets/5e58eeff-7987-4354-8111-dd4b98784a56)
![Screenshot 2024-08-11 161447](https://github.com/user-attachments/assets/0939cae3-eb41-4d53-9d43-524aa6232e3a)

## Author

- [@vishcrv](https://www.github.com/vishcrv)

