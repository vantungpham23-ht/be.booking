import { NextResponse } from "next/server";
import { createSupabaseAdmin, isSupabaseServiceConfigured } from "@/lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/gallery/manage - Get all gallery items (admin)
export async function GET(req: Request) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  let admin;
  try {
    admin = createSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Config error" }, { status: 503 });
  }

  try {
    const { data: items, error } = await admin
      .from("gallery_items")
      .select(`
        *,
        stylist:stylists(id, name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[api/gallery/manage] GET", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = (items || []).map((item: Record<string, unknown>) => ({
      id: item.id,
      image_url: item.image_url,
      thumbnail_url: item.thumbnail_url,
      stylist_id: item.stylist_id,
      stylist_name: (item.stylist as { name?: string } | null)?.name || null,
      title: item.title,
      description: item.description,
      week_number: item.week_number,
      year: item.year,
      like_count: item.like_count,
      is_featured: item.is_featured,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return NextResponse.json({ items: result });
  } catch (e) {
    console.error("[api/gallery/manage] error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PUT /api/gallery/manage - Update gallery item (admin)
export async function PUT(req: Request) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  let body: {
    id?: string;
    image_url?: string;
    thumbnail_url?: string;
    stylist_id?: string | null;
    title?: string | null;
    description?: string | null;
    week_number?: number;
    year?: number;
    is_featured?: boolean;
    is_active?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || !UUID_RE.test(body.id)) {
    return NextResponse.json({ error: "Invalid or missing id" }, { status: 400 });
  }

  let admin;
  try {
    admin = createSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Config error" }, { status: 503 });
  }

  try {
    const updateData: Record<string, unknown> = {};
    
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url;
    if (body.stylist_id !== undefined) updateData.stylist_id = body.stylist_id;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.week_number !== undefined) updateData.week_number = body.week_number;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await admin
      .from("gallery_items")
      .update(updateData)
      .eq("id", body.id)
      .select(`
        *,
        stylist:stylists(id, name)
      `)
      .single();

    if (error) {
      console.error("[api/gallery/manage] PUT", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      item: {
        ...data,
        stylist_name: (data.stylist as { name?: string } | null)?.name || null,
      }
    });
  } catch (e) {
    console.error("[api/gallery/manage] PUT error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE /api/gallery/manage?id=xxx - Delete gallery item (admin)
export async function DELETE(req: Request) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid or missing id" }, { status: 400 });
  }

  let admin;
  try {
    admin = createSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Config error" }, { status: 503 });
  }

  try {
    const { error } = await admin
      .from("gallery_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[api/gallery/manage] DELETE", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/gallery/manage] DELETE error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
