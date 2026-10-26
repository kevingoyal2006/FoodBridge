FOODBRIDGE

Technical Requirements Document (TRD)

Architecture, data model, API contracts, security, deployment, and test strategy

Project: Food Donation & Redistribution PlatformTechnology: MongoDB · Express.js · React.js · Node.jsDocument status: Draft for academic project planningVersion: 1.0 | Date: October 2026

# Document Control

| Field | Value |

| --- | --- |

| Product | FoodBridge — Food Donation & Redistribution Platform |

| Document | Technical Requirements Document (TRD) |

| Version | 1.0 |

| Architecture | MERN monolithic web application with REST API |

| Status | Proposed technical design; validate choices before implementation |

| Related document | FoodBridge PRD v1.0 |



# 1. Technical Overview

FoodBridge will be implemented as a client-server web application. React renders role-specific user interfaces. Express routes HTTP requests to controllers and service functions. Mongoose validates and persists documents in MongoDB. The initial version is a modular monolith rather than a microservice architecture to keep deployment and debugging manageable for one developer.

# 2. Technology Stack

| Layer | Technology | Use |

| --- | --- | --- |

| Frontend | React + Vite | Single-page application and component UI |

| Routing | React Router | Page routing and route guards for UX (not security enforcement) |

| Styling | Tailwind CSS | Responsive layouts and design system |

| HTTP client | Axios or fetch | API requests and common error handling |

| Client state | Context API + local component state | Session/user state and local UI state |

| Backend runtime | Node.js | JavaScript server runtime |

| API framework | Express.js | REST endpoints, middleware, routing |

| ODM | Mongoose | Schemas, validation, references, indexes |

| Database | MongoDB | Persistent document storage |

| Authentication | Secure cookie session or JWT in HttpOnly cookie | Browser authentication; choose one approach and apply consistently |

| Password hashing | bcrypt | One-way password hashing |

| Testing | Vitest/React Testing Library; Jest or Node test runner + Supertest | Unit, integration, and API tests |

| Version control | Git | Source history and collaboration-ready workflow |



# 3. High-Level Architecture

| Component | Responsibilities | Interfaces |

| --- | --- | --- |

| React client | Pages, forms, dashboards, filtering, loading/error states | HTTPS REST calls to /api/v1 |

| Express API | Authentication, authorization, validation, business rules, response formatting | HTTP/JSON |

| Service layer | Donation workflow, request approval, capacity reservation, notifications, metrics | Called by controllers |

| Mongoose models | Document schema validation, references, indexes | MongoDB driver |

| MongoDB | Users, donations, requests, pickups, notifications, audit logs | Database connection string from environment |



# 4. Repository and Folder Structure

foodbridge/  client/    src/      assets/      components/      pages/      layouts/      routes/      context/      hooks/      services/       # API client functions      utils/      App.jsx      main.jsx  server/    src/      config/         # database and environment validation      models/      routes/      controllers/      services/       # business logic and transactions      middleware/     # auth, role checks, validation, error handler      validators/      utils/      app.js      server.js    tests/  docs/    PRD.md    TRD.md  .env.example  .gitignore  README.md

# 5. Environment and Configuration

Server environment variables (example names; never commit real secrets):

NODE_ENV=developmentPORT=5000MONGODB_URI=mongodb://127.0.0.1:27017/foodbridgeCLIENT_ORIGIN=http://localhost:5173SESSION_SECRET=replace-with-long-random-secretCOOKIE_SECURE=falseLOG_LEVEL=info

If JWT is chosen instead of server sessions, define a strong JWT secret, token expiry, and refresh/revocation strategy. Keep client and server environment files separate. Only non-secret VITE_ variables may be exposed to the frontend.

# 6. Data Model and Indexing

## 6.1 User

