document.addEventListener('DOMContentLoaded', () => {
    const listElement = document.getElementById('video-list');
    const clearBtn = document.getElementById('clear-btn');

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const hDisplay = h > 0 ? h + ':' : '';
        const mDisplay = (h > 0 && m < 10 ? '0' : '') + m + ':';
        const sDisplay = (s < 10 ? '0' : '') + s;
        return hDisplay + mDisplay + sDisplay;
    }

    function renderList() {
        chrome.storage.local.get({ history: [] }, (result) => {
            const history = result.history;
            listElement.innerHTML = '';

            if (history.length === 0) {
                listElement.innerHTML = '<li class="empty-state">No history yet. Watch some YouTube!</li>';
                return;
            }

            history.forEach(video => {
                const li = document.createElement('li');
                li.className = 'video-item';
                li.innerHTML = `
          <div class="video-info">
            <div class="video-title" title="${video.title}">${video.title}</div>
            <div class="video-time">Stopped at: ${formatTime(video.timestamp)}</div>
          </div>
          <div class="play-icon"></div>
        `;

                li.addEventListener('click', () => {
                    const url = `https://www.youtube.com/watch?v=${video.videoId}&t=${Math.floor(video.timestamp)}s`;
                    chrome.tabs.create({ url: url });
                });

                listElement.appendChild(li);
            });
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            chrome.storage.local.set({ history: [] }, () => {
                renderList();
            });
        });
    }

    const portfolioLink = document.getElementById('portfolio-link');
    if (portfolioLink) {
        portfolioLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior to open in new tab via API
            chrome.tabs.create({ url: portfolioLink.href });
        });
    }

    renderList();
});
