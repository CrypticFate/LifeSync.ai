# Report Generation Files - Complete Overview

## 📋 Summary
This document outlines all files responsible for generating health reports based on user questionnaire data and personal health information.

---

## 🔑 Core Report Generation Files

### 1. **API Route: Report Generation Handler**
**File:** `/src/app/api/reports/generate/route.ts` (435 lines)

**Purpose:** Main server endpoint that orchestrates the entire report generation process

**Key Responsibilities:**
- Receives order data with all questionnaire answers from the client
- Initializes Google Gemini AI (gemini-2.5-flash model)
- Generates a comprehensive prompt with all user health data
- Calls Gemini API to generate the report
- Parses the AI response into structured sections
- Returns formatted report to client

**Key Functions:**
```typescript
export async function POST(request: NextRequest)
```
- Main handler for report generation requests
- Extracts: orderId, orderData, userName, userEmail

```typescript
function generateReportPrompt(orderData: any, userName: string): string
```
- Creates detailed prompt for Gemini AI
- Includes all 6 health questionnaire categories:
  - Sleep and Energy (5 questions)
  - Cardiovascular and Circulatory Health (5 questions)
  - Metabolic and Endocrine Health (5 questions)
  - Digestive and Abdominal Health (5 questions)
  - Cancer and Immune System Indicators (5 questions)
  - Neurological and Musculoskeletal Health (5 questions)
- Formats questionnaire responses with questions and answers
- Includes personal health profile (age, gender, height, weight, blood group, etc.)
- Includes lifestyle data (smoking, alcohol, exercise, medications, etc.)
- Specifies detailed analysis instructions for Gemini

**Prompt Instructions Include:**
1. Assess lifestyle based on 7 health categories
2. Identify healthy/unhealthy aspects with concrete evidence
3. Estimate risk levels for each major health area (LOW/MODERATE/HIGH/URGENT)
4. Provide personalized actionable advice
5. Highlight urgent warning signs requiring medical consultation
6. Organize with clear sections, bullet points, and concise explanations
7. Ensure thorough, nuanced, evidence-based analysis

```typescript
function parseGeminiReport(content: string, orderId: string, userName: string, userEmail: string)
```
- Parses Gemini's response into structured report object
- Extracts sections from markdown headers
- Generates summary from first paragraphs
- Extracts recommendations from bullet points
- Extracts conclusions from conclusion sections
- Creates Report object with all metadata

**Helper Functions:**
```typescript
function extractRecommendations(content: string): string[]
```
- Extracts actionable recommendations from report content

```typescript
function extractConclusions(content: string): string
```
- Extracts conclusion paragraph from report

---

### 2. **Report Type Definitions**
**File:** `/src/types/report.ts`

**Purpose:** TypeScript interfaces defining report structure

**Key Interfaces:**

```typescript
interface Report {
  reportId: string;              // Unique report identifier
  orderId: string;               // Associated order ID
  userId: string;                // User who generated report
  userName: string;              // User's name
  userEmail: string;             // User's email
  generatedAt: string;           // ISO timestamp
  updatedAt: string;             // ISO timestamp
  status: 'generating' | 'completed' | 'failed';
  title: string;                 // Report title
  summary: string;               // Brief overview
  sections: ReportSection[];     // Detailed sections
  recommendations: string[];     // Health recommendations
  conclusions: string;           // Final conclusions
  fullContent: string;           // Raw report content
  error?: string;                // Error message if failed
}

interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSubsection[];
}

interface ReportGenerationInput {
  orderId: string;
  orderData: any;               // Complete order form data with questionnaire
  userName: string;
  userEmail: string;
}
```

---

### 3. **Report Display Page**
**File:** `/src/app/admin/report/[orderId]/page.tsx` (598 lines)

**Purpose:** Admin dashboard page that displays generated reports

**Key Features:**
- Shows loading screen while report is generating (animated brain icon, pulsing indicators)
- Displays completed report with:
  - Executive summary
  - Detailed sections
  - Key recommendations
  - Conclusions
  - Download functionality
  - Copy to clipboard functionality
- Handles failed reports with retry option
- Shows order information alongside report

