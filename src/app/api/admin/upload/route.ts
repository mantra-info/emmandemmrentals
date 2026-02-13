import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";

const sanitizeBaseName = (name: string) =>
    name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "image";

const uploadToCloudinary = async (buffer: Buffer, filename: string) => {
    const cloudinary = getCloudinary();
    const baseName = sanitizeBaseName(filename);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const publicId = `${baseName}-${uniqueSuffix}`;

    return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "emm/listings",
                public_id: publicId,
                resource_type: "image",
                overwrite: false,
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error("Cloudinary upload failed"));
                    return;
                }
                resolve({ secure_url: result.secure_url, public_id: result.public_id });
            }
        );
        stream.end(buffer);
    });
};

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(adminAuthOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "No files provided" },
                { status: 400 }
            );
        }

        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const result = await uploadToCloudinary(buffer, file.name);

                return {
                    url: result.secure_url,
                    publicId: result.public_id,
                    name: file.name,
                };
            })
        );

        return NextResponse.json(uploadedFiles);
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}
