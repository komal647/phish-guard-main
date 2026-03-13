# Lookalike Domain Detection Enhancement

## Overview

PhishGuard now detects sophisticated lookalike domains used in phishing attacks, including:
- **Character substitutions**: g00gle.com (0→o), amaz0n.com (0→o), paypa1.com (1→l)
- **Homograph attacks**: amazоn.com (Cyrillic о), fасebook.com (Cyrillic а)
- **Visual similarity attacks**: Using Unicode lookalikes that appear identical to legitimate domains

---

## Features Added

### 1. **Enhanced Lookalike Character Detection**

**File Updated**: [supabase/functions/detect-phishing/index.ts](../supabase/functions/detect-phishing/index.ts)

#### Character Substitution Mapping
Extended `LOOKALIKE_SUBSTITUTIONS` now includes:
- **Numbers**: 0→o, 1→i/l, 2→z, 3→e, 4→a, 5→s, 6→b, 7→t, 8→b, 9→g/p
- **Special characters**: @→a, $→s, |→l
- **Unicode lookalikes**: Cyrillic (а, е, о, с, etc.), Greek (ο, ρ), Armenian characters

#### New Detection Functions

**`normalizeLookalikeCharacters(domain: string)`**
- Normalizes domain by replacing lookalike characters with base characters
- Example: `g00gle.com` → `google.com`, `amaz0n.com` → `amazon.com`

**`detectLookalikeAttack(domain: string)`**
- Detects if a domain is a lookalike impersonation
- Returns: target brand, severity level, and specific substitutions found
- Score boost: **45 points** (out of 100)

**`detectHomographAttack(domain: string)`**
- Identifies Unicode homograph attacks
- Finds non-ASCII characters that mimic ASCII letters
- Examples: Cyrillic р→p, о→o; Greek ο→o
- Score boost: **45 points** (out of 100)

### 2. **Enhanced Typosquatting Detection**

Updated `checkTyposquatting()` function with three-tier detection:

1. **Lookalike Detection** (NEW)
   - Detects character substitutions
   - HIGH severity, 45-point boost

2. **Homograph Detection** (NEW)
   - Detects Unicode visual lookalikes
   - HIGH severity, 45-point boost

3. **Traditional Typosquatting**
   - Detects misspelling patterns
   - MEDIUM severity, 25-point boost

### 3. **Official Brand Database**

Added `OFFICIAL_BRAND_DOMAINS` mapping to verify legitimate vs. phishing:
```typescript
{
  'google': ['google.com', 'accounts.google.com'],
  'amazon': ['amazon.com', 'aws.amazon.com'],
  'paypal': ['paypal.com', 'www.paypal.com'],
  // ... etc
}
```

---

## Detection Examples

### Lookalike Domains (Character Substitutions)

| Domain | Real Brand | Substitution | Detection | Risk |
|--------|-----------|--------------|-----------|------|
| **g00gle.com** | google.com | 0→o | ✓ Detected | 🚨 HIGH |
| **amaz0n.com** | amazon.com | 0→o | ✓ Detected | 🚨 HIGH |
| **paypa1.com** | paypal.com | 1→l | ✓ Detected | 🚨 HIGH |
| **micr0s0ft.com** | microsoft.com | 0→o | ✓ Detected | 🚨 HIGH |
| **f4ceb00k.com** | facebook.com | 4→a, 00→oo | ✓ Detected | 🚨 HIGH |
| **apple.com** | apple.com | None | ✓ Safe | ✅ SAFE |

### Homograph Attacks (Unicode Lookalikes)

| Domain | Real Brand | Attack Type | Detection | Risk |
|--------|-----------|-------------|-----------|------|
| **amazоn.com** | amazon.com | Cyrillic о (U+043E) | ✓ Detected | 🚨 HIGH |
| **fасebook.com** | facebook.com | Cyrillic а (U+0430) | ✓ Detected | 🚨 HIGH |
| **микrosоft.com** | microsoft.com | Cyrillic characters | ✓ Detected | 🚨 HIGH |
| **google.com** | google.com | None | ✓ Safe | ✅ SAFE |

