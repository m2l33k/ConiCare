# MindBloom Project Structure

## Directory Layout

```
/
├── supabase/
│   ├── functions/          # Supabase Edge Functions
│   │   └── analyze-video/  # AI Video Analysis Logic
│   └── schema.sql          # Database Schema & RLS
│
├── apps/
│   ├── mobile/             # Expo React Native App (Mother & Child)
│   │   ├── app/
│   │   │   ├── (auth)/     # Authentication Routes (Login, Signup)
│   │   │   ├── (mother)/   # Guardian Mode Routes
│   │   │   │   ├── (tabs)/ # Bottom Tab Navigation (Home, Reports, Chat)
│   │   │   │   └── _layout.tsx
│   │   │   ├── (child)/    # Child Mode Routes
│   │   │   │   ├── game-arena.tsx
│   │   │   │   └── _layout.tsx
│   │   │   └── _layout.tsx # Root Layout (Mode Switcher Logic)
│   │   ├── components/     # Shared Components
│   │   ├── stores/         # Zustand Stores (Auth, Mode)
│   │   └── assets/         # Images, Fonts (Cairo, Inter)
│   │
│   └── web/                # Next.js Dashboard (Admin & Specialist)
│       ├── app/
│       │   ├── (admin)/    # Super Admin Routes
│       │   ├── (specialist)/ # Specialist Routes
│       │   └── page.tsx    # Landing Page
│       ├── components/     # Shadcn UI Components
│       └── lib/            # Utilities (Supabase Client)
```

## Key Architectural Decisions

1.  **Route Groups**: We use `(group)` folders in Expo Router to separate the distinct logic for `mother` and `child` modes. This allows independent layouts (e.g., Child mode hides the tab bar and status bar).
2.  **Monorepo-style**: Separating `mobile` and `web` into an `apps` directory keeps the codebase clean while allowing for shared logic (if needed in the future, e.g., in a `packages/ui` folder).
3.  **Supabase Centralization**: The `supabase` folder contains the source of truth for the backend, ensuring the schema and edge functions are version controlled alongside the frontend.