{  _id: ObjectId,  name: String,                 // required  email: String,                // required, normalized, unique  passwordHash: String,         // required, never returned by API  role: "donor" | "ngo" | "volunteer" | "admin",  organizationName: String,  phone: String,  address: String,  verificationStatus: "not_required" | "pending" | "verified" | "rejected",  accountStatus: "active" | "suspended",  createdAt: Date,  updatedAt: Date}

Indexes: unique normalized email. Add indexes only for fields used in queries. Never accept role=admin from public registration; initial admin creation must be a controlled seed/configuration operation.

## 6.2 Donation

{  _id: ObjectId,  donorId: ObjectId,            // ref User  title: String,  description: String,  foodCategory: String,  foodType: "vegetarian" | "non_vegetarian" | "vegan" | "other",  quantity: Number,             // total offered, > 0  unit: "meals" | "kg" | "packets" | "items",  quantityAvailable: Number,    // maintained server-side  preparedAt: Date,  pickupDeadline: Date,  storageInstructions: String,  allergenInformation: [String],  pickupAddress: String,  location: { latitude: Number, longitude: Number },  status: "draft" | "available" | "reserved" | "partially_reserved" |          "completed" | "cancelled" | "expired",  imageUrl: String,             // optional; only if image storage is implemented  createdAt: Date,  updatedAt: Date}

Indexes: {status: 1, pickupDeadline: 1}; optional {foodCategory: 1, status: 1}; {donorId: 1, createdAt: -1}. A geospatial 2dsphere index is required only if location-based map queries are implemented; represent location as GeoJSON Point for that feature.

## 6.3 DonationRequest

{  _id: ObjectId,  donationId: ObjectId,         // ref Donation  ngoId: ObjectId,              // ref User  requestedQuantity: Number,  status: "pending" | "approved" | "rejected" | "cancelled" |          "in_fulfillment" | "delivered",  pickupNotes: String,  reviewedBy: ObjectId,         // ref User, optional  reviewedAt: Date,  createdAt: Date,  updatedAt: Date}

Index {donationId: 1, status: 1} and {ngoId: 1, createdAt: -1}. If only one active request per NGO per donation is allowed, enforce this in service logic and consider a partial unique index on donationId+ngoId for active statuses, or use a separate reservation collection where the schema supports it.

## 6.4 Pickup

{  _id: ObjectId,  donationId: ObjectId,  requestId: ObjectId,  volunteerId: ObjectId,       // ref User  status: "unassigned" | "assigned" | "picked_up" | "delivered" |          "cancelled" | "failed",  assignedAt: Date,  pickedUpAt: Date,  deliveredAt: Date,  pickupCodeHash: String,      // optional; do not store plain code  createdAt: Date,  updatedAt: Date}

Index {volunteerId: 1, status: 1} and {requestId: 1}. If one active pickup per request is allowed, enforce it with a suitable unique/partial index or transactional service logic.

## 6.5 Notification and AuditLog

Notification: { _id, userId, title, message, type, relatedEntityType, relatedEntityId, isRead, createdAt }AuditLog: { _id, actorId, action, entityType, entityId, details, createdAt }

Index notifications by {userId: 1, isRead: 1, createdAt: -1}; audit logs by {entityType: 1, entityId: 1, createdAt: -1}. Never write credentials, tokens, full payment data, or unnecessary personal details into audit logs.

# 7. API Conventions

Base path: /api/v1.

Content type: application/json except CSV export.

Use ISO 8601 timestamps in UTC in API responses; render local time in the UI.

Use consistent JSON error format: { error: { code, message, details? } }.

Use HTTP status codes consistently: 200/201 success, 400 invalid input, 401 unauthenticated, 403 unauthorized, 404 missing resource, 409 conflict, 422 semantic validation error, 429 rate limit, 500 unexpected server error.

List endpoints support page and limit with a server-enforced maximum page size; use stable sort order.

Validate path IDs and request bodies with a schema validation library or equivalent server-side validators.

Do not trust userId, role, donorId, status, quantityAvailable, or timestamps supplied by clients where these are server-controlled.

# 8. API Endpoint Specification

| Method + Path | Access | Behavior / validation |

| --- | --- | --- |

| POST /auth/register | Public | Validate email/password/name; public roles restricted to donor, NGO, volunteer; NGO starts pending. |

| POST /auth/login | Public, rate-limited | Verify password; establish secure session/cookie; generic invalid-credential message. |

| POST /auth/logout | Authenticated | Invalidate session or clear cookie safely. |

| GET /auth/me | Authenticated | Return safe user profile and role. |

| GET /donations | Authenticated or limited public | Only available, non-expired listings; filters, pagination; avoid exposing full private address. |

| POST /donations | Donor | Validate required food fields, quantity > 0, deadline in future. |

| GET /donations/:id | Authorized | Return listing; reveal full pickup details only to permitted participants. |

| PATCH /donations/:id | Owner/admin | Validate ownership and allowed state; prevent mutation that conflicts with approved request. |

| POST /donations/:id/requests | Verified NGO | Validate quantity and availability; prevent duplicate active request. |

| GET /requests/my | Authenticated | Return requests owned by current NGO, paginated. |

| PATCH /requests/:id/approve | Donation owner/admin | Atomically check request pending, deadline, available quantity; reserve quantity; create/activate pickup workflow. |

| PATCH /requests/:id/reject | Donation owner/admin | Only pending requests; record reviewer and time. |

| PATCH /requests/:id/cancel | Request owner/authorized | Only cancellable states; release reservation if already approved and policy permits. |

| POST /requests/:id/assign-volunteer | Authorized donor/admin | Validate active volunteer; prevent conflicting assignment. |

| PATCH /pickups/:id/collected | Assigned volunteer/admin | Allowed only from assigned; record server timestamp. |

| PATCH /pickups/:id/delivered | Assigned volunteer/authorized recipient/admin | Require pickup completed; record timestamp and update request/donation status. |

| GET /dashboard/summary | Authenticated | Return aggregates scoped to current user's role and ownership. |

| GET /notifications | Authenticated | Return only current user's notifications. |

| PATCH /notifications/:id/read | Owner | Mark own notification read. |

| GET /admin/users | Admin | Paginated user moderation list; exclude password hashes. |

| PATCH /admin/users/:id/verification | Admin | Approve/reject NGO with audit entry. |

| GET /reports/donations | Authorized | CSV export scoped to owner/admin; neutralize spreadsheet formula injection. |



# 9. Critical Business Logic and Concurrency

## 9.1 Request approval

Load and validate the request and donation; confirm actor owns donation or is authorized admin.

Check request is pending, donation is active, pickup deadline has not passed, NGO is verified/active, and requested quantity is valid.

Use a MongoDB transaction (on a transaction-capable deployment) or an atomic conditional update to reserve quantity and change statuses together.

If any precondition fails, return HTTP 409 Conflict or a suitable validation error without partial writes.

Create pickup assignment/record and notification within the same transaction where practical; otherwise use retryable, idempotent operations.

Write audit entry for approval and reservation.

## 9.2 State transition validation

Implement a central transition map in the service layer. Example: available → reserved/partially_reserved/cancelled/expired; assigned → picked_up/cancelled/failed; picked_up → delivered/failed. Reject illegal transitions. Use server time for audit timestamps.

## 9.3 Idempotency

Pickup/delivery endpoints should safely handle retries: if the same authorized action has already succeeded, return the current state rather than create duplicate records. Add an idempotency key for high-risk actions if needed.

# 10. Authentication and Security Design

Hash passwords with bcrypt using a suitable work factor; never log passwords.

Use HTTPS in production, HttpOnly + Secure + SameSite cookies, and CSRF protection if cookie-based authentication is used.

If JWT is used, avoid storing long-lived bearer tokens in localStorage; define short expiry, refresh, and revocation behavior.

Apply authentication middleware before role checks; verify ownership on every resource endpoint.

Never permit self-service assignment of admin role.

Use rate limiting on login/register and other abuse-prone endpoints.

Configure CORS to allow only the deployed frontend origin; do not use wildcard origins with credentials.

Set security headers, request size limits, and strict input validation.

Sanitize output where appropriate and avoid rendering user-supplied HTML.

Store secrets in deployment environment settings; commit only .env.example.

Use least-privilege database credentials and restrict database network access.

Do not expose full pickup address or phone numbers to unauthenticated visitors.

Keep dependencies updated and review npm audit findings before release.

# 11. Privacy and Food-Safety Information

Collect only information needed for coordination and accountability.

Show approximate location in general listings if needed; reveal exact address only to approved participants.

Provide a clear statement that users remain responsible for accurate food information and compliance with applicable food-safety requirements.

Capture preparation time/date, pickup deadline, storage instructions, allergens where known, food category/type, and donor/source details.

Expired donations must be excluded from new requests, even if a scheduled expiry process has not run.

Do not describe platform status as a food-safety certification.

Define data retention and account deactivation behavior before production deployment.

# 12. Frontend Technical Design

## 12.1 Page map

Public: landing page, how-it-works, login, registration.

Shared authenticated: profile, notifications, account settings.

Donor: dashboard, create/edit donation, my donations, requests received, donation detail.

NGO: donation discovery, filters, donation detail, request form, my requests.

Volunteer: assigned pickups, pickup detail, confirm collection/delivery.

Admin: overview, NGO verification queue, users, audit log, reports.

## 12.2 Frontend conventions

Centralize API URLs and request handling in services/apiClient.js.

Use a shared auth context for current user/session state; refresh it from GET /auth/me on app load.

Use route guards for user experience, but rely on backend authorization for security.

Represent loading, empty, success, validation, and server-error states explicitly.

Keep business calculations such as available quantity and final status authoritative on the server.

Use reusable components for forms, status badges, tables, filters, dialogs, and pagination.

# 13. Reporting and Metrics

Donations posted: count of donation records by creation period.

Donations delivered: count of completed delivery records.

Quantity redistributed: sum of delivered quantities grouped by unit; do not sum unlike units into one total.

Pickup completion rate: completed pickups divided by approved pickups eligible for the reporting period, with the denominator clearly defined.

Expired/cancelled counts: separate categories to avoid misleading success rates.

Estimated meals or environmental impact: excluded from MVP unless a transparent, validated conversion formula is documented.

# 14. Testing Strategy

| Test level | Coverage | Example |

| --- | --- | --- |

| Unit | Validation, transition rules, metric calculations | Reject negative quantity; disallow delivered → assigned. |

| API integration | Authentication, authorization, database behavior | Unverified NGO cannot request food; donor cannot edit another donor's record. |

| Concurrency | Reservations and state transitions | Two simultaneous approvals cannot reserve more than available quantity. |

| End-to-end | Primary workflows across browser and API | Donor publishes → NGO requests → donor approves → volunteer collects → delivery confirmed. |

| Security | Role escalation, IDOR, malformed input, rate limiting | Changing donation ID cannot grant access to another donor's record. |

| Responsive/accessibility | Mobile viewport, keyboard, labels, contrast | Registration and request flows usable on narrow screen and by keyboard. |

| Regression | Previously fixed defects | Expired donation stays unavailable after refresh and direct API call. |



# 15. Deployment and Operations

Frontend: deploy static React build to a static hosting provider.

Backend: deploy Express API to a Node-compatible hosting provider.

Database: use local MongoDB for development and a managed MongoDB deployment for hosted demo.

Configure production environment variables separately from local development.

Use HTTPS, restricted CORS, production cookie settings, and least-privilege database access.

Add a basic health endpoint such as GET /health that reports service status without revealing secrets.

Seed demo accounts only through a controlled script; use non-sensitive sample data and change demo passwords before public presentation.

Document build commands, deployment steps, database setup, and rollback/recovery limitations.

# 16. Suggested Development Scripts

Example scripts to adapt to the chosen package setup:

# servernpm run devnpm testnpm start# clientnpm run devnpm run buildnpm run preview

# 17. Implementation Milestones

| Milestone | Technical output | Definition of done |

| --- | --- | --- |

| T1 — Foundation | Repo, Vite app, Express server, Mongo connection, config validation | App starts locally; database connection errors handled. |

| T2 — Identity | User model, registration/login/logout, role middleware | Auth flows and role checks pass tests. |

| T3 — Donations | Donation schema, CRUD endpoints, search and pagination | Donor owns edits; expired/cancelled records are excluded. |

| T4 — Requests | Request schema, approval/rejection, reservation transaction | No double claim in concurrency tests. |

| T5 — Fulfillment | Volunteer assignment, pickup/delivery transitions, notifications | Authorized workflow reaches delivered state with audit timestamps. |

| T6 — Release | Dashboards, CSV, responsive UI, tests, docs, deployment | Acceptance criteria in PRD pass and demo can be reproduced. |



# 18. Technical Risks and Decisions

| Issue | Decision / mitigation |

| --- | --- |

| Transactions unavailable on local standalone MongoDB | Use a transaction-capable MongoDB deployment for transaction tests, or carefully designed atomic single-document reservation logic; document the choice. |

| Partial quantity claims | For MVP, prefer one approved request per donation to simplify inventory; implement partial claims only with atomic quantity accounting and explicit remaining quantity. |

| Address privacy | Hide exact address from general browse results; reveal after approval or to authorized actors. |

| Images | Optional for MVP; if added, validate file type/size and store files externally rather than in MongoDB documents. |

| Notifications | Persist in-app notifications first; external email/SMS is a later enhancement. |

| Food-safety liability | Treat the platform as coordination software; capture relevant information and show clear user responsibilities. |



# 19. Definition of Done

PRD MVP requirements have corresponding implementation and tests.

No secrets or credentials are committed.

Authorization is verified at API level for each protected route.

Primary workflow and critical race conditions are tested.

Frontend handles API errors and loading states.

Database indexes and constraints are documented.

README includes setup, environment variables, scripts, demo accounts, known limitations, and deployment instructions.

Project can be demonstrated from a clean setup using the documented steps.

# 20. References and Further Validation

Official MongoDB documentation: https://www.mongodb.com/docs/

Mongoose documentation: https://mongoosejs.com/docs/

Express documentation: https://expressjs.com/

React documentation: https://react.dev/

OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/

Before production use, verify applicable Indian food-safety and surplus-food distribution requirements with authoritative FSSAI resources and qualified guidance.