# Authentication Endpoints Testing Guide

## Test Flow Overview

This guide walks you through testing all 6 authentication endpoints with a new account.

### Prerequisites
- Backend API running on `http://localhost:5174`
- VS Code REST Client extension installed
- All endpoints available in `backend/InvoiceHub/API/API.http`

---

## Testing Sequence

### **Step 1: Register New Account**
**Endpoint:** `POST /api/auth/register`

1. Open `API.http` file in VS Code
2. Click **"Send Request"** link above request #1 (Register)
3. A new account will be created with a unique email: `testuser_{{timestamp}}@invoicehub.test`

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "uuid",
      "email": "testuser_xxx@invoicehub.test",
      "firstName": "Test",
      "lastName": "User"
    }
  }
}
```

⚠️ **Copy the `accessToken`** - you'll need it later

---

### **Step 2: Login with New Account**
**Endpoint:** `POST /api/auth/login`

1. Click **"Send Request"** on request #2 (Login)
2. Uses the same email and password from registration

**Expected Response:** Same as registration - returns new tokens

**Note:** You can update the `@authToken` variable at the top with the new token

---

### **Step 3: Verify Email**
**Endpoint:** `GET /api/auth/verify-email?token=...`

**⚠️ Important:** In production, the token comes from the verification email. For testing:

**Option A - Manual Testing:**
1. Check your email inbox for verification email
2. Extract the token from the email link
3. Replace the `token` parameter in request #3

**Option B - Mock Testing:**
1. Click **"Send Request"** on request #3 with the placeholder token
2. The backend will return an error (expected)
3. This confirms the endpoint is reachable

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": true
}
```

---

### **Step 4: Resend Verification Email**
**Endpoint:** `POST /api/auth/resend-verification`

1. Click **"Send Request"** on request #4
2. Sends verification email to `{{Email}}`

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": true
}
```

**Next Action:** Check email for new verification link

---

### **Step 5: Forgot Password**
**Endpoint:** `POST /api/auth/forgot-password`

1. Click **"Send Request"** on request #5
2. Initiates password reset process

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": true
}
```

**Next Action:** Check email for password reset link with token

---

### **Step 6: Reset Password**
**Endpoint:** `POST /api/auth/reset-password`

**⚠️ Important:** This requires the token from the forgot-password email

1. Check email for password reset link
2. Extract the token from the link/email
3. Update the `Token` field in request #6 with the actual token
4. Optionally change `NewPassword` to your preference
5. Click **"Send Request"**

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": true
}
```

**Note:** After this, login with new password in next step

---

### **Step 7: Change Password**
**Endpoint:** `POST /api/auth/change-password`

**⚠️ Requires Authentication:** You must be logged in (Bearer token required)

1. From Step 1 or 2, copy the `accessToken`
2. Update the `Authorization: Bearer {{authToken}}` header with your token
3. Update `CurrentPassword` with current password (from Step 1: `TestPassword123!`)
4. Click **"Send Request"** on request #7

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": true
}
```

**Note:** This endpoint requires being authenticated

---

### **Step 8: Google Authentication**
**Endpoint:** `POST /api/auth/google`

**⚠️ Important:** Requires actual Google ID token

**For Testing:**

**Option A - Real Google Token:**
1. Use Google's OAuth flow to get an ID token
2. Replace the placeholder token in request #8
3. Click **"Send Request"**

**Option B - Mock Testing:**
1. Click **"Send Request"** with the placeholder token
2. Backend will likely reject (expected - token is invalid)
3. This confirms endpoint is reachable and validates input format

**Expected Response (with valid Google token):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "firstName": "First",
      "lastName": "Last"
    }
  }
}
```

---

## Quick Testing Checklist

- [ ] **Register** - New account created
- [ ] **Login** - Can authenticate with credentials
- [ ] **Verify Email** - Endpoint responds (requires token)
- [ ] **Resend Verification** - Email is sent
- [ ] **Forgot Password** - Email is sent
- [ ] **Reset Password** - Password updated (requires token)
- [ ] **Change Password** - Requires authentication, password updated
- [ ] **Google Auth** - Endpoint accessible (requires valid Google token)

---

## Common Issues & Solutions

### ❌ "Invalid Email Format"
- Ensure email is valid: `username@domain.com`

### ❌ "Passwords Don't Match"
- Verify `Password` and `ConfirmPassword` are identical

### ❌ "Token Expired"
- Tokens have expiration times, regenerate if needed

### ❌ "Unauthorized" on Change Password
- Ensure Bearer token is set in Authorization header
- Token must be from a successful login

### ❌ "User Not Found"
- Use the exact email from registration step
- Check variable substitution: `@Email = testuser_{{$timestamp}}@invoicehub.test`

### ❌ "Email Not Verified"
- Some endpoints may require verified email
- Complete Step 3 (Verify Email) first

---

## REST Client Variable Reference

Used in `API.http`:
- `@API_HostAddress` - Backend URL
- `@Email` - Test user email with timestamp
- `@Password` - Initial password
- `@authToken` - JWT token from login (update manually or auto-capture)

---

## Email-Based Token Extraction

For endpoints requiring email tokens (verify-email, reset-password):

1. **From Email Client:**
   - Open inbox
   - Find email from "noreply@invoicehub.local"
   - Extract token from link or email body

2. **From Email Log File** (if available):
   - Check `backend/InvoiceHub/API/logs/` for email records
   - Search for token patterns

3. **From Database** (if you have access):
   - Check token tables in database
   - Look for unexpired tokens for the test email

---

## Next Steps

After completing all tests:
1. Verify all endpoints return expected status codes
2. Check database for created user records
3. Verify email notifications were sent
4. Review API logs for any errors
5. Test error scenarios (invalid tokens, wrong passwords, etc.)

