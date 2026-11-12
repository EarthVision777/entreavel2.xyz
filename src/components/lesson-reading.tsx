import type { LessonGuide } from "@/data/guides";

export function LessonReading({ guide }: { guide: LessonGuide }) {
  return (
    <article className="lesson-reading mx-auto w-full max-w-xl px-1 py-2 text-stone-100">
      <p className="text-[1.125rem] leading-8 text-stone-50">{guide.lead}</p>
      <div className="mt-8 space-y-8">
        {guide.sections.map((section) => (
          <section key={section.title}>
            <h3 className="font-sans text-[0.95rem] font-semibold tracking-wide text-[#f0c7b8] uppercase">
              {section.title}
            </h3>
            <div className="mt-3 space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="leading-8 text-stone-200">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
      {guide.practice ? (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="font-sans text-[0.95rem] font-semibold text-[#f0c7b8]">
            {guide.practice.title}
          </h3>
          <ol className="mt-3 space-y-3">
            {guide.practice.steps.map((step, index) => (
              <li key={step.slice(0, 40)} className="flex gap-3 leading-7">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8a1500] font-sans text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <aside className="mt-8 border-l-2 border-[#e7b5a6] pl-4">
        <h3 className="font-sans text-sm font-semibold tracking-wide text-[#f0c7b8] uppercase">
          Para llevarte
        </h3>
        <p className="mt-2 leading-8">{guide.reflection}</p>
      </aside>
      <aside className="mt-6 rounded-2xl bg-[#3a100c] px-4 py-3 text-[0.98rem] leading-7 text-[#f6ddd6]">
        <h3 className="font-sans text-sm font-semibold tracking-wide uppercase">
          Con cuidado
        </h3>
        <p className="mt-2">{guide.care}</p>
      </aside>
    </article>
  );
}
