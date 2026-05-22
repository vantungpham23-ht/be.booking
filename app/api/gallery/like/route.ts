import { NextResponse } from "next/server";
import { createSupabaseAdmin, isSupabaseServiceConfigured } from "@/lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/gallery/like - Toggle like (like if not liked, unlike if liked)
export async function POST(req: Request) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  let body: {
    gallery_item_id?: string;
    visitor_id?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const galleryItemId = body.gallery_item_id?.trim() || "";
  const visitorId = body.visitor_id?.trim() || "";

  if (!UUID_RE.test(galleryItemId)) {
    return NextResponse.json({ error: "Invalid gallery_item_id" }, { status: 400 });
  }

  if (!visitorId || visitorId.length < 8) {
    return NextResponse.json({ error: "Invalid visitor_id" }, { status: 400 });
  }

  let admin;
  try {
    admin = createSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Config error" }, { status: 503 });
  }

  try {
    // Check if already liked
    const { data: existingLike } = await admin
      .from("gallery_likes")
      .select("id")
      .eq("gallery_item_id", galleryItemId)
      .eq("visitor_id", visitorId)
      .maybeSingle();

    if (existingLike) {
      // Unlike: Remove the like (trigger will decrement count)
      await admin
        .from("gallery_likes")
        .delete()
        .eq("id", existingLike.id);

      // Get updated like count
      const { data: item } = await admin
        .from("gallery_items")
        .select("like_count")
        .eq("id", galleryItemId)
        .single();

      return NextResponse.json({ 
        liked: false, 
        like_count: item?.like_count || 0 
      });
    } else {
      // Like: Add new like (trigger will increment count)
      await admin
        .from("gallery_likes")
        .insert({
          gallery_item_id: galleryItemId,
          visitor_id: visitorId,
        });

      // Get updated like count
      const { data: item } = await admin
        .from("gallery_items")
        .select("like_count")
        .eq("id", galleryItemId)
        .single();

      return NextResponse.json({ 
        liked: true, 
        like_count: item?.like_count || 0 
      });
    }
  } catch (e) {
    console.error("[api/gallery/like] error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET /api/gallery/like - Check if user has liked items
export async function GET(req: Request) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const visitorId = searchParams.get("visitor_id");

  if (!visitorId || visitorId.length < 8) {
    return NextResponse.json({ error: "Invalid visitor_id" }, { status: 400 });
  }

  let admin;
  try {
    admin = createSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Config error" }, { status: 503 });
  }

  try {
    const { data: likes } = await admin
      .from("gallery_likes")
      .select("gallery_item_id")
      .eq("visitor_id", visitorId);

    const likedIds = (likes || []).map((l: { gallery_item_id: string }) => l.gallery_item_id);

    return NextResponse.json({ liked_ids: likedIds });
  } catch (e) {
    console.error("[api/gallery/like] GET error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
