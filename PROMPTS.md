# Prompts Log

## Prompt 1
> Act as a senior software engineer and test-driven development (TDD) expert. I am building an End-to-End Frequent Flyer Portal for a training assignment.
> 
> First, analyze the requirements and propose a simple, beginner-friendly technology stack and project structure. The portal should help staff manage frequent flyer records digitally instead of using paper and Excel.
> 
> Requirements:
> 
> - Provide a clear interface to view, add, edit, search, and delete frequent flyer records.
> - Show a useful empty state when no records are available.
> - Include loading indicators for asynchronous operations.
> - Validate forms and highlight invalid fields in red.
> - Sanitize text inputs against XSS before storing them in application state.
> - Meet accessibility requirements: keyboard navigation, semantic HTML, and appropriate ARIA labels.
> - Log this exact telemetry message when a primary action completes: [Analytics] User interacted with End-to-End Frequent Flyer Portal
> - Use a consistent monochromatic corporate design with 16px and 32px spacing.
> - Aim for Lighthouse scores above 90 and 100% accessibility.
> 
> Important workflow:
> 
> 1. Do not implement the application yet.
> 2. Recommend the simplest suitable stack and explain why.
> 3. Propose a project structure.
> 4. Identify acceptance criteria and edge cases.
> 5. Plan automated tests first using a suitable testing framework.
> 6. Wait for my approval before creating or changing project files.
> 
> Keep the explanation beginner-friendly and do not invent a backend or API that has not been configured.

## Prompt 2
> I approve Vanilla JavaScript with Vite and Vitest. React is not required for this project.
> 
> I approve the proposed frequent flyer fields: memberNumber, firstName, lastName, email, tierStatus, and pointsBalance.
> 
> Before implementation, please follow strict TDD:
> 
> 1. Initialize the project configuration and testing framework only.
> 2. Create the initial unit tests before writing application implementation code.
> 3. Cover input sanitization, form validation, telemetry logging, and storage service behavior.
> 4. Run the tests and show which tests fail because the implementation is not yet present.
> 5. Do not write the application implementation until I review the test files and approve the next step.
> 6. Keep the mandatory PROMPTS.md file updated with the exact prompts used in this project.
> 
> Keep the implementation beginner-friendly. Use accessible semantic HTML, keyboard navigation, consistent monochromatic styling, and no external backend or API unless explicitly approved. Explain any commands before running them.

## Prompt 3
> Before starting TDD Phase 2, review the four unit test files created in Phase 1: sanitization.test.js, validation.test.js, telemetry.test.js, and storageService.test.js.
> 
> Do not modify or implement any application code yet.
> 
> 1. Confirm that the tests accurately reflect our approved requirements.
> 2. Check for missing or incorrect assertions, especially XSS sanitization, duplicate member numbers, invalid points, telemetry only after successful actions, and localStorage persistence.
> 3. Explain the single passing test and the main reasons the other tests fail.
> 4. Report the exact test file paths and current project file structure.
> 5. Keep PROMPTS.md updated with this prompt.
> 
> Wait for my approval before making implementation changes.

## Prompt 4
> I approve proceeding to TDD Phase 2 (GREEN Phase).
> 
> Implement only the minimal production code needed to make the existing unit tests pass. Work in small steps:
> 
> 1. Implement `src/utils/sanitization.js` using DOMPurify safely for plain-text inputs and record objects. Ensure sanitized text is treated as text, not executable HTML.
> 2. Implement `src/utils/validation.js` for required fields, email format, allowed tiers, non-negative integer points, duplicate member numbers, and editing the same record.
> 3. Implement `src/services/telemetryService.js` so successful primary actions log the exact required message, with no extra text.
> 4. Implement `src/services/frequentFlyerService.js` with asynchronous localStorage persistence and CRUD/search operations.
> 
> Important constraints:
> 
> * Do not change existing tests merely to make them pass.
> * Do not build the UI yet.
> * Do not add a backend or external API.
> * Preserve the existing project structure and update `PROMPTS.md` with this exact prompt.
> * Run `npm test` after implementation and report the actual results, including any remaining failures.
> * If any test expectation conflicts with the approved requirements, explain it and ask before changing the test.
> * Explain the key code changes in beginner-friendly language.

