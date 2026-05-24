# Travel Group Organizer Mobile app
Travel Group Organizer is an application for organizing group trips, excursions, weekend trips between friends, families or small communities.

# Roles in the Mobile App
- Visitor (anonymous user): can view home page, register, login
- User (authenticated user) can: manage own profile
- Member: a user who joined a travel group by being added by the group manager.Can: view the groups he is a member of,view group trips, view trip details, join / leave a trip, comment on trips, create personal travel preferences, view packing list and check.

# Tech Guidelines
- Technologies: React Native + Expo + Expo Router
- Back-end: Travel Group Organizer Restful API, with "Bearer token" auth

# API Docs
- Back-end API source code: '..\travel-web\src\app\api'
- Back-end API documentation: http://localhost:3000/api/docs

# Architecture Guidelines
Use **Modular design**: split the app into meaningful components, to avoid too much code in a single file and reuse repeating code
- **Auth**: JWT tokens + bcrypt
- **Database**: Neon DB + Drizzle ORM

# Mobile User Interface Guidelines
- Implement user-friendly UI, stack navigation responsive layout (for tablets, smartphones)
- Mobile UI alerts: ensure all native alerts, confirms and other system dialogs have a fallback for web (impelented as modal popus)
- Use Bulgarian language for UI