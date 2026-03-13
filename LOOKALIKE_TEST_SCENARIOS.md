# Lookalike Detection Test Scenarios

## Testing the Fix

### Scenario 1: Official Domain (SHOULD BE SAFE ✅)

**Input:**
```json
{
  "content": "https://google.com",
  "type": "url"
}
```

**Expected Output:**
```json
{
  "label": "safe",
  "risk_percentage": 5,
  "confidence": 0.75,
  "input_type": "url",
  "top_reasons": ["No significant risks detected"],
  "details": {
    "indicators": [],
    "analysis_summary": "No significant phishing indicators were detected. The content appears to be legitimate."
  }
}
```

**Why Safe?**
- ✓ Domain `google.com` matches OFFICIAL_BRAND_DOMAINS['google']
- ✓ No character substitutions
- ✓ No lookalike patterns

---

### Scenario 2: Lookalike Domain with Number Substitution (SHOULD BE PHISHING 🚨)

**Input:**
```json
{
  "content": "https://g00gle.com",
  "type": "url"
}
```

**Expected Output:**
```json
{
  "label": "phishing",
  "risk_percentage": 85,
  "confidence": 0.98,
  "input_type": "url",
  "top_reasons": [
    "Lookalike Domain Attack: Domain 'g00gle.com' is a lookalike of 'google' with substitutions: 0→o"
  ],
  "details": {
    "indicators": [
      {
        "name": "Lookalike Domain Attack",
        "severity": "high",
        "description": "Domain 'g00gle.com' is a lookalike of 'google' with substitutions: 0→o"
      }
    ],
    "analysis_summary": "This url has strong phishing indicators. Do not click any links or provide personal information."
  }
}
```

**Why Phishing?**
- ✓ Not in OFFICIAL_BRAND_DOMAINS (g00gle.com ≠ google.com)
- ✓ Normalized: g00gle.com → google.com
- ✓ Substitution found: 0 (zero) → o
- ✓ Matches known brand: google
- ✓ Score: +60 points → PHISHING (80+)

---

### Scenario 3: Amazon Lookalike (SHOULD BE PHISHING 🚨)

**Input:**
```json
{
  "content": "Your Amazon account: https://amaz0n.com/verify",
  "type": "email"
}
```

**Expected Output:**
```json
{
  "label": "phishing",
  "risk_percentage": 90,
  "confidence": 0.98,
  "input_type": "email",
  "top_reasons": [
    "Lookalike Domain Attack: Domain 'amaz0n.com' is a lookalike of 'amazon' with substitutions: 0→o",
    "Credential Harvesting: Multiple phrases targeting account credentials",
    "URL Shortener or suspicious domain",
    "Urgency language"
  ],
  "details": {
    "indicators": [
      {
        "name": "Lookalike Domain Attack",
        "severity": "high",
        "description": "Domain 'amaz0n.com' is a lookalike of 'amazon' with substitutions: 0→o"
      },
      {
        "name": "Credential Harvesting",
        "severity": "high",
        "description": "Multiple phrases targeting account credentials or personal information"
      }
    ],
    "analysis_summary": "This email has strong phishing indicators. Do not click any links or provide personal information."
  }
}
```

---

### Scenario 4: PayPal Lookalike (SHOULD BE PHISHING 🚨)

**Input:**
```json
{
  "content": "From: PayPal Support <security@paypa1.com>\nSubject: Verify Account\nClick here to verify: https://paypa1.com/login",
  "type": "email"
}
```

**Expected Output:**
```json
{
  "label": "phishing",
  "risk_percentage": 88,
  "confidence": 0.97,
  "input_type": "email",
  "top_reasons": [
    "Lookalike Domain Attack: Domain 'paypa1.com' is a lookalike of 'paypal' with substitutions: 1→l",
    "Email Spoofing: Sender claims to be 'PayPal' but email domain is paypa1.com",
    "Credential Harvesting: Multiple phrases targeting account credentials"
  ],
  "details": {
    "indicators": [
      {
        "name": "Lookalike Domain Attack",
        "severity": "high",
        "description": "Domain 'paypa1.com' is a lookalike of 'paypal' with substitutions: 1→l"
      },
      {
        "name": "Email Spoofing",
        "severity": "high",
        "description": "Sender claims to be 'PayPal' but email domain is paypa1.com"
      },
      {
        "name": "Credential Harvesting",
        "severity": "high",
        "description": "Multiple phrases targeting account credentials or personal information"
      }
    ],
    "analysis_summary": "This email has strong phishing indicators. Do not click any links or provide personal information."
  }
}
```

---

