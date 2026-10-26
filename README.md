# Facebook-Inspired Social Application

A collaborative web development project that recreates key elements of Facebook's interface and social networking experience. The application combines a responsive front end with JavaScript-driven interactions, JSON data, Supabase services, and external APIs.

## Features

### Home and social feed
- Facebook-inspired header, navigation, and sidebars.
- User profiles, stories, and feed posts.
- Create-post interface with browser-specific persistence for supported locally saved posts.
- Header search that filters the currently displayed feed posts.

### Navigation and content views
- Home view for the main feed.
- Videos view populated using the YouTube API.
- Marketplace view populated using an external product API, with search, category filtering, and a shopping-cart interface.
- Friends view with friend suggestions, incoming friend requests, and an accepted friends list.

### Accounts and communication
- Supabase authentication and session handling.
- Profile information associated with the authenticated user.
- Friend requests and friend-list functionality.
- Notifications with unread-count display and read-status handling.
- Messenger interface for direct conversations.

These features are reported as functional by the project team. Their exact backend behaviour depends on the current API configuration, database policies, and implementation.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and interface elements |
| CSS3 | Layout, styling, and responsive design |
| JavaScript ES modules | Application logic and feature modules |
| JSON | Initial user, post, story, and comment data |
| Fetch API | Loading data and making HTTP requests where used |
| Local Storage | Persisting selected browser-side data |
| Supabase | Authentication and supported backend features |
| YouTube API | Retrieving video content |
| Marketplace API | Retrieving product listings |
| Git and GitHub | Version control and team collaboration |
| Font Awesome | Interface icons |

## Project Structure

The following structure reflects the files visible in the current project workspace.


facebook-clone/
├── assets/
│   ├── avatars/
│   ├── icons/
│   └── images/
├── css/
│   ├── auth.css
│   ├── base.css
│   ├── feed.css
│   ├── header.css
│   ├── layout.css
│   ├── responsive.css
│   ├── sidebar-left.css
│   └── sidebar-right.css
├── data/
│   ├── users.json
│   ├── posts.json
│   ├── stories.json
│   └── comments.json
├── js/
│   ├── auth.js
│   ├── data.js
│   ├── marketplace.js
│   ├── render.js
│   ├── script.js
│   ├── supabaseClient.js
│   └── youtubeVideos.js
├── index.html
├── login.html
├── signup.html
├── README.md
└── ROADMAP.md
```

### Key JavaScript modules

- **`script.js`** — Coordinates application startup, session checking, feed rendering, view switching, header interactions, notifications, Messenger, and friend-related features.
- **`data.js`** — Provides data-access functions for application data and supported Supabase operations.
- **`render.js`** — Provides rendering functions for feed posts, stories, the create-post interface, and sidebar user information.
- **`auth.js`** — Contains authentication-related functionality for the login and signup flow.
- **`supabaseClient.js`** — Provides the Supabase client used by the application.
- **`youtubeVideos.js`** — Handles the Videos section and its YouTube API integration.
- **`marketplace.js`** — Handles the Marketplace interface and product data integration.

### Key CSS files

- **`base.css`** — Shared foundational styles.
- **`layout.css`** — Main page layout.
- **`header.css`** — Header and navigation styling.
- **`feed.css`** — Feed-related styling.
- **`sidebar-left.css`** and **`sidebar-right.css`** — Sidebar styling.
- **`auth.css`** — Authentication-page styling.
- **`responsive.css`** — Responsive layout rules.

Confirm the stylesheet import order in the current HTML before moving or removing any CSS files.

## Getting Started

### Prerequisites

- A modern web browser.
- Visual Studio Code or another code editor.
- Git installed.
- Access to the project repository.
- A local development server, such as the VS Code Live Server extension.
- Required Supabase and API configuration for the features being tested.

### 1. Clone the repository

```bash
git clone <repository-url>
cd facebook-clone
```

Replace `<repository-url>` with the team's actual GitHub repository URL.

If the repository is already cloned, open the existing folder instead.

### 2. Open the project

Open the project folder in Visual Studio Code.

### 3. Run the application

Serve `index.html` through Live Server or the project's agreed development server. Avoid opening the HTML file directly with a `file://` URL, because browser restrictions can interfere with JSON requests and module loading.

### 4. Check the browser

Use the browser's Developer Tools to inspect the Console and Network tabs. Check for JavaScript errors, failed requests, missing assets, and API or authentication errors.

### 5. Configure external services

Follow the team's current setup instructions for Supabase and the external APIs. Do not place privileged credentials or service-role keys in browser-side code.

