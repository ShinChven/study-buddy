# User Profile & Account Management

This document outlines the implementation plan for the "Account Settings" feature, allowing users to personalize their identity and manage security credentials.

---

## 1. User Model Enhancements

To support personalization, the `Users` table (extending `IdentityUser`) includes:
*   **DisplayName**: A human-readable name (defaults to Username if not set).
*   **AvatarUrl**: A string field storing the URL to the user's profile picture.
*   **Preferences**: A JSONB field storing UI-specific settings (accent color, theme).

---

## 2. API Endpoints

### Get Current Profile
*   **Endpoint**: `GET /api/users/me`
*   **Auth**: Required (JWT)
*   **Response**: Returns `DisplayName`, `Email`, `AvatarUrl`, and `Preferences`.

### Update Profile
*   **Endpoint**: `PATCH /api/users/profile`
*   **Payload**: `{ "displayName": "string", "avatarUrl": "string" }`
*   **Logic**: Updates the specific fields in the database. 

### Change Password
*   **Endpoint**: `POST /api/users/change-password`
*   **Payload**: `{ "currentPassword": "string", "newPassword": "string" }`
*   **Security**: Uses the ASP.NET Core `UserManager.ChangePasswordAsync` method, which validates the `currentPassword` before applying the `newPassword`.

---

## 3. Frontend Implementation (React)

### The Account Page
A new page (`/account` or `/profile`) will be added featuring:
1.  **Identity Section**: Form to edit the Display Name.
2.  **Avatar Section**: 
    *   Preview of the current avatar.
    *   Input to provide an image URL.
    *   **Future Phase**: Integration with a file upload service (S3/Azure Blob) or a simple Gravatar integration.
3.  **Security Section**: A secure form for password updates with validation (length, complexity, and password matching).

### State Management
*   The `AuthProvider` or a dedicated `UserProvider` will hold the current user's profile data.
*   Upon a successful profile update, the frontend state is updated immediately without requiring a page refresh.

---

## 4. Avatar Strategy: Gravatar Integration

To provide a high-quality experience without complex file storage in Phase 1:
*   If `AvatarUrl` is null, the frontend will automatically generate a **Gravatar** URL based on the user's hashed email address.
*   **Format**: `https://www.gravatar.com/avatar/[email_hash]?d=identicon`

---

## 5. Security & Validation

*   **Display Name**: Limited to 50 characters, sanitized to prevent XSS.
*   **Passwords**: Must meet the standard identity requirements (e.g., at least 8 characters, one uppercase, one number).
*   **Rate Limiting**: Password change attempts are strictly rate-limited to prevent brute-force attacks on the "Current Password" field.
