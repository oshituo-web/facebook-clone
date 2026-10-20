
/* =========================================================
   FACEBOOK CLONE — APPLICATION SCRIPT

   This file coordinates the page's browser-side behaviour.

   Keep feature-specific data work in data.js and rendering
   work in render.js. Add future feature integrations in
   section 10.
========================================================= */


/* =========================================================
   1. IMPORTS

   Supabase handles authentication.
   data.js loads application data.
   render.js displays feed posts and stories.
========================================================= */

import { supabase } from "./supabaseClient.js";

import {
    getUsers,
    getPosts,
    getStories,
    getComments,
    getMyNotifications,
    markNotificationRead,
    getConversationMessages,
    sendDirectMessage,
    markReceivedMessagesRead,
    getFriendSuggestions,
    sendFriendRequest,
    getIncomingFriendRequests,
    respondToFriendRequest,
    getMessageableProfiles
} from "./data.js";

import {
    renderPosts,
    renderStories,
    renderCreatePost,
    renderSidebarUser
} from "./render.js";

// Load the YouTube video feed feature.
import { initYoutubeVideos } from "./youtubeVideos.js";
import { initMarketplace } from "./marketplace.js";



/* =========================================================
   RIGHT SIDEBAR — CONTACTS

   Displays users from data/users.json in the right sidebar.
   ========================================================= */

function renderRightSidebarContacts(users) {
    const contactsList = document.getElementById("rightSidebarContacts");

    // Stop if this page does not contain the contacts list.
    if (!contactsList) return;

    // Remove the initial "Loading contacts..." message.
    contactsList.replaceChildren();

    // Display a message if no users were loaded.
    if (!Array.isArray(users) || users.length === 0) {
        const message = document.createElement("li");
        message.className = "sidebar-empty";
        message.textContent = "No contacts available.";

        contactsList.appendChild(message);
        return;
    }

    // Create a contact entry using each user's JSON data.
    users.forEach((user) => {
        const contactItem = document.createElement("li");
        contactItem.className = "contact-item";

        const avatarWrapper = document.createElement("div");
        avatarWrapper.className = "avatar-wrapper";

        // Display the avatar path provided in users.json.
        if (user.avatar) {
            const avatarImage = document.createElement("img");

            avatarImage.src = user.avatar;
            avatarImage.alt = "";
            avatarImage.loading = "lazy";

            // Hide the image if its file cannot be loaded.
            avatarImage.addEventListener("error", () => {
                avatarImage.style.display = "none";
            });

            avatarWrapper.appendChild(avatarImage);
        }

        // Display the real name from the JSON record.
        const contactName = document.createElement("span");
        contactName.className = "contact-name";
        contactName.textContent =
            user.name || user.username || "Unknown user";

        contactItem.append(avatarWrapper, contactName);
        contactsList.appendChild(contactItem);
    });
}



/* =========================================================
   LOCAL POST STORAGE

   Posts created through the composer are saved in this
   browser so they remain visible after a page refresh.

   This is temporary demo storage, not shared server storage.
========================================================= */

const LOCAL_POSTS_STORAGE_KEY = "facebookCloneLocalPosts";

let authenticatedUser = null;


/* Read locally saved posts safely. */

function readLocalPosts() {
    try {
        const savedPosts = localStorage.getItem(
            LOCAL_POSTS_STORAGE_KEY
        );

        if (!savedPosts) {
            return [];
        }

        const posts = JSON.parse(savedPosts);

        return Array.isArray(posts) ? posts : [];
    } catch (error) {
        console.warn("Could not read locally saved posts:", error);
        return [];
    }
}


/* Save posts to this browser. */

function saveLocalPosts(posts) {
    try {
        localStorage.setItem(
            LOCAL_POSTS_STORAGE_KEY,
            JSON.stringify(posts)
        );

        return true;
    } catch (error) {
        console.error("Could not save posts:", error);
        return false;
    }
}



/* =========================================================
   CURRENT USER PROFILE

   Display information belonging to the authenticated
   Supabase user. Never assume a user is logged in just
   because a name or email exists in browser storage.
========================================================= */

function updateCurrentUserProfile(user) {
    const nameElement = document.getElementById("currentUserName");
    const emailElement = document.getElementById("currentUserEmail");
    const avatarElement = document.getElementById("currentUserAvatar");

    if (!nameElement || !emailElement || !avatarElement || !user) {
        return;
    }

    const metadata = user.user_metadata || {};

    const displayName =
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        user.email?.split("@")[0] ||
        "Facebook User";

    nameElement.textContent = displayName;
    emailElement.textContent = user.email || "";

    const avatarUrl = metadata.avatar_url || metadata.picture;

    // Use a real avatar only when a valid HTTP(S) URL exists.
    if (
        typeof avatarUrl === "string" &&
        /^https?:\/\//i.test(avatarUrl)
    ) {
        const image = document.createElement("img");

        image.src = avatarUrl;
        image.alt = `${displayName}'s profile picture`;
        image.className = "current-user-avatar-image";

        image.addEventListener("error", () => {
            avatarElement.textContent =
                displayName.trim().charAt(0).toUpperCase() || "?";
        }, { once: true });

        avatarElement.replaceChildren(image);
    } else {
        avatarElement.textContent =
            displayName.trim().charAt(0).toUpperCase() || "?";
    }
}



/* =========================================================
   2. AUTHENTICATION AND APPLICATION STARTUP

   The feed must not load unless the user has an active
   Supabase session.
========================================================= */

async function startApplication() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        if (!data.session) {
            window.location.replace("./login.html");
            return;
        }
        
        /* Keep the authenticated user available to the feed. */
        authenticatedUser = data.session.user;
        
        updateCurrentUserProfile(authenticatedUser);
        // The user is logged in, so load the application.
        await loadApplicationData();

    } catch (error) {
        console.error("Authentication check failed:", error);

        showFeedMessage(
            "We couldn't verify your login. Please refresh and try again."
        );
    }
}



/* =========================================================
   3. LOAD FEED, STORIES AND CREATE-POST FEATURES

   Load the existing JSON/Supabase-backed data, combine
   fetched posts with browser-saved posts, then render the
   feed, stories and create-post composer.
========================================================= */