### Typosquatting Patterns

| Domain | Real Brand | Pattern | Detection | Risk |
|--------|-----------|---------|-----------|------|
| **paypal-verify.com** | paypal.com | brand-verify | ✓ Detected | ⚠️ MEDIUM |
| **secure-amazon.com** | amazon.com | secure-brand | ✓ Detected | ⚠️ MEDIUM |
| **google-login.com** | google.com | brand-login | ✓ Detected | ⚠️ MEDIUM |

---

## Risk Scoring

### Lookalike Domain Detection Scoring

```
Base Score Allocation:
├── Lookalike Domain (g00gle.com)    → +45 points
├── Homograph Attack (amazоn.com)    → +45 points
├── Typosquatting Variant            → +35 points
├── Misspelling Pattern              → +25 points
└── Other Phishing Indicators        → +5-30 points

Risk Thresholds:
├── >= 80 points     → 🚨 PHISHING (Label as phishing)
├── 50-79 points     → ⚠️ SUSPICIOUS (Requires verification)
└── < 50 points      → ✅ SAFE (Low risk)
```

### Example Scoring Scenarios

**Scenario 1: Lookalike Domain Email**
```
From: "Amazon Support" <support@amaz0n.com>
URL: https://amaz0n.com/verify

Score Calculation:
├── Lookalike domain (amaz0n)                 → +45
├── Email spoofing (non-official domain)      → +20
├── Credential-harvesting path (/verify)      → +10
├── Urgent action language                    → +15
└── Total Score: 90 → 🚨 PHISHING
```

**Scenario 2: Homograph Attack Email**
```
Subject: "Unusual Activity - Verify Account"
URL: https://amazоn.com (Cyrillic о)

Score Calculation:
├── Homograph attack (Cyrillic character)     → +45
├── Security scare tactic                     → +15
├── Credential verification request           → +15
└── Total Score: 75 → ⚠️ SUSPICIOUS
```

**Scenario 3: Legitimate Amazon Domain**
```
From: Amazon Security <account-activity@amazon.com>
URL: https://www.amazon.com/account/security

Score Calculation:
├── Official domain (amazon.com)              → 0
├── Legitimate sender domain                  → 0
├── Security notification (normal)            → +5
└── Total Score: 5 → ✅ SAFE
```

---

## Test Suite

### Unit Tests

Run parser and lookalike detection tests:

```bash
# Run all lookalike detection tests
cd supabase/functions/__tests__
deno run --allow-all lookalike-detection.test.ts

# Run comprehensive test suite
deno run --allow-all schemas.test.ts
deno run --allow-all edge-functions.test.ts
```

**Test file**: [supabase/functions/__tests__/lookalike-detection.test.ts](../supabase/functions/__tests__/lookalike-detection.test.ts)

**Includes**:
- 20+ lookalike domain test cases
- 5+ email with lookalike link test cases
- Legitimate vs. malicious domain comparisons
- Cyrillic and Greek homograph test cases

### Sample Test Output

```
╔════════════════════════════════════════════════════════════╗
║  Lookalike Domain Detection Test Suite                     ║
╚════════════════════════════════════════════════════════════╝

TEST CASES: Domain Lookalikes

🚨 Domain: g00gle.com
   Expected: PHISHING
   Original Brand: google
   Reason: Zero (0) substitutes for letter O

🚨 Domain: amaz0n.com
   Expected: PHISHING
   Original Brand: amazon
   Reason: Zero (0) substitutes for letter O

✓ Domain: google.com
   Expected: SAFE
   Original Brand: google
   Reason: Official Google domain
```

---

## API Response Example

When a lookalike domain is detected, the API returns:

