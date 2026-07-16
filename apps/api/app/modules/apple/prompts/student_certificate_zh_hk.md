# Student Certificate Content Generation Prompt (zh-HK)
## Module: Apple Students (A4)
## Purpose: Generate content for student enrollment/attendance certificates

## Input
You will receive student information and certificate type request.

## Required Input Fields
```json
{
  "student_name_en": "string - Student English name",
  "student_name_zh": "string or null - Student Chinese name",
  "student_no": "string - Student number",
  "class_name": "string - Class (e.g., 'F.3A')",
  "admission_date": "string - Date in YYYY-MM-DD format",
  "certificate_type": "string - One of: enrollment | attendance | graduation | transfer | other",
  "purpose": "string or null - Purpose of certificate if specified",
  "issue_date": "string - Date in YYYY-MM-DD format"
}
```

## Output Format
You MUST return a valid JSON object with the following structure:

```json
{
  "fields": {
    "zh_content": "string - Certificate content in Traditional Chinese",
    "en_content": "string - Certificate content in English",
    "issue_date": "string - Issue date in YYYY-MM-DD format",
    "certificate_type": "string - Type confirmed"
  },
  "confidence": "string - One of: low | medium | high",
  "warnings": ["array of warning strings"]
}
```

## Certificate Templates

### 1. Enrollment Certificate (在学證明書)
**Chinese Template:**
```
茲證明
【學生姓名】
學號：【學號】
於【入學年份】年入讀本校【班別】，現為本校學生。

特此證明。

【日期】
香港培英中學
```

**English Template:**
```
This is to certify that

【STUDENT NAME】
Student Number: 【STUDENT NO】
was admitted to this school in 【YEAR】 and is currently enrolled in Class 【CLASS】.

This certificate is issued for 【PURPOSE】.

【DATE】
Po Ying Secondary School
```

### 2. Attendance Certificate (出席證明書)
**Chinese Template:**
```
茲證明
【學生姓名】
學號：【學號】
為本校【班別】學生。

根據本校記錄，該學生於本學年上課出席情況良好。

特此證明。

【日期】
香港培英中學
```

**English Template:**
```
This is to certify that

【STUDENT NAME】
Student Number: 【STUDENT NO】
is a student of Class 【CLASS】 in this school.

Based on our records, this student has maintained good attendance during the current academic year.

This certificate is issued for 【PURPOSE】.

【DATE】
Po Ying Secondary School
```

### 3. Graduation Certificate (畢業證明書)
**Chinese Template:**
```
茲證明
【學生姓名】
學號：【學號】
於本校【入學年份】至【畢業年份】就讀，現已完成所有課程，符合畢業資格。

特此證明。

【日期】
香港培英中學
```

**English Template:**
```
This is to certify that

【STUDENT NAME】
Student Number: 【STUDENT NO】
was enrolled in this school from 【YEAR OF ADMISSION】 to 【YEAR OF GRADUATION】 and has successfully completed all required courses, meeting the requirements for graduation.

This certificate is issued for 【PURPOSE】.

【DATE】
Po Ying Secondary School
```

## Rules

1. **Chinese Name**: If not provided, use English name transliteration
2. **Purpose**: If not specified, use "一般用途" / "general purposes"
3. **Date Formats**:
   - Chinese: YYYY年MM月DD日
   - English: DD Month YYYY
4. **Confidence Levels**:
   - `high`: All required fields present and complete
   - `medium`: Minor fields missing, certificate still valid
   - `low`: Critical fields missing (name, student number)

## Examples

### Example 1: Complete Data
**Input:**
```json
{
  "student_name_en": "CHAN TAI MAN",
  "student_name_zh": "陳大文",
  "student_no": "24015",
  "class_name": "F.5A",
  "admission_date": "2022-09-01",
  "certificate_type": "enrollment",
  "purpose": "申請大學",
  "issue_date": "2025-07-15"
}
```

**Output:**
```json
{
  "fields": {
    "zh_content": "茲證明\n\n陳大文\n學號：24015\n於2022年入讀本校F.5A，現為本校學生。\n\n特此證明。\n\n2025年7月15日\n香港培英中學",
    "en_content": "This is to certify that\n\nCHAN TAI MAN\nStudent Number: 24015\nwas admitted to this school in 2022 and is currently enrolled in Class F.5A.\n\nThis certificate is issued for 申請大學.\n\n15 July 2025\nPo Ying Secondary School",
    "issue_date": "2025-07-15",
    "certificate_type": "enrollment"
  },
  "confidence": "high",
  "warnings": []
}
```

### Example 2: Missing Chinese Name
**Input:**
```json
{
  "student_name_en": "LEE WING KAI",
  "student_name_zh": null,
  "student_no": "23008",
  "class_name": "F.4B",
  "admission_date": "2023-09-01",
  "certificate_type": "attendance",
  "purpose": null,
  "issue_date": "2025-07-15"
}
```

**Output:**
```json
{
  "fields": {
    "zh_content": "茲證明\n\nLEE WING KAI\n學號：23008\n為本校F.4B學生。\n\n根據本校記錄，該學生於本學年上課出席情況良好。\n\n特此證明。\n\n2025年7月15日\n香港培英中學",
    "en_content": "This is to certify that\n\nLEE WING KAI\nStudent Number: 23008\nis a student of Class F.4B in this school.\n\nBased on our records, this student has maintained good attendance during the current academic year.\n\nThis certificate is issued for general purposes.\n\n15 July 2025\nPo Ying Secondary School",
    "issue_date": "2025-07-15",
    "certificate_type": "attendance"
  },
  "confidence": "medium",
  "warnings": [
    "Chinese name not provided - used English name transliteration",
    "Purpose not specified - used 'general purposes'"
  ]
}
```

## Safety
- Verify student data consistency between fields
- Flag any suspicious patterns (e.g., future admission dates)
- Always use official school name: 香港培英中學 / Po Ying Secondary School
- Do NOT add information not provided in the input
