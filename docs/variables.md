# Variables System (Org‑scoped)

The Variables system allows users to create reusable key-value pairs that can be inserted into prompts and scenarios using `{{key}}` syntax. Variables are scoped to the active workspace (organization) and are automatically resolved to their actual values during simulation, enabling consistent and maintainable prompt management.

## Architecture (Updated)

- Routes: `src/app/api/variables/*` are thin controllers.
- Service: `src/server/services/variablesService.ts` handles create/update/delete/list and usage checks.
- Repository: `src/server/repos/variablesRepository.ts` provides Prisma access and usage discovery.
- Validation via Zod in `src/server/validation/schemas.ts`.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [UI Components](#ui-components)
- [Variable Syntax](#variable-syntax)
- [Autocomplete System](#autocomplete-system)
- [Validation Rules](#validation-rules)
- [Variable Resolution](#variable-resolution)
- [User Workflows](#user-workflows)

---

## 🎯 Overview

### Purpose

- **Reusability**: Define common content once, use in multiple prompts and scenarios
- **Consistency**: Ensure same values across all prompts and AI interactions
- **Maintainability**: Update variables in one place, changes apply everywhere automatically
- **Efficiency**: Faster prompt creation with smart autocomplete and real-time validation
- **Production Integration**: Variables are resolved to actual values before OpenAI API calls

### Example Usage

```
Variable: company_name = "Anthropic"
Variable: role = "helpful AI assistant"

Prompt: "Hello! I'm a {{role}} created by {{company_name}}. How can I help you today?"

During Testing:
1. User enters prompt with {{variables}}
2. System resolves: "Hello! I'm a helpful AI assistant created by Anthropic. How can I help you today?"
3. Resolved prompt sent to OpenAI API for real conversation simulation
```

---

## 🗄️ Database Schema (excerpt)

### Variable Model

```prisma
model Variable {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  orgId       String   @map("org_id")
  key         String
  value       String   @db.Text
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization? @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([orgId, key], name: "idx_org_variable_unique")
  @@index([orgId, updatedAt], map: "idx_variable_org_updated")
  @@map("variable")
}
```

### Key Features

- **Workspace Isolation**: Variables belong to the active org via `orgId` foreign key
- **Unique Keys**: Combination of `orgId + key` must be unique
- **Text Storage**: Values use `@db.Text` for large content
- **Optional Description**: Help users remember variable purpose
- **Cascade Delete**: Variables deleted when user is deleted

---

## 🔌 API Endpoints (Org‑scoped + RBAC)

### GET /api/variables

**Purpose**: Fetch active org variables
**Response**: Array of variables in active org
**Features**:

- Active org scoping via middleware/context
- Ordered by updated date

### POST /api/variables

**Purpose**: Create new variable (Admin/Editor)
**Body**:

```typescript
{
  key: string;        // Required, alphanumeric + underscore only
  value: string;      // Required
  description?: string; // Optional
}
```

**Validation**:

- Key format: `/^[a-zA-Z0-9_]+$/`
- Key uniqueness per org
- Required fields validation

### PUT /api/variables/[id]

**Purpose**: Update existing variable (Admin/Editor)
**Body**: Same as POST
**Features**:

- Org scoping and membership verification
- Key uniqueness validation (excluding self)

### DELETE /api/variables/[id]

**Purpose**: Delete variable with usage protection (Admin/Editor)
**Features**:

- **Org scoping verification**: Ensures only org members with write access can delete
- **Usage detection**: Checks if variable is used in prompts or scenarios before deletion
- **Protected deletion**: Returns error with usage details if variable is in use
- **Safe deletion**: Only deletes if variable is not referenced anywhere

**Response on usage conflict (400)**:

```json
{
  "error": "Cannot delete variable because it is being used",
  "message": "This variable is currently being used and cannot be deleted. Remove it from all prompts and scenarios first.",
  "usage": {
    "prompts": [{ "id": "uuid", "name": "My Prompt" }],
    "scenarios": [{ "id": "uuid", "name": "Test Scenario" }]
  }
}
```

---

## 🧩 UI Components

### Variables Page (`/variables`)

**File**: `src/app/variables/page.tsx`
**Features**:

- List view with search filtering
- CRUD operations (Create, Read, Update, Delete)
- Empty state with call-to-action
- Real-time search across key, value, and description

### Variable Form

**Files**:

- `src/app/variables/new/page.tsx` (Create)
- `src/app/variables/[id]/edit/page.tsx` (Edit)

**Features**:

- Key validation with format requirements
- Large textarea for values
- Optional description field
- Proper error handling

### PromptTextarea Component

**File**: `src/components/ui/PromptTextarea.tsx`
**Features**:

- Variable highlighting (green = valid, red = invalid)
- Autocomplete dropdown on `{{` trigger
- Keyboard navigation (↑↓ arrows, Enter, Escape)
- Cursor-based positioning

### VariableAutocomplete Component

**File**: `src/components/VariableAutocomplete.tsx`
**Features**:

- Filtered variable list based on query
- Keyboard navigation support
- Variable details display (key, value preview, description)
- Modern design matching app aesthetic

### VariableUsageModal Component

**File**: `src/components/VariableUsageModal.tsx`
**Features**:

- **Usage error display**: Professional modal showing why variable can't be deleted
- **Detailed breakdown**: Lists all prompts and scenarios using the variable
- **Direct navigation**: One-click buttons to edit each usage location
- **Clear guidance**: Instructions on how to resolve the usage conflict
- **Professional design**: Follows design system with proper error styling

### Modal System Integration

The variables page integrates with the native modal system:

- **ConfirmationModal**: Used for delete confirmations with danger warnings
- **AlertModal**: Used for error messages with semantic styling
- **VariableUsageModal**: Specialized modal for usage dependency errors
- **State Management**: Uses `useConfirmModal()` and `useAlertModal()` hooks
- **Accessibility**: Full ARIA compliance and keyboard navigation support

See **[Modal System Documentation](./modal-system.md)** for complete details.

---

## 📝 Variable Syntax

### Basic Syntax

```
{{variable_key}}
```

### Key Requirements

- Alphanumeric characters and underscores only
- No spaces or special characters
- Case-sensitive matching

### Examples

```
Valid:
{{company_name}}
{{user_id}}
{{api_endpoint_v2}}

Invalid:
{{company-name}}    // Hyphens not allowed
{{user id}}         // Spaces not allowed
{{api.endpoint}}    // Dots not allowed
```

---

## 🎯 Autocomplete System

### Trigger Mechanism

1. User types `{{` in any prompt textarea
2. Autocomplete dropdown appears immediately
3. As user continues typing, list filters by query
4. Select with mouse click or Enter key

### Features

- **Real-time filtering**: Searches variable keys as you type
- **Keyboard navigation**: ↑↓ arrows to navigate, Enter to select, Escape to close
- **Smart positioning**: Appears to the right of textarea to avoid text overlap
- **Visual feedback**: Shows variable key, value preview, and description
- **Click outside to close**: Dropdown closes when clicking elsewhere

### Implementation

**Hook**: `useVariables()` and `useVariableAutocomplete(query)`
**Positioning**: Fixed position at right edge of textarea
**Filtering**: Case-insensitive search on variable keys

---

## ✅ Validation Rules

### Variable Creation/Update

1. **Key Format**: Must match `/^[a-zA-Z0-9_]+$/`
2. **Key Uniqueness**: No duplicate keys per user
3. **Required Fields**: Key and value are mandatory
4. **Description**: Optional, helpful for documentation

### Prompt Validation

1. **Variable Existence**: All `{{key}}` references must exist in user's variables
2. **Save Prevention**: Cannot save prompts with invalid variables
3. **Error Messages**: Clear feedback about which variables are invalid
4. **Visual Indicators**: Red highlighting for invalid variables in editor

### Example Error

```
"Invalid variables found: {{company}}, {{invalid_var}}. Please create these variables first or remove them."
```

---

## 🔄 Variable Resolution

### Production Integration

The Variable Resolution system automatically converts `{{key}}` placeholders to actual values before sending content to OpenAI APIs during prompt testing.

### Resolution Process

```typescript
// Input prompt with variables
const promptWithVariables =
  'You are a {{role}} working for {{company}}. Be {{tone}} in your responses.';

// User's variables from database
const userVariables = [
  { key: 'role', value: 'customer service representative' },
  { key: 'company', value: 'Anthropic' },
  { key: 'tone', value: 'friendly and professional' },
];

// Resolved prompt sent to OpenAI
const resolvedPrompt =
  'You are a customer service representative working for Anthropic. Be friendly and professional in your responses.';
```

### Implementation Details

**File**: `src/app/api/simulate/route.ts`

- **Function**: `resolveVariables(text: string, userId: string): Promise<string>`
- **Database Query**: Fetches user's variables with `userId` isolation
- **Pattern Matching**: Uses regex `/\\{\\{${key}\\}\\}/g` for global replacement
- **Error Handling**: Returns original text if variable resolution fails
- **Security**: User-scoped variable access prevents data leakage

### Resolution Points

1. **System Prompts**: Both current and edited prompts are resolved before API calls
2. **Scenario Messages**: User messages in scenarios also undergo variable resolution
3. **Real-time Processing**: Resolution happens immediately before OpenAI API calls
4. **Streaming Integration**: Works seamlessly with Server-Sent Events streaming

### Error Handling

- **Missing Variables**: Gracefully handles undefined variables by leaving placeholder
- **Database Failures**: Falls back to original text if variable fetch fails
- **Invalid Syntax**: Malformed `{{}}` patterns are left unchanged
- **User Isolation**: Only resolves variables belonging to the current user

---

## 👤 User Workflows

### Creating First Variable

1. Visit Variables page from navigation
2. See empty state with "Create your first variable" button
3. Fill out form with key, value, and optional description
4. Variable becomes available immediately in all prompt editors

### Using Variables in Prompts

1. Open any prompt editor (Create/Edit prompt, Testing page)
2. Type `{{` to trigger autocomplete
3. Browse available variables or continue typing to filter
4. Select variable with mouse or keyboard
5. Variable appears highlighted in green (valid) or red (invalid)

### Managing Variables

1. **View All**: Variables page shows searchable list
2. **Search**: Real-time filtering across all fields
3. **Edit**: Click edit button to modify key, value, or description
4. **Protected Delete**: Smart deletion with usage protection
   - If variable is not used: Deletes immediately after confirmation
   - If variable is in use: Shows professional modal with:
     - Clear error message explaining why deletion failed
     - Complete list of prompts and scenarios using the variable
     - Direct "Edit" buttons to navigate to each usage location
     - Helpful guidance on how to resolve the conflict

### Prompt Testing with Variables

1. **Editor Support**: Variables work in "Edited Prompt" field with autocomplete and validation
2. **Read-only Display**: "Current Prompt" shows variables as-is (resolved during actual simulation)
3. **Live Validation**: Invalid variables prevent simulation from running
4. **Visual Diff**: Shows variable changes between prompt versions in real-time
5. **Automatic Resolution**: During simulation, all `{{variables}}` are resolved to actual values before OpenAI API calls
6. **Real-time Testing**: Watch resolved prompts generate real AI conversations with variable-substituted content

---

## 🔗 Integration Points

### Form Validation

**File**: `src/components/PromptForm.tsx`

- Validates all variables before saving
- Shows specific error messages for invalid variables
- Prevents form submission until all variables are valid

### Testing Interface

**File**: `src/app/testing/page.tsx`

- Variable support in edited prompt with autocomplete and validation
- Real-time diff showing variable changes
- Validation prevents simulation with invalid variables
- Automatic variable resolution during OpenAI API calls

### Onboarding

**File**: `src/components/PromptForm.tsx`

- Helper message appears when user has no variables
- Direct link to Variables page for first-time users
- Educates about `{{}}` syntax and benefits

---

## 🛠️ Technical Implementation

### Data Flow

1. **Frontend**: React components with hooks for real-time data
2. **API**: RESTful endpoints with user isolation
3. **Database**: Prisma models with foreign key relationships
4. **Validation**: Client-side and server-side validation layers
5. **Resolution**: Server-side variable substitution during simulation API calls

### Performance Considerations

- Variables loaded once per session via React hooks
- Autocomplete filtering happens client-side for responsiveness
- Database queries optimized with proper indexing
- User isolation ensures scalable data access
- Variable resolution happens asynchronously during simulation without blocking

### Security Features

- User isolation at database and API level
- Input validation and sanitization
- No variable sharing between users
- **Protected deletion**: Prevents data loss by checking usage before deletion
- **Safe navigation**: Modal provides secure direct links to edit usage locations
- Cascade deletion maintains data integrity (only when safe)
- Variable resolution scoped to authenticated user's variables only

### Production Integration

- **Real OpenAI API Calls**: Variables resolved before sending to OpenAI
- **Streaming Compatible**: Works with Server-Sent Events real-time simulation
- **Error Recovery**: Graceful fallback when variable resolution fails
- **User Scoped**: Each user's variables remain completely isolated
