export default function AdminCard({ title, description, icon: IconCmp, children }) {
  return (
    <section className="rounded-[14px] border border-aline bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2.5">
        {IconCmp && <IconCmp className="h-5 w-5 text-atl" />}
        <h2 className="font-serif text-[1.1rem] font-bold text-atl">{title}</h2>
      </div>
      {description && <p className="-mt-3 mb-5 text-sm text-amuted">{description}</p>}
      {children}
    </section>
  );
}
