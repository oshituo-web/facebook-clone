# Project Roadmap

This roadmap tracks the development, integration, testing, and delivery of our Facebook-inspired social application.

Our priority is to deliver a working, responsive, integrated, and explainable application for the final presentation.

## Status Key
- `[x]` Completed or functional according to the current project status.
- `[/]` In progress or partially implemented.
- `[ ]` Remaining, or awaiting final verification.

A task should only be considered fully complete when its implementation has been reviewed and tested.

## Phase 1 — Project Foundation
- [x] Create the GitHub repository and initial project structure.
- [x] Establish the HTML, CSS, JavaScript, JSON, and assets structure.
- [x] Add initial JSON datasets for users, posts, stories, and comments.
- [x] Establish team roles and the collaboration workflow.
- [x] Establish separate JavaScript modules for major application responsibilities.
- [ ] Review the complete repository structure and remove unnecessary duplication.
- [ ] Verify the final project from a clean checkout.

## Phase 2 — CSS Architecture
- [x] Establish separate stylesheets for major application sections.
- [x] Organise styles for the header, feed, layout, sidebars, authentication, and responsive behaviour.
- [x] Verify that all stylesheet references match the current files.
- [x] Review duplicate, unused, or conflicting CSS rules.
- [x] Confirm that the CSS refactor preserves the working interface.
- [x] Review and merge any outstanding CSS refactor pull request.
- [x] Verify stylesheet loading and asset paths from a clean checkout.

## Phase 3 — Header and Navigation
- [x] Establish the header HTML structure.
- [x] Add the logo, search field, navigation items, and utility controls.
- [x] Improve the responsive header layout.
- [x] Implement switching between Home, Videos, Marketplace, and Friends views.
- [x] Implement header search filtering for displayed feed posts.
- [x] Implement dropdown interfaces for Menu, Notifications, Messenger, and Profile.
- [x] Implement the profile dropdown's logout action.
- [x] Implement the notification badge and read-status interaction.
- [x] Verify dropdown behaviour, active navigation state, tooltip selectors, and accessible labels.
- [ ] Confirm the intended behaviour of Groups navigation.
- [ ] Test at approximately 375px, 768px, and 1366px.
- [ ] Check for overlapping elements and horizontal overflow.

## Phase 4 — Main Interface

- [x] Establish the main page layout and central feed structure.
- [x] Implement the Home, Videos, Marketplace, and Friends view containers.
- [x] Establish feed and stories rendering.
- [x] Implement the create-post interface.
- [x] Implement the Friends view with suggestions, incoming requests, and accepted friends.
- [x] Review the overall visual consistency of the page.
- [x] Verify post creation, validation, and display in expected cases.
- [ ] Review left and right sidebar presentation and interactions.
- [x] Check missing images, empty data, and loading states.
- [x] Confirm consistent typography, spacing, borders, and colours.

## Phase 5 — Data and Rendering
- [x] Establish JSON datasets for users, posts, stories, and comments.
- [x] Implement initial data-loading functions.
- [x] Implement feed and story rendering functions.
- [x] Combine locally saved posts with fetched feed posts.
- [x] Establish the data-access module for application data and supported backend operations.
- [x] Integrate Supabase into the application.
- [ ] Validate data relationships and missing or invalid data.
- [ ] Review error handling for failed JSON, API, and Supabase requests.
- [ ] Document the exact data source used by each feature.
- [ ] Confirm that the interface handles loading and empty states consistently.

## Phase 6 — JavaScript Interactions and Local Storage

- [x] Implement header navigation interactions.
- [x] Implement local header search filtering.
- [x] Implement header dropdown panels.
- [x] Implement browser-side post persistence.
- [x] Separate locally saved post storage by authenticated account.
- [x] Implement the create-post callback and feed refresh.
- [x] Test Local Storage persistence after refreshing the page.
- [x] Verify that switching accounts does not display another account's locally saved posts.
- [ ] Test storage failures and invalid stored data.
- [ ] Test post creation and validation in expected cases.
- [ ] Test implemented likes and comments, where applicable.
- [ ] Confirm that client-side state and server-side data are not confused.

