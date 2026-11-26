import HomeIcon from '../HomeIcons';
import Art3D from '../Art3D';
import VerifiedBadge from './VerifiedBadge';
import ShareButton from './ShareButton';
import { businessWaLink, directionsLink, isVerified, telLink } from '@/lib/directory';
import { clinicTypeLabel, scheduleRows } from '@/lib/doctorData';
import { formatTime } from '@/lib/doctor';

function Block({ title, children }) {
  return (
    <section className="rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:p-6">
      <h2 className="mb-3 text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

const Chips = ({ items }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((i) => (
      <span key={i} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
        {i}
      </span>
    ))}
  </div>
);

const Flag = ({ on, label }) =>
  on ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">✓ {label}</span> : null;

/** Public doctor profile. Shows only public data — private PMDC documents never reach this page. */
export default function DoctorProfileView({ business, bundle, cities, areas, siteName }) {
  const { profile, clinics, faqs, registration } = bundle;
  const verified = isVerified(business);
  const primary = clinics[0];
  const city = (id) => cities.find((c) => c.id === id)?.name;
  const area = (id) => areas.find((a) => a.id === id)?.name;
  const wa = businessWaLink(business, siteName);
  const tel = telLink(business.phone);
  const directions = directionsLink(business);
  const degrees = [profile?.degree, ...(profile?.postgraduate_qualifications || [])].filter(Boolean);
  const specialty = [profile?.main_specialization, profile?.sub_specialization].filter(Boolean).join(' · ');

  const btn = 'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition active:scale-95';

  return (
    <div className="space-y-5">
      {/* header */}
      <article className="overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-22px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:p-8">
          <div className="flex-shrink-0">
            {business.photo_url ? (
              <img src={business.photo_url} alt={business.name} className="h-40 w-40 rounded-3xl object-cover shadow-lg md:h-48 md:w-48" />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 to-brand-50 md:h-48 md:w-48">
                <Art3D name="doctor" className="h-24 w-24" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {verified && <VerifiedBadge />}
              {registration?.pmdc_number && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700" title="PMDC registration admin ne verify ki hai">
                  <HomeIcon name="check" className="h-3.5 w-3.5" />
                  PMDC verified · {registration.pmdc_number}
                </span>
              )}
              {business.is_featured && <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950">★ Featured</span>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">{business.name}</h1>
            {specialty && <p className="mt-1 text-base font-semibold text-brand-700">{specialty}</p>}
            {degrees.length > 0 && <p className="mt-1 text-sm text-gray-600">{degrees.join(', ')}</p>}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-700">
              {profile?.experience_years != null && <span>🩺 {profile.experience_years} saal ka tajurba</span>}
              {profile?.languages?.length > 0 && <span>🗣️ {profile.languages.join(', ')}</span>}
              {primary && <span>📍 {[area(primary.area_id), city(primary.city_id)].filter(Boolean).join(', ')}</span>}
            </div>
            {profile?.short_intro && <p className="mt-3 text-base text-gray-700">{profile.short_intro}</p>}

            <div className="mt-5 flex flex-wrap gap-3">
              {primary?.booking_link && (
                <a href={primary.booking_link} target="_blank" rel="noopener noreferrer" className={`${btn} bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]`}>
                  <HomeIcon name="calendar" className="h-5 w-5" />
                  Appointment book karein
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className={`${btn} bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]`}>
                  <HomeIcon name="whatsapp" className="h-5 w-5" />
                  WhatsApp
                </a>
              )}
              {tel && (
                <a href={tel} className={`${btn} border border-line bg-surface text-gray-800 hover:bg-surface-alt`}>
                  <HomeIcon name="phone" className="h-5 w-5" />
                  Call Now
                </a>
              )}
              {directions && (
                <a href={directions} target="_blank" rel="noopener noreferrer" className={`${btn} border border-line bg-surface text-gray-800 hover:bg-surface-alt`}>
                  <HomeIcon name="pin" className="h-5 w-5" />
                  Directions
                </a>
              )}
              <ShareButton title={business.name} />
            </div>
          </div>
        </div>
      </article>

      {profile?.biography && (
        <Block title="Taaruf">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 md:text-base">{profile.biography}</p>
        </Block>
      )}

      {(profile?.degree || profile?.postgraduate_qualifications?.length > 0 || profile?.additional_certifications || profile?.medical_training) && (
        <Block title="Education & Qualifications">
          <dl className="space-y-3 text-sm text-gray-700">
            {profile.degree && (
              <div>
                <dt className="font-semibold text-gray-900">{profile.degree}</dt>
                <dd>{[profile.degree_institution, profile.graduation_year].filter(Boolean).join(' · ')}</dd>
              </div>
            )}
            {profile.postgraduate_qualifications?.length > 0 && (
              <div>
                <dt className="mb-1.5 font-semibold text-gray-900">Postgraduate</dt>
                <dd><Chips items={profile.postgraduate_qualifications} /></dd>
              </div>
            )}
            {profile.additional_certifications && (
              <div>
                <dt className="font-semibold text-gray-900">Additional certifications</dt>
                <dd className="whitespace-pre-line">{profile.additional_certifications}</dd>
              </div>
            )}
            {profile.medical_training && (
              <div>
                <dt className="font-semibold text-gray-900">Medical training</dt>
                <dd className="whitespace-pre-line">{profile.medical_training}</dd>
              </div>
            )}
          </dl>
        </Block>
      )}

      {(profile?.medical_services?.length > 0 || profile?.conditions_treated?.length > 0 || profile?.procedures_performed?.length > 0) && (
        <Block title="Services, Conditions & Procedures">
          <div className="space-y-4">
            {profile.medical_services?.length > 0 && (<div><h3 className="mb-1.5 text-sm font-semibold text-gray-900">Medical services</h3><Chips items={profile.medical_services} /></div>)}
            {profile.conditions_treated?.length > 0 && (<div><h3 className="mb-1.5 text-sm font-semibold text-gray-900">Conditions treated</h3><Chips items={profile.conditions_treated} /></div>)}
            {profile.procedures_performed?.length > 0 && (<div><h3 className="mb-1.5 text-sm font-semibold text-gray-900">Procedures performed</h3><Chips items={profile.procedures_performed} /></div>)}
          </div>
        </Block>
      )}

      {(profile?.current_designation || profile?.current_institution || profile?.previous_institutions || profile?.professional_memberships || profile?.awards) && (
        <Block title="Professional Experience">
          <dl className="space-y-3 text-sm text-gray-700">
            {(profile.current_designation || profile.current_institution) && (
              <div>
                <dt className="font-semibold text-gray-900">Maujooda</dt>
                <dd>{[profile.current_designation, profile.current_institution].filter(Boolean).join(' — ')}</dd>
              </div>
            )}
            {profile.previous_institutions && (<div><dt className="font-semibold text-gray-900">Pehle</dt><dd className="whitespace-pre-line">{profile.previous_institutions}</dd></div>)}
            {profile.professional_memberships && (<div><dt className="font-semibold text-gray-900">Memberships</dt><dd className="whitespace-pre-line">{profile.professional_memberships}</dd></div>)}
            {profile.awards && (<div><dt className="font-semibold text-gray-900">Awards & achievements</dt><dd className="whitespace-pre-line">{profile.awards}</dd></div>)}
          </dl>
        </Block>
      )}

      {clinics.length > 0 && (
        <Block title={clinics.length > 1 ? 'Clinics & Hospitals' : 'Clinic / Hospital'}>
          <div className="space-y-4">
            {clinics.map((c) => (
              <div key={c.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">{c.clinic_name}</h3>
                  {clinicTypeLabel(c.clinic_type) && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{clinicTypeLabel(c.clinic_type)}</span>}
                </div>
                <p className="mt-1.5 flex items-start gap-1.5 text-sm text-gray-700">
                  <HomeIcon name="pin" className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  {[c.address, area(c.area_id), city(c.city_id), c.province].filter(Boolean).join(', ')}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {c.consultation_fee != null && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Consultation: Rs. {Number(c.consultation_fee).toLocaleString('en-PK')}</span>}
                  {c.followup_fee != null && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Follow-up: Rs. {Number(c.followup_fee).toLocaleString('en-PK')}</span>}
                  <Flag on={c.appointment_required} label="Appointment zaroori" />
                  <Flag on={c.online_consultation} label="Online consultation" />
                  <Flag on={c.home_visit} label="Home visit" />
                  <Flag on={c.emergency_services} label="Emergency services" />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <table className="w-full text-sm">
                    <caption className="mb-1.5 text-left text-sm font-semibold text-gray-900">Haftawar schedule</caption>
                    <tbody>
                      {scheduleRows(c.schedule).map((row) => (
                        <tr key={row.label} className="border-b border-line last:border-0">
                          <th scope="row" className="py-1.5 pr-3 text-left font-medium text-gray-700">{row.label}</th>
                          <td className={`py-1.5 ${row.closed ? 'text-red-500' : 'text-gray-900'}`}>{row.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="space-y-2 text-sm">
                    {c.break_start && c.break_end && <p className="text-gray-700">☕ Break: {formatTime(c.break_start)} – {formatTime(c.break_end)}</p>}
                    {c.phone && <p><a href={telLink(c.phone)} className="font-medium text-gray-900 hover:underline">📞 {c.phone}</a></p>}
                    {c.email && <p><a href={`mailto:${c.email}`} className="text-gray-900 hover:underline">✉️ {c.email}</a></p>}
                    {c.website && <p><a href={c.website} target="_blank" rel="noopener noreferrer nofollow" className="text-gray-900 hover:underline">🌐 Website</a></p>}
                    {c.map_link && <p><a href={c.map_link} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">🗺️ Map par dekhein</a></p>}
                    {c.booking_link && <p><a href={c.booking_link} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-brand-700 hover:underline">📅 Appointment book karein</a></p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {faqs.length > 0 && (
        <Block title="Aksar poochay jane wale sawal">
          <div className="divide-y divide-line">
            {faqs.map((f) => (
              <details key={f.id} className="group py-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 marker:hidden">
                  <span className="mr-2 inline-block transition group-open:rotate-90">›</span>
                  {f.question}
                </summary>
                <p className="mt-2 whitespace-pre-line pl-5 text-sm text-gray-700">{f.answer}</p>
              </details>
            ))}
          </div>
        </Block>
      )}

      {(profile?.facebook_url || profile?.instagram_url || profile?.linkedin_url || profile?.youtube_url) && (
        <div className="flex flex-wrap gap-2">
          {[['Facebook', profile.facebook_url], ['Instagram', profile.instagram_url], ['LinkedIn', profile.linkedin_url], ['YouTube', profile.youtube_url]]
            .filter(([, u]) => u)
            .map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer nofollow" className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-surface-alt">
                {label}
              </a>
            ))}
        </div>
      )}

      <p className="rounded-2xl bg-surface-alt px-4 py-3 text-xs text-gray-500">
        Yeh maloomat doctor / clinic ne khud di hain. Website un ki durustgi ki guarantee nahi deti. Emergency mein foran qareebi hospital jayein.
      </p>
    </div>
  );
}
