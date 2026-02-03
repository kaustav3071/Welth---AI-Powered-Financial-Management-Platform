"use server"
import aj from "@/lib/arcjet/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/user-helper";

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
    ...obj,
    amount:obj.amount.toNumber(),
})

export async function createTransaction(data){
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        // Environment-based rate limiting: disabled in dev, enabled in production
        if (!isDevelopment) {
            const req = await request();
            const decision = await aj.protect(req, {
                userId,
                requested: 1,
            });

            if (decision.isDenied()) {
                if (decision.reason.isRateLimit()) {
                    const { remaining, reset } = decision.reason;
                    console.error({
                        code: "RATE_LIMIT_EXCEEDED",
                        details: {
                            remaining,
                            resetInSeconds: reset,
                        },
                    });
                    throw new Error("Too many requests. Please try again later.");
                }
                throw new Error("Request Blocked.");
            }
        }

        const user = await getAuthenticatedUser();

        const account = await db.account.findUnique({
            where:{
                id:data.accountId,
                userId: user.id,
            }
        });

        if(!account){
            throw new Error("Account not found");
        }

        // Check if account has sufficient balance for expense transactions
        if (data.type === "EXPENSE") {
            const currentBalance = account.balance.toNumber();
            const minimumBalance = account.minimumBalance.toNumber();
            const availableBalance = currentBalance - minimumBalance;
            
            if (currentBalance < data.amount) {
                throw new Error(`Insufficient funds. Available balance: ₨ ${currentBalance.toFixed(2)}, Required: ₨ ${data.amount.toFixed(2)}`);
            }
            
            if (currentBalance - data.amount < minimumBalance) {
                throw new Error(`Cannot go below minimum balance. Available for spending: ₨ ${availableBalance.toFixed(2)}, Required: ₨ ${data.amount.toFixed(2)}, Minimum to maintain: ₨ ${minimumBalance.toFixed(2)}`);
            }
        }

        const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
        const newBalance = account.balance.toNumber() + balanceChange;

        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data:{
                    ...data,
                    userId:user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval? calculateNextRecurringDate(data.date, data.recurringInterval):null,
                },
            });

            await tx.account.update({
                where:{id:data.accountId},
                data:{balance:newBalance},
            });

            return newTransaction;
        });


        revalidatePath('/dashboard');
        revalidatePath(`/account/${transaction.accountId}`);

        return {success:true, data: serializeAmount(transaction)};

        } catch (error) {
            throw new Error(error.message);
    }
}

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

