export default function AdminPageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div><span className="eyebrow">{eyebrow}</span><h1 className="mt-2 font-display text-3xl font-bold text-civic-950 sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>
      {action}
    </div>
  );
}
