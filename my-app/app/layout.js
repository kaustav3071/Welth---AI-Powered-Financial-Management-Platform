import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/error-boundary";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata = {
  title: "Welth - AI-Powered Financial Management",
  description: "The most intelligent financial management platform that helps you track expenses, set budgets, and achieve your financial goals with AI-powered insights.",
  keywords: "financial management, expense tracking, budget planning, AI finance, personal finance, money management",
  authors: [{ name: "Welth Team" }],
  openGraph: {
    title: "Welth - AI-Powered Financial Management",
    description: "The most intelligent financial management platform that helps you track expenses, set budgets, and achieve your financial goals with AI-powered insights.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welth - AI-Powered Financial Management",
    description: "The most intelligent financial management platform that helps you track expenses, set budgets, and achieve your financial goals with AI-powered insights.",
  },
};

// Force dynamic rendering since we use Clerk authentication
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider> 
      <html lang="en">
        <body className={`${inter.className}`}> 
          <ErrorBoundary>
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="min-h-screen"> 
              {children} 
            </main>
            
            {/* Toast Notifications */}
            <Toaster richColors />

            {/* Professional Footer */}
            <Footer />
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
