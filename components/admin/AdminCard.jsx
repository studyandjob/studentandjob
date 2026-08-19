export default function AdminCard({ title, description, children }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