## Data and Persistence

The application uses different data sources for different purposes:

- **JSON files:** Initial application datasets, including users, posts, stories, and comments where currently configured.
- **Supabase:** Authentication and supported server-side features such as social connections, notifications, and messaging.
- **External APIs:** Video and product content.
- **Local Storage:** Selected browser-side state, including locally saved posts.

### Account-specific Local Storage

Locally saved posts use a storage key derived from the authenticated user's ID. This helps separate locally saved posts between accounts in the same browser profile.

Local Storage is browser- and origin-specific. It does not automatically synchronise between devices or browsers, and it should not be treated as a substitute for shared backend persistence.


## Team Members and Responsibilities

This project was developed collaboratively, with team members assigned specific responsibilities to support organised development, integration, and testing.

| Role | Responsibility | Team Member |
|---|---|---|
| Role 1 — Project Lead, Architecture and Coordination | Defines and maintains the project structure, oversees application architecture and module organisation, coordinates integration between HTML, CSS, JavaScript, JSON, Supabase, and external APIs, manages development priorities, and maintains project-wide consistency. | OSHITU OCHUKO |

| Role 2 — Authentication and Accounts | Handles registration, login, session management, and account-related functionality. | OSHITU OCHUKO |

| Role 3 — Header and Navigation | Develops the header, navigation controls, search interface, and dropdown interactions. | LUCKY TIJANI $ OSHITU OCHUKO  |
| Role 4 — Feed and Stories | Handles feed and story presentation and assigned feed-related interactions. | CHARLES ADIKANKWU |

| Role 5 — Data and JavaScript Integration | Handles data loading, rendering, application logic, and module integration. | OSHITU OCHUKO |

| Role 6 — Responsive Design and Integration | Handles responsive layout, visual consistency, and cross-device testing. | OSHITU OCHUKO |

| Role 7A — Left Sidebar | Develops the left sidebar and its assigned navigation elements. | CHARLES ADIKANKWU |

| Role 7B — Right Sidebar | Develops the right sidebar and its assigned information or interactive elements. | TERRY OSAIGBOVO |

| Role 8 — GitHub and Team Coordination | Coordinates version control, branches, pull requests, and code reviews. | OSHITU OCHUKO |

| Role 9 — Quality Assurance and Documentation | Coordinates testing, issue tracking, and project documentation. | OSHITU OCHUKO |

Team members also collaborated on integration, troubleshooting, testing, and preparation for the final demonstration. The role descriptions represent areas of responsibility and do not imply that each feature was developed independently.


## Development Workflow

The team uses Git and GitHub to manage contributions.

1. Update your local copy of the agreed branch.
2. Create or switch to the appropriate feature branch.
3. Work within your assigned responsibilities.
4. Test your changes locally.
5. Review the files you changed.
6. Commit with a descriptive message.
7. Push your branch and open a pull request.
8. Request review and resolve feedback.
9. Merge only after the agreed review and testing process.

Example commands:

```bash
git status
git switch main
git pull origin main
git switch -c feature/your-task
git add .
git commit -m "Describe the changes"
git push -u origin feature/your-task
```

Replace `feature/your-task` with the appropriate branch name. If you are already working on an existing feature branch, switch to it rather than creating a duplicate.

## Security and Quality Guidelines

- Validate user input.
- Handle failed API and database requests.
- Use safe DOM rendering for user-provided text.
- Protect database access with appropriate Supabase policies.
- Never expose privileged secrets in client-side code.
- Keep feature-specific responsibilities organised across modules.
- Check keyboard accessibility, button labels, and focus behaviour.
- Test the full application after integrating team contributions.
- Avoid deleting legacy files until their replacements have been verified.

## Project Status

The project has an established modular structure, responsive header improvements, JSON data handling, multiple central content views, and integrations for authentication, social interactions, videos, and marketplace content.

Remaining work focuses on final end-to-end verification, responsive testing across the complete application, confirming integration and security configuration, reviewing outstanding changes, and preparing the presentation.

See **[ROADMAP.md](ROADMAP.md)** for the development and delivery checklist.

## Known Scope Limitations

The application is a learning project inspired by Facebook, not a production replacement for Facebook. Marketplace listings are intended for demonstration, and locally stored data does not automatically synchronise across devices.

Any remaining limitations or unverified behaviours should be recorded in `ROADMAP.md` before the final presentation.

## Project Goal

Deliver a working, responsive, integrated, and explainable application that demonstrates front-end development, JavaScript modules, data handling, external APIs, backend integration, and collaborative software development.
