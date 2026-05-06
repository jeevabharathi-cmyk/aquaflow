# 💧 AquaFlow — Complete Product Requirements Document (PRD)

### Water Bottle Supply, Assembly & Distribution Management System

### Admin Panel · Customer App · Driver Delivery App · Assignment App · Marketing Website

---


| Field                  | Details                                    |
| ---------------------- | ------------------------------------------ |
| **Document Version**   | 2.0 (Final — Combined)                    |
| **Date**               | 03 May 2026                                |
| **Classification**     | Confidential                               |
| **Document Owner**     | Product Manager                            |
| **Prepared By**        | Product & Engineering Teams                |
| **Status**             | Final Draft                                |
| **Approvals Required** | CTO · Head of Operations · Head of Sales |

**Revision History**


| Version | Date        | Changes                                                                                  |
| ------- | ----------- | ---------------------------------------------------------------------------------------- |
| 0.1     | 01 Apr 2026 | Initial Outline                                                                          |
| 0.5     | 15 Apr 2026 | Technical architecture added                                                             |
| 1.0     | 03 May 2026 | AquaFlow PRD — full Supabase + n8n spec                                                 |
| 2.0     | 03 May 2026 | Combined with Water Bottle Supply PRD — Supplier, BOM, Inventory, DevOps, Testing added |

---

## TABLE OF CONTENTS

1. Executive Summary
2. Project Overview & Business Model
3. System Architecture
4. User Roles & Permissions
5. Platform Breakdown (All 5 Platforms)
6. Functional Requirements — Admin Web Portal
   * 6.1 Supplier Management
   * 6.2 Raw Material Inventory
   * 6.3 Product Setup & Bill of Materials (BOM)
   * 6.4 Cost Calculation Engine
   * 6.5 Pricing & Discount Management
   * 6.6 Customer Management
   * 6.7 Order Management
   * 6.8 Delivery & Dispatch Management
   * 6.9 Fleet & Vehicle Management
   * 6.10 Reporting & Analytics
   * 6.11 Staff & Role Management
   * 6.12 Audit Log
7. Functional Requirements — Customer Mobile App
8. Functional Requirements — Delivery Driver App
9. Functional Requirements — Delivery Assignment App
10. Functional Requirements — Marketing Website
11. Database Schema — Supabase (PostgreSQL)
12. Row-Level Security (RLS) Policies
13. Performance & Data Aggregation Strategy
14. n8n Automation Workflows
15. Security Architecture
16. Flow Diagrams & State Machines
17. UI/UX Design Specification
18. API Design
19. Real-Time GPS Tracking Implementation
20. Payment Gateway Integration
21. Deployment Strategy & DevOps
22. Testing Strategy & Acceptance Criteria
23. Development Phases & Milestones
24. Non-Functional Requirements
25. Risk & Mitigation Register
26. Glossary of Technical Terms
27. Appendices

---

## 1. EXECUTIVE SUMMARY

**AquaFlow** is a full-stack digital ecosystem for a water bottle supply and distribution business. The company **does not manufacture** bottles; it purchases empty bottles, caps, and labels from external suppliers, fills bottles with purified water, assembles the final product, and delivers directly to customers (individuals, bulk event clients, and commercial customers).

The system transforms all operations into a single, integrated digital platform comprising:


| Platform            | Type              | Primary Users                                       |
| ------------------- | ----------------- | --------------------------------------------------- |
| Admin Web Portal    | React Web App     | Super Admin, Inventory Mgr, Sales Mgr, Delivery Mgr |
| Customer App        | Android + iOS APK | End customers                                       |
| Driver Delivery App | Android + iOS APK | Delivery drivers/riders                             |
| Assignment App      | Android + iOS APK | Dispatch supervisors                                |
| Marketing Website   | Next.js Web       | Prospective customers                               |

**Core Technical Decisions:**

* **Backend:** Supabase (PostgreSQL 15 + Auth + Storage + Realtime + Edge Functions)
* **Automation:** n8n (self-hosted) for scheduled jobs, notifications, backups, invoice generation
* **Architecture:** CQRS + Event-Driven — writes go to raw tables; reads for analytics always hit pre-aggregated summary tables
* **Performance Guarantee:** All historical reports (daily → 5-year) respond in < 200ms via nightly pre-aggregation

**The key performance problem solved:** Instead of scanning raw order data for every analytics request, n8n runs nightly jobs that pre-calculate daily, monthly, and yearly summaries. Admin reports load from these tiny summary tables — never from raw transaction data.

---

## 2. PROJECT OVERVIEW & BUSINESS MODEL

### 2.1 The Full Business Flow

```
[PROCUREMENT]
Suppliers → Purchase Orders → Raw Materials Received
(Empty Bottles, Caps, Labels, Packaging)
      ↓
[INVENTORY]
Raw Material Stock Tracked → SKU-coded → Cost Recorded
      ↓
[ASSEMBLY]
Assembly Order Created → BOM Applied → Raw Materials Deducted
→ Finished Goods Stock Updated
      ↓
[SALES]
Customer Places Order (App / Supervisor / Admin)
→ Inventory Reserved → Payment Processed
      ↓
[DELIVERY]
Dispatch Manager Assigns Driver + Vehicle
→ Driver App Activated → GPS Tracking Starts
→ Real-Time Location: Customer App + Admin Dashboard
      ↓
[CONFIRMATION]
Driver: Proof of Delivery (Photo / OTP / Signature)
→ Order: Delivered → Invoice Generated → Balance Updated
      ↓
[ANALYTICS]
n8n Nightly Jobs → Pre-Aggregate → Summary Tables
→ Admin Reports: Instant < 200ms
```

### 2.2 Core Scope

* Supplier accounts, purchase orders, delivery tracking from supplier
* Raw material inventory (Bottles, Caps, Labels) with SKU, costing, stock alerts
* Compatibility-based product assembly (Bill of Materials)
* Dynamic cost calculation with overhead + multi-tier pricing
* Customer ledger (balance, credit limits, payment history)
* Full order lifecycle: placed → confirmed → processing → ready → assigned → dispatched → delivered
* Driver & vehicle assignment, route planning, live GPS tracking via WebSocket
* Push notifications (FCM) for all parties
* Pre-aggregated analytics (daily, monthly, yearly, 5-year) via n8n cron jobs
* Subscription / recurring order management
* Comprehensive reporting with CSV/PDF export

### 2.3 Business Goals


| #  | Goal                | KPI                                                 |
| -- | ------------------- | --------------------------------------------------- |
| G1 | Fast report loading | < 200ms for any historical query                    |
| G2 | Scalability         | 10,000 customers, 500 drivers, 50 admin sessions    |
| G3 | Reliability         | 99.9% uptime, zero order data loss                  |
| G4 | Mobile-first        | Offline support, sync on reconnect                  |
| G5 | Security            | RBAC, RLS, encrypted PII, PCI-DSS for payments      |
| G6 | Inventory accuracy  | Real-time stock deduction on assembly + delivery    |
| G7 | Supplier efficiency | Digital PO management, auto stock update on receipt |

---

## 3. SYSTEM ARCHITECTURE

### 3.1 High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Customer  │  │  Driver  │  │Assign.   │  │  Admin   │  │ Mktg  │ │
│  │  App     │  │  App     │  │  App     │  │Dashboard │  │  Web  │ │
│  │ (APK)    │  │ (APK)    │  │ (APK)    │  │  (Web)   │  │       │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬───┘ │
└───────┼─────────────┼─────────────┼──────────────┼─────────────┼─────┘
        └─────────────┴─────────────┴──────────────┴─────────────┘
                                    │
                    ┌───────────────▼──────────────────┐
                    │           API GATEWAY             │
                    │  Rate Limiting · Auth · CORS      │
                    │  Supabase Edge Functions (Deno)   │
                    └────────────┬─────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
  ┌───────▼──────┐   ┌───────────▼────────┐  ┌─────────▼────────┐
  │  Auth Service│   │  PostgreSQL DB      │  │  Supabase        │
  │  Supabase    │   │  Raw Tables +       │  │  Storage         │
  │  Auth + JWT  │   │  Summary Tables     │  │  (Invoices,      │
  │  OTP + TOTP  │   │  RLS Enforced       │  │   POD Photos)    │
  └──────────────┘   └───────────┬─────────┘  └──────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │      REDIS CACHE          │
                    │  Sessions · Live Location │
                    │  Pub/Sub · WebSocket Rooms│
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │    MESSAGE QUEUE          │
                    │  (n8n Webhooks /          │
                    │   Supabase Triggers)      │
                    │  Order Events ·           │
                    │  Notifications            │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │     n8n AUTOMATION        │
                    │  - Nightly Aggregation    │
                    │  - Invoice Generation     │
                    │  - Payment Reminders      │
                    │  - Subscription Orders    │
                    │  - Backups · Alerts       │
                    └──────────────────────────┘
```

### 3.2 Architecture Patterns

**CQRS (Command/Query Responsibility Segregation):**

```
WRITE PATH:  App action → Supabase Edge Function → INSERT into raw tables
                          → Supabase Realtime broadcasts event

READ PATH:   Historical report → SELECT from pre-aggregated summary tables
             Live data         → SELECT from raw tables (today only)
             Location tracking → Redis cache (latest position)
