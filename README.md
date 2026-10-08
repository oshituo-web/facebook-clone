# Facebook-Inspired Web App

A collaborative web development project that recreates the core user-interface experience of a modern social media platform using HTML, CSS, and JavaScript.

This project is being developed as a team assignment to demonstrate practical frontend development concepts including semantic HTML, responsive CSS, JavaScript, JSON, Fetch API, HTTP requests, asynchronous programming, localStorage, URL parameters, and Git/GitHub collaboration.

> **Important:** This project is inspired by the observable interface patterns of Facebook. It is not affiliated with, endorsed by, or connected to Meta or Facebook.

---

## Project Goals

The goal of this project is to build a functional, responsive social-media-style web application that demonstrates:

* Semantic HTML5
* CSS3 and responsive design
* JavaScript DOM manipulation
* JSON data
* Fetch API
* GET requests
* POST requests
* Promises
* `async/await`
* HTTP response/status handling
* URL parameters and queries
* localStorage
* Event handling
* Dynamic rendering
* Git and GitHub collaboration
* Responsive design for desktop, tablet, and mobile

---

## Technology Stack

We are using:

* **HTML5** — page structure
* **CSS3** — styling and responsive layout
* **Vanilla JavaScript** — application logic and interactions
* **JSON** — local development data
* **Fetch API** — retrieving and sending data
* **localStorage** — storing appropriate client-side state
* **Git** — version control
* **GitHub** — collaboration and code hosting

### No Framework

This project intentionally uses **plain HTML, CSS, and JavaScript**.

We are not using React, Vue, Angular, Bootstrap, or other frontend frameworks unless our tutor specifically requires one later.

---

# Project Structure

```text
facebook-clone/
│
├── index.html
│
├── css/
│   └── style.css
│
├──js/
|   ├── script.js     ← Role 5
|   ├── data.js       ← Role 5
|   ├── render.js      ← Role 5
|   └── interactions.js   ← Role 6
│
├── data/
│   ├── users.json
│   ├── posts.json
│   ├── stories.json
│   └── comments.json
│
├── assets/
│   ├── avatars/
│   ├── icons/
│   └── images/
│
└── README.md
```

---

# Page Structure

The main page follows this structure:

```text
Header
   │
   └── Navigation / Search / Profile controls

Main
   │
   ├── Left Sidebar
   │
   ├── Feed
   │   ├── Stories
   │   ├── Create Post
   │   └── Posts
   │
   └── Right Sidebar
```

The main layout is designed to use:

* Three columns on desktop
* Two-column layout on tablet
* Single-column feed on mobile

---

# Data Architecture

The project uses separate JSON files for different types of data.

```text
users.json
    │
    ├── posts.json
    │       │
    │       └── comments.json
    │
    └── stories.json
```

Data relationships are maintained using IDs.

For example:

```json
{
    "id": 101,
    "userId": 1,
    "content": "Learning JavaScript today!"
}
```

`userId` connects the post to the corresponding user in `users.json`.

---

# Example Data Structure

### User

```json
{
    "id": 1,
    "name": "David Johnson",
    "username": "davidjohnson",
    "avatar": "./assets/avatars/david.jpg"
}
```

### Post

```json
{
    "id": 101,
    "userId": 1,
    "content": "Learning JavaScript today!",
    "image": "./assets/images/post1.jpg",
    "createdAt": "2026-10-04T08:00:00",
    "likes": 12
}
```

---

# Fetch and API Architecture

Data will generally follow this flow:

```text
JSON / API
    ↓
fetch()
    ↓
Response
    ↓
response.ok
    ↓
response.json()
    ↓
JavaScript data
    ↓
DOM
    ↓
User interface
```

The project will demonstrate both:

### GET

Used to retrieve data.

### POST

Used to demonstrate sending data to a test/mock API or backend.

> A static JSON file is not a POST API. POST requests will use an appropriate mock/test API or backend when implemented.

---

# JavaScript Concepts

The project will demonstrate:

### Promises

```javascript
fetch("./data/users.json")
    .then(response => response.json())
    .then(users => {
        console.log(users);
    })
    .catch(error => {
        console.error(error);
    });
```

### Async/Await

```javascript
async function getPosts() {
    const response = await fetch("./data/posts.json");

    if (!response.ok) {
        throw new Error("Failed to load posts");
    }

    return await response.json();
}
```

### Local Storage

Appropriate application state may be stored using:

```javascript
localStorage.setItem("currentUser", JSON.stringify(user));
```

Sensitive information such as passwords, private credentials, API keys, or secret tokens must never be stored in localStorage.

---

# URL Parameters

The project may use URL parameters for features such as search or viewing a particular user.

Example:

```text
index.html?user=2
```

JavaScript can read the parameter using:

```javascript
const params = new URLSearchParams(window.location.search);

const userId = params.get("user");
```

---

# Visual Design Standard

The project follows a shared visual language.

### Primary colors

