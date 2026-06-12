# Build Decisions

## DECISIONS.md: React Habit Tracker Build Summary

This document synthesizes the key decisions, disagreements, and resolutions made during the development of a React habit tracker.

### What Was Built

A complete and runnable React habit tracker application, built with Vite and styled using Tailwind CSS (via CDN). It features:
*   **Habit Management:** Add, delete, and mark habits as complete for the current day.
*   **Daily Streaks:** Tracks both current and longest streaks, derived and persisted accurately.
*   **Habit Categories:** Organize habits into user-defined categories, with filtering capabilities. Users can add new categories, and deleting a category will reassign its habits to "Uncategorized." Duplicate category names are prevented.
*   **Persistence:** All habit and category data is stored in the browser's `localStorage`.
*   **UI/UX:** Modals for adding habits and confirming category deletions (with `Escape` key and backdrop dismissal), a dedicated category filter, and visual feedback for streaks (flame icon with intensity scaling).

### Key Technical Decisions Made

1.  **Data Model:**
    *   **Habits:** Each habit object includes `id`, `name`, `categoryId` (can be `null`), `createdAt`, `completedDates` (an array of `YYYY-MM-DD` local-time strings), and `longestStreak` (integer).
    *   **Categories:** Each category object includes `id` and `name`.
    *   **Persistence:** Both habits and categories are stored as JSON strings in `localStorage`.

2.  **State Management:**
    *   A custom React hook (`useHabits`) manages global application state.
    *   State is **lazy-initialized** by reading and parsing `localStorage` directly within the `useState` initializer function (wrapped in `try/catch` for robustness), preventing data clobbering on initial render.
    *   A single `useEffect` is responsible for syncing state changes (habits and categories) back to `localStorage`.

3.  **Streak Logic:**
    *   **`currentStreak`** is dynamically derived at render time by iterating backward through the `completedDates` array.
    *   **`longestStreak`** is persisted as an integer and updated only when a new `currentStreak` exceeds its current value.
    *   **Date Handling:** All date comparisons and manipulations use `new Date().toLocaleDateString('en-CA')` for consistent `YYYY-MM-DD` local-time strings. `getToday` is a shared utility. Crucially, date decrement within the streak calculation explicitly constructs local `Date` objects (`new Date(year, monthIndex, day)`) to avoid UTC timezone drift bugs.
    *   **Streak Reset:** Streaks reset at local midnight.
    *   **Current Day Streak:** The `currentStreak` calculation accounts for the current day; if today's habit is not yet marked complete but yesterday was, the streak still shows as active until local midnight passes.

4.  **Category Management:**
    *   **Deletion Strategy:** Deleting a category **orphans** its associated habits (sets `categoryId: null`), moving them to an "Uncategorized" view. A confirmation modal is used, and `categoryToDelete` is cleared upon dismissal.
    *   **Filtering:** `CategoryFilter` supports `'all'` (show all habits), `null` (show only uncategorized habits), and specific category `id`s for filtering.
    *   **Category Creation:** An inline input in the `CategoryFilter` component allows users to add new categories. Duplicate category names (case-insensitive, trimmed) are prevented, and the input field is only cleared on successful addition.

5.  **UI/UX:**
    *   Modals (Add Habit, Delete Category) support both backdrop clicks and `Escape` key presses for dismissal, and their form state resets consistently on close.
    *   Habit cards now truncate long habit names to prevent layout overflow.
    *   The flame icon's associated number dynamically changes color based on streak intensity, providing visual feedback.

6.  **Dependencies:**
    *   No external date libraries (e.g., `date-fns`) are used; all date operations rely on native JavaScript `Date` methods.
    *   Styling is managed with Tailwind CSS, integrated via a CDN for quick setup.

### Disagreements and Resolutions

1.  **Initial Incomplete Delivery:** Grok's initial submissions were incomplete, missing crucial components and core logic files. **Resolution:** Gemini intervened, requiring complete delivery of all imported components and the `useHabits.jsx` file.
2.  **`localStorage` Clobber Bug:** Grok's initial `useEffect` pattern risked overwriting existing `localStorage` data with empty arrays. **Resolution:** Gemini directed a switch to **lazy `useState` initialization** directly from `localStorage`, which Grok implemented.
3.  **Date Timezone Drift Bug:** A critical bug in `calculateCurrentStreak` where `new Date('YYYY-MM-DD')` parsed as UTC, causing incorrect streak calculations for some timezones. **Resolution:** Gemini provided explicit direction for constructing local `Date` objects using `new Date(year, monthIndex, day)` during date decrement, which Grok implemented.
4.  **`currentStreak` UX (Today Not Checked):** The initial streak calculation was too strict, resetting prematurely if today's habit wasn't yet checked. **Resolution:** Gemini directed modifying `calculateCurrentStreak` to consider a streak active throughout the current day if yesterday was completed, which Grok implemented.
5.  **`CategoryFilter` `null` Overload:** The `selectedCategory` state overloaded `null` to mean both "show all" and "show uncategorized." **Resolution:** Gemini directed using a distinct sentinel (`'all'`) for "show all," reserving `null` for "uncategorized," which Grok implemented.
6.  **Missing "Add Category" UI:** The application lacked any mechanism for users to create new categories, making the feature inert. **Resolution:** Gemini identified this as a critical blocker, and Grok implemented an inline "Add Category" input within `CategoryFilter.jsx`.
7.  **Duplicate Category Names:** Users could create multiple categories with identical names, leading to confusion. **Resolution:** Gemini deemed this a "must-fix" data integrity issue. Grok implemented a case-insensitive check in `addCategory` and refined the `CategoryFilter` to only clear the input on successful addition.
8.  **Redundant Date Logic:** `getToday`'s logic was duplicated across files. **Resolution:** Claude recommended exporting `getToday` from `useHabits.jsx` and reusing it, which Grok implemented.
9.  **Modal UX (Backdrop/Escape Dismissal, Form Reset):** Modals initially lacked standard dismissal methods and form state persistence on cancel. **Resolution:** Claude flagged these as important polish. Grok implemented `onClick={close}` on backdrops, `useEffect` listeners for `Escape` key, and reset form state on `AddHabitModal`'s `close` handler.
10. **Habit Name Overflow:** Long habit names could break `HabitCard` layout. **Resolution:** Grok implemented `truncate` and `min-w-0` Tailwind classes on `HabitCard` to contain long names.
11. **Flame Icon Intensity:** The visual scaling of flame intensity was initially applied only to the streak *number*, not the emoji itself. **Resolution:** Grok adjusted the styling so the flame emoji itself also receives the dynamic color class.
12. **Stale `categoryToDelete`:** After dismissing the delete modal without deleting, `categoryToDelete` lingered in context. **Resolution:** Grok updated the `close` handler in `DeleteCategoryModal` to explicitly set `categoryToDelete(null)`.

### Unresolved Concerns

None. All identified critical issues, correctness bugs, and actionable polish items have been addressed and implemented.