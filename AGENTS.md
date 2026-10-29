# Guidelines

- Ensure code quality, clean architecture, and keep the application in a working state.
- Developer= Mr. Hafez Rahim  +201007419344
- Keep admin utility navigation in a shared browser-safe module so the sidebar and global search stay aligned; sign-out only exits the frontend preview until authentication is connected.


- Server and root error screens auto-retry transient failures (server restarts, stale page files) before showing a manual retry; keep that behavior when editing error handling, because preview wake-ups otherwise surface as a stuck error page.