```text
Facebook-style blue
Light grey page background
White cards
Dark primary text
Muted grey secondary text
```

### General design principles

* Clean layout
* Clear spacing
* White content cards
* Subtle borders
* Rounded corners
* Circular avatars
* Consistent buttons
* Minimal shadows
* No excessive gradients
* Readable typography

The exact values are maintained in the project's CSS variables.

---

# Responsive Design

The application must work across:

### Desktop

```text
Left Sidebar | Feed | Right Sidebar
```

### Tablet

```text
Left Sidebar | Feed
```

### Mobile

```text
Header
Stories
Create Post
Feed
```

The mobile version should not simply squeeze the desktop layout into a smaller screen.

---

# Team Roles

The project is divided into eight development roles.

### Role 1 — Project Lead & Git/GitHub

Responsible for:

* GitHub repository
* Branch management
* Pull Requests
* Code integration
* Project architecture
* Final testing
* Deployment
* README

### Role 2 — HTML Structure & Page Layout

Responsible for:

* Semantic HTML
* Page structure
* Main layout containers
* Shared HTML class names
* Feed/sidebar/header structure

### Role 3 — Header & Navigation

Responsible for:

* Header
* Branding
* Search
* Navigation
* Profile/menu controls

### Role 4 — Feed, Stories & Post Composer

Responsible for:

* Stories
* Create-post area
* Post structure
* Feed presentation

### Role 5 — Data, JSON & Fetch/API

Responsible for:

* JSON data
* Data relationships
* Fetch API
* GET requests
* POST requests
* Promises
* Async/await
* Response/status handling
* Error handling

### Role 6 — JavaScript Interactions & LocalStorage

Responsible for:

* Likes
* Saves
* Comments
* Shares
* Event listeners
* Dynamic interactions
* localStorage

### Role 7 — Left & Right Sidebars

Responsible for:

* Left sidebar
* Right sidebar
* Sidebar content
* Sidebar responsiveness

### Role 8 — Responsive Design & Visual Consistency

Responsible for:

* Global design system
* Colors
* Typography
* Spacing
* Responsive layout
* Mobile/tablet/desktop behaviour
* Visual consistency
* Final responsive testing

---

# Git & GitHub Workflow

The `main` branch contains the integrated project.

Team members should normally **not work directly on `main`**.

The standard workflow is:

```text
main
  ↓
Pull latest changes
  ↓
Create feature branch
  ↓
Develop
  ↓
Test
  ↓
Commit
  ↓
Push branch
  ↓
Create Pull Request
  ↓
Code review
  ↓
Merge into main
```

---

# Before Starting Work

Always update your local `main` branch:

```bash
git switch main
git pull origin main
```

Then create a feature branch:

```bash
git switch -c feature/your-feature
```

Example:

```bash
git switch -c feature/header
```

---

# Saving Your Work

Check your changes:

```bash
git status
```

Stage your files:

```bash
git add .
```

Commit:

```bash
git commit -m "Build header navigation"
```

Push your branch:

```bash
git push -u origin feature/header
```

Then open a Pull Request on GitHub.

---

# Pull Request Standard

Every Pull Request should explain:

```text
WHAT I BUILT:
...

FILES I CHANGED:
...

WHAT I TESTED:
...

ANYTHING THE TEAM NEEDS TO KNOW:
...
```

---

# Definition of Done

A feature is considered complete when:

* It works in the browser
* It follows the agreed project structure
* It uses the correct data source
* It does not introduce unexplained console errors
* It has been tested at relevant screen sizes
* The code has been committed
* The feature branch has been pushed
* A Pull Request has been created
* The Project Lead can review and merge it

---

# Development Order

The project should generally progress in this order:

```text
1. Project/Git foundation
        ↓
2. HTML structure
        ↓
3. Global design system
        ↓
4. Header + Feed + Sidebars
        ↓
5. JSON + Fetch/API
        ↓
6. Connect data to UI
        ↓
7. JavaScript interactions
        ↓
8. localStorage
        ↓
9. POST/API demonstrations
        ↓
10. Responsive testing
        ↓
11. Final integration
        ↓
12. Deployment
```

Some tasks may happen in parallel when their dependencies are satisfied.

---

# Team Development Rules

1. Do not work directly on `main` unless explicitly agreed.
2. Pull the latest `main` before starting new work.
3. Use feature branches.
4. Do not overwrite another team member's work without communication.
5. Agree on shared class names and data fields before changing them.
6. Do not hardcode dynamic user/post data when JSON/API data is required.
7. Do not create unnecessary files or frameworks.
8. Keep JavaScript understandable and well organized.
9. Test your work before opening a Pull Request.
10. Communicate breaking changes to the team.
11. Never commit passwords, API keys, or private credentials.
12. Keep the project simple enough for every team member to understand.

---

# Project Principle

> **Build independently, integrate deliberately.**

Each team member owns a part of the project, but the final product must behave as **one application**.

The goal is not simply to make separate parts work.

The goal is to make all the parts work **together**.