```

**Event-Driven Notifications:**

```
Order status change → Supabase DB trigger → n8n webhook → FCM → Device
```

### 3.3 Technology Stack


| Layer                  | Technology                                               | Justification                                                  |
| ---------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| **Admin Frontend**     | React 18 + Vite + TailwindCSS + Ant Design               | Rich UI components, rapid development                          |
| **Marketing Website**  | Next.js                                                  | SEO-optimised, SSR                                             |
| **Mobile Apps**        | Flutter (iOS + Android)                                  | Single codebase, native performance, excellent mapping plugins |
| **Backend / Database** | Supabase (PostgreSQL 15)                                 | ACID, GIS, Realtime, Auth, RLS all-in-one                      |
| **Edge Functions**     | Supabase Edge Functions (Deno/TypeScript)                | Custom business logic, serverless                              |
| **Cache / Pub-Sub**    | Redis                                                    | Session mgmt, real-time GPS cache, WebSocket rooms             |
| **Message Queue**      | n8n webhooks + Supabase pg\_notify                       | Order events, async notifications                              |
| **Automation**         | n8n (self-hosted)                                        | Scheduled jobs, workflows, integrations                        |
| **WebSocket**          | Socket.io (Node.js sidecar) OR Supabase Realtime         | Driver GPS → customer live tracking                           |
| **Maps**               | Google Maps API (Directions, Distance Matrix, Geocoding) | Turn-by-turn, route optimization                               |
| **Push Notifications** | Firebase Cloud Messaging (FCM)                           | Free, cross-platform, reliable                                 |
| **SMS**                | Twilio / TextLocal                                       | OTP, payment reminders                                         |
| **Payment Gateway**    | Razorpay (India)                                         | UPI, cards, wallets — market leader                           |
| **File Storage**       | Supabase Storage (S3-compatible)                         | Invoice PDFs, delivery proof photos                            |
| **Cloud**              | AWS (EC2, RDS, S3, CloudFront) OR Supabase Cloud         | Scalable, CDN for assets                                       |
| **CI/CD**              | GitHub Actions + Docker + Kubernetes (EKS)               | Automated deployment, container orchestration                  |
| **IaC**                | Terraform                                                | AWS resource management                                        |
| **Monitoring**         | Prometheus + Grafana + Sentry + CloudWatch               | Metrics, error tracking, logs                                  |
| **Mobile CI/CD**       | Codemagic / GitHub Actions                               | Build Flutter, TestFlight/Play Beta distribution               |

---

## 4. USER ROLES & PERMISSIONS

### 4.1 Role Matrix


| Role                  | Platform          | Key Capabilities                                                                        |
| --------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| **Super Admin**       | Web Admin Panel   | Full system control, user management, all configs, all financial data, audit logs       |
| **Inventory Manager** | Web Admin Panel   | Supplier mgmt, raw material purchasing, stock adjustments, product setup, BOM, assembly |
| **Sales Manager**     | Web Admin Panel   | Customer mgmt, pricing rules, order oversight, discounts, custom pricing                |
| **Delivery Manager**  | Web Admin Panel   | Vehicle/driver management, delivery assignment, tracking dashboard                      |
| **Admin Staff**       | Web Admin Panel   | Orders, customers, reports (no settings, no financials)                                 |
| **Supervisor/Agent**  | Web (light) / App | Place orders for assigned customers, view customer balances and orders                  |
| **Customer**          | Customer App      | Browse products, place orders, make payments, track deliveries, view history            |
| **Driver**            | Driver App        | View assigned deliveries, navigate, update status, confirm delivery, GPS share          |
| **Guest**             | Marketing Website | View plans, register, contact                                                           |

### 4.2 Authentication Methods


| Role        | Auth Method                                        |
| ----------- | -------------------------------------------------- |
| Customer    | Phone OTP via Supabase Auth (Twilio/TextLocal)     |
| Driver      | Phone OTP + admin approval required                |
| Supervisor  | Email + Password + admin provisioned               |
| Admin roles | Email + Password + TOTP 2FA (Google Authenticator) |

---

## 5. PLATFORM BREAKDOWN

### 5.1 Admin Web Portal — Module Overview


| Module                 | Sub-modules                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| Dashboard              | KPI cards, live order feed, stock alerts, revenue chart            |
| Supplier Management    | Onboarding, POs, performance                                       |
| Raw Material Inventory | Master data, stock ledger, valuation                               |
| Products & BOM         | Product catalog, BOM editor, compatibility matrix, assembly orders |
| Cost & Pricing         | Cost engine, price lists, customer-specific pricing                |
| Customer Management    | Profiles, wallet, credit, pricing, supervisor links                |
| Order Management       | Full lifecycle, assignment, bulk orders                            |
| Delivery & Dispatch    | Assignment, live map, driver tracking                              |
| Fleet & Vehicles       | Vehicle profiles, capacity, status                                 |
| Analytics & Reports    | All time-range reports, charts, exports                            |
| Subscriptions          | Plans, recurring orders                                            |
| Payments & Ledger      | Transactions, refunds, dues                                        |
| Staff & Roles          | Admin users, RBAC                                                  |
| Settings               | Business config, zones, notification templates                     |
| Audit Log              | All actions, immutable                                             |

### 5.2 Customer App — Screens


| Screen              | Functions                                                        |
| ------------------- | ---------------------------------------------------------------- |
| Splash / Onboarding | Brand intro, language select, login/register                     |
| Home Dashboard      | Today's orders, quick reorder, balance, promotions               |
| Product Catalogue   | Browse by category, search, filter by size/type, dynamic pricing |
| Cart                | Persistent cart, running total, coupon field                     |
| Checkout            | Address picker, delivery slot, payment method selection          |
| Order Tracking      | Live map (driver position), status timeline, ETA, driver contact |
| Order History       | Filter by date, search, re-order button                          |
| Bills & Invoices    | Invoice list, PDF download, pay now (Razorpay)                   |
| Wallet              | Balance, top-up, transaction ledger                              |
| Subscription        | Active plans, pause/cancel, next delivery date                   |
| Profile             | Name, phone, multiple addresses, language preference             |
| Notifications       | Push + in-app history                                            |
| Support             | Raise ticket, WhatsApp, FAQ                                      |

### 5.3 Driver Delivery App — Screens


| Screen               | Functions                                                 |
| -------------------- | --------------------------------------------------------- |
| Login                | Phone OTP auth                                            |
| Status Toggle        | Go online / offline — broadcasts to server               |
| Dashboard            | Today's assigned count, completed, earnings               |
| Delivery List        | All assigned orders, sorted by route sequence             |
| Order Detail         | Customer info, address on map, items, payment mode, notes |
| Navigation           | Google Maps SDK turn-by-turn, simultaneous GPS broadcast  |
| Arrival Confirmation | Geofence auto-detect (100m) → prompt "Arrived"           |
| Proof of Delivery    | Photo capture OR OTP from customer OR digital signature   |
| Failed Delivery      | Failure reason selection, notes, reschedule               |
| Earnings             | Daily/weekly/monthly breakdown, withdrawal request        |
| Profile              | Documents, vehicle, bank details                          |

### 5.4 Assignment App — Screens


| Screen              | Functions                                                                 |
| ------------------- | ------------------------------------------------------------------------- |
| Login               | Supervisor/Dispatcher auth                                                |
| Live Map            | All drivers (real-time positions), unassigned order pins                  |
| Order Queue         | Unassigned orders list, sortable by zone/time/priority                    |
| Driver Status Panel | All drivers: online/offline/busy, current delivery count                  |
| Assign Flow         | Select order → see suggested drivers (zone + load sort) → tap to assign |
| Bulk Assign         | Multi-select orders → auto-distribute by zone                            |
| Shift Management    | Driver check-in/check-out, shift summary                                  |
| Alerts              | New order notification, driver went offline alert                         |

### 5.5 Marketing Website — Pages


| Page               | Content                                                   |
| ------------------ | --------------------------------------------------------- |
| Home               | Hero, Features, How It Works, Testimonials, Pricing Plans |
| About Us           | Company story, values                                     |
| How It Works       | 3-step visual (Order → Delivery → Enjoy)                |
| Pricing            | Subscription tiers, comparison table                      |
| Register / Sign Up | Self-registration, redirects to app download              |
| Contact            | Form, WhatsApp, address on map                            |
| Blog               | SEO content                                               |
| Login              | Redirects to Customer App                                 |

---

## 6. FUNCTIONAL REQUIREMENTS — ADMIN WEB PORTAL

### 6.1 Supplier Management

**Purpose:** Maintain records of external suppliers providing raw materials (bottles, caps, labels, packaging).

#### 6.1.1 Supplier Onboarding


| Req ID | Feature                   | Detail                                                                                           |
| ------ | ------------------------- | ------------------------------------------------------------------------------------------------ |
| SUP-01 | Supplier Profile Creation | Fields: Name, Contact Person, Phone, Email, Address, GST/VAT Number, Payment Terms, Bank Details |
| SUP-02 | Unique Supplier ID        | Auto-generated: SUP-001, SUP-002, etc.                                                           |
| SUP-03 | Supplier Edit             | Update any field; changes logged to audit                                                        |
| SUP-04 | Supplier Deactivation     | Soft-delete; historical POs preserved                                                            |
| SUP-05 | Supplier Portal (Future)  | Optional login for supplier to view POs and update lead times                                    |

#### 6.1.2 Raw Material Association


| Req ID | Feature                  | Detail                                                                            |
| ------ | ------------------------ | --------------------------------------------------------------------------------- |
| SUP-06 | Material-Supplier Link   | Each raw material linked to ≥1 supplier                                          |
| SUP-07 | Supplier Material Record | Per supplier per material: unit cost, lead time, minimum order quantity           |
| SUP-08 | Multi-supplier           | Same material can have multiple suppliers; admin selects preferred at PO creation |

#### 6.1.3 Purchase Orders (Internal)


| Req ID | Feature            | Detail                                                                                     |
| ------ | ------------------ | ------------------------------------------------------------------------------------------ |
| SUP-09 | PO Creation        | Fields: Date, Supplier, Material list (SKU, qty, unit cost), Total, Expected delivery date |
| SUP-10 | PO Status Workflow | Draft → Approved → Shipped → Received                                                   |
| SUP-11 | PO Receipt         | Admin marks PO as "Received" → system auto-updates raw material stock quantities          |
| SUP-12 | Partial Receipt    | Record partial deliveries; PO remains open until fully received                            |
| SUP-13 | PO PDF             | Generate printable Purchase Order PDF                                                      |

#### 6.1.4 Supplier Performance Dashboard


| Req ID | Feature            | Detail                                              |
| ------ | ------------------ | --------------------------------------------------- |
| SUP-14 | On-Time Delivery % | Calculated from PO expected vs actual receipt dates |
| SUP-15 | Average Lead Time  | Per supplier, per material                          |
| SUP-16 | Quality Issues Log | Manual logging of defective material batches        |

---

### 6.2 Raw Material Inventory

**Purpose:** Track every purchase, stock level, cost, and movement of raw materials used in water bottle assembly.

#### 6.2.1 Material Master Data


| Req ID | Feature            | Detail                                                                                    |
| ------ | ------------------ | ----------------------------------------------------------------------------------------- |
| INV-01 | Material Types     | Bottle, Cap, Label (extensible: shrink wrap, packaging box)                               |
| INV-02 | Material Fields    | SKU (auto or manual), Name, Type, Unit of Measurement (pieces/kg/rolls), Dimensions/specs |
| INV-03 | SKU Format         | Auto-generated: BOT-1L-CLR (Bottle, 1 Litre, Clear), CAP-STD-RED, LBL-PREM-1L             |
| INV-04 | Compatibility Tags | Materials tagged for compatibility rules (see BOM section)                                |
| INV-05 | Cost Tracking      | Landed cost per unit stored; updated on each PO receipt                                   |
| INV-06 | Costing Method     | Admin selects: FIFO (First In First Out) or Weighted Average                              |

#### 6.2.2 Stock Management


| Req ID | Feature                | Detail                                                                                          |
| ------ | ---------------------- | ----------------------------------------------------------------------------------------------- |
| INV-07 | Real-Time Stock Levels | Dashboard card per material showing current qty                                                 |
| INV-08 | Stock Adjustments      | Manual corrections, wastage recording, returns — all require reason                            |
| INV-09 | Minimum Stock Alert    | Admin sets reorder threshold per material; n8n triggers notification when breached              |
| INV-10 | Stock Audit Trail      | Every stock change: timestamp, user, reason, quantity delta, reference (PO/Assembly/Adjustment) |
| INV-11 | Stock Reservation      | When Assembly Order confirmed, materials reserved (soft-lock) before deduction                  |

#### 6.2.3 Inventory Valuation


| Req ID | Feature           | Detail                                                   |
| ------ | ----------------- | -------------------------------------------------------- |
| INV-12 | On-Hand Valuation | Report: total value of all raw materials at current cost |
| INV-13 | Valuation by Type | Breakdown by Bottle / Cap / Label / Other                |
| INV-14 | Cost History      | Track how raw material costs have changed over time      |

---

### 6.3 Product Setup & Bill of Materials (BOM)

**Purpose:** Define finished water bottle products by combining raw materials with strict compatibility enforcement.

#### 6.3.1 Product Master


| Req ID  | Feature               | Detail                                                                                        |
| ------- | --------------------- | --------------------------------------------------------------------------------------------- |
| PROD-01 | Product Creation      | Fields: Product Code (SKU), Name, Description, Image, Base Unit (per bottle or per box of 12) |
| PROD-02 | Multi-Level Packaging | Single bottle AND case/box of 12/24 both definable                                            |
| PROD-03 | Product Images        | Upload to Supabase Storage; served via CDN                                                    |
| PROD-04 | Product Categories    | 500ml, 1L, 2L, 5L, 20L Can, Custom                                                            |
| PROD-05 | Finished Goods Stock  | Separate stock count for assembled finished products                                          |

**Sample Products:**


| Product SKU | Name                        | Unit       |
| ----------- | --------------------------- | ---------- |
| FP-1L-PREM  | 1L Premium Pack             | Per bottle |
| FP-1L-BOX12 | 1L Premium Pack (Box of 12) | Per box    |
| FP-20L-CAN  | 20L Water Can               | Per can    |

#### 6.3.2 Bill of Materials (BOM)


| Req ID | Feature        | Detail                                                                                  |
| ------ | -------------- | --------------------------------------------------------------------------------------- |
| BOM-01 | BOM Definition | For each product: list of raw materials + quantity per unit                             |
| BOM-02 | Overhead Costs | Optional per-unit overhead: labour, water, electricity (fixed ₹ or % of material cost) |
| BOM-03 | BOM Versioning | Any BOM change creates new version; previous archived; active version drives cost       |
| BOM-04 | BOM History    | Full version history visible to admin                                                   |

**Sample BOM — 1L Premium Pack (per bottle):**


| Component         | SKU         | Qty  | Unit Cost | Line Total   |
| ----------------- | ----------- | ---- | --------- | ------------ |
| 1L Clear Bottle   | BOT-1L-CLR  | 1 pc | ₹ 4.50   | ₹ 4.50      |
| Standard Red Cap  | CAP-STD-RED | 1 pc | ₹ 0.80   | ₹ 0.80      |
| Premium 1L Label  | LBL-PREM-1L | 1 pc | ₹ 1.20   | ₹ 1.20      |
| Assembly Overhead | —          | —   | ₹ 0.50   | ₹ 0.50      |
| **Total Cost**    |             |      |           | **₹ 7.00**  |
| **Selling Price** |             |      |           | **₹ 12.00** |

#### 6.3.3 Compatibility Matrix


| Req ID    | Feature                 | Detail                                                                          |
| --------- | ----------------------- | ------------------------------------------------------------------------------- |
| COMPAT-01 | Compatibility Rules     | Admin defines which caps fit which bottles; which labels match which bottles    |
| COMPAT-02 | BOM Enforcement         | When building BOM, cap dropdown only shows caps compatible with selected bottle |
| COMPAT-03 | Incompatible Prevention | System blocks saving BOM with incompatible combination                          |
| COMPAT-04 | Rule Management         | Admin can add/edit/delete compatibility rules at any time                       |

**Example Rules:**

* BOT-1L-CLR ↔ compatible with: CAP-STD-RED, CAP-STD-BLUE (NOT CAP-LARGE)
* BOT-20L-JUG ↔ compatible with: CAP-JUG-BLK only
* LBL-PREM-1L ↔ compatible with: BOT-1L-CLR, BOT-1L-BLU

#### 6.3.4 Assembly Orders


| Req ID   | Feature                  | Detail                                                                    |
| -------- | ------------------------ | ------------------------------------------------------------------------- |
| ASSEM-01 | Create Assembly Order    | Select product, quantity; system calculates required raw materials        |
| ASSEM-02 | Stock Availability Check | System checks if sufficient raw materials exist; alerts if not            |
| ASSEM-03 | Assembly Confirmation    | On confirm: raw material stock deducted, finished goods stock incremented |
| ASSEM-04 | Assembly Record          | Every assembly logged: date, product, qty, materials used, assembled by   |
| ASSEM-05 | Partial Assembly         | Can assemble partial quantity if stock partially available                |

---

### 6.4 Cost Calculation Engine

**Purpose:** Automatically compute the landed cost of a finished product based on its active BOM.

#### 6.4.1 Cost Breakdown


| Req ID  | Feature               | Detail                                                                           |
| ------- | --------------------- | -------------------------------------------------------------------------------- |
| COST-01 | Auto Cost Calculation | Material Cost = Σ (qty per unit × current unit cost) for all BOM items         |
| COST-02 | Overhead Addition     | Admin adds: Labour per unit, Water cost per unit, Electricity per unit (₹ or %) |
| COST-03 | Total Product Cost    | Material Cost + All Overheads                                                    |
| COST-04 | Cost Alert            | When any raw material cost changes → alert admin to review selling prices       |
| COST-05 | Cost History          | Time-series chart of product cost changes                                        |

#### 6.4.2 Cost Versioning


| Req ID  | Feature           | Detail                                                             |
| ------- | ----------------- | ------------------------------------------------------------------ |
| COST-06 | Version on Change | New cost version created on: BOM edit OR raw material cost change  |
| COST-07 | Active Version    | Only one active cost version per product at a time                 |
| COST-08 | Archive           | All old cost versions archived, viewable for audit                 |
| COST-09 | Margin Display    | System shows selling price, cost, margin %, margin ₹ side by side |

---

### 6.5 Pricing & Discount Management

#### 6.5.1 Base Price List


| Req ID   | Feature                | Detail                                                                    |
| -------- | ---------------------- | ------------------------------------------------------------------------- |
| PRICE-01 | Standard Selling Price | Per product: SSP applies to all customers by default                      |
| PRICE-02 | Per-Unit and Per-Box   | Set unit price; system auto-calculates box price (unit × units per box)  |
| PRICE-03 | Effective Date         | Price changes have an effective date; old price preserved for past orders |

#### 6.5.2 Customer-Specific Pricing


| Req ID   | Feature                | Detail                                                                    |
| -------- | ---------------------- | ------------------------------------------------------------------------- |
| PRICE-04 | Custom Price List      | Assign a specific price per product to a customer or customer group       |
| PRICE-05 | Price Override         | Custom price overrides SSP in all order flows for that customer           |
| PRICE-06 | Time-Limited Discounts | % or ₹ discount with start/end date                                      |
| PRICE-07 | Customer App Display   | Customer sees only their applicable price (never other customers' prices) |

#### 6.5.3 Bulk Pricing Tiers (Phase 2)


| Req ID   | Feature         | Detail                                                       |
| -------- | --------------- | ------------------------------------------------------------ |
| PRICE-08 | Quantity Breaks | E.g., 1–50 boxes ₹100; 51–100 boxes ₹95; 100+ boxes ₹90 |
| PRICE-09 | Tier Display    | Customer app shows tier pricing table on product page        |

#### 6.5.4 Price Change Audit


| Req ID   | Feature   | Detail                                                                           |
| -------- | --------- | -------------------------------------------------------------------------------- |
| PRICE-10 | Price Log | All price changes: old value, new value, effective date, changed by, approved by |

---

### 6.6 Customer Management

#### 6.6.1 Customer Profile


| Req ID  | Feature            | Detail                                                                             |
| ------- | ------------------ | ---------------------------------------------------------------------------------- |
| CUST-01 | Profile Fields     | Name, Company (optional), Billing Address, Shipping Addresses, Phone, Email, GSTIN |
| CUST-02 | Customer ID        | Auto-generated: CUST-00123                                                         |
| CUST-03 | Account Type       | Individual / Business / Event Organizer                                            |
| CUST-04 | Self-Registration  | Via app: Phone OTP + profile completion                                            |
| CUST-05 | Admin Creation     | Admin creates customer; invite link sent to set password                           |
| CUST-06 | Block / Unblock    | Admin can suspend account; blocked customers cannot place orders                   |
| CUST-07 | Multiple Addresses | Customer can save multiple delivery addresses with labels (Home, Office, etc.)     |

#### 6.6.2 Customer Balance & Wallet


| Req ID  | Feature                  | Detail                                                            |
| ------- | ------------------------ | ----------------------------------------------------------------- |
| CUST-08 | Prepaid Wallet           | Customer can top-up wallet; orders deducted from balance          |
| CUST-09 | Wallet Top-Up            | Min ₹100; via Razorpay UPI/card; real-time balance update        |
| CUST-10 | Credit Account           | Business customers can have a credit limit (order now, pay later) |
| CUST-11 | Credit Limit Enforcement | Orders that exceed credit limit blocked; admin can override       |
| CUST-12 | Transaction Ledger       | Full history: date, order ref, debit/credit, balance after        |
| CUST-13 | Advance Balance          | Customer deposits advance; deducted per delivery                  |
| CUST-14 | Refunds                  | Admin issues refund → credited to wallet → logged               |

#### 6.6.3 Payment Terms


| Req ID  | Feature           | Detail                                                     |
| ------- | ----------------- | ---------------------------------------------------------- |
| CUST-15 | Immediate Payment | Default for individual customers                           |
| CUST-16 | Net 7/15/30 Days  | For approved business accounts; system tracks due invoices |
| CUST-17 | Overdue Tracking  | n8n auto-marks invoices as overdue; sends reminders        |

#### 6.6.4 Supervisor Association


| Req ID  | Feature            | Detail                                                          |
| ------- | ------------------ | --------------------------------------------------------------- |
| CUST-18 | Supervisor Link    | Customer linked to 1+ supervisors who can order on their behalf |
| CUST-19 | Supervisor Mapping | Managed by admin; many-to-many relationship                     |

---

### 6.7 Order Management

#### 6.7.1 Order Creation


| Req ID | Feature                | Detail                                                                                         |
| ------ | ---------------------- | ---------------------------------------------------------------------------------------------- |
| ORD-01 | Order Sources          | Customer App / Supervisor Portal / Admin Manual / Phone-in (admin)                             |
| ORD-02 | Order Fields           | Customer, Products (SKU, qty, unit price), Total, Delivery Address, Requested Date/Slot, Notes |
| ORD-03 | Inventory Validation   | Check finished goods stock; alert if insufficient                                              |
| ORD-04 | Backorder              | If stock insufficient: admin can override (backorder) or block order                           |
| ORD-05 | Credit Check           | Validates customer credit limit before accepting order                                         |
| ORD-06 | Bulk Order Handling    | Large qty orders (e.g., 500 boxes): system calculates total weight/volume for vehicle planning |
| ORD-07 | Reorder                | One-tap repeat of any past order                                                               |
| ORD-08 | Recurring/Subscription | Auto-generated orders for subscribed customers                                                 |

#### 6.7.2 Order Status Lifecycle

```
[Placed] 
    ↓
[Confirmed]  ← Admin confirms; stock reserved
    ↓
[Processing]  ← Being assembled / packed
    ↓
[Ready to Ship]  ← Packed, awaiting vehicle assignment
    ↓
[Assigned]  ← Vehicle + driver assigned
    ↓
[Dispatched]  ← Out for delivery; GPS tracking active
    ↓
[Delivered]  ← Driver confirms; proof recorded
    ↓ (post-delivery issue)
[Returned]  (Future Phase 2)

