"use client";

import { useEffect, useState } from "react";
import { supabase, type Service, type Stylist } from "@/lib/supabase";
import { normalizeServices } from "@/lib/normalize-service";
import {
  SERVICE_CATEGORY_IDS,
  SERVICE_CATEGORY_LABELS,
  type ServiceCategoryId,
} from "@/lib/service-categories";
import { insertDefaultWorkingHoursForStylist } from "@/lib/default-working-hours";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  adminCard,
  adminGhostBtnSm,
  adminInput,
  adminLabel,
  adminMuted,
  adminPrimaryBtn,
  adminPrimaryBtnSm,
} from "@/lib/admin-ui-classes";

export function AdminStylists() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSpecialties, setNewSpecialties] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSpecialties, setEditSpecialties] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    const [stRes, svRes] = await Promise.all([
      supabase.from("stylists").select("*").order("name"),
      supabase.from("services").select("*").order("category").order("sort_order"),
    ]);
    setStylists((stRes.data as Stylist[]) ?? []);
    setServices(normalizeServices(svRes.data));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const loadStylistServices = async (stylistId: string) => {
    const { data } = await supabase
      .from("stylist_services")
      .select("service_id")
      .eq("stylist_id", stylistId);
    setSelectedServiceIds(new Set((data ?? []).map((r) => r.service_id)));
  };

  const startEdit = async (s: Stylist) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditPhone(s.phone ?? "");
    setEditEmail(s.email ?? "");
    setEditSpecialties(s.specialties?.join(", ") ?? "");
    await loadStylistServices(s.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedServiceIds(new Set());
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  const saveStylistLinks = async (stylistId: string) => {
    await supabase.from("stylist_services").delete().eq("stylist_id", stylistId);
    const rows = [...selectedServiceIds].map((service_id) => ({ stylist_id: stylistId, service_id }));
    if (rows.length > 0) {
      await supabase.from("stylist_services").insert(rows);
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const specs = editSpecialties
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const { error } = await supabase
      .from("stylists")
      .update({
        name: editName.trim(),
        phone: editPhone.trim() || null,
        email: editEmail.trim() || null,
        specialties: specs.length ? specs : null,
      })
      .eq("id", editingId);
    if (error) return;
    await saveStylistLinks(editingId);
    cancelEdit();
    load();
  };

  const addStylist = async () => {
    if (!newName.trim()) return;
    const specs = newSpecialties
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const { data, error } = await supabase
      .from("stylists")
      .insert({
        name: newName.trim(),
        phone: newPhone.trim() || null,
        email: newEmail.trim() || null,
        specialties: specs.length ? specs : null,
        is_active: true,
      })
      .select("id")
      .single();
    if (error || !data) return;
    await insertDefaultWorkingHoursForStylist(data.id);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewSpecialties("");
    load();
  };

  const setStylistActive = async (s: Stylist, is_active: boolean) => {
    await supabase.from("stylists").update({ is_active }).eq("id", s.id);
    load();
  };

  const servicesByCategory = SERVICE_CATEGORY_IDS.map((cat) => ({
    cat,
    items: services.filter((s) => s.category === cat),
  }));

  return (
    <div className="space-y-10">
      <Card className={cn(adminCard)}>
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div>
            <h2 className="font-be text-xl font-semibold tracking-wide text-white sm:text-2xl">
              Add team member
            </h2>
            <p className={`${adminMuted} mt-2 max-w-2xl`}>
              New staff get default opening hours (Mon–Fri 9–19, Sat 9–18, Sun 10–17). Assign
              services after creating them, then edit this person to choose which services they
              perform.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={adminLabel}>Name *</label>
              <input className={adminInput} value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label className={adminLabel}>Phone</label>
              <input className={adminInput} value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
            <div>
              <label className={adminLabel}>Email</label>
              <input className={adminInput} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div>
              <label className={adminLabel}>Specialties (comma-separated)</label>
              <input
                className={adminInput}
                value={newSpecialties}
                onChange={(e) => setNewSpecialties(e.target.value)}
                placeholder="e.g. Fades, Color"
              />
            </div>
          </div>
          <button type="button" onClick={addStylist} className={adminPrimaryBtn}>
            Add staff
          </button>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-be mb-5 text-xl font-semibold tracking-wide text-white sm:text-2xl">
          Team & services they offer
        </h2>
        {loading ? (
          <p className={adminMuted}>Loading…</p>
        ) : (
          <div className="space-y-3">
            {stylists.map((s) => (
              <Card key={s.id} className={cn(adminCard)}>
                <CardContent className="p-5 sm:p-6">
                  {editingId === s.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input className={adminInput} value={editName} onChange={(e) => setEditName(e.target.value)} />
                        <input
                          className={adminInput}
                          placeholder="Phone"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                        <input
                          className={adminInput}
                          placeholder="Email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                        <input
                          className={adminInput}
                          placeholder="Specialties, comma-separated"
                          value={editSpecialties}
                          onChange={(e) => setEditSpecialties(e.target.value)}
                        />
                      </div>
                      <div className="no-scrollbar max-h-[50vh] space-y-4 overflow-y-auto pr-1">
                        {servicesByCategory.map(({ cat, items }) =>
                          items.length === 0 ? null : (
                            <div key={cat}>
                              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ede583]/90">
                                {SERVICE_CATEGORY_LABELS[cat as ServiceCategoryId].en}
                              </div>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {items.map((svc) => (
                                  <label
                                    key={svc.id}
                                    className="flex cursor-pointer items-start gap-2.5 text-sm text-[#c4bcb0]"
                                  >
                                    <input
                                      type="checkbox"
                                      className="mt-0.5 h-4 w-4 rounded border-[#333] bg-[#080808] text-[#ab832e] focus:ring-[#ab832e]/40"
                                      checked={selectedServiceIds.has(svc.id)}
                                      onChange={() => toggleService(svc.id)}
                                    />
                                    <span>
                                      {svc.name}{" "}
                                      <span className="text-[#5c574f]">
                                        ({svc.duration_minutes}m · {svc.price}€)
                                      </span>
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={saveEdit} className={adminPrimaryBtnSm}>
                          Save
                        </button>
                        <button type="button" onClick={cancelEdit} className={adminGhostBtnSm}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#f5f0e8]">{s.name}</span>
                          {!s.is_active && (
                            <span className="text-xs text-red-400/90">Hidden</span>
                          )}
                        </div>
                        {s.specialties && s.specialties.length > 0 && (
                          <p className={`${adminMuted} mt-1`}>{s.specialties.join(" · ")}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => startEdit(s)} className={adminGhostBtnSm}>
                          Edit & services
                        </button>
                        {s.is_active ? (
                          <button
                            type="button"
                            className={adminGhostBtnSm}
                            onClick={() => setStylistActive(s, false)}
                          >
                            Hide
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={adminGhostBtnSm}
                            onClick={() => setStylistActive(s, true)}
                          >
                            Show
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
