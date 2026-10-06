/* =========================================
   RENDERING
========================================= */


/* =========================================
   RENDER POSTS
========================================= */

export function renderPosts(posts, users) {

    const postsContainer =
        document.querySelector(".posts");


    if (!postsContainer) {
        return;
    }


    postsContainer.innerHTML = "";


    posts.forEach(post => {

        const user =
            users.find(
                user => user.id === post.userId
            );


        if (!user) {
            return;
        }


        const postElement =
            document.createElement("article");


        postElement.classList.add("post");


        postElement.innerHTML = `

            <div class="post-header">

                <img
                    src="${user.avatar}"
                    alt="${user.name}"
                    class="post-avatar"
                >

                <div>

                    <strong>
                        ${user.name}
                    </strong>

                    <small>
                        ${post.createdAt}
                    </small>

                </div>

            </div>


            <div class="post-content">

                <p>
                    ${post.content}
                </p>

                ${
                    post.image
                    ? `
                        <img
                            src="${post.image}"
                            alt="Post image"
                            class="post-image"
                        >
                    `
                    : ""
                }

            </div>


            <div class="post-stats">

                <span>
                    ${post.likes} likes
                </span>

            </div>

        `;


        postsContainer.appendChild(
            postElement
        );

    });
}


/* =========================================
   RENDER STORIES
========================================= */

export function renderStories(stories, users) {

    const storiesContainer =
        document.querySelector(".stories");


    if (!storiesContainer) {
        return;
    }


    storiesContainer.innerHTML = "";


    stories.forEach(story => {

        const user =
            users.find(
                user => user.id === story.userId
            );


        if (!user) {
            return;
        }


        const storyElement =
            document.createElement("article");


        storyElement.classList.add("story");


        storyElement.innerHTML = `

            <img
                src="${story.image}"
                alt="${user.name}'s story"
            >

            <strong>
                ${user.name}
            </strong>

        `;


        storiesContainer.appendChild(
            storyElement
        );

    });
}