## Prompt 5
> I approve proceeding to Phase 3, but continue strict test-driven development.
> 
> Phase 3A — Integration Tests First:
> 
> 1. Inspect the existing production code and current test configuration.
> 2. Create integration tests in `tests/integration/flyerPortal.test.js` and `tests/integration/accessibility.test.js` BEFORE implementing the UI.
> 3. Cover initial loading, empty state, add/edit/delete flows, search results and no-match state, invalid form fields with `aria-invalid="true"`, loading feedback during async actions, keyboard navigation, accessible labels, and telemetry only after successful primary actions.
> 4. Mock or control asynchronous delays deterministically so tests are reliable.
> 5. Run `npm test` and report the actual RED-phase results. Do not modify existing passing unit tests to force failures.
> 
> Phase 3B — After reporting the RED results, STOP and wait for my approval before implementing the UI.
> 
> Important:
> 
> * Keep the existing Vanilla JavaScript + Vite + Vitest stack.
> * Do not add React, a backend, or an external API.
> * Preserve all passing unit tests.
> * Update PROMPTS.md with this exact prompt.
> * Explain the test files and failures in beginner-friendly language.
> * Do not claim any test passed or failed without actual test-run output.

## Prompt 6
> I approve Phase 3B: Accessible UI Implementation (GREEN Phase).
> 
> Implement the UI needed to satisfy the existing integration tests while preserving all passing unit tests.
> 
> Requirements:
> 
> 1. Build a semantic, responsive interface for the End-to-End Frequent Flyer Portal using Vanilla JavaScript, HTML, and CSS.
> 2. Implement the header, main heading, accessible records table, and a helpful empty state with an Add Member action.
> 3. Implement an accessible Add/Edit form with explicit labels, validation messages, aria-invalid, aria-describedby, and visible red invalid-field styling.
> 4. Implement create, edit, delete with confirmation, real-time search, and a friendly no-matching-records state.
> 5. Show an accessible loading indicator with role="status" and aria-live="polite" during asynchronous operations.
> 6. Ensure keyboard navigation, Escape-to-close behavior where applicable, and focus restoration after closing the dialog.
> 7. Use the existing frequent flyer service, validation, sanitization, and telemetry modules. Do not duplicate their logic.
> 8. Log the exact required telemetry message only after successful primary actions.
> 9. Use a consistent monochromatic corporate design with 16px and 32px spacing tokens, responsive layouts, and visible focus indicators.
> 10. Update PROMPTS.md with this exact prompt.
> 
> Constraints:
> 
> * Do not modify existing tests merely to make them pass.
> * Do not add a backend, external API, or React.
> * Do not claim accessibility is 100% or Lighthouse scores exceed 90 without running the relevant audits.
> * Explain the important code changes in beginner-friendly language.
> * Run npm test and report the actual results. If any tests fail, investigate and fix the implementation rather than weakening the tests.
> * After the tests pass, stop and wait for my review before adding features or deploying.

## Prompt 7
> Continue the End-to-End Frequent Flyer Portal project from the current state. Follow the approved Vanilla JavaScript + Vite + Vitest stack and strict TDD.
> 
> PHASE 2 — GREEN:
> 1. Inspect the actual existing files and package.json before changing anything.
> 2. Review the current tests and identify the exact test command.
> 3. Implement only the minimal production code needed for the existing unit tests to pass: XSS-safe text sanitization, flyer validation, exact telemetry logging, and localStorage-backed CRUD/search service.
> 4. Do not weaken, delete, or rewrite tests merely to make them pass.
> 5. Run the unit tests and report the actual results. Fix implementation defects if tests fail.
> 6. Keep PROMPTS.md updated with the exact prompts and meaningful workflow steps.
> 
> Then STOP and report:
> - Files created or modified
> - Commands executed and their results
> - Number of tests passed and failed
> - Any remaining issues
> 
> Do not build the UI, add unapproved dependencies, or deploy yet. Wait for my review before proceeding to the next phase. Explain commands and important code changes in beginner-friendly language.

