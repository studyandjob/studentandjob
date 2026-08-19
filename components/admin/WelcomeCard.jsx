export default function WelcomeCard({ siteName, subHeading }) {
  return (
    <div
      className="rounded-[14px] p-7 text-white"
      style={{ background: 'linear-gradient(135deg, #14534F, #1E7A73)' }}
    >
      <h3 className="font-serif text-xl font-bold sm:text-2xl">Welcome, Admin! 👋</h3>
      <p className="mt-1.5 text-white/90">{siteName || 'Your Portal'}</p>
      {subHeading && <p className="mt-1 text-sm text-white/70">{subHeading}</p>}
    </div>
  );
}
