// MemTube Content Script

let currentVideoId = null;

function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

function saveProgress() {
    const video = document.querySelector('video');
    if (!video || !currentVideoId) return;

    const currentTime = video.currentTime;
    if (currentTime < 5) return; // Don't save if just started

    const videoData = {
        videoId: currentVideoId,
        title: document.title.replace(' - YouTube', ''),
        timestamp: currentTime,
        lastUpdated: Date.now()
    };

    chrome.storage.local.get({ history: [] }, (result) => {
        let history = result.history;
        // Remove existing entry for this video
        history = history.filter(item => item.videoId !== currentVideoId);
        // Add new entry to the top
        history.unshift(videoData);
        // Keep only last 20
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        chrome.storage.local.set({ history: history });
    });
}

function init() {
    currentVideoId = getVideoId();
    if (!currentVideoId) return;

    const video = document.querySelector('video');
    if (video) {
        video.addEventListener('pause', saveProgress);
        video.addEventListener('timeupdate', () => {
            // Save every 10 seconds roughly to avoid losing too much data on crash
            if (Math.floor(video.currentTime) % 10 === 0) {
                saveProgress();
            }
        });
    }
}

// Handle navigation (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        currentVideoId = getVideoId();
        // Re-attach listeners if video element changes or just rely on existing if it persists (YouTube reuses player often)
        // Safer to re-run init logic or check for video element
        setTimeout(init, 1000); // Wait for DOM update
    }
}).observe(document, { subtree: true, childList: true });

window.addEventListener('beforeunload', saveProgress);

// Initial run
setTimeout(init, 1000);
