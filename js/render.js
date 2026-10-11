
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

        const likes = document.createElement("span");
        likes.textContent = `${post.likes} likes`;
        postStats.appendChild(likes);

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

export function renderStories(stories, users) {
    const storiesContainer = document.querySelector(".stories");

    if (!storiesContainer) {
        return;
    }

    // Clear existing stories before rendering again.
    storiesContainer.innerHTML = "";

    stories.forEach(story => {
        const user = users.find(
            candidate => candidate.id === story.userId
        );

        if (!user) {
            console.warn(`User not found for story ${story.id}`);
            return;
        }

        const storyElement = document.createElement("article");
        storyElement.classList.add("story");

        const storyImage = document.createElement("img");
        storyImage.src = story.image;
        storyImage.alt = `${user.name}'s story`;

        const authorName = document.createElement("strong");
        authorName.textContent = user.name;

        storyElement.append(storyImage, authorName);
        storiesContainer.appendChild(storyElement);
    });
}
