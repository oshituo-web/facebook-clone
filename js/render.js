
/* =========================================
   FACEBOOK CLONE - RENDERING
   Handles posts, stories, and creating posts.
========================================= */


/* =========================================
   1. RENDER POSTS
========================================= */

export function renderPosts(posts, users, comments = []) {
    const postsContainer = document.querySelector(".posts");

    // Stop if the feed container does not exist.
    if (!postsContainer) return;

    // Clear the old feed before rendering posts again.
    postsContainer.replaceChildren();

    posts.forEach((post) => {
        // Find the user who created this post.
        const user = users.find(
            (candidate) => String(candidate.id) === String(post.userId)
        );

        if (!user) {
            console.warn(`User not found for post ${post.id}`);
            return;
        }

        // Create the post card.
        const postElement = document.createElement("article");
        postElement.classList.add("post");
        postElement.id = `post-${post.id}`;

        /* ---------- Post header ---------- */

        const postHeader = document.createElement("div");
        postHeader.classList.add("post-header");

        const avatar = document.createElement("img");
        avatar.src = user.avatar || "";
        avatar.alt = `${user.name}'s profile picture`;
        avatar.classList.add("post-avatar");

        // Hide a missing avatar instead of showing a broken image.
        avatar.addEventListener("error", () => {
            avatar.hidden = true;
        }, { once: true });

        const authorDetails = document.createElement("div");

        const authorName = document.createElement("strong");
        authorName.textContent = user.name;

        const date = document.createElement("small");
        date.textContent = post.createdAt || "Just now";

        authorDetails.append(authorName, date);
        postHeader.append(avatar, authorDetails);

        /* ---------- Post content ---------- */

        const postContent = document.createElement("div");
        postContent.classList.add("post-content");

        const message = document.createElement("p");
        message.textContent = post.content || "";
        postContent.appendChild(message);

        // Add an image only when the post has one.
        if (post.image) {
            const postImage = document.createElement("img");
            postImage.src = post.image;
            postImage.alt = "Post image";
            postImage.classList.add("post-image");

            postImage.addEventListener("error", () => {
                postImage.hidden = true;
            }, { once: true });

            postContent.appendChild(postImage);
        }

        /* ---------- Post actions and counts ---------- */

        const postStats = document.createElement("div");
        postStats.classList.add("post-stats");

        const actions = document.createElement("div");
        actions.classList.add("post-stats__actions");

        // Create the Like button.
        const likeButton = document.createElement("button");
        likeButton.type = "button";
        likeButton.classList.add("stat-btn");
        likeButton.dataset.type = "like";
        likeButton.setAttribute("aria-pressed", "false");
        likeButton.innerHTML = `
            <i class="fa-regular fa-thumbs-up" aria-hidden="true"></i>
            <span class="count"></span>
            <span class="stat-label">Like</span>
        `;

        // Create the Comment button.
        const commentButton = document.createElement("button");
        commentButton.type = "button";
        commentButton.classList.add("stat-btn");
        commentButton.dataset.type = "comment";
        commentButton.innerHTML = `
            <i class="fa-regular fa-comment" aria-hidden="true"></i>
            <span class="count"></span>
            <span class="stat-label">Comment</span>
        `;

        // Create the Share button.
        const shareButton = document.createElement("button");
        shareButton.type = "button";
        shareButton.classList.add("stat-btn");
        shareButton.dataset.type = "share";
        shareButton.innerHTML = `
            <i class="fa-solid fa-share" aria-hidden="true"></i>
            <span class="count"></span>
            <span class="stat-label">Share</span>
        `;

        // Start with the counts already stored on the post.
        let likeCount = Number(post.likes) || 0;
        let shareCount = Number(post.shares) || 0;

        // Comment count comes from the actual comments in the data.
        const commentsForThisPost = comments.filter(
            (comment) =>
                String(comment.postId) === String(post.id)
        );

        let liked = false;

        likeButton.querySelector(".count").textContent = likeCount;
        commentButton.querySelector(".count").textContent =
            commentsForThisPost.length;
        shareButton.querySelector(".count").textContent = shareCount;

        // Toggle Like on and off.
        likeButton.addEventListener("click", () => {
            liked = !liked;
            likeCount = Math.max(0, likeCount + (liked ? 1 : -1));

            likeButton.classList.toggle("liked", liked);
            likeButton.setAttribute("aria-pressed", String(liked));

            const icon = likeButton.querySelector("i");
            icon.classList.toggle("fa-solid", liked);
            icon.classList.toggle("fa-regular", !liked);

            likeButton.querySelector(".count").textContent = likeCount;
        });

        // Take the user to the existing comments for this post.
        commentButton.addEventListener("click", () => {
            const commentsSection =
                postElement.querySelector(".post-comments");

            if (commentsSection) {
                commentsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        });

        // Share through the browser, or copy the post link.
        shareButton.addEventListener("click", async () => {
            const shareUrl = new URL(
                `#post-${encodeURIComponent(post.id)}`,
                window.location.href
            ).href;

            try {
                if (navigator.share) {
                    await navigator.share({
                        title: `${user.name}'s post`,
                        text: post.content || "Check out this post.",
                        url: shareUrl
                    });
                } else if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(shareUrl);
                    shareButton.title = "Link copied";
                } else {
                    window.prompt("Copy this post link:", shareUrl);
                }

                shareCount += 1;
                shareButton.querySelector(".count").textContent = shareCount;
            } catch (error) {
                // Cancelling the share sheet is not an application error.
                if (error.name !== "AbortError") {
                    console.warn("Could not share this post:", error);
                }
            }
        });

        actions.append(likeButton, commentButton, shareButton);

        // Display the reaction icons.
        const reactions = document.createElement("div");
        reactions.classList.add("post-stats__reactions");
        reactions.innerHTML = `
            <span class="reaction reaction--like" aria-label="Like">
                <i class="fa-solid fa-thumbs-up" aria-hidden="true"></i>
            </span>
            <span class="reaction reaction--love" aria-label="Love">
                <i class="fa-solid fa-heart" aria-hidden="true"></i>
            </span>
        `;

        postStats.append(actions, reactions);

        /* ---------- Existing post comments ---------- */

        const postComments = document.createElement("div");
        postComments.classList.add("post-comments");

        commentsForThisPost.forEach((comment) => {
            const commenter = users.find(
                (candidate) =>
                    String(candidate.id) === String(comment.userId)
            );

            if (!commenter) {
                console.warn(
                    `User not found for comment ${comment.id}`
                );
                return;
            }

            const commentElement = document.createElement("p");
            commentElement.classList.add("post-comment");

            const commenterName = document.createElement("strong");
            commenterName.textContent = `${commenter.name}: `;

            const commentText = document.createElement("span");
            commentText.textContent = comment.content;

            commentElement.append(commenterName, commentText);
            postComments.appendChild(commentElement);
        });

        // Assemble the completed post card.
        postElement.append(
            postHeader,
            postContent,
            postStats,
            postComments
        );

        postsContainer.appendChild(postElement);
    });
}


