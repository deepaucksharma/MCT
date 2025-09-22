# MCT Digital Therapeutic Application

A comprehensive Metacognitive Therapy (MCT) application implementing evidence-based protocols for reducing worry, rumination, and anxiety through attention training and metacognitive belief modification.

## 📋 Overview

This application delivers a structured 8-10 week MCT program focusing exclusively on **process** (HOW you think) rather than **content** (WHAT you think about). Built following strict MCT fidelity requirements as specified in the comprehensive [Product Specification](../PRODUCT_SPECIFICATION.md).

## 🎯 Key Features

### Core MCT Components
- **Attention Training Technique (ATT)**: 12-15 minute guided audio sessions
- **Detached Mindfulness (DM)**: 60-180 second micro-practices
- **Worry/Rumination Postponement**: Systematic delay protocols
- **Situational Attentional Refocusing (SAR)**: If-Then implementation plans
- **Behavioral Experiments**: 12 templates for testing metacognitive beliefs

### Clinical Targets
- ≥20-30% reduction in daily worry minutes
- ≥15-20 point reduction in uncontrollability beliefs
- ≥50 min/week ATT practice by Week 2
- Complete process focus (no content analysis)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- 2GB free disk space (for local SQLite database)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd MCT/mct-app

# Install all dependencies
npm run install:all

# Initialize the database
cd server
npm run db:init
cd ..

# Start development servers
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📐 Architecture

```
mct-app/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API services
│   │   ├── store/        # Zustand state management
│   │   └── types/        # TypeScript definitions
│   └── public/           # Static assets
│
├── server/               # Express backend
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utilities
│   │   └── types/        # Shared types
│   └── data/            # SQLite database
│
└── visual-verification/ # Testing suite
    ├── verify.js        # Automated visual tests
    └── screenshots/     # Test screenshots
```

## 🧪 Visual Verification

The application includes comprehensive visual verification to ensure implementation matches specifications:

```bash
# Run visual verification suite
cd visual-verification
npm install
npm run verify

# View report at visual-verification/verification-report.html
```

### Verification Checkpoints

1. **Onboarding Compliance**
   - ≤7 minute completion
   - Process-only assessment
   - No content collection

2. **CAS Measurement**
   - Worry/rumination time tracking
   - Monitoring frequency counts
   - Fidelity guard activation

3. **Exercise Protocols**
   - ATT phase verification
   - DM practice methods
   - SAR plan creation

4. **Progress Visualization**
   - Process-only metrics
   - No content insights
   - Belief rating trends

## 📊 Implementation Status

### ✅ Completed
- Database schema with 15+ tables
- RESTful API architecture
- Core state management
- Onboarding flow structure
- Today screen framework
- Visual verification suite

### 🚧 In Progress
Refer to [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) for detailed status of:
- Module implementations
- Exercise protocols
- Experiment system
- Progress visualizations

## 🔒 Privacy & Security

- **100% Local Storage**: All data stored on device
- **No Cloud Sync**: No external servers
- **No Analytics**: No tracking or telemetry
- **Data Export**: User can export/delete all data

## 📖 Documentation

### Product Specifications
- [Product Specification](../PRODUCT_SPECIFICATION.md) - Complete product requirements
- [Implementation Plan](../IMPLEMENTATION_PLAN.md) - Development roadmap

### Module Specifications
- [Module 0: Strategic Positioning](../product-spec/modules/module-0-orientation.md)
- [Module 1: Clinical Model](../product-spec/modules/module-1-clinical.md)
- [Module 2: Program Architecture](../product-spec/modules/module-2-architecture.md)
- [Module 3: Weekly Content](../product-spec/modules/module-3-weekly-content.md)
- [Module 4: Exercise Library](../product-spec/modules/module-4-exercises.md)
- [Module 5: Behavioral Experiments](../product-spec/modules/module-5-experiments.md)

## 🏥 Clinical Fidelity

This application maintains strict MCT fidelity:

### Process-Only Focus
- ✅ Track HOW LONG you worry (not what about)
- ✅ Measure attention control ability
- ✅ Rate belief strength (0-100)
- ❌ Never analyze thought content
- ❌ No reassurance mechanisms
- ❌ No problem-solving features

### Safety Rails
- Crisis resources always visible
- Clear exclusion criteria stated
- Routing to professional help when needed

## 🧪 Testing

```bash
# Run visual verification
cd visual-verification
npm run verify

# Run API tests (when implemented)
cd server
npm test

# Run frontend tests (when implemented)
cd client
npm test
```

## 📱 Device Support

- **Desktop**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS 14+, Android 10+ (via responsive web)
- **Offline**: 100% functionality after initial load
- **Accessibility**: WCAG AA compliant

## 🤝 Contributing

This is a clinical application requiring strict adherence to MCT protocols. Any contributions must:

1. Maintain process-only focus
2. Follow MCT fidelity requirements
3. Include visual verification tests
4. Pass all existing tests
5. Include documentation updates

## 📄 License

[License details]

## ⚠️ Disclaimer

This application is a self-help tool based on MCT principles. It is not:
- A replacement for professional therapy
- A diagnostic tool
- Suitable for crisis situations
- Appropriate for severe mental health conditions

Users experiencing severe distress should seek professional help immediately.

## 🆘 Support

For technical issues: [Create an issue]
For clinical questions: Consult the MCT literature or a qualified therapist

---

Built with 💙 following Wells & Matthews' MCT model