async function loadApplicationData() {
    try {
        const [users, fetchedPosts, stories, comments] =
            await Promise.all([
                getUsers(),
                getPosts(),
                getStories(),
                getComments()
            ]);

        /* Read posts created in this browser. */
        const localPosts = readLocalPosts();

        /* Put locally created posts before fetched posts. */
        const posts = [...localPosts, ...fetchedPosts];

        /* Do not render the composer without a signed-in user. */
        if (!authenticatedUser) {
            throw new Error(
                "No authenticated user is available."
            );
        }

        /* Build a profile for the authenticated user. */
        const metadata = authenticatedUser.user_metadata || {};

        const displayName =
            metadata.full_name ||
            metadata.name ||
            metadata.display_name ||
            authenticatedUser.email?.split("@")[0] ||
            "Facebook User";

        const currentUser = {
            id: `auth-${authenticatedUser.id}`,
            name: displayName,
            email: authenticatedUser.email || "",
            avatar:
                metadata.avatar_url ||
                metadata.picture ||
                ""
        };

        /*
         * Keep the JSON users and add the signed-in user.
         * This lets renderPosts find the author of new posts.
         */
        const usersForRendering = [
            ...users,
            currentUser
        ];

        
        // Render the feed and stories.
        renderSidebarUser(currentUser);
        renderPosts(posts, usersForRendering, comments);
        renderStories(stories, usersForRendering);

        // Set up the Add Friend button handler and load suggestions.
        setupFriendSuggestionEvents();
        await renderFriendSuggestions();

        // Set up and load incoming friend requests.
        setupIncomingFriendRequestEvents();
        await renderIncomingFriendRequests();

        // Display contacts using the users loaded from users.json.
        renderRightSidebarContacts(users);
        

        /* Render the create-post composer.
          The callback saves the new post before updating
          the visible feed. */
        renderCreatePost(currentUser, (newPost) => {
            const updatedLocalPosts = [
                newPost,
                ...localPosts
            ];

            const saved = saveLocalPosts(updatedLocalPosts);

            if (!saved) {
                alert(
                    "Your post could not be saved in this browser. " +
                    "Please check your browser storage and try again."
                );

                return false;
            }

            /* Update the in-memory lists after saving succeeds. */
            localPosts.unshift(newPost);
            posts.unshift(newPost);

            renderPosts(posts, usersForRendering, comments);

            console.log("New post created successfully.");

            return true;
        });

        console.log("Application data loaded successfully.");

    } catch (error) {
        console.error("Failed to load application data:", error);

        showFeedMessage(
            "We couldn't load the feed. Please refresh and try again."
        );
    }
}


// =========================================================
// FRIEND SUGGESTIONS — RENDER PROFILES AND HANDLE REQUESTS
// =========================================================

/**
 * Display suggested profiles in the People You May Know section.
 */
