# Bloginya Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Project Structure

The project follows a standard Angular CLI structure. The `src/` directory contains the main application source code:

*   [`src/`](src/): Contains the main application source code.
    *   [`src/app/`](src/app/): The core application logic, including components, modules, and services.
        *   [`about/`](src/app/about/): Components related to the "About Us" page.
        *   [`admin/`](src/app/admin/): Functionality and components for the administration panel.
        *   [`category/`](src/app/category/): Modules and components for category management.
        *   [`comment/`](src/app/comment/): Services for comment interactions.
        *   [`comments/`](src/app/comments/): Components and services for displaying and inputting comments.
        *   [`drafts/`](src/app/drafts/): Features for managing post drafts.
        *   [`edit/`](src/app/edit/): Components and services for the post editor.
        *   [`home/`](src/app/home/): Components for the application's home page.
        *   [`navigation/`](src/app/navigation/): Contains shared navigation components like footer, sidenav, toolbar, and search.
        *   [`page-not-found/`](src/app/page-not-found/): The 404 error page component.
        *   [`post/`](src/app/post/): Components and modules for viewing individual posts.
        *   [`profile-settings/`](src/app/profile-settings/): Components for user profile settings.
        *   [`prosemirror/`](src/app/prosemirror/): Configuration and plugins for the ProseMirror rich text editor.
        *   [`shared/`](src/app/shared/): Reusable components, directives, guards, interfaces, pipes, and services used across the application.
        *   [`shortname/`](src/app/shortname/): Functionality related to short URLs or names.
        *   [`user-profile/`](src/app/user-profile/): Components and services for displaying user profiles.

## Modules

The application is structured into several feature modules:

*   `AdminModule`: Manages administrative functionalities.
*   `CategoryModule`: Handles category-related operations.
*   `CommentsModule`: Provides comment display and interaction features.
*   `DraftsModule`: Manages post drafts.
*   `EditModule`: Contains the rich text editor and related functionalities.
*   `NavigationModule`: Encapsulates navigation components.
*   `PostModule`: Deals with displaying and interacting with posts.
*   `ShortnameModule`: Manages short URL/name functionalities.

Each of these modules typically has an associated routing module (e.g., `AdminRoutingModule`) that defines its specific routes.

## Routing

The application's main routes are defined in `src/app/app.routes.ts`. Feature modules define their own child routes.

Key routes include:

*   `/`: The application's home page.
*   `/drafts`: Accessible to authorized users for managing their post drafts.
*   `/nimda`: The administration panel, accessible only to users with admin privileges.
*   `/user/:userId`: Displays a specific user's profile.
*   `/e`: The post editor, accessible to authorized users.
*   `/p`: Base route for post viewing.
*   `/c`: Base route for category-related pages.
*   `/me`: The "About Us" page.
*   `/profile`: User profile settings, accessible to authorized users.
*   `/not-found`: The 404 "Page Not Found" page.
*   `/:shortname`: Dynamic route for accessing content via a short URL/name.
*   `**`: Wildcard route that redirects to `/not-found` for any unmatched paths.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.