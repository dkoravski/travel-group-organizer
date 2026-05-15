# Travel Group Organizer

Travel Group Organizer is a full-stack application for organizing group trips, excursions, weekend trips between friends, families, and small communities.

The project contains a Next.js web application with backend API routes and an Expo mobile application that consumes the same backend.

## Application Roles

- Visitor: can view the home page, read public app information, register, and log in.
- User: can manage their profile, create travel groups, join travel groups, view groups where they are a member, and create personal travel preferences.
- Manager: can create, edit, cancel, and delete trips, manage group members, remove members from a group, and moderate comments.
- Admin: can view all users, manage all groups, manage all trips, and remove inappropriate content.

## Workspaces

This repository uses npm workspaces:

```text
travel-group-organizer/
  travel-web/      Next.js web app, backend API, and web frontend
  travel-mobile/   Expo mobile app
```

## Tech Stack

- Next.js
- React
- React Native
- Expo
- Expo Router
- Tailwind CSS
- Neon DB
- Drizzle ORM
- JWT authentication
- bcrypt password hashing

## Getting Started

Install dependencies from the repository root:

```bash
npm install
```

Run the web and mobile apps together:

```bash
npm run dev
```

Run only the web app:

```bash
npm --workspace=travel-web run dev
```

Run only the mobile app:

```bash
npm --workspace=travel-mobile run start
```

## Available Scripts

Root workspace scripts:

```bash
npm run dev
npm run build
npm run lint
```

Web workspace scripts:

```bash
npm --workspace=travel-web run dev
npm --workspace=travel-web run build
npm --workspace=travel-web run start
npm --workspace=travel-web run lint
```

Mobile workspace scripts:

```bash
npm --workspace=travel-mobile run start
npm --workspace=travel-mobile run android
npm --workspace=travel-mobile run ios
npm --workspace=travel-mobile run web
npm --workspace=travel-mobile run lint
```

## Web App

The `travel-web` workspace contains the Next.js web frontend and backend API.

Architecture notes:

- Use a client-server architecture.
- Keep business logic in a service layer that can be reused by REST API routes and Server Actions.
- Use server-rendered components by default.
- Use client components only for browser interactions and forms.
- Keep the code modular and avoid large, complex files.

## Mobile App

The `travel-mobile` workspace contains the Expo mobile client.

Architecture notes:

- Use React Native with Expo and Expo Router.
- Consume the Travel Group Organizer REST API with Bearer token authentication.
- Keep screens and UI pieces modular and reusable.
- Support responsive layouts for smartphones and tablets.
- Provide web-friendly modal fallbacks for native alerts, confirmations, and system dialogs.

## UI Language

The application UI should use Bulgarian.

## Backend

Backend functionality is implemented in the Next.js application under:

```text
travel-web/src/app/api
```

The backend uses JWT tokens for authentication, bcrypt for password hashing, Neon DB for storage, and Drizzle ORM for database access.
