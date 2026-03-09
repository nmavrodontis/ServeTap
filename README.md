# ServeTap

## Getting Started

Use these steps to run the project locally for testing.

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create your env file from the example and set real values:

```bash
# macOS/Linux
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Required variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

4. Start the development server:

```bash
npm run dev
```

5. Build for production testing:

```bash
npm run build
npm run preview
```

Notes:

- Commit source files and config files, not `dist/` or `node_modules/`.
- Never commit `.env` (secrets).

## Anti-Abuse Guards (Client Side)

To reduce prank/spam orders, the app currently enforces these limits:

- Max total items per order: `25`
- Max distinct products per order: `15`
- Max quantity per product: `8`
- Max order total: `120.00 €`
- Submit cooldown per table: `60` seconds
- Max submits per table: `3` orders per `10` minutes

Implementation details:

- Cart validation and submit throttling live in `src/utils/orderGuards.js`.
- Guards run when adding products and before submit in the order page.
- Submit throttling is stored in browser `localStorage` per table id.

Important:

- These checks improve UX-level protection, but are not enough on their own.
- For real protection, duplicate the same rules server-side (Supabase RLS / Edge Functions / DB constraints).

## QR Table Ordering Flow

The app supports table-aware ordering through a `table` query parameter.

- Example URL for table 12: `https://your-domain.com/?table=12`
- Example URL for table A5: `https://your-domain.com/?table=A5`

How it works:

- The table id is read from the URL (`?table=...`) when the customer scans the QR.
- The table id is persisted in local storage during navigation.
- All menu/order links keep the same table id.
- On order submit, the table id is saved in `barOrders` and shown in kitchen/admin views.

To create QR codes:

- Generate one QR per table using the matching URL above.
- Print each QR and place it on the correct table.
- In production, replace `your-domain.com` with your real domain.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
