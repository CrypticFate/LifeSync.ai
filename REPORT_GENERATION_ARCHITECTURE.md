# Report Generation - File Structure & Dependencies

## 📁 File Tree

```
src/
├── app/
│   ├── order/
│   │   └── page.tsx .......................... User fills health questionnaire (Segment 4)
│   │       └── Collects 30 questions across 6 health categories
│   │       └── Saves to Firestore as Order document
│   │
│   ├── admin/
│   │   └── report/
│   │       └── [orderId]/
│   │           └── page.tsx ................. Display generated report
│   │               └── Fetches order from Firestore
│   │               └── Calls API to generate report
│   │               └── Shows loading screen while generating
│   │               └── Displays completed report
│   │
│   └── api/
│       └── reports/
│           └── generate/
│               └── route.ts ................. 🔑 MAIN REPORT GENERATION ENGINE
│                   ├── POST handler
│                   ├── generateReportPrompt() - Creates comprehensive Gemini prompt
│                   ├── parseGeminiReport() - Parses Gemini response
│                   ├── extractRecommendations() - Pulls actionable advice
│                   └── extractConclusions() - Extracts final thoughts
│
├── lib/
│   ├── firestore.ts .......................... Database operations
│   │   ├── saveReportToFirestore()
│   │   ├── getReportByOrderId()
│   │   └── updateReportStatus()
│   │
│   └── logger.ts ............................ Console logging
│       ├── logReport()
│       └── logReportError()
│
└── types/
    └── report.ts ............................ 📋 Type definitions
        ├── Report interface
        ├── ReportSection interface
        └── ReportGenerationInput interface
```

---

## 🔗 Dependency Map

```
┌─────────────────────────────────────┐
│  User Form Submission               │
│  (/src/app/order/page.tsx)          │
│                                     │
│  Collects:                          │
│  • Contact & Scheduling             │
│  • Test Motivation                  │
│  • Personal & Lifestyle             │
│  • Health Questionnaire (30 Qs)     │
└──────────────┬──────────────────────┘
               │
               │ saves formData
               │
               ↓
┌──────────────────────────────────────────┐
│  Firestore (Google Cloud Database)       │
│  users/{userId}/orders/{orderId}         │
│                                          │
│  Stores complete order including:        │
│  • sleepEnergy{}                         │
│  • cardiovascularHealth{}                │
│  • metabolicHealth{}                     │
│  • digestiveHealth{}                     │
│  • cancerImmuneHealth{}                  │
│  • neurologicalHealth{}                  │
└──────────────┬───────────────────────────┘
               │
               │ user navigates to
               │ /admin/report/[orderId]
               │
               ↓
┌──────────────────────────────────────────┐
│  Admin Report Page                       │
│  (/src/app/admin/report/[orderId]/...)   │
│                                          │
│  1. Fetch order from Firestore           │
│  2. Show loading screen with animations  │
│  3. Call POST /api/reports/generate      │
└──────────────┬───────────────────────────┘
               │
               │ sends {orderId, orderData, userName}
               │
               ↓
┌────────────────────────────────────────────────────────────┐
│  API Report Generation                                     │
│  (/src/app/api/reports/generate/route.ts)                 │
│                                                            │
│  1. Extract all form fields from orderData                │
│  2. Format health questionnaire responses                 │
│  3. Build comprehensive prompt with all data             │
│  4. Initialize Gemini AI client                          │
│  5. Call model.generateContent(prompt)                   │
│  6. Receive report from Gemini                           │
│  7. Parse into Report structure                          │
│  8. Save to Firestore                                    │
│  9. Return to client                                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ uses
                     ├──────→ generateReportPrompt()
                     │         ├── Extracts: age, gender, height, weight, etc.
                     │         ├── Formats: sleepEnergy[], cardiovascular[], etc.
                     │         ├── Creates: Detailed 10-section prompt
                     │         └── Instructs: Risk assessment, recommendations
                     │
                     ├──────→ model.generateContent()
                     │         └── Gemini 2.5 Flash API
                     │
                     └──────→ parseGeminiReport()
                              ├── extractRecommendations()
                              ├── extractConclusions()
                              └── Creates: Report object
                                   ├── id, sections[], recommendations[]
                                   ├── status: 'completed'
                                   └── fullContent
                     
                     ↓
┌──────────────────────────────────────────┐
│  Firestore Save                          │
│  users/{userId}/reports/{reportId}       │
│                                          │
│  Stores: Report document with:           │
│  • title, summary, sections[]            │
│  • recommendations[], conclusions        │
│  • status: 'completed'                   │
│  • timestamps                            │
└──────────────┬───────────────────────────┘
               │
               │ returns report to client
               │
               ↓
┌────────────────────────────────────────────┐
│  Display Report                            │
│  (/src/app/admin/report/[orderId]/page)    │
│                                            │
│  Shows:                                    │
│  • Executive Summary                       │
│  • Health Category Assessments             │
│  • Risk Levels (LOW/MOD/HIGH/URGENT)       │
│  • Key Recommendations                     │
│  • Conclusions & Wellness Plan             │
│  • Download & Copy Options                 │
└────────────────────────────────────────────┘
```