Any state before "Processing" → [Cancelled] by customer
Any state → [Cancelled] by admin (with reason)
```


| Status        | Triggered By     | Action                                           |
| ------------- | ---------------- | ------------------------------------------------ |
| Placed        | Customer/Admin   | Stock tentatively checked; notification sent     |
| Confirmed     | Admin            | Stock reserved; assembly triggered if needed     |
| Processing    | Admin/Auto       | Assembly/picking in progress                     |
| Ready to Ship | Admin            | Packed; appears in dispatch queue                |
| Assigned      | Delivery Manager | Driver + vehicle assigned; driver notified       |
| Dispatched    | Driver App       | GPS tracking starts; customer notified           |
| Delivered     | Driver App       | POD recorded; invoice generated; balance updated |
| Cancelled     | Customer/Admin   | Stock released; refund if prepaid                |
| Returned      | Admin (Phase 2)  | Stock re-evaluated; refund processed             |

#### 6.7.3 Order Editing & Cancellation


| Req ID | Feature               | Detail                                                 |
| ------ | --------------------- | ------------------------------------------------------ |
| ORD-09 | Customer Cancellation | Allowed before "Processing" status                     |
| ORD-10 | Admin Cancellation    | Allowed at any stage with mandatory reason             |
| ORD-11 | Order Edit            | Admin can edit before "Dispatched" (quantity, address) |
| ORD-12 | Cancellation Refund   | If prepaid: amount credited to wallet; logged          |

---

### 6.8 Delivery & Dispatch Management

#### 6.8.1 Delivery Assignment


| Req ID  | Feature                       | Detail                                                                       |
| ------- | ----------------------------- | ---------------------------------------------------------------------------- |
| DISP-01 | Dispatch Queue                | "Ready to Ship" orders displayed with weight/volume                          |
| DISP-02 | Manual Assignment             | Delivery Manager selects order(s) → assigns to driver + vehicle             |
| DISP-03 | Route Optimization Suggestion | System suggests grouping nearby deliveries using Google Maps Distance Matrix |
| DISP-04 | Multi-Order Route             | Multiple orders assigned to same driver as a route                           |
| DISP-05 | Reassignment                  | Transfer order to different driver before dispatch                           |
| DISP-06 | Driver Notification           | Push notification to driver on assignment                                    |
| DISP-07 | Bulk Assignment               | Select multiple orders; auto-distribute to available drivers by zone         |

#### 6.8.2 Dispatch Dashboard (Live)


| Req ID  | Feature                | Detail                                                                |
| ------- | ---------------------- | --------------------------------------------------------------------- |
| DISP-08 | Live Map               | All vehicles with real-time GPS positions (via Redis cached location) |
| DISP-09 | Order Progress Overlay | Each driver's current deliveries shown as pins on map                 |
| DISP-10 | Status Feed            | Live order status updates from all drivers                            |
| DISP-11 | ETA Display            | Estimated delivery time per pending order                             |

---

### 6.9 Fleet & Vehicle Management


| Req ID | Feature              | Detail                                                                                           |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------ |
| VEH-01 | Vehicle Profile      | Fields: Registration number, Type (truck/van/bike), Capacity (weight kg + volume litres), Status |
| VEH-02 | Vehicle Status       | Available / In-Transit / Maintenance / Inactive                                                  |
| VEH-03 | Unique Vehicle ID    | Auto-generated: VEH-001                                                                          |
| VEH-04 | Driver Assignment    | One driver assigned per vehicle per shift                                                        |
| VEH-05 | Capacity Enforcement | System warns if assigned orders exceed vehicle capacity                                          |
| VEH-06 | Maintenance Log      | Record maintenance events; vehicle unavailable during maintenance                                |

---

### 6.10 Reporting & Analytics

**Architecture Note:** All reports for > today use pre-aggregated summary tables (populated nightly by n8n). Never scans raw tables for historical reports.


| Req ID | Report                        | Time Range      | Source Table               |
| ------ | ----------------------------- | --------------- | -------------------------- |
| RPT-01 | Today's Summary (Live)        | Today           | raw orders (live)          |
| RPT-02 | Yesterday                     | Yesterday       | daily\_summary             |
| RPT-03 | Last 7 Days                   | Week            | daily\_summary             |
| RPT-04 | Last 30 Days                  | Month           | daily\_summary             |
| RPT-05 | Monthly Comparison            | Last 12 months  | monthly\_summary           |
| RPT-06 | Yearly Breakdown              | Last 5 years    | yearly\_summary            |
| RPT-07 | Customer Purchase History     | Any range       | customer\_monthly\_summary |
| RPT-08 | Driver Performance            | Any range       | partner\_daily\_summary    |
| RPT-09 | Product-Wise Sales            | Any range       | product\_monthly\_summary  |
| RPT-10 | Revenue vs Target             | Month/Year      | monthly\_summary + targets |
| RPT-11 | Inventory Valuation           | Current         | raw\_materials (live)      |
| RPT-12 | Stock Movement                | Date range      | stock\_ledger              |
| RPT-13 | Supplier Performance          | Date range      | purchase\_orders           |
| RPT-14 | Customer Ledger / Outstanding | Current         | invoices + payments        |
| RPT-15 | Cancellation Rate             | Date range      | daily\_summary             |
| RPT-16 | Custom Date Range             | Any (≤90 days) | daily\_summary             |
| RPT-17 | Export                        | All reports     | CSV + PDF                  |

---

### 6.11 Staff & Role Management


| Req ID   | Feature              | Detail                                                                     |
| -------- | -------------------- | -------------------------------------------------------------------------- |
| STAFF-01 | Create Staff Account | Admin creates; email invite sent                                           |
| STAFF-02 | Role Assignment      | Assign: Inventory Manager / Sales Manager / Delivery Manager / Admin Staff |
| STAFF-03 | Permission Scoping   | Each role has defined module access (see Role Matrix)                      |
| STAFF-04 | Deactivate Staff     | Soft delete; historical actions preserved                                  |
| STAFF-05 | 2FA Mandatory        | All admin accounts must enable TOTP                                        |

---

### 6.12 Audit Log


| Req ID   | Feature          | Detail                                                                                |
| -------- | ---------------- | ------------------------------------------------------------------------------------- |
| AUDIT-01 | Immutable Log    | Every significant action logged: order changes, pricing edits, stock adjustments      |
| AUDIT-02 | Log Fields       | Actor ID, Action, Entity Type, Entity ID, Old Value, New Value, IP Address, Timestamp |
| AUDIT-03 | Super Admin Only | Only Super Admin can view audit logs                                                  |
| AUDIT-04 | No Delete        | Audit records cannot be deleted by anyone                                             |
| AUDIT-05 | Export           | Export to CSV for compliance                                                          |

---

## 7. FUNCTIONAL REQUIREMENTS — CUSTOMER MOBILE APP

### 7.1 Authentication & Onboarding


| Req ID   | Feature                | Detail                                                       |
| -------- | ---------------------- | ------------------------------------------------------------ |
| CAUTH-01 | Registration           | Phone number + OTP; then email verification (optional)       |
| CAUTH-02 | Social Login           | Google / Apple sign-in (Phase 2)                             |
| CAUTH-03 | Profile Completion     | Name, address (map-based geocoding), preferred delivery slot |
| CAUTH-04 | Admin-Invited Customer | Receives invite link; sets password; app auto-logs in        |
| CAUTH-05 | Device Remember        | Option to stay logged in for 30 days                         |
| CAUTH-06 | Biometric Login        | Fingerprint / Face ID after first login                      |
| CAUTH-07 | OTP Expiry             | 5-minute expiry on all OTPs                                  |

### 7.2 Product Catalogue & Ordering


| Req ID  | Feature              | Detail                                                          |
| ------- | -------------------- | --------------------------------------------------------------- |
| CORD-01 | Product Browse       | Card grid with image, name, customer-specific price             |
| CORD-02 | Search & Filter      | Filter by size (500ml/1L/2L/5L/20L), type, price                |
| CORD-03 | Add to Cart          | Cart persists across app sessions                               |
| CORD-04 | Cart Management      | Edit quantity, remove items, running total shown                |
| CORD-05 | Checkout             | Address selection (multiple saved), slot picker, payment method |
| CORD-06 | Payment Methods      | Wallet balance, UPI, Credit/Debit card, Cash on Delivery        |
| CORD-07 | Order Confirmation   | Confirmation screen with order ID + summary; push + SMS sent    |
| CORD-08 | Reorder              | One-tap reorder from order history                              |
| CORD-09 | Special Instructions | Free text delivery note field                                   |

### 7.3 Payment & Wallet


| Req ID  | Feature             | Detail                                              |
| ------- | ------------------- | --------------------------------------------------- |
| CPAY-01 | Razorpay SDK        | In-app payment: UPI, cards, net banking via SDK     |
| CPAY-02 | Wallet Top-Up       | Min ₹100; online payment; real-time balance update |
| CPAY-03 | Transaction History | Date, order ref, debit/credit, running balance      |
| CPAY-04 | Payment Receipt     | Push + SMS on successful payment                    |
| CPAY-05 | Refund Visibility   | Refunds shown in transaction history with reference |

### 7.4 Real-Time Order Tracking & History


| Req ID    | Feature              | Detail                                                                            |
| --------- | -------------------- | --------------------------------------------------------------------------------- |
| CTRACK-01 | Active Orders Screen | All in-progress orders with status timeline                                       |
| CTRACK-02 | Live Map             | When dispatched: driver live location on Google Map + estimated route             |
| CTRACK-03 | WebSocket Connection | Connects to tracking room on "Dispatched" status; auto-disconnects on "Delivered" |
| CTRACK-04 | ETA Display          | Dynamic ETA based on driver distance and traffic                                  |
| CTRACK-05 | Driver Contact       | Tap to call driver (number shown when dispatched)                                 |
| CTRACK-06 | Order History        | All past orders; filter by date/status; expand for details                        |
| CTRACK-07 | Post-Delivery Rating | Optional 1–5 star rating + comment after delivery                                |

### 7.5 Push Notifications


| Trigger               | Message                                                  |
| --------------------- | -------------------------------------------------------- |
| Order Placed          | "Your order #ORD-123 has been placed ✓"                 |
| Order Confirmed       | "Order confirmed! Preparing your delivery."              |
| Dispatched            | "Your order is on the way! [Driver Name] is delivering." |
| Approaching           | "Driver is 5 mins away!" (Geofence trigger)              |
| Delivered             | "Order delivered! ✓ Rate your experience."              |
| Payment Received      | "Payment of ₹120 received. Receipt ready."              |
| Payment Overdue       | "Payment of ₹350 is overdue. Pay now."                  |
| Subscription Reminder | "Your subscription delivery is tomorrow."                |

---

## 8. FUNCTIONAL REQUIREMENTS — DRIVER DELIVERY APP

### 8.1 Authentication & Availability


| Req ID   | Feature           | Detail                                              |
| -------- | ----------------- | --------------------------------------------------- |
| DAUTH-01 | Login             | Company-provided credentials; no self-registration  |
| DAUTH-02 | Go Online/Offline | Toggle; heartbeat every 30s to server while online  |
| DAUTH-03 | Profile           | Assigned vehicle today, license info, shift details |

### 8.2 Delivery Task List & Route


| Req ID    | Feature         | Detail                                                                                    |
| --------- | --------------- | ----------------------------------------------------------------------------------------- |
| DROUTE-01 | Delivery List   | All deliveries for today's route, ordered by sequence                                     |
| DROUTE-02 | Order Card Info | Order ID, customer name, address, contact, items + qty, payment mode (COD/prepaid), notes |
| DROUTE-03 | Route Order     | Admin/system sets sequence; driver can view full route map                                |

### 8.3 Live Navigation & GPS Tracking


| Req ID  | Feature               | Detail                                                                      |
| ------- | --------------------- | --------------------------------------------------------------------------- |
| DGPS-01 | Start Navigation      | Opens Google Maps SDK turn-by-turn navigation                               |
| DGPS-02 | GPS Broadcast         | When delivery started: sends lat/lng every 8–10 seconds via WebSocket      |
| DGPS-03 | Foreground Service    | Android foreground service keeps GPS alive during delivery                  |
| DGPS-04 | Location to Redis     | Server stores latest position in Redis (TTL 60s) +`delivery_locations`table |
| DGPS-05 | Broadcast to Customer | Server pushes location via WebSocket to customer tracking screen            |
| DGPS-06 | Broadcast to Admin    | Same broadcast to admin dispatch dashboard                                  |
| DGPS-07 | Route Deviation Alert | Future: alert if driver deviates significantly from planned route           |
| DGPS-08 | Battery Optimization  | GPS duty-cycle: 8–10s intervals; wake-lock only during active delivery     |

### 8.4 Delivery Confirmation & Proof of Delivery (POD)


| Req ID  | Feature              | Detail                                                                               |
| ------- | -------------------- | ------------------------------------------------------------------------------------ |
| DPOD-01 | Geofence Auto-Detect | When within 100m of destination: "Arrived" prompt appears                            |
| DPOD-02 | Mark Arrived         | Driver taps "Arrived"; timestamp recorded                                            |
| DPOD-03 | POD: Photo           | Driver captures photo of delivered goods / recipient                                 |
| DPOD-04 | POD: OTP             | Customer receives 4-digit OTP; driver enters to confirm                              |
| DPOD-05 | POD: Signature       | Optional digital signature capture                                                   |
| DPOD-06 | COD Collection       | Driver records cash amount collected; validated against order total                  |
| DPOD-07 | Delivered            | On confirm: order → Delivered; customer notified; invoice generated; stock adjusted |
| DPOD-08 | Failed Delivery      | Driver selects reason (Not Home / Wrong Address / Refused / Other); adds notes       |
| DPOD-09 | Failed Outcome       | Order marked Failed; n8n notifies customer + admin; reschedule prompt sent           |

### 8.5 Driver Notifications


| Trigger              | Message                                                 |
| -------------------- | ------------------------------------------------------- |
| New Assignment       | "New delivery assigned to you: [Customer] at [Address]" |
| Order Detail Change  | "Order #ORD-X has been updated by admin"                |
| COD Reminder         | "Collect ₹120 cash for next delivery"                  |
| Shift Start Reminder | "Your shift starts in 30 minutes"                       |

---

## 9. FUNCTIONAL REQUIREMENTS — ASSIGNMENT APP

### 9.1 Dispatcher Functions


| Req ID  | Feature          | Detail                                                                                   |
| ------- | ---------------- | ---------------------------------------------------------------------------------------- |
| ASGN-01 | Login            | Supervisor / Delivery Manager credentials                                                |
| ASGN-02 | Live Map         | All drivers in real-time (green=free, yellow=busy, grey=offline) + unassigned order pins |
| ASGN-03 | Order Queue      | List of "Ready to Ship" orders; sortable by zone/time/priority                           |
| ASGN-04 | Driver Panel     | Driver list: status, current delivery count, zone                                        |
| ASGN-05 | Auto-Suggest     | Select order → see top 3 suggested drivers (zone match + lowest load)                   |
| ASGN-06 | Manual Assign    | Tap driver → confirm → order assigned                                                  |
| ASGN-07 | Bulk Assign      | Multi-select orders → auto-distribute by zone to available drivers                      |
| ASGN-08 | Reassign         | Move order from one driver to another (before dispatch)                                  |
| ASGN-09 | Capacity Warning | Alert if driver's assigned load exceeds vehicle capacity                                 |
| ASGN-10 | Shift Management | Driver check-in/out; shift summary                                                       |
| ASGN-11 | Zone Management  | Define delivery zones (polygon on map); assign zones to drivers                          |

---

## 10. FUNCTIONAL REQUIREMENTS — SUPERVISOR/AGENT PORTAL


| Req ID | Feature                     | Detail                                                                   |
| ------ | --------------------------- | ------------------------------------------------------------------------ |
| SUV-01 | Login                       | Unique supervisor credentials provisioned by admin                       |
| SUV-02 | Customer Portfolio          | Dashboard: all assigned customers, recent orders, balances               |
| SUV-03 | Order on Behalf             | Same order flow as customer app; dropdown to select managed customer     |
| SUV-04 | Customer-Specific Price     | Price retrieved is the customer's assigned price, not SSP                |
| SUV-05 | Balance Visibility          | View each customer's wallet balance and outstanding dues                 |
| SUV-06 | Order History               | View order history for all managed customers                             |
| SUV-07 | Payment Collection (Future) | Record cash collected from customer; request admin ledger update         |
| SUV-08 | Platform                    | Light web app OR integrated into admin panel with supervisor role toggle |

# 

---
## 11. DATABASE SCHEMA — SUPABASE (PostgreSQL)

### 11.1 Core / Transactional Tables

```sql
-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN (
                    'customer','driver','dispatcher','supervisor',
                    'inventory_manager','sales_manager','delivery_manager',
                    'admin','super_admin')),
  full_name       TEXT NOT NULL,
  phone           TEXT UNIQUE NOT NULL,
  email           TEXT,
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  is_verified     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS (extended info)
-- ============================================================
CREATE TABLE public.customers (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id),
  customer_code   TEXT UNIQUE NOT NULL,   -- CUST-00123
  account_type    TEXT DEFAULT 'individual' CHECK (account_type IN
                    ('individual','business','event_organizer')),
  company_name    TEXT,
  gstin           TEXT,
  advance_balance NUMERIC(10,2) DEFAULT 0.00,
  credit_limit    NUMERIC(10,2) DEFAULT 0.00,
  total_due       NUMERIC(10,2) DEFAULT 0.00,
  payment_terms   TEXT DEFAULT 'immediate'
                  CHECK (payment_terms IN ('immediate','net7','net15','net30')),
  preferred_slot  TEXT,
  notes           TEXT,
  registered_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DELIVERY ADDRESSES
-- ============================================================
CREATE TABLE public.addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID REFERENCES public.customers(id),
  label           TEXT DEFAULT 'Home',
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  city            TEXT NOT NULL,
  pincode         TEXT NOT NULL,
  state           TEXT NOT NULL,
  latitude        NUMERIC(10,8),
  longitude       NUMERIC(11,8),
  zone_id         UUID REFERENCES public.delivery_zones(id),
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DELIVERY ZONES
-- ============================================================
CREATE TABLE public.delivery_zones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  polygon         JSONB,   -- GeoJSON polygon
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE public.suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code   TEXT UNIQUE NOT NULL,  -- SUP-001
  name            TEXT NOT NULL,
  contact_person  TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  gst_number      TEXT,
  payment_terms   TEXT,
  bank_details    JSONB,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RAW MATERIALS
-- ============================================================
CREATE TABLE public.raw_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT UNIQUE NOT NULL,   -- BOT-1L-CLR, CAP-STD-RED
  name            TEXT NOT NULL,
  material_type   TEXT NOT NULL CHECK (material_type IN
                    ('bottle','cap','label','packaging','other')),
  unit_of_measure TEXT NOT NULL DEFAULT 'piece',
  specifications  JSONB,   -- dimensions, colour, size, etc.
  current_cost    NUMERIC(10,4) DEFAULT 0,
  costing_method  TEXT DEFAULT 'weighted_avg'
                  CHECK (costing_method IN ('fifo','weighted_avg')),
  stock_qty       INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,   -- reorder threshold
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MATERIAL-SUPPLIER (Many-to-Many)
-- ============================================================
CREATE TABLE public.material_suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id     UUID NOT NULL REFERENCES public.raw_materials(id),
  supplier_id     UUID NOT NULL REFERENCES public.suppliers(id),
  unit_cost       NUMERIC(10,4) NOT NULL,
  lead_time_days  INTEGER,
  min_order_qty   INTEGER DEFAULT 1,
  is_preferred    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(material_id, supplier_id)
);

-- ============================================================
-- COMPATIBILITY RULES (BOM enforcement)
-- ============================================================
CREATE TABLE public.compatibility_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottle_sku      TEXT NOT NULL REFERENCES public.raw_materials(sku),
  cap_sku         TEXT NOT NULL REFERENCES public.raw_materials(sku),
  label_sku       TEXT REFERENCES public.raw_materials(sku),
  is_compatible   BOOLEAN NOT NULL DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
CREATE TABLE public.purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number       TEXT UNIQUE NOT NULL,   -- PO-20260503-001
  supplier_id     UUID NOT NULL REFERENCES public.suppliers(id),
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','approved','shipped','received','cancelled')),
  total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  expected_date   DATE,
  received_date   DATE,
  notes           TEXT,
  created_by      UUID REFERENCES public.profiles(id),
  approved_by     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PURCHASE ORDER ITEMS
-- ============================================================
CREATE TABLE public.purchase_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id           UUID NOT NULL REFERENCES public.purchase_orders(id),
  material_id     UUID NOT NULL REFERENCES public.raw_materials(id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost       NUMERIC(10,4) NOT NULL,
  line_total      NUMERIC(12,2) NOT NULL,
  received_qty    INTEGER DEFAULT 0
);

-- ============================================================
-- STOCK LEDGER (Audit trail for every stock movement)
-- ============================================================
CREATE TABLE public.stock_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id     UUID NOT NULL REFERENCES public.raw_materials(id),
  quantity_change INTEGER NOT NULL,  -- positive = in, negative = out
  reason          TEXT NOT NULL CHECK (reason IN (
                    'po_receipt','assembly_deduction','adjustment',
                    'wastage','return','correction')),
  reference_type  TEXT,   -- 'purchase_order', 'assembly_order', 'adjustment'
  reference_id    UUID,
  balance_after   INTEGER NOT NULL,
  performed_by    UUID REFERENCES public.profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS (Finished goods)
-- ============================================================
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT UNIQUE NOT NULL,   -- FP-1L-PREM
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT,   -- '500ml','1L','2L','5L','20L'
  packaging_unit  INTEGER DEFAULT 1,  -- 1 for single, 12 for box of 12
  unit_label      TEXT DEFAULT 'bottle',
  base_price      NUMERIC(10,2) NOT NULL,
  gst_percent     NUMERIC(4,2) DEFAULT 0,
  hsn_code        TEXT,
  image_url       TEXT,
  finished_stock  INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BILL OF MATERIALS
-- ============================================================
CREATE TABLE public.product_bom (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  material_id     UUID NOT NULL REFERENCES public.raw_materials(id),
  quantity_per_unit NUMERIC(10,4) NOT NULL,
  version         INTEGER NOT NULL DEFAULT 1,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, material_id, version)
);

-- ============================================================
-- COST VERSIONS (Computed cost snapshots)
-- ============================================================
CREATE TABLE public.cost_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  version         INTEGER NOT NULL,
  material_cost   NUMERIC(10,4) NOT NULL,
  overhead_cost   NUMERIC(10,4) DEFAULT 0,
  total_cost      NUMERIC(10,4) NOT NULL,
  effective_date  DATE NOT NULL,
  is_active       BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, version)
);

