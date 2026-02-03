import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

// PUT /api/friends/[id] - Accept or decline friend request
export async function PUT(request, { params }) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { action } = await request.json(); // "accept" or "decline"

    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'accept' or 'decline'" }, { status: 400 });
    }

    // Find the friendship request
    const friendship = await db.friendship.findFirst({
      where: {
        id,
        addresseeId: user.id, // Only the addressee can accept/decline
        status: "PENDING"
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, imageUrl: true }
        }
      }
    });

    if (!friendship) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
    }

    // Update the friendship status
    const updatedFriendship = await db.friendship.update({
      where: { id },
      data: {
        status: action === "accept" ? "ACCEPTED" : "DECLINED"
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

    return NextResponse.json({
      message: `Friend request ${action}ed successfully`,
      friendship: updatedFriendship
    });

  } catch (error) {
    console.error("Error updating friend request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/friends/[id] - Remove friend or cancel friend request
export async function DELETE(request, { params }) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Find the friendship
    const friendship = await db.friendship.findFirst({
      where: {
        id,
        OR: [
          { requesterId: user.id },
          { addresseeId: user.id }
        ]
      }
    });

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    // Delete the friendship
    await db.friendship.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Friendship removed successfully"
    });

  } catch (error) {
    console.error("Error removing friendship:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
