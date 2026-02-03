import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { SplitStatus } from "@prisma/client";

// GET /api/splits - Get all split requests for the user
export async function GET() {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get split requests created by user
    const createdSplits = await db.splitRequest.findMany({
      where: { requesterId: user.id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, imageUrl: true }
            },
            account: {
              select: { id: true, name: true }
            }
          }
        },
        requesterAccount: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Get split requests where user is a participant
    const participantSplits = await db.splitRequest.findMany({
      where: {
        participants: {
          some: { userId: user.id }
        }
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, imageUrl: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, imageUrl: true }
            },
            account: {
              select: { id: true, name: true }
            }
          }
        },
        requesterAccount: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      createdSplits,
      participantSplits,
      currentUserId: user.id
    });

  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST /api/splits - Create a new split request
export async function POST(request) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      totalAmount,
      requesterShare,
      description,
      category,
      date,
      requesterAccountId,
      participants // Array of { userId, amount }
    } = await request.json();

    // Validate required fields
    if (!totalAmount || !requesterShare || !category || !requesterAccountId || !participants?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate that the account belongs to the user
    const account = await db.account.findFirst({
      where: {
        id: requesterAccountId,
        userId: user.id
      }
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if user has sufficient balance for their share
    if (account.balance < requesterShare) {
      return NextResponse.json({ 
        error: `Insufficient balance. Available: ₹${account.balance}, Required: ₹${requesterShare}` 
      }, { status: 400 });
    }

    // Validate participants
    const participantIds = participants.map(p => p.userId);
    
    const participantUsers = await db.user.findMany({
      where: {
        id: { in: participantIds }
      }
    });

    if (participantUsers.length !== participants.length) {
      return NextResponse.json({ error: "Invalid participants" }, { status: 400 });
    }

    // Check if all participants are friends
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { requesterId: user.id, addresseeId: { in: participantIds }, status: "ACCEPTED" },
          { addresseeId: user.id, requesterId: { in: participantIds }, status: "ACCEPTED" }
        ]
      }
    });

    if (friendships.length !== participants.length) {
      return NextResponse.json({ error: "All participants must be your friends" }, { status: 400 });
    }

    // Create the split request and deduct requester's share
    const splitRequest = await db.$transaction(async (tx) => {
      // Create the split request
      const newSplitRequest = await tx.splitRequest.create({
        data: {
          originalAmount: totalAmount,
          splitAmount: requesterShare,
          description,
          category,
          date: new Date(date),
          requesterId: user.id,
          requesterAccountId,
          status: SplitStatus.PENDING,
          participants: {
            create: participants.map(participant => ({
              userId: participant.userId,
              amount: participant.amount,
              status: SplitStatus.PENDING
            }))
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, email: true, imageUrl: true }
              }
            }
          },
          requesterAccount: {
            select: { id: true, name: true }
          }
        }
      });

      // Deduct the requester's share from their account
      await tx.account.update({
        where: { id: requesterAccountId },
        data: {
          balance: {
            decrement: requesterShare
          }
        }
      });

      // Create a transaction record for the requester
      await tx.transaction.create({
        data: {
          type: "EXPENSE",
          amount: requesterShare,
          description: `Split: ${description}`,
          date: new Date(date),
          category,
          userId: user.id,
          accountId: requesterAccountId,
          status: "COMPLETED"
        }
      });

      return newSplitRequest;
    });

    return NextResponse.json({
      message: "Split request created successfully",
      splitRequest
    });

  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
