import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { SplitStatus } from "@prisma/client";

// POST /api/splits/[id]/resolve - Re-request or pay full amount for rejected splits
export async function POST(request, { params }) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { action, accountId, participantIds } = await request.json();
    
    if (!action || !["re-request", "pay-full", "complete-without-adding"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 're-request', 'pay-full', or 'complete-without-adding'" }, { status: 400 });
    }

    // Find the split request
    const splitRequest = await db.splitRequest.findFirst({
      where: {
        id,
        requesterId: user.id
      },
      include: {
        participants: true
      }
    });

    if (!splitRequest) {
      return NextResponse.json({ error: "Split request not found" }, { status: 404 });
    }

    if (action === "re-request") {
      // Get declined participants
      let declinedParticipants = splitRequest.participants.filter(p => p.status === "DECLINED");
      
      // If specific participant IDs provided, filter to only those
      if (participantIds && participantIds.length > 0) {
        declinedParticipants = declinedParticipants.filter(p => participantIds.includes(p.id));
      }
      
      if (declinedParticipants.length === 0) {
        return NextResponse.json({ 
          error: "No declined participants to re-request" 
        }, { status: 400 });
      }

      // Reset declined participants to pending
      await db.splitParticipant.updateMany({
        where: {
          id: { in: declinedParticipants.map(p => p.id) }
        },
        data: {
          status: "PENDING",
          accountId: null,
          approvedAt: null
        }
      });

      // Update split request status back to pending
      await db.splitRequest.update({
        where: { id },
        data: { status: "PENDING" }
      });

      return NextResponse.json({
        message: `Split request re-sent to ${declinedParticipants.length} friend(s) successfully`
      });

    } else if (action === "pay-full") {
      if (!accountId) {
        return NextResponse.json({ error: "Account ID is required for paying full amount" }, { status: 400 });
      }

      // Validate that the account belongs to the user
      const account = await db.account.findFirst({
        where: {
          id: accountId,
          userId: user.id
        }
      });

      if (!account) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }

      // Calculate the rejected amount (amount that was declined)
      const declinedParticipants = splitRequest.participants.filter(p => p.status === "DECLINED");
      const rejectedAmount = declinedParticipants.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      if (rejectedAmount === 0) {
        return NextResponse.json({ 
          error: "No rejected amounts to pay" 
        }, { status: 400 });
      }

      // Check if user has sufficient balance
      const accountBalance = parseFloat(account.balance);
      const minimumBalance = parseFloat(account.minimumBalance);
      
      if (accountBalance < rejectedAmount) {
        return NextResponse.json({ 
          error: `Insufficient balance. Available: ₹${accountBalance.toFixed(2)}, Required: ₹${rejectedAmount.toFixed(2)}` 
        }, { status: 400 });
      }

      // Check if balance will go below minimum after deduction
      const balanceAfterDeduction = accountBalance - rejectedAmount;
      if (balanceAfterDeduction < minimumBalance) {
        return NextResponse.json({ 
          error: `This transaction will make your balance (₹${balanceAfterDeduction.toFixed(2)}) go below the minimum required balance (₹${minimumBalance.toFixed(2)}). Please select another account.` 
        }, { status: 400 });
      }

      // Deduct the rejected amount and mark as completed
      await db.$transaction(async (tx) => {
        // Deduct the rejected amount from user's account
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              decrement: rejectedAmount
            }
          }
        });

        // Create transaction record for the rejected amount
        await tx.transaction.create({
          data: {
            type: "EXPENSE",
            amount: rejectedAmount,
            description: `Split (rejected portion): ${splitRequest.description}`,
            date: splitRequest.date,
            category: splitRequest.category,
            userId: user.id,
            accountId: accountId,
            status: "COMPLETED"
          }
        });

        // Update split request status to completed
        await tx.splitRequest.update({
          where: { id },
          data: { status: "COMPLETED" }
        });
      });

      return NextResponse.json({
        message: `You have paid the full amount (₹${rejectedAmount.toFixed(2)}). Split request completed.`
      });
    }

    if (action === "complete-without-adding") {
      // Mark the split as completed without adding any transaction to user's account
      await db.splitRequest.update({
        where: { id },
        data: {
          status: SplitStatus.COMPLETED,
          userPaidFull: true
        }
      });

      return NextResponse.json({
        message: "Split request completed without adding transaction to your account."
      });
    }

  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
