// DOM Elements
const audioElement = document.getElementById('audio-player');
const uploadBtn = document.getElementById('upload-btn');
const uploadBtnMain = document.getElementById('upload-btn-main');
const fileInput = document.getElementById('audio-upload');
const songsContainer = document.getElementById('songs-container');
const uploadPrompt = document.getElementById('upload-prompt');
const playlistContainer = document.getElementById('playlist-container');
const currentSongName = document.getElementById('current-song-name');
const currentArtistName = document.getElementById('current-artist-name');
const currentImg = document.getElementById('current-img');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const progressHandle = document.getElementById('progress-handle');
const currentTimeElement = document.getElementById('current-time');
const durationElement = document.getElementById('duration');
const volumeBar = document.querySelector('.volume-bar');
const volumeProgress = document.querySelector('.volume-progress');
const volumeHandle = document.querySelector('.volume-handle');
const volumeBtn = document.querySelector('.volume-btn');

// Global variables
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let updateTimer;
let currentVolume = 0.5; // Default volume (0-1)

// Music file formats
const validFileTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

// Default cover image if none provided
const defaultCoverImage = 'https://via.placeholder.com/200/181818/ffffff?text=No+Cover';

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Upload music button event listeners
    uploadBtn.addEventListener('click', () => fileInput.click());
    uploadBtnMain.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);

    // Audio player event listeners
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', () => playNextSong());
    audioElement.addEventListener('loadedmetadata', updateDuration);

    // Control buttons event listeners
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevSong);
    nextBtn.addEventListener('click', playNextSong);
    
    // Progress bar event listeners
    progressBar.addEventListener('click', seek);
    
    // Volume control event listeners
    volumeBar.addEventListener('click', adjustVolume);
    volumeBtn.addEventListener('click', toggleMute);

    // Set initial volume
    audioElement.volume = currentVolume;
    updateVolumeUI();

    // Load songs from localStorage if available
    loadSavedSongs();
});

// Function to handle file upload
function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    // Process each file
    Array.from(files).forEach(file => {
        if (!validFileTypes.includes(file.type)) {
            alert(`File "${file.name}" is not a supported audio format.`);
            return;
        }

        // Create object URL for the file
        const songUrl = URL.createObjectURL(file);
        
        // Parse filename to get song name and artist (if format is "Artist - Title.mp3")
        let songName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
        let artistName = "Unknown Artist";

        // Try to extract artist and title if filename contains " - "
        if (songName.includes(" - ")) {
            const parts = songName.split(" - ");
            artistName = parts[0].trim();
            songName = parts[1].trim();
        }

        // Create song object with default values
        const song = {
            name: songName,
            artist: artistName,
            url: songUrl,
            cover: defaultCoverImage,
            file: file
        };

        // Extract metadata using jsmediatags
        extractMetadata(file, song);
    });

    // Reset file input
    event.target.value = '';
}

// Function to extract metadata from MP3 file
function extractMetadata(file, song) {
    jsmediatags.read(file, {
        onSuccess: function(tag) {
            // Extract title and artist if available
            if (tag.tags.title) {
                song.name = tag.tags.title;
            }
            
            if (tag.tags.artist) {
                song.artist = tag.tags.artist;
            }
            
            // Extract cover art if available
            if (tag.tags.picture) {
                const { data, format } = tag.tags.picture;
                
                // Convert binary data to base64
                const base64String = arrayBufferToBase64(data);
                song.cover = `data:${format};base64,${base64String}`;
            }
            
            // Add song to songs array
            songs.push(song);
            
            // Create song card and add to UI
            createSongCard(song, songs.length - 1);
            
            // Hide upload prompt if songs are available
            if (songs.length > 0) {
                uploadPrompt.style.display = 'none';
                
                // If this is the first song added, start playing it
                if (songs.length === 1) {
                    playSong(0);
                }
            }
            
            // Save songs to localStorage
            saveSongs();
            
            // Create playlist entry
            updatePlaylist();
        },
        onError: function(error) {
            console.error('Error reading MP3 tags:', error.type, error.info);
            
            // Add song with basic info if metadata can't be read
            songs.push(song);
            createSongCard(song, songs.length - 1);
            
            // Hide upload prompt if songs are available
            if (songs.length > 0) {
                uploadPrompt.style.display = 'none';
                
                // If this is the first song added, start playing it
                if (songs.length === 1) {
                    playSong(0);
                }
            }
            
            // Save songs to localStorage
            saveSongs();
            
            // Create playlist entry
            updatePlaylist();
        }
    });
}

// Helper function to convert array buffer to base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
}

// Function to create a song card in the UI
function createSongCard(song, index) {
    const songCard = document.createElement('div');
    songCard.className = 'song-card';
    songCard.dataset.index = index;
    
    songCard.innerHTML = `
        <div class="card-img">
            <img src="${song.cover}" alt="${song.name}">
            <div class="play-btn">
                <i class="fas fa-play"></i>
            </div>
        </div>
        <h4>${song.name}</h4>
        <p>${song.artist}</p>
    `;
    
    songCard.addEventListener('click', () => playSong(index));
    songsContainer.appendChild(songCard);
}