-- ============================================================
-- ASSEMBLY ORDERS
-- ============================================================
CREATE TABLE public.assembly_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_number TEXT UNIQUE NOT NULL,   -- ASM-20260503-001
  product_id      UUID NOT NULL REFERENCES public.products(id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  status          TEXT DEFAULT 'planned'
                  CHECK (status IN ('planned','in_progress','completed','cancelled')),
  bom_version     INTEGER NOT NULL,
  assembled_by    UUID REFERENCES public.profiles(id),
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER PRICING (Overrides base_price)
-- ============================================================
CREATE TABLE public.customer_pricing (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID REFERENCES public.customers(id),
  customer_group  TEXT,  -- for group-level pricing
  product_id      UUID NOT NULL REFERENCES public.products(id),
  custom_price    NUMERIC(10,2) NOT NULL,
  discount_type   TEXT CHECK (discount_type IN ('percent','absolute')),
  discount_value  NUMERIC(10,2),
  valid_from      DATE,
  valid_to        DATE,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- ============================================================
-- PRICE CHANGE AUDIT
-- ============================================================
CREATE TABLE public.price_change_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  customer_id     UUID REFERENCES public.customers(id),
  old_price       NUMERIC(10,2),
  new_price       NUMERIC(10,2) NOT NULL,
  effective_date  DATE NOT NULL,
  changed_by      UUID REFERENCES public.profiles(id),
  approved_by     UUID REFERENCES public.profiles(id),
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE public.vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_code    TEXT UNIQUE NOT NULL,   -- VEH-001
  registration    TEXT UNIQUE NOT NULL,
  vehicle_type    TEXT NOT NULL CHECK (vehicle_type IN ('truck','van','auto','bike')),
  capacity_kg     NUMERIC(8,2),
  capacity_litres NUMERIC(8,2),
  status          TEXT DEFAULT 'available'
                  CHECK (status IN ('available','in_transit','maintenance','inactive')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DRIVERS (extended partner info)
-- ============================================================
CREATE TABLE public.drivers (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id),
  driver_code     TEXT UNIQUE NOT NULL,   -- DRV-001
  license_number  TEXT,
  vehicle_id      UUID REFERENCES public.vehicles(id),
  zone_ids        UUID[],
  max_daily_load  INTEGER DEFAULT 30,
  is_online       BOOLEAN DEFAULT FALSE,
  current_lat     NUMERIC(10,8),
  current_lng     NUMERIC(11,8),
  last_location_at TIMESTAMPTZ,
  total_earnings  NUMERIC(10,2) DEFAULT 0.00,
  joined_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,   -- ORD-20260503-0001
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  address_id      UUID NOT NULL REFERENCES public.addresses(id),
  driver_id       UUID REFERENCES public.drivers(id),
  vehicle_id      UUID REFERENCES public.vehicles(id),
  dispatcher_id   UUID REFERENCES public.profiles(id),
  created_by_role TEXT,  -- 'customer', 'supervisor', 'admin'
  
  status          TEXT NOT NULL DEFAULT 'placed'
                  CHECK (status IN ('placed','confirmed','processing',
                                    'ready_to_ship','assigned','dispatched',
                                    'delivered','failed','cancelled','returned')),
  
  scheduled_date  DATE NOT NULL,
  scheduled_slot  TEXT CHECK (scheduled_slot IN ('morning','afternoon','evening','any')),
  
  subtotal        NUMERIC(10,2) NOT NULL,
  gst_amount      NUMERIC(10,2) DEFAULT 0,
  discount        NUMERIC(10,2) DEFAULT 0,
  total_amount    NUMERIC(10,2) NOT NULL,
  total_weight_kg NUMERIC(8,2),   -- for vehicle planning
  total_volume_l  NUMERIC(8,2),
  
  payment_status  TEXT DEFAULT 'pending'
                  CHECK (payment_status IN ('pending','paid','partial','refunded')),
  payment_method  TEXT CHECK (payment_method IN ('cash','online','wallet','advance','credit')),
  
  delivery_notes  TEXT,
  failure_reason  TEXT,
  cancel_reason   TEXT,
  
  placed_at       TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at    TIMESTAMPTZ,
  processing_at   TIMESTAMPTZ,
  ready_at        TIMESTAMPTZ,
  assigned_at     TIMESTAMPTZ,
  dispatched_at   TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  
  proof_photo_url TEXT,
  proof_otp       TEXT,
  is_proof_verified BOOLEAN DEFAULT FALSE,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  product_name    TEXT NOT NULL,     -- snapshot at order time
  product_sku     TEXT NOT NULL,
  unit_price      NUMERIC(10,2) NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  line_total      NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- DELIVERY TRACKING (GPS history)
-- ============================================================
CREATE TABLE public.delivery_locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id),
  driver_id       UUID NOT NULL REFERENCES public.drivers(id),
  latitude        NUMERIC(10,8) NOT NULL,
  longitude       NUMERIC(11,8) NOT NULL,
  speed           NUMERIC(6,2),
  recorded_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_delivery_locations_order ON delivery_locations(order_id, recorded_at DESC);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT UNIQUE NOT NULL,   -- INV-20260503-0001
  order_id        UUID REFERENCES public.orders(id),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,
  subtotal        NUMERIC(10,2) NOT NULL,
  gst_amount      NUMERIC(10,2) DEFAULT 0,
  discount        NUMERIC(10,2) DEFAULT 0,
  total_amount    NUMERIC(10,2) NOT NULL,
  amount_paid     NUMERIC(10,2) DEFAULT 0,
  amount_due      NUMERIC(10,2),
  status          TEXT DEFAULT 'unpaid'
                  CHECK (status IN ('unpaid','partial','paid','overdue','cancelled')),
  pdf_url         TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID REFERENCES public.invoices(id),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  amount          NUMERIC(10,2) NOT NULL,
  payment_method  TEXT NOT NULL,
  gateway_ref     TEXT,    -- Razorpay payment ID
  gateway_status  TEXT,
  collected_by    UUID REFERENCES public.profiles(id),
  payment_date    TIMESTAMPTZ DEFAULT NOW(),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WALLET TRANSACTIONS
-- ============================================================
CREATE TABLE public.wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  order_id        UUID REFERENCES public.orders(id),
  type            TEXT NOT NULL CHECK (type IN ('topup','deduction','refund','adjustment')),
  amount          NUMERIC(10,2) NOT NULL,
  balance_after   NUMERIC(10,2) NOT NULL,
  gateway_ref     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE public.subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  plan_name       TEXT NOT NULL,
  product_id      UUID REFERENCES public.products(id),
  quantity_per_delivery INTEGER NOT NULL,
  frequency       TEXT NOT NULL CHECK (frequency IN ('daily','alternate','weekly','custom')),
  custom_days     INTEGER[],
  delivery_slot   TEXT,
  start_date      DATE NOT NULL,
  end_date        DATE,
  price_per_delivery NUMERIC(10,2) NOT NULL,
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active','paused','cancelled','expired')),
  next_delivery   DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUPERVISOR-CUSTOMER MAPPING
-- ============================================================
CREATE TABLE public.supervisor_customer_map (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id   UUID NOT NULL REFERENCES public.profiles(id),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supervisor_id, customer_id)
);

-- ============================================================
-- NOTIFICATIONS LOG
-- ============================================================
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES public.profiles(id),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            TEXT,
  data            JSONB,
  is_read         BOOLEAN DEFAULT FALSE,
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG (Immutable)
-- ============================================================
CREATE TABLE public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES public.profiles(id),
  action          TEXT NOT NULL,
  entity_type     TEXT,
  entity_id       UUID,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```
---
### 11.2 Aggregation Tables (Pre-Computed — Never Direct User Queries)

```sql
-- ============================================================
-- DAILY SUMMARY (Populated nightly by n8n at 00:30)
-- ============================================================
CREATE TABLE public.daily_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_date    DATE NOT NULL UNIQUE,
  total_orders    INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count    INTEGER DEFAULT 0,
  cancelled_count INTEGER DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,
  cash_collected  NUMERIC(12,2) DEFAULT 0,
  online_collected NUMERIC(12,2) DEFAULT 0,
  gst_collected   NUMERIC(12,2) DEFAULT 0,
  new_customers   INTEGER DEFAULT 0,
  active_drivers  INTEGER DEFAULT 0,
  avg_delivery_time_mins INTEGER,
  total_units_delivered INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MONTHLY SUMMARY
-- ============================================================
CREATE TABLE public.monthly_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_orders    INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count    INTEGER DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,
  cash_collected  NUMERIC(12,2) DEFAULT 0,
  online_collected NUMERIC(12,2) DEFAULT 0,
  gst_collected   NUMERIC(12,2) DEFAULT 0,
  new_customers   INTEGER DEFAULT 0,
  churned_customers INTEGER DEFAULT 0,
  total_active_customers INTEGER DEFAULT 0,
  best_selling_product_id UUID REFERENCES public.products(id),
  raw_material_cost NUMERIC(12,2) DEFAULT 0,
  gross_margin    NUMERIC(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

-- ============================================================
-- YEARLY SUMMARY
-- ============================================================
CREATE TABLE public.yearly_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year            INTEGER NOT NULL UNIQUE,
  total_orders    INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  total_revenue   NUMERIC(14,2) DEFAULT 0,
  gst_collected   NUMERIC(12,2) DEFAULT 0,
  new_customers   INTEGER DEFAULT 0,
  total_active_customers INTEGER DEFAULT 0,
  avg_monthly_revenue NUMERIC(12,2),
  total_raw_material_cost NUMERIC(14,2) DEFAULT 0,
  gross_profit    NUMERIC(14,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER MONTHLY SUMMARY
-- ============================================================
CREATE TABLE public.customer_monthly_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  order_count     INTEGER DEFAULT 0,
  total_units     INTEGER DEFAULT 0,
  total_spent     NUMERIC(10,2) DEFAULT 0,
  total_paid      NUMERIC(10,2) DEFAULT 0,
  balance_due     NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, year, month)
);

-- ============================================================
-- DRIVER DAILY SUMMARY
-- ============================================================
CREATE TABLE public.driver_daily_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id       UUID NOT NULL REFERENCES public.drivers(id),
  summary_date    DATE NOT NULL,
  total_assigned  INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed    INTEGER DEFAULT 0,
  cash_collected  NUMERIC(10,2) DEFAULT 0,
  avg_delivery_mins INTEGER,
  km_traveled     NUMERIC(8,2),
  earnings        NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, summary_date)
);

-- ============================================================
-- PRODUCT MONTHLY SUMMARY
-- ============================================================
CREATE TABLE public.product_monthly_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL,
  units_sold      INTEGER DEFAULT 0,
  revenue         NUMERIC(10,2) DEFAULT 0,
  material_cost   NUMERIC(10,2) DEFAULT 0,
  gross_margin    NUMERIC(10,2) DEFAULT 0,
  UNIQUE(product_id, year, month)
);
```

### 11.3 Critical Indexes

```sql
-- Orders
CREATE INDEX idx_orders_customer_date ON orders(customer_id, scheduled_date);
CREATE INDEX idx_orders_driver_status ON orders(driver_id, status);
CREATE INDEX idx_orders_status_date ON orders(status, scheduled_date);

-- Stock
CREATE INDEX idx_stock_ledger_material ON stock_ledger(material_id, created_at DESC);
CREATE INDEX idx_raw_materials_type ON raw_materials(material_type);

-- Aggregation tables
CREATE INDEX idx_daily_summary_date ON daily_summary(summary_date);
CREATE INDEX idx_monthly_summary_ym ON monthly_summary(year, month);
CREATE INDEX idx_customer_monthly ON customer_monthly_summary(customer_id, year, month);
CREATE INDEX idx_driver_daily ON driver_daily_summary(driver_id, summary_date);

-- GPS
CREATE INDEX idx_delivery_locations_order ON delivery_locations(order_id, recorded_at DESC);
```

---

## 12. ROW-LEVEL SECURITY (RLS) POLICIES

### 12.1 Enable RLS on All Tables

```sql
DO $$ 
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE public.' || tbl || ' ENABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;
```

### 12.2 Helper Functions

```sql
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin','super_admin') FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin','super_admin','inventory_manager','sales_manager',
                  'delivery_manager','dispatcher','supervisor')
  FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_driver_or_above()
RETURNS BOOLEAN AS $$
  SELECT role NOT IN ('customer') FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```

### 12.3 Key RLS Policies

```sql
-- PROFILES: own profile + admin sees all
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_staff());

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- ORDERS: customer sees own; driver sees assigned; staff sees all
CREATE POLICY "orders_select" ON public.orders FOR SELECT
USING (
  customer_id = (SELECT id FROM customers WHERE id = auth.uid())
  OR driver_id = auth.uid()
  OR public.is_staff()
);

CREATE POLICY "orders_insert" ON public.orders FOR INSERT
WITH CHECK (
  customer_id = (SELECT id FROM customers WHERE id = auth.uid())
  OR public.is_staff()
);

CREATE POLICY "orders_update" ON public.orders FOR UPDATE
USING (
  (driver_id = auth.uid() AND public.get_my_role() = 'driver')
  OR public.is_staff()
);

-- RAW MATERIALS: staff only
CREATE POLICY "raw_materials_select" ON public.raw_materials FOR SELECT
USING (public.is_staff());

CREATE POLICY "raw_materials_write" ON public.raw_materials FOR ALL
USING (public.get_my_role() IN ('inventory_manager','admin','super_admin'));

-- SUPPLIERS: inventory manager + admin only
CREATE POLICY "suppliers_all" ON public.suppliers FOR ALL
USING (public.get_my_role() IN ('inventory_manager','admin','super_admin'));

-- PRODUCTS: customers can read active products; staff full access
CREATE POLICY "products_customer_read" ON public.products FOR SELECT
USING (is_active = TRUE OR public.is_staff());

CREATE POLICY "products_staff_write" ON public.products FOR ALL
USING (public.is_staff());

-- CUSTOMER_PRICING: customer sees own; sales + admin full
CREATE POLICY "pricing_select" ON public.customer_pricing FOR SELECT
USING (customer_id = auth.uid() OR public.is_staff());

-- INVOICES: customer sees own; admin sees all
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

-- WALLET_TRANSACTIONS: own only (or admin)
CREATE POLICY "wallet_own" ON public.wallet_transactions FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

-- DELIVERY_LOCATIONS: driver inserts own; admin reads all; customer reads for own order
CREATE POLICY "locations_insert" ON public.delivery_locations FOR INSERT
WITH CHECK (driver_id = auth.uid() AND public.get_my_role() = 'driver');

CREATE POLICY "locations_select" ON public.delivery_locations FOR SELECT
USING (
  public.is_admin()
  OR driver_id = auth.uid()
  OR order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
);

-- SUMMARY TABLES: admin read; service_role write (n8n)
CREATE POLICY "admin_read_summaries" ON public.daily_summary FOR SELECT
USING (public.is_admin());

CREATE POLICY "service_write_daily" ON public.daily_summary FOR ALL
USING (auth.role() = 'service_role');

-- Similarly for monthly_summary, yearly_summary, customer_monthly_summary, etc.

-- AUDIT LOGS: super_admin read only; service_role insert
CREATE POLICY "super_admin_audit" ON public.audit_logs FOR SELECT
USING (public.get_my_role() = 'super_admin');

CREATE POLICY "service_insert_audit" ON public.audit_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- CUSTOMER OWN MONTHLY SUMMARY
CREATE POLICY "customer_own_summary" ON public.customer_monthly_summary FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

-- DRIVER OWN DAILY SUMMARY
CREATE POLICY "driver_own_summary" ON public.driver_daily_summary FOR SELECT
USING (driver_id = auth.uid() OR public.is_admin());
```

---

## 13. PERFORMANCE & DATA AGGREGATION STRATEGY

### 13.1 The Core Problem & Solution

**Problem:** Scanning 1–5 years of raw order data for analytics:

* 10,000 customers × 365 days × 5 years = \~18M+ rows to scan
* Multiple concurrent admins = server overload
* Live calculation = unacceptable latency

**Solution: CQRS + Pre-Aggregation**


| Query Type                          | Source                             | Latency |
| ----------------------------------- | ---------------------------------- | ------- |
| Today's live orders                 | raw`orders`table                   | \~100ms |
| Yesterday's report                  | `daily_summary`(1 row)             | < 20ms  |
| Last 30 days                        | `daily_summary`(30 rows)           | < 50ms  |
| Last 12 months                      | `monthly_summary`(12 rows)         | < 30ms  |
| Last 5 years                        | `yearly_summary`(5 rows)           | < 10ms  |
| Customer billing history (6 months) | `customer_monthly_summary`(6 rows) | < 30ms  |

### 13.2 Aggregation Schedule


| Job                          | Schedule              | Action                                               |
| ---------------------------- | --------------------- | ---------------------------------------------------- |
| `aggregate_daily`            | Daily 00:30 AM        | Yesterday's raw orders →`daily_summary`             |
| `aggregate_driver_daily`     | Daily 00:45 AM        | Yesterday's driver stats →`driver_daily_summary`    |
| `aggregate_customer_monthly` | 1st of month 01:30 AM | Last month per-customer →`customer_monthly_summary` |
| `rollup_monthly`             | 1st of month 01:00 AM | Last month's daily\_summary →`monthly_summary`      |
| `aggregate_product_monthly`  | 1st of month 02:00 AM | Last month product sales →`product_monthly_summary` |
| `rollup_yearly`              | Jan 1st 02:00 AM      | Last year's monthly\_summary →`yearly_summary`      |
| `database_backup`            | Daily 02:30 AM        | Full backup via Supabase Management API              |

### 13.3 Aggregation SQL (Run via n8n → Supabase Edge Function)

```sql
-- DAILY AGGREGATION
INSERT INTO public.daily_summary (
  summary_date, total_orders, delivered_count, failed_count, cancelled_count,
  total_revenue, cash_collected, online_collected, gst_collected,
  new_customers, active_drivers, avg_delivery_time_mins, total_units_delivered
)
SELECT
  CURRENT_DATE - INTERVAL '1 day'                                      AS summary_date,
  COUNT(*)                                                              AS total_orders,
  COUNT(*) FILTER (WHERE status = 'delivered')                         AS delivered_count,
  COUNT(*) FILTER (WHERE status = 'failed')                            AS failed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled')                         AS cancelled_count,
  COALESCE(SUM(total_amount) FILTER (WHERE status='delivered'), 0)     AS total_revenue,
  COALESCE(SUM(total_amount) FILTER (WHERE payment_method='cash'
                                    AND status='delivered'), 0)        AS cash_collected,
  COALESCE(SUM(total_amount) FILTER (WHERE payment_method IN
                                   ('online','wallet') AND status='delivered'), 0) AS online_collected,
  COALESCE(SUM(gst_amount) FILTER (WHERE status='delivered'), 0)       AS gst_collected,
  (SELECT COUNT(*) FROM customers WHERE DATE(registered_at) =
    CURRENT_DATE - INTERVAL '1 day')                                   AS new_customers,
  COUNT(DISTINCT driver_id) FILTER (WHERE status IN ('delivered','failed')) AS active_drivers,
  AVG(EXTRACT(EPOCH FROM (delivered_at - dispatched_at))/60)
    FILTER (WHERE status='delivered')::INTEGER                         AS avg_delivery_time_mins,
  COALESCE((SELECT SUM(oi.quantity) FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status='delivered'
            AND o.scheduled_date = CURRENT_DATE - INTERVAL '1 day'), 0) AS total_units_delivered
FROM public.orders
WHERE scheduled_date = CURRENT_DATE - INTERVAL '1 day'
ON CONFLICT (summary_date) DO UPDATE SET
  total_orders    = EXCLUDED.total_orders,
  delivered_count = EXCLUDED.delivered_count,
  failed_count    = EXCLUDED.failed_count,
  total_revenue   = EXCLUDED.total_revenue,
  updated_at      = NOW();

-- MONTHLY ROLLUP
INSERT INTO public.monthly_summary (year, month, total_orders, delivered_count,
  failed_count, total_revenue, cash_collected, online_collected, gst_collected, new_customers)
SELECT
  EXTRACT(YEAR  FROM summary_date)::INTEGER AS year,
  EXTRACT(MONTH FROM summary_date)::INTEGER AS month,
  SUM(total_orders), SUM(delivered_count), SUM(failed_count),
  SUM(total_revenue), SUM(cash_collected), SUM(online_collected),
  SUM(gst_collected), SUM(new_customers)
FROM public.daily_summary
WHERE DATE_TRUNC('month', summary_date) =
      DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
GROUP BY 1, 2
ON CONFLICT (year, month) DO UPDATE SET
  total_revenue = EXCLUDED.total_revenue,
  updated_at    = NOW();
```

---

## 14. n8n AUTOMATION WORKFLOWS

### 14.1 Workflow 1: Nightly Data Aggregation

```
TRIGGER: Cron (00:30 AM daily)
  ↓
HTTP POST → /edge/aggregate-daily (Supabase Edge Fn)
  ↓
HTTP POST → /edge/aggregate-driver-daily
  ↓
IF success:
  → Supabase INSERT: audit_log "aggregation_success"
  → Email Node → Admin: "Daily report ready for [date]"
  → Check if 1st of month:
    → HTTP POST /edge/rollup-monthly
    → HTTP POST /edge/aggregate-customer-monthly
    → HTTP POST /edge/aggregate-product-monthly
  → Check if Jan 1st:
    → HTTP POST /edge/rollup-yearly
