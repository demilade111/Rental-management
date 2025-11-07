# Lease Accounting Structure

## Overview
This document explains how to structure accounting data for both **standard leases** (with structured data) and **custom leases** (where contract details are handwritten in the contract document). Both lease types use the same payment tracking system.

## Database Structure

### 1. Standard Lease Model
The `Lease` model already has structured accounting fields built-in:
- `startDate`, `endDate` - Lease period (required)
- `rentAmount`, `paymentFrequency` - Rent details (required)
- `securityDeposit`, `depositAmount` - Deposit info
- `paymentDay`, `paymentMethod` - Payment details

**Standard leases** have all accounting data structured from the start, so no manual entry is needed.

### 2. CustomLease Model Extensions
The `CustomLease` model now includes optional accounting fields that can be manually entered from the handwritten contract:

```prisma
// Accounting fields (manually entered from handwritten contract)
startDate        DateTime?
endDate          DateTime?
rentAmount       Float?
paymentFrequency RentCycle?
securityDeposit  Float?
depositAmount    Float?
paymentDay       Int?        // Due day (1-31)
paymentMethod    String?
accountingNotes  String?      // Any notes about accounting from the contract
```

### 3. Payment Model
A new `Payment` model tracks individual rent and deposit payments for **both standard and custom leases**:

```prisma
model Payment {
  id            String        @id @default(cuid())
  leaseId       String?       // For standard leases
  customLeaseId String?       // For custom leases
  landlordId    String
  tenantId      String?
  
  type          PaymentType   // RENT, DEPOSIT, REFUND, OTHER
  amount        Float
  status        PaymentStatus // PENDING, PAID, FAILED, CANCELLED
  dueDate       DateTime?
  paidDate      DateTime?
  
  paymentMethod String?       // e.g., "Cash", "Check", "Bank Transfer"
  reference     String?       // Transaction reference, check number, etc.
  notes         String?
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

## Data Flow

### For Standard Leases

**Step 1: Create Standard Lease**
When creating a standard lease, all accounting fields are entered during creation:
- `startDate`, `endDate` - Lease period
- `rentAmount`, `paymentFrequency` - Rent details
- `securityDeposit`, `depositAmount` - Deposit info
- `paymentDay`, `paymentMethod` - Payment details

**Step 2: Record Payments**
Payments can be recorded immediately since all lease data is structured.

### For Custom Leases

**Step 1: Create Custom Lease**
When creating a custom lease, upload the handwritten contract PDF:
- `leaseName`: Name of the lease
- `fileUrl`: URL to the uploaded contract PDF
- `tenantId`: Associated tenant (optional initially)
- `listingId`: Associated listing (optional)

**Step 2: Extract Accounting Details (Manual Entry)**
After creating the custom lease, the landlord manually extracts and enters accounting details from the handwritten contract:

**Required Fields:**
- `startDate`: Lease start date
- `endDate`: Lease end date
- `rentAmount`: Monthly/weekly/yearly rent amount
- `paymentFrequency`: MONTHLY, QUARTERLY, or YEARLY
- `paymentDay`: Day of month when rent is due (1-31)

**Optional Fields:**
- `securityDeposit`: Security deposit amount
- `depositAmount`: Deposit amount (if different from securityDeposit)
- `paymentMethod`: Payment method preference
- `accountingNotes`: Any additional notes about accounting terms

### Step 3: Record Payments (Both Lease Types)
As payments are received, create `Payment` records:

**For Rent Payments (Standard Lease):**
```javascript
{
  leaseId: "standard-lease-id",  // Use leaseId for standard leases
  type: "RENT",
  amount: 1500.00,
  dueDate: "2025-01-01",
  paidDate: "2025-01-01",
  status: "PAID",
  paymentMethod: "Bank Transfer",
  reference: "TXN-123456"
}
```

**For Rent Payments (Custom Lease):**
```javascript
{
  customLeaseId: "custom-lease-id",  // Use customLeaseId for custom leases
  type: "RENT",
  amount: 1500.00,
  dueDate: "2025-01-01",
  paidDate: "2025-01-01",
  status: "PAID",
  paymentMethod: "Bank Transfer",
  reference: "TXN-123456"
}
```

**For Deposit Payments:**
```javascript
{
  leaseId: "standard-lease-id",  // or customLeaseId for custom leases
  type: "DEPOSIT",
  amount: 3000.00,
  dueDate: "2025-01-01",
  paidDate: "2025-01-01",
  status: "PAID",
  paymentMethod: "Check",
  reference: "Check #1234"
}
```

## Accounting Calculations

### Calculate Rent Paid (Works for Both Lease Types)
```javascript
// Sum all PAID rent payments for a lease (standard or custom)
// For standard lease: filter by leaseId
// For custom lease: filter by customLeaseId
const rentPaid = payments
  .filter(p => 
    (p.leaseId === leaseId || p.customLeaseId === customLeaseId) &&
    p.type === 'RENT' && 
    p.status === 'PAID'
  )
  .reduce((sum, p) => sum + p.amount, 0);