/* =========================================
   2. RENDER STORIES
========================================= */


export function renderStories(stories, users) {
    const storiesContainer = document.querySelector(".stories");

    // Stop if the Stories container is missing from the HTML.
    if (!storiesContainer) return;

    // Clear existing cards to prevent duplicates.
    storiesContainer.replaceChildren();

    // Load the IDs of stories already viewed in this browser.
let viewedStoryIds = [];

try {
    viewedStoryIds = JSON.parse(
        localStorage.getItem("viewedStoryIds") || "[]"
    );
} catch {
    viewedStoryIds = [];
}

    // Find the currently signed-in user, if available.
    const currentUser = users.find((user) =>
        String(user.id).startsWith("auth-")
    );

    // Create the "Create Story" card.
    const createStoryCard = document.createElement("article");
    createStoryCard.classList.add("story", "story--create");

    const createStoryImage = document.createElement("div");
    createStoryImage.classList.add("story__create-image");

    if (currentUser?.avatar) {
        const avatar = document.createElement("img");
        avatar.src = currentUser.avatar;
        avatar.alt = "";
        avatar.classList.add("story__create-avatar");

        avatar.addEventListener("error", () => {
            avatar.hidden = true;
        }, { once: true });

        createStoryImage.appendChild(avatar);
    } else {
        createStoryImage.textContent = "👤";
    }

    const createStoryButton = document.createElement("button");
    createStoryButton.type = "button";
    createStoryButton.classList.add("story__create-button");
    createStoryButton.textContent = "+";
    createStoryButton.setAttribute("aria-label", "Create a story");

    // This is a visual starting point; story creation comes later.
    createStoryButton.addEventListener("click", () => {
        alert("Story creation is not available yet.");
    });

    const createStoryName = document.createElement("strong");
    createStoryName.textContent = "Create story";

    createStoryCard.append(
        createStoryImage,
        createStoryButton,
        createStoryName
    );

    storiesContainer.appendChild(createStoryCard);

    // Render the existing stories.
    stories.forEach((story) => {
        // Match each story to its author.
        const user = users.find(
            (candidate) =>
                String(candidate.id) === String(story.userId)
        );

        if (!user) {
            console.warn(`User not found for story ${story.id}`);
            return;
        }

        const storyElement = document.createElement("article");
        storyElement.classList.add("story");

        const isViewed = viewedStoryIds.includes(String(story.id));
        
        storyElement.classList.add(
            isViewed ? "story--viewed" : "story--unviewed"
        );

        // Create the main story card image.
        const storyImage = document.createElement("img");
        storyImage.classList.add("story__background");
        storyImage.src = story.image;
        storyImage.alt = `${user.name}'s story`;
        
        storyImage.addEventListener("error", () => {
            console.warn(`Could not load story image: ${story.image}`);
            storyElement.classList.add("story--image-missing");
        }, { once: true });
        
        // Create the author's avatar and ring.
        const storyImageWrapper = document.createElement("div");
        storyImageWrapper.classList.add("story__image-wrapper");
        
        const avatar = document.createElement("img");
        avatar.src = user.avatar || "";
        avatar.alt = `${user.name}'s profile picture`;
        
        avatar.addEventListener("error", () => {
            avatar.hidden = true;
        }, { once: true });
        
        storyImageWrapper.appendChild(avatar);

        // Display the author's name safely.
        const authorName = document.createElement("strong");
        authorName.textContent = user.name;

        // Mark the story as viewed when the user clicks it.
        storyElement.addEventListener("click", () => {
            const storyId = String(story.id);

            if (!viewedStoryIds.includes(storyId)) {
                viewedStoryIds.push(storyId);

                localStorage.setItem(
                    "viewedStoryIds",
                    JSON.stringify(viewedStoryIds)
                );

                storyElement.classList.remove("story--unviewed");
                storyElement.classList.add("story--viewed");
            }
        });

        storyElement.append(storyImage, storyImageWrapper, authorName);
        storiesContainer.appendChild(storyElement);
    });
}


