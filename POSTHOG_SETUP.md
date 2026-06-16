# Safe PostHog setup for Sarab Al Madina Portal

PostHog is still **off by default**. Nothing is sent unless you enable it in `config.js`.

## Enable PostHog

Add this block to your real `config.js` without removing your Supabase keys:

```js
POSTHOG: {
  ENABLED: true,
  PROJECT_KEY: 'YOUR_POSTHOG_PROJECT_KEY',
  API_HOST: 'https://us.i.posthog.com',
  CAPTURE_LOCALHOST: false
}
```

## Privacy/safety settings

This setup does **not** enable risky tracking:

- Session replay: OFF
- Heatmaps: OFF
- Autocapture: OFF
- Form/click autocapture: OFF
- Page text capture: masked
- Element attribute capture: masked
- No notes, descriptions, plates, employee names, customer names, phone numbers, emails, parts lists, or table contents are sent as event properties.

## Tracked events

The app now tracks safe operational usage events only:

### Navigation
- Page/view opened
- User identified by internal auth UUID only
- Role/designation only, no email/name

### Inventory
- Part created/updated/deleted
- Stock restocked
- Part marked ordered/not ordered
- Inventory CSV imported/exported
- Stock History CSV exported

### Job Cards
- Job card created/updated/deleted
- Job status changed
- Jobs CSV exported
- Parts Used CSV exported

### Fleet
- Vehicle created/updated/deleted
- Fleet CSV imported/exported

### Replacements
- Month locked/unlocked
- Replacements saved
- Visible cells cleared
- Replacements CSV exported

### Ticketing
- Ticket created/deleted
- Ticket status changed
- Ticket escalated/de-escalated
- Tickets CSV exported

### Employees
- Employee created/updated/deleted
- Employees CSV imported/exported
- Employee ticket created/updated/deleted/approved
- Return to duty recorded
- Employee Tickets CSV exported

### SALIK
- SALIK saved
- SALIK CSV imported/exported

### Clients and Expiry
- Client created/updated/deleted
- Clients CSV exported
- Expiry CSV exported

## Important

This does not touch Supabase data, schema, inventory, jobs, fleet, clients, employees, or existing records. It only adds safe browser-side analytics calls.
