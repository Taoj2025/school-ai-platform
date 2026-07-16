# Receipt Information Extraction Prompt (zh-HK)
## Module: Apple Finance (A2)
## Purpose: Extract structured financial fields from handwritten or printed receipt OCR text

## Input
You will receive OCR text extracted from a receipt image. The text may contain:
- Handwritten characters (may be partially legible)
- Printed text
- Currency symbols
- Date formats

## Output Format
You MUST return a valid JSON object with the following structure:

```json
{
  "fields": {
    "amount": "number or null - Total amount in HKD",
    "currency": "string - Always 'HKD' for Hong Kong receipts",
    "date": "string - Date in YYYY-MM-DD format",
    "payer": "string or null - Name of payer if visible",
    "payee": "string or null - Name of payee/receiver if visible",
    "purpose": "string or null - Description of what was paid for",
    "receipt_no": "string or null - Receipt number if visible",
    "payment_method": "string or null - cash/cheque/card/transfer"
  },
  "confidence": "string - One of: low | medium | high",
  "warnings": ["array of warning strings describing OCR issues"],
  "raw_text": "string - Original OCR text for reference"
}
```

## Rules

1. **Amount**:
   - Look for patterns like "HK$", "$", "港幣", "港幣"
   - If multiple amounts appear, the largest is likely the total
   - If amount is unclear due to handwriting, return `null` and add warning
   - Always convert to numeric format (no commas in numbers)

2. **Date**:
   - Accept formats: DD/MM/YYYY, YYYY-MM-DD, YYYY年MM月DD日
   - If only year/month visible, estimate the 1st
   - If completely unclear, return `null`

3. **Currency**:
   - Default to "HKD" for Hong Kong context
   - If "RMB", "USD", etc. clearly indicated, use that instead

4. **Payment Method**:
   - Look for keywords: 現金 (cash), 支票 (cheque), 信用卡 (card), 轉帳 (transfer)
   - If unclear, return `null`

5. **Handwriting**:
   - If characters are unclear, note in warnings
   - Do not guess - if unreadable, return `null`
   - Flag any potentially modified digits

6. **Confidence Levels**:
   - `high`: All critical fields (amount, date) clear and readable
   - `medium`: Amount clear but some details unclear, or vice versa
   - `low`: Significant portions unreadable, amount uncertain

## Examples

### Example 1: Clear Printed Receipt
**Input:**
```
收據
日期: 2025-07-15
金額: HK$ 1,500.00
收款人: 學校辦事處
項目: 活動報名費
收據編號: RC202507001
付款方式: 現金
```

**Output:**
```json
{
  "fields": {
    "amount": 1500.00,
    "currency": "HKD",
    "date": "2025-07-15",
    "payer": null,
    "payee": "學校辦事處",
    "purpose": "活動報名費",
    "receipt_no": "RC202507001",
    "payment_method": "cash"
  },
  "confidence": "high",
  "warnings": [],
  "raw_text": "..."
}
```

### Example 2: Handwritten Receipt
**Input:**
```
收據
日期: 15/07/25
金額: HK$ ???50
收款人: 
項目: 午餐
付款: 現金
```

**Output:**
```json
{
  "fields": {
    "amount": null,
    "currency": "HKD",
    "date": "2025-07-15",
    "payer": null,
    "payee": null,
    "purpose": "午餐",
    "receipt_no": null,
    "payment_method": "cash"
  },
  "confidence": "low",
  "warnings": [
    "Amount unclear - digits partially illegible: 'HK$ ???50'",
    "Payee name not visible or incomplete"
  ],
  "raw_text": "..."
}
```

## Safety
- Do NOT guess amounts - if unreadable, return `null`
- Do NOT fabricate missing information
- Always preserve raw OCR text for human verification
- Flag any suspicious modifications or unusual patterns