```

### Calculate Deposit Paid (Works for Both Lease Types)
```javascript
// Sum all PAID deposit payments for a lease (standard or custom)
const depositPaid = payments
  .filter(p => 
    (p.leaseId === leaseId || p.customLeaseId === customLeaseId) &&
    p.type === 'DEPOSIT' && 
    p.status === 'PAID'
  )
  .reduce((sum, p) => sum + p.amount, 0);
```

### Calculate Outstanding Rent (Works for Both Lease Types)
```javascript
// For standard lease: use lease.rentAmount, lease.startDate, lease.endDate
// For custom lease: use customLease.rentAmount, customLease.startDate, customLease.endDate

function calculateOutstandingRent(lease, payments) {
  // Get lease data (works for both standard and custom)
  const leaseStart = lease.startDate;
  const leaseEnd = lease.endDate;
  const rentAmount = lease.rentAmount;
  const paymentFrequency = lease.paymentFrequency;
  
  // Calculate number of payment periods
  const periods = calculatePeriods(leaseStart, leaseEnd, paymentFrequency);
  const expectedRent = periods * rentAmount;
  
  // Calculate paid rent
  const leaseId = lease.id;
  const isCustomLease = lease.customLeaseId !== undefined;
  const rentPaid = payments
    .filter(p => 
      (isCustomLease ? p.customLeaseId === leaseId : p.leaseId === leaseId) &&
      p.type === 'RENT' && 
      p.status === 'PAID'
    )
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Outstanding = Expected - Paid
  const outstandingRent = expectedRent - rentPaid;
  return outstandingRent;
}
```

### Calculate Overdue Payments (Works for Both Lease Types)
```javascript
// Find payments that are past due and not paid
// For standard lease: filter by leaseId
// For custom lease: filter by customLeaseId
const overduePayments = payments
  .filter(p => 
    (p.leaseId === leaseId || p.customLeaseId === customLeaseId) &&
    p.type === 'RENT' && 
    p.status === 'PENDING' && 
    p.dueDate && 
    new Date(p.dueDate) < new Date()
  );

const overdueAmount = overduePayments
  .reduce((sum, p) => sum + p.amount, 0);
