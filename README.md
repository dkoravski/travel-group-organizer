## Project Description: Travel Group Organizer

The Travel Group Organizer app is a software product for planning and managing group trips.
The app allows users to create travel groups, plan trips, manage participants, discuss details, track itinerary items

## Roles in the App
Visitor:
- Description: Anonymous user
- Can:
    - view home page
    - view public app information
    - register
    - login

User:
- Description: Authenticated user
- Can:
    - manage own profile
    - create travel group
    - join travel group by invite link
    - view groups where is a member
    - create personal travel preferences
- When user registers a new group, he becomes a group manager for this group.
- Profile fields:
    - name
    - email
    - photo(optional)
    - phone number

Member:
- Description: Travel Group Member, a user who has joined a travel group
- Can:
    - view group trips
    - view trip details
    - join / leave a trip
    - comment on trips
    - view itinerary
    - view packing list
    - view shared resources
    - share trip link

Manager:
- Description: Travel Group Manager, Manager of a travel group
- Can:
    - create/edit/cancel/delete trips
    - invite members through invite links
    - manage group members
    - promote/remove managers
    - remove members from group
    - manage itinerary items
    - manage packing checklist
    - manage shared resources
    - moderate comments

Admin:
- Can:
    - view all users
    - manage all groups
    - manage all trips
    - remove inappropriate content

## Travel Groups
Description: Travel groups represent communities of people who travel together.

Each group has:
- name
- description
- visibility: private/public
- created by
- managers
- members

Features:
- create group
- edit group
- delete group
- invite users by link
- join group through invite link
- manage members
- promote member to manager
- remove member

## Trips
Description: Trips are the main planned travel events.

Each trip has:
- title
- description
- destination
- start date
- end date
- meeting point
- capacity
- estimated budget
- canceled: yes/no
- visibility
- created by manager

Trip states:
- upcoming — trip has not started yet
- current — current date is between start date and end date
- past — trip end date has passed
- canceled — trip was canceled by manager

Capacity states:
- under capacity
- full capacity
- over capacity

Important rule:
- Users can still join even if the trip is full. The app only displays the capacity state.

Packing List:
- Description: Each trip can have a shared packing checklist.
- Items:
    - passport / ID
    - swimsuit
    - hiking shoes
    - jacket
    - medicine
    - power bank
    - snacks
- Features:
    - managers create global packing list
    - members mark items as packed for themselves
    - members can suggest new items

## Web App Scope

The Web app is the primary application and implements the full functionality.

Web features:

- landing page
- register/login
- dashboard
- profile management
- create/manage groups
- invite links
- group member management
- create/edit/cancel/delete trips
- trip details page
- participants list
- join/leave trip
- comments
- itinerary management
- packing list management
- shared resources

## Mobile App Scope

The mobile app is a smaller companion app for travelers.

Mobile features:

- login/register
- view user’s groups
- view upcoming/current/past trips
- trip details
- join/leave trip
- view participants
- post comments
- view itinerary
- view packing list
- view shared resources