
/* =========================================================
   YOUTUBE VIDEO FEED
   Fetch recent videos from YouTube Data API v3 and display
   them in the home page's video section.
   ========================================================= */

const YOUTUBE_SEARCH_URL =
    "https://www.googleapis.com/youtube/v3/search";

// Rotate through these topics to give the feed more variety.
const YOUTUBE_SEARCH_TOPICS = [
    "technology science education",
    "mathematics tutorials",
    "computer science and programming",
    "space science discoveries",
    "educational technology",
    "artificial intelligence explained",
    "physics experiments",
    "engineering innovations"
];

// Prevent the same page from initializing the feed repeatedly.
let youtubeVideosInitialized = false;


/* =========================================================
   DISPLAY A MESSAGE
   ========================================================= */

function showVideoMessage(message) {
    const videoGrid = document.getElementById("youtubeVideoGrid");

    if (!videoGrid) return;

    const messageElement = document.createElement("p");
    messageElement.className = "youtube-video-message";
    messageElement.textContent = message;

    videoGrid.replaceChildren(messageElement);
}


/* =========================================================
   SELECT A SEARCH TOPIC
   Uses Local Storage to rotate the topic between page loads.
   ========================================================= */

function getNextYouTubeSearchTopic() {
    let topicIndex = 0;

    try {
        const savedIndex = Number(
            localStorage.getItem("youtubeSearchTopicIndex")
        );

        if (
            Number.isInteger(savedIndex) &&
            savedIndex >= 0 &&
            savedIndex < YOUTUBE_SEARCH_TOPICS.length
        ) {
            topicIndex = savedIndex;
        }

        // Save the next topic for the next page load.
        const nextIndex =
            (topicIndex + 1) % YOUTUBE_SEARCH_TOPICS.length;

        localStorage.setItem(
            "youtubeSearchTopicIndex",
            String(nextIndex)
        );
    } catch (error) {
        // The feed can still work if Local Storage is unavailable.
        console.warn("Could not rotate YouTube search topics:", error);
    }

    return YOUTUBE_SEARCH_TOPICS[topicIndex];
}


/* =========================================================
   YOUTUBE VIDEO CARD AND LARGE MODAL PLAYER

   Clicking a thumbnail opens the video in a large modal
   without navigating away from the Facebook clone.
   ========================================================= */

function createYouTubeVideoCard(video) {
    const videoId = video.id?.videoId;
    const snippet = video.snippet;

    if (!videoId || !snippet) return null;

    const card = document.createElement("article");
    card.className = "youtube-video-card";

    // Create the clickable thumbnail.
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
    playIcon.setAttribute("aria-hidden", "true");

    playIcon.innerHTML =
        '<i class="fa-solid fa-play" aria-hidden="true"></i>';

    thumbnailButton.append(thumbnail, playIcon);

    // Open the video in the large modal.
    thumbnailButton.addEventListener("click", () => {
        // Prevent opening more than one video modal.
        if (document.querySelector(".youtube-video-modal")) return;

        const previousBodyOverflow = document.body.style.overflow;

        const overlay = document.createElement("div");
        overlay.className = "youtube-video-modal";
        overlay.setAttribute("role", "presentation");

        const dialog = document.createElement("section");
        dialog.className = "youtube-video-modal__dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");

        dialog.setAttribute(
            "aria-label",
            snippet.title || "YouTube video player"
        );

        const modalHeader = document.createElement("div");
        modalHeader.className = "youtube-video-modal__header";

        const modalTitle = document.createElement("h2");
        modalTitle.className = "youtube-video-modal__title";
        modalTitle.textContent = snippet.title || "YouTube video";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "youtube-video-modal__close";
        closeButton.setAttribute("aria-label", "Close video");

        closeButton.innerHTML =
            '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';

        const playerArea = document.createElement("div");
        playerArea.className = "youtube-video-modal__player";

        const player = document.createElement("iframe");

        player.src =
            `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1`;

        player.title = snippet.title || "YouTube video";

        player.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

        player.allowFullscreen = true;
        player.referrerPolicy = "strict-origin-when-cross-origin";

        modalHeader.append(modalTitle, closeButton);
        playerArea.appendChild(player);
        dialog.append(modalHeader, playerArea);
        overlay.appendChild(dialog);

        // Restore the page when the modal closes.
        function closeVideoModal() {
            if (!overlay.isConnected) return;

            overlay.remove();

            document.body.style.overflow = previousBodyOverflow;

            document.removeEventListener("keydown", handleEscape);

            // Return keyboard focus to the thumbnail.
            thumbnailButton.focus();
        }

        // Close the modal when Escape is pressed.
        function handleEscape(event) {
            if (event.key === "Escape") {
                closeVideoModal();
            }
        }

        closeButton.addEventListener("click", closeVideoModal);

        // Close only when the overlay itself is clicked.
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeVideoModal();
            }
        });

        document.addEventListener("keydown", handleEscape);

        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";

        closeButton.focus();
    });

    // Display the video's title and channel.
    const title = document.createElement("h3");
    title.className = "youtube-video-title";
    title.textContent = snippet.title || "Untitled video";

    const channel = document.createElement("p");
    channel.className = "youtube-video-channel";
    channel.textContent = snippet.channelTitle || "YouTube creator";

    card.append(thumbnailButton, title, channel);

    return card;
}


