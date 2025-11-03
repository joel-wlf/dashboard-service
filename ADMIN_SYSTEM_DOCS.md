# 🔧 Technische Dokumentation - Admin System

## 📁 Dateistruktur

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx                # Admin Dashboard (React Component)
│   └── api/
│       └── auth/
│           └── route.ts            # Authentifizierung API
├── middleware.ts                   # Route Protection Middleware
└── .env.example                   # Environment Variablen Template
```

## 🔐 Authentication Flow

### Login Prozess
- **POST** `/api/auth` - Password validieren
- Bei Erfolg: JWT Token generieren und als `admin_auth` Cookie setzen (30 Tage gültig)
- JWT Payload: `{ admin: true, iat, exp }`
- Cookie Eigenschaften: `httpOnly`, `secure`, `sameSite: strict`

### Session Check
- **GET** `/api/auth` - JWT Token aus Cookie validieren
- Token Verification: Signatur prüfen + Expiry check
- Return: `{ authenticated: true/false }`

### Logout
- **DELETE** `/api/auth` - Cookie löschen (maxAge: 0)

## 🛡️ Middleware Protection

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  // Schützt: /api/updateSetting, /api/getSettings
  // Prüft: JWT Token aus admin_auth Cookie
  // Verifiziert: Token Signatur + Expiry
  // Bei Fehler: 401 Unauthorized
}
```

### Geschützte Routen
- `/api/updateSetting`
- `/api/getSettings`

## 🎛️ Admin Dashboard Features

### React States
```typescript
interface AdminPageState {
  isAuthenticated: boolean | null;    // Auth Status
  password: string;                   // Login Input
  loginError: string;                 // Error Messages
  settings: Setting[];                // Settings Array
  loading: boolean;                   // Loading State
  updateMessage: string;              // Success/Error Feedback
}
```

### Hauptfunktionen
| Funktion | Beschreibung |
|----------|-------------|
| `checkAuthStatus()` | Cookie validation beim Start |
| `handleLogin()` | Login mit Password |
| `loadSettings()` | Settings aus DB laden |
| `updateSetting()` | Einzelne Settings updaten |
| `handleLogout()` | Session beenden |

## 📊 Settings Management

### Unterstützte Datentypen
| Typ | UI Element | Beschreibung |
|-----|------------|-------------|
| **Boolean** | Checkbox | true/false Toggle |
| **String** | Text Input | Freitext Eingabe |
| **Number** | Number Input | Numerische Werte |

### Update Flow
1. **Optimistic Update** - UI sofort updaten
2. **API Call** - POST zu `/api/updateSetting`
3. **Reload** - Settings neu laden bei Erfolg
4. **Feedback** - Success/Error Message anzeigen

## 🔧 Environment Variablen

```env
# Admin System
ADMIN_PASSWORD=dein_sicheres_passwort
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Database
DB_USERNAME=admin
DB_PASSWORD=password

# Next.js
NODE_ENV=development
```

## 🔄 API Endpoints

| Method | Endpoint | Funktion | Auth Required | Request Body |
|--------|----------|----------|---------------|--------------|
| **POST** | `/api/auth` | Login | ❌ | `{ password: string }` |
| **GET** | `/api/auth` | Status Check | ❌ | - |
| **DELETE** | `/api/auth` | Logout | ❌ | - |
| **GET** | `/api/getSettings` | Settings laden | ✅ | - |
| **POST** | `/api/updateSetting` | Setting updaten | ✅ | `{ key: string, value: any }` |

## 🔒 Sicherheitsfeatures

### JWT Token Security
```typescript
// JWT Payload
{
  admin: true,                      // Admin role
  iat: timestamp,                   // Issued at
  exp: timestamp + 30days           // Expiration
}

// Cookie Settings
{
  httpOnly: true,                   // Kein JavaScript Zugriff
  secure: NODE_ENV === "production", // HTTPS only in Production
  sameSite: "strict",              // CSRF Protection
  maxAge: 30 * 24 * 60 * 60,      // 30 Tage
  path: "/"                        // Sitewide gültig
}
```

### Token Verification
- **Signatur Check**: HMAC SHA-256 mit JWT_SECRET
- **Expiry Check**: Automatische Token Invalidierung
- **Payload Validation**: Admin role verification

### Middleware Protection
- Automatische JWT Token Validierung für Admin APIs
- Signatur und Expiry Verification
- 401 Response bei invalid/expired Token
- Keine manuelle Token-Checks in den Endpoints nötig

## 🛠️ Tech Stack

| Technologie | Version | Verwendung |
|-------------|---------|------------|
| **Next.js** | 14+ | App Router, API Routes |
| **React** | 18+ | Hooks (useState, useEffect) |
| **TypeScript** | 5+ | Type Safety |
| **Tailwind CSS** | 3+ | Responsive Styling |
| **Jose** | Latest | JWT Token Management |
| **HTTP Cookies** | - | Secure Session Storage |

## 🚀 Installation & Setup

### 1. Environment konfigurieren
```bash
cp .env.example .env.local
# ADMIN_PASSWORD setzen
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Development starten
```bash
npm run dev
```

### 4. Admin Panel aufrufen
```
http://localhost:3000/admin
```

## 🔍 Debugging

### Auth Status prüfen
```javascript
// Browser Console
fetch('/api/auth').then(r => r.json()).then(console.log)
```

### Cookie inspizieren
```javascript
// Browser DevTools -> Application -> Cookies
// Suche nach: admin_auth
```

### Middleware Logs
```bash
# Console Output bei geschützten Routes
console.log('Auth check for:', request.nextUrl.pathname)
```

## 📝 Erweitungsmöglichkeiten

### Zusätzliche Datentypen
- **Array**: Multi-Select Dropdown
- **Object**: JSON Editor
- **Date**: Date Picker

### Security Enhancements
- Rate Limiting für Login
- CSRF Tokens
- Session Timeout Warnings

### UI Improvements
- Bulk Edit Funktionen
- Search/Filter für Settings
- Import/Export Features

---

**Erstellt:** $(date)  
**Version:** 1.0  
**Autor:** Rovo Dev