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

/* ---------- JOB 1: Highlight the clicked item ---------- */

// 1) FIND: get every element with the class "menu-item"
const allItems = document.querySelectorAll(".menu-item");

// Go through them one by one using foreach loop
allItems.forEach((item) => {

    // 2) LISTEN: run this function whenever THIS item is clicked
    item.addEventListener("click", () => {

    // Skip the "See more" button — it has its own job (below)
    if (item.id === "seeMoreBtn") return;

    // 3) CHANGE: first remove "active" from ALL items...
    allItems.forEach((other) => {
        other.classList.remove("active");
    });

    // ...then add "active" to the one that was clicked
    item.classList.add("active");
    });
});


/* ---------- JOB 2: Show / hide the extra items ---------- */

// FIND the three elements we need
const seeMoreBtn  = document.getElementById("seeMoreBtn");
const moreItems   = document.getElementById("moreItems");
const seeMoreText = document.getElementById("seeMoreText");

// LISTEN for a click on the "See more" button
seeMoreBtn.addEventListener("click", function () {

    // classList.toggle: adds the class if missing, removes it if present
    moreItems.classList.toggle("open");
    seeMoreBtn.classList.toggle("open");

    // CHANGE the button text depending on the state
    if (moreItems.classList.contains("open")) {
    seeMoreText.textContent = "See less";
    } else {
    seeMoreText.textContent = "See more";
    }
});
