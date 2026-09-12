# DynamoDB Data Model — Example Items

## Single-Table Design Overview

All entities share one table with composite keys (PK/SK) and two GSIs for flexible access patterns.

---

## Example Items

### USER
```json
{
  "PK": "USER#user-123",
  "SK": "PROFILE",
  "entityType": "USER",
  "email": "student@university.edu",
  "name": "Alex Student",
  "createdAt": "2024-01-01T00:00:00Z",
  "settings": {
    "currency": "USD",
    "forecastHorizon": "monthly",
    "theme": "light"
  }
}
```

### TRANSACTION
```json
{
  "PK": "USER#user-123",
  "SK": "TXN#2024-01-15#txn-abc-123",
  "entityType": "TRANSACTION",
  "transactionId": "txn-abc-123",
  "date": "2024-01-15",
  "description": "Part-time job paycheck",
  "merchant": "Campus Bookstore",
  "amount": 875.00,
  "currency": "USD",
  "type": "income",
  "category": "Income - Employment",
  "source": "synthetic",
  "status": "active",
  "GSI1PK": "CATEGORY#Income - Employment",
  "GSI1SK": "2024-01-15",
  "GSI2PK": "STATUS#active",
  "GSI2SK": "2024-01-15",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### TRANSACTION_REVISION (Correction Record)
```json
{
  "PK": "TXN#txn-abc-123",
  "SK": "REV#2024-01-16T14:30:00Z",
  "entityType": "TRANSACTION_REVISION",
  "transactionId": "txn-abc-123",
  "field": "category",
  "oldValue": "Income - Other",
  "newValue": "Income - Employment",
  "reason": "User manually corrected category",
  "correctedBy": "user-123",
  "timestamp": "2024-01-16T14:30:00Z"
}
```

### GOAL
```json
{
  "PK": "USER#user-123",
  "SK": "GOAL#goal-emergency",
  "entityType": "GOAL",
  "goalId": "goal-emergency",
  "name": "Emergency Fund",
  "targetAmount": 2000,
  "targetDate": "2025-01-01",
  "currentSaved": 450,
  "contributionFrequency": "monthly",
  "priority": "high",
  "notes": "Building a safety net",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### CATEGORY_RULE
```json
{
  "PK": "USER#user-123",
  "SK": "RULE#001",
  "entityType": "CATEGORY_RULE",
  "ruleId": "rule-rent",
  "name": "Rent Detection",
  "priority": 1,
  "matchType": "description_keyword",
  "matchValue": "rent",
  "category": "Housing - Rent",
  "enabled": true,
  "description": "Matches transactions containing 'rent'"
}
```

### SCENARIO
```json
{
  "PK": "USER#user-123",
  "SK": "SCENARIO#scenario-baseline",
  "entityType": "SCENARIO",
  "scenarioId": "scenario-baseline",
  "name": "Baseline",
  "description": "Uses historical averages",
  "color": "#3B82F6",
  "isActive": true,
  "assumptions": {
    "avgMonthlyIncome": 1800,
    "incomeVolatility": 15,
    "expenseInflation": 2,
    "savingsContribution": 200,
    "bufferPercentage": 10,
    "forecastHorizon": "monthly",
    "forecastMonths": 6,
    "recurringBills": [
      { "name": "Rent", "amount": 750, "frequency": "monthly" },
      { "name": "Utilities", "amount": 80, "frequency": "monthly" }
    ],
    "categoryBudgets": [
      { "category": "Food - Groceries", "limit": 300 },
      { "category": "Food - Dining Out", "limit": 150 }
    ]
  }
}
```

### FORECAST_RUN
```json
{
  "PK": "USER#user-123",
  "SK": "FORECAST#2024-01-15T10:00:00Z",
  "entityType": "FORECAST_RUN",
  "scenarioId": "scenario-baseline",
  "triggeredBy": "assumption_change",
  "endingBalance": 3450.50,
  "goalReachedDate": "2024-09-01",
  "periodsCount": 6,
  "keyDrivers": ["Using historical averages with no adjustments"],
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### UPLOAD_BATCH
```json
{
  "PK": "USER#user-123",
  "SK": "BATCH#2024-01-15T10:00:00Z",
  "entityType": "UPLOAD_BATCH",
  "batchId": "batch-xyz-789",
  "fileName": "transactions-jan.csv",
  "fileType": "csv",
  "s3Key": "uploads/user-123/transactions-jan.csv",
  "rowCount": 42,
  "successCount": 40,
  "errorCount": 2,
  "errors": [
    "Row 15: Missing required field 'amount'",
    "Row 28: Invalid date format"
  ],
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### AUDIT_EVENT
```json
{
  "PK": "USER#user-123",
  "SK": "AUDIT#2024-01-16T14:30:00Z#evt-001",
  "entityType": "AUDIT_EVENT",
  "action": "CORRECT",
  "targetEntityType": "TRANSACTION",
  "targetEntityId": "txn-abc-123",
  "details": "Category changed from 'Income - Other' to 'Income - Employment'",
  "oldValue": "Income - Other",
  "newValue": "Income - Employment",
  "performedBy": "user-123",
  "timestamp": "2024-01-16T14:30:00Z",
  "TTL": 1735689600
}
```

---

## Access Patterns

| # | Access Pattern | Query |
|---|---------------|-------|
| 1 | Get all transactions for user by date range | PK=USER#{userId}, SK between TXN#{startDate} and TXN#{endDate} |
| 2 | Get transactions by category | GSI1PK=CATEGORY#{category}, sort by GSI1SK (date) |
| 3 | Get transactions by status | GSI2PK=STATUS#{status}, sort by GSI2SK (date) |
| 4 | Get all goals for user | PK=USER#{userId}, SK begins with GOAL# |
| 5 | Get all rules for user (sorted by priority) | PK=USER#{userId}, SK begins with RULE# |
| 6 | Get scenarios for user | PK=USER#{userId}, SK begins with SCENARIO# |
| 7 | Get forecast runs by date | PK=USER#{userId}, SK begins with FORECAST# |
| 8 | Get audit trail for user | PK=USER#{userId}, SK begins with AUDIT# (sorted by timestamp desc) |
| 9 | Get revision history for transaction | PK=TXN#{txnId}, SK begins with REV# |
| 10 | Get upload batches | PK=USER#{userId}, SK begins with BATCH# |
