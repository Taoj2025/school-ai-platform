# Award Information Extraction Prompt (zh-HK)
## Module: Apple Awards (A1)
## Purpose: Extract award information and recipient data from unstructured text or Excel content

## Input
You will receive raw text from award nomination documents or Excel content containing award information.

## Output Format
You MUST return a valid JSON object with the following structure:

```json
{
  "fields": {
    "award_name": "string - Name of the award (e.g., '學期學業獎')",
    "category": "string - One of: 學業 / 品行 / 服務 / 體育 / 藝術 / 宗教",
    "academic_year": "string - e.g., '2025-2026'",
    "semester": "string - One of: 上學期 / 下學期 / 畢業禮",
    "recipients": [
      {
        "student_no": "string - Student number (e.g., '24001')",
        "name": "string - Student name in Chinese or English",
        "class": "string - Class name (e.g., 'F.1A')",
        "score": "number or null - Score if available",
        "ranking": "number or null - Ranking if available"
      }
    ]
  },
  "confidence": "string - One of: low | medium | high",
  "warnings": ["array of warning strings"],
  "raw_text": "string - Original text for reference"
}
```

## Rules

1. **Award Name**: Extract the official award name. If ambiguous, use the most likely interpretation.
2. **Category**: Classify based on keywords:
   - 學業, 成績, 學業成績 → 學業
   - 品行, 操行, 德育 → 品行
   - 服務, 義務, 義工 → 服務
   - 體育, 運動, 游泳, 田徑 → 體育
   - 藝術, 音樂, 美術, 舞蹈 → 藝術
3. **Recipients**:
   - If student number is available, use it as the primary identifier
   - If student number is not available, use name as identifier
   - Never fabricate student information - only include confirmed data
   - If data is uncertain, mark confidence as "low"
4. **Confidence Levels**:
   - `high`: All required fields present, clear formatting
   - `medium`: Most fields present, minor ambiguity
   - `low`: Missing critical fields, unclear formatting, or uncertain data

## Examples

### Example 1: Clear Academic Award List
**Input:**
```
學期學業獎 2025-2026 上學期
學號    姓名      班別    成績
24001   陳小明    F.1A    95
24002   李小華    F.1A    92
```

**Output:**
```json
{
  "fields": {
    "award_name": "學期學業獎",
    "category": "學業",
    "academic_year": "2025-2026",
    "semester": "上學期",
    "recipients": [
      {"student_no": "24001", "name": "陳小明", "class": "F.1A", "score": 95, "ranking": 1},
      {"student_no": "24002", "name": "李小華", "class": "F.1A", "score": 92, "ranking": 2}
    ]
  },
  "confidence": "high",
  "warnings": [],
  "raw_text": "..."
}
```

### Example 2: Ambiguous Input
**Input:**
```
服務獎
表現積極的學生
```

**Output:**
```json
{
  "fields": {
    "award_name": "服務獎",
    "category": "服務",
    "academic_year": null,
    "semester": null,
    "recipients": []
  },
  "confidence": "low",
  "warnings": [
    "Academic year not specified",
    "Semester not specified",
    "No recipient data provided - only general description"
  ],
  "raw_text": "..."
}
```

## Safety
- Do NOT invent or guess student names or numbers
- Do NOT modify scores or rankings
- If data is unclear, set confidence to "low" and explain in warnings
- Always preserve the original raw_text for human verification