// Function to update the playlist in the sidebar
function updatePlaylist() {
    // Clear existing playlist
    playlistContainer.innerHTML = '';
    
    if (songs.length === 0) {
        return;
    }
    
    // Group songs by artist
    const artistMap = {};
    songs.forEach((song, index) => {
        if (!artistMap[song.artist]) {
            artistMap[song.artist] = [];
        }
        artistMap[song.artist].push({ song, index });
    });
    
    // Create a "All Songs" playlist
    const allSongsLi = document.createElement('li');
    allSongsLi.innerHTML = `<a href="#">All Songs</a>`;
    allSongsLi.addEventListener('click', () => {
        // Show all songs
        document.querySelectorAll('.song-card').forEach(card => {
            card.style.display = 'block';
        });
    });
    playlistContainer.appendChild(allSongsLi);
    
    // Create a playlist for each artist
    Object.keys(artistMap).forEach(artist => {
        const artistLi = document.createElement('li');
        artistLi.innerHTML = `<a href="#">${artist}</a>`;
        artistLi.addEventListener('click', () => {
            // Filter songs to show only this artist's songs
            document.querySelectorAll('.song-card').forEach(card => {
                const index = parseInt(card.dataset.index);
                if (songs[index].artist === artist) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
        playlistContainer.appendChild(artistLi);
    });
}

// Function to play a song
function playSong(index) {
    if (index < 0 || index >= songs.length) return;
    
    currentSongIndex = index;
    const song = songs[index];
    
    // Update audio source
    audioElement.src = song.url;
    
    // Update song info in the player bar
    currentSongName.textContent = song.name;
    currentArtistName.textContent = song.artist;
    currentImg.querySelector('img').src = song.cover;
    
    // Play the song
    audioElement.load();
    audioElement.play()
        .then(() => {
            isPlaying = true;
            updatePlayPauseIcon();
        })
        .catch(error => {
            console.error('Error playing the song:', error);
        });
    
    // Update active song in the UI
    document.querySelectorAll('.song-card').forEach((card, i) => {
        if (i === index) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// Function to toggle play/pause
function togglePlayPause() {
    if (songs.length === 0) return;
    
    if (isPlaying) {
        audioElement.pause();
        isPlaying = false;
    } else {
        audioElement.play();
        isPlaying = true;
    }
    
    updatePlayPauseIcon();
}

// Function to update play/pause icon
function updatePlayPauseIcon() {
    if (isPlaying) {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Function to play previous song
function playPrevSong() {
    let newIndex = currentSongIndex - 1;
    if (newIndex < 0) {
        newIndex = songs.length - 1;
    }
    playSong(newIndex);
}

// Function to play next song
function playNextSong() {
    let newIndex = currentSongIndex + 1;
    if (newIndex >= songs.length) {
        newIndex = 0;
    }
    playSong(newIndex);
}

// Function to update progress bar
function updateProgress() {
    if (!isFinite(audioElement.duration)) return;
    
    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;
    const progressPercent = (currentTime / duration) * 100;
    
    progress.style.width = `${progressPercent}%`;
    progressHandle.style.left = `${progressPercent}%`;
    
    // Update time displays
    currentTimeElement.textContent = formatTime(currentTime);
}

// Function to update duration
function updateDuration() {
    const duration = audioElement.duration;
    durationElement.textContent = formatTime(duration);
}

// Function to seek in the song
function seek(e) {
    const progressBarWidth = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audioElement.duration;
    
    audioElement.currentTime = (clickX / progressBarWidth) * duration;
}

// Function to adjust volume
function adjustVolume(e) {
    const volumeBarWidth = volumeBar.clientWidth;
    const clickX = e.offsetX;
    
    // Calculate new volume (0-1)
    currentVolume = clickX / volumeBarWidth;
    
    // Clamp volume between 0 and 1
    currentVolume = Math.max(0, Math.min(1, currentVolume));
    
    // Update audio volume
    audioElement.volume = currentVolume;
    
    // Update UI
    updateVolumeUI();
}

// Add volume drag functionality
volumeBar.addEventListener('mousedown', function(e) {
    adjustVolume(e);
    
    const onMouseMove = function(e) {
        const rect = volumeBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        currentVolume = x / rect.width;
        audioElement.volume = currentVolume;
        updateVolumeUI();
    };
    
    const onMouseUp = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Function to toggle mute
function toggleMute() {
    if (audioElement.volume > 0) {
        // Save current volume before muting
        audioElement._previousVolume = audioElement.volume;
        audioElement.volume = 0;
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        // Restore previous volume
        audioElement.volume = audioElement._previousVolume || 0.5;
        updateVolumeIcon();
    }
    
    // Update volume UI
    currentVolume = audioElement.volume;
    updateVolumeUI();
}

// Function to update volume UI
function updateVolumeUI() {
    // Update volume progress bar
    volumeProgress.style.width = `${currentVolume * 100}%`;
    volumeHandle.style.left = `${currentVolume * 100}%`;
    
    // Update volume icon
    updateVolumeIcon();
}

// Function to update volume icon based on volume level
function updateVolumeIcon() {
    if (audioElement.volume === 0) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (audioElement.volume < 0.5) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Function to format time in mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Functions to save and load songs from localStorage
function saveSongs() {
    // We can't save the File objects or object URLs
    // Instead, save just the metadata
    const songsMetadata = songs.map(song => ({
        name: song.name,
        artist: song.artist,
        cover: song.cover === defaultCoverImage ? 'default' : song.cover
    }));
    
    localStorage.setItem('playsicSongs', JSON.stringify(songsMetadata));
}

function loadSavedSongs() {
    const savedSongs = localStorage.getItem('playsicSongs');
    if (!savedSongs) return;
    
    try {
        const songsMetadata = JSON.parse(savedSongs);
        
        if (songsMetadata.length > 0) {
            // We can't restore the actual files, so show a message
            uploadPrompt.innerHTML = `
                <h2>Your music collection</h2>
                <p>Your previously added songs can't be automatically loaded as they were on your device.</p>
                <p>Please upload your music files again to listen.</p>
                <button id="upload-btn-main" class="upload-btn-main">Upload Music</button>
            `;
            
            // Reconnect the upload button event listener
            document.getElementById('upload-btn-main').addEventListener('click', () => fileInput.click());
        }
    } catch (error) {
        console.error('Error loading saved songs:', error);
    }
} 