This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Architecture

This project follows a clean, scalable architecture with DRY principles. For detailed information:

- **[SUMMARY.md](./SUMMARY.md)** - High-level overview of the refactored architecture
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Comprehensive architecture documentation
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Step-by-step development guide
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Detailed improvement recommendations
- **[MIGRATION_PLAN.md](./MIGRATION_PLAN.md)** - Plan for migrating existing services

## Project Structure

```
├── app/                 # Next.js App Router pages
├── components/          # React components
├── config/             # Application configuration
├── constants/          # Application constants
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/
│   └── api/           # API infrastructure (BaseApiClient, BaseCrudService)
├── services/          # API service layer
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── public/            # Static assets
```

## Key Features

- ✅ **DRY Principles**: No code duplication, reusable infrastructure
- ✅ **Type Safety**: Full TypeScript support with proper typing
- ✅ **Custom Hooks**: Reusable hooks for common patterns (useFetch, usePagination, useDebounce)
- ✅ **Base Services**: Standard CRUD operations with BaseCrudService
- ✅ **Centralized Config**: All endpoints and constants in one place
- ✅ **Utility Functions**: Validation, formatting, and more
- ✅ **Comprehensive Docs**: Clear guidance for developers

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
