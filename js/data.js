/* =========================================
   DATA & API
   Role 5
========================================= */


/* =========================================
   GET USERS
========================================= */

export async function getUsers() {

    const response = await fetch("./data/users.json");

    if (!response.ok) {
        throw new Error("Failed to load users");
    }

    return await response.json();
}


/* =========================================
   GET POSTS
========================================= */

export async function getPosts() {

    const response = await fetch("./data/posts.json");

    if (!response.ok) {
        throw new Error("Failed to load posts");
    }

    return await response.json();
}


/* =========================================
   GET STORIES
========================================= */

export async function getStories() {

    const response = await fetch("./data/stories.json");

    if (!response.ok) {
        throw new Error("Failed to load stories");
    }

    return await response.json();
}


/* =========================================
   GET COMMENTS
========================================= */

export async function getComments() {

    const response = await fetch("./data/comments.json");

    if (!response.ok) {
        throw new Error("Failed to load comments");
    }

    return await response.json();
}


/* =========================================
   FIND USER BY ID
========================================= */

export function getUserById(users, userId) {

    return users.find(
        user => user.id === userId
    );
}


/* =========================================
   FIND POSTS BY USER
========================================= */

export function getPostsByUser(posts, userId) {

    return posts.filter(
        post => post.userId === userId
    );
}


/* =========================================
   FIND COMMENTS FOR A POST
========================================= */

export function getCommentsForPost(comments, postId) {

    return comments.filter(
        comment => comment.postId === postId
    );
}