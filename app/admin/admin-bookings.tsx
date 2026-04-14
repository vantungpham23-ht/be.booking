"use client";

import { useState, useEffect } from "react";
import { supabase, type Booking, type Service, type Stylist } from "@/lib/supabase";
import { normalizeService } from "@/lib/normalize-service";
import { Calendar, Clock, User, Phone, Mail, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  adminCard,
  adminCardHover,
  adminInput,
  adminMuted,
  adminPrimaryBtn,
  adminTabBar,
  adminTabButton,
} from "@/lib/admin-ui-classes";

export function AdminBookings() {
  const [bookings, setBookings] = useState<
    (Booking & { service?: Service; stylist?: Stylist })[]
  >([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "completed" | "cancelled"
  >("all");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [filter, selectedDate]);

  const fetchBookings = async () => {
    setLoading(true);

    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        service:services(*),
        stylist:stylists(*)
      `
      )
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    if (selectedDate) {
      query = query.eq("booking_date", selectedDate);
    }

    const { data } = await query;

    if (data) {
      setBookings(
        (data as (Booking & { service?: unknown; stylist?: Stylist })[]).map((b) => ({
          ...b,
          service: b.service ? normalizeService(b.service) : undefined,
        })) as (Booking & { service?: Service; stylist?: Stylist })[]
      );
    }
    setLoading(false);
  };

  const updateBookingStatus = async (id: string, status: Booking["status"]) => {
    setActionError("");
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);

    if (error) {
      setActionError(error.message);
      console.error("[AdminBookings] update status", error.message);
      return;
    }
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "confirmed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    revenue: bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + Number(b.service?.price ?? 0), 0),
  };

  return (
    <>
      {actionError ? (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-500/35 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200/95"
        >
          <p className="font-medium">Could not update booking</p>
          <p className="mt-1 break-words text-xs opacity-90">{actionError}</p>
          <p className="mt-2 text-xs text-[#b0a898]">
            If you see “permission” or RLS: run the latest SQL from{" "}
            <code className="rounded bg-black/30 px-1">supabase-run-on-supabase-dashboard.sql</code> and
            ensure the admin User UID in Supabase matches the UUID used in those policies (same as{" "}
            <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_ALLOWED_ADMIN_USER_ID</code>).
          </p>
        </div>
      ) : null}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card className={cn(adminCard)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a8275]">
              Total bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-be text-3xl font-semibold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className={cn(adminCard)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-200/80">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-be text-3xl font-semibold text-white">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className={cn(adminCard)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium uppercase tracking-[0.2em] text-sky-300/85">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-be text-3xl font-semibold text-white">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card className={cn(adminCard)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300/85">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-be text-3xl font-semibold text-white">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className={cn(adminCard)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#b0a898]">
              Revenue (completed)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-be text-3xl font-semibold be-gold-text">{stats.revenue}€</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className={adminTabBar}>
          {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={cn(adminTabButton(filter === status), "capitalize")}
            >
              {status}
            </button>
          ))}
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={cn(adminInput, "w-full max-w-[220px] [color-scheme:dark]")}
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className={`${adminMuted} py-14 text-center text-sm`}>Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className={`${adminMuted} py-14 text-center text-sm`}>No bookings for this filter.</div>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className={cn(adminCard, adminCardHover)}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 shrink-0 text-[#6b655c]" />
                        <span className="font-semibold text-[#f5f0e8]">{booking.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#9a9285]">
                        <Phone className="h-4 w-4 shrink-0" />
                        {booking.customer_phone}
                      </div>
                      {booking.customer_email && (
                        <div className="flex items-center gap-2 text-sm text-[#9a9285]">
                          <Mail className="h-4 w-4 shrink-0" />
                          {booking.customer_email}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#ede583]">{booking.service?.name}</span>
                        <span className="text-[#4a4540]">•</span>
                        <span className="text-[#b0a898]">{booking.service?.price}€</span>
                      </div>
                      <div className="text-[#8a8275]">with {booking.stylist?.name}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#8a8275]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#6b655c]" />
                        {formatDate(booking.booking_date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#6b655c]" />
                        {booking.start_time.substring(0, 5)} – {booking.end_time.substring(0, 5)}
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="text-sm italic text-[#6b655c]">Note: {booking.notes}</div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>

                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 transition-colors hover:bg-emerald-500/20"
                          title="Confirm"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          className="rounded-xl bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {booking.status === "confirmed" && (
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(booking.id, "completed")}
                        className={`${adminPrimaryBtn} py-2.5`}
                      >
                        Mark complete
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
