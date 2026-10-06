/* =========================================
   APPLICATION ENTRY POINT
========================================= */

import {
    getUsers,
    getPosts,
    getStories,
    getComments
} from "./data.js";


import {
    renderPosts,
    renderStories
} from "./render.js";


/* =========================================
   LOAD APPLICATION
========================================= */

async function loadApplication() {

    try {

        const users =
            await getUsers();

        const posts =
            await getPosts();

        const stories =
            await getStories();

        const comments =
            await getComments();


        renderPosts(
            posts,
            users
        );


        renderStories(
            stories,
            users
        );


        console.log(
            "Application data loaded successfully."
        );


    } catch (error) {

        console.error(
            "Failed to load application:",
            error
        );

    }
}


/* =========================================
   START APPLICATION
========================================= */

loadApplication();