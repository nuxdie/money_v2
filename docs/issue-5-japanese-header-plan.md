# Refined Plan: GitHub Issue #5 - Japanese Header Update

**Project:** money_v2
**Branch:** `feature/issue-5-japanese-header`
**Issue:** #5: Feature: Update Header Title with Japanese Katakana and Phonetic Spelling
**File to Modify:** [`../src/App.tsx`](../src/App.tsx)

## 1. Current Header Structure (around line 207 in `src/App.tsx`):
The current header is a single `<h1>` element within a flex container that also holds the logo:
```jsx
// src/App.tsx
// ...
<div className="flex items-center mb-4 sm:mb-0"> {/* Parent Flex Container */}
  <img src="/broccori.png" alt="Broccori Logo" className="h-8 w-8 mr-2" />
  <h1 className="text-2xl font-bold text-gray-800">Financial Broccori</h1> {/* This line will be replaced */}
</div>
// ...
```

## 2. Refined Plan for Header Update:

**Goal:** Replace the existing `<h1>Financial Broccori</h1>` with a two-line header structure:
    1.  Primary Title (Katakana, `<h1>`): ファイナンシャル ブロッコリー
    2.  Secondary Title (Phonetic Spelling, `<span>`): [Fah-ee-nah-n-shah-ru Bu-ro-kko-ree]

**Proposed JSX Structure:**
The existing `<h1>` element will be replaced by a `div` container. Inside this `div`, an `<h1>` will be used for the Katakana title and a `<span>` for the phonetic spelling.

```jsx
// New structure to replace the existing h1 element
<div>
  <h1 className="block text-3xl font-bold text-gray-900">
    ファイナンシャル ブロッコリー
  </h1>
  <span className="block text-sm text-gray-500 mt-1">
    [Fah-ee-nah-n-shah-ru Bu-ro-kko-ree]
  </span>
</div>
```

**Full context after change:**
```jsx
// src/App.tsx
// ...
<div className="flex items-center mb-4 sm:mb-0"> {/* Parent Flex Container */}
  <img src="/broccori.png" alt="Broccori Logo" className="h-8 w-8 mr-2" />
  {/* Start of new header structure */}
  <div>
    <h1 className="block text-3xl font-bold text-gray-900">
      ファイナンシャル ブロッコリー
    </h1>
    <span className="block text-sm text-gray-500 mt-1">
      [Fah-ee-nah-n-shah-ru Bu-ro-kko-ree]
    </span>
  </div>
  {/* End of new header structure */}
</div>
// ...
```

**Tailwind CSS Classes to be Applied:**
*   **Katakana Title (`<h1>`):** `block text-3xl font-bold text-gray-900`
    *   `block`: Ensures it takes the full width available.
    *   `text-3xl`: Sets a larger font size.
    *   `font-bold`: Makes the text bold.
    *   `text-gray-900`: Sets a dark gray color.
*   **Phonetic Spelling (`<span>`):** `block text-sm text-gray-500 mt-1`
    *   `block`: Ensures it takes the full width available, appearing on a new line.
    *   `text-sm`: Sets a smaller font size.
    *   `text-gray-500`: Sets a lighter gray color.
    *   `mt-1`: Adds a small margin to the top for spacing.

## 3. Step-by-Step Implementation Guide (for Code mode):
1.  **Open File:** [`../src/App.tsx`](../src/App.tsx).
2.  **Locate Line:** Find the line containing the current header (approximately line 207):
    ```jsx
    <h1 className="text-2xl font-bold text-gray-800">Financial Broccori</h1>
    ```
3.  **Replace:** Replace this single `<h1>` line with the following JSX structure:
    ```jsx
    <div>
      <h1 className="block text-3xl font-bold text-gray-900">
        ファイナンシャル ブロッコリー
      </h1>
      <span className="block text-sm text-gray-500 mt-1">
        [Fah-ee-nah-n-shah-ru Bu-ro-kko-ree]
      </span>
    </div>
    ```
4.  **Verify:** Ensure the surrounding `div` with class `flex items-center mb-4 sm:mb-0` remains unchanged and correctly wraps the logo and the new title structure.
5.  **Test:** Check responsiveness and visual appearance in the browser.

## 4. Visual Plan (Mermaid Diagram):

```mermaid
graph TD
    A["Parent Div (flex items-center mb-4 sm:mb-0)"] -- Contains --> B["Logo (img)"];
    A -- Contains --> C_Old["Old: h1 ('Financial Broccori')"];

    A_New["Parent Div (flex items-center mb-4 sm:mb-0)"] -- Contains --> B_New["Logo (img)"];
    A_New -- Contains --> D_New["New: Container Div for Title"];
    D_New -- Contains --> E_New["h1 ('ファイナンシャル ブロッコリー')"];
    D_New -- Contains --> F_New["span ('[Fah-ee-nah-n-shah-ru Bu-ro-kko-ree]')"];

    subgraph "Before Change"
        C_Old
    end

    subgraph "After Change"
        D_New
    end

    style C_Old fill:#ffcccb,stroke:#333,stroke-width:2px
    style D_New fill:#ccffcc,stroke:#333,stroke-width:2px