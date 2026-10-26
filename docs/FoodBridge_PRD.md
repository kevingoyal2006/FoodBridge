FOODBRIDGE

Product Requirements Document (PRD)

Product vision, users, scope, workflows, and acceptance criteria

Project: Food Donation & Redistribution PlatformTechnology: MongoDB · Express.js · React.js · Node.jsDocument status: Draft for academic project planningVersion: 1.0 | Date: October 2026

# Document Control

| Field | Value |

| --- | --- |

| Product name | FoodBridge |

| Document | Product Requirements Document (PRD) |

| Version | 1.0 |

| Audience | Student developer, project supervisor, evaluators, testers |

| Target release | Academic MVP; dates to be confirmed |

| Status | Planning draft; requirements should be validated with the project supervisor and potential users |



# 1. Executive Summary

FoodBridge is a web-based food donation and redistribution platform that coordinates surplus-food donors, verified non-governmental organizations (NGOs), volunteers, and platform administrators. Donors publish available food with quantity, preparation time, storage notes, pickup deadline, and collection location. NGOs request suitable donations; donors approve a request; volunteers may be assigned to collect and deliver the food; and authorized participants confirm each handover. The system records status changes and presents impact metrics based on completed, recorded transactions.

# 2. Problem Statement

Surplus food from restaurants, hostels, events, and households may be discarded while community organizations need reliable ways to source food. Coordination through informal calls or messages can make availability, pickup timing, ownership, and delivery status difficult to track. FoodBridge aims to provide one shared workflow for publishing surplus food, requesting it, coordinating pickup, documenting handover, and reporting outcomes. The platform does not itself certify food as safe and cannot replace applicable food-safety procedures.

# 3. Product Vision and Objectives

Vision: Make local surplus-food redistribution easier to coordinate, more traceable, and more accountable.

Reduce coordination friction between donors and recipient organizations.

Make donation availability, quantity, deadlines, and status visible to authorized users.

Prevent duplicate claims and conflicting pickup assignments.

Record pickup and delivery confirmation for traceability.

Provide transparent impact metrics based on actual platform records.

Deliver an accessible, responsive application that a solo student can build and maintain with the MERN stack.

# 4. Goals and Success Metrics

| Goal | Metric | MVP success criterion |

| --- | --- | --- |

| Reliable workflow | Donation records reaching a terminal state | Tested end-to-end workflow for completed, cancelled, and expired donations |

| Usability | Task completion in basic user testing | At least 4 of 5 test participants can publish/request/confirm a donation without developer assistance |

| Integrity | Duplicate claims or duplicate attendance/handover records | No duplicate successful claim in concurrency and API tests |

| Traceability | Completed handovers with timestamps and actor IDs | Every delivered record has valid pickup/delivery audit details |

| Performance | Typical API response time in local/staging test | Target under 500 ms for common reads with seeded test data; environment-dependent |

| Accessibility | Keyboard navigation and labels | Core flows usable with keyboard; form inputs have accessible labels |



# 5. Target Users and Roles

| Role | Needs | Permissions |

| --- | --- | --- |

| Donor | Publish surplus food; review requests; coordinate pickup | Create and manage own donations; approve/reject requests for own donations; view own history |

| NGO / Recipient organization | Find suitable food; request quantities; track fulfillment | Browse available donations; request/cancel own requests; view own request history |

| Volunteer | See assigned pickups and record handovers | View assigned pickup details; confirm collection and delivery for assigned jobs only |

| Administrator | Keep platform trustworthy and resolve issues | Review NGO verification; manage accounts and reports; inspect audit logs; moderate records |

| Guest | Understand the service and view public information | View landing page and optionally published, non-sensitive donation summaries; no write access |



# 6. Scope

## 6.1 In Scope — MVP

Responsive web application with React frontend and Node/Express REST API.

Account registration, login/logout, role-based authorization, and profile management.

NGO verification status managed by an administrator.

Create, edit, publish, cancel, and browse food donation listings.

Donation fields for food category, quantity/unit, preparation time, pickup deadline, storage instructions, allergens, vegetarian/non-vegetarian classification where applicable, and pickup address.

NGO request submission and donor approval/rejection.

Reservation logic that prevents more than one request from claiming the same available quantity.

Volunteer assignment and pickup/delivery confirmation.

Donation and request status tracking, in-app notifications, and audit history.

Role-specific dashboards and basic impact statistics.

Search, category filters, deadline filters, pagination, and CSV export for authorized users.

Validation, error handling, security checks, and basic automated/manual testing.

## 6.2 Out of Scope for Initial Release

Payments, donor tax receipts, or monetization.

Native Android/iOS apps.

AI/ML recommendations, demand forecasting, or food-image recognition.

Real-time chat, SMS/WhatsApp integrations, or guaranteed email delivery.