async function renderFriendSuggestions() {
    const suggestionsContainer = document.getElementById(
        "friendSuggestionsList"
    );

    // Do nothing if the section is not present in the HTML.
    if (!suggestionsContainer) return;

    suggestionsContainer.textContent = "Loading suggestions...";

    try {
        const profiles = await getFriendSuggestions();

        // Clear the loading message before rendering profile cards.
        suggestionsContainer.replaceChildren();

        if (profiles.length === 0) {
            const message = document.createElement("p");
            message.className = "friend-suggestions-message";
            message.textContent = "No new suggestions right now.";
            suggestionsContainer.appendChild(message);
            return;
        }

        profiles.forEach(profile => {
            const card = document.createElement("article");
            card.className = "friend-suggestion-card";

            // Show the profile picture when one is available.
            if (profile.avatar_url) {
                const avatar = document.createElement("img");
                avatar.className = "friend-suggestion-avatar";
                avatar.src = profile.avatar_url;
                avatar.alt = "";
                avatar.loading = "lazy";

                // Hide broken images instead of leaving a broken icon.
                avatar.addEventListener("error", () => {
                    avatar.remove();
                }, { once: true });

                card.appendChild(avatar);
            } else {
                // Use a simple icon when the profile has no picture.
                const avatar = document.createElement("div");
                avatar.className = "friend-suggestion-avatar";
                avatar.setAttribute("aria-hidden", "true");
                avatar.style.display = "grid";
                avatar.style.placeItems = "center";
                avatar.innerHTML =
                    '<i class="fa-solid fa-user"></i>';

                card.appendChild(avatar);
            }

            const name = document.createElement("p");
            name.className = "friend-suggestion-name";
            name.textContent = profile.display_name || "Facebook user";
            card.appendChild(name);

            const button = document.createElement("button");
            button.type = "button";
            button.className = "friend-suggestion-button";
            button.textContent = "Add Friend";
            button.dataset.recipientId = profile.id;

            card.appendChild(button);
            suggestionsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Failed to load friend suggestions:", error);

        suggestionsContainer.replaceChildren();

        const message = document.createElement("p");
        message.className = "friend-suggestions-message";
        message.textContent =
            "Could not load suggestions. Please sign in and try again.";

        suggestionsContainer.appendChild(message);
    }
}


/**
 * Handle Add Friend clicks using one event listener on the container.
 */
function setupFriendSuggestionEvents() {
    const suggestionsContainer = document.getElementById(
        "friendSuggestionsList"
    );

    if (!suggestionsContainer) return;

    // Prevent registering the same listener more than once.
    if (suggestionsContainer.dataset.eventsReady === "true") return;
    suggestionsContainer.dataset.eventsReady = "true";

    suggestionsContainer.addEventListener("click", async event => {
        const button = event.target.closest(
            "button[data-recipient-id]"
        );

        if (!button || !suggestionsContainer.contains(button)) return;

        const recipientId = button.dataset.recipientId;

        button.disabled = true;
        button.textContent = "Sending...";

        try {
            await sendFriendRequest(recipientId);

            // Remove this card because the request has been sent.
            const card = button.closest(".friend-suggestion-card");
            if (card) card.remove();

            if (suggestionsContainer.children.length === 0) {
                const message = document.createElement("p");
                message.className = "friend-suggestions-message";
                message.textContent =
                    "No new suggestions right now.";
                suggestionsContainer.appendChild(message);
            }
        } catch (error) {
            console.error("Failed to send friend request:", error);

            button.disabled = false;
            button.textContent = "Add Friend";

            alert(
                error.message ||
                "Could not send the friend request. Please try again."
            );
        }
    });
}


// =========================================================
// INCOMING FRIEND REQUESTS 1: RENDER REQUESTS
// Loads pending requests and displays each requester's profile.
// =========================================================

async function renderIncomingFriendRequests() {
    const requestsContainer = document.getElementById(
        "incomingFriendRequestsList"
    );

    if (!requestsContainer) return;

    requestsContainer.textContent = "Loading friend requests...";

    try {
        // Load incoming requests and profile information from Supabase.
        const [requests, profiles] = await Promise.all([
            getIncomingFriendRequests(),
            getMessageableProfiles()
        ]);

        // Match each requester's user ID to their profile.
        const profilesById = new Map(
            profiles.map(profile => [profile.id, profile])
        );

        requestsContainer.replaceChildren();

        if (requests.length === 0) {
            const message = document.createElement("p");
            message.className = "incoming-friend-requests-message";
            message.textContent = "You have no pending friend requests.";
            requestsContainer.appendChild(message);
            return;
        }

        requests.forEach(request => {
            const profile = profilesById.get(request.requester_id);

            const card = document.createElement("article");
            card.className = "incoming-friend-request-card";
            card.dataset.requestId = request.id;

            // Display the requester's avatar, or a default icon.
            if (profile?.avatar_url) {
                const avatar = document.createElement("img");
                avatar.className = "incoming-friend-request-avatar";
                avatar.src = profile.avatar_url;
                avatar.alt = "";
                avatar.loading = "lazy";

                avatar.addEventListener(
                    "error",
                    () => avatar.remove(),
                    { once: true }
                );

                card.appendChild(avatar);
            } else {
                const avatar = document.createElement("div");
                avatar.className = "incoming-friend-request-avatar";
                avatar.setAttribute("aria-hidden", "true");
                avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
                card.appendChild(avatar);
            }

            // Display the requester's name safely as text.
            const name = document.createElement("p");
            name.className = "incoming-friend-request-name";
            name.textContent = profile?.display_name || "Facebook user";
            card.appendChild(name);

            // Accept button.
            const acceptButton = document.createElement("button");
            acceptButton.type = "button";
            acceptButton.className = "friend-request-action accept";
            acceptButton.dataset.action = "accept";
            acceptButton.textContent = "Accept";
            acceptButton.setAttribute("aria-label", `Accept request from ${name.textContent}`);

            // Reject button.
            const rejectButton = document.createElement("button");
            rejectButton.type = "button";
            rejectButton.className = "friend-request-action reject";
            rejectButton.dataset.action = "reject";
            rejectButton.textContent = "Reject";
            rejectButton.setAttribute("aria-label", `Reject request from ${name.textContent}`);

            card.append(acceptButton, rejectButton);
            requestsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Failed to load incoming friend requests:", error);

        requestsContainer.replaceChildren();

        const message = document.createElement("p");
        message.className = "incoming-friend-requests-message";
        message.textContent =
            "Could not load friend requests. Please sign in and try again.";

        requestsContainer.appendChild(message);
    }
}


// =========================================================
// INCOMING FRIEND REQUESTS 2: ACCEPT OR REJECT
// Uses event delegation so the buttons work on every request card.
// =========================================================

function setupIncomingFriendRequestEvents() {
    const requestsContainer = document.getElementById(
        "incomingFriendRequestsList"
    );

    if (!requestsContainer) return;

    // Prevent the same click listener from being attached more than once.
    if (requestsContainer.dataset.eventsReady === "true") return;
    requestsContainer.dataset.eventsReady = "true";

    requestsContainer.addEventListener("click", async event => {
        const button = event.target.closest(
            "button[data-action]"
        );

        if (!button || !requestsContainer.contains(button)) return;

        const card = button.closest(".incoming-friend-request-card");
        if (!card) return;

        const requestId = card.dataset.requestId;
        const action = button.dataset.action;

        if (action !== "accept" && action !== "reject") return;

        // Temporarily disable both buttons to prevent duplicate responses.
        const actionButtons = card.querySelectorAll("button");
        actionButtons.forEach(item => {
            item.disabled = true;
        });

        button.textContent = action === "accept" ? "Accepting..." : "Rejecting...";

        try {
            await respondToFriendRequest(requestId, action === "accept");

            // Remove the handled request from the page.
            card.remove();

            if (requestsContainer.querySelectorAll(
                ".incoming-friend-request-card"
            ).length === 0) {
                const message = document.createElement("p");
                message.className = "incoming-friend-requests-message";
                message.textContent = "You have no pending friend requests.";
                requestsContainer.replaceChildren(message);
            }

            // Refresh suggestions to reflect the updated request status.
            await renderFriendSuggestions();
        } catch (error) {
            console.error("Could not respond to friend request:", error);

            actionButtons.forEach(item => {
                item.disabled = false;
            });

            button.textContent = action === "accept" ? "Accept" : "Reject";

            alert(
                error.message ||
                "Could not update this friend request. Please try again."
            );
        }
    });
}


/*Display an error message inside the feed area when possible.*/
function showFeedMessage(message) {
    const postsContainer = document.querySelector(".posts");

    if (postsContainer) {
        postsContainer.textContent = message;
    }
}


/* =========================================================
   4. AUTHENTICATION ACTIONS

   Reuse this logout function for the main header button
   and the Log Out action inside the Profile dropdown.
========================================================= */

async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        // Redirect only after Supabase signs the user out successfully.
        window.location.replace("./login.html");

    } catch (error) {
        console.error("Logout failed:", error);

        alert("We couldn't log you out. Please try again.");
    }
}
                    

/* =========================================================
   5. HEADER NAVIGATION

   This section controls which header navigation item
   appears selected.

   Video, Marketplace, Friends and Groups still need their
   actual page destinations or feature behaviour.
========================================================= */

const headerNavItems = document.querySelectorAll(
    ".main-navigation .nav-item"
);


function selectHeaderNavItem(selectedItem) {
    headerNavItems.forEach((item) => {
        const isSelected = item === selectedItem;

        item.classList.toggle("active", isSelected);

        if (isSelected) {
            item.setAttribute("aria-current", "page");
        } else {
            item.removeAttribute("aria-current");
        }
    });
}


headerNavItems.forEach((item) => {
    item.addEventListener("click", () => {
        const action = item.dataset.action;

        // Switch the central content for supported feed views.
        if (
            action === "home" ||
            action === "video" ||
            action === "marketplace" ||
            action === "friends"
        ) {
            showFeedView(action);
            return;
        }

        // Keep the active-button behavior for Groups for now.
        selectHeaderNavItem(item);
    });
});


    // Clicking the Facebook logo returns to the feed.

    const facebookLogo = document.querySelector(".facebook-logo");

    if (facebookLogo) {
        facebookLogo.addEventListener("click", (event) => {
            event.preventDefault();

            window.location.href = "./index.html";
        });
    }


/* =========================================================
   HOME, VIDEO, MARKETPLACE AND FRIENDS VIEW SWITCHING

   Only one central-feed view is visible at a time.
   ========================================================= */
   const homeFeedView = document.getElementById("homeFeedView");
   const youtubeVideosView = document.getElementById("youtubeVideos");
   const marketplaceView = document.getElementById("marketplaceView");
   const friendsView = document.getElementById("friendsView");

    function showFeedView(viewName) {
    // Find the navigation button the user clicked.
    const selectedItem = document.querySelector(
        `.main-navigation .nav-item[data-action="${viewName}"]`
    );

    // Check that all views and the selected navigation button exist.
    if (
        !homeFeedView ||
        !youtubeVideosView ||
        !marketplaceView ||
        !friendsView ||
        !selectedItem
    ) {
        console.error(
            "Could not switch feed view. Check the HTML IDs and navigation action."
        );
        return;
    }

    // Highlight the selected navigation button.
    selectHeaderNavItem(selectedItem);

    // Show the selected view and hide the other views.
    homeFeedView.hidden = viewName !== "home";
    youtubeVideosView.hidden = viewName !== "video";
    marketplaceView.hidden = viewName !== "marketplace";
    friendsView.hidden = viewName !== "friends";

    // Load videos when the Videos view is opened.
    if (viewName === "video") {
        initYoutubeVideos();
    }

    // Load products when Marketplace is opened.
    if (viewName === "marketplace") {
        initMarketplace();
    }

    // Load friend suggestions and incoming requests when Friends is opened.
    if (viewName === "friends") {
        setupFriendSuggestionEvents();
        setupIncomingFriendRequestEvents();

        renderFriendSuggestions();
        renderIncomingFriendRequests();
    }

    // Return to the top of the page after switching views.
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}



/* =========================================================
   6. HEADER SEARCH

   Filter the currently rendered post cards using their text.

   This is local, on-page filtering. It is not a search of
   every user or post stored on a server.
========================================================= */

const headerSearch = document.querySelector(".search-input");

if (headerSearch) {
    headerSearch.addEventListener("input", () => {
        const searchTerm = headerSearch.value.trim().toLowerCase();

        const postsContainer = document.querySelector(".posts");

        if (!postsContainer) {
            return;
        }

        // Support common post-card structures.
        let postCards = postsContainer.querySelectorAll(
            ":scope > article, " +
            ":scope > .post, " +
            ":scope > .post-card, " +
            "article.post"
        );

        // If none of those selectors match, use direct children.
        if (postCards.length === 0) {
            postCards = postsContainer.children;
        }

        Array.from(postCards).forEach((postCard) => {
            const postText = (
                postCard.textContent || ""
            ).toLowerCase();

            postCard.hidden =
                searchTerm !== "" &&
                !postText.includes(searchTerm);
        });
    });
}


/* =========================================================
   7. HEADER DROPDOWN PANELS

   Menu, Notifications, Messenger and Profile panels are
   created dynamically by JavaScript.

   This keeps their behaviour together in one place.
========================================================= */

const facebookHeader = document.querySelector(".facebook-header");

if (facebookHeader) {

    const utilityButtons = facebookHeader.querySelectorAll(
        '.utility-button[data-action="menu"], ' +
        '.utility-button[data-action="notifications"], ' +
        '.utility-button[data-action="messenger"], ' +
        '.utility-button[data-action="profile"]'
    );


    // Content for each dropdown panel.

    const dropdownContent = {

        menu: {
            title: "Menu",

            content: `
                <button
                    type="button"
                    class="header-dropdown-item"
                    data-nav-target="home">
                    Home
                </button>

                <button
                    type="button"
                    class="header-dropdown-item"
                    data-nav-target="video">
                    Video
                </button>

                <button
                    type="button"
                    class="header-dropdown-item"
                    data-nav-target="marketplace">
                    Marketplace
                </button>

                <button
                    type="button"
                    class="header-dropdown-item"
                    data-nav-target="friends">
                    Friends
                </button>

                <button
                    type="button"
                    class="header-dropdown-item"
                    data-nav-target="groups">
                    Groups
                </button>
            `
        },


        notifications: {
            title: "Notifications",
        
            content: `
                <div class="notifications-list">
                    <p class="header-dropdown-empty">
                        Loading notifications...
                    </p>
                </div>
            `
        },


        messenger: {
            title: "Messenger",
        
            content: `
                <div class="messenger-interface">
        
                    <input
                        type="search"
                        class="header-dropdown-search"
                        placeholder="Search Messenger"
                        aria-label="Search registered users">
        
                    <div
                        class="messenger-user-list"
                        aria-label="Registered users">
                        <p class="header-dropdown-empty">
                            Open Messenger to load users.
                        </p>
                    </div>
        
                    <section class="messenger-conversation" hidden>
        
                        <div class="messenger-conversation-heading">
                            <button
                                type="button"
                                class="messenger-back-button">
                                &larr; Back
                            </button>
        
                            <strong class="messenger-partner-name">
                                Conversation
                            </strong>
                        </div>
        
                        <div
                            class="messenger-messages"
                            aria-live="polite">
                        </div>
        
                        <p
                            class="messenger-status"
                            role="status">
                        </p>
        
                        <form class="messenger-send-form">
        
                            <input
                                type="text"
                                class="messenger-message-input"
                                placeholder="Write a message..."
                                maxlength="2000"
                                autocomplete="off"
                                required>
        
                            <button type="submit">
                                Send
                            </button>
        
                        </form>
        
                    </section>
                </div>
            `
        },

        
        profile: {
            title: "Your account",

            content: `
                <!-- Signed-in user's profile information -->
                <div class="current-user-profile" id="currentUserProfile">
                    <div class="profile-avatar-placeholder" id="currentUserAvatar">
                        ?
                    </div>

                    <div class="current-user-details">
                        <strong id="currentUserName">Loading profile...</strong>
                        <span id="currentUserEmail"></span>
                    </div>
                </div>

                <div class="header-dropdown-divider"></div>

                <!-- Theme preference -->
                <button
                    type="button"
                    class="header-dropdown-item profile-action-item"
                    id="themeToggle">
                    <span class="profile-action-icon" aria-hidden="true">
                        <i class="fa-solid fa-moon"></i>
                    </span>
                    <span id="themeToggleText">Switch to dark mode</span>
                </button>

                <!-- Sign out of the current account -->
                <button
                    type="button"
                    class="header-dropdown-item profile-action-item"
                    data-profile-action="logout">
                    <span class="profile-action-icon" aria-hidden="true">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </span>
                    <span>Log Out</span>
                </button>
            `
        }

    
    };


    // Track the currently open panel and its button.

    let openPanel = null;
    let openButton = null;

    // Store each Messenger panel's loading function.
    // A WeakMap associates the function with its panel.
    const messengerPanelLoaders = new WeakMap();


    function closeHeaderPanel() {
        if (openPanel) {
            openPanel.hidden = true;
        }

        if (openButton) {
            openButton.setAttribute("aria-expanded", "false");
        }

        openPanel = null;
        openButton = null;
    }

    
    /* ---------------------------------------------------------
       SECTION 7A: LOAD AND DISPLAY NOTIFICATIONS
    
       Retrieve notifications for the signed-in user and build
       the interface using DOM elements and textContent.
    
       textContent prevents notification messages from being
       interpreted as HTML.
    --------------------------------------------------------- */
    
    async function loadNotifications(panel) {
        const list = panel.querySelector(".notifications-list");
    
        if (!list) {
            return;
        }
    
        // Show feedback while the database request is running.
        list.replaceChildren();
    
        const loadingMessage = document.createElement("p");
        loadingMessage.className = "header-dropdown-empty";
        loadingMessage.textContent = "Loading notifications...";
    
        list.appendChild(loadingMessage);
    
        try {
            // Fetch only the signed-in user's notifications.
            const notifications = await getMyNotifications();
    
            list.replaceChildren();
    
            // Display a friendly message if there are no results.
            if (notifications.length === 0) {
                const emptyMessage = document.createElement("p");
                emptyMessage.className = "header-dropdown-empty";
                emptyMessage.textContent = "You're all caught up!";
    
                list.appendChild(emptyMessage);
                return;
            }
    
            // Create a separate interface item for each notification.
            notifications.forEach((notification) => {
                const item = document.createElement("div");
    
                item.className = "notification-item";
    
                // Give unread notifications a separate CSS class.
                if (!notification.is_read) {
                    item.classList.add("is-unread");
                }
    
                const message = document.createElement("p");
                message.className = "notification-message";
                message.textContent =
                    notification.message || "You have a new notification.";
    
                item.appendChild(message);
    
                // Display the time when the notification was created.
                if (notification.created_at) {
                    const time = document.createElement("small");
                    time.className = "notification-time";
    
                    const date = new Date(notification.created_at);
    
                    time.textContent = Number.isNaN(date.getTime())
                        ? ""
                        : date.toLocaleString();
    
                    item.appendChild(time);
                }
    
                // Add a button only when the notification is unread.
                if (!notification.is_read) {
                    const readButton = document.createElement("button");
    
                    readButton.type = "button";
                    readButton.className = "notification-read-button";
                    readButton.textContent = "Mark as read";
    
                    readButton.addEventListener("click", async () => {
                        readButton.disabled = true;
                        readButton.textContent = "Updating...";
    
                        try {
                            // Update the record in Supabase.
                            const updated = await markNotificationRead(
                                notification.id
                            );
    
                            if (!updated) {
                                throw new Error(
                                    "The notification could not be updated."
                                );
                            }
    
                            // Update the interface after the database succeeds.
                            notification.is_read = true;
                            item.classList.remove("is-unread");
    
                            readButton.remove();
    
                        } catch (error) {
                            console.error(
                                "Failed to mark notification as read:",
                                error
                            );
    
                            readButton.disabled = false;
                            readButton.textContent = "Try again";
                        }
                    });
    
                    item.appendChild(readButton);
                } else {
                    const readLabel = document.createElement("small");
                    readLabel.className = "notification-read-label";
                    readLabel.textContent = "Read";
    
                    item.appendChild(readLabel);
                }
    
                list.appendChild(item);
            });
    
        } catch (error) {
            console.error("Failed to load notifications:", error);
    
            list.replaceChildren();
    
            const errorMessage = document.createElement("p");
            errorMessage.className = "header-dropdown-empty";
            errorMessage.textContent =
                "Couldn't load notifications. Please try again.";
    
            const retryButton = document.createElement("button");
            retryButton.type = "button";
            retryButton.className = "header-dropdown-item";
            retryButton.textContent = "Retry";
    
            retryButton.addEventListener("click", () => {
                loadNotifications(panel);
            });
    
            list.append(errorMessage, retryButton);
        }
    }

    /* ---------------------------------------------------------
    SECTION 7B: MESSENGER — USER LIST AND CONVERSATIONS
 
    Load registered profiles, search for a user, display
    a conversation, send messages, and mark received
    messages as read.
 
    The database operations are handled by data.js.
 --------------------------------------------------------- */
 
 function initializeMessengerPanel(panel) {
     const searchInput = panel.querySelector(".header-dropdown-search");
     const userList = panel.querySelector(".messenger-user-list");
     const conversationView = panel.querySelector(
         ".messenger-conversation"
     );
     const partnerName = panel.querySelector(
         ".messenger-partner-name"
     );
     const messagesContainer = panel.querySelector(
         ".messenger-messages"
     );
     const messageForm = panel.querySelector(
         ".messenger-send-form"
     );
     const messageInput = panel.querySelector(
         ".messenger-message-input"
     );
     const statusMessage = panel.querySelector(".messenger-status");
     const backButton = panel.querySelector(".messenger-back-button");
 
     // Store the profiles and selected conversation for this panel.
     let profiles = [];
     let selectedProfile = null;
     let currentUserId = null;
     let loadingUsers = false;
 
 
     /* -----------------------------------------------------
        Get the current user's ID from Supabase Auth.
     ----------------------------------------------------- */
 
     async function loadCurrentUserId() {
         const { data, error } = await supabase.auth.getUser();
 
         if (error) {
             throw error;
         }
 
         if (!data.user) {
             throw new Error("Please sign in to use Messenger.");
         }
 
         currentUserId = data.user.id;
     }
 
 
     /* -----------------------------------------------------
        Display the available registered users.
 
        User names are assigned through textContent rather
        than inserted as HTML.
     ----------------------------------------------------- */
 
     function renderUserList() {
         userList.replaceChildren();
 
         const searchTerm = searchInput.value.trim().toLowerCase();
 
         const filteredProfiles = profiles.filter((profile) => {
             const name = (
                 profile.display_name || "Facebook User"
             ).toLowerCase();
 
             return name.includes(searchTerm);
         });
 
         if (filteredProfiles.length === 0) {
             const emptyMessage = document.createElement("p");
 
             emptyMessage.className = "header-dropdown-empty";
             emptyMessage.textContent = profiles.length === 0
                 ? "No other registered users were found."
                 : "No users match your search.";
 
             userList.appendChild(emptyMessage);
             return;
         }
 
         filteredProfiles.forEach((profile) => {
             const userButton = document.createElement("button");
 
             userButton.type = "button";
             userButton.className = "messenger-user-item";
 
             const avatar = document.createElement("span");
             avatar.className = "messenger-user-avatar";
 
             const name = profile.display_name || "Facebook User";
 
             // Display an avatar image when a valid URL is available.
             if (
                 typeof profile.avatar_url === "string" &&
                 /^https?:\/\//i.test(profile.avatar_url)
             ) {
                 const image = document.createElement("img");
 
                 image.src = profile.avatar_url;
                 image.alt = "";
                 image.loading = "lazy";
 
                 image.addEventListener("error", () => {
                     avatar.replaceChildren();
                     avatar.textContent =
                         name.trim().charAt(0).toUpperCase() || "?";
                 }, { once: true });
 
                 avatar.appendChild(image);
             } else {
                 avatar.textContent =
                     name.trim().charAt(0).toUpperCase() || "?";
             }
 
             const nameElement = document.createElement("span");
             nameElement.className = "messenger-user-name";
             nameElement.textContent = name;
 
             userButton.append(avatar, nameElement);
 
             userButton.addEventListener("click", () => {
                 openConversation(profile);
             });
 
             userList.appendChild(userButton);
         });
     }
 
 
     /* -----------------------------------------------------
        Load profiles from Supabase.
     ----------------------------------------------------- */
 
     async function loadUsers() {
         if (loadingUsers) {
             return;
         }
 
         loadingUsers = true;
 
         userList.replaceChildren();
 
         const loadingMessage = document.createElement("p");
         loadingMessage.className = "header-dropdown-empty";
         loadingMessage.textContent = "Loading registered users...";
 
         userList.appendChild(loadingMessage);
 
         try {
             await loadCurrentUserId();
 
             profiles = await getMessageableProfiles();
 
             renderUserList();
 
         } catch (error) {
             console.error("Failed to load Messenger users:", error);
 
             userList.replaceChildren();
 
             const errorMessage = document.createElement("p");
             errorMessage.className = "header-dropdown-empty";
             errorMessage.textContent =
                 "Couldn't load users. Please try again.";
 
             const retryButton = document.createElement("button");
             retryButton.type = "button";
             retryButton.className = "header-dropdown-item";
             retryButton.textContent = "Retry";
 
             retryButton.addEventListener("click", loadUsers);
 
             userList.append(errorMessage, retryButton);
 
         } finally {
             loadingUsers = false;
         }
     }
 
 
     /* -----------------------------------------------------
        Render the messages in the selected conversation.
     ----------------------------------------------------- */
 
     function renderMessages(messages) {
         messagesContainer.replaceChildren();
 
         if (messages.length === 0) {
             const emptyMessage = document.createElement("p");
 
             emptyMessage.className = "header-dropdown-empty";
             emptyMessage.textContent =
                 "No messages yet. Say hello!";
 
             messagesContainer.appendChild(emptyMessage);
             return;
         }
 
         messages.forEach((message) => {
             const messageItem = document.createElement("div");
 
             messageItem.className = "messenger-message";
 
             // Visually distinguish messages sent by the current user.
             const isSentByMe = message.sender_id === currentUserId;
 
             messageItem.classList.add(
                 isSentByMe ? "message-sent" : "message-received"
             );
 
             const messageText = document.createElement("p");
             messageText.className = "messenger-message-text";
 
             // Treat message content as plain text, not HTML.
             messageText.textContent = message.content || "";
 
             messageItem.appendChild(messageText);
 
             if (message.created_at) {
                 const time = document.createElement("small");
 
                 const date = new Date(message.created_at);
 
                 time.textContent = Number.isNaN(date.getTime())
                     ? ""
                     : date.toLocaleString();
 
                 time.className = "messenger-message-time";
 
                 messageItem.appendChild(time);
             }
 
             messagesContainer.appendChild(messageItem);
         });
 
         // Show the latest messages after rendering the conversation.
         messagesContainer.scrollTop = messagesContainer.scrollHeight;
     }
 
 
     /* -----------------------------------------------------
        Refresh the currently selected conversation.
     ----------------------------------------------------- */
 
     async function refreshConversation() {
         if (!selectedProfile) {
             return;
         }
 
         messagesContainer.replaceChildren();
 
         const loadingMessage = document.createElement("p");
         loadingMessage.className = "header-dropdown-empty";
         loadingMessage.textContent = "Loading messages...";
 
         messagesContainer.appendChild(loadingMessage);
 
         try {
             const messages = await getConversationMessages(
                 selectedProfile.id
             );
 
             renderMessages(messages);
 
         } catch (error) {
             console.error("Failed to load conversation:", error);
 
             messagesContainer.replaceChildren();
 
             const errorMessage = document.createElement("p");
             errorMessage.className = "header-dropdown-empty";
             errorMessage.textContent =
                 "Couldn't load this conversation. Please try again.";
 
             messagesContainer.appendChild(errorMessage);
         }
     }
 
 
     /* -----------------------------------------------------
        Open a conversation with the selected registered user.
     ----------------------------------------------------- */
 
     async function openConversation(profile) {
         selectedProfile = profile;
 
         partnerName.textContent =
             profile.display_name || "Facebook User";
 
         searchInput.hidden = true;
         userList.hidden = true;
         conversationView.hidden = false;
 
         statusMessage.textContent = "";
         messageInput.value = "";
 
         await refreshConversation();
 
         // Mark incoming messages as read without preventing
         // the conversation from opening if this update fails.
         try {
             await markReceivedMessagesRead(profile.id);
         } catch (error) {
             console.error(
                 "Failed to mark received messages as read:",
                 error
             );
         }
 
         messageInput.focus();
     }
 
 
     /* -----------------------------------------------------
        Return to the list of registered users.
     ----------------------------------------------------- */
 
     backButton.addEventListener("click", () => {
         selectedProfile = null;
 
         conversationView.hidden = true;
         userList.hidden = false;
         searchInput.hidden = false;
 
         statusMessage.textContent = "";
 
         renderUserList();
         searchInput.focus();
     });
 
 
     /* -----------------------------------------------------
        Filter the user list as the search term changes.
     ----------------------------------------------------- */
 
     searchInput.addEventListener("input", renderUserList);
 
 
     /* -----------------------------------------------------
        Send a message to the selected user.
     ----------------------------------------------------- */
 
     messageForm.addEventListener("submit", async (event) => {
         event.preventDefault();
 
         if (!selectedProfile) {
             statusMessage.textContent =
                 "Please select a user first.";
             return;
         }
 
         const content = messageInput.value.trim();
 
         if (!content) {
             return;
         }
 
         const sendButton = messageForm.querySelector(
             'button[type="submit"]'
         );
 
         sendButton.disabled = true;
         statusMessage.textContent = "Sending message...";
 
         try {
             // Save the message through the Supabase function.
             await sendDirectMessage(selectedProfile.id, content);
 
             messageInput.value = "";
             statusMessage.textContent = "Message sent.";
 
             // Reload the conversation to show the saved message.
             await refreshConversation();
 
         } catch (error) {
             console.error("Failed to send message:", error);
 
             statusMessage.textContent =
                 "Couldn't send the message. Please try again.";
 
         } finally {
             sendButton.disabled = false;
             messageInput.focus();
         }
     });
 
 
     // Return this function so the panel can reload users
     // whenever the Messenger dropdown is opened.
     return loadUsers;
 }
    


    // Create a panel and connect its corresponding button.

    utilityButtons.forEach((button) => {
        const action = button.dataset.action;

        const panelInfo = dropdownContent[action];

        if (!panelInfo) {
            return;
        }

        const panel = document.createElement("section");

        panel.className = "header-dropdown";
        panel.dataset.panel = action;
        panel.hidden = true;

        panel.setAttribute(
            "aria-label",
            panelInfo.title
        );

        panel.innerHTML = `
            <div class="header-dropdown-heading">
                <h2>${panelInfo.title}</h2>

                <button
                    type="button"
                    class="header-dropdown-close"
                    aria-label="Close ${panelInfo.title}">
                    &times;
                </button>
            </div>

            <div class="header-dropdown-content">
                ${panelInfo.content}
            </div>
        `;

        facebookHeader.appendChild(panel);

        // SECTION 7B: Initialize Messenger controls only for its panel.
        if (action === "messenger") {
            messengerPanelLoaders.set(
                panel,
                initializeMessengerPanel(panel)
            );
}

        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-haspopup", "true");


        button.addEventListener("click", (event) => {
            event.stopPropagation();
        
            // Clicking the same button closes its panel.
            if (openPanel === panel) {
                closeHeaderPanel();
                return;
            }
        
            // Close another panel before opening this one.
            closeHeaderPanel();
        
            panel.hidden = false;
        
            button.setAttribute("aria-expanded", "true");
        
            openPanel = panel;
            openButton = button;
        
            // Load fresh notifications whenever the panel opens.
            if (action === "notifications") {
                loadNotifications(panel);
            }
        
            // Load registered users whenever Messenger opens.
        if (action === "messenger") {
            const loadMessengerUsers = messengerPanelLoaders.get(panel);

            if (loadMessengerUsers) {
                loadMessengerUsers();
            }

    // Focus the search field when the panel opens.
    panel.querySelector(".header-dropdown-search")?.focus();
}
        });


        panel
            .querySelector(".header-dropdown-close")
            .addEventListener("click", closeHeaderPanel);
    });


    // Handle actions inside dynamically created panels.

    facebookHeader.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const navShortcut = target.closest("[data-nav-target]");

        const profileAction = target.closest(
            "[data-profile-action]"
        );

        
        // Handle logout immediately, before other dropdown actions.
        if (profileAction?.dataset.profileAction === "logout") {
            closeHeaderPanel();
            logoutUser();
            return;
        }



        // Menu shortcuts select their corresponding header item.

        if (navShortcut) {
            const destination = navShortcut.dataset.navTarget;

            const navButton = facebookHeader.querySelector(
                `.nav-item[data-action="${destination}"]`
            );

            closeHeaderPanel();

            if (navButton) {
                navButton.click();
            }

            return;
        }

    });


    // Close a dropdown when clicking outside the header.

    document.addEventListener("click", (event) => {
        if (!facebookHeader.contains(event.target)) {
            closeHeaderPanel();
        }
    });


    // Escape closes any open dropdown.

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeHeaderPanel();
        }
    });
}




