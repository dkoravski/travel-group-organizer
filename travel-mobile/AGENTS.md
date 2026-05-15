# Travel Group Organizer Mobile app
Travel Group Organizer is an application for organizing group trips, excursions, weekend trips between friends, families or small communities.

# Roles in the Mobile App
- Visitor (anonymous user): can view home page, view public app information, register, login
- User (authenticated user) can: manage own profile, create travel group, join travel group, view groups where they are member, create personal travel preferences
- Manager (manager of a travel group) can: create/edit/cancel/delete trips, manage group members, remove members from group, moderate comments
- Admin can: view all users, manage all groups, manage all trips, remove inappropriate content

# Tech Guidelines
- Technologies: React Native + Expo + Expo Router
- Back-end: Travel Group Organizer Restful API, with "Bearer token" auth
- Back-end API source code: '..\travel-web\src\app\api'

# Architecture Guidelines
Use **Modular design**: split the app into meaningful components, to avoid too much code in a single file and reuse repeating code
- **Auth**: JWT tokens + bcrypt
- **Database**: Neon DB + Drizzle ORM

# Mobile User Interface Guidelines
- Implement user-friendly UI, stack navigation responsive layout (for tablets, smartphones)
- Mobile UI alerts: ensure all native alerts, confirms and other system dialogs have a fallback for web (impelented as modal popus)
- Use Bulgarian language for UI