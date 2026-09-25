# Stockora by Trivoxa

Production-ready frontend starter for Stockora inventory management SaaS.

## Updated in this build
- Add / Update forms added for Groups, Categories, Items, Godowns, Vendors, Employees and Units.
- Stock In page now includes a View Ledger button and ledger movement panel showing Stock In, Stock Out, Transfer and godown history.
- Manage module forms added for Organization, Facilities, Admins, User Roles, Access Control and Notifications.
- Forms are shown in simple modal panels to avoid breaking existing table/layout structure.
- UI kept light, clear and Indian business-friendly.

## Run
```bash
npm install
npm run dev
```

Open: http://localhost:3000

If using PowerShell and you need clean install:
```powershell
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path package-lock.json) { Remove-Item -Force package-lock.json }
npm install
npm run dev
```