## Phase 7 — Authentication and User Accounts
- [x] Establish login and signup pages.
- [x] Integrate Supabase Auth.
- [x] Check the session during application startup.
- [x] Redirect unauthenticated users to the login page.
- [x] Connect the authenticated user to the profile interface.
- [x] Implement logout through Supabase Auth.
- [x] Test registration, login, logout, invalid credentials, and session restoration.
- [ ] Confirm that authentication errors are handled clearly.
- [x] Verify protected data access through Supabase policies.
- [ ] Confirm that no privileged secrets are exposed in browser-side code.

## Phase 8 — Social Features and Supabase Integration

- [x] Implement friend suggestions.
- [x] Implement sending friend requests.
- [x] Implement accepting and rejecting incoming friend requests.
- [x] Implement the accepted friends list.
- [x] Implement notification retrieval and unread-count display.
- [x] Implement marking notifications as read.
- [x] Implement the Messenger user list and conversation interface.
- [x] Implement direct-message sending and message-status handling.
- [x] Test friend requests and accepted friendships using separate accounts.
- [x] Test notifications and unread counts using separate accounts.
- [x] Test message sending and receiving using separate accounts.
- [x] Verify persistence after refreshing and signing in again.
- [x] Confirm that database policies prevent unauthorised access to other users' data.
- [ ] Test failure and retry behaviour for backend requests.

## Phase 9 — External API Integrations

- [x] Establish the Videos module.
- [x] Integrate YouTube API data into the Videos view.
- [x] Establish the Marketplace module.
- [x] Integrate external product data into the Marketplace view.
- [x] Implement marketplace search and category filtering.
- [x] Establish the shopping-cart interface.
- [x] Verify API configuration and error handling.
- [x] Test empty results and unavailable API responses.
- [ ] Confirm that API credentials are not exposed if the provider requires a secret.
- [x] Verify that the application remains usable when an external API is unavailable.
- [x] Confirm the intended demo-only behaviour of marketplace listings and cart functionality.

## Phase 10 — Responsive Design and Integration
- [x] Improve the responsive header layout.
- [x] Test the complete header, feed, stories, sidebars, Friends view, Videos view, and Marketplace view at mobile, tablet, and desktop widths.
- [ ] Fix horizontal overflow, overlapping elements, and inconsistent spacing.
- [ ] Check image sizing and content alignment.
- [ ] Test dropdowns and interactive controls on narrow screens.
- [x] Integrate contributions from all team roles.
- [x] Review outstanding branches and pull requests.
- [x] Resolve merge conflicts and regressions.
- [x] Run a complete application review after integration.

## Phase 11 — Final Quality Assurance
- [x] Run the application using the agreed local development setup.
- [x] Resolve significant console errors and failed asset or data requests.
- [x] Test login, logout, and session restoration.
- [x] Test Home, Videos, Marketplace, and Friends navigation.
- [x] Test search, dropdowns, notifications, and messaging.
- [x] Test friend requests and the accepted friends list.
- [x] Test post creation and locally saved post persistence.
- [x] Test external API failure and empty-result states.
- [ ] Verify responsive behaviour at the target viewport widths.
- [ ] Check keyboard accessibility, button labels, and focus behaviour.
- [x] Review database security policies and client-side configuration.
- [x] Update README.md and this roadmap to match the final implementation.
- [x] Record any remaining limitations.
- [x] Confirm that the application is ready for demonstration.

## Phase 12 — Documentation and Delivery
- [x] Confirm that README.md matches the current implementation.
- [x] Document setup instructions and required configuration.
- [x] Ensure that no privileged credentials or secrets are committed.
- [ ] Review outstanding branches and pull requests with the team.
- [x] Merge reviewed and tested changes into `main`.
- [x] Verify the application from a clean checkout.
- [x] Prepare the final project demonstration.
- [x] Prepare explanations of the architecture, data flow, and team contributions.
- [x] Record known limitations and possible future improvements.

## Future Improvements
Consider these only after the core application is stable:
- More advanced search and filtering.
- More complete post reactions and comment functionality.
- Additional profile and account settings.
- Additional backend persistence where required.
- Further accessibility and performance improvements.
- Additional responsive refinements.

## Working Agreement
1. Prioritise the current agreed task before starting unrelated features.
2. Communicate changes that affect shared files or another team member's work.
3. Test changes before pushing and request review through a pull request.
4. Update this roadmap when work is verified, not merely when code is written.
5. Distinguish functional features from features that have passed final integration testing.
6. Avoid overwriting or duplicating another team member's work.
7. Avoid introducing major new features close to the final demonstration.
8. Prioritise a working, integrated, and explainable application over unfinished extras.
