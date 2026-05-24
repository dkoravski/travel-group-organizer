# Travel Group Organizer App Next.js app
Travel Group Organizer is an application for organizing group trips, excursions, weekend trips between friends, families or small communities.

# Roles in the App
- Visitor (anonymous user): can view home page, register, login
- User (authenticated user) can: manage own profile, create travel group (after creating a group, becomes the group manager), join travel group, review of the groups in which he is a member, create trip comments, create personal trip preferences, marks the packing  list
- Manager (manager of a travel group) can: create/edit/cancel/delete trips, remove members from group, adds registered users with email as members of a given group

# Technologies
Modern Next.js + Neon DB + Drizzle ORM + React + Tailwind

# Architecture Guidelines
Use a client-server architecture:
- **Service layer**: implement app business logic, used by the RESTFull API and Server Actions
- Use **Modular design**: split the app into self-contained components, to avoid complex files with too much code
- **Auth**: JWT tokens + bcrypt
- **Database**: Neon DB + Drizzle ORM

# User Interface Guidelines
- Implement modern UI, responcive design, use server-rendered components in Next.js
- Use server-side rendering, only use client components for browser interactions and forms
- Use Bulgarian language for UI