export async function parseSMSTransaction(smsText) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      Parse this input (SMS/GPay message OR human language description) and extract transaction information in JSON format:
      - Amount (just the number)
      - Transaction type (INCOME or EXPENSE)
      - Category (must be one of these exact IDs: salary,freelance,investments,business,rental,other-income,housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense)
      - Description (brief summary)
      - Merchant name (if mentioned)
      - Date in DD/MM/YYYY format (convert relative dates to actual dates)

      Input Text: "${smsText}"

      IMPORTANT: This can be either:
      1. SMS/GPay message: "Rs. 320.00 debited from your account..."
      2. Human language: "I spent 250 rs yesterday on food and ate dosa"

      Date conversion rules (TODAY IS: ${new Date().toLocaleDateString('en-GB')}):
      - "today" → ${new Date().toLocaleDateString('en-GB')}
      - "yesterday" → ${new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "last week" → ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "this morning" → ${new Date().toLocaleDateString('en-GB')}
      - "this evening" → ${new Date().toLocaleDateString('en-GB')}
      - "last month" → ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "2 days ago" → ${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "3 weeks ago" → ${new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      
      CRITICAL: Always convert relative dates to actual DD/MM/YYYY format using the above examples.

      Category mapping guide:
      
      INCOME CATEGORIES:
      - Salary, wages, monthly pay → "salary"
      - Freelance work, consulting, gig work → "freelance"
      - Stock dividends, mutual funds, investments → "investments"
      - Business income, sales, profits → "business"
      - Rental income, property rent → "rental"
      - Other income sources → "other-income"
      
      EXPENSE CATEGORIES:
      - Food items, restaurants, cafes, dosa, pizza, coffee → "food"
      - Grocery stores, supermarkets, vegetables, fruits → "groceries"
      - Gas stations, fuel, public transport, taxi, uber → "transportation"
      - Rent, mortgage, home maintenance → "housing"
      - Electricity, water, internet bills → "utilities"
      - Movies, games, streaming, cinema, tickets → "entertainment"
      - Clothing, electronics, general shopping → "shopping"
      - Medical, pharmacy, health, medicine → "healthcare"
      - School, courses, books, education → "education"
      - Gym, salon, personal care → "personal"
      - Hotels, flights, travel → "travel"
      - Insurance payments → "insurance"
      - Gifts, donations → "gifts"
      - Bank fees, service charges → "bills"
      - Everything else → "other-expense"

      Transaction type rules:
      - "debited", "paid", "spent", "bought", "purchased", "cost" → "EXPENSE"
      - "credited", "received", "deposited", "earned", "got" → "INCOME"

      Examples of human language parsing:
      - "I spent 250 rs yesterday on food and ate dosa" → amount: 250, type: EXPENSE, category: food, description: "Dosa", date: ${new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "Bought groceries for 1200 today" → amount: 1200, type: EXPENSE, category: groceries, description: "Groceries", date: ${new Date().toLocaleDateString('en-GB')}
      - "Paid 500 for movie tickets last week" → amount: 500, type: EXPENSE, category: entertainment, description: "Movie tickets", date: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "Received 25000 salary today" → amount: 25000, type: INCOME, category: salary, description: "Salary", date: ${new Date().toLocaleDateString('en-GB')}
      - "Got 5000 from freelance work yesterday" → amount: 5000, type: INCOME, category: freelance, description: "Freelance work", date: ${new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "Earned 2000 from investments last week" → amount: 2000, type: INCOME, category: investments, description: "Investments", date: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}

      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "type": "INCOME" or "EXPENSE",
        "category": "category-id",
        "description": "string",
        "merchantName": "string",
        "date": "DD/MM/YYYY"
      }
      
      IMPORTANT: The date field MUST be in DD/MM/YYYY format. Examples:
      - "13/12/2024" (correct)
      - "13-12-2024" (incorrect)
      - "2024-12-13" (incorrect)
      - "December 13, 2024" (incorrect)

      If the input is not a transaction or unclear, return an empty object.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    
    if (!response) {
      throw new Error("No response from AI service");
    }
    
    const text = response.text();
    
    if (!text) {
      throw new Error("Empty response from AI service");
    }
    
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      
      
      if (!data || Object.keys(data).length === 0) {
        throw new Error("Could not parse SMS as a transaction");
      }

      // Validate required fields
      if (!data.amount || !data.type || !data.category) {
        throw new Error("Could not extract complete transaction details from SMS");
      }

      // Validate category ID
      const validCategories = [
        // Income categories
        'salary', 'freelance', 'investments', 'business', 'rental', 'other-income',
        // Expense categories
        'housing', 'transportation', 'groceries', 'utilities', 'entertainment',
        'food', 'shopping', 'healthcare', 'education', 'personal', 'travel',
        'insurance', 'gifts', 'bills', 'other-expense'
      ];
      
      const categoryId = validCategories.includes(data.category) ? data.category : 'other-expense';
      
      // Validate amount
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount detected in SMS");
      }

      // Process and validate date
      let processedDate = data.date || new Date().toLocaleDateString('en-GB');
      
      // If date is provided, ensure it's in DD/MM/YYYY format
      if (data.date) {
        // Check if it's already in DD/MM/YYYY format
        if (data.date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          processedDate = data.date;
        } else {
          // Try to parse other date formats and convert to DD/MM/YYYY
          try {
            const parsedDate = new Date(data.date);
            if (!isNaN(parsedDate.getTime())) {
              processedDate = parsedDate.toLocaleDateString('en-GB');
            }
          } catch (e) {
            // If parsing fails, use today's date
            processedDate = new Date().toLocaleDateString('en-GB');
          }
        }
      }

      const result = {
        amount: amount,
        type: data.type,
        category: categoryId,
        description: data.description || data.merchantName || "SMS transaction",
        merchantName: data.merchantName || "",
        date: processedDate, // Return DD/MM/YYYY string
      };
      
      
      return result;
    } catch (parseError) {
      throw new Error("Could not process SMS transaction");
    }
  } catch (error) {
    // Handle specific API errors
    if (error.status === 503 || error.message.includes('Service Unavailable')) {
      throw new Error("AI service is temporarily unavailable. Please try again in a few minutes.");
    } else if (error.status === 429 || error.message.includes('quota') || error.message.includes('RATE_LIMIT')) {
      throw new Error("AI service quota exceeded. Please try again later.");
    } else if (error.message.includes('API key') || error.message.includes('INVALID_ARGUMENT')) {
      throw new Error("AI service configuration error. Please contact support.");
    } else if (error.message.includes('JSON') || error.message.includes('parse')) {
      throw new Error("AI response format error. Please try again with different text.");
    } else {
      throw new Error(`Failed to parse SMS transaction: ${error.message}`);
    }
  }
}