/* =========================================================
   8. THEME PREFERENCE — LOCAL STORAGE

   localStorage remembers the theme on this browser.

   Use it for preferences such as light/dark mode, not as
   a secure place for passwords or private account data.
========================================================= */

const THEME_STORAGE_KEY = "facebookTheme";


function readSavedTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);

    } catch (error) {
        console.warn(
            "Could not read saved theme preference:",
            error
        );

        return null;
    }
}


function saveTheme(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);

    } catch (error) {
        console.warn(
            "Could not save theme preference:",
            error
        );
    }
}



/* Update the theme button's text and icon to match the current theme. */
function updateThemeButtonLabel() {
    const themeToggle = document.getElementById("themeToggle");
    const themeToggleText = document.getElementById("themeToggleText");

    if (!themeToggle || !themeToggleText) {
        return;
    }

    const isDark = document.body.classList.contains("dark-theme");
    const icon = themeToggle.querySelector("i");

    themeToggleText.textContent = isDark
        ? "Switch to light mode"
        : "Switch to dark mode";

    if (icon) {
        icon.className = isDark
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";
    }
}


// Restore the saved theme when the page loads.

if (readSavedTheme() === "dark") {
    document.body.classList.add("dark-theme");
}


// Event delegation allows this to work even though the
// theme button is created later inside the Profile dropdown.

