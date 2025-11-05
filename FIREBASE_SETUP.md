# Firebase Setup Instructions

## 🔥 Why Firebase Instead of Supabase?

Firebase offers:
- ✅ **Generous Free Tier** - 1GB storage, 10GB bandwidth/month, 50K reads/day
- ✅ **No Credit Card Required** - Get started immediately
- ✅ **Google Infrastructure** - Highly reliable and fast
- ✅ **Easy Authentication** - Email/password, Google, phone number
- ✅ **Firestore Database** - NoSQL, real-time, offline support
- ✅ **Cloud Storage** - For crop images

---

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project" or "Create a project"
3. Enter project name: **talazo-app**
4. **Google Analytics**: You can disable it for now (optional)
5. Click "Create project" and wait ~30 seconds

---

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** `</>` (next to iOS and Android icons)
2. Register app:
   - **App nickname:** Talazo Web App
   - ✅ Check "Also set up Firebase Hosting" (optional, but recommended)
3. Click "Register app"
4. You'll see your Firebase config - **KEEP THIS PAGE OPEN**

---

## Step 3: Copy Firebase Configuration

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "talazo-app.firebaseapp.com",
  projectId: "talazo-app",
  storageBucket: "talazo-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Copy these 6 values** and update your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=talazo-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=talazo-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=talazo-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Step 4: Enable Authentication

1. In Firebase console, click **Authentication** in left sidebar
2. Click **Get started**
3. Click **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle **Enable**
   - Click **Save**

---

## Step 5: Create Firestore Database

1. Click **Firestore Database** in left sidebar
2. Click **Create database**
3. Choose **Start in production mode** (we'll add rules next)
4. Select location closest to Zimbabwe:
   - Recommended: **europe-west1** (Belgium) or **asia-south1** (Mumbai)
5. Click **Enable** and wait ~1 minute

---

## Step 6: Set Up Firestore Security Rules

1. In Firestore Database, click **Rules** tab
2. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Fields collection - users can only access their own fields
    match /fields/{fieldId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Analyses collection - users can only access their own analyses
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **Publish**

---

## Step 7: Enable Cloud Storage

1. Click **Storage** in left sidebar
2. Click **Get started**
3. Use default security rules (we'll update them)
4. Select same location as Firestore
5. Click **Done**

---

## Step 8: Set Storage Security Rules

1. In Storage, click **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

---

## Step 9: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

Check the terminal - you should see "Environments: .env.local" confirming variables are loaded.

---

## ✅ Verify Setup

1. Open your app: http://localhost:3000
2. Go to **Sign Up** page
3. Create a test account
4. Check Firebase console:
   - Go to **Authentication** → should see 1 user
   - Go to **Firestore Database** → should see `users` collection with 1 document

---

## 🎯 What You Get with Firebase

### Free Tier Limits:
| Feature | Limit |
|---------|-------|
| Firestore Reads | 50,000/day |
| Firestore Writes | 20,000/day |
| Storage | 1 GB |
| Bandwidth | 10 GB/month |
| Users | Unlimited |

**Perfect for MVP and beta testing!**

### Features Enabled:
- ✅ Email/password authentication
- ✅ Cloud Firestore NoSQL database
- ✅ Cloud Storage for images
- ✅ Real-time sync across devices
- ✅ Offline support
- ✅ Secure by default (security rules)

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Double-check API key in `.env.local`
- Make sure there are no extra spaces
- Restart dev server

### "Missing or insufficient permissions"
- Check Firestore Security Rules are published
- Make sure user is signed in
- Verify `userId` matches in documents

### Can't see data in Firestore
- Go to **Firestore Database** → **Data** tab
- Collections are created automatically on first write
- Try creating a field in the app first

### Authentication errors
- Verify Email/Password is enabled
- Check browser console for detailed error messages
- Make sure Firebase config is correct

---

## 📊 Monitoring Your Usage

1. Go to **Usage and billing** in Firebase console
2. Monitor:
   - Firestore reads/writes
   - Storage usage
   - Authentication requests
3. Set up budget alerts (optional)

---

## Next Steps

Once Firebase is configured, I'll help you:
1. ✅ Update login/signup pages to use Firebase Auth
2. ✅ Migrate localStorage data to Firestore
3. ✅ Add real-time sync for fields and analyses
4. ✅ Upload crop images to Cloud Storage
5. ✅ Add offline support

**Firebase is production-ready and scales automatically as you grow!**

Let me know when you have your Firebase keys ready! 🚀
