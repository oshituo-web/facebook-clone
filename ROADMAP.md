# Project Roadmap

This document tracks the development of our Facebook-inspired clone, from the initial structure through responsive design, application interactions, authentication, and final testing.

**Status key**

* [x] Completed or already present in the project
* [ ] Planned, in progress, or awaiting verification

A feature should only be marked complete after its implementation has been reviewed and tested.

## Phase 1 — Project Foundation

* [x] Create the GitHub repository and initial project folders.
* [x] Establish the main HTML, CSS, JavaScript, JSON, and assets structure.
* [x] Add initial user, post, story, and comment data files.
* [x] Establish the team roles and collaboration workflow.
* [ ] Review the complete project structure and remove unnecessary duplication.

## Phase 2 — CSS Architecture

**Current focus: `refactor/css-architecture`**

* [x] Establish separate CSS files for the major application sections.
* [x] Define the intended responsibilities of each stylesheet.
* [ ] Move existing rules into the correct stylesheets without losing current styling.
* [ ] Update stylesheet links in `index.html`.
* [ ] Verify that all stylesheets load correctly.
* [ ] Test that the refactor preserves the existing interface.
* [ ] Remove the legacy `style.css` only after the replacement is verified.
* [ ] Review and merge the refactor pull request.

## Phase 3 — Header and Navigation

* [x] Establish the header HTML structure.
* [x] Add the Facebook logo, search field, navigation items, and utility controls.
* [ ] Refine desktop alignment, spacing, and icon sizing.
* [ ] Fix the search icon styling and verify tooltip selectors.
* [ ] Implement and test the responsive header layout.
* [ ] Verify that the active navigation state is visually clear.
* [ ] Test at approximately 375px, 768px, and 1366px viewport widths.

## Phase 4 — Main Interface

* [ ] Complete and review the main page layout.
* [ ] Build and refine the feed and stories presentation.
* [ ] Complete the create-post interface.
* [ ] Review the left sidebar.
* [ ] Review the right sidebar.
* [ ] Ensure components use consistent typography, spacing, borders, and colours.
* [ ] Check that components work with the shared data layer.

## Phase 5 — Data and Rendering

* [x] Establish JSON files for users, posts, stories, and comments.
* [x] Implement the initial data-loading functions.
* [x] Establish rendering functions for feed content and stories.
* [x] Verify the initial JSON loading and rendering flow.
* [ ] Validate data relationships and handle missing or invalid data.
* [ ] Improve error handling for failed requests and unexpected responses.
* [ ] Ensure that new UI features reuse existing data functions.
* [ ] Review accessibility and loading states.

## Phase 6 — JavaScript Interactions

* [ ] Implement and test the agreed navigation interactions.
* [ ] Implement liking and other agreed post interactions.
* [ ] Implement post creation and appropriate validation.
* [ ] Connect comments to their associated posts and users.
* [ ] Use localStorage only for appropriate client-side preferences or state.
* [ ] Handle empty states, invalid input, and interaction errors.
* [ ] Test interactions across desktop and mobile layouts.

## Phase 7 — Authentication

* [x] Create the initial login and signup page files.
* [ ] Configure Supabase Auth safely.
* [ ] Implement account registration.
* [ ] Implement login and logout.
* [ ] Handle session restoration and authentication errors.
* [ ] Connect the authenticated user to the application UI.
* [ ] Restrict authenticated features where required.
* [ ] Verify that credentials and sensitive secrets are not exposed in the client.

## Phase 8 — Responsive Design and Integration

* [ ] Test the header, feed, and sidebars at mobile, tablet, and desktop widths.
* [ ] Fix horizontal overflow and overlapping elements.
* [ ] Check that images and content fit their containers.
* [ ] Test navigation and interactions on narrow screens.
* [ ] Integrate contributions from all team roles.
* [ ] Resolve merge conflicts and regressions.
* [ ] Run a full application review after integration.

## Phase 9 — Final Quality Assurance

* [ ] Test the application using a local development server.
* [ ] Resolve console errors and failed asset or data requests.
* [ ] Test login, signup, logout, and session handling if authentication is implemented.
* [ ] Verify that data loading and UI interactions behave as expected.
* [ ] Check keyboard accessibility and appropriate button labels.
* [ ] Review README instructions and update this roadmap.
* [ ] Confirm the project is ready for demonstration.

## Phase 10 — Delivery

* [ ] Merge reviewed and tested work into `main`.
* [ ] Verify the final application from a clean checkout.
* [ ] Confirm that required environment variables and configuration are documented safely.
* [ ] Prepare the final project demonstration.
* [ ] Record known limitations and possible future improvements.

## Future Improvements

These items are optional and should only be started after the core project is stable.

* More realistic search and filtering.
* Improved comment and reaction functionality.
* Additional profile and account settings.
* More robust data persistence through a backend.
* Further accessibility and performance improvements.

## Working Agreement

1. Work on the current priority before starting unrelated features.
2. Communicate changes that affect shared files or another role.
3. Test before pushing and request review through a pull request.
4. Update this roadmap when work is verified, not merely when code is written.
5. Prioritise a working, integrated application over unfinished extra features.
