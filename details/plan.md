

# Enhanced Phishing Detection Plan

## Overview
Update the phishing detection engine to better analyze emails and messages with the specific characteristics you outlined. This includes detecting email spoofing, improving subject line analysis, checking for generic greetings, and adding attachment risk detection.

---

## What Will Be Added

### 1. Email Spoofing Detection
Detect when sender names/addresses masquerade as trusted entities:
- Check "From:" header for brand names in display name vs actual email domain mismatch
- Detect free email providers (gmail, yahoo, outlook) claiming to be from banks/companies
- Flag suspicious sender patterns like "Amazon Support <random123@mail.com>"

### 2. Enhanced Subject Line Analysis
Add detection for common phishing subject keywords:
- Invoice-related: "Invoice", "Payment", "Receipt", "Order Confirmation"
- Account threats: "Suspended", "Locked", "Disabled", "Terminated"
- Action required: "Action Required", "Immediate Action", "Final Notice"
- Security alerts: "Security Alert", "Unusual Sign-in", "Password Reset"

### 3. Generic Greeting Detection
Flag impersonal greetings that indicate mass phishing:
- "Dear Sir/Madam"
- "Dear Customer"
- "Dear Valued Member"
- "Dear User"
- "Hello Friend"

### 4. HTML Content Analysis
When email contains HTML patterns:
- Detect brand logo references without matching domain
- Check for form elements in emails (credential harvesting)
- Identify hidden text or mismatched visible vs actual links
- Flag poor formatting indicators (excessive inline styles, broken images)

### 5. Attachment Risk Detection
Check for mentions of dangerous attachment types:
- Executable files: .exe, .bat, .cmd, .scr, .pif
- Script files: .js, .vbs, .ps1, .wsf
- Macro-enabled documents: .docm, .xlsm, .pptm
- Compressed with executables: references to "open the zip", "extract and run"

### 6. AI Prompt Enhancement
Update the AI system prompt to specifically look for:
- Sender legitimacy vs claimed identity
- Tone and urgency analysis
- Professional formatting assessment
- Social engineering tactics

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/detect-phishing/index.ts` | Add new detection functions, enhance text analysis, improve AI prompt |
| `src/components/ScannerInput.tsx` | Add tip about pasting email headers for better analysis |

---

## Technical Details

### New Detection Functions

```text
+-- analyzeEmailHeaders(content)
|   +-- Extract From, Reply-To, Return-Path
|   +-- Check domain mismatches
|   +-- Detect free email impersonation
|
+-- analyzeSubjectLine(content)
|   +-- Extract Subject header
|   +-- Check against phishing keywords
|   +-- Score based on threat level
|
+-- checkGenericGreetings(content)
|   +-- Match common impersonal patterns
|   +-- Add indicator if found
|
+-- checkAttachmentRisks(content)
|   +-- Detect dangerous file extensions
|   +-- Flag executable attachment mentions
|
+-- analyzeHtmlPatterns(content)
    +-- Check for form elements
    +-- Detect hidden links
    +-- Flag suspicious formatting
```

### Updated Keyword Lists

**Subject Line Keywords (High Risk):**
- Invoice, Payment Due, Receipt, Order
- Suspended, Locked, Disabled, Terminated
- Verify, Confirm, Update Required, Action Needed
- Final Warning, Last Chance, Expires Today

**Generic Greetings:**
- Dear Sir/Madam, Dear Customer, Dear User
- Dear Valued Member, Dear Account Holder
- Hello Friend, Dear Beneficiary

**Dangerous Attachments:**
- .exe, .bat, .cmd, .scr, .pif, .com
- .js, .jse, .vbs, .vbe, .wsf, .wsh
- .docm, .xlsm, .pptm, .dotm

### Enhanced AI Prompt
The AI will be instructed to analyze:
- Does the sender identity match the claimed organization?
- Is the email using urgency/fear tactics?
- Is the greeting generic or personalized?
- Are there signs of poor translation or formatting?
- Does the email request sensitive information?

---

## Detection Flow After Changes

```text
Input Content
     |
     v
+--------------------+
| Detect Input Type  |
| (URL/Email/SMS)    |
+--------------------+
     |
     v
+--------------------+
| Extract Components |
| - URLs             |
| - Email headers    |
| - Subject line     |
+--------------------+
     |
     +---> analyzeEmailHeaders() ----+
     |                               |
     +---> analyzeSubjectLine() -----+
     |                               |
     +---> checkGenericGreetings() --+
     |                               |
     +---> checkAttachmentRisks() ---+
     |                               |
     +---> analyzeHtmlPatterns() ----+
     |                               |
     +---> analyzeUrl() (existing) --+
     |                               |
     +---> checkPhishTank() ---------+
     |                               |
     +---> analyzeText() (enhanced) -+
     |                               v
     |                    +------------------+
     |                    | Aggregate Score  |
     |                    | & Indicators     |
     +--------------------+------------------+
                               |
                               v
                    +------------------+
                    | AI Analysis      |
                    | (Enhanced Prompt)|
                    +------------------+
                               |
                               v
                    +------------------+
                    | Final Result     |
                    | safe/suspicious/ |
                    | phishing         |
                    +------------------+
```

---

## User-Facing Improvements

- **Better email analysis** - More accurate detection when full email content with headers is provided
- **Clearer indicators** - New indicator types: "Email Spoofing", "Generic Greeting", "Dangerous Attachment Mentioned", "Suspicious Subject Line"
- **Updated tips** - The scanner will remind users to paste email headers for best results

---

## Expected Impact

| Scenario | Current Detection | After Update |
|----------|------------------|--------------|
| Email from "Amazon <support@randomdomain.com>" | May miss spoofing | Detected as high-risk spoofing |
| Subject: "Invoice #12345 - Immediate Payment Required" | Partial detection | Full keyword + urgency detection |
| "Dear Valued Customer" greeting | Not detected | Flagged as generic greeting |
| Mention of ".exe attachment" | Not detected | Flagged as dangerous attachment |
| Poor formatting in email body | Not detected | AI analyzes formatting quality |