document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
        return;
    }

    const themeToggle = target.closest("#themeToggle");

    if (!themeToggle) {
        return;
    }

    const isDark = document.body.classList.toggle("dark-theme");

    saveTheme(isDark ? "dark" : "light");

    updateThemeButtonLabel();
});


// Update the theme button label when Profile is opened.

document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
        return;
    }

    if (target.closest('[data-action="profile"]')) {
        requestAnimationFrame(updateThemeButtonLabel);
    }
});


/* =========================================================
   9. LEFT SIDEBAR INTERACTIONS

   Sidebar selection is separate from header navigation.
   Keep the existing See more / See less behaviour.
========================================================= */

const sidebarItems = document.querySelectorAll(
    ".left-sidebar .menu-item"
);


sidebarItems.forEach((item) => {
    item.addEventListener("click", () => {

        // The See more button has its own click handler below.
        if (item.id === "seeMoreBtn") {
            return;
        }

        sidebarItems.forEach((otherItem) => {
            otherItem.classList.remove("active");
        });

        item.classList.add("active");
    });
});



/* ---------------------------------------------------------
   SEE MORE / SEE LESS — LOCAL STORAGE

   Remember whether the sidebar's extra items are expanded.
   This preference is saved in the current browser.

   localStorage stores the preference, while the existing
   CSS class "open" controls the visual appearance.
--------------------------------------------------------- */

