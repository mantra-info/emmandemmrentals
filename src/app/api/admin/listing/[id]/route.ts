import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(adminAuthOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Listing ID is required" },
                { status: 400 }
            );
        }

        // Delete the listing (images will cascade delete)
        await prisma.listing.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Listing deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete listing error:", error);
        return NextResponse.json(
            { error: "Failed to delete listing" },
            { status: 500 }
        );
    }
}