**Report Generation Flow in This Page:**
1. Fetches order data from Firestore
2. Creates placeholder report with "generating" status
3. Calls `/api/reports/generate` endpoint with order data
4. Displays loading screen with animations
5. Updates report status to "completed" when received
6. Displays full report with all sections and recommendations

---

### 4. **Order Form with Health Questionnaire**
**File:** `/src/app/order/page.tsx` (1022 lines)

**Purpose:** Multi-segment form where users answer health questionnaire

**Form Structure:**
- **Segment 1:** Contact & Scheduling
- **Segment 2:** Test Motivation
- **Segment 3:** Personal & Lifestyle Data
- **Segment 4:** Health Questionnaire (NEW - with 6 categories, 30 questions)

**Health Questionnaire Data Structure:**
```typescript
interface FormData {
  sleepEnergy: Record<string, string>;
  cardiovascularHealth: Record<string, string>;
  metabolicHealth: Record<string, string>;
  digestiveHealth: Record<string, string>;
  cancerImmuneHealth: Record<string, string>;
  neurologicalHealth: Record<string, string>;
  // ... other form fields
}
```

**Answer Options for Each Question:**
- Always
- Often
- Sometimes
- Occasionally
- Never

---

### 5. **Firestore Integration**
**File:** `/src/lib/firestore.ts`

**Key Functions for Report Generation:**
```typescript
saveReportToFirestore(userId: string, report: Report): Promise<string>
```
- Saves generated report to Firestore user's reports collection

```typescript
getReportByOrderId(userId: string, orderId: string): Promise<Report | null>
```
- Retrieves saved report from Firestore

```typescript
updateReportStatus(userId: string, reportId: string, status: string, error?: string): Promise<void>
```
- Updates report status (generating → completed/failed)

---

### 6. **Logger Utility**
**File:** `/src/lib/logger.ts`

**Purpose:** Custom logging for report generation process

