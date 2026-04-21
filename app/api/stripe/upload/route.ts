import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getS3() {
  return new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export async function POST(req: NextRequest) {
  // Verify the requester is an authenticated reviewer
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, fileType } = await req.json();

  if (!fileName || !fileType) {
    return NextResponse.json({ error: "fileName and fileType required" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "video/mp4", "video/quicktime", "video/webm",
  ];
  if (!allowedTypes.includes(fileType)) {
    return NextResponse.json({ error: "File type not allowed." }, { status: 400 });
  }

  const ext = fileName.split(".").pop();
  const key = `recommendations/${user.id}/${Date.now()}.${ext}`;

  const s3 = getS3();

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: fileType,
    // Make uploaded files publicly readable
    ACL: "public-read",
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

  const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? "us-east-1"}.amazonaws.com/${key}`;

  return NextResponse.json({ presignedUrl, publicUrl, key });
}