Automated routing/route optimization and live GPS tracking.

Automatic legal certification or food-safety certification.

Integration with external government, NGO, or college systems.

Claims about exact meals served or carbon emissions avoided unless a validated calculation method and reliable data source are defined.

# 7. Assumptions, Dependencies, and Constraints

The first release is an academic prototype operated in a limited test environment.

Users have access to a modern browser and internet connection.

Users enter accurate food, quantity, location, and timing information; administrators may review suspicious content.

Maps, image storage, and email are optional external services and are not required for the core MVP.

Food handling, transportation, labeling, and distribution must follow applicable local laws and safety guidance; the app is a coordination tool, not a safety authority.

Development is primarily by one student; the feature set must remain small enough to test and document thoroughly.

# 8. Functional Requirements

| ID / Requirement | Description |

| --- | --- |

| FR-01 Account registration | A user can register with name, email, password, and selected account type where allowed. Email must be unique. |

| FR-02 Authentication | A user can log in and log out. Passwords are never stored in plain text. |

| FR-03 Role authorization | The API checks the user's role and record ownership for every protected operation. |

| FR-04 NGO verification | New NGO accounts remain pending until an administrator verifies or rejects them. Only approved NGOs may submit requests. |

| FR-05 Create donation | An eligible donor can publish food details, quantity/unit, preparation time, pickup deadline, storage notes, allergen information, and address. |

| FR-06 Edit/cancel donation | A donor can edit or cancel their own donation while its state permits it. Changes affecting an approved request must be blocked or explicitly reconciled. |

| FR-07 Browse/search | An NGO can search and filter available donations by category, deadline, food type, and location text. |

| FR-08 Request donation | An approved NGO can request an available quantity no greater than the listed remaining quantity. |

| FR-09 Review request | The donor can approve or reject a request for their own donation. Approval atomically reserves the quantity and prevents conflicting claims. |

| FR-10 Volunteer assignment | An authorized donor/admin or defined assignment workflow can assign an active volunteer to an approved request. |

| FR-11 Pickup confirmation | Only the assigned volunteer or authorized admin can confirm collection; the system records actor and timestamp. |

| FR-12 Delivery confirmation | Only the assigned volunteer or authorized recipient can confirm delivery; the system records actor and timestamp. |

| FR-13 Status visibility | Users can view status and timeline only for records they own or are authorized to access. |

| FR-14 Notifications | The system creates in-app notifications for request submitted, approved/rejected, volunteer assigned, pickup confirmed, delivery confirmed, and cancellation. |

| FR-15 Dashboard | Each role sees counts and recent activity relevant to their permissions. |

| FR-16 Reports | Authorized users can export filtered records to CSV without exposing private fields or other users' sensitive information. |

| FR-17 Audit trail | Important state changes store actor, action, entity, timestamp, and relevant non-sensitive details. |

| FR-18 Expiry | Expired or past-deadline donations cannot receive new requests; a scheduled job is optional, with expiry also enforced during reads/writes. |

| FR-19 Input validation | Invalid quantity, past/invalid deadlines, missing required fields, invalid status transitions, and malformed identifiers are rejected with clear errors. |

| FR-20 Account controls | Administrators can suspend accounts when required; suspended accounts cannot create requests or perform protected actions. |



# 9. Key User Stories

As a donor, I want to publish surplus food quickly so that nearby organizations can request it before the pickup deadline.

As an NGO coordinator, I want to filter donations by category, quantity, and deadline so that I can find suitable food.

As an NGO coordinator, I want to request a specific quantity and see a clear status so that I can plan collection.

As a donor, I want to approve one eligible request without another request claiming the same quantity.

As a volunteer, I want to see only my assigned pickups and confirm handover so that delivery status is traceable.

As an administrator, I want to verify organizations and review audit records so that platform access is controlled.

As a project evaluator, I want impact reports derived from recorded events so that results are transparent.

# 10. Business Rules

Only an authenticated donor may create donations; only the owner or an authorized admin may edit or cancel them.

Only verified and active NGO accounts may request donations.

A request must have a positive quantity and cannot exceed the available quantity.

The system must prevent duplicate active requests by the same NGO for the same donation unless a defined quantity-amendment workflow is used.

A donation cannot be claimed after its pickup deadline or after it is cancelled, expired, or fully reserved.

A donation with an accepted request cannot be edited in a way that invalidates its quantity, food details, deadline, or location without an explicit cancellation/reapproval workflow.

Pickup and delivery confirmations must be performed by authorized actors and recorded with server timestamps.

Impact totals count only completed deliveries; cancelled, rejected, expired, and pending records are excluded.

Any estimate such as meals represented by kilograms must show the formula and assumption and must not be presented as a verified count of people fed.

# 11. Status Models and Workflows

