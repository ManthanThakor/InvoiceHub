# InvoiceHub

A **GST-compliant invoicing and business management SaaS platform** built with ASP.NET Core 10 and Next.js 16. Multi-tenant architecture with role-based access control designed for the Indian market.

## Tech Stack

**Backend:** ASP.NET Core 10 (Clean Architecture), Entity Framework Core 10, SQL Server, JWT + Refresh Tokens, BCrypt, Serilog, FluentValidation, QuestPDF, MailKit, SixLabors.ImageSharp  
**Frontend:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Zustand, TanStack React Query, Axios, React Hook Form + Zod, Recharts, Framer Motion

## Features

- **Invoicing** -- Create, send, download PDF, cancel invoices with full GST compliance (GSTIN, HSN codes)
- **Purchases** -- Purchase orders, supplier management, PDF generation
- **Catalog** -- Products, categories, inventory tracking with low-stock alerts
- **Finance** -- Payments, expenses with receipt upload, payment history
- **GST Reports** -- GST summary, GSTR-1 export, tax-compliant documents
- **Multi-Tenancy** -- Company-scoped data isolation, tenant settings (logo, GSTIN, business name)
- **Role-Based Access** -- SuperAdmin > Admin > Manager > Accountant > SalesAgent > Viewer
- **Auth** -- Email/password login, Google OAuth, email verification, password reset, refresh token rotation
- **AI Insights** -- Business analytics powered by Groq API (Llama 3)
- **Audit Logging** -- Entity-level change tracking
- **Notifications** -- Email for invoices, receipts, overdue reminders, low-stock alerts

## Getting Started

### Prerequisites

- .NET 10 SDK
- SQL Server instance
- Node.js 20+

### Backend

```bash
cd backend/InvoiceHub
dotnet restore
dotnet run --project API
```

API runs at `https://localhost:7001` (Swagger: `https://localhost:7001/swagger`).

Requires a `.env` file or environment variables for `Jwt__Secret`, `GroqApiKey`, etc.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`.

### Database

SQL Server connection is configured in `backend/InvoiceHub/API/appsettings.Development.json`. Migrations apply automatically on startup. A SuperAdmin user is seeded by default.

## Project Structure

```
backend/InvoiceHub/
├── API/                 # ASP.NET Web API host (controllers, middleware)
├── Application/         # Business logic, DTOs, validators, services
├── Core/                # Domain entities, enums, repository interfaces
└── Infrastructure/      # EF Core DbContext, migrations, repositories

Frontend/
├── src/
│   ├── app/             # Next.js App Router pages & layouts
│   ├── components/      # Reusable UI components
│   ├── lib/             # API client, stores (Zustand), hooks, utils
│   ├── providers/       # React context providers
│   └── types/           # TypeScript interfaces & enums
```

## Auth & Authorization

JWT bearer tokens with refresh token rotation. Roles are hierarchical:

| Policy | Roles |
|---|---|
| `SuperAdminOnly` | SuperAdmin |
| `AdminOnly` | SuperAdmin, Admin |
| `ManagerUp` | SuperAdmin, Admin, Manager |
| `AccountantUp` | SuperAdmin, Admin, Manager, Accountant |
| `SalesUp` | SuperAdmin, Admin, Manager, Accountant, SalesAgent |
| `AllRoles` | All roles including Viewer |

## License

Private / proprietary.