export async function processVoiceInput(transcript) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      Parse this voice input for a financial transaction and extract the following information in JSON format:
      - Amount (just the number)
      - Transaction type (INCOME or EXPENSE)
      - Category (must be one of these exact IDs: salary,freelance,investments,business,rental,other-income,housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense)
      - Description (brief summary)
      - Merchant name (if mentioned)
      - Date (MUST be in DD/MM/YYYY format)

      Voice input: "${transcript}"

      Date conversion rules (TODAY IS: ${new Date().toLocaleDateString('en-GB')}):
      - "today" → ${new Date().toLocaleDateString('en-GB')}
      - "yesterday" → ${new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "last week" → ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "this morning" → ${new Date().toLocaleDateString('en-GB')}
      - "this evening" → ${new Date().toLocaleDateString('en-GB')}
      - "last month" → ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "2 days ago" → ${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      - "3 weeks ago" → ${new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
      
      CRITICAL: Always convert relative dates to actual DD/MM/YYYY format using the above examples.

      Transaction type rules:
      - INCOME: "earned", "received", "got paid", "salary", "freelance", "business income", "investment returns", "rental income"
      - EXPENSE: "spent", "bought", "purchased", "paid for", "bills", "shopping", "food", "transport"

      Category mapping guide:
      
      INCOME CATEGORIES:
      - Salary, wages, monthly pay, job income → "salary"
      - Freelance work, consulting, gig work, project work → "freelance"
      - Stock dividends, mutual funds, investments, trading profits → "investments"
      - Business income, sales, profits, entrepreneurship → "business"
      - Rental income, property rent, house rent → "rental"
      - Other income sources, cash received → "other-income"
      
      EXPENSE CATEGORIES:
      - Food items, restaurants, cafes, dining → "food"
      - Grocery stores, supermarkets, vegetables → "groceries"
      - Gas stations, fuel, public transport, taxi → "transportation"
      - Rent, mortgage, home maintenance → "housing"
      - Electricity, water, internet bills → "utilities"
      - Movies, games, streaming, entertainment → "entertainment"
      - Clothing, electronics, general shopping → "shopping"
      - Medical, pharmacy, health, doctor → "healthcare"
      - School, courses, books, education → "education"
      - Gym, salon, personal care → "personal"
      - Hotels, flights, travel, vacation → "travel"
      - Insurance payments → "insurance"
      - Gifts, donations → "gifts"
      - Bank fees, service charges → "bills"
      - Everything else → "other-expense"

      IMPORTANT: The date field MUST be in DD/MM/YYYY format (e.g., "14/12/2024")

      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "type": "INCOME" or "EXPENSE",
        "category": "category-id",
        "description": "string",
        "merchantName": "string",
        "date": "DD/MM/YYYY"
      }

      If the input is unclear or not a transaction, return an empty object.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      
      if (!data || Object.keys(data).length === 0) {
        throw new Error("Could not understand the voice input");
      }

      // Validate required fields
      if (!data.amount || !data.type || !data.category) {
        throw new Error("Could not extract complete transaction details");
      }

      // Validate category ID
      const validCategories = [
        // Income categories
        'salary', 'freelance', 'investments', 'business', 'rental', 'other-income',
        // Expense categories
        'housing', 'transportation', 'groceries', 'utilities', 'entertainment',
        'food', 'shopping', 'healthcare', 'education', 'personal', 'travel',
        'insurance', 'gifts', 'bills', 'other-expense'
      ];
      
      const categoryId = validCategories.includes(data.category) ? data.category : 'other-expense';
      
      // Validate amount
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount detected");
      }

      // Process date - convert to DD/MM/YYYY format
      let processedDate = new Date().toLocaleDateString('en-GB'); // Default to today
      if (data.date) {
        // If AI returned a date string, try to parse it
        if (typeof data.date === 'string') {
          // Check if it's already in DD/MM/YYYY format
          if (data.date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            processedDate = data.date;
          } else {
            // Try to parse and convert to DD/MM/YYYY
            const parsedDate = new Date(data.date);
            if (!isNaN(parsedDate.getTime())) {
              processedDate = parsedDate.toLocaleDateString('en-GB');
            }
          }
        } else if (data.date instanceof Date) {
          processedDate = data.date.toLocaleDateString('en-GB');
        }
      }


      return {
        amount: amount,
        type: data.type,
        category: categoryId,
        description: data.description || data.merchantName || "Voice transaction",
        merchantName: data.merchantName || "",
        date: processedDate,
      };
    } catch (parseError) {
      throw new Error("Could not process voice input");
    }
  } catch (error) {
    // Handle specific API errors
    if (error.status === 503 || error.message.includes('Service Unavailable')) {
      throw new Error("AI service is temporarily unavailable. Please try again in a few minutes.");
    } else if (error.status === 429 || error.message.includes('quota')) {
      throw new Error("AI service quota exceeded. Please try again later.");
    } else if (error.message.includes('API key')) {
      throw new Error("AI service configuration error. Please contact support.");
    } else {
      throw new Error("Failed to process voice input. Please try again.");
    }
  }
}