## 11.1 Donation states

Draft → Available → Reserved/Partially Reserved (if partial quantities are supported) → Completed. Alternative terminal states: Cancelled or Expired. State changes are validated by the backend.

## 11.2 Request states

Pending → Approved → Fulfillment in progress → Delivered. Alternative states: Rejected or Cancelled. A request cannot move backward from Delivered.

## 11.3 Pickup states

Unassigned → Assigned → Picked up → Delivered. Exception states: Cancelled or Failed/Needs review. Record each transition with actor and timestamp.

# 12. Non-Functional Requirements

| Area | Requirement |

| --- | --- |

| Security | Hash passwords; validate inputs; enforce authorization server-side; protect secrets; rate-limit authentication; avoid exposing stack traces. |

| Privacy | Collect only necessary personal data; restrict addresses and phone numbers to users involved in a transaction; provide a way to deactivate accounts. |

| Usability | Clear navigation, understandable statuses, form validation, helpful empty states, responsive layouts. |

| Accessibility | Semantic headings, keyboard operation, visible focus, labeled inputs, adequate contrast, meaningful error messages. |

| Performance | Paginate list endpoints, index common query fields, avoid loading entire collections, and test with seeded data. |

| Reliability | Use centralized error handling, structured logs, database constraints/indexes, and safe state transitions. |

| Maintainability | Separate routes, controllers, services, models, validators, and frontend API services; document environment setup. |

| Compatibility | Support current versions of major desktop and mobile browsers. |

| Auditability | Record important actions and state transitions without storing passwords, tokens, or unnecessary sensitive data in logs. |



# 13. UX and Content Requirements

Landing page explains the purpose, how it works, and who can participate.

Donation cards show title, quantity, food category, pickup deadline, approximate location, and availability status.

Donation details display preparation time, storage notes, allergen information, and pickup instructions before a request is submitted.

Status labels use both text and visual indicators; color alone must not convey meaning.

Forms explain required fields and show validation messages beside the relevant input.

Destructive actions such as cancel donation require confirmation.

The dashboard includes loading, empty, success, and error states.

# 14. Acceptance Criteria for MVP

A donor can register, log in, publish a valid donation, and see it in their dashboard.

An unverified NGO cannot submit a request; a verified NGO can browse and request available food.

The donor can approve or reject a request and the NGO sees the updated status.

Concurrent requests cannot reserve more than the available quantity.

Only an assigned volunteer or authorized user can confirm pickup/delivery.

The donation becomes unavailable or expired when its quantity is exhausted or deadline passes.

Dashboard totals match underlying records and count only the defined statuses.

CSV exports enforce permissions and exclude password hashes and other secrets.

Core flows work on desktop and mobile viewports.

Setup, environment variables, API routes, known limitations, and test steps are documented in README.

# 15. Risks and Mitigations

| Risk | Mitigation |

| --- | --- |

| Food may be unsafe or mislabeled | Capture source, preparation/deadline, storage, allergens; show safety disclaimers; require users to follow applicable rules; allow reports/admin review. |

| Double booking / race condition | Use atomic conditional updates or transactions; add indexes; test simultaneous requests. |

| False NGO accounts | Admin verification, account status controls, and audit trail. |

| Pickup does not occur | Deadlines, status tracking, cancellation/failed-pickup workflow, and notifications. |

| Scope becomes too large | Deliver MVP first; keep maps, QR, live tracking, and integrations optional. |

| Sensitive location exposure | Show limited location publicly; reveal full pickup details only to authorized parties after approval. |



# 16. Release Plan

| Release | Included |

| --- | --- |

| MVP | Authentication, role-based access, NGO verification, donation listing, request/approval, basic pickup/delivery status, dashboards. |

| Release 1.1 | Volunteer assignment, notifications, audit history, CSV export, improved filters. |

| Future | Map integration, QR/one-time codes, route assistance, email notifications, richer analytics. |



# 17. Open Questions

Will the initial deployment be limited to one college/city or accept users from multiple locations?

Will donations be full-claim only, or will partial quantity claims be supported in the first release?

Who is allowed to assign volunteers: donor, NGO, or administrator?

What evidence is required for NGO verification in the academic prototype?

Will the project use map coordinates, or only pickup address text in the MVP?

Which food-safety fields and operational rules will the project supervisor require?

# 18. Glossary

| Term | Definition |

| --- | --- |

| Donor | Person or organization offering surplus food. |

| NGO | Verified recipient organization requesting food. |

| Volunteer | Person authorized to collect or deliver an approved donation. |

| Donation | A listing describing food offered for redistribution. |

| Request | An NGO's request to receive some or all of a donation. |

| Pickup | Operational record for collection and delivery of an approved request. |

| MVP | Minimum viable product: the smallest complete, testable release. |

