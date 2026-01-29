# Complete Brands and Models Generation Script

## Description

A unified production script for generating all brands and models (cars, trucks, motorcycles) with automatic duplicate checking.

## Location

**File:** `core/backend/src/scripts/production/seed-all-brands-complete.ts`  
**Command:** `npm run seed:all-brands:complete:prod`

## Production Usage

### Basic Run

```bash
cd core/backend
npm run seed:all-brands:complete:prod
```

### With Options

```bash
# Skip heavy scripts (faster, but less data)
npm run seed:all-brands:complete:prod -- --skip-heavy

# Skip duplicate checking (saves memory)
npm run seed:all-brands:complete:prod -- --skip-duplicates

# Automatically remove duplicates if found
npm run seed:all-brands:complete:prod -- --auto-remove-duplicates

# Combination of options
npm run seed:all-brands:complete:prod -- --skip-heavy --skip-duplicates
```

## What the Script Does

1. **Runs all generation scripts** in the correct order:
   - Base brands and models
   - Italian brands
   - American brands
   - German brands
   - Japanese brands
   - French brands
   - Commercial models
   - Grand versions
   - Historical and rare models
   - Missing car brands
   - Truck brands
   - Motorcycle brands

2. **Checks for duplicates** after generation
3. **Can automatically remove duplicates** (with `--auto-remove-duplicates` flag)
4. **Clears Redis cache** after completion

## Safety

✅ **All generation scripts check existence** of brands and models before adding  
✅ **Duplicates are not created** during normal operation  
✅ **Duplicate checking** is performed after all scripts  
✅ **Automatic removal option** available if needed

## Requirements

- Database accessible
- Environment variables configured
- Redis available (for cache clearing, optional)

## Example Output

```
🌱 Full generation of all brands and models...

ℹ️  All generation scripts check existence before adding,
   so duplicates should not be created.

[1/12] Base brands and models ✅
[2/12] Italian brands ✅
...
[12/12] Motorcycle brands ✅

📊 Final results: 250 brands, 3500 models

🔍 Checking for duplicates...
📊 Duplicate check results:
   - Brand duplicates: 0
   - Model duplicates within same brand: 0

✅ No duplicates found

✅ Cache cleared

✅ Full generation completed
   - Scripts processed: 12
   - Errors: 0
   - Brand duplicates: 0
   - Model duplicates: 0
```

## Notes

- Script is safe to run repeatedly
- All generation scripts are idempotent (do not create duplicates)
- Recommended to run on production after deploy to update data
