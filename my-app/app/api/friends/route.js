import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

// GET /api/friends - Get all friends and pending requests
export async function GET() {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get accepted friends
    const friends = await db.friendship.findMany({
      where: {
        OR: [
          { requesterId: user.id, status: "ACCEPTED" },
          { addresseeId: user.id, status: "ACCEPTED" }
        ]
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, imageUrl: true }
        },
        addressee: {
          select: { id: true, name: true, email: true, imageUrl: true }
        }
      }
    });

    // Get pending friend requests (received)
    const pendingRequests = await db.friendship.findMany({
      where: {
        addresseeId: user.id,
        status: "PENDING"
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, imageUrl: true }
        }
      }
    });

    // Get sent friend requests (pending)
    const sentRequests = await db.friendship.findMany({
      where: {
        requesterId: user.id,
        status: "PENDING"
      },
      include: {
        addressee: {
          select: { id: true, name: true, email: true, imageUrl: true }
        }
      }
    });

    return NextResponse.json({
      friends: friends.map(friendship => ({
        id: friendship.id,
        user: friendship.requesterId === user.id ? friendship.addressee : friendship.requester,
        status: friendship.status,
        createdAt: friendship.createdAt
      })),
      pendingRequests,
      sentRequests
    });

  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/friends - Send friend request
export async function POST(request) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user is trying to add themselves
    if (email === user.email) {
      return NextResponse.json({ error: "Cannot add yourself as a friend" }, { status: 400 });
    }

    // Find the user by email
    const targetUser = await db.user.findUnique({
      where: { email }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if friendship already exists
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { requesterId: user.id, addresseeId: targetUser.id },
          { requesterId: targetUser.id, addresseeId: user.id }
        ]
      }
    });

    if (existingFriendship) {
      return NextResponse.json({ error: "Friend request already exists" }, { status: 400 });
    }

    // Create friend request
    const friendship = await db.friendship.create({
      data: {
        requesterId: user.id,
        addresseeId: targetUser.id,
        status: "PENDING"
      },
      include: {
        addressee: {
          select: { id: true, name: true, email: true, imageUrl: true }
        }
      }
    });

    return NextResponse.json({
      message: "Friend request sent successfully",
      friendship
    });

  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