export async function scanReceipt({ base64, mimeType }) {
  try {
    // Validate input parameters
    if (!base64 || !mimeType) {
      throw new Error("Missing required parameters: base64 and mimeType are required");
    }

    if (!mimeType.startsWith('image/')) {
      throw new Error("Invalid file type. Only image files are supported");
    }
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Base64 string is already provided from client
    const base64String = base64;

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format. The receipt may be in English, Hindi, or other regional languages.
      
      CRITICAL: You must extract ALL of these fields accurately:
      - amount: Total amount (just the number, no currency symbols)
      - date: Date in DD/MM/YYYY format - Look for "Date:", "Bill Date:", or similar labels
      - description: Brief description of items purchased or transaction
      - merchantName: Store/merchant name
      - category: Must be one of these exact category IDs: salary,freelance,investments,business,rental,other-income,housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense
      
      DATE EXTRACTION RULES:
      - Look for date formats like: DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD
      - Common date labels: "Date:", "Bill Date:", "Invoice Date:", "Receipt Date:"
      - IMPORTANT: Always return date in DD/MM/YYYY format
      - If you see "11/12/2016", return "11/12/2016" (keep as DD/MM/YYYY)
      - If you see "2016-12-11", return "11/12/2016" (convert to DD/MM/YYYY)
      - If date is not found or unclear, use today's date in DD/MM/YYYY format
      
      CATEGORY MAPPING RULES (MUST follow these exactly):
      - Food items, restaurants, cafes, dining, hotels, meals → "food"
      - Grocery stores, supermarkets, vegetables, fruits → "groceries"
      - Gas stations, fuel, public transport, taxi, uber → "transportation"
      - Rent, mortgage, home maintenance, property → "housing"
      - Electricity, water, internet, phone bills → "utilities"
      - Movies, games, streaming, entertainment → "entertainment"
      - Clothing, electronics, general shopping, retail → "shopping"
      - Medical, pharmacy, health, hospital → "healthcare"
      - School, courses, books, education → "education"
      - Gym, salon, personal care, beauty → "personal"
      - Hotels, flights, travel, tourism → "travel"
      - Insurance payments → "insurance"
      - Gifts, donations → "gifts"
      - Bank fees, service charges, bills → "bills"
      - Everything else → "other-expense"
      
      LANGUAGE SUPPORT:
      - English: "Total", "Amount", "Date", "Store", "Receipt", "Bill Date"
      - Hindi: "कुल", "राशि", "तारीख", "दुकान", "रसीद", "बिल की तारीख"
      - Regional languages: Look for common transaction terms
      
      VALIDATION RULES:
      - Amount must be a positive number (extract only the number)
      - Date should be in the last 30 days or today
      - If date is unclear, use today's date
      - If amount is unclear, return empty object
      - Description should be meaningful (not just "receipt" or "purchase")
      - Category MUST be one of the exact IDs listed above
      
      EXAMPLES:
      - Restaurant receipt with food items → category: "food"
      - Hotel bill with meals (like Hotel Imperial with chicken kabab, rice) → category: "food"
      - Grocery store receipt → category: "groceries"
      - Gas station receipt → category: "transportation"
      - For a receipt with date "11/12/2016" → return "11/12/2016"
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "DD/MM/YYYY",
        "description": "string",
        "merchantName": "string",
        "category": "category-id"
      }

      If it's not a receipt or data is unclear, return an empty object.
      Make sure the category field contains only the exact category ID from the list above.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      
      // Check if it's an empty object (not a receipt)
      if (!data || Object.keys(data).length === 0) {
        throw new Error("This doesn't appear to be a valid receipt");
      }
      
      // Validate required fields
      if (!data.amount || !data.date) {
        throw new Error("Could not extract amount or date from receipt");
      }
      
      // Validate category ID - use exact mapping from categories.js
      const validCategories = [
        // Income categories
        'salary', 'freelance', 'investments', 'business', 'rental', 'other-income',
        // Expense categories
        'housing', 'transportation', 'groceries', 'utilities', 'entertainment',
        'food', 'shopping', 'healthcare', 'education', 'personal', 'travel',
        'insurance', 'gifts', 'bills', 'other-expense'
      ];
      
      const categoryId = validCategories.includes(data.category) ? data.category : 'other-expense';
      
      // Validate amount
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount extracted from receipt");
      }
      
      // Validate amount range (reasonable limits)
      if (amount > 1000000) { // 10 lakh rupees
        throw new Error("Amount seems too high for a receipt");
      }
      
      // Parse date from DD/MM/YYYY format
      let date;
      if (data.date && data.date.includes('/')) {
        const parts = data.date.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          date = new Date(year, month, day);
        } else {
          date = new Date();
        }
      } else {
        date = new Date();
      }
      
      // Ensure description is meaningful
      let description = data.description || data.merchantName || "Receipt purchase";
      if (description.toLowerCase().includes("receipt") && !data.merchantName) {
        description = data.merchantName || "Receipt purchase";
      }
      
      return {
        amount: amount,
        date: data.date, // Return the original DD/MM/YYYY string
        description: description,
        category: categoryId,
        merchantName: data.merchantName || "Unknown merchant",
      };
    } catch (parseError) {
      throw new Error("Invalid response format from AI service");
    }
  } catch (error) {
    // Handle specific API errors
    if (error.status === 503 || error.message.includes('Service Unavailable')) {
      throw new Error("AI service is temporarily unavailable. Please try again in a few minutes.");
    } else if (error.status === 429 || error.message.includes('quota') || error.message.includes('RATE_LIMIT')) {
      throw new Error("AI service quota exceeded. Please try again later.");
    } else if (error.message.includes('API key') || error.message.includes('INVALID_ARGUMENT')) {
      throw new Error("AI service configuration error. Please contact support.");
    } else if (error.message.includes('JSON') || error.message.includes('parse')) {
      throw new Error("AI response format error. Please try a different image.");
    } else if (error.message.includes('image') || error.message.includes('base64')) {
      throw new Error("Image processing failed. Please try a clearer image.");
    } else {
      throw new Error(`Failed to scan receipt: ${error.message}`);
    }
  }
}


export async function getTransaction(id) {
  try {
    const user = await getAuthenticatedUser();

    const transaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transaction) throw new Error("Transaction not found");

    return serializeAmount(transaction);
  } catch (error) {
    throw new Error(`Failed to get transaction: ${error.message}`);
  }
}

export async function updateTransaction(id, data) {
  try {
    const user = await getAuthenticatedUser();

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Check if account has sufficient balance for expense transactions
    if (data.type === "EXPENSE") {
      const currentBalance = originalTransaction.account.balance.toNumber();
      const minimumBalance = originalTransaction.account.minimumBalance.toNumber();
      const projectedBalance = currentBalance + netBalanceChange;
      const availableBalance = currentBalance - minimumBalance;
      
      if (projectedBalance < 0) {
        throw new Error(`Insufficient funds. Available balance: ₨ ${currentBalance.toFixed(2)}, Required: ₨ ${data.amount.toFixed(2)}`);
      }
      
      if (projectedBalance < minimumBalance) {
        throw new Error(`Cannot go below minimum balance. Available for spending: ₨ ${availableBalance.toFixed(2)}, Required: ₨ ${data.amount.toFixed(2)}, Minimum to maintain: ₨ ${minimumBalance.toFixed(2)}`);
      }
    }

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}