# Coffee Brew Recipe App — Product Requirements Document (PRD)

**Stack:** Next.js (App Router), Tailwind v4, shadcn/ui, Supabase (Auth, DB, Storage)  
**Security Requirement:** Absolutely **no client-side or direct DB calls** — all database read/write operations must occur via secure server-side API routes or server actions.

---

# 1. Overview
A web app for coffee enthusiasts to create, track, save, and share coffee brew recipes. Users log private brews for personal use and can optionally publish recipes to a public feed where others can save and upvote them.  
UI components are built using **shadcn/ui** for consistency, accessibility, and rapid development.

---

# 2. Goals
- Provide users with a simple, fast workflow to log daily brewing recipes.
- Allow users to publish select recipes to a public recipe listing.
- Enable community interactions via upvotes and saves.
- Offer a user dashboard with private brews, public brews, and saved brews.
- Maintain strong security by using **server-only Supabase operations**.

---

# 3. User Roles

## Guest Users
- View public recipes  
- Filter and sort recipes  
- View recipe details  

## Authenticated Users
- Create and save private recipes  
- Publish recipes publicly  
- Upvote recipes  
- Save recipes from others  
- Manage account details (avatar, name, email, password)  
- View dashboard (private, public, saved recipes)  

---

# 4. Core Features

## 4.1 Authentication
- Supabase Auth (email/password)
- Server-side session validation
- Account management: avatar, display name, email, password

**UI via shadcn/ui:** Input, Button, Card, Form, Avatar, Dialog/Sheet

---

## 4.2 Recipe Builder

### Inputs:
- Title  
- Short description  
- Brewer type (V60, Aeropress, Orea, Fellow Stagg, Kalita Wave, Chemex, Clever Dripper, Other)  
- Coffee weight (g)  
- Grind size  
- Water temperature  
- **Dynamic pours** (unlimited):  
  - Start time  
  - End time  
  - Water (g)  
  - Add Pour button  
- Auto or manual total brew time  

### Actions:
- Save as private  
- Save & publish  

**UI via shadcn/ui:** Select, Input, Button, Form, Accordion/List, Separator

---

## 4.3 Public Recipe Feed
- Displays all published recipes
- Each card includes:  
  - Title  
  - Short description  
  - Brewer type badge  
  - Author name + avatar  
  - Upvote count  
  - Save button  

### Filters:
- Brewer type  
- Sort by: Newest, Most upvoted  

**UI via shadcn/ui:** Card, Badge, Select, Button, Avatar

---

## 4.4 Recipe Detail Page
- Full recipe breakdown (ingredients, pours, brew time)
- Upvote toggle
- Save/unsave toggle
- Author info

**UI via shadcn/ui:** Card, Button, Separator, Avatar, Badge

---

## 4.5 User Dashboard

### Sections:
1. **My Private Recipes**  
2. **My Public Recipes**  
3. **Saved Recipes**  
4. **Account Settings**  

**UI via shadcn/ui:** Tabs, Card, Table/List, Input, Avatar

---

## 4.6 Upvotes
- Users can upvote each recipe once
- Toggle functionality
- Stored in `upvotes` join table

---

# 5. Non-Functional Requirements

## 5.1 Security
**MANDATORY RULE:**  
> No direct Supabase client usage on the client side.  
> All reads/writes go through secure server API routes or server actions.

Additional requirements:
- Supabase RLS enabled
- Input validation (Zod)
- No exposure of service-role keys
- Server-side user session validation

---

## 5.2 Performance
- All public-facing pages use SSR
- Pagination for recipe listings
- Indexed DB columns for sort/filter fields

---

## 5.3 Reliability
- Prevent duplicate upvotes/saves (composite PKs)
- Consistent UI through shadcn/ui
- Graceful error states with shadcn toast components

---

# 6. Database Schema

## profiles
- id (uuid PK, foreign key → auth.users)  
- display_name (text)  
- avatar_url (text)  
- created_at  
- updated_at  

## recipes
- id (uuid PK)  
- user_id (uuid FK → profiles.id)  
- title (text)  
- description (text)  
- brewer_type (text)  
- coffee_weight (numeric)  
- grind_size (text)  
- water_temp (numeric)  
- total_brew_time (numeric)  
- is_public (boolean)  
- created_at  
- updated_at  

## recipe_pours
- id (uuid PK)  
- recipe_id (uuid FK → recipes.id)  
- start_time (int)  
- end_time (int)  
- water_g (int)  
- order_index (int)  

## upvotes
- recipe_id (uuid FK)  
- user_id (uuid FK)  
- created_at  
**PK:** (recipe_id, user_id)

## saved_recipes
- user_id (uuid FK)  
- recipe_id (uuid FK)  
- created_at  
**PK:** (user_id, recipe_id)

---

# 7. API Endpoints (Server-Side Only)

## Recipe APIs
- POST `/api/recipes/create`
- POST `/api/recipes/update`
- POST `/api/recipes/publish`
- POST `/api/recipes/delete`
- GET `/api/recipes/:id`
- GET `/api/recipes/public?sort=&filter=&page=`

## Upvotes
- POST `/api/upvotes/toggle`

## Saved Recipes
- POST `/api/save/toggle`

## User Dashboard
- GET `/api/user/my-recipes`
- GET `/api/user/my-public-recipes`
- GET `/api/user/saved`

## Profile
- POST `/api/user/update-profile`
- POST `/api/user/update-avatar`
- POST `/api/user/update-password`

---

# 8. Technical Architecture

### Frontend
- Next.js App Router  
- Server components for data fetching  
- Client components only where needed (dynamic UI, forms)  
- All UI built with **shadcn/ui**  

### Backend
- Next.js API routes  
- Supabase server client only  
- Full RLS enforcement  

### Storage
- Supabase Storage (avatars)

---

# 9. Future Features
- AI brew suggestions  
- Brew timers / flow-rate visualisation  
- Comments on recipes  
- User following  
- Leaderboards  
- PWA + Mobile app  

---

# 10. Development Phases
1. Setup project + Supabase integration  
2. Auth pages + profile management  
3. Recipe builder (private save)  
4. Recipe publishing flow  
5. Public feed + filters  
6. Recipe detail pages  
7. Dashboard  
8. Upvotes + saved recipes  
9. UI polish (shadcn/ui components)  