## Prompt 8
> Proceed to Phase 3: Build the complete, accessible UI for the End-to-End Frequent Flyer Portal using the existing Vanilla JavaScript + Vite + Vitest project.
> 
> Before coding, inspect the existing source files, services, validation functions, sanitization functions, and tests. Reuse the existing implementation and do not duplicate business logic.
> 
> Implement these features:
> 1. A professional monochromatic corporate dashboard with consistent 16px and 32px spacing.
> 2. A responsive header and a clear title: "Frequent Flyer Portal".
> 3. A dashboard summary showing total members and tier distribution if it can be calculated reliably from the existing records.
> 4. A semantic, accessible table listing member number, name, email, tier status, points balance, and actions.
> 5. An empty state with a "Create First Member" button when there are no records.
> 6. An accessible add/edit form with all approved fields, explicit labels, validation messages, red invalid-field borders, and aria-invalid attributes.
> 7. Edit and delete actions, including a deletion confirmation.
> 8. Case-insensitive search by member name, member number, or email; show a separate "No matching records found" state when appropriate.
> 9. Visible loading feedback during asynchronous operations, using role="status" and aria-live="polite".
> 10. Sanitize user-entered text before storing it in application state or localStorage. Render user data safely without injecting raw HTML.
> 11. Log the exact required telemetry message after each successful primary action: [Analytics] User interacted with End-to-End Frequent Flyer Portal. Do not log it when validation fails or an operation fails.
> 12. Full keyboard navigation, visible focus indicators, semantic HTML, accessible button names, and appropriate ARIA attributes.
> 13. Responsive layout for desktop and mobile.
> 
> TDD and quality requirements:
> - Add or update integration tests before implementing each corresponding UI behavior.
> - Run existing unit tests after implementation changes.
> - Do not weaken or delete existing tests to make them pass.
> - Keep PROMPTS.md updated with the exact prompts used.
> - Do not add a backend, external API, or unnecessary dependencies.
> - Avoid unused imports, console errors, and unnecessary code.
> - Keep the code beginner-friendly and explain the important files.
> 
> When finished, run the available test suites and report the actual results, files changed, and any remaining issues. Do not deploy yet; wait for my review.

## Prompt 9
> We are moving to Phase 4: QA and production readiness. Do not deploy yet.
> 
> First, inspect package.json and confirm the available scripts. Then tell me the exact command to start the Vite development server locally. Do not run destructive commands or change application files. Explain how I can open the local URL in my browser and manually verify the add, edit, delete, search, invalid form, empty state, and localStorage persistence flows.
> 
> Also confirm how to run the lint and production build checks. Do not claim Lighthouse or accessibility audit scores until they have actually been measured. Keep PROMPTS.md updated with the exact prompt used.

## Prompt 10
> Continue QA for the End-to-End Frequent Flyer Portal. Do not deploy yet and do not modify application files unless a failure requires a fix.
> 
> 1. Run `npm test` and report the actual test results.
> 2. Run `npm run build` and report whether the production build succeeds.
> 3. Check whether ESLint is configured. If it is not configured, report that clearly instead of claiming lint passed.
> 4. Inspect the implementation against the assignment requirements: accessible labels and keyboard navigation, visible loading states, XSS sanitization before storage, exact telemetry logging after successful actions, and responsive layout.
> 5. Fix any confirmed issues only after explaining what failed, then rerun the relevant tests and build.
> 6. Update `PROMPTS.md` with the exact prompt used and the actual results. Do not invent test results or Lighthouse scores.
> 7. Report the remaining steps needed before deployment.

### Actual QA & Production Readiness Results:
- **Test Results (`npm test`)**: 6 test files passed, 42 tests passed, 0 failed (Duration: 6.44s).
  - `tests/unit/sanitization.test.js`: 6 passed
  - `tests/integration/accessibility.test.js`: 4 passed
  - `tests/integration/flyerPortal.test.js`: 8 passed
  - `tests/unit/validation.test.js`: 15 passed
  - `tests/unit/storageService.test.js`: 6 passed
  - `tests/unit/telemetry.test.js`: 3 passed
- **Production Build (`npm run build`)**: Vite v6.4.4 build succeeded in 625ms. Generated `dist/index.html` (0.57 kB), `dist/assets/index-*.css` (6.58 kB), `dist/assets/index-*.js` (47.53 kB).
- **ESLint Status**: Confirmed that ESLint is currently not configured in `package.json` or project root.
- **Requirement Verification**: All requirements verified (accessible labels, keyboard navigation, loading indicators, XSS defense, exact telemetry string, monochromatic 16px/32px corporate styling).
