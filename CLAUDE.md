# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production version with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
npx prisma generate  # Generate Prisma client to src/generated/prisma
npx prisma db push   # Push schema changes to database (development)
npx prisma studio    # Open Prisma Studio database browser
npx prisma migrate dev # Create and apply migrations
```

### Initial Setup
```bash
node scripts/setup-initial-data.js  # Populate database with sample prompts and user
```

## Architecture Overview

### Core Purpose
StreamingPro Video Creator is an automated video production platform that integrates with n8n workflows and HeyGen for avatar videos. The system manages a complete video workflow from content generation to social media publishing.

### Key Architecture Patterns

**Video State Machine**: Videos progress through defined states:
- `borrador` → `esperando_aprobacion` → `aprobado` → `video_agregado` → `publicado`

**n8n Integration**: The application acts as a webhook orchestrator, sending prompts to n8n and receiving generated content back through a series of API endpoints.

**Authentication Pattern**: Uses environment-based credentials (`LOGIN_EMAIL`, `LOGIN_PASSWORD`) with NextAuth.js, automatically creating users on first login.

### Database Architecture

**Core Models**:
- `Prompt`: Reusable content generation templates with Spanish field names
- `Video`: Central entity tracking content lifecycle with AI-generated fields (titulo, guion, textoLinkedin, tweet, descripcion)
- `WorkflowLog`: Audit trail for all video state changes
- `User`: Simple user management

**Important Schema Details**:
- Prisma client generates to `src/generated/prisma` (non-standard location)
- Spanish column names mapped with `@map()` decorators
- Video model contains both generated content and social media URLs

### n8n Webhook Integration

**Outbound Webhooks** (from app to n8n):
- `generate-content`: Sends prompts with existing themes to prevent duplication
- `send-approval-email`: Triggers email workflow for content approval
- `publish-video`: Initiates social media publishing

**Inbound Webhooks** (from n8n to app):
- `/api/webhooks/content-generated`: Receives AI-generated video content
- `/api/webhooks/published`: Receives social media publication URLs
- `/api/webhooks/approve-content`: Handles email approval/rejection links

**Environment Configuration**:
- Base URL: `N8N_BASE_URL` + specific webhook paths
- Example: `https://n8n.srv850442.hstgr.cloud/webhook-test/generate-content`

### Authentication & Security

**Credentials System**: Single user authentication using environment variables rather than database passwords. The system checks `LOGIN_EMAIL` and `LOGIN_PASSWORD` from environment and auto-creates database users.

**Session Management**: JWT-based sessions with NextAuth.js, using custom authorization logic rather than standard providers.

### Content Generation Workflow

**Duplicate Prevention**: System fetches all existing video themes before sending to n8n, ensuring AI doesn't repeat content.

**Approval Process**: Email-based approval with direct action links that update video state and redirect to success pages.

**HeyGen Integration**: Manual video URL input rather than API integration - user creates video externally and provides link.

### API Architecture

**RESTful Webhooks**: All n8n integration endpoints follow `/api/webhooks/[action]` pattern with POST methods except approval links (GET with query params).

**Error Handling**: Centralized error responses with workflow logging for debugging.

**State Management**: Video state updates are atomic with corresponding workflow log entries.

### Environment Variables

**Required Variables**:
- `DATABASE_URL`: PostgreSQL connection string (specific production database configured)
- `LOGIN_EMAIL`/`LOGIN_PASSWORD`: Authentication credentials
- `NEXTAUTH_SECRET`: JWT signing key
- n8n webhook URLs as separate environment variables for each workflow

### Development Notes

**Prisma Configuration**: Custom output directory requires importing from `@/generated/prisma` rather than `@prisma/client`.

**Turbopack**: Development and build processes use Turbopack for faster compilation.

**Spanish Localization**: UI and database fields use Spanish terminology (e.g., `creadoEn`, `contenidoPrompt`, `textoLinkedin`).

### Testing n8n Integration

Use the webhook specification document at `docs/n8n-webhooks-spec.md` for payload formats and testing endpoints. The system expects specific JSON structures for each workflow stage.

### Deployment

Configured for Dokploy deployment with environment-based configuration. Database connection and n8n URLs are production-ready in the example environment file.