IF failure:
  → Email Alert → Admin (with error details)
  → Slack/Telegram alert (critical channel)
  → Retry after 30 minutes (up to 3 retries)
```

### 14.2 Workflow 2: Order Notification Pipeline

```
TRIGGER: Supabase Webhook (orders row UPDATE)
  ↓
Switch Node: orders.status
  ↓
  "placed"     → FCM push to customer + SMS
  "confirmed"  → FCM push to customer
  "assigned"   → FCM push to driver (delivery details)
               + FCM push to customer (partner assigned)
  "dispatched" → FCM push to customer (tracking starts)
               + Activate GPS tracking session
  "delivered"  → FCM push to customer + SMS receipt
               → Trigger Invoice Generation Workflow
  "failed"     → FCM push to customer + admin alert
               → Trigger Reschedule Prompt Workflow
  "cancelled"  → FCM push to customer
               → If prepaid: Trigger Refund Workflow
```

### 14.3 Workflow 3: Invoice Auto-Generation

```
TRIGGER: Order status = "delivered" (via Webhook)
  ↓
HTTP POST → /edge/generate-invoice (creates invoice record)
  ↓
Generate PDF (n8n PDF node or external)
  ↓
HTTP POST → Supabase Storage (upload PDF)
  ↓
PATCH invoice.pdf_url in DB
  ↓
FCM push → "Invoice ready - Download now"
  ↓
IF payment_method = 'cash':
  → Create receivable record
  → SMS to customer: "Pay ₹X for order #ORD-..."
IF payment_method = 'online':
  → POST → Razorpay: create payment link
  → SMS + FCM: "Pay now: [link]"
```

### 14.4 Workflow 4: Stock Alert Monitor

```
TRIGGER: Cron (Daily 09:00 AM)
  ↓
Supabase Query:
  SELECT * FROM raw_materials
  WHERE stock_qty <= min_stock_level AND is_active = TRUE
  ↓
For each low-stock material:
  → Email Inventory Manager: "Low stock: [Material] — [qty] remaining"
  → Insert notification for Inventory Manager in app
  → IF stock = 0: CRITICAL alert to Super Admin
```

### 14.5 Workflow 5: Overdue Payment Reminders

```
TRIGGER: Cron (Daily 10:00 AM)
  ↓
Query: SELECT invoices WHERE status IN ('unpaid','overdue') AND due_date < NOW()
  ↓
For each overdue invoice:
  → UPDATE invoice.status = 'overdue'
  → FCM push to customer: "Payment overdue: ₹X"
  → SMS with payment link
  ↓
IF overdue > 7 days:
  → Email Sales Manager: customer escalation list
IF overdue > 30 days:
  → Flag customer for credit limit review
```

### 14.6 Workflow 6: Subscription Auto-Order Generator

```
TRIGGER: Cron (Daily 06:00 AM)
  ↓
Query: SELECT * FROM subscriptions
       WHERE status='active' AND next_delivery = CURRENT_DATE
  ↓
For each due subscription:
  → Create order record (auto-insert with status 'placed')
  → FCM push to customer: "Subscription order placed ✓"
  → Update subscription.next_delivery to next applicable date
  → Check finished goods stock; alert if insufficient
```

### 14.7 Workflow 7: Database Backup

```
TRIGGER: Cron (Daily 02:30 AM)
  ↓
HTTP → Supabase Management API: create backup
  ↓
IF success:
  → Store backup metadata in audit_logs
  → Email admin: "Backup complete — [date]"
  → List backups older than 30 days → delete
IF failure:
  → Immediate email + Slack alert to admin
```

### 14.8 Workflow 8: GPS Location Update (Real-Time)

```
TRIGGER: Webhook POST from Driver App (every 8–10s when online)
  ↓
Validate driver JWT
  ↓
Redis SET: driver:{id}:location = {lat, lng, timestamp} TTL=60s
  ↓
Supabase INSERT: delivery_locations (lat, lng, order_id, driver_id, timestamp)
  ↓
UPDATE drivers: current_lat, current_lng, last_location_at
  ↓
Supabase Realtime BROADCAST:
  → channel: order:{order_id} → Customer App (tracking screen)
  → channel: dispatch:live    → Assignment App (dispatcher map)
```

### 14.9 Workflow 9: Cost Change Alert

```
TRIGGER: Supabase Webhook (raw_materials UPDATE on current_cost)
  ↓
Query: all products whose BOM includes this material
  ↓
Recalculate product cost for each affected product
  ↓
Create new cost_version record
  ↓
Email Sales Manager + Inventory Manager:
  "Raw material cost changed: [Material]
   Affected products: [list]
   New costs: [breakdown]
   Review selling prices!"
```

---

## 15. SECURITY ARCHITECTURE

### 15.1 Authentication Security


| Feature                | Implementation                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Customer Auth          | Phone OTP via Supabase Auth + Twilio/TextLocal                                               |
| Admin Auth             | Email + Password + TOTP 2FA mandatory                                                        |
| JWT Tokens             | Access: 15 min expiry; Refresh: 7 days (HTTP-only cookies for web, SecureStorage for mobile) |
| Refresh Token Rotation | Enabled in Supabase; old token invalidated on use                                            |
| Account Lockout        | 5 failed attempts → 15 min cooldown                                                         |
| Device Tracking        | device\_id per session stored                                                                |
| OTP Expiry             | 5 minutes                                                                                    |

### 15.2 API Security

```
All API Calls:
  ✅ HTTPS / TLS 1.3 minimum
  ✅ JWT Bearer token required (except: product list, registration)
  ✅ Rate limiting: 100 req/min per IP (Supabase edge config)
  ✅ CORS: whitelist app domains + admin domain only
  ✅ Input validation on all Edge Functions (Zod schema)
  ✅ SQL injection prevention: parameterized queries / ORM only
  ✅ XSS prevention: sanitize all text inputs
  ✅ Role-based middleware on every endpoint (RBAC)
```

### 15.3 Data Security

```
Sensitive fields encrypted at rest (AES-256):
  - payments.gateway_ref
  - drivers.license_number
  - suppliers.bank_details (JSONB field encrypted)
  - customers.gstin

Supabase Storage Security:
  - Invoice PDFs: private bucket; signed URLs, 1-hour expiry
  - Delivery proof photos: private; accessible by driver + admin only
  - Product images: public CDN bucket

PCI-DSS Compliance:
  - Payment card data NEVER stored on our servers
  - Razorpay SDK handles all card data
  - Only gateway token + payment_id stored
  - All payment secrets server-side only
```

### 15.4 Mobile App Security


| Measure                  | Detail                                    |
| ------------------------ | ----------------------------------------- |
| Certificate Pinning      | Prevent MITM attacks                      |
| Jailbreak/Root Detection | Alert and restrict on compromised devices |
| Local Data Encryption    | flutter\_secure\_storage for tokens       |
| Screenshot Prevention    | Disabled on payment and billing screens   |
| Session Timeout          | App lock after 15 min background          |
| OTP Brute Force          | 5 attempts → temporary block             |

### 15.5 n8n Security

* n8n deployed on private VPC / cloud instance
* Supabase Service Role key in n8n encrypted credentials vault
* n8n webhook endpoints: secret header validation required
* n8n not exposed to public internet: behind Nginx reverse proxy with basic auth
* All n8n executions logged

### 15.6 Backup & Disaster Recovery


| Type                          | Frequency      | Retention  | Method                         |
| ----------------------------- | -------------- | ---------- | ------------------------------ |
| Full DB Backup                | Daily 02:30 AM | 30 days    | Supabase Management API        |
| Point-in-Time Recovery (PITR) | Continuous     | 7 days     | Supabase WAL archiving         |
| Invoice PDF Backup            | Continuous     | 7 years    | Supabase Storage replication   |
| n8n Workflow Backup           | Weekly         | Indefinite | Export JSON → git repo        |
| Monthly Recovery Test         | Monthly        | N/A        | Restore to staging environment |

**RTO (Recovery Time Objective):** < 2 hours **RPO (Recovery Point Objective):** < 6 hours

---

## 16. FLOW DIAGRAMS & STATE MACHINES

### 16.1 Complete Order Lifecycle

```
Customer App:
  Tap "New Order"
    ├── Browse Products (custom pricing applied)
    ├── Add to Cart
    ├── Select Address + Slot
    ├── Review + Confirm
    └── POST /api/orders
          │
          ├── Validate: finished_goods stock
          ├── Validate: customer credit limit
          ├── INSERT orders (status: placed)
          ├── INSERT order_items
          └── n8n: SMS + Push "Order placed ✓"
                │
                ▼
          [Admin: Confirm]
            ├── stock reserved
            ├── status: confirmed
            └── n8n: Push to customer "Confirmed"
                  │
                  ▼
          [Assembly if needed] → status: processing
                  │
                  ▼
          [Packing complete] → status: ready_to_ship
                  │
                  ▼
          [Delivery Manager assigns driver + vehicle]
            ├── status: assigned
            └── n8n: Push to driver "New delivery"
                  │
                  ▼
          [Driver marks "Dispatched"]
            ├── status: dispatched
            ├── GPS tracking starts (WebSocket open)
            └── n8n: Push to customer "On the way!"
                  │
                  ▼ (realtime location streaming)
          [Customer sees live driver on map]
                  │
                  ▼
          [Driver arrives — Geofence 100m trigger]
            └── "Arrived" button shown
                  │
                  ▼
          [POD: Photo OR OTP OR Signature]
            ├── status: delivered
            ├── GPS tracking ends
            ├── Finished goods stock decremented
            ├── n8n: Invoice generated → PDF → Push to customer
            └── n8n: Payment link (if applicable)
```

### 16.2 Assembly Order Flow

```
[Inventory Manager]
  ↓
Creates Assembly Order
  - Selects product + quantity
  - System calculates BOM materials needed
  - System checks raw material stock availability
  ↓
IF stock sufficient:
  → Confirm Assembly Order
  → raw_materials.stock_qty DECREMENTED for each BOM item
  → stock_ledger INSERTED (reason: assembly_deduction)
  → products.finished_stock INCREMENTED
  → assembly_orders.status = 'completed'
  → n8n: Notify if stock falls below min_stock_level
ELSE:
  → Show shortfall report (which materials, how much needed)
  → Option: Create Purchase Order for missing materials
  → Option: Partial assembly with available stock
```

### 16.3 Supplier → Stock Flow

```
[Admin creates Purchase Order]
  - Select supplier
  - Add materials (filtered by supplier relationship)
  - Set quantities, costs, expected date
  - PO status: draft
  ↓
[Approve PO]
  - PO status: approved
  - Email generated for supplier (PDF)
  ↓
[Supplier ships]
  - PO status: shipped
  ↓
[Admin marks received]
  - PO status: received
  - For each PO item:
    → raw_materials.stock_qty += received_qty
    → raw_materials.current_cost updated (weighted average or FIFO)
    → stock_ledger INSERT (reason: po_receipt)
  ↓
[n8n: Check if cost changed]
  → IF cost changed: trigger Cost Change Alert workflow
  → notify affected product prices
```

### 16.4 Customer Registration Flow

```
User downloads app
  ↓
Enter phone number
  ↓
OTP sent via SMS (Twilio, 5-min expiry)
  ↓
OTP verified → Supabase Auth user created
  ↓
Profile Setup screen:
  - Full name
  - Address (map picker with geocoding)
  - Preferred delivery slot
  ↓
[First time: mandatory]
  → profiles INSERT
  → customers INSERT (auto CUST-XXXX code)
  ↓
Home Dashboard
```

### 16.5 Order Status State Machine

```
                    ┌──────────┐
                    │  Placed  │◄──── Customer / Admin / Supervisor
                    └────┬─────┘
                         │ Admin confirms
                    ┌────▼──────┐
                    │ Confirmed │
                    └────┬──────┘
                         │ Stock reserved / assembly
                    ┌────▼──────────┐
                    │  Processing  │
                    └────┬──────────┘
                         │ Packing complete
                    ┌────▼──────────────┐
                    │  Ready to Ship   │
                    └────┬──────────────┘
                         │ Driver + vehicle assigned
                    ┌────▼──────┐
                    │ Assigned  │
                    └────┬──────┘
                         │ Driver starts delivery
                    ┌────▼──────────┐
                    │  Dispatched  │◄──── GPS Tracking Active
                    └────┬──────────┘
                         │
              ┌──────────┴──────────┐
     POD OK   │                     │  Failed
    ┌──────────▼──────┐    ┌────────▼──────┐
    │   Delivered     │    │    Failed     │
    └─────────────────┘    └───────────────┘
              │                     │
              │                     └─── Reschedule → new Placed
              └─── (Phase 2) → [Returned]

Any status before Processing → [Cancelled] by customer
Any status → [Cancelled] by admin
```

---

## 17. UI/UX DESIGN SPECIFICATION

### 17.1 Design System Tokens


| Token                | Value                        | Usage                               |
| -------------------- | ---------------------------- | ----------------------------------- |
| Primary              | `#0077B6`                    | Main CTAs, active nav, key elements |
| Secondary            | `#00B4D8`                    | Secondary buttons, highlights       |
| Accent               | `#90E0EF`                    | Badges, tags, chips                 |
| Success              | `#2D9B5A`                    | Delivered status, positive actions  |
| Warning              | `#F4A261`                    | Pending, low stock alerts           |
| Error                | `#E63946`                    | Failed delivery, errors, overdue    |
| Background           | `#F8FAFC`                    | Page background                     |
| Card BG              | `#FFFFFF`                    | Cards, panels                       |
| Text Primary         | `#1A202C`                    | Main text                           |
| Text Secondary       | `#718096`                    | Labels, metadata                    |
| Border               | `#E2E8F0`                    | Dividers, input borders             |
| Font (Web)           | Inter                        | Admin dashboard, website            |
| Font (App)           | Roboto                       | Mobile apps                         |
| Border Radius Card   | `12px`                       | Cards, modals                       |
| Border Radius Button | `8px`                        | All buttons                         |
| Border Radius Input  | `6px`                        | Form fields                         |
| Shadow               | `0 2px 8px rgba(0,0,0,0.08)` | Cards, dropdowns                    |

### 17.2 Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  🌊 AquaFlow   [Search...]          🔔 5   📦 3 Low Stock   👤 Admin │
├────────────┬────────────────────────────────────────────────────────┤
│  Sidebar   │                MAIN CONTENT AREA                       │
│            │                                                         │
│ 📊 Overview│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ 🏭 Suppliers│  │ Today   │ │ Month   │ │  Year   │ │  YoY    │     │
│ 📦 Inventory│  │ ₹ 14.2K │ │ ₹ 3.8L  │ │ ₹ 44L  │ │ +18.5% │     │
│ ⚗️ Products │  │ 147 ord │ │ 3,840 o │ │ 46,000 │ │        │     │
│ 💰 Pricing │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│ 👥 Customers│                                                        │
│ 📋 Orders  │  [Revenue Chart — 12 months bar chart]                 │
│ 🚛 Dispatch │  ──────────────────────────────────────────────────   │
│ 🚗 Fleet   │  LIVE ORDERS FEED           STOCK ALERTS               │
│ 📈 Reports │  [Realtime table]           [Low stock list]            │
│ 💳 Payments │  ──────────────────────────────────────────────────   │
│ 👤 Staff   │  TOP CUSTOMERS (Month)      DRIVER MAP                 │
│ ⚙️ Settings │  [Customer revenue table]  [Live Leaflet map]         │
│ 📋 Audit   │                                                        │
└────────────┴────────────────────────────────────────────────────────┘
```

### 17.3 Admin Reports Page

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 ANALYTICS & REPORTS                     [Export CSV] [PDF]  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Time Range: [Today][Week][Month][Year][5Y][Custom Range] │  │
│  │ Report Type: [Revenue][Orders][Products][Customers][Drivers]│
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Chart Area (Bar / Line / Pie based on report type)     │  │
│  │   All data from pre-aggregated summary tables            │  │
│  │   Loads in < 200ms                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────┬────────────┬────────────┬─────────┬───────────┐  │
│  │  Period  │   Orders   │  Delivered │ Revenue │  Growth   │  │
│  ├──────────┼────────────┼────────────┼─────────┼───────────┤  │
│  │ Jan 2026 │    1,240   │   1,108    │ ₹1.86L  │  +8.2%   │  │
│  │ Feb 2026 │    1,190   │   1,071    │ ₹1.78L  │  -4.0%   │  │
│  │ Mar 2026 │    1,380   │   1,256    │ ₹2.07L  │ +16.0%   │  │
│  │ Apr 2026 │    1,520   │   1,390    │ ₹2.28L  │ +10.1%   │  │
│  └──────────┴────────────┴────────────┴─────────┴───────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 17.4 Inventory Admin Screen

```
┌──────────────────────────────────────────────────────┐
│ 📦 RAW MATERIALS           [+ Add Material] [+ PO]   │
├──────────────────────────────────────────────────────┤
│ Filter: [All Types ▼]  [All Suppliers ▼]  [🔍 Search] │
├──────────────────────────────────────────────────────┤
│ ⚠️ 3 materials below reorder threshold               │
├───────┬─────────────────┬──────┬──────┬──────┬───────┤
│ SKU   │ Name            │ Type │ Stock│ Min  │ Cost  │
├───────┼─────────────────┼──────┼──────┼──────┼───────┤
│BOT-1L │ 1L Clear Bottle │ Btl  │ 2,450│ 500  │ ₹4.50 │
│⚠️CAP  │ Std Red Cap     │ Cap  │  120 │ 200  │ ₹0.80 │ ← LOW
│LBL-1L │ Premium 1L Label│ Lbl  │ 3,200│ 300  │ ₹1.20 │
└───────┴─────────────────┴──────┴──────┴──────┴───────┘
```

### 17.5 Customer App Screens

```
HOME SCREEN:                    ORDER TRACKING:
┌─────────────────────────┐    ┌─────────────────────────┐
│ 🌊 AquaFlow    🔔  👤   │    │ ← Track #ORD-0123       │
├─────────────────────────┤    ├─────────────────────────┤
│ Hi Ramesh 👋            │    │ [  LIVE MAP              │
│                         │    │   🚴 Driver location     │
│ ┌─────────────────────┐ │    │   📍 Your address pin  ] │
│ │ 🚴 Order dispatched │ │    │                         │
│ │ 1L × 12, 20L × 2   │ │    │ Vijay Kumar 🚴  📞 Call │
│ │ [Track Now →]       │ │    │ ETA: ~8 minutes         │
│ └─────────────────────┘ │    ├─────────────────────────┤
│                         │    │ ✅ Placed       09:00   │
│ [+ New Order] [Reorder] │    │ ✅ Confirmed    09:02   │
│                         │    │ ✅ Dispatched   09:20   │
│ My Wallet               │    │ 🔵 In Transit ◄Current  │
│ Balance: ₹ 350  [+Add]  │    │ ⭕ Delivered            │
│ Due: ₹ 240   [Pay Now]  │    └─────────────────────────┘
│                         │
│ This Month Summary      │    PRODUCT CATALOGUE:
│ Orders: 14  Units: 52   │    ┌─────────────────────────┐
│ Spent: ₹ 1,820          │    │ 🔍 Search products      │
│                         │    ├─────────────────────────┤
│ [View All] [My Bills]   │    │ ┌──────────┬──────────┐ │
└─────────────────────────┘    │ │ [Image]  │ [Image]  │ │
                               │ │ 1L Prem  │  20L Can │ │
                               │ │ ₹ 12     │  ₹ 45   │ │
                               │ │ [+Add]   │  [+Add] │ │
                               │ └──────────┴──────────┘ │
                               └─────────────────────────┘
