<div align="center">
  <h1>💰 Welth</h1>
  <p><strong>AI-Powered Financial Management Platform</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#usage">Usage</a> •
    <a href="#api">API</a>
  </p>

  ![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
  ![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
  ![Prisma](https://img.shields.io/badge/Prisma-6.11.0-2D3748?style=for-the-badge&logo=prisma)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)
</div>

---

## 📖 About

**Welth** is a cutting-edge financial management platform that leverages artificial intelligence to revolutionize personal finance tracking. Built with modern web technologies, Welth offers intelligent insights, automated transaction processing, multi-modal input methods, and comprehensive financial analytics to help users take control of their finances.

### ✨ Key Highlights

- 🤖 **AI-Powered**: Smart transaction parsing using Google Gemini 1.5 Flash
- 📱 **Multi-Modal Input**: Voice, SMS parsing, receipt scanning, and manual entry
- 👥 **Social Finance**: Split expenses seamlessly with friends
- 📊 **Real-Time Analytics**: Advanced charts and spending insights
- 🔔 **Smart Alerts**: Automated budget warnings and notifications
- 🔒 **Secure**: Enterprise-grade authentication with Clerk

---

## 🚀 Features

### 💳 Transaction Management
- **Multiple Input Methods**: Manual entry, voice input, SMS parsing, and receipt scanning
- **Smart Categorization**: AI-powered automatic category detection
- **Bulk Operations**: Import and manage transactions efficiently
- **Receipt OCR**: Extract data from receipt images

### 📊 Dashboard & Analytics
- **Real-Time Overview**: Today's spending, monthly breakdown, and balance monitoring
- **Interactive Charts**: Pie charts, bar graphs, and trend analysis
- **Expense Tracking**: Category-wise spending visualization
- **Budget Progress**: Visual budget monitoring with alerts

### 👥 Split Expenses
- **Friend Management**: Add and manage friends for splitting
- **Split Requests**: Create, approve, and track split expenses
- **Automatic Calculations**: Smart amount distribution
- **Payment Tracking**: Keep track of who owes what

### 💰 Budget Management
- **Monthly Budgets**: Set category-specific budgets
- **Real-Time Tracking**: Monitor spending against budgets
- **Alert System**: Automated notifications for budget breaches
- **Historical Analysis**: Compare budget performance over time

### 🏦 Account Management
- **Multi-Account Support**: Manage current and savings accounts
- **Balance Tracking**: Real-time balance updates
- **Minimum Balance Alerts**: Get notified when balance is low
- **Account Statistics**: Detailed insights per account

### 🤖 AI Features
- **Transaction Parsing**: Natural language understanding for transactions
- **Receipt Scanning**: OCR-based data extraction
- **Financial Insights**: AI-generated spending analysis
- **Voice Processing**: Speech-to-text transaction creation

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.3.3](https://nextjs.org/)** - React framework with App Router
- **[React 19.0.0](https://react.dev/)** - UI library
- **[Tailwind CSS 4.x](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Recharts](https://recharts.org/)** - Data visualization library
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Prisma 6.11.0](https://www.prisma.io/)** - Next-generation ORM
- **[Clerk](https://clerk.com/)** - Authentication and user management
- **[Google Gemini AI](https://ai.google.dev/)** - AI engine for smart features
- **[Inngest](https://www.inngest.com/)** - Background job processing
- **[Resend](https://resend.com/)** - Email delivery service

### Additional Tools
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation
- **[Arcjet](https://arcjet.com/)** - Security and rate limiting
- **[React Email](https://react.email/)** - Email template builder
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** / **yarn** / **pnpm** / **bun**
- **PostgreSQL** database
- **Git**

### Required API Keys

You'll need accounts and API keys for:
- [Clerk](https://clerk.com/) - Authentication
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Gemini API
- [Supabase](https://supabase.com/) or PostgreSQL hosting
- [Resend](https://resend.com/) - Email service
- [Inngest](https://www.inngest.com/) - Background jobs (optional for local dev)
- [Arcjet](https://arcjet.com/) - Security (optional for local dev)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kaustav3071/Welth---AI-Powered-Financial-Management-Platform.git
cd Welth---AI-Powered-Financial-Management-Platform/my-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the `my-app` directory:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key"
CLERK_SECRET_KEY="sk_test_your_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# Resend (Email)
RESEND_API_KEY="your_resend_api_key"

# Arcjet (Security - Optional in dev)
ARCJET_KEY="your_arcjet_key"

# Inngest (Background Jobs - Optional for local dev)
INNGEST_EVENT_KEY="your_inngest_event_key"
INNGEST_SIGNING_KEY="your_inngest_signing_key"
```

### 4. Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Project Structure

```
my-app/
├── actions/              # Server actions for data operations
│   ├── account.js
│   ├── budget.js
│   ├── dashboard.js
│   ├── transaction.js
│   └── send-email.js
├── app/                  # Next.js App Router
│   ├── (auth)/          # Authentication pages
│   ├── (main)/          # Protected pages
│   ├── api/             # API routes
│   ├── lib/             # App-specific utilities
│   ├── globals.css
│   └── layout.js
├── components/          # Reusable React components
│   ├── ui/             # UI primitives (shadcn/ui)
│   └── ...             # Feature components
├── data/                # Static data and configurations
│   ├── categories.js
│   └── landing.js
├── emails/              # Email templates
│   └── template.jsx
├── hooks/               # Custom React hooks
│   └── use-fetch.js
├── lib/                 # Core utilities and configurations
│   ├── prisma.js       # Prisma client
│   ├── utils.js        # Utility functions
│   ├── arcjet/         # Security configurations
│   └── inngest/        # Background job definitions
├── prisma/              # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
└── public/              # Static assets
```

---

## 🎯 Usage

### Creating an Account

1. Navigate to `/sign-up`
2. Complete the registration form
3. Verify your email (if required)
4. Set up your first financial account

### Adding Transactions

#### Method 1: Manual Entry
1. Go to Dashboard
2. Click "Add Transaction"
3. Fill in the details (amount, category, description)
4. Submit

#### Method 2: SMS Parsing
1. Click "Parse SMS" in the transaction menu
2. Paste your bank SMS message
3. AI will extract transaction details
4. Review and confirm

#### Method 3: Voice Input
1. Click the microphone icon
2. Speak your transaction details
3. AI processes and creates the transaction

#### Method 4: Receipt Scanning
1. Click "Scan Receipt"
2. Upload a receipt image
3. AI extracts transaction data
4. Confirm the details

### Managing Budgets

1. Navigate to your account page
2. Click "Set Budget"
3. Select category and set amount
4. Monitor progress on the dashboard

### Splitting Expenses

1. Go to "Friends" section
2. Add friends via email
3. Create a split request
4. Friends approve/decline via their dashboard
5. Track settlement status

---

## 🔌 API Documentation

### Account Endpoints

```
GET    /api/account              - Get all user accounts
POST   /api/account              - Create new account
PUT    /api/account/[id]         - Update account details
GET    /api/account/[id]/stats   - Get account statistics
GET    /api/account/[id]/transactions - Get account transactions
```

### Transaction Endpoints

```
POST   /api/transaction/parse-sms     - Parse SMS text
POST   /api/transaction/parse-receipt - Parse receipt image
```

### Split Endpoints

```
GET    /api/splits                     - Get split requests
POST   /api/splits                     - Create split request
PUT    /api/splits/[id]/resolve        - Approve/decline split
```

### Friends Endpoints

```
GET    /api/friends                    - Get friends list
POST   /api/friends                    - Send friend request
PUT    /api/friends/[id]               - Accept/decline request
DELETE /api/friends/[id]               - Remove friend
```

---

## 🗄️ Database Schema

### Key Models

#### User
- Manages user authentication and profile
- Links to Clerk authentication

#### Account
- Multiple accounts per user (checking, savings)
- Tracks balance and account type

#### Transaction
- Records income and expenses
- Linked to accounts and categories
- Supports recurring transactions

#### Budget
- Monthly budget limits per category
- Tracks spending against limits

#### SplitRequest
- Manages expense splitting between users
- Tracks approval status and settlements

#### Friendship
- User-to-user relationships
- Enables split expense functionality

For detailed schema, see [prisma/schema.prisma](prisma/schema.prisma)

---

## 🔐 Security Features

- **Authentication**: Clerk-based authentication with MFA support
- **Authorization**: Row-level security with user isolation
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **Rate Limiting**: Arcjet protection against abuse
- **CORS**: Configured for secure API access
- **Environment Variables**: Sensitive data protection
- **HTTPS**: SSL/TLS encryption in production

---

## 🎨 Customization

### Adding New Categories

Edit `data/categories.js`:

```javascript
export const categories = [
  { value: "your-category", label: "Your Category", icon: "🎯" },
  // ... more categories
];
```

### Customizing Theme

Modify `app/globals.css` for theme colors:

```css
:root {
  --primary: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  /* ... customize colors */
}
```

---

## 🧪 Testing

```bash
# Run tests (if available)
npm test

# Run linting
npm run lint

# Type checking (if TypeScript)
npm run type-check
```

---

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy automatically

### Manual Deployment

1. Set up PostgreSQL database
2. Configure all environment variables
3. Run `npm run build`
4. Start with `npm start`
5. Set up reverse proxy (nginx/Apache)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🐛 Known Issues & Troubleshooting

### Issue: Prisma Client Not Generated
```bash
npx prisma generate
```

### Issue: Database Connection Failed
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Verify network connectivity

### Issue: Clerk Authentication Not Working
- Verify CLERK keys in `.env`
- Check Clerk dashboard for correct URLs
- Ensure all NEXT_PUBLIC_ variables are set

### Issue: AI Features Not Working
- Verify GEMINI_API_KEY is correct
- Check API quota limits
- Review API endpoint accessibility

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Kaustav**
- GitHub: [@kaustav3071](https://github.com/kaustav3071)
- Project: [Welth](https://github.com/kaustav3071/Welth---AI-Powered-Financial-Management-Platform)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting platform
- [Clerk](https://clerk.com/) for authentication
- [Prisma](https://www.prisma.io/) for the ORM
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Google](https://ai.google.dev/) for Gemini AI
- All open-source contributors

---

## 📮 Support

For support, email kaustavdas2027@gmail.com or open an issue on GitHub.

---

## 🗺️ Roadmap

### Short-term
- [ ] Mobile application (React Native)
- [ ] Bank API integration
- [ ] Investment tracking
- [ ] Tax preparation tools

### Long-term
- [ ] AI financial advisor
- [ ] Cryptocurrency support
- [ ] Multi-currency support
- [ ] Business accounts

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/kaustav3071">Kaustav</a></p>
  <p>⭐️ Star this repo if you find it helpful!</p>
</div>