**Functions:**
```typescript
logReport(message: any, ...args: any[]): void
logReportError(message: any, ...args: any[]): void
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER FILLS FORM (order/page.tsx)                             │
│    - Segment 1: Contact & Scheduling                            │
│    - Segment 2: Test Motivation                                 │
│    - Segment 3: Personal & Lifestyle                            │
│    - Segment 4: Health Questionnaire (30 questions)             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. FORM SUBMISSION                                              │
│    - Saves all form data to Firestore                           │
│    - Creates Order document with all fields                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. ADMIN CLICKS "VIEW REPORT"                                   │
│    - Navigates to /admin/report/[orderId]                       │
│    - Fetches order from Firestore                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. REPORT PAGE CALLS GENERATION API                             │
│    - POST to /api/reports/generate                              │
│    - Sends: orderId, orderData, userName, userEmail             │
│    - Shows loading screen with animations                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. API GENERATES PROMPT (route.ts)                              │
│    - Extracts all questionnaire data                            │
│    - Formats health questions and answers                       │
│    - Creates comprehensive prompt for Gemini                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. GEMINI AI ANALYSIS                                           │
│    - Receives comprehensive prompt                              │
│    - Analyzes all 6 health categories                           │
│    - Generates detailed risk assessments                        │
│    - Creates personalized recommendations                       │
│    - Identifies red flags                                       │
│    - Returns structured report                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. API PARSES REPORT (parseGeminiReport)                        │
│    - Extracts sections from markdown                            │
│    - Creates structured report object                           │
│    - Extracts recommendations                                   │
│    - Saves to Firestore                                         │
│    - Returns to client                                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. DISPLAY REPORT (report page)                                 │
│    - Loading screen disappears                                  │
│    - Shows full report with:                                    │
│      • Executive Summary                                        │
│      • Health Category Assessments                              │
│      • Risk Levels                                              │
│      • Key Recommendations                                      │
│      • Conclusions & Wellness Plan                              │
│    - Allows download/copy                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Included in Report Generation

### Personal Health Profile
- Name, Age, Gender
- Height, Weight, Blood Group
- Ethnicity
- Test Motivation

### Lifestyle Data
- Smoking Status
- Alcohol Consumption
- Exercise Frequency
- Current Medications
- Allergies
- Sleep Quality
- Stress Level
- Dietary Preferences

### Health Questionnaire (30 Questions)
**Sleep and Energy (5 questions):**
- Sleep duration consistency
- Waking gasping/choking
- Post-sleep exhaustion
- Recent sleep changes
- Night sweats/temperature issues

**Cardiovascular Health (5 questions):**
- Chest pain/pressure during exertion
- Shortness of breath
- Swelling in extremities
- Irregular/rapid heartbeat
- Heart disease history

**Metabolic Health (5 questions):**
- Unexplained weight changes
- Thirst/urination frequency
- Shaky/dizzy/fatigued feelings
- Temperature tolerance changes
- Skin/hair/nail changes

**Digestive Health (5 questions):**
- Indigestion/heartburn
- Blood in stool/abdominal pain
- Diarrhea/constipation/bloating
- Appetite loss/early fullness
- Nausea/vomiting

**Cancer/Immune Indicators (5 questions):**
- Lumps/swellings
- Fever/chills/night sweats
- Easy bruising/bleeding
- Non-healing sores/skin changes
- Persistent cough/hoarseness

**Neurological/Musculoskeletal (5 questions):**
- Headaches/vision changes/dizziness
- Numbness/tingling/weakness
- Tremors/muscle movements
- Balance/coordination loss
- Persistent joint/bone/muscle pain

---

## 🎯 Report Output Structure

Generated reports include:

1. **Executive Summary** - Overall health synthesis (2-3 paragraphs)
2. **Sleep and Energy Assessment** - With risk level (LOW/MODERATE/HIGH/URGENT)
3. **Cardiovascular Health** - Heart, blood pressure, exercise capacity
4. **Metabolic Health** - Weight, blood sugar, thyroid indicators
5. **Digestive Health** - GI system status, concerns
6. **Cancer Risk Assessment** - Immune markers, warning signs
7. **Neurological/Musculoskeletal** - Nervous system, brain, muscles/joints
8. **Key Recommendations** - Prioritized action items
9. **Urgent Concerns** - Red flags requiring medical attention
10. **Personalized Wellness Plan** - 3-6 month goals with specific, measurable targets

---

## 🔐 Security & Storage

- Reports stored in Firestore under user's collection
- User ID ensures privacy and authorization
- Timestamp tracking for audit purposes
- Error logging for debugging

---

## 🚀 Technologies Used

- **AI Model:** Google Gemini 2.5 Flash
- **Backend:** Next.js 15 API Routes
- **Database:** Firestore
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion (loading screen)

---

## 📝 Environment Variables Required

```
GEMINI_API_KEY=your_api_key_here
```

Must be set in `.env.local` for Next.js to load it.

---

## ✅ Validation & Error Handling

- **Client-side:** Form validation ensures all questionnaire sections answered
- **Server-side:** Required fields check before API call
- **API:** Error handling for missing data, API failures
- **Graceful degradation:** Fallback structures if parsing fails
- **User feedback:** Toast notifications for success/errors

---

## 📄 File Summary Table

| File | Lines | Purpose |
|------|-------|---------|
| `/src/app/api/reports/generate/route.ts` | 435 | API endpoint - generates reports via Gemini AI |
| `/src/types/report.ts` | 45 | TypeScript interfaces for report structure |
| `/src/app/admin/report/[orderId]/page.tsx` | 598 | Display generated reports in admin dashboard |
| `/src/app/order/page.tsx` | 1022 | Order form with health questionnaire (Segment 4) |
| `/src/lib/firestore.ts` | 1200+ | Firestore integration for saving/retrieving reports |
| `/src/lib/logger.ts` | 30 | Custom logging utility |

---

## 🔍 Key Takeaways

✅ **All questionnaire answers are captured** - 30 questions across 6 health categories
✅ **Comprehensive prompt sent to Gemini** - Includes personal + lifestyle + questionnaire data
✅ **Detailed analysis instructions** - Risk levels, evidence-based recommendations, red flags
✅ **Structured report parsing** - Organized into clear sections
✅ **Full data persistence** - Reports saved to Firestore
✅ **Beautiful UI** - Loading animations, organized display
✅ **User-friendly output** - Professional yet accessible format
