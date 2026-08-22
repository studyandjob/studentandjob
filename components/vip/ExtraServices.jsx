'use client';

const SERVICES = [
  { title: 'CV Review by Expert', price: 'Rs. 300', desc: 'Get your AI-generated CV personally reviewed and improved.' },
  { title: 'Interview Preparation', price: 'Rs. 500', desc: 'One-on-one mock interview session over a call.' },
  { title: 'Form Filling Assistance', price: 'Rs. 200', desc: 'We fill out tricky government application forms for you.' },
  { title: 'Priority Job Alerts', price: 'Rs. 150/mo', desc: 'Get matching jobs on WhatsApp within minutes of posting.' },
];

export default function ExtraServices({ whatsappNumber = '923001234567' }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SERVICES.map((s) => (
        <div key={s.title} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-bold text-gray-900">{s.title}</h4>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">{s.price}</span>
          </div>
          <p className="mb-4 text-sm text-gray-500">{s.desc}</p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`I'm interested in "${s.title}"`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white"
          >
            Inquire on WhatsApp
          </a>
        </div>
      ))}
    </div>
  );
}
