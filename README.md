# Waredock — Backend

Waredock is a role-based warehouse management system built around an **append-only stock ledger**. Instead of overwriting a quantity field, every change to inventory is recorded as a `StockMovement`, and current stock is *derived* from that history. The result is a full audit trail of who moved what, when, and who approved it.

This repository is the **Express + TypeScript API**. The Next.js dashboard lives in a separate repo.

- **Frontend repo:** `<link to waredock-frontend>`
- **Live API:** `https://stowledge-backend.onrender.com`
- **Live demo:** `<deployed frontend URL>`

---

## Features

- **Immutable stock ledger** — inventory changes are stored as movements, never as edits to a counter
- **Derived stock levels** — the app adds up every approved movement to get the current stock, instead of saving a number that someone has to keep updating, so the count can’t go out of date
- **Approval workflow** — movements are routed to an Admin when a product is flagged as always-approve, or when the quantity exceeds that product's approval threshold
- **Stock validation** — an OUTWARD movement is rejected if it asks for more than is currently in stock
- **Driver delivery flow** — drivers claim approved OUTWARD movements, then mark them `DELIVERED` or `FAILED`
- **Role-based access control** — Admin, Viewer and Driver roles enforced on the server

---

## Tech Stack

- Node.js, Express, TypeScript
- Prisma ORM with a relational database
- Centralised error handling (`AppError` + `catchAsync`)

---

## Data Model

### Product

| Field | Purpose |
|---|---|
| `name`, `price`, `desc` | Product details |
| `lowStockThreshold` | Reorder line used by the low-stock alert logic (not by movement validation) |
| `requiresApproval` | Blanket rule: every movement of this product needs approval |
| `approvalThreshold` | Optional rule: movements above this quantity need approval |

### StockMovement

| Field | Purpose |
|---|---|
| `productId`, `quantity` | What moved and how much |
| `movementType` | `INWARD` or `OUTWARD` |
| `status` | Approval state: `PENDING`, `APPROVED`, `REJECTED` |
| `requiresApproval` | Snapshot of whether approval applied when the movement was created |
| `approvedById` | The Admin who approved or rejected it |
| `deliveryStatus` | `NOT_APPLICABLE`, `PENDING`, `DELIVERED`, `FAILED` (only meaningful for OUTWARD) |
| `assignedDriverId` | Driver who claimed the delivery (OUTWARD only) |
| `createdAt`, `updatedAt` | Timestamps |

---

## Key Design Decisions

**Stock is derived, not stored.**
There is no `totalQuantity` on `Product`. Current stock is the sum of approved INWARD movements minus approved OUTWARD movements, computed by `getCurrentStock()` with database aggregates. The ledger is the single source of truth.

**`requiresApproval` exists on both models, on purpose.**
On `Product` it is a *rule* that an Admin can change at any time. On `StockMovement` it is a *snapshot* of whether that rule applied when the movement was created. Changing a product's rule later never rewrites the meaning of past records.

**Approval and delivery are separate state machines.**
`status` answers "is this movement authorised?" and is decided by an Admin. `deliveryStatus` answers "did the goods physically arrive?" and is updated by a driver. A movement can be approved and still undelivered.

**Status fields act as locks.**
Approval can only be applied to a `PENDING` movement, so a decided movement cannot be re-approved or re-rejected. Drivers can only claim a movement that is approved, OUTWARD, and unassigned.

**Race-safe driver claiming.**
Claiming uses a conditional `updateMany` (`where assignedDriverId: null`) and checks the affected count, so if two drivers claim the same movement at once, only one wins and the other receives a `409`.

**Pending movements don't count as stock.**
Only `APPROVED` movements contribute to current stock, so a movement waiting for approval cannot be used to justify shipping goods out.

---

## API Overview

<!-- Add exact paths once finalised, e.g. base path /api/stock-movements -->

| Action | Role | Behaviour |
|---|---|---|
| List movements | All roles | Returns movements with approver and assigned driver details |
| Create movement | Admin, Editor | Validates stock for OUTWARD, applies approval rules, sets initial `status` and `deliveryStatus` |
| Approve / reject | Admin | Only for `PENDING` movements; records the approver |
| Claim delivery | Driver | Assigns the logged-in driver to an approved, unassigned OUTWARD movement |
| Update delivery status | Driver | Only the assigned driver can update the status of that movement |

---

## Getting Started

```bash
git clone <this-repo-url>
cd waredock-backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="your-database-connection-string"
# add any auth/JWT secrets your setup requires
```

Run migrations and start the server:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

---

## Roadmap

- [ ] Search and filters on movements (zone, type, status, date range)
- [ ] Low-stock alerts on the dashboard using `lowStockThreshold`
- [ ] Analytics and reporting (inward vs outward volume, approval turnaround)
- [ ] Offline-first driver view with queued status updates

---

## Author

**Hibathulla CM** — frontend-focused full-stack engineer.