---

## 📤 API Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Client POST /api/reports/generate                           │
├─────────────────────────────────────────────────────────────┤
│ Body:                                                       │
│ {                                                           │
│   "orderId": "order-123",                                  │
│   "orderData": {                                           │
│     "age": "32",                                           │
│     "gender": "Male",                                      │
│     "height": "180",                                       │
│     "weight": "75",                                        │
│     "bloodGroup": "O+",                                    │
│     "ethnicity": "Asian",                                  │
│     "smoking": "Never",                                    │
│     "alcohol": "Occasionally",                             │
│     "exercise": "3-4 times/week",                         │
│     "sleepQuality": "Good",                               │
│     "stressLevel": "Moderate",                            │
│     "sleepEnergy": {                                       │
│       "sleep_hours": "Sometimes",                         │
│       "wake_gasping": "Never",                           │
│       "exhausted": "Occasionally",                        │
│       "sleep_changes": "Never",                          │
│       "night_sweats": "Never"                            │
│     },                                                    │
│     "cardiovascularHealth": {                             │
│       "chest_pain": "Never",                             │
│       "shortness_breath": "Occasionally",                │
│       "swelling": "Never",                               │
│       "irregular_heartbeat": "Occasionally",             │
│       "heart_history": "Never"                           │
│     },                                                    │
│     "metabolicHealth": {                                  │
│       "weight_change": "Sometimes",                       │
│       "thirst_urinate": "Often",                         │
│       "shaky_dizzy": "Never",                           │
│       "temp_tolerance": "Occasionally",                  │
│       "skin_hair_nails": "Never"                        │
│     },                                                    │
│     "digestiveHealth": { ... },                          │
│     "cancerImmuneHealth": { ... },                       │
│     "neurologicalHealth": { ... }                        │
│   },                                                     │
│   "userName": "John Doe",                                │
│   "userEmail": "john@example.com"                        │
│ }                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📥 API Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Server Response from /api/reports/generate                  │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "success": true,                                         │
│   "report": {                                              │
│     "reportId": "report-order-123-1699532800",            │
│     "orderId": "order-123",                               │
│     "userName": "John Doe",                               │
│     "generatedAt": "2025-11-09T10:30:00Z",               │
│     "status": "completed",                                │
│     "title": "Personalized Health Analysis Report",       │
│     "summary": "Based on your health assessment...",      │
│     "sections": [                                         │
│       {                                                   │
│         "title": "Executive Summary",                     │
│         "content": "Overall your health indicators..."    │
│       },                                                  │
│       {                                                   │
│         "title": "Sleep and Energy Assessment",          │
│         "content": "Risk Level: MODERATE - Your..."       │
│       },                                                  │
│       {                                                   │
│         "title": "Cardiovascular Health",                │
│         "content": "Risk Level: LOW - Your..."            │
│       },                                                  │
│       ...more sections...                                │
│     ],                                                    │
│     "recommendations": [                                  │
│       "Increase sleep duration to 7-8 hours nightly",    │
│       "Monitor blood pressure regularly",                │
│       "Increase physical activity to 5 days/week",       │
│       ...more recommendations...                         │
│     ],                                                    │
│     "conclusions": "Overall, your health profile...",    │
│     "fullContent": "[Raw Gemini output]"                 │
│   },                                                     │
│   "rawContent": "[Complete Gemini response]"             │
│ }                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Function Signatures

