# This Is Africa - Booking Engine

A modern booking engine for "This Is Africa" (TIA) tours and activities, integrating with TourPlan API and Tyro payment processing.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## Overview

This booking engine provides a seamless experience for customers to browse, book, and pay for TIA tours and activities. It integrates with the TourPlan API for tour data and booking management, and Tyro for secure payment processing.

## Features

- Modern, responsive booking interface
- Integration with TourPlan API
- Secure payment processing with Stripe and Tyro
- User-friendly booking experience
- Mock data support for development and testing

## Documentation

Detailed documentation for this project is available in the following locations:

- **Project Planning**: See [PLANNING.md](./PLANNING.md) for architecture, goals, and development approach
- **Payment Setup**: See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for secure Stripe integration guide
- **API Documentation**: The `/docs` folder contains comprehensive TourPlan API documentation:
  - [HostConnect Interface](./docs/HostConnect-Versions-5.05.000-Interface.pdf) - Main API interface documentation
  - [HostConnect DTD](./docs/HostConnect-Version-5.05.000-DTD.pdf) - Data Type Definition documentation
  - [HostConnect Error Codes](./docs/HostConnect-Error-Codes-Version-5.05.000.pdf) - API error codes and handling
  - [Request Examples](./docs/Request-Examples.pdf) - Example API requests and responses
  - [API Limitations](./docs/Tourplan%20API%20Booking%20Engine%20Limitations.pdf) - Known limitations and workarounds

## Development

### Getting Started

1. Clone this repository
2. Install dependencies with `pnpm install`
3. Run the development server with `pnpm dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Copy the example environment file and configure your keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual API keys. See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed instructions on safely configuring Stripe sandbox keys.

**Required Variables:**
- `STRIPE_API_KEY` - Your Stripe secret key (starts with `sk_test_` for development)
- `STRIPE_PUBLIC_KEY` - Your Stripe publishable key (starts with `pk_test_` for development)
- `TOURPLAN_API_URL` - TourPlan API endpoint
- `TOURPLAN_AGENT_ID` - Your TourPlan agent ID
- `TOURPLAN_PASSWORD` - Your TourPlan password

## License

Copyright © 2025 This Is Africa. All rights reserved.

# Modern design refresh

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/tess-goviralnowns-projects/v0-modern-design-refresh)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/GzpBPCjNrmo)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## API Documentation

This project integrates with the Tourplan API for tour booking functionality. The following documentation files are included:

### Tourplan API Documentation
- **[Error Codes](docs/tourplan-error-codes.txt)** - Complete list of Tourplan API error codes and their meanings
- **[API Examples](docs/tourplan-api-examples.txt)** - Request and response examples for all Tourplan API endpoints
- **[DTD Specification](docs/tourplan-dtd.txt)** - XML DTD specification for Tourplan API requests and responses
- **[Interface Definition](docs/tourplan-interface-definition.txt)** - Complete interface definition and documentation

### Key API Features
- **Real-time availability** and pricing from Tourplan
- **Booking creation** and management via XML API
- **Payment status updates** to Tourplan system
- **Tour extras** and add-ons support (including gorilla permits)
- **Customer management** with limitations as documented
- **Automated reminders** for final payments

### API Integration Notes
- All payment logic is handled on the website (not in Tourplan)
- Refunds are processed manually outside the API
- Customer details may have editing limitations due to Tourplan's data management
- Real-time sync ensures inventory accuracy

## Deployment

Your project is live at:

**[https://vercel.com/tess-goviralnowns-projects/v0-modern-design-refresh](https://vercel.com/tess-goviralnowns-projects/v0-modern-design-refresh)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/GzpBPCjNrmo](https://v0.dev/chat/projects/GzpBPCjNrmo)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
