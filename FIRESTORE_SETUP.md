# Firestore Setup Guide

## Common Issues

### 1. Permission Denied Error
You're getting a "Missing or insufficient permissions" error because Firestore security rules are blocking access by default.

### 2. AbortError
The `AbortError: The user aborted a request` can be caused by:
- **Ad blockers** blocking Firebase requests (common with uBlock Origin, AdBlock Plus, etc.)
- Network connectivity issues
- Browser extensions interfering with requests

**Solution**: Try disabling ad blockers for your localhost or add Firebase domains to your ad blocker's whitelist.

### 3. No Collection Created
**You don't need to create the collection manually!** Firestore automatically creates collections when you write the first document to them. If you don't see the `members` collection, it means:
- No members have been added yet, OR
- The writes are failing (check the error messages in the app)

## Solution: Configure Firestore Security Rules

### Steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `gymtracker-bfa72`

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

3. **Update the Rules**
   - Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to members collection
    match /members/{memberId} {
      allow read, write: if true;
    }
    // Allow read/write access to trainingTypes collection
    match /trainingTypes/{typeId} {
      allow read, write: if true;
    }
  }
}
```

4. **Publish the Rules**
   - Click "Publish" button

### ⚠️ Security Note

The rules above (`allow read, write: if true`) allow **anyone** to read and write to your database. This is fine for development/testing, but for production you should:

- Add authentication (Firebase Auth)
- Restrict access to authenticated users only
- Or use more specific rules based on your needs

### Production-Ready Rules (with Authentication)

If you add Firebase Authentication later, use these rules instead:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /members/{memberId} {
      allow read, write: if request.auth != null;
    }
    match /trainingTypes/{typeId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This requires users to be authenticated before accessing the database.

