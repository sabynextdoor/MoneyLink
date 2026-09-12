# Test Plan — CashFlow Coach

## Overview
This document outlines the testing strategy for CashFlow Coach, covering unit tests, integration tests, edge cases, and data integrity verification.

---

## 1. CSV/JSON Import Validation

### Test Cases
| # | Test | Input | Expected Result |
|---|------|-------|-----------------|
| 1.1 | Valid CSV import | Well-formed CSV with all required fields | All rows imported, categories auto-assigned |
| 1.2 | Missing required field | CSV row without 'date' | Row rejected with clear error message |
| 1.3 | Invalid amount | Row with amount="abc" | Row rejected, error: "Invalid amount" |
| 1.4 | Empty file | Empty CSV | Error: "No data found in file" |
| 1.5 | JSON array format | `[{...}, {...}]` | All items imported |
| 1.6 | JSON nested format | `{transactions: [...]}` | All items imported |
| 1.7 | Invalid JSON | Malformed JSON | Error: "JSON parsing error" |
| 1.8 | Duplicate IDs in upload | Two rows with same transaction_id | Second row flagged or rejected |
| 1.9 | Negative dates | date="not-a-date" | Row rejected with date error |
| 1.10 | Extra columns | CSV with unknown columns | Ignored, import succeeds |

---

## 2. Duplicate Detection

### Test Cases
| # | Test | Input | Expected Result |
|---|------|-------|-----------------|
| 2.1 | Exact duplicate | Same amount, date, description | Flagged as duplicate with high confidence |
| 2.2 | Same amount, different date (2 days) | $50 on Jan 1 and Jan 3, same merchant | Flagged with medium confidence |
| 2.3 | Same amount, far dates | $50 on Jan 1 and Feb 15 | NOT flagged (too far apart) |
| 2.4 | Different amount, same date | $50 and $75 on same day | NOT flagged |
| 2.5 | Confirm duplicate | User clicks "Confirm" | Second transaction status → 'duplicate', excluded from totals |
| 2.6 | Reject duplicate | User clicks "Not Duplicate" | Both remain active in totals |
| 2.7 | Duplicate excluded from totals | 2 duplicate transactions of $50 | Total shows $50, not $100 |

---

## 3. Missing Transaction Detection

### Test Cases
| # | Test | Input | Expected Result |
|---|------|-------|-----------------|
| 3.1 | Missing rent | Jan and Mar have rent, Feb doesn't | Suggestion: "Possible missing rent for February" |
| 3.2 | All months present | Rent present for all months | No suggestion |
| 3.3 | Confirm missing | User clicks "Add Transaction" | New transaction added with status 'confirmed_missing' |
| 3.4 | Dismiss missing | User clicks "Dismiss" | Suggestion removed, no transaction added |
| 3.5 | Missing NOT in totals until confirmed | Suggestion exists but not confirmed | Total does not include the suggested amount |

---

## 4. Category Rule Matching

### Test Cases
| # | Test | Input | Expected Result |
|---|------|-------|-----------------|
| 4.1 | Merchant match | merchant="FreshMart Grocery" | Category → "Food - Groceries" |
| 4.2 | Keyword match | description="Monthly rent payment" | Category → "Housing - Rent" |
| 4.3 | Regex match | description="pizza|burger" pattern | Matches dining out rule |
| 4.4 | Priority order | Transaction matches 2 rules | Lower priority number wins |
| 4.5 | Disabled rule | Rule with enabled=false | Rule skipped |
| 4.6 | No match | Description="random purchase" | Falls through to default "Other" |
| 4.7 | User override | User changed category manually | Override persists, not overwritten by rules |
| 4.8 | Imported category | CSV has category column | Imported category used (priority 2) |

---

## 5. Manual Override Persistence

### Test Cases
| # | Test | Input | Expected Result |
|---|------|-------|-----------------|
| 5.1 | Change category | User changes "Other" → "Food - Dining Out" | Category updated, correction logged |
| 5.2 | Override survives re-categorize | Run categorization again | User's override preserved |
| 5.3 | Correction in audit log | Category changed | Audit event with old/new values |
| 5.4 | Multiple corrections | Change category twice | Both corrections logged in order |

---

## 6. Forecast Recalculation

