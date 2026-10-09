# Facebook Clone — Team Project

A collaborative front-end project to recreate the core interface and selected interactions of Facebook using HTML, CSS, and JavaScript.

The project is designed to help our team practise real-world web development, responsive design, Git/GitHub collaboration, working with JSON data, APIs, asynchronous JavaScript, and user authentication.

## Project Objectives

* Recreate the main Facebook-inspired interface across desktop, tablet, and mobile screens.
* Build reusable page sections, including the header, navigation, feed, stories, and sidebars.
* Load application data from JSON files using JavaScript and the Fetch API.
* Implement interactive features such as creating posts, liking posts, and other agreed UI interactions.
* Practise client-side state management and localStorage where appropriate.
* Implement authentication using Supabase Auth.
* Develop good teamwork habits through branches, commits, pull requests, code reviews, and documentation.

## Technology Stack

* **HTML5** — page structure and semantic markup.
* **CSS3** — styling, layout, and responsive design.
* **Vanilla JavaScript** — application logic and interactions.
* **JSON** — initial application data.
* **Fetch API** — loading local JSON data and working with API responses.
* **localStorage** — suitable non-sensitive client-side preferences and state.
* **Supabase Auth** — planned authentication implementation.
* **Git and GitHub** — version control and team collaboration.
* **Font Awesome** — interface icons where included.

## Project Structure

```text
facebook-clone/
├── index.html
├── login.html
├── signup.html
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── header.css
│   ├── feed.css
│   ├── sidebar-left.css
│   ├── sidebar-right.css
│   ├── auth.css
│   ├── responsive.css
│   └── style.css
├── js/
│   ├── script.js
│   ├── data.js
│   ├── render.js
│   └── auth.js
├── data/
│   ├── users.json
│   ├── posts.json
│   ├── stories.json
│   └── comments.json
├── assets/
│   ├── avatars/
│   ├── icons/
│   └── images/
├── README.md
└── ROADMAP.md
```

**Note:** The structure represents the project's working and planned files. `style.css` is retained during the CSS refactor until the replacement stylesheets have been verified.

## Getting Started

1. Install Git and Visual Studio Code.

2. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

3. Open the project folder in VS Code.

4. Run the project through a local development server, such as the VS Code Live Server extension. This is important because the application fetches JSON files, which may not work correctly when `index.html` is opened directly through `file://`.

5. Open the local URL provided by the server.

6. Open the browser developer tools and check the Console and Network tabs if something fails to load.

Replace `<repository-url>` with the actual GitHub repository URL.

## CSS Architecture

The project is being organised into separate stylesheets so that each file has a clear responsibility.

| File                | Responsibility                                         |
| ------------------- | ------------------------------------------------------ |
| `base.css`          | CSS variables, reset, and global styles                |
| `layout.css`        | Main page layout and columns                           |
| `header.css`        | Header, logo, search, navigation, and utility controls |
| `feed.css`          | Stories, create-post area, and feed posts              |
| `sidebar-left.css`  | Left sidebar                                           |
| `sidebar-right.css` | Right sidebar                                          |
| `auth.css`          | Login and signup styling                               |
| `responsive.css`    | Page-wide responsive behaviour                         |
| `style.css`         | Temporary legacy stylesheet during refactoring         |

The CSS refactor must be tested before the legacy stylesheet is removed.

## Team Roles and Responsibilities

### Role 1 — Project Lead and Git/GitHub

* Coordinate tasks and communication.
* Maintain the project roadmap and documentation.
* Manage branches, pull requests, reviews, and merges.
* Help ensure that team contributions work together.

### Role 2 — HTML Structure and Page Layout

* Maintain the semantic HTML structure.
* Establish the overall page sections and their relationships.
* Coordinate with the header, feed, and sidebar roles.

### Role 3 — Header and Navigation

* Build the Facebook-inspired header.
* Implement the logo, search field, main navigation, and utility controls.
* Refine header alignment, spacing, and responsive behaviour.

### Role 4 — Feed, Stories, and Create Post

* Build the feed interface, stories section, and create-post area.
* Render posts using the shared data layer.
* Coordinate with Roles 5 and 6.

### Role 5 — Data, JSON, and Fetch/API

* Maintain the JSON data structure and relationships between users, posts, stories, and comments.
* Implement and maintain data-loading functions.
* Handle asynchronous requests and response errors.
* Coordinate with roles that consume application data.

### Role 6 — JavaScript Interactions and Client-Side State

* Implement agreed user-interface interactions.
* Manage appropriate client-side state and localStorage.
* Coordinate with the data and authentication roles.
* Avoid treating client-side state as secure authentication.

### Role 7A — Left Sidebar

* Build and style the left sidebar.
* Ensure it fits the shared page layout.

### Role 7B — Right Sidebar

* Build and style the right sidebar.
* Ensure it fits the shared page layout.

### Role 8 — Responsive Design and Visual Consistency

* Test the application on mobile, tablet, and desktop.
* Identify layout overflow, inconsistent spacing, and breakpoint issues.
* Coordinate responsive fixes without overwriting other roles' work.

### Role 9 — Authentication

* Implement login and signup using Supabase Auth.
* Handle user sessions and logout.
* Coordinate authentication state with the main application.
* Protect authenticated functionality appropriately.
* Never store passwords in JSON or expose Supabase service-role credentials in front-end code.

**Team coordination:** Each role should communicate with the other roles whose work depends on theirs. Role ownership does not prevent code review or collaborative fixes.

## Git and GitHub Workflow

1. Pull the latest changes from `main`.
2. Create or switch to a task-specific branch.
3. Make changes within the assigned scope.
4. Test the changes locally.
5. Commit with a clear message.
6. Push the branch to GitHub.
7. Open a pull request.
8. Review the changes and resolve conflicts before merging.
9. Update the local `main` branch after the merge.

Example:

```bash
git switch main
git pull origin main
git switch -c feature/header-improvements

# Make and test your changes

git add .
git commit -m "feat: improve header navigation"
git push -u origin feature/header-improvements
```

Do not commit directly to `main` unless the team has explicitly agreed to do so.

## Contribution Guidelines

* Keep changes focused on the assigned task.
* Reuse existing data functions instead of duplicating logic.
* Do not hardcode permanent feed data in the rendering logic when it belongs in the JSON data layer.
* Do not overwrite another contributor's work without communicating first.
* Test your changes before opening a pull request.
* Keep documentation accurate about what is completed, in progress, or planned.
* Report blockers early so other roles can continue their work.

## Project Status

The project has an initial application structure, JSON data files, JavaScript data-loading and rendering code, and a modular CSS refactor in progress. Further interface improvements, responsive testing, interactions, and authentication will be tracked in `ROADMAP.md`.

## Disclaimer

This is an educational Facebook-inspired clone. It is not an official Facebook product and is not affiliated with Meta.
