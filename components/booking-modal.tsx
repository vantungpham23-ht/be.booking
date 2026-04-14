"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { X, Clock, User, Check } from "lucide-react";
import { supabase, type Service, type Stylist, type TimeSlot } from "@/lib/supabase";
import { normalizeServices } from "@/lib/normalize-service";
import {
  SERVICE_CATEGORY_IDS,
  SERVICE_CATEGORY_LABELS,
  type ServiceCategoryId,
} from "@/lib/service-categories";
import {
  BOOKING_TIMEZONE,
  addCalendarDaysToYmd,
  computeEndTimeFromStartAndDuration,
  formatBookingDateLong,
  formatBookingTimeHm,
  formatBookingWeekdayShort,
  getTodayYmdInBookingTz,
} from "@/lib/booking-time";
import { randomBookingId } from "@/lib/random-booking-id";
import { normalizeSkMobilePhone } from "@/lib/booking-phone";

type BookingStep = "service" | "stylist" | "datetime" | "phone" | "info";

type BookingConfirmation = {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  stylistName: string;
  dateYmd: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  price: number;
  notes: string | null;
};

const STEPS: BookingStep[] = ["service", "stylist", "datetime", "phone", "info"];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "en" | "sk";
}

export function BookingModal({ isOpen, onClose, lang = "en" }: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>("service");
  const [serviceCategory, setServiceCategory] = useState<ServiceCategoryId>("mens");
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  /** Anon has INSERT on bookings but no SELECT — cannot use .select() after insert (RLS). */
  const [submitError, setSubmitError] = useState("");
  const submitInFlight = useRef(false);

  const fetchServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("sort_order")
        .order("name");
      if (error) {
        console.error("[BookingModal]", error.message);
        setServices([]);
        return;
      }
      setServices(normalizeServices(data ?? []));
    } catch (e) {
      console.error("[BookingModal] fetchServices", e);
      setServices([]);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [isOpen]);

  /** Mỗi lần mở modal: form sạch (tránh màn success / bước cũ còn sót). */
  useEffect(() => {
    if (!isOpen) return;
    setStep("service");
    setServiceCategory("mens");
    setSelectedService(null);
    setSelectedStylist(null);
    setSelectedDate("");
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setPhoneError("");
    setBookingSuccess(false);
    setConfirmation(null);
    setSubmitError("");
    setStylists([]);
    setAvailableSlots([]);
    setLoading(false);
    submitInFlight.current = false;
    void fetchServices();
  }, [isOpen, fetchServices]);

  const servicesInCategory = useMemo(
    () => services.filter((s) => s.category === serviceCategory),
    [services, serviceCategory]
  );

  const fetchStylistsForService = async (serviceId: string) => {
    setLoading(true);
    try {
      const { data: links } = await supabase
        .from("stylist_services")
        .select("stylist_id")
        .eq("service_id", serviceId);

      if (!links?.length) {
        setStylists([]);
        return;
      }

      const ids = [...new Set(links.map((l) => l.stylist_id))];
      const { data: stylistRows } = await supabase
        .from("stylists")
        .select("*")
        .in("id", ids)
        .eq("is_active", true)
        .order("name");

      setStylists(stylistRows ?? []);
    } catch (e) {
      console.error("[BookingModal] fetchStylistsForService", e);
      setStylists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (stylistId: string, date: string) => {
    if (!selectedService) return;

    setLoading(true);
    try {
      const { data } = await supabase.rpc("get_available_slots", {
        p_stylist_id: stylistId,
        p_date: date,
        p_duration_minutes: Number(selectedService.duration_minutes) || 0,
      });

      if (data) setAvailableSlots(data);
    } catch (e) {
      console.error("[BookingModal] fetchAvailableSlots", e);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep("stylist");
    fetchStylistsForService(service.id);
  };

  const handleStylistSelect = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setStep("datetime");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (selectedStylist) {
      fetchAvailableSlots(selectedStylist.id, date);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("phone");
  };

  const handlePhoneContinue = () => {
    setPhoneError("");
    const normalized = normalizeSkMobilePhone(customerPhone);
    if (!normalized) {
      setPhoneError(
        lang === "sk"
          ? "Zadajte slovenské mobilné číslo (napr. 0912 345 678 alebo +421 912 345 678)."
          : "Enter a Slovak mobile number (e.g. 0912 345 678 or +421 912 345 678)."
      );
      return;
    }
    setCustomerPhone(normalized);
    setStep("info");
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedStylist || !selectedDate || !selectedTime) return;
    if (!customerName.trim() || !normalizeSkMobilePhone(customerPhone)) return;
    if (submitInFlight.current) return;
    submitInFlight.current = true;

    setLoading(true);
    setSubmitError("");

    const normalizeTime = (t: string) =>
      t.length >= 8 ? t.substring(0, 8) : `${t.substring(0, 5)}:00`;

    try {
      const dur = Number(selectedService.duration_minutes) || 0;
      const endTimeRaw = computeEndTimeFromStartAndDuration(selectedTime, dur);
      const bookingId = randomBookingId();

      let res: Response;
      try {
        res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: bookingId,
            customer_name: customerName.trim(),
            customer_phone: customerPhone,
            service_id: selectedService.id,
            stylist_id: selectedStylist.id,
            booking_date: selectedDate,
            start_time: normalizeTime(selectedTime),
            end_time: normalizeTime(endTimeRaw),
            notes: notes.trim() || null,
            lang,
          }),
        });
      } catch {
        setSubmitError(
          lang === "sk"
            ? "Sieťová chyba. Skúste znova alebo zavolajte do salónu."
            : "Network error. Try again or call the salon."
        );
        submitInFlight.current = false;
        return;
      }

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
      };

      if (!res.ok || !payload.id) {
        setSubmitError(
          payload.error ||
            (lang === "sk"
              ? "Objednávku sa nepodarilo uložiť."
              : "Could not complete your booking.")
        );
        submitInFlight.current = false;
        return;
      }

      setConfirmation({
        id: payload.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone,
        serviceName: selectedService.name,
        stylistName: selectedStylist.name,
        dateYmd: selectedDate,
        startTime: selectedTime,
        endTime: endTimeRaw,
        durationMinutes: dur,
        price: selectedService.price,
        notes: notes.trim() || null,
      });
      setBookingSuccess(true);
    } catch (err) {
      console.error("[BookingModal] submit", err);
      setSubmitError(
        lang === "sk"
          ? "Neočakávaná chyba. Obnovte stránku alebo zavolajte do salónu."
          : "Something went wrong. Refresh the page or call the salon."
      );
    } finally {
      setLoading(false);
      submitInFlight.current = false;
    }
  };

  const resetAndClose = () => {
    setStep("service");
    setServiceCategory("mens");
    setSelectedService(null);
    setSelectedStylist(null);
    setSelectedDate("");
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setPhoneError("");
    setBookingSuccess(false);
    setConfirmation(null);
    setSubmitError("");
    setStylists([]);
    setAvailableSlots([]);
    onClose();
  };

  const getAvailableDates = () => {
    const today = getTodayYmdInBookingTz();
    return Array.from({ length: 14 }, (_, i) => addCalendarDaysToYmd(today, i));
  };

  const formatDateChip = (dateStr: string) => formatBookingWeekdayShort(dateStr, lang);

  if (!isOpen) return null;

  const texts = {
    en: {
      title: "Book appointment",
      selectService: "Choose category & service",
      selectStylist: "Your artist",
      selectDateTime: "Date & time",
      selectPhone: "Your mobile (Slovakia)",
      phoneHint: "Slovak mobile only: 09XX XXX XXX or +421 9XX XXX XXX.",
      phoneContinue: "Continue",
      yourInfo: "Your details",
      back: "Back",
      bookNow: "Confirm booking",
      name: "Full name",
      notesLabel: "Notes",
      notesPlaceholder: "Any requests?",
      success: "You’re booked",
      successMsg: "We’ll confirm with you shortly.",
      successHint: "Screenshot this summary and show it at the salon.",
      successRef: "Booking reference",
      successYourName: "Name",
      successPhone: "Phone",
      successService: "Service",
      successStylist: "Artist",
      successWhen: "Date & time",
      successDuration: "Duration",
      successTotal: "Total",
      successNotes: "Notes",
      successTimezone: `Times: Slovakia (${BOOKING_TIMEZONE})`,
      successClose: "Close",
      timesNote: "Times are in Slovakia (Košice).",
      noStylists: "No team member is assigned to this service yet.",
      availableTimes: "Available times",
      loadingSlots: "Loading…",
      noSlots: "No slots this day",
      noServices: "No services in this category.",
      bookingSaveFailed: "Could not save your booking",
    },
    sk: {
      title: "Objednať sa",
      selectService: "Kategória a služba",
      selectStylist: "Váš špecialista",
      selectDateTime: "Dátum a čas",
      selectPhone: "Váš mobil (Slovensko)",
      phoneHint: "Iba slovenské mobilné číslo: 09XX XXX XXX alebo +421 9XX XXX XXX.",
      phoneContinue: "Pokračovať",
      yourInfo: "Údaje",
      back: "Späť",
      bookNow: "Potvrdiť",
      name: "Meno",
      notesLabel: "Poznámka",
      notesPlaceholder: "Požiadavky?",
      success: "Objednané",
      successMsg: "Čoskoro vás budeme kontaktovať.",
      successHint: "Urobte snímku obrazovky a ukážte ju v salóne.",
      successRef: "Číslo objednávky",
      successYourName: "Meno",
      successPhone: "Telefón",
      successService: "Služba",
      successStylist: "Špecialista",
      successWhen: "Dátum a čas",
      successDuration: "Trvanie",
      successTotal: "Spolu",
      successNotes: "Poznámka",
      successTimezone: `Čas: Slovensko (${BOOKING_TIMEZONE})`,
      successClose: "Zavrieť",
      timesNote: "Časy sú podľa času na Slovensku (Košice).",
      noStylists: "Pre túto službu nie je priradený člen tímu.",
      availableTimes: "Voľné časy",
      loadingSlots: "Načítavam…",
      noSlots: "Žiadne termíny",
      noServices: "V tejto kategórii zatiaľ nič nemáme.",
      bookingSaveFailed: "Objednávku sa nepodarilo uložiť",
    },
  };

  const t = texts[lang];
  const stepIndex = STEPS.indexOf(step);

  const chipBase =
    "min-h-[44px] rounded-lg border text-left transition-colors duration-200 touch-manipulation";
  const chipIdle =
    "border-[#2a2a2a] bg-[#0f0f0f] text-[#f5f0e8] hover:border-[#ab832e]/50 active:border-[#ab832e]";
  const chipActive = "border-[#ab832e] bg-[#ab832e]/15 text-[#ede583] ring-1 ring-[#ab832e]/40";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/85 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={resetAndClose}
      />

      <div
        className="relative z-10 flex h-[100dvh] w-full max-h-[100dvh] flex-col overflow-hidden border-[#222] bg-[#0d0d0d] shadow-2xl sm:h-auto sm:max-h-[min(88dvh,760px)] sm:max-w-lg sm:rounded-2xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — cố định */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#1f1f1f] px-4 py-4 sm:px-6">
          <div>
            <p className="font-be text-[10px] uppercase tracking-[0.35em] text-[#8a8068]">
              Be. Hair &amp; Barber
            </p>
            <h2
              id="booking-modal-title"
              className="font-be text-lg font-semibold tracking-wide text-[#f5f0e8] sm:text-xl"
            >
              {bookingSuccess ? t.success : t.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] text-[#b0a898] transition-colors hover:border-[#ab832e] hover:text-[#ede583]"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        {!bookingSuccess && (
          <div className="shrink-0 border-b border-[#1f1f1f] px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-1">
              {STEPS.map((s, i) => {
                const done = stepIndex > i;
                const active = step === s;
                return (
                  <div key={s} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1.5 w-full min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                          active
                            ? "be-gold-gradient text-[#0a0a0a]"
                            : done
                              ? "border border-[#ab832e]/60 bg-[#ab832e]/10 text-[#ede583]"
                              : "border border-[#2a2a2a] bg-[#141414] text-[#5c5c5c]"
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
                      </div>
                      <span
                        className={`hidden text-[9px] uppercase tracking-wider sm:block truncate w-full text-center ${
                          active ? "text-[#ede583]" : "text-[#6b6b6b]"
                        }`}
                      >
                        {s === "service" && (lang === "sk" ? "Služba" : "Service")}
                        {s === "stylist" && (lang === "sk" ? "Človek" : "Artist")}
                        {s === "datetime" && (lang === "sk" ? "Čas" : "Time")}
                        {s === "phone" && (lang === "sk" ? "Mobil" : "Phone")}
                        {s === "info" && (lang === "sk" ? "Údaje" : "Info")}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`mx-0.5 h-px w-full min-w-[8px] max-w-[24px] shrink ${
                          stepIndex > i ? "bg-[#ab832e]/50" : "bg-[#2a2a2a]"
                        }`}
                        aria-hidden
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Body — cuộn ẩn scrollbar */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar px-4 py-5 sm:px-6 sm:py-6">
          {bookingSuccess && confirmation ? (
            <div className="space-y-6 pb-2">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full be-gold-gradient shadow-lg shadow-black/40">
                  <Check className="h-8 w-8 text-[#0a0a0a]" strokeWidth={2} />
                </div>
                <p className="font-be text-xl text-[#f5f0e8]">{t.success}</p>
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#b0a898]">{t.successMsg}</p>
                <p className="mt-3 max-w-sm text-xs font-medium leading-relaxed text-[#ede583]/90">
                  {t.successHint}
                </p>
              </div>

              <div className="rounded-xl border border-[#ab832e]/35 bg-[#101010] p-4 text-left text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a8068]">
                  {t.successRef}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-[#ede583]">{confirmation.id}</p>

                <div className="mt-4 space-y-2.5 border-t border-[#252018] pt-4">
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#6b655c]">{t.successYourName}</span>
                    <span className="text-right text-[#f5f0e8]">{confirmation.customerName}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#6b655c]">{t.successPhone}</span>
                    <span className="text-right text-[#f5f0e8]">{confirmation.customerPhone}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#6b655c]">{t.successService}</span>
                    <span className="max-w-[60%] text-right font-medium text-[#ede583]">
                      {confirmation.serviceName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#6b655c]">{t.successStylist}</span>
                    <span className="text-right text-[#f5f0e8]">{confirmation.stylistName}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#6b655c]">{t.successWhen}</span>
                    <span className="text-right text-[#f5f0e8]">
                      {formatBookingDateLong(confirmation.dateYmd, lang)}
                      <br />
                      <span className="font-be text-base font-semibold text-[#ede583]">
                        {formatBookingTimeHm(confirmation.startTime)} – {formatBookingTimeHm(confirmation.endTime)}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#6b655c]">{t.successDuration}</span>
                    <span className="text-[#f5f0e8]">{confirmation.durationMinutes} min</span>
                  </div>
                  {confirmation.notes ? (
                    <div className="border-t border-[#252018] pt-3">
                      <span className="text-[#6b655c]">{t.successNotes}</span>
                      <p className="mt-1 text-[#b0a898]">{confirmation.notes}</p>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-[#252018] pt-3 font-be text-lg font-semibold text-[#ede583]">
                    <span>{t.successTotal}</span>
                    <span>{confirmation.price}€</span>
                  </div>
                </div>

                <p className="mt-4 text-center text-[10px] uppercase tracking-[0.15em] text-[#5c574f]">
                  {t.successTimezone}
                </p>
              </div>

              <button
                type="button"
                onClick={resetAndClose}
                className="h-12 w-full rounded-lg be-gold-gradient text-xs font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]"
              >
                {t.successClose}
              </button>
            </div>
          ) : (
            <>
              {step === "service" && (
                <div className="space-y-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8a8068]">
                    {t.selectService}
                  </p>
                  <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto pb-1 px-1">
                    {SERVICE_CATEGORY_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setServiceCategory(id)}
                        className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-medium uppercase tracking-wide transition-colors ${
                          serviceCategory === id
                            ? "be-gold-gradient text-[#0a0a0a]"
                            : "border border-[#333] bg-[#141414] text-[#b0a898] hover:border-[#ab832e]/40"
                        }`}
                      >
                        {SERVICE_CATEGORY_LABELS[id][lang]}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    {servicesInCategory.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#6b6b6b]">{t.noServices}</p>
                    ) : (
                      servicesInCategory.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service)}
                          className={`${chipBase} ${chipIdle} flex w-full items-start justify-between gap-3 p-4 text-left`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-be text-sm font-semibold text-[#f5f0e8]">
                              {service.name}
                            </span>
                            {service.description ? (
                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#8a8068]">
                                {service.description}
                              </p>
                            ) : null}
                            <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#6b6b6b]">
                              <Clock className="h-3 w-3" />
                              {service.duration_minutes} min
                            </span>
                          </div>
                          <span className="shrink-0 font-be text-base font-semibold text-[#ede583]">
                            {service.price}€
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {step === "stylist" && (
                <div className="space-y-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8a8068]">
                    {t.selectStylist}
                  </p>
                  {loading ? (
                    <div className="py-16 text-center text-sm text-[#6b6b6b]">{t.loadingSlots}</div>
                  ) : stylists.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#8a8068]">{t.noStylists}</p>
                  ) : (
                    <div className="space-y-2.5">
                      {stylists.map((stylist) => (
                        <button
                          key={stylist.id}
                          type="button"
                          onClick={() => handleStylistSelect(stylist)}
                          className={`${chipBase} ${chipIdle} flex w-full items-center gap-4 p-4`}
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#141414]">
                            <User className="h-6 w-6 text-[#8a8068]" strokeWidth={1.25} />
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="font-be text-sm font-semibold text-[#f5f0e8]">
                              {stylist.name}
                            </span>
                            {stylist.specialties && stylist.specialties.length > 0 ? (
                              <p className="mt-0.5 text-xs text-[#6b6b6b]">
                                {stylist.specialties.join(" · ")}
                              </p>
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep("service")}
                    className="w-full py-3 text-center text-xs uppercase tracking-[0.2em] text-[#8a8068] hover:text-[#ede583]"
                  >
                    {t.back}
                  </button>
                </div>
              )}

              {step === "datetime" && (
                <div className="space-y-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8a8068]">
                    {t.selectDateTime}
                  </p>
                  <p className="text-[11px] leading-relaxed text-[#5c574f]">{t.timesNote}</p>

                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {getAvailableDates().map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => handleDateSelect(date)}
                        className={`${chipBase} px-2 py-3 text-center text-xs font-medium ${
                          selectedDate === date ? chipActive : chipIdle
                        }`}
                      >
                        {formatDateChip(date)}
                      </button>
                    ))}
                  </div>

                  {selectedDate && (
                    <div>
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#8a8068]">
                        {t.availableTimes}
                      </p>
                      {loading ? (
                        <div className="py-10 text-center text-sm text-[#6b6b6b]">
                          {t.loadingSlots}
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.slot_time}
                              type="button"
                              onClick={() => handleTimeSelect(slot.slot_time)}
                              className={`${chipBase} py-3 text-center text-sm font-medium ${chipIdle}`}
                            >
                              {slot.slot_time.substring(0, 5)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center text-sm text-[#6b6b6b]">
                          {t.noSlots}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep("stylist")}
                    className="w-full py-3 text-center text-xs uppercase tracking-[0.2em] text-[#8a8068] hover:text-[#ede583]"
                  >
                    {t.back}
                  </button>
                </div>
              )}

              {step === "phone" && (
                <form
                  className="space-y-5 pb-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePhoneContinue();
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8a8068]">{t.selectPhone}</p>
                  <p className="text-[11px] leading-relaxed text-[#5c574f]">{t.phoneHint}</p>
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-[#6b6b6b]">
                      {lang === "sk" ? "Mobilné číslo" : "Mobile number"} *
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setPhoneError("");
                      }}
                      placeholder={lang === "sk" ? "napr. 0912 345 678" : "e.g. 0912 345 678"}
                      className="h-12 w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 text-[#f5f0e8] outline-none focus:border-[#ab832e]"
                    />
                  </label>
                  {phoneError ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-500/35 bg-red-500/[0.08] px-3 py-2.5 text-sm text-red-200/95"
                    >
                      {phoneError}
                    </div>
                  ) : null}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneError("");
                        setStep("datetime");
                      }}
                      className="h-12 flex-1 rounded-lg border border-[#333] text-xs font-semibold uppercase tracking-wider text-[#b0a898] transition-colors hover:border-[#ab832e]"
                    >
                      {t.back}
                    </button>
                    <button
                      type="submit"
                      disabled={!customerPhone.trim()}
                      className="h-12 flex-[1.35] rounded-lg be-gold-gradient text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] transition-opacity disabled:opacity-40"
                    >
                      {t.phoneContinue}
                    </button>
                  </div>
                </form>
              )}

              {step === "info" && (
                <form
                  className="space-y-4 pb-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit();
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8a8068]">{t.yourInfo}</p>

                  <label className="block">
                    <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-[#6b6b6b]">
                      {t.name} *
                    </span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-12 w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 text-[#f5f0e8] outline-none transition-colors focus:border-[#ab832e]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-[#6b6b6b]">
                      {t.notesLabel}
                    </span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.notesPlaceholder}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-[#f5f0e8] outline-none focus:border-[#ab832e]"
                    />
                  </label>

                  <div className="rounded-xl border border-[#2a2a2a] bg-[#111] p-4 text-sm">
                    <div className="flex justify-between gap-2 text-[#8a8068]">
                      <span>{lang === "sk" ? "Služba" : "Service"}</span>
                      <span className="max-w-[55%] text-right text-[#f5f0e8]">
                        {selectedService?.name}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between gap-2 text-[#8a8068]">
                      <span>{lang === "sk" ? "Špecialista" : "Artist"}</span>
                      <span className="text-[#f5f0e8]">{selectedStylist?.name}</span>
                    </div>
                    <div className="mt-2 flex justify-between gap-2 text-[#8a8068]">
                      <span>{lang === "sk" ? "Termín" : "When"}</span>
                      <span className="text-right text-[#f5f0e8]">
                        {formatDateChip(selectedDate)} · {selectedTime}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between gap-2 text-[#8a8068]">
                      <span>{lang === "sk" ? "Telefón" : "Phone"}</span>
                      <span className="text-right font-mono text-sm text-[#f5f0e8]">{customerPhone}</span>
                    </div>
                    <div className="mt-3 flex justify-between border-t border-[#2a2a2a] pt-3 font-be text-lg font-semibold text-[#ede583]">
                      <span>{lang === "sk" ? "Spolu" : "Total"}</span>
                      <span>{selectedService?.price}€</span>
                    </div>
                  </div>

                  {submitError ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-500/35 bg-red-500/[0.08] px-3 py-2.5 text-sm text-red-200/95"
                    >
                      <p className="font-medium">{t.bookingSaveFailed}</p>
                      <p className="mt-1 break-words text-xs opacity-90">{submitError}</p>
                    </div>
                  ) : null}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitError("");
                        setStep("phone");
                      }}
                      className="h-12 flex-1 rounded-lg border border-[#333] text-xs font-semibold uppercase tracking-wider text-[#b0a898] transition-colors hover:border-[#ab832e]"
                    >
                      {t.back}
                    </button>
                    <button
                      type="submit"
                      disabled={!customerName.trim() || loading}
                      className="h-12 flex-[1.35] rounded-lg be-gold-gradient text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] transition-opacity disabled:opacity-40"
                    >
                      {loading ? "…" : t.bookNow}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
