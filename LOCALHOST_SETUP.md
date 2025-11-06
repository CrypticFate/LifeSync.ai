# Localhost Configuration Guide

## What Changed
The server has been configured to run on **`localhost`** instead of `0.0.0.0`.

### Before:
```typescript
const hostname = '0.0.0.0';  // Listens on all network interfaces (0.0.0.0:3000)
```

### After:
```typescript
const hostname = 'localhost';  // Listens only on localhost (127.0.0.1:3000)
```

---

## Access URLs

### Development Server
- **Primary URL**: `http://localhost:3000`
- **Alternative URL**: `http://127.0.0.1:3000`

### Application Routes
- **Sign In**: `http://localhost:3000/signin`
- **Sign Up**: `http://localhost:3000/signup`
- **Order**: `http://localhost:3000/order`
- **Health Check**: `http://localhost:3000/api/health`

### WebSocket Connection
- **Socket.IO Server**: `ws://localhost:3000/api/socketio`

---

## Firebase Console Configuration

Since you're now running on localhost, you need to add these domains to Firebase Console:

### Authorized Domains to Add:
1. `localhost:3000`
2. `127.0.0.1:3000`
3. `localhost` (without port, if needed)

### Steps to Add Domains:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (LifeSync.ai)
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Enter each domain from the list above
6. Save

---

## Running the Project

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

---

## Benefits of localhost vs 0.0.0.0

| Aspect | 0.0.0.0 | localhost |
|--------|---------|-----------|
| **Network Access** | All interfaces (external access possible) | Only local machine |
| **Security** | Less secure (exposed to network) | More secure (local only) |
| **Use Case** | Server/production | Development/testing |
| **External Access** | Can access from other machines | Cannot access from other machines |

---

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Cannot Connect
- Ensure you're using `localhost:3000` or `127.0.0.1:3000` (not `0.0.0.0:3000`)
- Check if the development server is running
- Clear browser cache if needed

### Firebase Auth Not Working
- Add `localhost:3000` to Firebase Console authorized domains
- Verify Firebase configuration in `src/lib/firebase.ts`
- Check console for error messages

---

## Files Modified
- `server.ts` - Changed hostname from `0.0.0.0` to `localhost`

**Changes Made On**: November 6, 2025
