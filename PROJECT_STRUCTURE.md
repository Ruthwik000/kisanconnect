# Feature-Based Project Structure

## New Organization

```
src/
├── features/                    # Feature-based modules
│   ├── auth/                   # Authentication feature
│   │   ├── components/         # Auth-specific components
│   │   ├── contexts/          # AuthContext
│   │   ├── pages/             # Login, Signup pages
│   │   ├── services/          # authService
│   │   └── index.js           # Feature exports
│   │
│   ├── disease-detection/      # Disease detection feature
│   │   ├── components/        # Disease-specific components
│   │   ├── pages/            # DiseasePage
│   │   ├── services/         # diseaseDetectionService
│   │   └── index.js          # Feature exports
│   │
│   ├── dashboard/             # Dashboard & landing
│   │   ├── components/       # Dashboard components
│   │   ├── pages/           # Dashboard, Landing, Onboarding
│   │   └── index.js         # Feature exports
│   │
│   ├── chat/                 # Chat functionality
│   │   ├── components/      # Chat components
│   │   ├── pages/          # ChatPage
│   │   ├── services/       # groqService, geminiService
│   │   └── index.js        # Feature exports
│   │
│   ├── profile/             # User profile
│   │   ├── components/     # Profile components
│   │   ├── pages/         # ProfilePage
│   │   └── index.js       # Feature exports
│   │
│   ├── news/               # News feature
│   │   ├── components/    # News components
│   │   ├── pages/        # NewsPage
│   │   └── index.js      # Feature exports
│   │
│   └── weather/           # Weather functionality
│       ├── components/   # Weather components
│       ├── services/    # weatherService
│       └── index.js     # Feature exports
│
├── shared/                # Shared/common code
│   ├── components/       # Shared components
│   │   ├── navigation/  # Navigation components
│   │   └── NotFound.jsx # Error pages
│   ├── ui/              # UI component library
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   ├── contexts/        # Shared contexts (Language)
│   ├── config/          # Configuration files
│   ├── i18n/           # Internationalization
│   ├── api/            # API utilities
│   └── index.js        # Shared exports
│
├── App.jsx             # Main app component
├── main.jsx           # Entry point
├── router.jsx         # Route configuration
└── index.css         # Global styles
```

## Benefits of Feature-Based Structure

### 1. **Better Organization**
- Related files are grouped together
- Easy to find feature-specific code
- Clear separation of concerns

### 2. **Improved Maintainability**
- Changes to a feature are contained
- Easier to add/remove features
- Reduced coupling between features

### 3. **Team Collaboration**
- Multiple developers can work on different features
- Less merge conflicts
- Clear ownership boundaries

### 4. **Scalability**
- Easy to add new features
- Can extract features to separate packages
- Supports micro-frontend architecture

### 5. **Clean Imports**
- Feature-based imports: `import { LoginPage } from '@/features/auth'`
- Shared imports: `import { Button } from '@/shared/ui'`
- No deep nested imports

## Import Examples

```javascript
// Feature imports
import { LoginPage, SignupPage, authService } from '@/features/auth';
import { DiseasePage, diseaseDetectionService } from '@/features/disease-detection';
import { Dashboard, LandingPage } from '@/features/dashboard';

// Shared imports
import { Button, Input, Card } from '@/shared/ui';
import { useToast } from '@/shared/hooks';
import { LanguageContext } from '@/shared/contexts';
```

## Migration Status

✅ **Completed:**
- Auth feature (login, signup, auth service)
- Disease detection feature (disease page, ML service)
- Dashboard feature (dashboard, landing, onboarding)
- Chat feature (chat page, AI services)
- Profile feature (profile page)
- News feature (news page)
- Weather feature (weather service)
- Shared components (UI library, navigation)
- Shared utilities (hooks, contexts, config)

⚠️ **Next Steps:**
- Update all import statements in components
- Test application functionality
- Update build configuration if needed
- Update documentation

## File Locations

### Before (Type-based)
```
src/pages/LoginPage.jsx
src/services/authService.js
src/components/ui/Button.jsx
```

### After (Feature-based)
```
src/features/auth/pages/LoginPage.jsx
src/features/auth/services/authService.js
src/shared/ui/Button.jsx
```

This structure makes the codebase more maintainable and easier to navigate as the application grows.