const SIDEBAR_STORAGE_KEY = "facebookSidebarExpanded";

const seeMoreButton = document.getElementById("seeMoreBtn");
const moreItems = document.getElementById("moreItems");
const seeMoreText = document.getElementById("seeMoreText");


// Read the saved preference safely.
// If storage is unavailable, default to a collapsed sidebar.

function readSidebarPreference() {
    try {
        return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch (error) {
        console.warn("Could not read sidebar preference:", error);
        return false;
    }
}


// Save whether the extra sidebar items are expanded.

function saveSidebarPreference(isExpanded) {
    try {
        localStorage.setItem(
            SIDEBAR_STORAGE_KEY,
            String(isExpanded)
        );
    } catch (error) {
        console.warn("Could not save sidebar preference:", error);
    }
}


// Update the button, label and extra items together.
// Keeping these changes in one function avoids inconsistent UI.

function setSidebarExpanded(isExpanded) {
    if (!seeMoreButton || !moreItems || !seeMoreText) {
        return;
    }

    moreItems.classList.toggle("open", isExpanded);
    seeMoreButton.classList.toggle("open", isExpanded);

    seeMoreText.textContent = isExpanded
        ? "See less"
        : "See more";

    // Tell assistive technologies whether the section is expanded.
    seeMoreButton.setAttribute(
        "aria-expanded",
        String(isExpanded)
    );
}


// Restore the saved preference when the page loads.

if (seeMoreButton && moreItems && seeMoreText) {
    setSidebarExpanded(readSidebarPreference());

    // Toggle the section when the user clicks See more / See less.
    seeMoreButton.addEventListener("click", () => {
        const isExpanded = !moreItems.classList.contains("open");

        setSidebarExpanded(isExpanded);
        saveSidebarPreference(isExpanded);
    });
}


/* =========================================================
   10. FUTURE INTEGRATION POINTS

   Add new code in the appropriate section or a separate
   JavaScript module.

   ROLE 4:
   - Feed and post interactions.
   - Like, comment, share and create-post behaviour.
   - Connect post actions to the appropriate data source.

   ROLE 7B:
   - Left-sidebar content and navigation.
   - Connect sidebar links to real features or destinations.

   AUTHENTICATED PROFILE:
   - Display the logged-in user's real name and avatar.
   - Retrieve the user's information from the appropriate
     Supabase table or authentication metadata.

   SEARCH:
   - Expand beyond visible feed text when user and server
     search features are implemented.

   NOTIFICATIONS AND MESSENGER:
   - Replace placeholder content with real application data.

   IMPORTANT:
   Avoid adding a second listener for a control already
   handled above. Coordinate integrations with the team.
========================================================= */


/* =========================================================
   11. START APPLICATION

   Keep this at the bottom so the functions and event
   listeners above are registered before startup begins.
========================================================= */

startApplication();