```

## Implementation Steps

### Backend
1. ✅ Update `CustomLease` model with accounting fields
2. ✅ Create `Payment` model
3. ✅ Add enums (`PaymentType`, `PaymentStatus`)
4. 🔄 Create migration for database changes
5. 🔄 Create `paymentService.js` for payment operations
6. 🔄 Create `paymentController.js` for API endpoints
7. 🔄 Create `paymentRoute.js` for payment routes
8. 🔄 Update `customLeaseService.js` to handle accounting fields
9. 🔄 Create accounting calculation utilities

### Frontend
1. 🔄 Create `LeaseDetails` page/component (works for both standard and custom leases)
2. 🔄 Add "Accounting Details" section to lease details
3. 🔄 Create form to manually enter accounting details for custom leases (not needed for standard)
4. 🔄 Create payment entry form (works for both lease types)
5. 🔄 Create payment history table (works for both lease types)
6. 🔄 Display accounting summary (rent paid, deposit paid, outstanding, overdue) for both lease types
7. 🔄 Update dashboard `AccountingCard` to include data from both standard and custom leases

## Example API Endpoints

### Update Custom Lease Accounting Details
```
PATCH /api/v1/custom-leases/:id/accounting
Body: {
  startDate: "2025-01-01",
  endDate: "2026-01-01",
  rentAmount: 1500.00,
  paymentFrequency: "MONTHLY",
  paymentDay: 1,
  securityDeposit: 3000.00,
  paymentMethod: "Bank Transfer",
  accountingNotes: "Rent increases by 2% annually"
}
```

### Create Payment (Works for Both Lease Types)
```
POST /api/v1/payments
Body: {
  // Use leaseId for standard leases, customLeaseId for custom leases
  leaseId: "standard-lease-id",  // OR
  customLeaseId: "custom-lease-id",
  type: "RENT",
  amount: 1500.00,
  dueDate: "2025-01-01",
  paidDate: "2025-01-01",
  status: "PAID",
  paymentMethod: "Bank Transfer",
  reference: "TXN-123456"
}
```

### Get Payments for Lease (Works for Both Lease Types)
```
// For standard leases
GET /api/v1/leases/:id/payments
Query: ?type=RENT&status=PAID

// For custom leases
GET /api/v1/custom-leases/:id/payments
Query: ?type=RENT&status=PAID
```

### Get Accounting Summary (Works for Both Lease Types)
```
// For standard leases
GET /api/v1/leases/:id/accounting-summary

// For custom leases
GET /api/v1/custom-leases/:id/accounting-summary

Response: {
  rentPaid: 15000.00,
  depositPaid: 3000.00,
  outstandingRent: 3000.00,
  overdueAmount: 0.00,
  nextDueDate: "2025-02-01",
  nextDueAmount: 1500.00
}
```

### Get All Accounting Data (Dashboard)
```
GET /api/v1/accounting/summary
Response: {
  totalRentPaid: 45000.00,      // From all leases (standard + custom)
  totalDepositPaid: 9000.00,    // From all leases
  totalOutstanding: 6000.00,    // From all leases
  totalOverdue: 1500.00,        // From all leases
  leases: [
    {
      id: "lease-id",
      type: "STANDARD" | "CUSTOM",
      rentPaid: 15000.00,
      depositPaid: 3000.00,
      outstandingRent: 3000.00,
      overdueAmount: 0.00
    }
  ]
}
```

## Key Differences: Standard vs Custom Leases

### Standard Leases
- ✅ All accounting fields are **required** and structured during lease creation
- ✅ No manual entry needed - data comes from structured form
- ✅ Can immediately start tracking payments
- ✅ Accounting calculations use lease data directly

### Custom Leases
- ⚠️ All accounting fields are **optional** to allow flexibility
- ⚠️ Requires **manual entry** of accounting details from handwritten contract
- ⚠️ Must extract and enter contract details before full accounting tracking
- ✅ Once entered, accounting calculations work the same as standard leases

## Notes
- **Payment model works for both lease types** - use `leaseId` for standard leases, `customLeaseId` for custom leases
- All accounting fields in `CustomLease` are optional to allow flexibility for handwritten contracts
- Standard leases have all accounting data structured from the start
- Payment history provides a complete audit trail for both lease types
- Accounting calculations are computed dynamically from payment records
- The landlord is responsible for accurately entering contract details from handwritten documents for custom leases
- Dashboard accounting summary should aggregate data from **both standard and custom leases**

