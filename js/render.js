
/* =========================================
   RENDERING
========================================= */

/* =========================================
   RENDER POSTS
========================================= */

export function renderPosts(posts, users, comments = []) {
    const postsContainer = document.querySelector(".posts");

    if (!postsContainer) {
        return;
    }

    // Clear existing posts before rendering again.
    postsContainer.innerHTML = "";

    posts.forEach(post => {
        const user = users.find(
            candidate => candidate.id === post.userId
        );

        if (!user) {
            console.warn(`User not found for post ${post.id}`);
            return;
        }

        const postElement = document.createElement("article");
        postElement.classList.add("post");

        // Post header
        const postHeader = document.createElement("div");
        postHeader.classList.add("post-header");

        const avatar = document.createElement("img");
        avatar.src = user.avatar;
        avatar.alt = user.name;
        avatar.classList.add("post-avatar");

        const authorDetails = document.createElement("div");

        const authorName = document.createElement("strong");
        authorName.textContent = user.name;

        const date = document.createElement("small");
        date.textContent = post.createdAt;

        authorDetails.append(authorName, date);
        postHeader.append(avatar, authorDetails);

        // Post content
        const postContent = document.createElement("div");
        postContent.classList.add("post-content");

        const message = document.createElement("p");
        message.textContent = post.content;
        postContent.appendChild(message);

        // Optional post image
        if (post.image) {
            const postImage = document.createElement("img");
            postImage.src = post.image;
            postImage.alt = "Post image";
            postImage.classList.add("post-image");
            postContent.appendChild(postImage);
        }

        // Post likes
        const postStats = document.createElement("div");
        postStats.classList.add("post-stats");
        
        // ----- The two containers, with Font Awesome icons -----
        // Every number starts at 0.
        // data-type tells JavaScript WHICH button was clicked.
        postStats.innerHTML = `
            <div class="post-stats__actions">

                <button type="button" class="stat-btn" data-type="like">
                    <i class="fa-regular fa-thumbs-up"></i>
                    <span class="count">0</span>
                </button>

                <button type="button" class="stat-btn" data-type="comment">
                    <i class="fa-regular fa-comment"></i>
                    <span class="count">0</span>
                </button>

                <button type="button" class="stat-btn" data-type="share">
                    <i class="fa-solid fa-share"></i>
                    <span class="count">0</span>
                </button>

            </div>

            <div class="post-stats__reactions">
                <span class="reaction reaction--like"><i class="fa-solid fa-thumbs-up"></i></span>
                <span class="reaction reaction--love"><i class="fa-solid fa-heart"></i></span>
            </div>
        `;

        // ----- The numbers live here, one set PER post -----
      // Because this object is created inside the function,
      // every post gets its own separate counts.
      const counts = { like: 0, comment: 0, share: 0 };
      let liked = false;

      // ----- Make the buttons work -----
      const buttons = postStats.querySelectorAll(".stat-btn");

      buttons.forEach((btn) => {

        btn.addEventListener("click", () => {

          const type    = btn.dataset.type;            // "like", "comment" or "share"
          const countEl = btn.querySelector(".count"); // the <span> with the number
          const icon    = btn.querySelector("i");      // the icon

          if (type === "like") {
            // Like is a TOGGLE: click once to like, click again to unlike
            liked = !liked;
            counts.like += liked ? 1 : -1;

            btn.classList.toggle("liked", liked);       // turns it blue
            icon.classList.toggle("fa-solid", liked);   // filled thumb when liked
            icon.classList.toggle("fa-regular", !liked);// outline thumb when not
          } else {
            // Comment and share just go up by 1 each click
            counts[type] += 1;
          }

          // Write the new number onto the page
          countEl.textContent = counts[type];
        });
      });

        // Post comments
        const postComments = document.createElement("div");
        postComments.classList.add("post-comments");

        const commentsForThisPost = comments.filter(
            comment => comment.postId === post.id
        );

        commentsForThisPost.forEach(comment => {
            const commenter = users.find(
                candidate => candidate.id === comment.userId
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

        // Add all parts to the post.
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
   RENDER STORIES
========================================= */


export const renderStories = (stories, users) => {

    // 1. FIND the section where cards will go
    const container = document.querySelector(".stories");
    if (!container) return;

    // 2. CLEAR it, so calling this twice never duplicates cards
    container.innerHTML = "";

    // 3. LOOP over every story
    stories.forEach((story) => {

        // 4. RELATIONSHIP: find the user who owns this story
        const user = users.find((u) => {
            return u.id === story.userId;
        });

        // If no matching user exists, skip this story
        if (!user) return;

        // 5. BUILD one card
        const card = document.createElement("article");
        card.className = "story-card";
        card.style.backgroundImage = `url("${story.image}")`;

        card.innerHTML = `
            <img class="story-avatar" src="${user.avatar}" alt="${user.name}">
            <span class="story-name">${user.name}</span>
        `;

        // 6. ADD it to the page
        container.appendChild(card);
    });
};

export const renderCreatePost = (currentUser) => {
      const container = document.querySelector(".create-post");
      if (!container) return;
      const firstName = currentUser.name.split(" ")[0];

      container.innerHTML = `
        <div class="create-post__top">
          <img class="create-post__avatar" src="${currentUser.avatar}" alt="${currentUser.name}">
          <button type="button" class="create-post__input" id="openComposer">
            What's on your mind, ${firstName}?
          </button>
          <button type="button" class="create-post__action">
            <i class="fa-solid fa-video icon-red"></i><span></span>
          </button>
          <button type="button" class="create-post__action">
            <i class="fa-solid fa-images icon-green"></i><span></span>
          </button>
          <button type="button" class="create-post__action">
            <i class="fa-solid fa-face-smile icon-yellow"></i><span></span>
          </button>
        </div>
        <div class="create-post__divider"></div>

        <!-- The pop-up. Hidden by CSS until JavaScript adds the class "open" -->
        <div class="composer-overlay" id="composerOverlay">
          <div class="composer">
            <header class="composer__header">
              <h3>Create post</h3>
              <button type="button" class="composer__close" id="closeComposer" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </header>
            <div class="composer__user">
              <img src="${currentUser.avatar}" alt="">
              <strong>${currentUser.name}</strong>
            </div>
            <textarea id="composerText" placeholder="What's on your mind, ${firstName}?"></textarea>
            <button type="button" class="composer__submit" id="submitPost" disabled>Post</button>
          </div>
        </div>
      `;
      setupComposer();
    }

    const setupComposer = () => {
        // FIND
        const overlay    = document.getElementById("composerOverlay");
        const openBtn    = document.getElementById("openComposer");
        const closeBtn   = document.getElementById("closeComposer");
        const textarea   = document.getElementById("composerText");
        const submitBtn  = document.getElementById("submitPost");

        // LISTEN + CHANGE: open
        openBtn.addEventListener("click", function () {
            overlay.classList.add("open");
            textarea.focus();            // cursor ready to type
        });

        // close with the X button
        closeBtn.addEventListener("click", () => {
            overlay.classList.remove("open");
        });

        // close when clicking the dark area OUTSIDE the box
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                overlay.classList.remove("open");
            }
        });

        // enable "Post" only when there is real text
        textarea.addEventListener("input", () => { 
            submitBtn.disabled = textarea.value.trim() === ""; 
        });


        // submit (UI only, no backend)
        submitBtn.addEventListener("click", () => {
            console.log("New post text:", textarea.value);
            textarea.value = "";
            submitBtn.disabled = true;
            overlay.classList.remove("open");
        });
    }




