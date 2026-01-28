---
description: How to bump the application version and build number
---

This workflow ensures that the application version and build number are updated consistently across all required files to prevent "Update Available" mismatch errors.

1.  **Read Current Version**: Check the current version in `package.json`.
    ```bash
    cat package.json
    ```

2.  **Determine New Version**:
    *   If it's a code change without a feature release, increment the **Build Number** only.
    *   If it's a new release, increment the **Version** (e.g., 1.2.7 -> 1.2.8) AND the **Build Number**.

3.  **Update Files**: You must update **ALL THREE** of these files.

    *   **`package.json`**: Update `"version"`.
    *   **`app.json`**: Update `"version"` AND `"extra.buildNumber"`.
    *   **`constants/BuildInfo.ts`**: Update `version` and `buildNumber` constants.

4.  **Verification Command**:
    Run this command to verify all files match:
    ```bash
    grep -E '"version"|buildNumber' package.json app.json constants/BuildInfo.ts
    ```

5.  **Commit**:
    ```bash
    git add package.json app.json constants/BuildInfo.ts
    git commit -m "Bump version to <VERSION> (Build <BUILD_NUMBER>)"
    ```

6.  **IMPORTANT: Deployment Approval Required**:
    Before running `npx netlify-cli deploy --prod --dir=dist`, you MUST:
    - Inform the user that the build is ready to deploy
    - Wait for the user to say "proceed" or give explicit approval
    - Do NOT auto-deploy without user confirmation