```

### 17.6 Driver App Screen

```
DELIVERY LIST:                  ORDER DETAIL:
┌─────────────────────────┐    ┌─────────────────────────┐
│ ← Today's Deliveries    │    │ ← Order #ORD-0123       │
│ Online 🟢              │    ├─────────────────────────┤
├─────────────────────────┤    │ 📍 42 Anna Nagar        │
│ 1/8 completed           │    │    Chennai 600040       │
│ ──────────────────────  │    │                         │
│ ┌─────────────────────┐ │    │ 👤 Ramesh Kumar         │
│ │ 1. ORD-0123         │ │    │ 📞 +91 98765 43210      │
│ │ 📍 Anna Nagar       │ │    │                         │
│ │ 1L×12  20L×2        │ │    │ 📦 Items:               │
│ │ 💰 COD ₹ 540        │ │    │ • 1L Premium Pack × 12  │
│ │ [Navigate] [Detail] │ │    │ • 20L Water Can × 2     │
│ └─────────────────────┘ │    │                         │
│ ┌─────────────────────┐ │    │ 💰 ₹ 540 — Cash         │
│ │ 2. ORD-0145         │ │    │                         │
│ │ 📍 T.Nagar          │ │    │ 📝 Leave at gate        │
│ │ 20L×3               │ │    │                         │
│ │ 💳 Prepaid ✓        │ │    │ [🗺️ Navigate]           │
│ │ [Navigate] [Detail] │ │    │                         │
│ └─────────────────────┘ │    │ [✅ Delivered] [❌ Failed]│
└─────────────────────────┘    └─────────────────────────┘
```

---

## 18. API DESIGN

### 18.1 Supabase Edge Functions

```
POST /functions/v1/place-order
  Auth: Customer JWT
  Body: { product_items: [{product_id, qty}], address_id, scheduled_date, slot, notes }
  → Validates stock, credit limit, creates order + items
  Returns: { order_id, order_number, total }

POST /functions/v1/assign-delivery
  Auth: Dispatcher/Admin JWT
  Body: { order_id, driver_id, vehicle_id }
  Returns: { success, assigned_at }

POST /functions/v1/update-order-status
  Auth: Driver JWT / Admin JWT
  Body: { order_id, status, proof_photo_url?, otp?, failure_reason? }
  Returns: { success, updated_at }

POST /functions/v1/generate-invoice
  Auth: Service Role (n8n only)
  Body: { order_id }
  Returns: { invoice_id, invoice_number, pdf_url }

POST /functions/v1/process-payment
  Auth: Customer JWT / Admin JWT
  Body: { invoice_id, amount, payment_method, gateway_ref? }
  Returns: { payment_id, receipt_url }

POST /functions/v1/create-assembly-order
  Auth: Inventory Manager JWT
  Body: { product_id, quantity }
  → Checks BOM, validates stock, creates assembly record
  Returns: { assembly_id, materials_to_deduct, can_proceed }

POST /functions/v1/confirm-assembly
  Auth: Inventory Manager JWT
  Body: { assembly_id }
  → Deducts raw materials, increments finished stock
  Returns: { success, new_stock_level }

GET  /functions/v1/product-price
  Auth: Customer JWT
  Query: ?product_id=xxx
  → Returns customer-specific price (or base price)
  Returns: { price, standard_price, discount? }

GET  /functions/v1/reports/summary
  Auth: Admin JWT
  Query: ?type=daily|monthly|yearly&from=2026-01&to=2026-05
  Returns: { data: [], totals }

POST /functions/v1/aggregate-daily (Internal — n8n only)
  Auth: Service Role
  Returns: { success, rows_processed }

POST /functions/v1/update-driver-location (from Driver App)
  Auth: Driver JWT
  Body: { latitude, longitude, speed?, order_id }
  Returns: { success }
```

### 18.2 REST API Endpoints (PostgREST via Supabase)

```
Authentication:
  POST /auth/v1/otp          → send OTP
  POST /auth/v1/verify       → verify OTP + get JWT
  POST /auth/v1/refresh      → refresh access token
  POST /auth/v1/logout

Raw Materials (Admin):
  GET    /rest/v1/raw_materials?select=*&is_active=eq.true
  POST   /rest/v1/raw_materials
  PATCH  /rest/v1/raw_materials?id=eq.{id}
  GET    /rest/v1/stock_ledger?material_id=eq.{id}

Products (Public + Admin):
  GET    /rest/v1/products?select=*&is_active=eq.true
  GET    /functions/v1/product-price?product_id={id}  (custom pricing)
  POST   /rest/v1/products   (admin only via RLS)

Orders (Customer/Admin):
  POST   /functions/v1/place-order
  GET    /rest/v1/orders?customer_id=eq.{id}&select=*,order_items(*)
  PATCH  /functions/v1/update-order-status

Driver Actions:
  POST   /functions/v1/update-driver-location
  GET    /rest/v1/orders?driver_id=eq.{me}&scheduled_date=eq.{today}
  POST   /functions/v1/update-order-status

Payments:
  POST   /functions/v1/process-payment
  GET    /rest/v1/wallet_transactions?customer_id=eq.{me}
  GET    /rest/v1/invoices?customer_id=eq.{me}

Analytics (Admin):
  GET    /functions/v1/reports/summary
  GET    /rest/v1/daily_summary?summary_date=gte.{from}&summary_date=lte.{to}
  GET    /rest/v1/monthly_summary?year=gte.{from_year}
  GET    /rest/v1/yearly_summary?year=gte.{year}&order=year.asc
```

### 18.3 WebSocket — GPS Tracking

```javascript
// Driver App — sends location every 8-10s
const ws = io('wss://api.aquaflow.com/tracking', {
  auth: { token: driverJWT }
});
ws.emit('location_update', {
  event: 'location_update',
  deliveryId: 'DEL-789',
  orderId: 'ORD-456',
  driverId: 'DRV-12',
  lat: 13.0827,
  lng: 80.2707,
  speed: 25.5,
  timestamp: '2026-05-03T10:30:00Z'
});

// Customer App — subscribes to order room
supabase
  .channel(`order:${orderId}`)
  .on('broadcast', { event: 'location_update' }, 
      payload => updateMapMarker(payload))
  .subscribe();

// Admin dispatch map — subscribes to all active deliveries
supabase
  .channel('dispatch:live')
  .on('broadcast', { event: 'location_update' }, 
      payload => updateDispatchMap(payload))
  .subscribe();
```

---

## 19. REAL-TIME GPS TRACKING IMPLEMENTATION

### 19.1 Architecture

```
Driver App (Flutter)
  → GPS reading every 8-10s (Android foreground service)
  → POST /functions/v1/update-driver-location
        │
        ├── Redis SET: driver:{id}:location {lat,lng} TTL=60s
        ├── INSERT: delivery_locations (history)
        ├── UPDATE: drivers (current position)
        └── Supabase Realtime BROADCAST
                │
                ├── order:{orderId} channel → Customer App
                └── dispatch:live channel → Assignment App
```

### 19.2 Geofencing for Auto-Arrival

```
Driver App continuously:
  distance = haversine(current_lat, current_lng, dest_lat, dest_lng)
  IF distance < 100m AND order.status == 'dispatched':
    → Show "You have arrived" prompt
    → Driver taps Arrived
    → POST update-order-status: arrived_at = NOW()
```

### 19.3 Battery Optimization

* GPS updates: 8–10s interval (not continuous)
* Use Android `FusedLocationProviderClient` for battery-efficient GPS
* Foreground service notification: shows current delivery details
* Auto-stop GPS on order completion or going offline

---

## 20. PAYMENT GATEWAY INTEGRATION (RAZORPAY)

### 20.1 Online Payment Flow

```
1. Customer taps "Pay Now" for invoice
   ↓
2. App → POST /functions/v1/process-payment
         { invoice_id, amount, method: 'online' }
   ↓
3. Edge Function → Razorpay API: creates order
   Returns: { razorpay_order_id, amount, currency, key }
   ↓
4. App opens Razorpay Flutter SDK checkout
   Customer completes payment (UPI/Card/Netbanking)
   ↓
5. Razorpay returns: { payment_id, signature }
   ↓
6. App → POST /functions/v1/verify-payment
         { razorpay_payment_id, razorpay_order_id, signature }
   ↓
7. Edge Function verifies signature (HMAC-SHA256 with secret)
   IF valid:
     → INSERT payments record
     → UPDATE invoice (amount_paid, status)
     → UPDATE customer balance/dues
     → n8n: send payment receipt (SMS + push)
     → Return { success: true }
   IF invalid:
     → Return { error: 'Payment verification failed' }
```

### 20.2 Cash on Delivery Flow

```
Driver marks "Delivered" with cash collection:
  → Driver enters cash amount collected
  → Validated against order total (with tolerance ₹1)
  → INSERT payments (method: 'cash', collected_by: driver_id)
  → UPDATE invoice status: 'paid'
  → UPDATE customer.total_due (decrease)
  → n8n: SMS receipt to customer
```

### 20.3 Wallet Top-Up

```
Customer taps "+ Add Money":
  → Enter amount (min ₹100)
  → Razorpay checkout (same flow as above)
  → On success: INSERT wallet_transactions (type: 'topup')
  → UPDATE customers.advance_balance
  → Push: "₹X added to wallet"
```

**Security Note:** Payment secrets reside ONLY on the server (Edge Functions). Apps never handle raw API keys or card numbers.


---
## 21. DEPLOYMENT STRATEGY & DEVOPS

### 21.1 Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION ENVIRONMENT                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  AWS Cloud (Primary)                     │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   EKS Cluster│  │  RDS Aurora  │  │  ElastiCache │  │   │
│  │  │  (Kubernetes)│  │  PostgreSQL  │  │  (Redis)     │  │   │
│  │  │  - API pods  │  │  Multi-AZ    │  │  Cluster     │  │   │
│  │  │  - n8n pod   │  │  Read replica│  │              │  │   │
│  │  │  - Socket.io │  │              │  │              │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  S3 + CDN    │  │  CloudFront  │  │  Route 53    │  │   │
│  │  │  (Storage)   │  │  (Static)    │  │  (DNS)       │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐ │
│  │   Supabase Cloud         │  │   Firebase                  │ │
│  │   - Auth                 │  │   - FCM Push Notifications  │ │
│  │   - Realtime             │  │   - APNs bridge             │ │
│  │   - Storage (backups)    │  │                             │ │
│  │   - Edge Functions       │  │                             │ │
│  └──────────────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 21.2 Environment Strategy

| Environment           | Purpose                    | Data                       | URL                 |
| ----------------------- | ---------------------------- | ---------------------------- | --------------------- |
| **Development** | Developer local work       | Seed data only             | localhost           |
| **Staging**     | QA, UAT, integration tests | Anonymised production copy | staging.aquaflow.in |
| **Production**  | Live system                | Real data                  | app.aquaflow.in     |

### 21.3 Infrastructure as Code (Terraform)

```hcl
# terraform/main.tf — Key Resources
module "vpc"        { source = "./modules/vpc" }
module "eks"        { source = "./modules/eks"   cluster_name = "aquaflow-prod" }
module "rds"        { source = "./modules/rds"   engine = "aurora-postgresql" }
module "redis"      { source = "./modules/redis" node_type = "cache.t3.medium" }
module "s3"         { source = "./modules/s3"    buckets = ["invoices","proofs","assets"] }
module "cloudfront" { source = "./modules/cdn"   origins = ["admin","marketing"] }
```

### 21.4 Containerisation (Docker)

```dockerfile
# Backend / Edge Function Sidecar
FROM denoland/deno:1.40.0
WORKDIR /app
COPY . .
RUN deno cache main.ts
CMD ["deno", "run", "--allow-net", "--allow-env", "main.ts"]

# Socket.io GPS Server
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "server.js"]

# n8n Automation
FROM n8nio/n8n:latest
ENV N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
ENV DB_TYPE=postgresdb
```

### 21.5 Kubernetes Deployment

```yaml
# k8s/deployment-api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aquaflow-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aquaflow-api
  template:
    spec:
      containers:
        - name: api
          image: aquaflow/api:latest
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits:   { cpu: "500m", memory: "512Mi" }
          env:
            - name: SUPABASE_URL
              valueFrom:
                secretKeyRef:
                  name: aquaflow-secrets
                  key: supabase-url
--

# HorizontalPodAutoscaler

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: aquaflow-api-hpa
spec:
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70

---
---


```

### 21.6 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: AquaFlow Deploy Pipeline

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run unit tests
        run: npm test -- --coverage
      - name: Run integration tests
        run: npm run test:integration

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t aquaflow/api:${{ github.sha }} .
      - name: Push to ECR
        run: docker push aquaflow/api:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging'
    steps:
      - name: Deploy to EKS staging
        run: kubectl set image deployment/aquaflow-api api=aquaflow/api:${{ github.sha }}

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production        # requires manual approval
    steps:
      - name: Deploy to EKS production
        run: kubectl set image deployment/aquaflow-api api=aquaflow/api:${{ github.sha }}
      - name: Notify Slack
        run: curl -X POST ${{ secrets.SLACK_WEBHOOK }} -d '{"text":"✅ AquaFlow deployed to production"}'
```

### 21.7 Mobile App CI/CD (Codemagic)

```yaml
# codemagic.yaml
workflows:
  customer-app-release:
    name: Customer App — Release
    environment:
      flutter: 3.19.0
    scripts:
      - flutter test
      - flutter build apk --release
      - flutter build ipa --release
    publishing:
      google_play:
        credentials: ${{ secrets.GPLAY_KEY }}
        track: internal   # internal → alpha → beta → production
      app_store_connect:
        api_key: ${{ secrets.ASC_KEY }}
        submit_to_testflight: true
```

### 21.8 Monitoring & Observability


| Tool                     | Purpose                                      | Alerts                      |
| ------------------------ | -------------------------------------------- | --------------------------- |
| **Prometheus + Grafana** | Server CPU, memory, request rate, error rate | CPU > 80%, error rate > 1%  |
| **Sentry**               | Exception tracking (backend + mobile)        | Any new crash               |
| **CloudWatch**           | AWS resource logs, RDS performance           | DB connections > 80%        |
| **Supabase Dashboard**   | DB query performance, realtime connections   | Slow queries > 500ms        |
| **Uptime Robot**         | Endpoint uptime checks every 60s             | Any downtime → SMS + email |
| **n8n Monitoring**       | Workflow execution logs, failure alerts      | Any workflow failure        |

### 21.9 Supabase Project Configuration

```
Supabase Settings Required:
  Auth:
    ✅ Phone OTP provider: Twilio (primary) + TextLocal (fallback)
    ✅ Email provider: SMTP (for admin invites)
    ✅ JWT expiry: access=900s (15min), refresh=604800s (7 days)
    ✅ Refresh token rotation: ENABLED
    ✅ Disable sign-ups: FALSE (customers self-register)

  Database:
    ✅ Extensions: pg_cron (optional), uuid-ossp, pg_stat_statements
    ✅ PITR (Point-in-Time Recovery): ENABLED
    ✅ Read replicas: 1 (for analytics query offloading)

  Storage:
    ✅ Bucket: "invoices"       — Private, 50MB max file size
    ✅ Bucket: "delivery-proofs"— Private, 20MB max file size
    ✅ Bucket: "product-images" — Public, 10MB max file size
    ✅ Bucket: "assets"         — Public (logos, etc.)

  Realtime:
    ✅ Enabled tables: orders, drivers
    ✅ Broadcast enabled for tracking channels
    ✅ Max connections: 5,000

  Edge Functions:
    ✅ All functions deployed with --no-verify-jwt for service-role endpoints
    ✅ Deno version: 1.40+
```

### 21.10 Environment Variables

```bash
# .env.production (stored in AWS Secrets Manager / K8s secrets)

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...   # NEVER exposed to client

# n8n
N8N_ENCRYPTION_KEY=your-32-char-key
SUPABASE_SERVICE_KEY_N8N=eyJhbGc...

# Firebase (FCM)
FIREBASE_PROJECT_ID=aquaflow-prod
FIREBASE_SERVER_KEY=AAAAxx...

# SMS
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+1415xxxxxxx

# Payment
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_SECRET=xxxx

# Maps
GOOGLE_MAPS_API_KEY=AIzaXXXX

# Email
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_USER=xxxx
SMTP_PASS=xxxx
ADMIN_ALERT_EMAIL=ops@aquaflow.in

# Redis
REDIS_URL=redis://aquaflow-redis.xxxx.cache.amazonaws.com:6379
```

---

## 22. TESTING STRATEGY & ACCEPTANCE CRITERIA

### 22.1 Testing Pyramid

```
                    ┌─────────────────────┐
                    │   E2E Tests         │  (Appium/Detox/Playwright)
                    │   Critical journeys │  ~20 test cases
                    ├─────────────────────┤
                  ┌─┤  Integration Tests  ├─┐
                  │ │  API endpoints      │ │  ~150 test cases
                  │ ├─────────────────────┤ │
                ┌─┴─┤    Unit Tests       ├─┴─┐
                │   │  Business logic     │   │  ~500 test cases
                │   │  ≥ 90% coverage     │   │
                └───┴─────────────────────┴───┘
```

### 22.2 Unit Tests


| Module                        | Coverage Target | Tools                |
| ----------------------------- | --------------- | -------------------- |
| Cost Calculation Engine       | 100%            | Jest / Deno test     |
| BOM Compatibility Validation  | 100%            | Jest                 |
| Order Status Machine          | 100%            | Jest                 |
| Pricing Logic (custom + base) | 100%            | Jest                 |
| Stock Deduction Logic         | 95%             | Jest                 |
| Aggregation SQL Functions     | 90%             | pg\_tap (PostgreSQL) |
| JWT Auth Middleware           | 95%             | Jest                 |

### 22.3 Integration Tests (Postman / Newman)

```
Collection: AquaFlow API Tests

AUTH:
  ✅ POST /auth/otp — valid phone returns 200
  ✅ POST /auth/verify — valid OTP returns JWT
  ✅ POST /auth/verify — expired OTP returns 401
  ✅ Protected endpoint without JWT returns 403

ORDERS:
  ✅ Customer can place order with valid stock
  ✅ Order blocked when credit limit exceeded
  ✅ Order blocked when finished goods stock = 0
  ✅ Driver can update status of assigned order
  ✅ Driver cannot update status of other driver's order (RLS test)
  ✅ Customer cannot see other customer's orders (RLS test)

INVENTORY:
  ✅ Assembly order deducts correct BOM quantities
  ✅ PO receipt increments stock correctly
  ✅ Stock ledger entry created on every movement
  ✅ Incompatible BOM combination blocked

PAYMENTS:
  ✅ Razorpay signature verification (valid)
  ✅ Razorpay signature verification (tampered — rejected)
  ✅ Wallet balance updated correctly after top-up
  ✅ Credit limit enforced on order placement

ANALYTICS:
  ✅ daily_summary populated correctly after aggregation run
  ✅ monthly_summary rolled up correctly
  ✅ Customer monthly summary matches raw order totals
  ✅ Report queries return in < 200ms (performance assertion)
```

### 22.4 End-to-End Tests

