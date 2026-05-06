# Sarab Al Madina Garage Inventory - Free Hosting Setup

This version can be used by multiple people after you connect Supabase and deploy it.

## Best free stack

- Frontend hosting: Vercel Hobby
- Database + login: Supabase Free

## Step 1 - Create Supabase project

1. Go to Supabase and create a new project.
2. Open **SQL Editor**.
3. Copy everything from `supabase-schema.sql`.
4. Paste it into SQL Editor and click **Run**.

## Step 2 - Add login users

Option A, easiest:
1. In Supabase, go to **Authentication > Users**.
2. Click **Add user**.
3. Add your friend's email and password.
4. Share that email/password with him.

Option B:
Use the app's Sign up tab. If Supabase email confirmation is enabled, the user may need to confirm their email first.

## Step 3 - Add Supabase keys to the app

1. In Supabase, go to **Project Settings > API**.
2. Copy:
   - Project URL
   - anon public key
3. Open `config.js`.
4. Paste them here:

```js
window.SARAB_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-PUBLIC-KEY'
};
```

## Step 4 - Deploy to Vercel

1. Create a GitHub repo.
2. Upload these files.
3. Go to Vercel.
4. Import the GitHub repo.
5. Deploy.

Because this is a static app, no build command is needed. Vercel should serve `index.html`.

## Can your friend use it?

Yes. Once deployed, send him the Vercel URL and his login. Anything he adds or changes will save in Supabase, so you can see the same inventory from another device.

## Important note

This is set up for a small internal garage team. Any logged-in user can add, edit, delete inventory, jobs, and fleet vehicles. That is okay for trusted staff, but for a larger business you should add admin/mechanic roles later.


## v18 update

This version adds staff name tracking on each job and a Fleet module. If you already ran the old schema, run the updated `supabase-schema.sql` again so the `vehicles` table and policies are created.