### API Route Handler
```typescript
export async function POST(request: NextRequest): Promise<NextResponse>
```

### Prompt Generation
```typescript
function generateReportPrompt(orderData: any, userName: string): string
```
**Input:** Complete order data with questionnaire answers
**Output:** 2000+ character Gemini prompt with comprehensive instructions

### Report Parsing
```typescript
function parseGeminiReport(
  content: string,
  orderId: string,
  userName: string,
  userEmail: string
): Report
```
**Input:** Raw Gemini text output
**Output:** Structured Report object

### Recommendation Extraction
```typescript
function extractRecommendations(content: string): string[]
```
**Input:** Full report text
**Output:** Array of 5-10 actionable recommendations

### Conclusion Extraction
```typescript
function extractConclusions(content: string): string
```
**Input:** Full report text
**Output:** Summary conclusion paragraph (≤500 chars)

---

## 🔄 Data Transformations

```
Form Data (Order)
    ↓ (Raw strings from questionnaire)
    ↓
generateReportPrompt()
    ↓ (Formatted with questions & answers)
    ↓
Gemini Prompt (2000+ chars)
    ↓ (Sent to AI)
    ↓
Gemini Response (2000-5000 chars)
    ↓ (Structured text with markdown)
    ↓
parseGeminiReport()
    ↓ (Split by sections)
    ↓
Structured Report Object
    ↓ (Sections[], recommendations[], conclusions)
    ↓
Database Storage
    ↓ (Firestore)
    ↓
Client Display
    ↓ (Formatted UI with cards, badges, etc.)
    ↓
User Reads Report
```

---

## ⚙️ Technologies & APIs

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Next.js 15 | Server-side API routes |
| **AI Model** | Gemini 2.5 Flash | Report generation via prompt |
| **Database** | Firestore | Persistent report storage |
| **Frontend** | React 18 | Display and interaction |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS v4 | UI design |
| **Animations** | Framer Motion | Loading screen effects |
| **Icons** | Lucide React | Visual elements |

---

## 🚨 Error Handling

```
Request Validation
    ↓ Missing orderId/orderData? → Error 400
    ↓
API Key Check
    ↓ GEMINI_API_KEY missing? → Error 500
    ↓
Gemini API Call
    ↓ API failure? → Error 500 with message
    ↓
Response Parsing
    ↓ Parsing fails? → Fallback to basic structure
    ↓
Database Save
    ↓ Firestore error? → Error logged
    ↓
Success Response
    ↓ Report returned to client
```

---

## 📊 Report Contents Summary

### Input Data Collected (30 items)
- **Profile:** age, gender, height, weight, blood group, ethnicity (6)
- **Lifestyle:** smoking, alcohol, exercise, medications, allergies, sleep, stress, diet (8)
- **Questionnaire:** 6 categories × 5 questions each (30)

### Output Report Includes (10 sections)
1. Executive Summary
2. Sleep and Energy Assessment (with Risk Level)
3. Cardiovascular Health (with Risk Level)
4. Metabolic Health (with Risk Level)
5. Digestive Health (with Risk Level)
6. Cancer Risk Assessment (with Risk Level)
7. Neurological/Musculoskeletal Health (with Risk Level)
8. Key Recommendations (5-10 items)
9. Urgent Concerns (if any)
10. Personalized Wellness Plan

### Risk Levels Assigned
- **LOW RISK:** No concerning patterns
- **MODERATE RISK:** Some warning signs
- **HIGH RISK:** Multiple concerning indicators
- **URGENT:** Requires prompt medical attention

---

## 🎯 Next Steps / Potential Improvements

- [ ] Add real-time progress tracking during generation
- [ ] Implement report sharing via email
- [ ] Add comparison between multiple reports
- [ ] Create downloadable PDF version
- [ ] Add detailed risk score calculation
- [ ] Implement follow-up questionnaire reminders
- [ ] Add AI-powered Q&A about the report
- [ ] Create health dashboard with historical trends