```
E2E Test Suite (Appium for Flutter / Playwright for Web)

CUSTOMER JOURNEY:
  1. Register with phone OTP
  2. Add delivery address (map picker)
  3. Browse product catalogue
  4. Add to cart, adjust quantity
  5. Checkout with wallet payment
  6. View order status → tracking screen
  7. Simulate delivery → order delivered
  8. Download invoice PDF
  9. Rate delivery

DRIVER JOURNEY:
  1. Login as driver
  2. Go online
  3. View assigned delivery
  4. Start navigation (mock GPS)
  5. Mark arrived (simulate geofence)
  6. Upload proof photo
  7. Mark delivered
  8. Verify order status updated in Admin

ADMIN JOURNEY:
  1. Login with 2FA
  2. Create supplier + raw materials
  3. Create PO → mark received → verify stock updated
  4. Create product with BOM (test compatibility enforcement)
  5. Create assembly order → confirm → verify stock changes
  6. Confirm customer order
  7. Assign to driver
  8. View analytics report (12-month view)
  9. Export report to PDF

INVENTORY JOURNEY:
  1. Set min stock level for material
  2. Reduce stock below threshold (manual adjustment)
  3. Verify low-stock alert notification received
  4. Create and approve PO
  5. Receive PO → verify stock replenished
```

### 22.5 Performance Testing (k6 / JMeter)

```javascript
// k6/order-flow.js — Load test
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100  },  // ramp to 100 users
    { duration: '5m', target: 1000 },  // ramp to 1000 users
    { duration: '5m', target: 1000 },  // hold 1000 users
    { duration: '2m', target: 0    },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% under 500ms
    http_req_failed:   ['rate<0.01'],   // < 1% errors
  },
};

export default function () {
  // Test: place order
  const res = http.post('https://staging.aquaflow.in/functions/v1/place-order',
    JSON.stringify({ product_items: [{ product_id: 'xxx', qty: 2 }],
                     address_id: 'yyy', scheduled_date: '2026-05-10' }),
    { headers: { Authorization: `Bearer ${__ENV.TEST_JWT}`,
                 'Content-Type': 'application/json' } });
  check(res, { 'order placed': (r) => r.status === 201 });
  sleep(1);
}
```

```
Specific Performance Benchmarks:
  ✅ Place order API:        95th percentile < 500ms under 1,000 concurrent users
  ✅ Historical report API:  95th percentile < 200ms (summary tables)
  ✅ Live tracking:          500 concurrent driver GPS streams — latency < 3s
  ✅ Dashboard KPIs:         Admin dashboard load < 2s with 50 concurrent sessions
  ✅ Product catalogue:      Customer app product list < 300ms
```

### 22.6 Security Testing


| Test Type                  | Tool                | Scope               |
| -------------------------- | ------------------- | ------------------- |
| OWASP Top 10 scan          | OWASP ZAP           | All API endpoints   |
| SQL Injection              | SQLMap              | All input fields    |
| JWT tampering              | Manual              | Auth flows          |
| RLS bypass attempt         | Manual              | Cross-customer data |
| Rate limit bypass          | k6                  | Auth endpoints      |
| Certificate pinning test   | Burp Suite + mobile | APKs                |
| Dependency vulnerabilities | npm audit / Snyk    | All packages        |

### 22.7 UAT (User Acceptance Testing)

**Duration:** 2 weeks before full launch

**Participants:**

* 10 real customers (beta group)
* 5 drivers (pilot delivery team)
* 2 dispatchers
* 2 admin staff
* 1 inventory manager

**UAT Sign-off Checklist:**


| Criterion                                      | Tested By     | Pass Criteria                         |
| ---------------------------------------------- | ------------- | ------------------------------------- |
| Customer can register, order, pay, track       | Customers     | Zero blocking issues                  |
| Driver receives assignment, delivers, confirms | Drivers       | POD flow complete                     |
| Dispatcher can assign in < 3 taps              | Dispatchers   | Assignment < 3 taps                   |
| Admin reports load correctly                   | Admin         | All 12 report types verified          |
| Inventory deducted correctly on delivery       | Inventory Mgr | Stock count matches manually          |
| Invoice generated and downloadable             | Customers     | PDF opens correctly                   |
| No order data loss during testing              | QA            | 0 lost orders in 2 weeks              |
| Performance within spec on real devices        | QA            | All metrics pass on mid-range Android |

### 22.8 Key Acceptance Criteria

```
✅ MUST PASS before production launch:

  ORDER SYSTEM:
  - Customer can complete full order flow end-to-end
  - Order status updates propagate to all parties in < 5 seconds
  - Stock is accurately decremented on assembly and delivery
  - Zero duplicate orders created

  TRACKING:
  - Driver GPS updates visible on customer map within 3 seconds
  - Geofence triggers within 100m of destination
  - Tracking stops automatically on delivery completion

  PAYMENTS:
  - Razorpay payment signature verification has zero false positives
  - Wallet balance updates atomically (no partial updates)
  - COD collection recorded and attributed to correct driver

  INVENTORY:
  - BOM prevents incompatible material combinations
  - Assembly order deducts exact BOM quantities
  - Low stock alert triggered at or before min_stock_level

  ANALYTICS:
  - All historical reports load in < 200ms
  - Daily aggregation runs without manual intervention
  - Report totals match raw data (validated by QA reconciliation)

  SECURITY:
  - No cross-customer data leakage (verified by RLS test suite)
  - All admin actions logged in audit_logs
  - No sensitive data in app logs or error messages
```

---

## 23. DEVELOPMENT PHASES & MILESTONES

### 23.1 Phase 0 — Project Setup (Week 1)


| Task                                             | Owner    | Duration |
| ------------------------------------------------ | -------- | -------- |
| Supabase project creation + all table migrations | Backend  | 2 days   |
| RLS policies implementation + testing            | Backend  | 1 day    |
| Supabase Auth setup (OTP + 2FA)                  | Backend  | 1 day    |
| n8n server setup + test environment              | DevOps   | 1 day    |
| GitHub repo + CI/CD pipeline setup               | DevOps   | 1 day    |
| Design system tokens defined (Figma)             | Designer | 2 days   |
| Firebase FCM project setup                       | Backend  | 0.5 day  |

**Milestone 0:** ✅ Infrastructure ready, auth working, n8n running

---

### 23.2 Phase 1 — Supplier & Inventory Core (Weeks 2–4)


| Task                                               | Owner              | Duration |
| -------------------------------------------------- | ------------------ | -------- |
| Supplier management CRUD                           | Backend + Frontend | 3 days   |
| Raw material inventory CRUD                        | Backend + Frontend | 3 days   |
| Purchase order flow (create → approve → receive) | Backend + Frontend | 4 days   |
| Stock ledger automatic entries                     | Backend            | 2 days   |
| Compatibility matrix setup                         | Backend + Frontend | 2 days   |
| Bill of Materials editor                           | Backend + Frontend | 3 days   |
| Cost calculation engine                            | Backend            | 2 days   |
| Assembly order flow                                | Backend + Frontend | 3 days   |

**Milestone 1:** ✅ Supplier → PO → Stock → BOM → Assembly → Finished Goods flow working

---

### 23.3 Phase 2 — Customer & Product Core (Weeks 5–7)


| Task                                        | Owner              | Duration |
| ------------------------------------------- | ------------------ | -------- |
| Product catalog (with BOM-linked products)  | Backend + Frontend | 3 days   |
| Customer pricing engine (custom + base)     | Backend            | 2 days   |
| Customer management (admin side)            | Frontend           | 3 days   |
| Customer App scaffold (Flutter)             | Mobile             | 3 days   |
| Customer App — auth (OTP login)            | Mobile             | 2 days   |
| Customer App — product catalog + cart      | Mobile             | 3 days   |
| Customer App — checkout + order placement  | Mobile + Backend   | 3 days   |
| n8n Workflow 2: Order notification pipeline | DevOps + Backend   | 2 days   |

**Milestone 2:** ✅ Customer can register, browse, add to cart, place order

---

### 23.4 Phase 3 — Order Lifecycle & Delivery (Weeks 8–11)


| Task                                        | Owner            | Duration |
| ------------------------------------------- | ---------------- | -------- |
| Full order status management (admin)        | Frontend         | 3 days   |
| Driver App scaffold + auth                  | Mobile           | 2 days   |
| Driver App — delivery list + order detail  | Mobile           | 3 days   |
| GPS tracking (WebSocket + Redis)            | Mobile + Backend | 4 days   |
| Customer App — live order tracking (map)   | Mobile           | 3 days   |
| Assignment App scaffold + live map          | Mobile           | 3 days   |
| Assignment App — assign/bulk assign flow   | Mobile + Backend | 3 days   |
| Proof of delivery (photo + OTP + signature) | Mobile + Backend | 3 days   |
| Vehicle management (admin)                  | Frontend         | 2 days   |
| n8n Workflow 8: GPS location pipeline       | DevOps           | 1 day    |
| Admin dispatch dashboard (live map)         | Frontend         | 3 days   |

**Milestone 3:** ✅ Full delivery cycle: Order → Assign → Driver picks up → GPS tracks → Delivered with POD

---

### 23.5 Phase 4 — Billing, Payments & Subscriptions (Weeks 12–14)


| Task                                            | Owner                       | Duration |
| ----------------------------------------------- | --------------------------- | -------- |
| Invoice auto-generation (Edge Function)         | Backend                     | 2 days   |
| Invoice PDF generation                          | Backend                     | 2 days   |
| Razorpay integration (online payment)           | Backend + Mobile            | 3 days   |
| Customer wallet (top-up, deduction, ledger)     | Backend + Mobile            | 3 days   |
| Customer App — bills + payments screen         | Mobile                      | 2 days   |
| Admin payment management module                 | Frontend                    | 2 days   |
| Subscription management (create, pause, cancel) | Backend + Frontend + Mobile | 3 days   |
| n8n Workflow 3: Invoice auto-generation         | DevOps                      | 1 day    |
| n8n Workflow 5: Overdue payment reminders       | DevOps                      | 1 day    |
| n8n Workflow 6: Subscription auto-orders        | DevOps                      | 1 day    |

**Milestone 4:** ✅ End-to-end billing: delivery → invoice → PDF → payment → receipt

---

### 23.6 Phase 5 — Analytics & Reporting (Weeks 15–16)


| Task                                           | Owner            | Duration |
| ---------------------------------------------- | ---------------- | -------- |
| n8n Workflow 1: Nightly daily aggregation      | DevOps + Backend | 2 days   |
| n8n Workflow 1b: Monthly + yearly rollup       | DevOps + Backend | 2 days   |
| n8n Workflow 4: Stock alert monitor            | DevOps           | 1 day    |
| Admin analytics module — all charts           | Frontend         | 4 days   |
| Customer billing history screen (from summary) | Mobile           | 2 days   |
| Driver earnings dashboard                      | Mobile           | 2 days   |
| Report export (CSV + PDF)                      | Frontend         | 2 days   |
| n8n Workflow 7: Daily database backup          | DevOps           | 1 day    |

**Milestone 5:** ✅ All analytics live; daily/monthly/yearly reports load < 200ms; backups automated

---

### 23.7 Phase 6 — Polish, Security & Launch (Weeks 17–19)


| Task                                           | Owner              | Duration |
| ---------------------------------------------- | ------------------ | -------- |
| Marketing website (Next.js)                    | Frontend           | 5 days   |
| Supervisor portal                              | Frontend + Backend | 3 days   |
| Push notifications — all triggers (FCM)       | Backend + Mobile   | 3 days   |
| Offline support (Flutter cached data)          | Mobile             | 2 days   |
| Security audit (OWASP, penetration test)       | Security           | 3 days   |
| Performance testing (k6 load test)             | QA                 | 2 days   |
| Certificate pinning for all APKs               | Mobile             | 1 day    |
| UAT with real users (2 weeks)                  | All + Client       | 10 days  |
| Bug fixes from UAT                             | All                | 5 days   |
| Production infrastructure provisioning         | DevOps             | 2 days   |
| Production deployment + smoke tests            | All                | 2 days   |
| App store submission (Google Play + App Store) | Mobile + DevOps    | 3 days   |

**Milestone 6:** ✅ Production launch 🚀

---

### 23.8 Post-Launch (Month 2+)


| Task                                          | Timeline |
| --------------------------------------------- | -------- |
| Bulk pricing tiers (Phase 2 feature)          | Month 2  |
| Supplier portal (supplier-facing login)       | Month 3  |
| Route optimization (auto-sequence deliveries) | Month 2  |
| Customer ratings + reviews                    | Month 2  |
| Returned orders flow                          | Month 3  |
| WhatsApp Business API integration             | Month 3  |
| Advanced inventory: FIFO lot tracking         | Month 4  |

---

## 24. NON-FUNCTIONAL REQUIREMENTS


| Category                         | Requirement                               | Target                                                          |
| -------------------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| **Performance — Reports**       | All historical report queries             | < 200ms (p95)                                                   |
| **Performance — Live API**      | All real-time API calls                   | < 500ms (p95)                                                   |
| **Performance — Live Tracking** | GPS update to customer display            | < 3 seconds                                                     |
| **Performance — App Launch**    | Cold start time                           | < 3 seconds                                                     |
| **Scalability — Users**         | Concurrent active users                   | 10,000+                                                         |
| **Scalability — Drivers**       | Simultaneous GPS streams                  | 500 drivers                                                     |
| **Scalability — Admin**         | Concurrent admin sessions                 | 50                                                              |
| **Availability**                 | System uptime (excl. planned maintenance) | 99.9% (< 8.7 hrs/year)                                          |
| **Data Volume**                  | Orders over 5 years                       | Up to 20M+ rows                                                 |
| **Reliability**                  | Order data loss                           | Zero tolerance                                                  |
| **Reliability**                  | Message delivery (notifications)          | Message queue ensures delivery                                  |
| **Security — Transport**        | All communication                         | HTTPS / TLS 1.3 minimum                                         |
| **Security — Auth**             | Admin accounts                            | TOTP 2FA mandatory                                              |
| **Security — Payments**         | PCI-DSS                                   | Compliant via Razorpay tokenisation                             |
| **Security — Data**             | Customer PII                              | AES-256 encrypted at rest                                       |
| **Offline Support**              | Customer App                              | Order history viewable offline; syncs on reconnect              |
| **Offline Support**              | Driver App                                | Delivery list cached; status update queued offline              |
| **Localization**                 | Language support                          | English + Tamil (initially); date/time locale-aware             |
| **Battery Impact**               | Driver App GPS                            | Optimised duty-cycle; full 8-hour shift without excessive drain |
| **APK Size**                     | All apps                                  | < 35MB each                                                     |
| **Accessibility**                | Mobile apps                               | WCAG 2.1 AA — minimum contrast ratios, tap targets ≥ 44×44px |
| **Usability**                    | Mobile apps                               | SUS (System Usability Scale) score ≥ 80                        |
| **Backup — RPO**                | Data recovery point                       | < 6 hours                                                       |
| **Backup — RTO**                | Data recovery time                        | < 2 hours                                                       |

---

## 25. RISK & MITIGATION REGISTER


| #   | Risk                                                   | Probability | Impact   | Mitigation Strategy                                                                                                      |
| --- | ------------------------------------------------------ | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| R1  | n8n aggregation job fails silently                     | Medium      | High     | Idempotent UPSERT queries; Slack/email alert on failure; 3 auto-retries; manual re-trigger endpoint                      |
| R2  | Supabase Realtime connection drops                     | Medium      | Medium   | Auto-reconnect logic in app; HTTP polling fallback every 30s if WebSocket unavailable                                    |
| R3  | Driver GPS spoofing / location fraud                   | Low         | High     | Geofencing validation; flag suspicious movement (> 200 km/h); admin alert; server-side validation                        |
| R4  | Razorpay payment gateway downtime                      | Low         | High     | Fallback to cash-on-delivery; queue payment retries; display maintenance message in app                                  |
| R5  | Raw material stockout during order surge               | Medium      | High     | Min-stock alerts (n8n Workflow 4); assembly cannot proceed without sufficient materials                                  |
| R6  | BOM error causes incorrect stock deduction             | Low         | Critical | 100% unit test coverage on BOM logic; reconciliation report (physical vs system count)                                   |
| R7  | Database backup failure                                | Low         | Critical | Immediate alert; PITR always enabled as secondary; monthly recovery drill                                                |
| R8  | OTP SMS delivery failure (provider down)               | Medium      | High     | Primary (Twilio) + fallback (TextLocal); retry after 60s; offer WhatsApp OTP as alternate                                |
| R9  | Incompatible Flutter dependency update                 | Medium      | Medium   | Lock all package versions in pubspec.lock; staged upgrade process with full regression test                              |
| R10 | Admin account compromise                               | Low         | Critical | TOTP 2FA mandatory; account lockout; audit log for all actions; immediate disable endpoint                               |
| R11 | Large bulk order (500+ boxes) overloads single vehicle | Medium      | Medium   | Weight/volume validation at assignment; system warns and blocks if capacity exceeded                                     |
| R12 | Customer places order for out-of-stock finished goods  | Medium      | Medium   | Finished goods stock checked at order placement; backorder flow with admin override                                      |
| R13 | n8n server outage (if self-hosted)                     | Low         | High     | n8n on Kubernetes with health checks + auto-restart; weekly workflow export to git; fallback cron on PostgreSQL pg\_cron |
| R14 | Supabase Storage bucket fills up (invoices)            | Low         | Medium   | Storage monitoring alert at 80% capacity; S3 lifecycle policy to archive old invoices after 2 years                      |
| R15 | Apple App Store rejection                              | Low         | Medium   | Follow HIG guidelines; avoid private API usage; submit privacy manifest; TestFlight pre-validation                       |

---

## 26. GLOSSARY OF TECHNICAL TERMS