/* =========================================
   3. RENDER CREATE-POST COMPOSER
========================================= */

export function renderCreatePost(currentUser, onPostCreated) {
    const container = document.querySelector(".create-post");

    // The composer needs both its container and a user.
    if (!container || !currentUser) return;

    const firstName =
        currentUser.name.trim().split(/\s+/)[0] || "there";

    // Create the composer and its modal.
    container.innerHTML = `
        <div class="create-post__top">
            <img class="create-post__avatar" alt="Your profile picture">

            <button
                type="button"
                class="create-post__input"
                id="openComposer"
            >
                What's on your mind?
            </button>

            <button
                type="button"
                class="create-post__action"
                aria-label="Live video (not available yet)"
            >
                <i class="fa-solid fa-video icon-red" aria-hidden="true"></i>
            </button>

            <button
                type="button"
                class="create-post__action"
                aria-label="Add photo (not available yet)"
            >
                <i class="fa-solid fa-images icon-green" aria-hidden="true"></i>
            </button>

            <button
                type="button"
                class="create-post__action"
                aria-label="Add feeling (not available yet)"
            >
                <i class="fa-solid fa-face-smile icon-yellow" aria-hidden="true"></i>
            </button>
        </div>

        <div class="create-post__divider"></div>

        <div class="composer-overlay" id="composerOverlay">
            <div
                class="composer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="composerTitle"
            >
                <header class="composer__header">
                    <h3 id="composerTitle">Create post</h3>

                    <button
                        type="button"
                        class="composer__close"
                        id="closeComposer"
                        aria-label="Close composer"
                    >
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                </header>

                <div class="composer__user">
                    <img class="composer__avatar" alt="">
                    <strong class="composer__name"></strong>
                </div>

                <textarea
                    id="composerText"
                    placeholder="What's on your mind?"
                    aria-label="Post text"
                    maxlength="5000"
                ></textarea>

                <button
                    type="button"
                    class="composer__submit"
                    id="submitPost"
                    disabled
                >
                    Post
                </button>
            </div>
        </div>
    `;

    // Populate profile details safely instead of inserting names into HTML.
    const avatarUrl = currentUser.avatar || "";

    container.querySelectorAll(
        ".create-post__avatar, .composer__avatar"
    ).forEach((avatar) => {
        if (avatarUrl) {
            avatar.src = avatarUrl;

            avatar.addEventListener("error", () => {
                avatar.hidden = true;
            }, { once: true });
        } else {
            // Hide the image when the account has no avatar URL.
            avatar.hidden = true;
        }
    });

    container.querySelector(".composer__name").textContent =
        currentUser.name;

    container.querySelector("#openComposer").textContent =
        `What's on your mind, ${firstName}?`;

    container.querySelector("#composerText").placeholder =
        `What's on your mind, ${firstName}?`;

    setupComposer(container, currentUser, onPostCreated);
}