### Scenario 5: Cyrillic Homograph Attack (SHOULD BE PHISHING 🚨)

**Input:**
```json
{
  "content": "Account suspended at https://amazоn.com (note: Cyrillic о)",
  "type": "email"
}
```

**Expected Output:**
```json
{
  "label": "phishing",
  "risk_percentage": 82,
  "confidence": 0.96,
  "input_type": "email",
  "top_reasons": [
    "Homograph Attack: Domain uses Unicode homoglyphs: о (homograph of o)",
    "Security Scare Tactic: Uses security fear to prompt action"
  ],
  "details": {
    "indicators": [
      {
        "name": "Homograph Attack",
        "severity": "high",
        "description": "Domain uses Unicode homoglyphs: о (homograph of o)"
      },
      {
        "name": "Security Scare Tactic",
        "severity": "medium",
        "description": "Uses security fear to prompt action"
      }
    ],
    "analysis_summary": "This email has strong phishing indicators. Do not click any links or provide personal information."
  }
}
```

---

### Scenario 6: Official Amazon Domain (SHOULD BE SAFE ✅)

**Input:**
```json
{
  "content": "Your package is on the way. Track it at https://www.amazon.com/orders",
  "type": "email"
}
```

**Expected Output:**
```json
{
  "label": "safe",
  "risk_percentage": 8,
  "confidence": 0.85,
  "input_type": "email",
  "top_reasons": ["No significant risks detected"],
  "details": {
    "indicators": [],
    "analysis_summary": "No significant phishing indicators were detected. The content appears to be legitimate."
  }
}
```

---

### Scenario 7: Multiple Lookalike Substitutions (SHOULD BE PHISHING 🚨)

**Input:**
```json
{
  "content": "Verify your F4c3b00k account at https://f4ceb00k.com",
  "type": "email"
}
```

**Expected Output:**
```json
{
  "label": "phishing",
  "risk_percentage": 92,
  "confidence": 0.99,
  "input_type": "email",
  "top_reasons": [
    "Lookalike Domain Attack: Domain 'f4ceb00k.com' is a lookalike of 'facebook' with substitutions: 4→a, 0→o, 0→o"
  ],
  "details": {
    "indicators": [
      {
        "name": "Lookalike Domain Attack",
        "severity": "high",
        "description": "Domain 'f4ceb00k.com' is a lookalike of 'facebook' with substitutions: 4→a, 0→o, 0→o"
      },
      {
        "name": "Credential Harvesting",
        "severity": "high",
        "description": "Multiple phrases targeting account credentials"
      }
    ],
    "analysis_summary": "This email has strong phishing indicators. Do not click any links or provide personal information."
  }
}
```

---

## Quick Testing Commands

```bash
# Test 1: Official domain (should be SAFE)
curl -X POST http://localhost:54321/functions/v1/detect-phishing \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"https://google.com","type":"url"}' | jq '.label'
# Expected: "safe"

# Test 2: Lookalike domain (should be PHISHING)
curl -X POST http://localhost:54321/functions/v1/detect-phishing \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"https://g00gle.com","type":"url"}' | jq '.label'
# Expected: "phishing"

# Test 3: Multiple lookalikes (should be PHISHING)
curl -X POST http://localhost:54321/functions/v1/detect-phishing \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"https://f4ceb00k.com","type":"url"}' | jq '.label'
# Expected: "phishing"

# Test 4: Official Amazon (should be SAFE)
curl -X POST http://localhost:54321/functions/v1/detect-phishing \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"https://amazon.com","type":"url"}' | jq '.label'
# Expected: "safe"
```

---

## Scoring Breakdown

| Domain | Official | Lookalike | Base Score | Boost | Final Score | Label |
|--------|----------|-----------|-----------|-------|-------------|-------|
| google.com | ✓ YES | NO | 0 | - | 0-5 | 🟢 SAFE |
| g00gle.com | NO | ✓ YES | 0 | +60 | 60-65 | 🔴 PHISHING |
| amazon.com | ✓ YES | NO | 0 | - | 0-5 | 🟢 SAFE |
| amaz0n.com | NO | ✓ YES | 0 | +60 | 60-65 | 🔴 PHISHING |
| paypal.com | ✓ YES | NO | 0 | - | 0-5 | 🟢 SAFE |
| paypa1.com | NO | ✓ YES | 0 | +60 | 60-65 | 🔴 PHISHING |
| f4ceb00k.com | NO | ✓ YES | 0 | +60 | 60-65 | 🔴 PHISHING |

---

**Status**: Ready for testing ✅  
**Frontend**: http://localhost:8080  
**Backend**: http://localhost:54321
