# Stockora Development Plan

## Current Status

Frontend is completed as a mock-data Next.js application inside `/frontend`.
Backend development should start inside `/backend`.

## Development Order

### Phase 1: Project Setup
- GitHub repo setup
- MongoDB Atlas setup
- Backend env setup
- API health check
- Postman collection setup

### Phase 2: Auth + Onboarding
- Trivoxa access login
- Client login
- Organization creation
- Facility creation
- Super Admin creation
- JWT authentication

### Phase 3: Users and Permissions
- Users
- Roles
- Permission matrix
- Facility access
- Organization isolation

### Phase 4: Masters
- Groups
- Categories
- Items
- Units
- Godowns
- Vendors
- Employees

### Phase 5: Stock Core
- Stock balances
- Stock ledger
- Stock In
- Stock Transfer
- Stock Out
- Manual Adjustment

### Phase 6: Sales, Reports, Incentives
- Daily sale
- Stock summary
- Movement analysis
- Godown-wise report
- Incentive rules
- Incentive report

### Phase 7: Production Readiness
- Audit logs
- Notifications
- Validation hardening
- Error handling
- Deployment
