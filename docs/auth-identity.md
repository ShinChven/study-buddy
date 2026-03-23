# Authentication & Identity Implementation Plan

This document details the security architecture for EduBuddy, covering user registration, login, JWT-based authentication, and role-based authorization.

---

## 1. Backend Security (ASP.NET Core Identity)

### Identity Configuration
*   **Framework**: Use **ASP.NET Core Identity** with Entity Framework Core to manage users and roles.
*   **Storage**: PostgreSQL tables for `Users`, `Roles`, and `UserRoles`.
*   **User Model**: Extend `IdentityUser` to include custom fields:
    *   `Preferences` (JSONB)
    *   `Role` (Enum: `Admin`, `Normal`)

### JWT (JSON Web Token) Implementation
*   **Token Generation**: After successful login, the server issues a JWT containing:
    *   `sub` (User ID)
    *   `email`
    *   `role` (Admin/Normal)
    *   `exp` (Expiration timestamp)
*   **Validation**: Middleware will validate the JWT on every request using a `SecretKey` stored in the backend environment variables.
*   **Refresh Tokens**: (Optional/Phase 2) Implement refresh tokens to maintain long-lived sessions securely.

### Authorization Policies
*   **StudyPolicy**: Allows both `Admin` and `Normal` roles to access conversation and study endpoints.
*   **AdminPolicy**: Restricts access to `/api/admin/*` endpoints strictly to the `Admin` role.

---

## 2. SignalR Authentication

Since SignalR uses WebSockets (which don't support custom headers in all browsers), authentication follows this flow:
1.  **Token Handshake**: The frontend passes the JWT via the `access_token` query string parameter when initiating the connection.
2.  **Hub Validation**: The `ChatHub` is decorated with `[Authorize]`. The backend middleware extracts the token from the query string and validates it before allowing the connection.

---

## 3. Frontend Implementation (React)

### Auth State Management
1.  **Storage**: Store the JWT in `localStorage` or an HTTP-only cookie (recommended for production).
2.  **Axios Interceptor**: Automatically attach the `Authorization: Bearer <token>` header to every API request.
3.  **Protected Routes**:
    *   Wrap study pages in a `ProtectedRoute` component that checks for a valid token.
    *   Wrap the admin console in an `AdminRoute` component that verifies the `role` claim in the JWT.

### Auth Flow
*   **Register**: `POST /api/auth/register` (Default role: `Normal`).
*   **Login**: `POST /api/auth/login` returns the JWT and basic user info.
*   **Logout**: Client-side deletion of the token and redirection to the login page.

---

## 4. Admin Management Console

Admins have a dedicated interface to:
*   **User Management**: View all users, reset passwords, or change roles.
*   **System Audit**: View global AI usage logs and system health.
*   **AI Configuration**: Securely update the Gemini API key (stored in `SystemSettings`).

---

## 5. Security Best Practices

*   **Password Hashing**: Identity uses `PBKDF2` by default.
*   **HTTPS Only**: All traffic, including SignalR, must be encrypted.
*   **CORS Policy**: Restrict API access strictly to the EduBuddy frontend domain.
*   **Data Isolation**: Ensure SQL queries are scoped to the `UserId` of the authenticated user to prevent data leakage between students.
