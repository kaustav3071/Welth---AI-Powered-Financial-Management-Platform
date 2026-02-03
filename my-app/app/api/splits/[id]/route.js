import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { SplitStatus } from "@prisma/client";

// PUT /api/splits/[id] - Approve or decline split request
export async function PUT(request, { params }) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { action, accountId } = await request.json();
    
    if (!action || !["approve", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'decline'" }, { status: 400 });
    }

    // Find the split participant
    const participant = await db.splitParticipant.findFirst({
      where: {
        splitRequestId: id,
        userId: user.id
      },
      include: {
        splitRequest: {
          include: {
            participants: true
          }
        }
      }
    });

    if (!participant) {
      return NextResponse.json({ error: "Split request not found or already processed" }, { status: 404 });
    }

    // Check if participant is still pending
    if (participant.status !== SplitStatus.PENDING) {
      return NextResponse.json({ 
        error: `Split request has already been ${participant.status.toLowerCase()}` 
      }, { status: 400 });
    }

    if (action === "approve") {
      if (!accountId) {
        return NextResponse.json({ error: "Account ID is required for approval" }, { status: 400 });
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

      // Check if user has sufficient balance
      const accountBalance = parseFloat(account.balance);
      const participantAmount = parseFloat(participant.amount);
      const minimumBalance = parseFloat(account.minimumBalance);
      
      if (accountBalance < participantAmount) {
        return NextResponse.json({ 
          error: `Insufficient balance. Available: ₹${accountBalance.toFixed(2)}, Required: ₹${participantAmount.toFixed(2)}` 
        }, { status: 400 });
      }

      // Check if balance will go below minimum after deduction
      const balanceAfterDeduction = accountBalance - participantAmount;
      if (balanceAfterDeduction < minimumBalance) {
        return NextResponse.json({ 
          error: `This transaction will make your balance (₹${balanceAfterDeduction.toFixed(2)}) go below the minimum required balance (₹${minimumBalance.toFixed(2)}). Please select another account.` 
        }, { status: 400 });
      }

      // Update participant status and deduct amount
      await db.$transaction(async (tx) => {
        // Update participant status
        await tx.splitParticipant.update({
          where: { id: participant.id },
          data: {
            status: SplitStatus.APPROVED,
            accountId,
            approvedAt: new Date()
          }
        });

        // Deduct amount from user's account
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              decrement: participant.amount
            }
          }
        });

        // Create transaction record for the participant
        await tx.transaction.create({
          data: {
            type: "EXPENSE",
            amount: participant.amount,
            description: `Split: ${participant.splitRequest.description}`,
            date: participant.splitRequest.date,
            category: participant.splitRequest.category,
            userId: user.id,
            accountId: accountId,
            status: "COMPLETED"
          }
        });
      });

      // Check if all participants have approved
      const allParticipants = await db.splitParticipant.findMany({
        where: { splitRequestId: id }
      });

      const allApproved = allParticipants.every(p => p.status === "APPROVED");
      
      if (allApproved) {
        // All friends approved - mark as completed
        await db.splitRequest.update({
          where: { id },
          data: { status: "COMPLETED" }
        });
      }

    } else {
      // Decline the request
      await db.splitParticipant.update({
        where: { id: participant.id },
        data: { status: SplitStatus.DECLINED }
      });
    }

    return NextResponse.json({
      message: `Split request ${action}d successfully`
    });

  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE /api/splits/[id] - Cancel split request (only by requester)
export async function DELETE(request, { params }) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

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

    // Only allow cancellation if not completed
    if (splitRequest.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot cancel completed split request" }, { status: 400 });
    }

    // Refund the requester's amount
    await db.$transaction(async (tx) => {
      // Refund the requester's amount
      await tx.account.update({
        where: { id: splitRequest.requesterAccountId },
        data: {
          balance: {
            increment: splitRequest.splitAmount
          }
        }
      });

      // Update split request status
      await tx.splitRequest.update({
        where: { id },
        data: { status: "CANCELLED" }
      });

      // Delete the pending transaction
      await tx.transaction.deleteMany({
        where: {
          userId: user.id,
          description: `Split: ${splitRequest.description}`,
          status: "COMPLETED"
        }
      });
    });

    return NextResponse.json({
      message: "Split request cancelled successfully"
    });

  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