```json
{
  "label": "phishing",
  "risk_percentage": 90,
  "confidence": 0.95,
  "input_type": "email",
  "top_reasons": [
    "Lookalike domain impersonating 'amazon' with character substitutions: 0 (looks like o)",
    "Email Spoofing: Sender claims to be 'Amazon' but uses non-official domain",
    "Credential Harvesting: Multiple phrases targeting account credentials"
  ],
  "details": {
    "indicators": [
      {
        "name": "Lookalike Domain Attack",
        "severity": "high",
        "description": "Domain 'amaz0n.com' is a lookalike of 'amazon' with substitutions: 0 (looks like o)"
      },
      {
        "name": "Email Spoofing",
        "severity": "high",
        "description": "Sender claims to be 'Amazon' but email domain is amaz0n.com"
      }
    ],
    "analysis_summary": "This email has strong phishing indicators. Do not click any links or provide personal information."
  }
}
```

---

## Implementation Details

### Files Modified

1. **[supabase/functions/detect-phishing/index.ts](../supabase/functions/detect-phishing/index.ts)**
   - Added `LOOKALIKE_SUBSTITUTIONS` with extended character mapping
   - Added `OFFICIAL_BRAND_DOMAINS` database
   - Added `normalizeLookalikeCharacters()` function
   - Added `detectLookalikeAttack()` function
   - Added `detectHomographAttack()` function
   - Enhanced `checkTyposquatting()` function with three-tier detection
   - Updated `analyzeUrl()` to use new lookalike detection

2. **[supabase/functions/__tests__/lookalike-detection.test.ts](../supabase/functions/__tests__/lookalike-detection.test.ts)**
   - Comprehensive test cases for lookalike domains
   - Email test cases with lookalike links
   - Scoring examples and risk assessment documentation

---

## How It Works

### Step 1: Domain Normalization
```
Input Domain:  amaz0n.com
               ↓
Normalize:     Replace 0 with o
               ↓
Normalized:    amazon.com
               ↓
Compare with known brands: matches "amazon"
```

### Step 2: Character Analysis
```
Original:   a m a z 0 n . c o m
Normalized: a m a z o n . c o m
            ↑ Difference at position 4
            
Substitution Found: 0 → o
Confidence: HIGH (common phishing vector)
Risk Score: +45 points
```

### Step 3: Brand Verification
```
Normalized domain: amazon.com
Known official domains: [amazon.com, aws.amazon.com]

Is official? NO → PHISHING
```

---

## Security Considerations

### Evasion Techniques Protected Against

✓ **Number substitution**: 0→o, 1→i/l, 3→e, 4→a, 5→s, 7→t, 8→b, 9→g  
✓ **Special characters**: @→a, $→s, |→l, !→i, ()→d  
✓ **Unicode homographs**: Cyrillic (а, е, о, с), Greek (ο, ρ), Armenian, etc.  
✓ **Visual similarities**: Characters that look identical at normal zoom levels  
✓ **Mixed substitutions**: f4ceb00k.com (multiple different substitutions)  

### Not Protected Against (yet)

- **IDN (Internationalized Domain Names)**: xn-- encoded Unicode domains
- **Domain registration timing**: Newly registered lookalike domains may not be in threat intelligence databases
- **Legitimate services on lookalike domains**: Edge case where a real service exists on a lookalike domain

---

## Future Enhancements

1. **Machine Learning**: Train model on known phishing domains to improve accuracy
2. **Whois Integration**: Check domain registration date and history
3. **SSL Certificate Validation**: Verify certificate matches domain claims
4. **Visual Rendering**: Check how domain renders in browsers for true visual similarity
5. **Deep Learning Homograph Detection**: Use computer vision to detect character lookalikes

---

## References

- **Homograph Attacks**: https://en.wikipedia.org/wiki/IDN_homograph_attack
- **Typosquatting**: https://en.wikipedia.org/wiki/Typosquatting
- **Phishing Evolution**: https://www.phishlabs.com/
- **Unicode Security**: https://unicode.org/reports/tr36/

---

**Last Updated**: January 30, 2026  
**Status**: ✅ Production Ready  
**Test Coverage**: 25+ test cases  
**Supported Brands**: 25+ major companies
