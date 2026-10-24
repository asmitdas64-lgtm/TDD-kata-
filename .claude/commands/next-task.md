# Next Task Workflow

Follow this procedure sequentially when initiating the next development task:

1. **Inspect Backlog:**
   - Open and review `docs/TASKS.md`.
   - Identify the first unchecked (`- [ ]`) task in sequential order.
   - Confirm all dependencies from prior tasks are satisfied.

2. **Consult Architectural Guidance:**
   - Read `docs/ARCHITECTURE.md` and `docs/DECISIONS.md` to ensure design alignment.
   - For route or model changes, verify against `docs/API_SPEC.md` and `docs/DATA_MODEL.md`.

3. **Execute Red Phase (Failing Test):**
   - Write unit or integration tests specifying the new behavior in the appropriate test directory.
   - Run the test suite: `npm test`.
   - Verify that the test fails exclusively due to the missing feature, not syntax or runtime configuration errors.
   - Stage and commit with message: `test(<scope>): <description>` concluding with the co-author trailer.

4. **Execute Green Phase (Minimal Implementation):**
   - Implement the minimal production code necessary to turn the test green.
   - Avoid premature optimization or out-of-scope features.
   - Run the test suite: `npm test` and verify all tests pass.
   - Stage and commit with message: `feat(<scope>): <description>` (or `fix(<scope>): ...`) with the co-author trailer.

5. **Execute Refactor Phase (Clean Up):**
   - Review code for adherence to `docs/CODING_STANDARDS.md`.
   - Eliminate duplication, improve naming, ensure proper separation of concerns.
   - Run full test suite and typechecks: `npm test && npm run typecheck`.
   - Stage and commit with message: `refactor(<scope>): <description>` with the co-author trailer.

6. **Update Tracking:**
   - Mark the completed item as `[x]` in `docs/TASKS.md`.
   - If any new architectural decisions were made, record a new ADR in `docs/DECISIONS.md`.
