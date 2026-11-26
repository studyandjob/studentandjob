'use client';

import { useState } from 'react';
import { Field, SelectField, TextAreaField, TextField, Toggle, Banner, inputCls } from './FormUI';
import { CLINIC_TYPES, DAYS } from '@/lib/doctor';
import { PROVINCES, parseMapLink } from '@/lib/directory';

/** One clinic / hospital location of a doctor: address, contact, fees, weekly schedule. */
export default function ClinicEditor({ clinic, index, onChange, onRemove, canRemove, cities, areas }) {
  const [note, setNote] = useState('');
  const [locating, setLocating] = useState(false);
  const set = (k, v) => onChange({ ...clinic, [k]: v });
  const cityAreas = areas.filter((a) => a.city_id === clinic.city_id);
  const popular = cities.filter((c) => c.is_popular);
  const others = cities.filter((c) => !c.is_popular).sort((a, b) => a.name.localeCompare(b.name));

  function pickCity(id) {
    const c = cities.find((x) => x.id === id);
    onChange({ ...clinic, city_id: id, area_id: '', province: c?.province && PROVINCES.includes(c.province) ? c.province : clinic.province });
  }

  function fromLink() {
    const found = parseMapLink(clinic.map_link);
    if (!found) return setNote('Is link mein coordinates nahi mile. Google Maps ka poora link paste karein ya neeche khud likhein.');
    setNote(`Coordinates mil gaye: ${found.lat}, ${found.lng}`);
    onChange({ ...clinic, latitude: String(found.lat), longitude: String(found.lng) });
  }

  function myLocation() {
    if (!('geolocation' in navigator)) return setNote('Is browser mein location support nahi hai.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setNote('Aap ki current location bhar di gayi — yeh tab theek hai jab aap clinic mein hon.');
        onChange({ ...clinic, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
      },
      () => {
        setLocating(false);
        setNote('Location nahi mil saki. Browser mein location allow karein ya Maps link use karein.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  const setDay = (key, patch) => set('schedule', { ...clinic.schedule, [key]: { ...clinic.schedule[key], ...patch } });

  return (
    <div className="rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_26px_-18px_rgba(0,0,0,0.3)] md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="text-base font-bold text-gray-900">
          Clinic / Hospital {index + 1}
          {index === 0 && <span className="ml-2 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">Main location</span>}
        </h4>
        {canRemove && (
          <button type="button" onClick={onRemove} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            Hatayein
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Hospital / Clinic ka naam" required value={clinic.clinic_name} onChange={(v) => set('clinic_name', v)} placeholder="e.g. City Care Clinic" />
        <SelectField label="Clinic type" value={clinic.clinic_type} onChange={(v) => set('clinic_type', v)} options={CLINIC_TYPES} placeholder="— type —" />
        <TextAreaField label="Mukammal address" required rows={2} className="md:col-span-2" value={clinic.address} onChange={(v) => set('address', v)} placeholder="Building / road / mohalla" />

        <TextField label="Country" value={clinic.country} onChange={(v) => set('country', v)} />
        <SelectField label="Province" value={clinic.province} onChange={(v) => set('province', v)} options={PROVINCES} />
        <Field label="Shehar" required>
          <select value={clinic.city_id} onChange={(e) => pickCity(e.target.value)} className={inputCls}>
            <option value="">— shehar chunein —</option>
            {popular.length > 0 && (
              <optgroup label="Popular cities">
                {popular.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Baqi cities">
              {others.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
        <SelectField
          label="Area / Locality"
          value={clinic.area_id}
          onChange={(v) => set('area_id', v)}
          options={cityAreas.map((a) => ({ value: a.id, label: a.name }))}
          disabled={cityAreas.length === 0}
          placeholder={cityAreas.length === 0 ? 'Is shehar ke area abhi nahi' : '— optional —'}
        />

        <div className="rounded-2xl border border-line bg-surface p-4 md:col-span-2">
          <p className="mb-3 text-sm font-semibold text-gray-900">Map location (&quot;mere qareeb&quot; search ke liye)</p>
          <TextField label="Google Maps link" value={clinic.map_link} onChange={(v) => set('map_link', v)} placeholder="https://www.google.com/maps/place/.../@29.39,71.68,17z" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <TextField label="GPS Latitude" inputMode="decimal" value={clinic.latitude} onChange={(v) => set('latitude', v)} placeholder="29.395600" />
            <TextField label="GPS Longitude" inputMode="decimal" value={clinic.longitude} onChange={(v) => set('longitude', v)} placeholder="71.683600" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={fromLink} className="rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-gray-800 hover:bg-surface-alt">
              Link se coordinates
            </button>
            <button type="button" onClick={myLocation} disabled={locating} className="rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-gray-800 hover:bg-surface-alt disabled:opacity-60">
              {locating ? 'Dhoond rahe hain...' : 'Meri current location'}
            </button>
          </div>
          {note && <p className="mt-2 text-xs text-gray-600">{note}</p>}
        </div>

        <h5 className="text-sm font-bold text-gray-900 md:col-span-2">Contact</h5>
        <TextField label="Clinic phone number" required type="tel" value={clinic.phone} onChange={(v) => set('phone', v)} placeholder="0300 1234567" />
        <TextField label="WhatsApp number" type="tel" value={clinic.whatsapp} onChange={(v) => set('whatsapp', v)} placeholder="Khali ho to phone use hoga" />
        <TextField label="Email address" type="email" value={clinic.email} onChange={(v) => set('email', v)} />
        <TextField label="Official website" type="url" value={clinic.website} onChange={(v) => set('website', v)} placeholder="https://" />
        <TextField label="Appointment booking link" type="url" className="md:col-span-2" value={clinic.booking_link} onChange={(v) => set('booking_link', v)} placeholder="https://" />

        <h5 className="text-sm font-bold text-gray-900 md:col-span-2">Consultation &amp; availability</h5>
        <TextField label="Consultation fee (Rs.)" type="number" min="0" value={clinic.consultation_fee} onChange={(v) => set('consultation_fee', v)} />
        <TextField label="Follow-up fee (Rs.)" type="number" min="0" value={clinic.followup_fee} onChange={(v) => set('followup_fee', v)} />
        <Toggle label="Appointment zaroori hai" checked={clinic.appointment_required} onChange={(v) => set('appointment_required', v)} />
        <Toggle label="Online consultation" checked={clinic.online_consultation} onChange={(v) => set('online_consultation', v)} />
        <Toggle label="Home visit" checked={clinic.home_visit} onChange={(v) => set('home_visit', v)} />
        <Toggle label="Emergency services" checked={clinic.emergency_services} onChange={(v) => set('emergency_services', v)} />

        <div className="md:col-span-2">
          <h5 className="mb-2 text-sm font-bold text-gray-900">Haftawar schedule (is clinic ka)</h5>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {DAYS.map(([key, label]) => {
              const d = clinic.schedule[key] || { closed: false, open: '09:00', close: '17:00' };
              return (
                <div key={key} className="flex flex-wrap items-center gap-3 border-b border-line px-3.5 py-2.5 last:border-b-0">
                  <span className="w-24 text-sm font-semibold text-gray-900">{label}</span>
                  <label className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input type="checkbox" checked={Boolean(d.closed)} onChange={(e) => setDay(key, { closed: e.target.checked })} className="h-4 w-4 accent-red-500" />
                    Band (Closed)
                  </label>
                  {!d.closed && (
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="time" value={d.open || ''} onChange={(e) => setDay(key, { open: e.target.value })} className="rounded-lg border border-line px-2 py-1.5" aria-label={`${label} opening`} />
                      <span>se</span>
                      <input type="time" value={d.close || ''} onChange={(e) => setDay(key, { close: e.target.value })} className="rounded-lg border border-line px-2 py-1.5" aria-label={`${label} closing`} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <TextField label="Break time — shuru (optional)" type="time" value={clinic.break_start} onChange={(v) => set('break_start', v)} />
        <TextField label="Break time — khatam (optional)" type="time" value={clinic.break_end} onChange={(v) => set('break_end', v)} />
      </div>
    </div>
  );
}
