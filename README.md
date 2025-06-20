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
