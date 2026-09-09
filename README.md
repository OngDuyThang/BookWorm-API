# BookWorm API — Distributed Microservices Platform

[![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE0879?logo=typeorm&logoColor=white)](https://typeorm.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-8.11-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-AMQP-FF6600?logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![GraphQL](https://img.shields.io/badge/GraphQL-Apollo_Server-E10098?logo=graphql&logoColor=white)](https://graphql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?logo=stripe&logoColor=white)](https://stripe.com/)
[![AWS S3](https://img.shields.io/badge/AWS-S3_Storage-569A31?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/s3/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Platform-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)

> A production-grade bookstore e-commerce backend built with **NestJS**, organized as a **monorepo microservices architecture**. Features a hybrid API layer (GraphQL for the Next.js Pages Router storefront, REST for administrative operations), asynchronous event-driven RPC inter-service communication over **RabbitMQ**, database-per-service isolation with **PostgreSQL/TypeORM**, two-factor authentication (2FA/TOTP), Stripe payment integration, Cloudinary and AWS S3 asset pipeline, and a dedicated Server-Side Rendered (SSR) Admin Management Dashboard using Handlebars and Tailwind CSS.

---

## Table of Contents

- [Getting Started & Running the Application](#getting-started--running-the-application)
- [Architectural Overview](#architectural-overview)
- [Monorepo Workspace Structure](#monorepo-workspace-structure)
- [Detailed Architecture Diagrams](#detailed-architecture-diagrams)
  - [1. High-Level System Topology](#1-high-level-system-topology)
  - [2. Database Entity Relationship Diagram (ERD)](#2-database-entity-relationship-diagram-erd)
  - [3. Inter-Service RabbitMQ Message RPC Matrix](#3-inter-service-rabbitmq-message-rpc-matrix)
  - [4. Distributed Authentication & Token Binding Flow](#4-distributed-authentication--token-binding-flow)
  - [5. Order Checkout & Distributed Transaction Workflow](#5-order-checkout--distributed-transaction-workflow)
  - [6. Admin Back-Office MVC & File Upload Architecture](#6-admin-back-office-mvc--file-upload-architecture)
- [Microservices Catalog (`apps/`)](#microservices-catalog-apps)
- [Shared Core Libraries (`libs/`)](#shared-core-libraries-libs)
- [API & Interface Reference](#api--interface-reference)
  - [GraphQL Endpoints & Schemas](#graphql-endpoints--schemas)
  - [REST Endpoints by Service](#rest-endpoints-by-service)
  - [RabbitMQ Message Patterns & Payloads](#rabbitmq-message-patterns--payloads)
- [Security & Authentication Mechanics](#security--authentication-mechanics)
- [Environment Configuration](#environment-configuration)

---

## Getting Started & Running the Application

The entire platform is fully containerized and orchestrated with **Docker Compose**. You do **not** need Node.js, npm, PostgreSQL, RabbitMQ, or Redis installed on your host machine — only **Docker** is required.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS, Windows with WSL2) or **Docker Engine & Docker Compose V2** (Linux).
- *No local Node.js or npm installation required on the host.*

---

### Quick Start

#### 1. Clone the Repository
```bash
git clone https://github.com/OngDuyThang/BookWorm-API.git
cd BookWorm-API
```

#### 2. Generate Environment Configuration Files
Before starting the platform for the first time, run the automated setup script to generate `.env.development` files for all microservices from their corresponding `.env.example` templates:

```bash
sh scripts/generate-env.sh
```

#### 3. Fill in Required Credentials
Open the generated environment files and fill in the blank credential values:
- **PostgreSQL Database Credentials** (`apps/<service>/.env.development`):
  - `DB_USERNAME=` *(your database user)*
  - `DB_PASSWORD=` *(your database password)*
- **Auth Service & Initial Admin Account** (`apps/auth/.env.development`):
  - `ADMIN_USERNAME=` *(your initial administrator username)*
  - `ADMIN_PASSWORD=` *(your initial administrator password)*
  - `REDIS_PASSWORD=` *(your Redis password, if configured)*

> [!IMPORTANT]
> Because `.env.development` files are gitignored to prevent sensitive credential leaks, each microservice enforces strict schema validation on startup. You must fill in these required fields before running the containers.

#### 4. Start the Entire Platform
Once the environment files are configured, start all infrastructure services (PostgreSQL, RabbitMQ, Redis) and all 7 microservices in foreground mode:

```bash
docker compose --profile all up
```

> [!TIP]
> Running in foreground mode streams live logs from all containers directly to your terminal. Press `Ctrl + C` at any time to gracefully stop all services.

#### 5. Rebuild & Start (After Updates or Dependency Changes)
When code dependencies change, Dockerfiles are modified, or you need a clean container build:

```bash
docker compose --profile all up --build
```

> [!NOTE]
> **Live Development & Hot Reload**: During everyday coding, you **do not** need to rebuild! All services mount their source directories into the containers with live-reload active (`nest start --watch`). Any code saved in your editor will instantly hot-reload inside the running containers.

#### 6. Stopping the Platform
To gracefully stop all running containers:

```bash
docker compose --profile all down
```

To stop containers and wipe all database and cache volumes (fresh start):

```bash
docker compose --profile all down -v
```

---

### Automated Initialization & Seeding

When you start the stack with `docker compose --profile all up`:

1. **Automatic Multi-Database Provisioning**:
   - The PostgreSQL container automatically mounts and executes [`scripts/init-db.sql`](scripts/init-db.sql) on its first boot.
   - It provisions all 5 isolated databases: `bookworm_auth`, `bookworm_product`, `bookworm_cart`, `bookworm_order`, and `bookworm_asset`.
   - TypeORM schema synchronization automatically creates and updates all entity tables on boot.

2. **Automated Initial Admin User Injection**:
   - The `auth` container automatically runs `apps/auth/src/database/seed-admin.ts` upon startup.
   - It checks whether the administrator user already exists in the database. If not, it hashes the password with bcrypt and inserts the initial administrator account:
     - **Username**: Configured via `ADMIN_USERNAME` in `apps/auth/.env.development` (default: `admin`)
     - **Password**: Configured via `ADMIN_PASSWORD` in `apps/auth/.env.development`
     - **Email**: `admin@bookworm.com`
     - **Role**: `admin` (`ROLE.ADMIN` — granted full administrative privileges across all services and the dashboard)

3. **Infrastructure Readiness & Healthchecks**:
   - All microservices utilize Docker Compose `condition: service_healthy` dependencies. Microservices only boot after PostgreSQL, RabbitMQ, and Redis pass their readiness healthchecks.

---

### Service Access Endpoints

Once the stack is running, all services are accessible via their exposed host ports:

| Service / Tool | Host Port | URL / Interface | Purpose |
|:---|:---|:---|:---|
| **Admin MVC Dashboard** | `8081` | `http://localhost:8081` | SSR Back-Office Management Portal (Handlebars) |
| **Auth Service** | `3000` | `http://localhost:3000/auth/dashboard-login`<br>`http://localhost:3000/auth/login` | Authentication, 2FA/TOTP & Token Issuance |
| **Product Service** | `3001` | `http://localhost:3001/graphql`<br>`http://localhost:3001/api/products` | Store Catalog, Categories, Authors, Promotions, Reviews |
| **Cart Service** | `3002` | `http://localhost:3002/graphql` | Customer & Guest Shopping Carts |
| **Order Service** | `3003` | `http://localhost:3003/graphql`<br>`http://localhost:3003/api/orders` | Checkout, Order Tracking & Stripe Payments |
| **Upload Service** | `3004` | `http://localhost:3004/api/upload/product-image` | Cloudinary & AWS S3 Image Upload Pipeline |
| **Asset Service** | `3005` | `http://localhost:3005/api/assets/about-page` | Static Pages & Content Blocks |
| **RabbitMQ Management** | `15672` | `http://localhost:15672` | Message Broker Web UI (`guest` / `guest`) |
| **PostgreSQL Database** | `5432` | `localhost:5432` | Relational DB Instance |
| **Redis Cache** | `6379` | `localhost:6379` | In-Memory Cache & Session Store |

---

### Admin Dashboard Client-Facing Host Resolution

The Admin MVC Dashboard uses server-side data fetching combined with client-side browser AJAX calls (for actions like creating products, deleting items, and approving customer orders). 

- **Internal calls** made by the MVC container to downstream microservices use Docker internal DNS (`product`, `order`, `asset`).
- **Client-facing calls** made from your web browser resolve via `CLIENT_HOST_NAME` (which defaults to `localhost` in `apps/mvc/.env.development` and `apps/mvc/.env.example`).

All microservice ports (`3000`–`3005`) are exposed to your host machine via Docker Compose, so browser AJAX calls work seamlessly out of the box without requiring manual `/etc/hosts` modifications. If accessing the dashboard from a custom domain or remote IP, simply configure `CLIENT_HOST_NAME` in `apps/mvc/.env.development`.

---

### Docker Compose Profiles Guide

If you want to run specific subsets of services instead of the entire platform, use Compose Profiles:

```bash
# 1. Run only shared infrastructure (PostgreSQL, RabbitMQ, Redis)
docker compose --profile infra up

# 2. Run infrastructure + a single microservice (e.g. Auth)
docker compose --profile infra --profile auth up

# 3. Run all microservices without infrastructure
docker compose --profile services up

# 4. Run a command inside a running container (e.g. manual admin seed)
docker compose exec auth npm run seed:admin
```

---

## Architectural Overview

The BookWorm backend leverages NestJS's first-class monorepo support to implement an enterprise microservice pattern:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                    │
│   ┌─────────────────────────────┐         ┌─────────────────────────────┐   │
│   │   Customer Web Storefront   │         │   Admin Browser / Manager   │   │
│   │  (Next.js Pages Router App) │         │     (SSR Web Dashboard)     │   │
│   └──────────────┬──────────────┘         └──────────────┬──────────────┘   │
└──────────────────┼───────────────────────────────────────┼──────────────────┘
                   │ GraphQL (Public Storefront)           │ HTTP REST & SSR
                   ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MICROSERVICES TIER                                │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────┐   │
│   │ Auth Service │   │Product Serv. │   │ Cart Service │   │Order Serv. │   │
│   │(REST+SSR+RMQ)│   │(REST+GQL+RMQ)│   │  (GQL + RMQ) │   │(REST+G+RMQ)│   │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └─────┬──────┘   │
│          │                  │                  │                 │          │
│   ┌──────┴───────┐   ┌──────┴───────┐          │                 │          │
│   │Upload Service│   │Asset Service │          │                 │          │
│   │ (REST+Cloud) │   │ (REST + DB)  │          │                 │          │
│   └──────────────┘   └──────────────┘          │                 │          │
│   ┌─────────────────────────────────┐          │                 │          │
│   │  Admin MVC Dashboard (SSR/HBS)  │          │                 │          │
│   └─────────────────────────────────┘          │                 │          │
└──────────────────┬─────────────────────────────┼─────────────────┼──────────┘
                   │                             │                 │
                   │    RabbitMQ RPC Message Bus │                 │
                   ▼◄────────────────────────────┴────────────────►▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE TIER                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │PostgreSQL DBs│ │ Redis Cache  │ │ RabbitMQ Bus │ │External Cloud Svcs │  │
│  │(Per-Service) │ │(Tokens & OTP)│ │(AMQP Queues) │ │(AWS S3 & Stripe)   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Design Principles
- **Database-per-Service**: Each microservice manages its own relational database schema and TypeORM DataSource. No cross-database joins are allowed; relational integrity across services is maintained through event-driven messaging and UUID references.
- **Hybrid Protocol Surface**:
  - **GraphQL**: Exposes clean, typed schema APIs for the customer-facing storefront (product browsing, cart manipulation, order checkout).
  - **HTTP REST**: Powers internal/admin CRUD operations and direct binary upload pipelines.
  - **RabbitMQ RPC**: Facilitates high-performance asynchronous and request-response RPC inter-service communication without tight HTTP coupling.
- **Stateless Authentication with Cryptographic Token Binding**: Combines short-lived JWT Access Tokens, long-lived Refresh Tokens, and SHA-256 hashed browser fingerprint cookies to prevent Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
- **Two-Factor Authentication (2FA)**: Time-based One-Time Password (TOTP) algorithms utilizing `otplib` and QR code provisioning for sensitive account actions.

---

## Monorepo Workspace Structure

```
BookWorm-API/
├── apps/                          # Application Microservices
│   ├── asset/                     # Static content & site pages service
│   ├── auth/                      # Authentication, authorization, 2FA & users
│   ├── cart/                      # Shopping cart management (user & guest)
│   ├── mvc/                       # Admin management web dashboard (SSR Handlebars)
│   ├── order/                     # Order lifecycle, checkout & Stripe payments
│   ├── product/                   # Catalog, books, categories, authors, promotions, reviews
│   └── upload/                    # File handling & Cloudinary/AWS S3 upload pipeline
├── libs/                          # Shared Domain & Infrastructure Libraries
│   ├── cache/                     # Redis cache manager module
│   ├── common/                    # Guards, interceptors, filters, decorators, pipes, enums
│   ├── database/                  # Abstract TypeORM entity, repository & module
│   ├── env/                       # Dynamic env loader with class-validator validation
│   ├── graphql/                   # Shared Apollo GraphQL driver module & scalars
│   ├── mailer/                    # Nodemailer email transport module
│   ├── rmq/                       # RabbitMQ microservices client & server wrapper
│   └── s3/                        # AWS S3 client SDK v3 wrapper
├── nest-cli.json                  # NestJS Monorepo configuration
├── package.json                   # Dependencies and workspace run scripts
├── tsconfig.json                  # Root TypeScript configuration with @app/* path aliases
└── docker-compose.yaml            # Local development container orchestration
```

---

## Detailed Architecture Diagrams

### 1. High-Level System Topology

```
                                  ┌────────────────────────┐
                                  │      Client Layer      │
                                  └───────────┬────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
                    ▼                                                   ▼
       ┌─────────────────────────┐                         ┌─────────────────────────┐
       │   Customer Storefront   │                         │     Admin Operator      │
       │ (Next.js Pages Router)  │                         │    (Browser Client)     │
       └────────────┬────────────┘                         └────────────┬────────────┘
                    │                                                   │
                    │ GraphQL (Customer Actions)                        │ HTTP GET / POST
                    │ HTTP POST /auth (Login/2FA)                       │ (Back-office CRUD)
                    ▼                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   MICROSERVICES CLUSTER                                     │
│                                                                                             │
│  ┌───────────────────────┐                    ┌──────────────────────────────────────────┐  │
│  │      Auth Service     │                    │            Admin MVC Service             │  │
│  │ (Port 3000 / HBS / RMQ│                    │      (Port 8081 / SSR Handlebars)        │  │
│  └───────────┬───────────┘                    └────────────────────┬─────────────────────┘  │
│              │                                                     │                        │
│              │                                                     │ Proxies / Consumes     │
│              │                                                     ▼                        │
│  ┌───────────┴───────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐  │
│  │    Product Service    │    │       Cart Service       │    │      Order Service       │  │
│  │ (Port 3001 / REST+GQL)│    │  (Port 3002 / GQL + RMQ) │    │  (Port 3003 / REST+GQL)  │  │
│  └───────────┬───────────┘    └────────────┬─────────────┘    └────────────┬─────────────┘  │
│              │                             │                               │                │
│              │                             │                               │                │
│  ┌───────────┴───────────┐                 │                  ┌────────────┴─────────────┐  │
│  │      Asset Service    │                 │                  │      Upload Service      │  │
│  │   (Port 3005 / REST)  │                 │                  │    (Port 3004 / REST)    │  │
│  └───────────┬───────────┘                 │                  └────────────┬─────────────┘  │
│              │                             │                               │                │
└──────────────┼─────────────────────────────┼───────────────────────────────┼────────────────┘
               │                             │                               │
               ▼                             ▼                               ▼
┌──────────────────────────┐   ┌──────────────────────────┐    ┌──────────────────────────┐
│   RabbitMQ Message Bus   │   │     PostgreSQL Nodes     │    │   Third-Party Services   │
│ ┌──────────────────────┐ │   │ ┌──────────────────────┐ │    │ ┌──────────────────────┐ │
│ │ AUTH_QUEUE           │ │   │ │ auth_db              │ │    │ │ AWS S3 Storage       │ │
│ │ PRODUCT_QUEUE        │ │   │ │ product_db           │ │    │ │ (Images & Avatars)   │ │
│ │ CART_QUEUE           │ │   │ │ cart_db              │ │    │ ├──────────────────────┤ │
│ │ ORDER_QUEUE          │ │   │ │ order_db             │ │    │ │ Stripe API           │ │
│ └──────────────────────┘ │   │ │ asset_db             │ │    │ │ (Credit Card Charge) │ │
│                          │   │ └──────────────────────┘ │    │ ├──────────────────────┤ │
│ ┌──────────────────────┐ │   │                          │    │ │ SMTP Mail Server     │ │
│ │ Redis (Session/OTP)  │ │   │                          │    │ │ (Password Reset)     │ │
│ └──────────────────────┘ │   │                          │    │ └──────────────────────┘ │
└──────────────────────────┘   └──────────────────────────┘    └──────────────────────────┘
```

---

### 2. Database Entity Relationship Diagram (ERD)

Each microservice manages its own isolated PostgreSQL database. Foreign keys within the same database enforce relational integrity; logical cross-database references are designated with `[Logical FK]`.

```
===================================================================================================
                                      AUTH SERVICE DATABASE
===================================================================================================
┌───────────────────────────────────────┐
│                 user                  │
├───────────────────────────────────────┤
│ PK id                : uuid           │
│    created_at        : timestamp      │
│    updated_at        : timestamp      │
│    username          : varchar(50) [U]│
│    password          : text           │
│    first_name        : varchar(50)    │
│    last_name         : varchar(50)    │
│    email             : varchar(50) [U]│
│    phone             : varchar(50) [U]│
│    picture           : text           │
│    openid_provider   : varchar(20)    │
│    enable_two_factor : boolean        │
│    two_factor_secret : text           │
│    one_time_token    : text           │
│    api_key           : uuid           │
│    role              : varchar(20)    │
│    active            : boolean        │
└───────────┬───────────────────┬───────┘
            │ 1                 │ 1
            │                   │
            │ *                 │ *
┌───────────▼───────────┐   ┌───▼───────────────────┐
│     user_address      │   │     user_payment      │
├───────────────────────┤   ├───────────────────────┤
│ PK id         : uuid  │   │ PK id          : uuid │
│ FK user_id    : uuid  │   │ FK user_id     : uuid │
│    created_at : time  │   │    created_at  : time │
│    updated_at : time  │   │    updated_at  : time │
│    address_1  : vchar │   │    payment_id  : vchar│
│    address_2  : vchar │   │    pay_type    : vchar│
│    city       : vchar │   │    provider    : vchar│
│    postal_code: vchar │   │    account_no  : vchar│
│    country    : vchar │   └───────────────────────┘
│    phone      : vchar │
└───────────────────────┘

===================================================================================================
                                     PRODUCT SERVICE DATABASE
===================================================================================================
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│        author         │   │   product_category    │   │       promotion       │
├───────────────────────┤   ├───────────────────────┤   ├───────────────────────┤
│ PK id         : uuid  │   │ PK id         : uuid  │   │ PK id         : uuid  │
│    created_at : time  │   │    created_at : time  │   │    created_at : time  │
│    updated_at : time  │   │    updated_at : time  │   │    updated_at : time  │
│    pen_name   : vchar │   │    name       : vchar │   │    name       : vchar │
└───────────┬───────────┘   │    active     : bool  │   │    description: text  │
            │               │ FK parent_id  : uuid ─┼─┐ │    discount_% : float │
            │               └───────────┬───────────┘ │ │    level      : vchar │
            │ 1                         │ 1           │ │    condition  : vchar │
            │                           │             └─┘    value      : float │
            │                           │                    image      : text  │
            │                           │                    active     : bool  │
            │                           │               └───────────┬───────────┘
            │                           │                           │ 1
            │ *                         │ *                         │ *
┌───────────▼───────────────────────────▼───────────────────────────▼───────────┐
│                                    product                                    │
├───────────────────────────────────────────────────────────────────────────────┤
│ PK id               : uuid                                                    │
│    created_at       : timestamp                                               │
│    updated_at       : timestamp                                               │
│    title            : varchar(255)                                            │
│    description      : text                                                    │
│    price            : decimal                                                 │
│    image            : text                                                    │
│ FK author_id        : uuid (SET NULL)                                         │
│ FK category_id      : uuid (SET NULL)                                         │
│ FK promotion_id     : uuid (SET NULL)                                         │
│    rating           : decimal                                                 │
│    ratings          : decimal[]                                               │
│    active           : boolean                                                 │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │ 1
                                        │
                                        │ *
                            ┌───────────▼───────────┐
                            │        review         │
                            ├───────────────────────┤
                            │ PK id          : uuid │
                            │    created_at  : time │
                            │    updated_at  : time │
                            │ FK product_id  : uuid │
                            │ LF user_id     : uuid │◄─── [Logical FK to Auth.user.id]
                            │    rating      : float│
                            │    title       : text │
                            │    description : text │
                            │    status      : text │
                            └───────────────────────┘

===================================================================================================
                                      CART SERVICE DATABASE
===================================================================================================
┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
│                 cart                  │   │               temp_cart               │
│         (Registered User)             │   │            (Guest Session)            │
├───────────────────────────────────────┤   ├───────────────────────────────────────┤
│ PK id         : uuid                  │   │ PK id         : uuid                  │
│ LF user_id    : uuid ◄────────────────┼─┐ │    guest_id   : varchar(255)          │
│    created_at : timestamp             │ │ │    created_at : timestamp             │
│    updated_at : timestamp             │ │ │    updated_at : timestamp             │
│    total      : decimal               │ │ │    total      : decimal               │
└───────────────────┬───────────────────┘ │ └───────────────────┬───────────────────┘
                    │ 1                   │                     │ 1
                    │                     │ [Logical FK to      │
                    │ *                   │  Auth.user.id]      │ *
┌───────────────────▼───────────────────┐ │ ┌───────────────────▼───────────────────┐
│               cart_item               │ │ │            temp_cart_item             │
├───────────────────────────────────────┤ │ ├───────────────────────────────────────┤
│ PK id         : uuid                  │ │ │ PK id           : uuid                │
│ FK cart_id    : uuid                  │ │ │ FK temp_cart_id : uuid                │
│ LF product_id : uuid ◄────────────────┼─┼─┤ LF product_id   : uuid ◄──────────────┼─┐
│    created_at : timestamp             │ │ │    created_at   : timestamp           │ │
│    updated_at : timestamp             │ │ │    updated_at   : timestamp           │ │
│    quantity   : decimal               │ │ │    quantity     : decimal             │ │
└───────────────────────────────────────┘ │ └───────────────────────────────────────┘ │
                                          │                                           │
==========================================╪===========================================╪===========
                                     ORDER│SERVICE DATABASE                           │
==========================================╪===========================================╪===========
┌─────────────────────────────────────────┼─────────────────────────────────────────┐ │
│                  order                  │                                         │ │
├─────────────────────────────────────────┤                                         │ │
│ PK id             : uuid                │                                         │ │
│ LF user_id        : uuid ───────────────┘                                         │ │
│    created_at     : timestamp                                                     │ │
│    updated_at     : timestamp                                                     │ │
│    total          : decimal                                                       │ │
│    status         : varchar(50)                                                   │ │
│    address        : varchar(255)                                                  │ │
│    email          : varchar(100)                                                  │ │
│    name           : varchar(100)                                                  │ │
│    phone          : varchar(50)                                                   │ │
│    payment_method : varchar(50) ('COD' | 'STRIPE')                                │ │
└───────────────────┬───────────────────────────────────────────────────────────────┘ │
                    │ 1                                                               │
                    │                                                                 │
                    │ *                                                               │
┌───────────────────▼───────────────────┐                                             │
│              order_item               │                                             │
├───────────────────────────────────────┤                                             │
│ PK id         : uuid                  │                                             │
│ FK order_id   : uuid                  │                                             │
│ LF product_id : uuid ─────────────────┴─────────────────────────────────────────────┴─┘
│    created_at : timestamp                                 [Logical FK to Product.product.id]
│    updated_at : timestamp
│    quantity   : decimal
└───────────────────────────────────────┘

===================================================================================================
                                      ASSET SERVICE DATABASE
===================================================================================================
┌───────────────────────────────────────┐
│                 page                  │
├───────────────────────────────────────┤
│ PK id         : uuid                  │
│    created_at : timestamp             │
│    updated_at : timestamp             │
│    content    : text (About/Site Info)│
└───────────────────────────────────────┘
```

---

### 3. Inter-Service RabbitMQ Message RPC Matrix

Services communicate synchronously via NestJS `ClientProxy.send({ cmd }, payload)` over RabbitMQ queues:

```
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│ Auth Service │                 │Product Serv. │                 │ Cart Service │
└──────┬───────┘                 └──────┬───────┘                 └──────┬───────┘
       │                                │                                │
       │◄─── VALIDATE_JWT ──────────────┼────────────────────────────────┤ (Any Service)
       │     (verify token & claims)    │                                │
       │───► UserEntity returned ───────┼───────────────────────────────►│
       │                                │                                │
       │                                │◄─── GET_PRODUCT_BY_ID ─────────┤ (Cart Item Add)
       │                                │     (fetch product details)    │
       │                                ├──── ProductSchema ────────────►│
       │                                │                                │
       │                                ├──── REMOVE_CART_ITEM ─────────►│ (Product Delete)
       │                                │     (cascade item deletion)    │
       │                                │◄─── Boolean ACK ───────────────┤
       │                                │                                │
┌──────┴───────┐                        │                                │
│Order Service │                        │                                │
└──────┬───────┘                        │                                │
       │                                │                                │
       ├───── GET_CART_BY_USER ─────────┼───────────────────────────────►│ (Order Create)
       │      (fetch user cart)         │                                │
       │◄──── CartSchema ───────────────┼────────────────────────────────┤
       │                                │                                │
       │───── DELETE_CART ──────────────┼───────────────────────────────►│ (Post Checkout)
       │      (clear active cart)       │                                │
       │◄──── Boolean ACK ──────────────┼────────────────────────────────┤
       │                                │                                │
       │◄──── GET_POPULAR_PRODUCTS ─────┤                                │ (Top Sellers)
       │      (order aggregated IDs)    │                                │
       ├───── string[] productIds ─────►│                                │
       │                                │                                │
       ├───── FIND_ORDER_PROMOTION ────►│                                │ (Discount Calc)
       │      (order subtotal amount)   │                                │
       │◄──── PromotionEntity ──────────┤                                │
```

#### Complete RPC Command Reference

| Command (`SERVICE_MESSAGE`) | Target Queue | Caller Service | Receiver Service | Request Payload | Return Type | Description |
|:---|:---|:---|:---|:---|:---|:---|
| `VALIDATE_JWT` | `AUTH_QUEUE` | Product, Cart, Order, Asset | `AuthService` | `{ accessToken, fingerprint }` | `UserEntity` | Validates JWT & cookie fingerprint, returns authenticated user object |
| `GET_PRODUCT_BY_ID` | `PRODUCT_QUEUE` | `CartService` | `ProductService` | `productId: string` | `ProductSchema` | Retrieves book pricing, title, author, and discount to enrich cart item |
| `REMOVE_CART_ITEM` | `CART_QUEUE` | `ProductService` | `CartService` | `productId: string` | `boolean` | Purges cart items referencing a deleted product across all carts |
| `GET_CART_BY_USER` | `CART_QUEUE` | `OrderService` | `CartService` | `userId: string` | `CartSchema` | Retrieves active user cart with items before creating an order |
| `DELETE_CART` | `CART_QUEUE` | `OrderService` | `CartService` | `cartId: string` | `boolean` | Deletes/clears the user's cart after order records are committed |
| `GET_POPULAR_PRODUCTS` | `ORDER_QUEUE` | `ProductService` | `OrderService` | `{}` | `string[]` | Aggregates order item sales count to determine popular product IDs |
| `FIND_ORDER_PROMOTION` | `PRODUCT_QUEUE` | `OrderService` | `ProductService` | `total: number` | `PromotionEntity` | Identifies best matching order-level discount for the given subtotal |

---

### 4. Distributed Authentication & Token Binding Flow

The application implements an OAuth2-style Authorization Code and TOTP Two-Factor Authentication flow designed to mitigate credential interception and token theft:

```
[ Browser Client ]       [ Auth Service (3000) ]     [ Redis Cache ]     [ Protected Service (e.g. Cart) ]
        │                           │                       │                           │
        │ 1. POST /auth/login       │                       │                           │
        │    (username, password)   │                       │                           │
        ├──────────────────────────►│                       │                           │
        │                           │ 2. Check credentials  │                           │
        │                           │    & verify 2FA flag  │                           │
        │ 3. 2FA Required Redirect  │                       │                           │
        │◄──────────────────────────┤                       │                           │
        │                           │                       │                           │
        │ 4. POST /auth/validate-otp│                       │                           │
        │    (6-digit TOTP code)    │                       │                           │
        ├──────────────────────────►│                       │                           │
        │                           │ 5. Validate OTP via   │                           │
        │                           │    otplib secret      │                           │
        │                           │                       │                           │
        │                           │ 6. Gen AuthCode       │                           │
        │                           ├──────────────────────►│ (TTL: 100s)               │
        │                           │    SET auth_code:user │                           │
        │ 7. Redirect to /callback  │                       │                           │
        │    ?code=<authCode>       │                       │                           │
        │◄──────────────────────────┤                       │                           │
        │                                                   │                           │
        │ 8. POST /auth/token { authCode }                  │                           │
        ├──────────────────────────►│                       │                           │
        │                           │ 9. Verify & delete    │                           │
        │                           ├──────────────────────►│                           │
        │                           │    GET & DEL code     │                           │
        │                           │                                                   │
        │                           │ 10. Issue Tokens:                                 │
        │                           │     - access_token (JWT, 15m)                     │
        │                           │     - refresh_token (JWT, 7d, HttpOnly Cookie)    │
        │                           │     - fingerprint (UUID SHA-256 Cookie)           │
        │ 11. Response Payload:     │                                                   │
        │     { access_token }      │                                                   │
        │     + Set-Cookie: fingerp.│                                                   │
        │     + Set-Cookie: refresh.│                                                   │
        │◄──────────────────────────┤                                                   │
        │                                                                               │
        │ 12. GraphQL Mutation / Query                                                  │
        │     Header: Authorization: Bearer <access_token>                              │
        │     Cookie: fingerprint=<fingerprint>                                         │
        ├──────────────────────────────────────────────────────────────────────────────►│
        │                                                                               │
        │                                                   13. PermissionRequestGuard  │
        │                                                       extracts Bearer & Cookie│
        │                                                       RPC over RabbitMQ:      │
        │                           │◄────────────────────────── VALIDATE_JWT ──────────┤
        │                           │                                                   │
        │                           │ 14. Verify JWT Signature                          │
        │                           │     Hash fingerprint & match                      │
        │                           │     claims in token                               │
        │                           ├─────────────────────────── UserEntity ───────────►│
        │                                                                               │
        │                                                   15. RolesGuard checks role  │
        │                                                       Executes Resolver/Logic │
        │ 16. GraphQL Data Response                                                     │
        │◄──────────────────────────────────────────────────────────────────────────────┤
```

---

### 5. Order Checkout & Distributed Transaction Workflow

Order placement guarantees transactional consistency across the independent Order and Cart microservices:

```
[ Customer Client ]       [ Order Service ]       [ Cart Service ]       [ Product Service ]       [ Stripe Gateway ]
         │                        │                      │                        │                         │
         │ 1. placeOrder(dto)     │                      │                        │                         │
         │    (address, method)   │                      │                        │                         │
         ├───────────────────────►│                      │                        │                         │
         │                        │ 2. RMQ: GET_CART_BY_USER                      │                         │
         │                        ├─────────────────────►│                        │                         │
         │                        │                      │ 3. Fetch cart & items  │                         │
         │                        │◄─────────────────────┤                        │                         │
         │                        │    CartSchema return │                        │                         │
         │                        │                                               │                         │
         │                        │ 4. RMQ: FIND_ORDER_PROMOTION                  │                         │
         │                        ├──────────────────────────────────────────────►│                         │
         │                        │                                               │ 5. Evaluate order tiers │
         │                        │◄──────────────────────────────────────────────┤                         │
         │                        │    PromotionEntity return                     │                         │
         │                        │                                                                         │
         │                        │ 6. START TRANSACTION (PostgreSQL)                                       │
         │                        │    - Insert Order Record (Status: Pending)                              │
         │                        │                                                                         │
         │                        │ 7. RMQ: DELETE_CART                                                     │
         │                        ├─────────────────────►│                                                  │
         │                        │                      │ 8. Remove active items                           │
         │                        │◄─────────────────────┤                                                  │
         │                        │    Boolean true ACK  │                                                  │
         │                        │                                                                         │
         │                        │ 9. COMMIT TRANSACTION (Order + OrderItems)                              │
         │                        │                                                                         │
         │                        │ 10. If payment_method == 'STRIPE':                                      │
         │                        │     Create PaymentIntent(order.total)                                   │
         │                        ├────────────────────────────────────────────────────────────────────────►│
         │                        │◄────────────────────────────────────────────────────────────────────────┤
         │                        │     Stripe ClientSecret & ID                                            │
         │                        │                                                                         │
         │ 11. Return Response    │                                                                         │
         │     { clientSecret,    │                                                                         │
         │       orderId }        │                                                                         │
         │◄───────────────────────┤                                                                         │
```

---

### 6. Admin Back-Office MVC & File Upload Architecture

Administrative staff interact with the system via a dedicated Server-Side Rendered (SSR) management portal in `apps/mvc` built with NestJS Express, Handlebars (`.hbs`), and Tailwind CSS:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       ADMIN BROWSER CLIENT                                       │
└──────────────────┬─────────────────────────────────┬─────────────────────────────────────────────┘
                   │                                 │
                   │ 1. GET /products/create         │ 4. Direct Image Upload:
                   │    (Authenticated via Cookie)   │    POST /api/upload/product-image
                   ▼                                 ▼
┌──────────────────────────────────────┐   ┌───────────────────────────────────────────────────────┐
│           apps/mvc (Port 8081)       │   │                apps/upload (Port 3004)                │
│ ┌──────────────────────────────────┐ │   │ ┌───────────────────────────────────────────────────┐ │
│ │ DashboardMiddleware              │ │   │ │ ParseFilePipe (max 50MB, jpg/png/jpeg)            │ │
│ │ - Validates fingerprint & refresh│ │   │ │ Cloudinary (v2) / S3Service (v1)                  │ │
│ │   token cookies; redirects to    │ │   │ └─────────────────────────┬─────────────────────────┘ │
│ │   /auth/dashboard-login if absent│ │   └───────────────────────────┼───────────────────────────┘
│ └────────────────┬─────────────────┘                                 │
│                  │                                                   ▼
│                  │ 2. Aggregates data:               ┌───────────────────────────────────────┐
│                  │    - GET /api/authors (Product)   │          Cloudinary / AWS S3          │
│                  │    - GET /api/categories (Product)│          (Public CDN URL)             │
│                  │    - GET /api/promotions (Product)└───────────────────────────────────────┘
│                  │                                                   ▲
│                  ▼                                                   │ 5. Returns image URL
│ ┌──────────────────────────────────┐                                 │
│ │ Handlebars Template Compilation  │                                 │
│ │ - views/product/create.hbs       │─────────────────────────────────┘
│ │ - Populates author & cat dropdowns
│ │ - Submits form to Product REST API
│ └──────────────────────────────────┘
```

---

## Microservices Catalog (`apps/`)

### 1. `apps/auth` (Authentication & User Management)
- **Port**: `3000`
- **Transport**: HTTP (REST & SSR Views) + RabbitMQ (`AUTH_QUEUE`)
- **Database**: PostgreSQL (`auth_db` — tables: `user`, `user_address`, `user_payment`)
- **Cache**: Redis (`cache-manager-redis-store`)
- **Key Features**:
  - Local strategy login with bcrypt password hashing.
  - TOTP two-factor authentication via `otplib` and QR code generator (`qrcode`).
  - Google OAuth2 integration (`passport-google-oauth2`).
  - Single-use password reset tokens transmitted via email (`@app/mailer`).
  - Centralized microservice authorization server (`SERVICE_MESSAGE.VALIDATE_JWT`).

### 2. `apps/product` (Catalog & Reviews)
- **Port**: `3001`
- **Transport**: HTTP (REST for Admin CRUD) + GraphQL (`/graphql`) + RabbitMQ (`PRODUCT_QUEUE`)
- **Database**: PostgreSQL (`product_db` — tables: `product`, `product_category`, `author`, `promotion`, `review`)
- **Key Features**:
  - Full-text search and multi-facet filtering (categories, authors, rating threshold, pricing).
  - Self-referencing category tree (parent/child categories).
  - Product discount promotions (percentage, minimum condition tiers).
  - Star reviews and ratings aggregation.
  - Asynchronous cache-invalidation on cart items when products are removed.

### 3. `apps/cart` (Shopping Cart)
- **Port**: `3002`
- **Transport**: GraphQL (`/graphql`) + RabbitMQ (`CART_QUEUE`)
- **Database**: PostgreSQL (`cart_db` — tables: `cart`, `cart_item`, `temp_cart`, `temp_cart_item`)
- **Key Features**:
  - Dual cart system: Persistent carts for registered users, session carts for anonymous guests (`temp_cart`).
  - Real-time cart total calculation querying current product pricing from `ProductService`.
  - Automated cart cleanup upon order submission.

### 4. `apps/order` (Orders & Payment Processing)
- **Port**: `3003`
- **Transport**: HTTP (REST for Admin CRUD) + GraphQL (`/graphql`) + RabbitMQ (`ORDER_QUEUE`)
- **Database**: PostgreSQL (`order_db` — tables: `order`, `order_item`)
- **Payment Provider**: Stripe API SDK v15 (`stripe`)
- **Key Features**:
  - Atomic order creation orchestrating RabbitMQ requests across `CartService` and `ProductService`.
  - Cash-on-Delivery (COD) and Stripe PaymentIntent generation.
  - Sales aggregation for top-selling and popular book rankings.

### 5. `apps/upload` (File Storage Pipeline)
- **Port**: `3004`
- **Transport**: HTTP REST
- **Cloud Provider**: Cloudinary (v2), AWS S3 SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/lib-storage` - v1 legacy)
- **Key Features**:
  - Validated multipart form uploads using `Multer` and `ParseFilePipe`.
  - Automatic stream uploading to Cloudinary (v2) or Amazon S3 buckets returning permanent public asset URLs.

### 6. `apps/asset` (Static CMS & Site Pages)
- **Port**: `3005`
- **Transport**: HTTP REST
- **Database**: PostgreSQL (`asset_db` — table: `page`)
- **Key Features**:
  - Dynamic store metadata management (e.g., About Us page content).
  - Protected with role-based admin guards (`ROLE.ADMIN`).

### 7. `apps/mvc` (Admin SSR Management Dashboard)
- **Port**: `8081`
- **Transport**: HTTP (Express + Handlebars SSR)
- **Key Features**:
  - Server-side rendered administration portal styled with Tailwind CSS.
  - Back-office controllers managing books, categories, promotions, orders, reviews, and site pages.
  - Built-in session validation redirecting unauthenticated operators to Auth Service 2FA dashboard.

---

## Shared Core Libraries (`libs/`)

| Library Path | Package Name | Description & Key Exports |
|:---|:---|:---|
| `libs/common` | `@app/common` | Core decorators (`@GetUser`, `@Roles`, `@ApiController`), guards (`PermissionRequestGuard`, `@RolesGuard`), interceptors (`ReshapeDataInterceptor`), exception filters, pipes (`UUIDPipe`, `PaginationPipe`), and common DTOs/schemas. |
| `libs/database` | `@app/database` | Base TypeORM configuration module, `AbstractEntity` (UUID, timestamps, soft-delete), and `AbstractRepository` implementing generic CRUD and query building. |
| `libs/rmq` | `@app/rmq` | RabbitMQ abstraction configuring AMQP transports, persistent queues, manual acknowledgments (`sendAck`), and client proxies. |
| `libs/graphql` | `@app/graphql` | Apollo Driver integration module configuring code-first GraphQL schema generation and custom scalars (`DateScalar`). |
| `libs/cache` | `@app/cache` | CacheManager module configured with Redis store (`cache-manager-redis-store`) for fast TTL-based token and OTP storage. |
| `libs/env` | `@app/env` | Strongly-typed environment configuration service utilizing `class-validator` to guarantee required environment variables at boot time. |
| `libs/mailer` | `@app/mailer` | Nodemailer integration providing HTML email dispatch for password reset workflows. |
| `libs/s3` | `@app/s3` | AWS S3 client service handling file stream uploads and public URL resolution. |

---

## API & Interface Reference

### GraphQL Endpoints & Schemas

GraphQL APIs are exposed on `/graphql` of the respective microservice:

#### Product Service (`http://localhost:3001/graphql`)
```graphql
type Query {
  product(id: String!): ProductEntity!
  products(authorIds: [String!], categoryIds: [String!], ratings: [Int!], sort: String = "ON_SALE", limit: Int = 10, page: Int = 0): ProductList!
  popularProducts: [ProductEntity!]!
  recommendProducts: [ProductEntity!]!
  promotionProducts: [ProductEntity!]!
  searchProducts: [ProductEntity!]!
  categories: [CategoryEntity!]!
  category(id: String!): CategoryEntity!
  authors: [AuthorEntity!]!
  author(id: String!): AuthorEntity!
  promotions: [PromotionEntity!]!
  promotion(id: String!): PromotionEntity!
  reviews: [ReviewEntity!]!
  review(id: String!): ReviewEntity!
}

type Mutation {
  createReview(review: CreateReviewDto!): ReviewEntity!
}
```

#### Cart Service (`http://localhost:3002/graphql`)
```graphql
type Query {
  cart: CartEntity!                                  # Authenticated user cart
  cartForGuest(guestId: String!): TempCartEntity!    # Guest cart
  getUserCartCount: Float!
  getGuestCartCount(guestId: String!): Float!
}

type Mutation {
  createCartItem(item: CreateCartItemDto!): CartItemEntity!
  updateCartItem(id: String!, quantity: Float!): String!
  deleteCartItem(id: String!): String!
  createCartItemForGuest(guestId: String!, item: CreateTempItemDto!): TempItemEntity!
  updateCartItemForGuest(id: String!, quantity: Float!): String!
  deleteCartItemForGuest(id: String!): String!
}
```

#### Order Service (`http://localhost:3003/graphql`)
```graphql
type Mutation {
  placeOrder(order: CreateOrderDto!): TPaymentResponse!
  updatePaymentStatus(orderId: String!, payment_status: String!): String!
}
```

---

### REST Endpoints by Service

#### Auth Service (`http://localhost:3000`)
- `POST /auth/register` — Register new user account.
- `POST /auth/login` — Initiate customer login; triggers 2FA check or returns auth callback.
- `POST /auth/dashboard-login` — Initiate admin dashboard login.
- `POST /auth/validate-otp` — Verify 6-digit TOTP code for customer session.
- `POST /auth/dashboard-validate-otp` — Verify TOTP code for admin session.
- `POST /auth/token` — Exchange authorization code for JWT Access Token, Refresh Token, and Fingerprint cookie.
- `PATCH /auth/enable-2fa` — Generate TOTP secret and QR code provisioning URI.
- `PATCH /auth/disable-2fa` — Disable two-factor authentication.
- `POST /auth/forgot-password` — Issue password-reset email with one-time token.
- `PATCH /auth/reset-password` — Update password using validated one-time token.
- `GET /auth/google` & `/auth/google/callback` — Google OAuth2 authentication.
- `POST /auth/refresh` — Issue fresh Access Token using valid Refresh Token & Fingerprint.
- `POST /auth/logout` — Invalidate session and clear HTTP cookies.

#### Product Service (`http://localhost:3001/api`)
- `GET /api/products` — Paginated list of products.
- `GET /api/products/all` — Unpaginated list of products (internal/admin).
- `GET /api/products/:id` — Single product details.
- `POST /api/products` — Create book (`ROLE.ADMIN`).
- `PATCH /api/products/:id` — Update book (`ROLE.ADMIN`).
- `DELETE /api/products/:id` — Soft-delete book (`ROLE.ADMIN`).
- `DELETE /api/products/delete/:id` — Permanent delete book (`ROLE.ADMIN`).
- `GET /api/categories`, `POST /api/categories`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id`
- `GET /api/authors`, `POST /api/authors`, `PATCH /api/authors/:id`, `DELETE /api/authors/:id`
- `GET /api/promotions`, `POST /api/promotions`, `PATCH /api/promotions/:id`, `DELETE /api/promotions/:id`
- `GET /api/reviews`, `PATCH /api/reviews/:id` (approve/reject review status), `DELETE /api/reviews/:id`

#### Order Service (`http://localhost:3003/api`)
- `GET /api/orders` — List orders (`ROLE.ADMIN`).
- `GET /api/orders/:id` — Single order details (`ROLE.ADMIN`).
- `PATCH /api/orders/:id` — Update order delivery/payment status (`ROLE.ADMIN`).
- `DELETE /api/orders/:id` — Remove order record (`ROLE.ADMIN`).

#### Upload Service (`http://localhost:3004/api`)
- `POST /api/upload/product-image` — Multipart upload for book cover images -> Cloudinary (v2) / AWS S3 (v1).
- `POST /api/upload/user-picture` — Multipart upload for user avatars -> Cloudinary (v2) / AWS S3 (v1).

#### Asset Service (`http://localhost:3005/api`)
- `GET /api/assets/about-page` — Fetch store About Page copy.
- `PATCH /api/assets/about-page` — Update store About Page copy (`ROLE.ADMIN`).

---

### RabbitMQ Message Patterns & Payloads

All services listen on their dedicated queues specified in `libs/common/src/enums/rmq.ts`:

| Queue Constant | Environment Variable Key | Bound Microservice |
|:---|:---|:---|
| `QUEUE_NAME.AUTH` | `AUTH_QUEUE` | `AuthService` |
| `QUEUE_NAME.PRODUCT` | `PRODUCT_QUEUE` | `ProductService` |
| `QUEUE_NAME.CART` | `CART_QUEUE` | `CartService` |
| `QUEUE_NAME.ORDER` | `ORDER_QUEUE` | `OrderService` |

---

## Security & Authentication Mechanics

1. **Token Binding (`fingerprint`)**:
   - During login, the server generates a cryptographically random UUID `fingerprint` and issues it as an `HttpOnly`, `SameSite=Strict` cookie.
   - A SHA-256 hash of this fingerprint is embedded into the signed JWT access token claims.
   - On incoming requests, `PermissionRequestGuard` extracts both the Bearer token and the cookie, passing them to `AuthService`. If the hash of the cookie does not match the token's embedded claim, the request is rejected with `401 Unauthorized`.
2. **Two-Factor Authentication (TOTP)**:
   - Built on `otplib`. When enabled, secrets are stored in the user record, and login yields a temporary `ValidateOtpGuard` requirement before any session tokens are minted.
3. **Role-Based Access Control (RBAC)**:
   - Decorator `@Roles([ROLE.ADMIN, ROLE.USER])` coupled with `RolesGuard` ensures that only authorized entities can perform administrative operations. `ROLE.ADMIN` automatically inherits execution rights across all protected endpoints.

---

## Environment Configuration

Each microservice loads its configuration from an environment-specific file:
```
apps/<service_name>/.env.${NODE_ENV}
```
*(e.g., `apps/auth/.env.development` or `apps/product/.env.production`)*

### Common Variables Across Services (Docker Compose Network)

```ini
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
RABBIT_MQ_URI=amqp://guest:guest@rabbitmq:5672
```

### Service-Specific Variable Matrix

| Service | Unique Environment Variables |
|:---|:---|
| `auth` | `DB_NAME=bookworm_auth`<br>`SERVICE_PORT=3000`<br>`AUTH_QUEUE=auth_queue`<br>`REDIS_HOST=redis`<br>`REDIS_PORT=6379`<br>`REDIS_USERNAME=`<br>`REDIS_PASSWORD=`<br>`ADMIN_USERNAME=admin`<br>`ADMIN_PASSWORD=`<br>`ACCESS_TOKEN_SECRET=your_jwt_access_token_secret`<br>`REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret`<br>`MAILER_USERNAME=`<br>`MAILER_PASSWORD=`<br>`GOOGLE_CLIENT_ID=your_client_id`<br>`GOOGLE_CLIENT_SECRET=your_client_secret`<br>`GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback`<br>`FRONTEND_HOST_NAME=localhost`<br>`FRONTEND_PORT=3006`<br>`MVC_HOST_NAME=localhost`<br>`MVC_PORT=8081` |
| `product` | `DB_NAME=bookworm_product`<br>`SERVICE_PORT=3001`<br>`AUTH_QUEUE=auth_queue`<br>`PRODUCT_QUEUE=product_queue`<br>`CART_QUEUE=cart_queue`<br>`ORDER_QUEUE=order_queue` |
| `cart` | `DB_NAME=bookworm_cart`<br>`SERVICE_PORT=3002`<br>`AUTH_QUEUE=auth_queue`<br>`PRODUCT_QUEUE=product_queue`<br>`CART_QUEUE=cart_queue`<br>`ORDER_QUEUE=order_queue` |
| `order` | `DB_NAME=bookworm_order`<br>`SERVICE_PORT=3003`<br>`AUTH_QUEUE=auth_queue`<br>`PRODUCT_QUEUE=product_queue`<br>`CART_QUEUE=cart_queue`<br>`ORDER_QUEUE=order_queue`<br>`STRIPE_SECRET_KEY=sk_test_...` |
| `upload` | `SERVICE_PORT=3004`<br>`CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name`<br>`CLOUDINARY_API_KEY=your_cloudinary_api_key`<br>`CLOUDINARY_API_SECRET=your_cloudinary_api_secret`<br>`AWS_S3_REGION=us-east-1`<br>`AWS_S3_BUCKET=bookworm-assets`<br>`AWS_ACCESS_KEY=your_aws_access_key`<br>`AWS_SECRET_KEY=your_aws_secret_key` |
| `asset` | `DB_NAME=bookworm_asset`<br>`SERVICE_PORT=3005`<br>`AUTH_QUEUE=auth_queue` |
| `mvc` | `PORT=8081`<br>`METHOD=http`<br>`CLIENT_HOST_NAME=localhost`<br>`AUTH_SERVICE_HOST_NAME=localhost`<br>`AUTH_SERVICE_PORT=3000`<br>`PRODUCT_SERVICE_HOST_NAME=product`<br>`PRODUCT_SERVICE_PORT=3001`<br>`CART_SERVICE_HOST_NAME=cart`<br>`CART_SERVICE_PORT=3002`<br>`ORDER_SERVICE_HOST_NAME=order`<br>`ORDER_SERVICE_PORT=3003`<br>`UPLOAD_SERVICE_HOST_NAME=localhost`<br>`UPLOAD_SERVICE_PORT=3004`<br>`ASSET_SERVICE_HOST_NAME=asset`<br>`ASSET_SERVICE_PORT=3005` |


---

## License

This project is open source and available under the [UNLICENSED](LICENSE) license.