/* =========================================================
   FETCH AND DISPLAY YOUTUBE VIDEOS

   Requests up to six short videos, prioritizing recently
   published videos from a rotating selection of topics.
   ========================================================= */

export async function initYoutubeVideos() {
    const videoGrid = document.getElementById("youtubeVideoGrid");

    // Stop if the page has no video section or it has loaded.
    if (!videoGrid || youtubeVideosInitialized) return;

    showVideoMessage("Loading recent videos...");

    try {
        // Load the API key from the local configuration file.
        let youtubeApiKey;

        try {
            const config = await import("./config.local.js");
            youtubeApiKey = config.YOUTUBE_API_KEY;
        } catch (error) {
            console.error(
                "Could not load YouTube configuration:",
                error
            );

            showVideoMessage(
                "YouTube videos are not configured on this computer."
            );

            return;
        }

        // Check that the API key is available.
        if (
            !youtubeApiKey ||
            youtubeApiKey === "YOUR_NEW_YOUTUBE_API_KEY"
        ) {
            showVideoMessage(
                "Add your restricted YouTube API key to config.local.js."
            );

            return;
        }

        // Choose a topic different from the previous page load.
        const selectedTopic = getNextYouTubeSearchTopic();

        // Build the YouTube Data API search parameters.
        const params = new URLSearchParams({
            part: "snippet",
            type: "video",
            videoDuration: "short",
            order: "date",
            maxResults: "6",
            q: selectedTopic,
            key: youtubeApiKey
        });

        // Request recently published videos from YouTube.
        const response = await fetch(
            `${YOUTUBE_SEARCH_URL}?${params.toString()}`
        );

        const result = await response.json();

        // Handle unsuccessful HTTP or API responses.
        if (!response.ok || result.error) {
            const apiMessage =
                result.error?.message || "YouTube request failed.";

            throw new Error(apiMessage);
        }

        // Create a card for each valid video.
        const videos = Array.isArray(result.items)
            ? result.items
            : [];

        const cards = videos
            .map(createYouTubeVideoCard)
            .filter(Boolean);

        // Display a message if no usable videos were returned.
        if (cards.length === 0) {
            showVideoMessage(
                "No recent videos were found for this topic. Try refreshing later."
            );

            return;
        }

        // Display the video cards.
        videoGrid.replaceChildren(...cards);

        // Add a note identifying YouTube as the video source.
        const sourceNote = document.createElement("p");
        sourceNote.className = "youtube-video-source";

        sourceNote.textContent =
            "Videos provided by YouTube. Playback is hosted by YouTube.";

        videoGrid.appendChild(sourceNote);

        // Mark the feed as successfully loaded.
        youtubeVideosInitialized = true;

        console.info(
            `YouTube videos loaded for topic: "${selectedTopic}".`
        );

    } catch (error) {
        console.error("Could not load YouTube videos:", error);

        showVideoMessage(
            "Videos could not be loaded. Check your API settings and try again."
        );
    }
}
