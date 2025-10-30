# Database Seeding Guide

This guide explains how to seed your database with test data.

## Quick Start

```bash
# Seed the database with test data
npm run db:seed

# Reset database and seed
npm run db:reset
```

## Available Scripts

### `npm run db:seed`

Seeds the database with test data without deleting existing data (it will clean and recreate all test data).

### `npm run db:reset`

⚠️ **DESTRUCTIVE**: Resets the entire database schema and seeds it with fresh data. All existing data will be lost.

### `npm run prisma:seed`

Directly runs the seed script (same as `db:seed`).

## Test Data Created

### 👥 Users (4 total)

#### Landlords (ADMIN role):

- **Email:** `landlord@test.com`

  - Password: `password123`
  - Name: John Landlord
  - Has 2 listings with active leases and maintenance requests

- **Email:** `sarah.property@test.com`
  - Password: `password123`
  - Name: Sarah Property
  - Has 2 listings (luxury properties)

#### Tenants (TENANT role):

- **Email:** `tenant@test.com`

  - Password: `password123`
  - Name: Jane Tenant
  - Active lease on Modern Downtown Apartment

- **Email:** `mike.renter@test.com`
  - Password: `password123`
  - Name: Mike Renter
  - Active lease on Studio Apartment

### 🏠 Listings (4 total)

1. **Modern Downtown Apartment** (San Francisco)

   - 2 bed, 2 bath, 1200 sqft
   - $3,500/month
   - Has active lease with tenant@test.com
   - Has maintenance requests

2. **Cozy Suburban House** (Oakland)

   - 3 bed, 2 bath, 1800 sqft
   - $4,200/month
   - Available (no active lease)
   - Has maintenance requests for pre-rental work

3. **Luxury Penthouse Suite** (San Francisco)

   - 3 bed, 3 bath, 2500 sqft
   - $8,500/month
   - Premium amenities
   - Available

4. **Studio Apartment Downtown** (San Francisco)
   - Studio, 1 bath, 550 sqft
   - $2,200/month
   - Has active lease with mike.renter@test.com

### 📄 Leases (2 active)

1. Modern Downtown Apartment → tenant@test.com
2. Studio Apartment Downtown → mike.renter@test.com

### 🔧 Maintenance Requests (8 total)

#### OPEN Status (4 requests):

- Leaking Faucet (from tenant) - MEDIUM priority
- Annual HVAC Inspection (from landlord) - LOW priority
- Broken Door Lock (from tenant) - HIGH priority
- Replace Broken Window (from landlord) - HIGH priority

#### IN_PROGRESS Status (2 requests):

- Air Conditioning Not Working (from tenant) - URGENT priority
- Pre-rental Deep Cleaning (from landlord) - HIGH priority

#### COMPLETED Status (2 requests):

- Refrigerator Making Noise (from tenant) - LOW priority
- Paint Touch-ups (from landlord) - MEDIUM priority

## Testing Scenarios

### As a Landlord

Login with: `landlord@test.com` / `password123`

You can:

- View all your listings
- See active and inactive maintenance requests
- Create new maintenance requests for your properties
- Update status of maintenance requests
- View lease information

### As a Tenant

Login with: `tenant@test.com` / `password123`

You can:

- View your active lease
- See maintenance requests for your rented property
- Create new maintenance requests
- Track status of your maintenance requests

## Maintenance Request Categories

The seed creates requests across all categories:

- PLUMBING
- ELECTRICAL
- HVAC
- APPLIANCE
- STRUCTURAL
- PEST_CONTROL
- CLEANING
- LANDSCAPING
- SECURITY
- OTHER

## Maintenance Request Priorities

- URGENT: Critical issues requiring immediate attention
- HIGH: Important issues
- MEDIUM: Standard priority
- LOW: Non-urgent maintenance

## Seed File Location

Main seed file: `server/prisma/seed.js`

## Customization

To customize the seed data, edit `server/prisma/seed.js` and modify:

- User credentials
- Property details
- Maintenance request content
- Number of records created

Then run `npm run db:seed` to apply changes.

## Troubleshooting

### Error: User already exists

The seed script automatically cleans existing data before seeding. If you get this error, run:

```bash
npm run db:reset
```

### Error: Column doesn't exist

Your database schema is out of sync. Run:

```bash
cd server
npx prisma db push
npm run db:seed
```

### Error: Cannot connect to database

Check your `.env` file has the correct `DATABASE_URL`.


