import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Lazy — only created when the route is actually called, not at build time
function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getAdmin();
    const formData = await req.formData();

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cityCovered = formData.get("cityCovered") as string;
    const idPhoto = formData.get("idPhoto") as File | null;

    if (!fullName || !email || !password || !cityCovered || !idPhoto) {
      return NextResponse.json(
        { error: "All fields including ID photo are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // 1. Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Upload ID photo
    const fileExt = idPhoto.name.split(".").pop();
    const filePath = `${userId}/id-document.${fileExt}`;
    const arrayBuffer = await idPhoto.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("reviewer-ids")
      .upload(filePath, fileBuffer, {
        contentType: idPhoto.type,
        upsert: true,
      });

    if (uploadError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "ID photo upload failed. Please try again." },
        { status: 500 }
      );
    }

    // 3. Create reviewer profile
    const { error: profileError } = await supabaseAdmin
      .from("reviewer_profiles")
      .insert({
        id: userId,
        full_name: fullName,
        email,
        city_covered: cityCovered,
        id_photo_url: filePath,
        approved: false,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Failed to create profile. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}