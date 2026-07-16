# Quotation Analysis Prompt (zh-HK)
## Module: Apple Finance (A2)
## Purpose: Analyze quotation lists to identify anomalies and provide procurement recommendations

## Input
You will receive a list of quotations for one or more procurement items. Each quotation contains vendor name, item description, unit price, quantity, and total price.

## Output Format
You MUST return a valid JSON object with the following structure:

```json
{
  "fields": {
    "single_bid": [
      {
        "item": "string - Item description",
        "vendor": "string - Vendor name",
        "price": "number - Unit or total price",
        "reason": "string - Why it's flagged"
      }
    ],
    "non_lowest_chosen": [
      {
        "item": "string - Item description",
        "current_vendor": "string - Vendor that was/would be chosen",
        "current_price": "number - Their price",
        "lowest_vendor": "string - Vendor with lowest price",
        "lowest_price": "number - Lowest price",
        "difference": "number - Price difference (current - lowest)",
        "percent_over": "number - Percentage over lowest"
      }
    ],
    "lowest_bid_summary": [
      {
        "item": "string - Item description",
        "lowest_vendor": "string - Vendor with best price",
        "lowest_price": "number",
        "quotation_count": "number - How many quotes received"
      }
    ],
    "summary": "string - Overall summary and recommendations"
  },
  "warnings": ["array of warning strings"],
  "confidence": "string - One of: low | medium | high"
}
```

## Rules

1. **Single Bid Detection**:
   - Flag items with only one quotation received
   - These require attention for fair procurement practices
   - Explain why it's flagged (only one vendor quoted)

2. **Non-Lowest Selection Analysis**:
   - Compare selected price against lowest available
   - Calculate percentage difference
   - Note if non-lowest selection has justification (quality, delivery time, etc.)
   - Flag significant price differences (>20% over lowest)

3. **Lowest Bid Summary**:
   - Identify the lowest price for each item
   - Count quotations per item
   - Recommend based on value (not just price)

4. **Recommendations**:
   - Consider: price, delivery time, vendor reputation, warranty
   - If all quotes are similar in price, recommend quality factors
   - If there's a significant price outlier, investigate

5. **Confidence Levels**:
   - `high`: Complete data for 3+ items, clear quotations
   - `medium`: Some incomplete data or limited quotations
   - `low`: Missing critical data, very few quotations

## Examples

### Example 1: Normal Procurement
**Input:**
```
Item: Printer Paper A4
Quotations:
- Vendor A: $45/ream
- Vendor B: $42/ream
- Vendor C: $48/ream

Item: Ballpoint Pens
Quotations:
- Vendor A: $12/dozen
```

**Output:**
```json
{
  "fields": {
    "single_bid": [
      {
        "item": "Ballpoint Pens",
        "vendor": "Vendor A",
        "price": 12,
        "reason": "Only one quotation received - recommend seeking additional quotes"
      }
    ],
    "non_lowest_chosen": [],
    "lowest_bid_summary": [
      {
        "item": "Printer Paper A4",
        "lowest_vendor": "Vendor B",
        "lowest_price": 42,
        "quotation_count": 3
      },
      {
        "item": "Ballpoint Pens",
        "lowest_vendor": "Vendor A",
        "lowest_price": 12,
        "quotation_count": 1
      }
    ],
    "summary": "For Printer Paper, Vendor B offers the best price at $42/ream. Ballpoint Pens only has one quote - consider getting additional quotations for better market comparison."
  },
  "warnings": ["Ballpoint Pens: Only 1 quotation - procurement policy may require minimum 3 quotes"],
  "confidence": "high"
}
```

### Example 2: Anomaly Detected
**Input:**
```
Item: Office Chair
Quotations:
- Supplier XYZ: $800
- Supplier ABC: $1,200  [SELECTED]
- Supplier DEF: $850
```

**Output:**
```json
{
  "fields": {
    "single_bid": [],
    "non_lowest_chosen": [
      {
        "item": "Office Chair",
        "current_vendor": "Supplier ABC",
        "current_price": 1200,
        "lowest_vendor": "Supplier XYZ",
        "lowest_price": 800,
        "difference": 400,
        "percent_over": 50
      }
    ],
    "lowest_bid_summary": [
      {
        "item": "Office Chair",
        "lowest_vendor": "Supplier XYZ",
        "lowest_price": 800,
        "quotation_count": 3
      }
    ],
    "summary": "WARNING: Supplier ABC's quote is 50% higher than the lowest. This requires justification in the procurement record. Consider requesting explanation or re-evaluating selection criteria."
  },
  "warnings": [
    "Office Chair: Selected price ($1,200) is 50% over lowest ($800) - requires approval justification",
    "Price difference of $400 may require additional authorization"
  ],
  "confidence": "high"
}
```

## Safety
- Be objective - report anomalies without judgment
- Flag procurement policy concerns
- Provide actionable recommendations
- Always explain why items are flagged