/* =========================================
   4. COMPOSER INTERACTIONS
========================================= */

function setupComposer(container, currentUser, onPostCreated) {
    const overlay = container.querySelector("#composerOverlay");
    const openButton = container.querySelector("#openComposer");
    const closeButton = container.querySelector("#closeComposer");
    const textarea = container.querySelector("#composerText");
    const submitButton = container.querySelector("#submitPost");

    // Verify the required elements exist before adding listeners.
    if (
        !overlay ||
        !openButton ||
        !closeButton ||
        !textarea ||
        !submitButton
    ) {
        console.error("The create-post composer could not be initialised.");
        return;
    }

    // Open the composer and focus the text area.
    function openComposer() {
        overlay.classList.add("open");
        textarea.focus();
    }

    // Close the composer.
    function closeComposer() {
        overlay.classList.remove("open");
    }

    openButton.addEventListener("click", openComposer);
    closeButton.addEventListener("click", closeComposer);

    // Close when the user clicks outside the composer box.
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeComposer();
        }
    });

    // Enable Post only when the text contains actual content.
    textarea.addEventListener("input", () => {
        submitButton.disabled = textarea.value.trim() === "";
    });

    // Send the new post to the application entry point.
    submitButton.addEventListener("click", () => {
        const content = textarea.value.trim();

        if (!content) return;

        const newPost = {
            id: `local-${Date.now()}`,
            userId: currentUser.id,
            content,
            image: "",
            createdAt: new Date().toISOString(),
            likes: 0,
            shares: 0
        };

        // The caller is responsible for adding and saving the post.
        if (typeof onPostCreated !== "function") {
            console.warn(
                "Post creation needs a handler in js/script.js."
            );
            return;
        }

        const saved = onPostCreated(newPost);

        /* Keep the text in the composer if saving failed. */
        if (saved === false) {
            return;
        }
    });
}
