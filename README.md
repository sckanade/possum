# Possum

Possum is a modern point-of-sale platform for inventory management, sales tracking, and day-to-day store operations.

This repository contains the first working product scaffold for Possum, including:

- an Express + PostgreSQL backend
- a React frontend with a glass-style admin interface
- product, category, sales, dashboard, and store profile flows
- basic forecasting for sales trend visualization

## Overview

Possum is designed for small and growing retail businesses that need a clean operational hub for:

- monitoring sales performance
- managing inventory and product categories
- processing transactions
- maintaining store identity and account settings
- building toward notifications, reporting, and future operational automation

## Current Features

### Backend

- REST API built with Express.js
- Sequelize ORM with PostgreSQL
- product and category management
- sales transaction creation with stock deduction
- store profile management
- dashboard analytics for daily sales, weekly sales, and forecast data
- WhatsApp notification service boundary
- Google Drive export service boundary
- health check, validation, and centralized error handling

### Frontend

- React + Vite application
- modern glassmorphism-inspired UI
- login screen for testing
- dashboard with live metrics and forecast visualization
- owner-facing product and category creation forms
- sales checkout flow
- store profile management

## Tech Stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL
- ORM: Sequelize
- Integrations planned: Twilio WhatsApp, Google Drive

## Project Structure

```text
.
|-- frontend/              # React frontend
|-- src/
|   |-- config/            # Environment and database configuration
|   |-- controllers/       # Route handlers
|   |-- middlewares/       # Error handling and validation helpers
|   |-- models/            # Sequelize models and associations
|   |-- routes/            # API route definitions
|   |-- scripts/           # Local scripts such as seeders
|   |-- services/          # External service boundaries
|   |-- tests/             # Lightweight test coverage
|   `-- utils/             # Shared backend utilities
|-- PRD.md                 # Product requirements document
`-- README.md
```

## Getting Started

### Prerequisites

- Node.js 20+ or newer
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sckanade/possum.git
cd possum
```

### 2. Set up the backend

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
copy .env.example .env
```

Update `.env` with your PostgreSQL credentials:

```env
PORT=4000
NODE_ENV=development
API_PREFIX=/api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=possum
DB_USER=postgres
DB_PASSWORD=your_password
DB_LOGGING=false
```

Create the PostgreSQL database:

```sql
CREATE DATABASE possum;
```

Start the backend:

```bash
npm run dev
```

Backend runs on:

`http://localhost:4000`

### 3. Set up the frontend

Move into the frontend app:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the frontend environment file:

```bash
copy .env.example .env
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on:

`http://localhost:5173`

### 4. Test login credentials

The current frontend includes a temporary testing login:

- Email: `admin@possum.com`
- Password: `admin`

This is a frontend-only login for local testing and should be replaced with proper backend authentication before production use.

## Seed Forecast Data

To populate historical sales data for dashboard and forecast testing:

```bash
npm run seed:forecast
```

This adds sample transactions from previous days so the forecast chart has meaningful history.

## Main API Endpoints

- `GET /health`
- `GET /api/dashboard/today`
- `GET /api/dashboard/weekly`
- `GET /api/dashboard/forecast`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/products`
- `GET /api/products/:productId`
- `POST /api/products`
- `PUT /api/products/:productId`
- `PATCH /api/products/:productId/stock`
- `GET /api/sales`
- `GET /api/sales/:saleId`
- `POST /api/sales`
- `GET /api/profile`
- `PUT /api/profile`
- `PATCH /api/profile/password`
- `POST /api/reports/export/google-drive`

## Product Direction

Possum is currently in an early product stage. The next logical improvements are:

- real authentication and authorization
- persistent media upload for product images and store logos
- richer analytics and reporting
- offline-ready sync flows
- production deployment setup
- better financial exports and operational integrations

## Notes

- Database tables are currently created through `sequelize.sync()`
- Twilio and Google Drive integrations are scaffolded but not fully implemented
- The current login flow is intended for local demo and testing only

## License

No license has been added yet.