### Test Cases
| # | Test | Input | Expected Result |
|---|------|-------|-----------------|
| 6.1 | Change income assumption | avgMonthlyIncome: 1800 → 2000 | Forecast updates, ending balance increases |
| 6.2 | Change savings contribution | savingsContribution: 200 → 300 | Savings progress accelerates |
| 6.3 | Change expense inflation | expenseInflation: 2 → 10 | Expenses grow faster in later periods |
| 6.4 | Instant update | Change any assumption | Chart and numbers update without page reload |
| 6.5 | Deterministic output | Same inputs, run twice | Identical results |

---

## 7. Scenario Comparison

### Test Cases
| # | Test | Input | Expected Result |
|---|------|-------|-----------------|
| 7.1 | Baseline vs Savings Boost | Compare two scenarios | Savings Boost has higher ending balance |
| 7.2 | Conservative lower income | income reduced 10% | Ending balance lower than baseline |
| 7.3 | Goal reached date differs | Different savings rates | Different projected goal dates |
| 7.4 | Key drivers populated | Each scenario | Key drivers list explains differences |
| 7.5 | Custom scenario | User edits all assumptions | Results reflect custom values |

---

## 8. Savings Goal Progress

### Test Cases
| # | Test | Input | Expected Result |
|---|------|-------|-----------------|
| 8.1 | Create goal | name="Laptop", target=1500, saved=350 | Progress = 23% |
| 8.2 | Update saved amount | Change saved to 500 | Progress = 33% |
| 8.3 | Goal reached | saved >= target | Progress = 100%, "Already reached!" |
| 8.4 | Multiple goals | 3 goals with different priorities | Each shows independent progress |
| 8.5 | Delete goal | Remove a goal | Goal removed, no errors |

---

## 9. Edge Cases

### Test Cases
| # | Test | Input | Expected Result |
|---|------|-------|-----------------|
| 9.1 | Negative amount | amount=-50.00 | Treated as expense |
| 9.2 | Zero amount | amount=0 | Imported but flagged or ignored |
| 9.3 | Very large amount | amount=999999.99 | Accepted, displayed correctly |
| 9.4 | Blank description | description="" | Rejected (required field) |
| 9.5 | Special characters | description="Café Résumé" | Handled correctly (UTF-8) |
| 9.6 | Future dates | date="2030-01-01" | Accepted, shown in transaction list |
| 9.7 | Invalid currency | currency="XYZ" | Accepted with warning |
| 9.8 | Conflicting categories | Import says "Food" but rule says "Housing" | Import wins (priority 2 vs 3) |
| 9.9 | Missing required fields | No 'amount' field | Row rejected with clear error |
| 9.10 | Duplicate transaction IDs | Two items with same ID | Second rejected or flagged |

---

## 10. Data Integrity

### Test Cases
| # | Test | Scenario | Expected Result |
|---|------|----------|-----------------|
| 10.1 | Totals reproducible | Calculate from active transactions | Matches displayed total |
| 10.2 | Duplicate exclusion visible | 1 confirmed duplicate | Dashboard shows exclusion note |
| 10.3 | Correction shows old/new | Category changed | Audit log shows both values |
| 10.4 | Missing not in totals | Suggestion pending | Total unchanged |
| 10.5 | Forecast traceable | Any forecast number | Can trace to specific assumption |
| 10.6 | Category change explained | Any category | Shows rule name or "user override" |

---

## 11. UI/UX Tests

### Test Cases
| # | Test | Expected Result |
|---|------|-----------------|
| 11.1 | Mobile responsive | Layout adapts to 375px width |
| 11.2 | Charts render | All charts visible and interactive |
| 11.3 | Disclaimer visible | Amber banner at top of every page |
| 11.4 | Navigation works | All tabs switch correctly |
| 11.5 | Forms validate | Required fields show errors |
| 11.6 | Loading states | No blank screens during data processing |
| 11.7 | Accessibility | Color contrast meets WCAG AA |

---

## Running Tests

```bash
# Unit tests (when implemented)
npm test

# Integration tests
npm run test:integration

# E2E tests (when implemented)
npm run test:e2e
```

## Manual Testing Checklist

- [ ] Load app with synthetic data — dashboard shows correct totals
- [ ] Upload sample CSV — transactions imported correctly
- [ ] Flagged duplicates appear in alert banner
- [ ] Confirm a duplicate — it's excluded from totals
- [ ] Change a category — audit log records the change
- [ ] Edit forecast assumptions — chart updates instantly
- [ ] Compare scenarios — table shows differences
- [ ] Create a savings goal — progress bar appears
- [ ] Add a category rule — new transactions use it
- [ ] Reset data — everything returns to defaults
- [ ] Test on mobile — layout is responsive
- [ ] Check disclaimer — visible on all pages
