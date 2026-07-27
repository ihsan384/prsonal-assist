# Personal ERP (Ihsan OS) Authentication & Setup Guide

This document contains the complete technical architecture and **step-by-step setup guide** for configuring **Google OAuth, Supabase Auth, Row Level Security (RLS), and User Roles** in Ihsan OS.

---

## 🏗️ Architecture Summary

1. **Supabase Auth (`auth.users`)**: Handles user identity, credentials, Google OAuth tokens, and session management.
2. **Public Profiles (`public.profiles`)**: Stores application user profiles (`full_name`, `avatar_url`, `phone`, `role`, `is_disabled`).
3. **Role Hierarchy**:
   - `owner`: Full unrestricted access to system management and settings.
   - `admin`: Manages business operations and user management.
   - `employee`: Accesses assigned workspace modules (`/workspace`).
   - `client`: Default role for new users. Accesses client portal (`/client`), projects, shared files, and invoices.
4. **Relational Chain**: `auth.users` ↓ `public.profiles`. Authentication does **not** depend on domain records (e.g. gym member records).

---

## 🛠️ Complete Step-by-Step Setup Guide

Follow these 4 steps to complete the configuration for your project (`https://kxmuzgjkdkoyvmtzrzje.supabase.co`):

### Step 1: Run the Database Migration SQL
1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard/project/kxmuzgjkdkoyvmtzrzje).
2. Click on **SQL Editor** in the left sidebar.
3. Click **New Query**.
4. Open the local file [`supabase_migration_google_auth.sql`](file:///d:/Ihsan/WORK/Works/Ihsan%5D%5D/supabase_migration_google_auth.sql), copy all lines, paste them into the SQL editor, and click **Run**.
5. *Result*: Creates `public.profiles` table, sets up the `handle_new_user()` trigger for automatic profile creation on Google login, and configures RLS security policies.

---

### Step 2: Set Up Google OAuth Credentials in Google Cloud
1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials** → **OAuth client ID**.
3. Select **Web application** as the Application type.
4. Set **Name** to: `Ihsan OS Gym & Personal ERP`.
5. Under **Authorized redirect URIs**, click **Add URI** and enter:
   ```text
   https://kxmuzgjkdkoyvmtzrzje.supabase.co/auth/v1/callback
   ```
6. Click **Create** and copy your **Client ID** and **Client Secret**.

---

### Step 3: Enable Google Provider & Redirect URLs in Supabase
1. In your Supabase Dashboard, go to **Authentication** → **Providers**.
2. Click on **Google** to expand its settings:
   - Toggle **Enable Google provider** to `ON`.
   - Paste your **Client ID** from Step 2.
   - Paste your **Client Secret** from Step 2.
   - Click **Save**.
3. Next, go to **Authentication** → **URL Configuration**:
   - Set **Site URL** to: `http://localhost:5173/login` (or `https://prsonal-assist.vercel.app/login`).
   - Under **Redirect URLs**, click **Add URL** and add:
     - `http://localhost:5173/login`
     - `https://prsonal-assist.vercel.app/login`
   - Click **Save**.

---

### Step 4: Promote Your Account to `owner` or `admin`
By default, new users who sign up or log in via Google are given the default role `'client'`. To promote your account to `owner` or `admin`:

1. Launch the app locally (`npm run dev`) or on Vercel and click **Continue with Google** to sign in once.
2. Go to your Supabase Dashboard → **Table Editor** → select **`profiles`**.
3. Locate your user row (by your email/name).
4. Double-click the **`role`** cell and change it from `client` to **`owner`** (or `admin`).
5. Click **Save**.
6. Refresh your app! You now have full administrative access to manage all users at `/admin/users`.

---

## ⚙️ Environment Variables Verification

Ensure your local `.env` file contains the correct Supabase keys:

```env
VITE_SUPABASE_URL=https://kxmuzgjkdkoyvmtzrzje.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bXV6Z2prZGtveXZtdHpyemplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MDQ2NjksImV4cCI6MjA5OTE4MDY2OX0.Cv9X2NlOrgweVs2G0_nTF9S_TT4Y6UTpSFRMldQJDGI
```

---

## 🔄 Post-Login Redirect Matrix

| User Role | Assigned Access Route |
| :--- | :--- |
| `owner` | `/dashboard` (`/`) |
| `admin` | `/dashboard` (`/`) |
| `employee` | `/workspace` |
| `client` | `/client` |

---

## ❓ Troubleshooting & FAQs

- **Issue: Google OAuth redirects to an error page.**
  - *Fix*: Check that `https://kxmuzgjkdkoyvmtzrzje.supabase.co/auth/v1/callback` is added under **Authorized redirect URIs** in Google Cloud Console.

- **Issue: Profile is created but role remains `client`.**
  - *Fix*: This is intended for security. New users default to `client`. Promote authorized users to `owner` or `admin` using Step 4 above or via `/admin/users`.
