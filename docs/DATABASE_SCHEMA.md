# MongoDB Schema Plan

Database name:

```txt
stockora
```

Collections:

```txt
organizations
facilities
users
roles
groups
categories
items
units
godowns
vendors
employees
stock_ledgers
stock_balances
stock_ins
stock_transfers
stock_outs
manual_adjustments
daily_sales
incentive_rules
notifications
audit_logs
```

## Critical Stock Design

Use two collections:

### stock_ledgers
Movement history. Every stock operation creates ledger entries.

### stock_balances
Current stock snapshot by organization + facility + godown + item.

All stock operations must use MongoDB transactions.

If a ledger entry fails, stock balance update must rollback.
If stock balance update fails, transaction document must rollback.
