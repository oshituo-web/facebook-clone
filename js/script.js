async function getUsers() {
    const response = await fetch("./data/users.json");

    console.log("Status:", response.status);
     if (!response.ok) {
        throw new Error("Failed to load users");
     }

     return await response.json();
}

async function getPosts() {

    const response = await fetch("./data/posts.json");

    if (!response.ok) {
        throw new Error("Failed to load posts");
    }
    return await response.json();
}

async function getStories() {
    const response = await fetch("./data/stories.json");
    if (!response.ok) {
        throw new Error("Failed to load stories");
    }
    return await response.json();
}

async function getComments() {
    const response = await fetch("./data/comments.json");

    if (!response.ok) {
        throw new Error("Failed to load comments");
    }
    return await response.json();
}

function getPostsByUser(userId) {
    return fetch("./data/posts.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load posts");
            }
            return response.json();
        })
        .then(posts => {
            return posts.filter(post => post.userId === userId);
        });
}

async function createTestPosts() {
    
    const newPost = {
        title: "Learning Fetch API",
        body: "This is a test post.",
        userId: 1
    };

    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(newPost)
    });

    if (!response.ok) {
        throw new Error("Failed to create posts");
    }
    const createdPost = await response.json();

    console.log("Created post:", createdPost);
}

createTestPost();

async function loadData () {

    try {
        const users = await getUsers();
        const posts = await getPosts();
        const stories = await getStories();
        const comments= await getComments();
        const lemuelPosts = await getPostsByUser(1);

        console.log("Users:", users);
        console.log("Posts:", posts);
        console.log("Stories:", stories);
        console.log("Comments:", comments);
        console.log("Posts bt user 1:", lemuelPosts);
    }
    catch(error) {
        console.error("Failed to load application data:", error);
    }
}

loadData();


// function to display Posts on the webpage
function renderPosts(postsArray) {
    const postsContainer = document.querySelector(".posts");

}