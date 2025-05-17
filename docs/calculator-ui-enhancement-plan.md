# Plan for UI Enhancement: Displaying Calculated Results

**Objective:** Modify `src/components/DataEntryForm.tsx` to show the calculated result of an arithmetic expression in the `income` and `worth` fields after the user types an expression and the field loses focus (on blur). The user should also be able to see and edit the original expression if they re-focus the input field.

## Proposed Changes to `src/components/DataEntryForm.tsx`

1.  **Introduce New State Variables for Display:**
    *   Add two new state variables to hold the values that are actually *displayed* in the input fields. The existing `income` and `worth` states will continue to hold the raw, potentially unevaluated expressions.
        ```typescript
        const [displayIncome, setDisplayIncome] = useState<string>('');
        const [displayWorth, setDisplayWorth] = useState<string>('');
        ```

2.  **Update `onChange` Handlers:**
    *   When the user types into an input field, the `onChange` handler should:
        *   Update the raw expression state (e.g., `setIncome(e.target.value)`).
        *   Simultaneously update the display state with the same typed value (e.g., `setDisplayIncome(e.target.value)`). This ensures the input field reflects what the user is typing in real-time.

3.  **Modify `onBlur` Handlers (e.g., within the existing `handleBlur` function):**
    *   When an input field loses focus:
        *   Retrieve the raw expression from the `income` or `worth` state.
        *   Evaluate the raw expression using `evaluateMathExpression()`.
        *   If the evaluation is successful and returns a number:
            *   Format this number to a string (e.g., `result.toString()`. If specific precision like two decimal places is always desired, `result.toFixed(2)` could be used, assuming `mathjs` doesn't already provide a suitable string representation).
            *   Update the corresponding *display* state (e.g., `setDisplayIncome(formattedResult)`).
        *   If the evaluation fails (returns `null`) or the input was empty:
            *   The display state should remain as the raw input (which was set during `onChange`). The error notification for invalid expressions will still be shown.

4.  **Add `onFocus` Handlers:**
    *   When an input field gains focus:
        *   Set the *display* state back to the raw expression currently stored in the `income` or `worth` state. This allows the user to see and edit the original expression they entered.
        *   Example for the income input field:
            ```tsx
            onFocus={() => setDisplayIncome(income)}
            ```
        *   Example for the worth input field:
            ```tsx
            onFocus={() => setDisplayWorth(worth)}
            ```

5.  **Update Input Field `value` Prop:**
    *   The `value` prop of the `income` input field should be bound to `displayIncome`.
    *   The `value` prop of the `worth` input field should be bound to `displayWorth`.

6.  **Resetting Fields After Submission:**
    *   In the `handleSubmit` function, after a successful submission, clear all four relevant states: `income`, `worth`, `displayIncome`, and `displayWorth`.
        ```typescript
        setIncome('');
        setDisplayIncome('');
        setWorth('');
        setDisplayWorth('');
        ```

## Visual Flow Example (Income Field)

*   **User types "100+50" into Income field:**
    *   `income` state becomes `"100+50"`.
    *   `displayIncome` state becomes `"100+50"`. (Input field shows "100+50")
*   **User tabs out of the field (blur event):**
    *   `evaluateMathExpression("100+50")` returns `150`.
    *   `setDisplayIncome("150")`. (Input field now shows "150")
*   **User clicks back into the Income field (focus event):**
    *   `setDisplayIncome(income)` (current `income` state is "100+50").
    *   (Input field shows "100+50" again, allowing the user to edit the original expression)

This approach ensures that the underlying raw expression is always preserved for re-evaluation and editing, while the user sees either their direct input or the calculated result in a user-friendly manner.