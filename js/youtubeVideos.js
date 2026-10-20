
/* =========================================================
   YOUTUBE VIDEO FEED
   Fetch video information from YouTube Data API v3 and
   display it in the home page's video section.
   ========================================================= */

// Replace this placeholder with your own API key on your
// computer. Never share the actual key in chat or GitHub.
// This browser-side version is for restricted local testing.
const YOUTUBE_API_KEY = "AIzaSyAvdEo-K9SctuElLr0vfk04KDmZyt1C6UY";

const YOUTUBE_SEARCH_URL =
    "https://www.googleapis.com/youtube/v3/search";

    // Remember whether the video feed has loaded successfully.
let youtubeVideosInitialized = false;

/* Show a readable message inside the video section. */
function showVideoMessage(message) {
    const videoGrid = document.getElementById("youtubeVideoGrid");

    if (!videoGrid) return;

    const messageElement = document.createElement("p");
    messageElement.className = "youtube-video-message";
    messageElement.textContent = message;

    videoGrid.replaceChildren(messageElement);
}

/* Create a video card using data returned by YouTube. */
function createYouTubeVideoCard(video) {
    const videoId = video.id?.videoId;
    const snippet = video.snippet;

    if (!videoId || !snippet) return null;

    const card = document.createElement("article");
    card.className = "youtube-video-card";

    // Thumbnail area: clicking it loads the embedded player.
    const thumbnailButton = document.createElement("button");
    thumbnailButton.type = "button";
    thumbnailButton.className = "youtube-video-thumbnail-button";
    thumbnailButton.setAttribute(
        "aria-label",
        `Play video: ${snippet.title || "YouTube video"}`
    );

    const thumbnail = document.createElement("img");
    thumbnail.src =
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        "";
    thumbnail.alt = "";
    thumbnail.loading = "lazy";

    const playIcon = document.createElement("span");
    playIcon.className = "youtube-video-play-icon";
    playIcon.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i>';

    thumbnailButton.append(thumbnail, playIcon);

    thumbnailButton.addEventListener("click", () => {
        const playerArea = document.createElement("div");
        playerArea.className = "youtube-video-player";

        const player = document.createElement("iframe");
        player.src =
            `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
        player.title = snippet.title || "YouTube video";
        player.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        player.allowFullscreen = true;
        player.referrerPolicy = "strict-origin-when-cross-origin";

        playerArea.appendChild(player);
        thumbnailButton.replaceWith(playerArea);
    }, { once: true });

    const title = document.createElement("h3");
    title.className = "youtube-video-title";
    title.textContent = snippet.title || "Untitled video";

    const channel = document.createElement("p");
    channel.className = "youtube-video-channel";
    channel.textContent = snippet.channelTitle || "YouTube creator";

    card.append(thumbnailButton, title, channel);

    return card;
}

/* Fetch a small batch of videos and display them. */
export async function initYoutubeVideos() {
    const videoGrid = document.getElementById("youtubeVideoGrid");

    // The function can safely do nothing on pages without this section.
    if (!videoGrid || youtubeVideosInitialized) return;
    if (
        !YOUTUBE_API_KEY ||
        YOUTUBE_API_KEY === "PASTE_YOUR_API_KEY_HERE"
    ) {
        showVideoMessage("Add your restricted YouTube API key to load videos.");
        return;
    }

    showVideoMessage("Loading videos...");

    try {
        const params = new URLSearchParams({
            part: "snippet",
            type: "video",
            videoDuration: "short",
            maxResults: "6",
            q: "technology science education",
            key: YOUTUBE_API_KEY
        });

        const response = await fetch(
            `${YOUTUBE_SEARCH_URL}?${params.toString()}`
        );

        const result = await response.json();

        if (!response.ok) {
            const apiMessage =
                result.error?.message || "YouTube request failed.";

            throw new Error(apiMessage);
        }

        const videos = result.items || [];
        const cards = videos
            .map(createYouTubeVideoCard)
            .filter(Boolean);

        if (cards.length === 0) {
            showVideoMessage("No videos were found. Try again later.");
            return;
        }

        videoGrid.replaceChildren(...cards);
        // Mark the feed as loaded only after videos were retrieved.
        youtubeVideosInitialized = true;

        // Credit the external video source.
        const sourceNote = document.createElement("p");
        sourceNote.className = "youtube-video-source";
        sourceNote.textContent =
            "Videos provided by YouTube. Playback is hosted by YouTube.";

        videoGrid.appendChild(sourceNote);

    } catch (error) {
        console.error("Could not load YouTube videos:", error);

        showVideoMessage(
            "Videos could not be loaded. Check your API settings and try again."
        );
    }
}