| Term                                       | Plain English Explanation                                                                                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API**                                    | Application Programming Interface — a set of rules allowing two software applications to communicate. Example: Customer app talks to our server via API.                     |
| **REST API**                               | A style of API using standard HTTP methods (GET, POST, PATCH, DELETE) and URLs to access resources.                                                                           |
| **JWT (JSON Web Token)**                   | A compact, secure way to transmit user identity between the app and server. Contains user ID and role; expires after a set time.                                              |
| **WebSocket**                              | A persistent two-way connection between the driver app and server, allowing real-time data exchange without repeatedly opening new connections. Used for GPS tracking.        |
| **Supabase**                               | An open-source Firebase alternative built on PostgreSQL. Provides database, authentication, real-time subscriptions, file storage, and serverless functions.                  |
| **RLS (Row-Level Security)**               | A PostgreSQL feature that enforces data access rules at the database level. Ensures customers can only see their own orders, regardless of how data is queried.               |
| **n8n**                                    | A workflow automation tool (like Zapier, self-hosted). Used for scheduled jobs, notifications, invoice generation, and data aggregation.                                      |
| **CQRS**                                   | Command/Query Responsibility Segregation — a pattern separating write operations (commands, e.g., place order) from read operations (queries, e.g., view report).            |
| **BOM (Bill of Materials)**                | The "recipe" defining which raw materials and what quantities are needed to assemble one unit of finished product.                                                            |
| **SKU (Stock Keeping Unit)**               | A unique alphanumeric code identifying each product or material. Example: BOT-1L-CLR = 1-litre clear bottle.                                                                  |
| **FIFO**                                   | First In, First Out — inventory costing method where the oldest stock is used/valued first.                                                                                  |
| **Weighted Average**                       | Inventory costing method where the average cost of all units in stock is recalculated on each purchase.                                                                       |
| **Geocoding**                              | Converting a street address into geographic coordinates (latitude and longitude). Used when customer saves a delivery address on a map.                                       |
| **Geofencing**                             | Defining a virtual boundary (e.g., 100m circle) around a location. When the driver enters that boundary, the app auto-prompts "You have arrived."                             |
| **FCM (Firebase Cloud Messaging)**         | Google's free push notification service for Android. Used to send order updates, payment alerts, and reminders to customer and driver apps.                                   |
| **APNs (Apple Push Notification service)** | Apple's equivalent of FCM for iOS devices.                                                                                                                                    |
| **Redis**                                  | An in-memory database used as a cache for frequently accessed data (e.g., driver current GPS position) and as a pub/sub message broker for real-time distribution.            |
| **Pub/Sub**                                | Publish/Subscribe messaging pattern. Drivers "publish" GPS updates; customer apps "subscribe" to receive them. Decouples sender from receivers.                               |
| **Razorpay**                               | India's leading payment gateway supporting UPI, credit/debit cards, net banking, and wallets.                                                                                 |
| **PCI-DSS**                                | Payment Card Industry Data Security Standard — security requirements for systems handling payment card data. We comply by never storing raw card data (Razorpay handles it). |
| **RBAC**                                   | Role-Based Access Control — restricting system features based on user role (e.g., Inventory Manager cannot access customer financial data).                                  |
| **Docker**                                 | Containerisation technology that packages an application with all its dependencies into a portable, isolated "container."                                                     |
| **Kubernetes (K8s)**                       | Container orchestration platform that manages Docker containers at scale — auto-scaling, health checks, rolling deployments.                                                 |
| **Terraform**                              | Infrastructure as Code tool to define and provision cloud infrastructure (servers, databases, networks) using configuration files.                                            |
| **CI/CD**                                  | Continuous Integration / Continuous Deployment — automated pipeline that tests code on every commit and deploys to production when tests pass.                               |
| **TLS**                                    | Transport Layer Security — encryption protocol securing all data in transit between apps and servers. Prevents eavesdropping.                                                |
| **AES-256**                                | Advanced Encryption Standard with 256-bit keys — industry standard encryption for sensitive data stored in the database.                                                     |
| **PITR**                                   | Point-In-Time Recovery — ability to restore the database to any specific moment in the past, within the retention window.                                                    |
| **Edge Function**                          | A serverless function deployed at Supabase's infrastructure to run custom backend logic (e.g., order validation, invoice generation). Runs close to users for low latency.    |
| **HPA**                                    | Horizontal Pod Autoscaler — Kubernetes feature that automatically increases or decreases the number of running app instances based on CPU/memory usage.                      |
| **SUS**                                    | System Usability Scale — a standardised 10-question survey measuring perceived usability of an app. Score ≥ 80 is considered "excellent."                                   |
| **WCAG**                                   | Web Content Accessibility Guidelines — standards ensuring apps are accessible to people with disabilities.                                                                   |
| **OWASP Top 10**                           | Open Web Application Security Project's list of the 10 most critical web security vulnerabilities. Used as a checklist for security testing.                                  |
| **POD**                                    | Proof of Delivery — evidence confirming a delivery was completed: photo of delivered goods, customer OTP, or digital signature.                                              |
| **Heartbeat**                              | A periodic signal (e.g., every 30 seconds) sent by the driver app to the server indicating it is still online and active.                                                     |
| **Foreground Service**                     | An Android component that keeps an app running and GPS active even when the user switches to another app. Required for continuous GPS tracking during deliveries.             |
| **Distance Matrix**                        | Google Maps API feature that calculates travel distances and times between multiple origins and destinations. Used for route optimization and ETA calculation.                |

---

## 27. APPENDICES

### Appendix A — Sample Raw Material Data


| SKU         | Name                      | Type      | Current Cost (₹) | Min Stock |
| ----------- | ------------------------- | --------- | ----------------- | --------- |
| BOT-1L-CLR  | 1L Clear Round Bottle     | Bottle    | 4.50              | 500 pcs   |
| BOT-20L-JUG | 20L Blue Water Jug        | Bottle    | 32.00             | 100 pcs   |
| CAP-STD-RED | Standard Red Flip Cap     | Cap       | 0.80              | 1,000 pcs |
| CAP-STD-BLU | Standard Blue Flip Cap    | Cap       | 0.80              | 1,000 pcs |
| CAP-JUG-BLK | 20L Jug Black Screw Cap   | Cap       | 3.50              | 200 pcs   |
| LBL-PREM-1L | Premium 1L Label (Glossy) | Label     | 1.20              | 500 pcs   |
| LBL-STD-20L | Standard 20L Jug Label    | Label     | 2.00              | 200 pcs   |
| SHW-1L      | Shrink Wrap for 1L        | Packaging | 0.30              | 2,000 pcs |

---

### Appendix B — Sample Product BOM

**Product:** 1L Premium Pack — FP-1L-PREM (per bottle)


| Component                                      | SKU         | Qty  | Unit Cost | Line Total          |
| ---------------------------------------------- | ----------- | ---- | --------- | ------------------- |
| 1L Clear Bottle                                | BOT-1L-CLR  | 1 pc | ₹ 4.50   | ₹ 4.50             |
| Standard Red Cap                               | CAP-STD-RED | 1 pc | ₹ 0.80   | ₹ 0.80             |
| Premium 1L Label                               | LBL-PREM-1L | 1 pc | ₹ 1.20   | ₹ 1.20             |
| Shrink Wrap                                    | SHW-1L      | 1 pc | ₹ 0.30   | ₹ 0.30             |
| Assembly Overhead (water, labour, electricity) | —          | —   | ₹ 0.50   | ₹ 0.50             |
| **Total Material Cost**                        |             |      |           | **₹ 7.30**         |
| **Standard Selling Price**                     |             |      |           | **₹ 12.00**        |
| **Gross Margin**                               |             |      |           | **₹ 4.70 (39.2%)** |

**Product:** 20L Water Can — FP-20L-CAN (per can)


| Component                  | SKU         | Qty  | Unit Cost | Line Total           |
| -------------------------- | ----------- | ---- | --------- | -------------------- |
| 20L Blue Jug               | BOT-20L-JUG | 1 pc | ₹ 32.00  | ₹ 32.00             |
| Jug Screw Cap              | CAP-JUG-BLK | 1 pc | ₹ 3.50   | ₹ 3.50              |
| 20L Jug Label              | LBL-STD-20L | 1 pc | ₹ 2.00   | ₹ 2.00              |
| Assembly Overhead          | —          | —   | ₹ 2.00   | ₹ 2.00              |
| **Total Material Cost**    |             |      |           | **₹ 39.50**         |
| **Standard Selling Price** |             |      |           | **₹ 55.00**         |
| **Gross Margin**           |             |      |           | **₹ 15.50 (28.2%)** |

---

### Appendix C — Order Status State Machine (Full)

```
                    ┌──────────────────────────────────────────┐
                    │                ORDER LIFECYCLE           │
                    └──────────────────────────────────────────┘

Customer/Admin/Supervisor creates order
            ↓
      [ PLACED ]
      Stock checked, credit validated
            ↓ Admin confirms
      [ CONFIRMED ]
      Stock reserved
            ↓ Admin triggers assembly/picking
      [ PROCESSING ]
      Being assembled / picked / packed
            ↓ Packing complete
      [ READY TO SHIP ]
      Appears in dispatch queue with weight/volume
            ↓ Delivery Manager assigns driver + vehicle
      [ ASSIGNED ]
      Driver receives push notification
            ↓ Driver marks "Start Delivery"
      [ DISPATCHED ]
      GPS tracking active
      Customer sees live driver on map
            ↓                    ↓
      Driver arrives          Driver cannot complete
      POD captured          
            ↓                    ↓
      [ DELIVERED ]          [ FAILED ]
      Invoice generated      Reason logged
      Stock finalized        Reschedule prompt
      Balance updated        Admin + customer notified

Cancellation paths:
  PLACED/CONFIRMED → [CANCELLED] by customer (before Processing)
  Any status → [CANCELLED] by admin (with mandatory reason)
  Stock released on cancellation
  Refund issued if prepaid

Future Phase 2:
  DELIVERED → [RETURNED] (customer requests return)
```

---

### Appendix D — Sample API Responses

**Product Listing (Customer — custom pricing applied):**

```json
{
  "productId": "FP-1L-PREM",
  "name": "1L Premium Pack (Box of 12)",
  "imageUrl": "https://cdn.aquaflow.in/products/1l-premium.jpg",
  "unit": "box",
  "yourPrice": 120.00,
  "standardPrice": 144.00,
  "discount": "₹24 off",
  "inStock": true,
  "estimatedDelivery": "Tomorrow, Morning slot"
}
```

**Order Placed Response:**

```json
{
  "orderId": "a1b2c3d4-...",
  "orderNumber": "ORD-20260503-0147",
  "status": "placed",
  "totalAmount": 540.00,
  "scheduledDate": "2026-05-04",
  "scheduledSlot": "morning",
  "estimatedDelivery": "Tomorrow 7:00 AM – 12:00 PM",
  "paymentStatus": "pending"
}
```

**WebSocket Message Format (Driver → Server):**

```json
{
  "event": "location_update",
  "deliveryId": "DEL-20260503-0789",
  "orderId": "ORD-20260503-0147",
  "driverId": "DRV-045",
  "lat": 13.0827,
  "lng": 80.2707,
  "speed": 28.5,
  "heading": 180,
  "timestamp": "2026-05-03T10:30:00Z"
}
```

**Daily Summary (Admin Report API):**

```json
{
  "summaryDate": "2026-05-02",
  "totalOrders": 147,
  "deliveredCount": 131,
  "failedCount": 8,
  "cancelledCount": 8,
  "totalRevenue": 14200.00,
  "cashCollected": 5800.00,
  "onlineCollected": 8400.00,
  "gstCollected": 680.00,
  "newCustomers": 4,
  "activeDrivers": 12,
  "avgDeliveryTimeMins": 34
}
```

---

### Appendix E — Compatibility Matrix Example


| Bottle SKU  | Compatible Caps          | Compatible Labels       |
| ----------- | ------------------------ | ----------------------- |
| BOT-1L-CLR  | CAP-STD-RED, CAP-STD-BLU | LBL-PREM-1L, LBL-STD-1L |
| BOT-1L-BLU  | CAP-STD-BLU only         | LBL-PREM-1L, LBL-STD-1L |
| BOT-20L-JUG | CAP-JUG-BLK only         | LBL-STD-20L only        |
| BOT-2L-CLR  | CAP-MED-RED, CAP-MED-BLU | LBL-STD-2L              |

System enforces: When admin selects BOT-20L-JUG in BOM editor → cap dropdown shows ONLY CAP-JUG-BLK.

---

### Appendix F — Notification Templates


| ID  | Trigger                 | Channel        | Message                                                                                   |
| --- | ----------------------- | -------------- | ----------------------------------------------------------------------------------------- |
| N01 | Order placed            | Push + SMS     | "Order #[num] placed ✓ — [product], [qty]. Delivery: [date] [slot]."                    |
| N02 | Order confirmed         | Push           | "Your order is confirmed and being prepared!"                                             |
| N03 | Driver assigned         | Push           | "Your delivery partner [Name] has been assigned. Order on its way soon!"                  |
| N04 | Dispatched              | Push + SMS     | "[Name] is delivering your order now. Track: [link]"                                      |
| N05 | Approaching             | Push           | "Driver is\~5 mins away! Please be available."                                            |
| N06 | Delivered               | Push + SMS     | "Order #[num] delivered ✓. Invoice ready. Rate your experience."                         |
| N07 | Payment received        | Push + SMS     | "Payment of ₹[amount] received. Receipt #[inv]. Balance: ₹[bal]."                       |
| N08 | Payment overdue         | Push + SMS     | "Payment of ₹[amount] due since [date]. Pay now: [link]"                                 |
| N09 | Low stock (admin)       | Email + In-app | "LOW STOCK: [Material] — [qty] units remaining. Min level: [min]. Create PO?"            |
| N10 | Subscription delivery   | Push + SMS     | "Your subscription delivery of [product] is scheduled for tomorrow [slot]."               |
| N11 | Daily report ready      | Email          | "AquaFlow Daily Report — [date]. Revenue: ₹[amount]. Orders: [count]. [View Dashboard]" |
| N12 | New assignment (driver) | Push           | "New delivery assigned: [Customer] at [Address]. [qty] items. [COD/Prepaid]."             |
| N13 | Cost change alert       | Email          | "Raw material cost changed: [Material]. Affected products: [list]. Review prices!"        |

---

### Appendix G — Folder Structure

```
aquaflow/
├── apps/
│   ├── customer-app/            # Flutter
│   │   ├── lib/
│   │   │   ├── screens/
│   │   │   ├── widgets/
│   │   │   ├── providers/       # Riverpod / BLoC state
│   │   │   ├── services/        # API calls, Supabase client
│   │   │   └── models/
│   │   └── pubspec.yaml
│   ├── driver-app/              # Flutter
│   │   ├── lib/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   │   ├── gps_service.dart       # FusedLocationProvider
│   │   │   │   └── websocket_service.dart # GPS broadcast
│   │   │   └── models/
│   │   └── pubspec.yaml
│   └── assignment-app/          # Flutter
│       └── lib/
├── web/
│   ├── admin-dashboard/         # React 18 + Vite + TailwindCSS + Ant Design
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Suppliers/
│   │   │   │   ├── Inventory/
│   │   │   │   ├── Products/
│   │   │   │   ├── BOM/
│   │   │   │   ├── Orders/
│   │   │   │   ├── Dispatch/
│   │   │   │   ├── Analytics/
│   │   │   │   └── Settings/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── lib/             # Supabase client, API helpers
│   │   └── package.json
│   └── marketing-site/          # Next.js 14 (App Router)
│       └── app/
├── supabase/
│   ├── migrations/              # Numbered SQL migration files
│   │   ├── 001_profiles.sql
│   │   ├── 002_suppliers.sql
│   │   ├── 003_inventory.sql
│   │   ├── 004_products_bom.sql
│   │   ├── 005_orders.sql
│   │   ├── 006_billing.sql
│   │   ├── 007_summary_tables.sql
│   │   ├── 008_rls_policies.sql
│   │   └── 009_indexes.sql
│   ├── functions/               # Edge Functions (Deno/TypeScript)
│   │   ├── place-order/
│   │   ├── assign-delivery/
│   │   ├── update-order-status/
│   │   ├── generate-invoice/
│   │   ├── process-payment/
│   │   ├── update-driver-location/
│   │   ├── aggregate-daily/
│   │   ├── rollup-monthly/
│   │   └── create-assembly-order/
│   └── seed/
│       ├── 01_zones.sql
│       ├── 02_raw_materials.sql
│       ├── 03_compatibility.sql
│       └── 04_products.sql
├── n8n/
│   └── workflows/               # Exported n8n JSON workflows
│       ├── 01_nightly_aggregation.json
│       ├── 02_order_notifications.json
│       ├── 03_invoice_generation.json
│       ├── 04_stock_alerts.json
│       ├── 05_payment_reminders.json
│       ├── 06_subscription_orders.json
│       ├── 07_database_backup.json
│       ├── 08_gps_pipeline.json
│       └── 09_cost_change_alert.json
├── infrastructure/
│   └── terraform/               # AWS IaC
│       ├── main.tf
│       ├── variables.tf
│       ├── eks.tf
│       ├── rds.tf
│       └── redis.tf
├── k8s/
│   ├── deployment-api.yaml
│   ├── deployment-socket.yaml
│   ├── deployment-n8n.yaml
│   ├── hpa.yaml
│   └── secrets.yaml
├── docs/
│   ├── PRD.md                   # This document
│   ├── API.md                   # Detailed API documentation
│   ├── RUNBOOK.md               # Operations & incident response
│   └── ONBOARDING.md            # Developer setup guide
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── test.yml
└── README.md
```

---

### Appendix H — n8n Environment Setup Checklist

```
n8n Initial Setup:
  ✅ n8n deployed on dedicated server / K8s pod
  ✅ PostgreSQL database connected (for n8n workflow storage)
  ✅ Encryption key set (N8N_ENCRYPTION_KEY)
  ✅ Webhook URL configured and secured (secret header)
  ✅ n8n behind Nginx reverse proxy (not publicly exposed)

Credentials configured in n8n vault:
  ✅ "Supabase Service Key" — for all DB operations
  ✅ "Twilio SMS" — account SID + auth token
  ✅ "Firebase FCM" — server key
  ✅ "SMTP Email" — for admin reports
  ✅ "Razorpay" — for payment link generation
  ✅ "Slack Webhook" — for critical alerts

Workflows activated and tested:
  ✅ 01 Nightly Aggregation (test run manually first)
  ✅ 02 Order Notifications (test with staging order)
  ✅ 03 Invoice Generation (test with staging delivery)
  ✅ 04 Stock Alert Monitor (test by setting min_stock = current_stock)
  ✅ 05 Payment Reminders (test with dummy overdue invoice)
  ✅ 06 Subscription Auto-Orders (test with subscription next_delivery = today)
  ✅ 07 Database Backup (test run + verify restore from backup)
  ✅ 08 GPS Pipeline (test with mock driver location webhook)
  ✅ 09 Cost Change Alert (test by updating raw_material cost)
```

---

### Appendix I — Pre-Launch Checklist

```
INFRASTRUCTURE:
  ✅ All Kubernetes pods running and healthy
  ✅ Database PITR enabled
  ✅ Redis cluster active
  ✅ All Supabase Edge Functions deployed
  ✅ n8n all workflows active
  ✅ Monitoring alerts configured (Grafana + Uptime Robot)
  ✅ SSL certificates valid

SECURITY:
  ✅ RLS tested on all 20+ tables
  ✅ OWASP ZAP scan passed (no critical/high)
  ✅ All admin accounts have 2FA enabled
  ✅ Supabase anon key scoped (read-only public data only)
  ✅ Service role key: only in n8n + Edge Functions (not in any client)
  ✅ Certificate pinning in all APKs

DATA:
  ✅ Production seed data loaded (zones, products, compatibility rules)
  ✅ Default admin account created (password changed from default)
  ✅ First backup successfully created and verified

APPS:
  ✅ Customer App: signed APK + IPA ready
  ✅ Driver App: signed APK + IPA ready
  ✅ Assignment App: signed APK + IPA ready
  ✅ Admin Dashboard: deployed to production URL
  ✅ Marketing Website: deployed with SSL

COMMUNICATIONS:
  ✅ FCM push notifications tested on Android + iOS
  ✅ SMS OTP delivery tested (Twilio primary + TextLocal fallback)
  ✅ Invoice PDF generation + email tested
  ✅ Razorpay payment flow tested (test mode → switch to live keys)

UAT:
  ✅ All UAT acceptance criteria signed off
  ✅ Client (business owner) demo completed
  ✅ Operations team trained on Admin Dashboard
  ✅ Drivers briefed on Driver App usage
```

---

**END OF DOCUMENT**

---

*AquaFlow PRD v2.0 — Final Combined Version**Combines: AquaFlow PRD v1.0 (Supabase + n8n architecture) + Water Bottle Supply PRD (Supplier, BOM, Inventory, DevOps, Testing)**This document is the single source of truth for all development, QA, and stakeholder decisions.**Any changes must be reviewed by the Product Manager and updated with a new revision entry in Section 1.*
