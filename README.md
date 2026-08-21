# Beauty Admin App

![Beauty Admin App Screenshot](docs/screenshot.png)

A modern, user-friendly admin interface for managing orders, customers, and fulfillment workflows in a beauty product e‑commerce platform. Built with a focus on clarity, reliability, and fast workflows so store administrators can process orders and resolve issues quickly.

## Why this project

Running an online store means dealing with orders, returns, and customer questions every day. Beauty Admin App centralizes order management with a clean UI, fine‑grained order status controls, and integrations for content editing through Sanity Studio so teams can operate efficiently.

## Features

- View full order details: items, quantities, prices, customer information, billing and shipping addresses.
- Update order status (pending, processing, shipped, delivered, cancelled) and revert changes when necessary.
- Audit trail for status changes and administrator actions.
- Sanity Studio integration for rich content and product metadata editing.
- Responsive layout that works well on desktops and tablets.
- API routes for integrations and automation.

## Quick start

Prerequisites

- Node.js v18+ (or the version specified in engines)
- npm or Yarn

Clone and install

```bash
git clone https://github.com/Peculiars/beauty.git
cd beauty
npm install
```

Copy the example environment file and fill in secrets

```bash
cp .env.example .env
# then open .env and add the required keys (Sanity project id, dataset, tokens, etc.)
```

Run the app in development mode

```bash
npm run dev
```

Open your browser at:

```
http://localhost:3000
```

Building for production

```bash
npm run build
npm run start
```

Environment variables

Make sure you set the following in your `.env` (names may vary — check `.env.example`):

- SANITY_PROJECT_ID — Sanity project identifier (for content editing)
- SANITY_DATASET — Sanity dataset to use
- NEXT_PUBLIC_API_BASE — Base URL for any external APIs
- DATABASE_URL — Connection string for the orders database
- SESSION_SECRET — Secret for signing session cookies

## Project structure (high level)

- /components — Reusable React components (order cards, tables, forms)
- /pages or /app — Routes and page-level components
- /lib — Utilities, API clients, database helpers
- /api — Serverless API routes for order operations
- /studio — Sanity Studio configuration and schemas
- /styles — Global and component styles
- /docs — Project documentation and images

## Usage

- Navigate to the Orders section to view and filter orders by status, date, and customer.
- Click an order to see full details, edit shipping information, and update order status.
- Use the Sanity Studio (if configured) to manage product metadata and content.
- Use API routes for automations like export, fulfillment integration, or reporting.

## Contributing

We welcome contributions of all kinds: bug reports, feature requests, documentation improvements, and code. To contribute:

1. Fork the repository and create a new branch for your change.
2. Install dependencies and run the app locally.
3. Make your changes and include tests where appropriate.
4. Open a pull request describing the problem and your solution.

Please follow the existing code style and add clear commit messages.

## Development tips

- Use the Sanity Studio in a separate terminal to develop content schemas: `cd studio && npm run start` (if your project includes a studio folder).
- Run lint and tests before committing: `npm run lint` and `npm test` (if available).
- Use feature branches and small PRs for faster reviews.

## Screenshots

Consider adding screenshots to `/docs` and reference them here to help new contributors and users quickly understand the UI.

## License

This project is open source — include your license file (e.g., MIT) in the repository root.

## Need help?

Open an issue or reach out to the maintainers via the repository discussions. If you'd like help onboarding or a quick tour of the codebase, mention that in an issue and we can guide you.
