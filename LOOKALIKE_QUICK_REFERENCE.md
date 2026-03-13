# Quick Reference: Lookalike Domain Detection

## Detectable Phishing Domains

### Lookalike Domains (Numbers/Special Characters)
```
✓ g00gle.com        → google.com (0 = o)
✓ amaz0n.com        → amazon.com (0 = o)
✓ paypa1.com        → paypal.com (1 = l)
✓ micr0s0ft.com     → microsoft.com (0 = o)
✓ 4pp1e.com         → apple.com (4 = a, 1 = l)
✓ f4ceb00k.com      → facebook.com (4 = a, 00 = oo)
✓ linkedln.com      → linkedin.com (1 = i)
✓ d1scord.com       → discord.com (1 = i)
✓ g1thub.com        → github.com (1 = i)
✓ m1cr050ft.com     → microsoft.com (1 = i, 0 = o, 5 = s)
✓ twitt3r.com       → twitter.com (3 = e)
✓ instagr4m.com     → instagram.com (4 = a)
```

### Homograph Attacks (Unicode Lookalikes)
```
✓ amazоn.com        → amazon.com (Cyrillic о = o)
✓ fасebook.com      → facebook.com (Cyrillic а = a)
✓ микросοft.com     → microsoft.com (Cyrillic characters)
✓ раypal.com        → paypal.com (Cyrillic р = p)
✓ αmazon.com        → amazon.com (Greek α = a)
✓ gοοgle.com        → google.com (Greek ο = o)
```

### Traditional Typosquatting
```
✓ paypal-verify.com → paypal.com
✓ secure-amazon.com → amazon.com
✓ google-login.com  → google.com
✓ facebook-security.com → facebook.com
✓ apple-account.com → apple.com
```

---

## Testing

### Run Tests
```bash
cd supabase/functions/__tests__

# Test lookalike detection
deno run --allow-all lookalike-detection.test.ts

# Test full parser
deno run --allow-all schemas.test.ts

# Run all tests
deno run --allow-all ../test-all.ts
```

### Test API Endpoint
```bash
# Using curl
curl -X POST http://localhost:54321/functions/v1/detect-phishing \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Click here to verify your Amazon account: https://amaz0n.com/verify",
    "type": "email"
  }'

# Expected response:
# {
#   "label": "phishing",
#   "risk_percentage": 90,
#   "confidence": 0.95,
#   "top_reasons": [
#     "Lookalike domain impersonating 'amazon' with character substitutions: 0 (looks like o)",
#     "Credential Harvesting: Multiple phrases targeting account credentials"
#   ]
# }
```

---

## Detection Logic

### Score Calculation
```
Base Score: 0

Lookalike Domain Found (e.g., g00gle.com)
  ↓ Score += 45 points

Homograph Attack (e.g., amazоn.com with Cyrillic)
  ↓ Score += 45 points

Typosquatting Pattern (e.g., paypal-verify.com)
  ↓ Score += 35 points (or 25 if variant)

Email Spoofing
  ↓ Score += 20 points

Other Indicators (urgency, grammar, etc.)
  ↓ Score += 5-30 points

Final Score:
  >= 80  → 🚨 PHISHING
  50-79  → ⚠️ SUSPICIOUS
  < 50   → ✅ SAFE
```

---

## Supported Brands (25+)

- paypal
- amazon
- google
- facebook
- microsoft
- apple
- netflix
- instagram
- twitter
- linkedin
- whatsapp
- telegram
- bank
- chase
- wellsfargo
- citibank
- coinbase
- binance
- crypto
- wallet
- dhl
- fedex
- ups
- usps
- irs
- hmrc
- github
- slack
- discord

---

## Character Substitutions Detected

### Numbers
| Char | Lookalike | Example |
|------|-----------|---------|
| a | 4 | 4mazon |
| e | 3 | g00gl3 |
| i | 1 | pa1pal |
| o | 0 | g00gle |
| s | 5 | m1cr05oft |
| l | 1 | paya1 |
| g | 9 | 9oogle |
| t | 7 | microso7t |

### Special Characters
| Char | Lookalike | Example |
|------|-----------|---------|
| a | @ | p@ypal |
| s | $ | micro$oft |
| i | ! | paya!pal |
| l | \| | paya\|pal |

### Unicode (Cyrillic/Greek)
| Char | Lookalike | Code | Example |
|------|-----------|------|---------|
| a | а (Cyrillic) | U+0430 | fасebook |
| o | о (Cyrillic) | U+043E | amaz0n |
| p | р (Cyrillic) | U+0440 | раypal |
| o | ο (Greek) | U+03BF | gοοgle |
| a | α (Greek) | U+03B1 | αmazon |

---

## Common Phishing Email Patterns

### Pattern 1: Lookalike Domain with Spoofed Sender
```
From: "Amazon Support" <support@amaz0n.com>
Subject: Urgent: Verify Your Account
Body: Click here to verify immediately: https://amaz0n.com/verify
```
**Detection**: Lookalike domain (45) + Email spoofing (20) + Urgency (15) = 80+ → PHISHING

### Pattern 2: Homograph Attack
```
From: accounts-security@google.com
Subject: Unusual Activity Detected
Body: Verify at: https://amazоn.com (Cyrillic о)
```
**Detection**: Homograph attack (45) + Security scare (15) = 60+ → SUSPICIOUS

### Pattern 3: Typosquatting with Hidden Link
```
From: PayPal Security Team
Subject: Confirm Your Identity
Body: Click [here](https://paypal-verify.com) to verify
Display: "here" → Actual: paypal-verify.com
```
**Detection**: Typosquatting (35) + Hidden link (40) = 75+ → SUSPICIOUS

---

## Real-World Examples

### Example 1: Amazon Phishing (Lookalike)
```
Email Subject: "Your Amazon account has been suspended"
Link: https://amaz0n.com/account/restore-access

Detection:
├─ Lookalike domain (amaz0n)          ✓ HIGH
├─ Urgency language ("suspended")     ✓ HIGH
├─ Credential request                 ✓ HIGH
├─ Non-official sender domain         ✓ HIGH
└─ Risk Score: 85+ → 🚨 PHISHING
```

### Example 2: Google Phishing (Unicode)
```
Email Subject: "Verify your Google Account"
Link: https://gooqle.com/accounts/signin

Detection:
├─ Lookalike domain (gooqle)         ✓ HIGH
├─ Credential harvesting              ✓ HIGH
├─ Official branding                  ✓ MEDIUM
└─ Risk Score: 82+ → 🚨 PHISHING
```

### Example 3: PayPal Typosquatting
```
Email Subject: "PayPal Account Verification"
Link: https://paypal-security-verify.com/confirm

Detection:
├─ Typosquatting pattern             ✓ MEDIUM
├─ Verification request              ✓ MEDIUM
├─ Suspicious domain                 ✓ MEDIUM
└─ Risk Score: 58+ → ⚠️ SUSPICIOUS
```

---

## Implementation Status

✅ Lookalike character substitution detection  
✅ Homograph attack detection (Unicode)  
✅ Typosquatting pattern detection  
✅ Email spoofing detection  
✅ Credential harvesting detection  
✅ Risk scoring and labeling  
✅ Test suite (25+ test cases)  
✅ API integration  

**Status**: Production Ready  
**Last Updated**: January 30, 2026
