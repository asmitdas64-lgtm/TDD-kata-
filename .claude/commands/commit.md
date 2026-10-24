# Commit Workflow

Follow this procedure when creating any git commit across the TDD lifecycle:

1. **Verify Commit Category:**
   - Red Phase: `test(<scope>): <concise description of failing test>`
   - Green Phase: `feat(<scope>): <concise description of implementation>` or `fix(...)`
   - Refactor Phase: `refactor(<scope>): <description of structural cleanup>`
   - Build / Config: `chore(<scope>): <tooling or config update>`

2. **Verify Tests & Hygiene:**
   - Ensure the working tree is clean except for the files intended for this atomic commit.
   - For `feat:` and `refactor:` commits, ensure `npm test` and `npm run typecheck` pass 100%.

3. **Format Commit Message:**
   Ensure the commit message body includes a blank line followed by the mandatory trailer:
   ```
   <type>(<scope>): <summary>

   Co-authored-by: Claude <noreply@anthropic.com>
   ```

4. **Execute Commit:**
   - Stage relevant files: `git add <files>`
   - Commit:
     ```bash
     git commit -m "$(cat << 'EOF'
     <type>(<scope>): <summary>

     Co-authored-by: Claude <noreply@anthropic.com>
     EOF
     )"
     ```
