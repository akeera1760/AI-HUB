import { useMemo, useState } from 'react';
import { Category, AITool } from '../lib/supabase';
import {
  BadgeCheck,
  CheckCircle2,
  MessageSquareMore,
  Send,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';

interface CategoryFeedbackProps {
  category: Category;
  tools: AITool[];
}

const quickFeedbackOptions = [
  'Best for beginners',
  'Best overall value',
  'Most powerful',
  'Most user-friendly',
];

const ratingLabels: Record<number, string> = {
  1: 'Very weak fit',
  2: 'Below average',
  3: 'Solid option',
  4: 'Strong choice',
  5: 'Top pick',
};

export function CategoryFeedback({ category, tools }: CategoryFeedbackProps) {
  const [rating, setRating] = useState(4);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favoriteTool, setFavoriteTool] = useState(tools[0]?.id ?? '');
  const [submitted, setSubmitted] = useState(false);

  const selectedTool = useMemo(
    () => tools.find((tool) => tool.id === favoriteTool) ?? tools[0],
    [favoriteTool, tools]
  );

  const toolInitial = selectedTool?.name.charAt(0).toUpperCase() ?? 'A';

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
  }

  return (
    <section className="feedback-panel animate-stage-in mt-12 rounded-[32px] border border-violet-400/10 bg-white/5 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-white/5 px-4 py-2 text-sm font-medium text-violet-200">
            <MessageSquareMore className="h-4 w-4" />
            Community choice
          </div>
          <h2 className="mt-5 text-3xl font-bold text-violet-50">
            Which tool wins in {category.name}?
          </h2>
          <p className="mt-3 text-base leading-7 text-violet-200/75">
            Spotlight the strongest tool in this category and explain why people should start
            there. This block now feels like a featured recommendation, not just a plain form.
          </p>
        </div>

        <div className="feedback-panel-accent rounded-[24px] border border-violet-400/10 px-5 py-4 text-sm text-violet-200/75 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-violet-50">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Top Pick board
          </div>
          <p className="mt-2 leading-6">
            Vote for the tool you would recommend first to someone opening this category.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
        <div className="feedback-spotlight rounded-[30px] border border-white/70 p-6 text-white shadow-[0_24px_60px_rgba(37,99,235,0.18)]">
          <div className="feedback-spotlight-visual" aria-hidden="true">
            <div className="feedback-spotlight-chip">
              <span className="feedback-spotlight-chip-dot" />
              AI pick
            </div>
            <div className="feedback-spotlight-art">
              <div className="feedback-spotlight-art-orb" />
              <div className="feedback-spotlight-art-card">
                <div className="feedback-spotlight-art-badge">{toolInitial}</div>
                <div className="feedback-spotlight-art-lines">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="feedback-spotlight-art-tags">
                  <span>{selectedTool?.name ?? 'Top Tool'}</span>
                  <span>{category.name}</span>
                </div>
              </div>
              <div className="feedback-spotlight-floating">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                <Trophy className="h-3.5 w-3.5" />
                Top Pick Spotlight
              </div>
              <h3 className="mt-5 text-3xl font-bold">{selectedTool?.name ?? 'Choose a tool'}</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-violet-50/88">
                {selectedTool?.description ??
                  'Pick a tool to see why it deserves the top spot in this category.'}
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-2xl font-bold shadow-lg shadow-sky-950/15 backdrop-blur">
              {toolInitial}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-white/12 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                Current score
              </p>
              <div className="mt-3 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={[
                      'h-4 w-4',
                      value <= rating ? 'fill-current text-amber-300' : 'text-white/30',
                    ].join(' ')}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm font-medium text-white/90">{ratingLabels[rating]}</p>
            </div>

            <div className="rounded-[24px] bg-white/12 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                Recommendation angle
              </p>
              <div className="mt-3 flex min-h-[52px] flex-wrap gap-2">
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-white/16 px-3 py-1 text-xs font-semibold text-white"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-white/70">Choose why this tool stands out.</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] bg-slate-950/16 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <BadgeCheck className="h-4 w-4 text-emerald-300" />
              Why people might choose it
            </div>
            <p className="mt-3 text-sm leading-7 text-white/82">
              {note.trim().length > 0
                ? note
                : `Use this space to explain what makes ${selectedTool?.name ?? 'this tool'} the standout pick in ${category.name}.`}
            </p>
          </div>
        </div>

        <div className="feedback-vote-card rounded-[30px] border border-violet-400/10 bg-white/5 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          {submitted ? (
            <div className="rounded-[26px] border border-emerald-200 bg-emerald-50/90 p-6 animate-stage-in">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-500 p-3 text-white shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-emerald-900">
                    Community choice captured
                  </h3>
                  <p className="mt-2 text-emerald-800">
                    {selectedTool?.name ?? 'Your tool'} is your current winner for {category.name}.
                    The summary card on the left now reflects your vote.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-white px-4 py-2 font-semibold text-emerald-800">
                      {rating}/5 rating
                    </span>
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-4 py-2 font-semibold text-emerald-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    Edit your vote
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-violet-200/60">
                    Choose the winner
                  </label>
                  <span className="text-sm font-medium text-violet-200/60">{tools.length} tools</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {tools.map((tool) => {
                    const active = tool.id === favoriteTool;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setFavoriteTool(tool.id)}
                        className={[
                          'feedback-tool-option rounded-[22px] border p-4 text-left transition-all',
                          active ? 'feedback-tool-option-active' : '',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-violet-50">{tool.name}</p>
                            <p className="mt-1 text-sm leading-6 text-violet-200/72 line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                          <div
                            className={[
                              'mt-1 h-3.5 w-3.5 rounded-full border',
                              active
                                ? 'border-violet-400 bg-violet-400 shadow-[0_0_0_4px_rgba(139,92,246,0.16)]'
                                : 'border-violet-300/35 bg-white/5',
                            ].join(' ')}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-violet-200/60">
                  Rate your top pick
                </label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const active = value <= rating;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className={[
                          'feedback-rating-btn inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-all',
                          active
                            ? 'border-amber-300/60 bg-amber-400/10 text-amber-200 shadow-sm'
                            : 'border-violet-400/12 bg-white/5 text-violet-200/72 hover:border-violet-400/30 hover:text-violet-100',
                        ].join(' ')}
                      >
                        <Star className={['h-4 w-4', active ? 'fill-current' : ''].join(' ')} />
                        {value}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm font-medium text-violet-200/65">{ratingLabels[rating]}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-violet-200/60">
                  Why it deserves the crown
                </label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {quickFeedbackOptions.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={[
                          'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                          active
                            ? 'border-violet-400/40 bg-violet-400/12 text-violet-100 shadow-sm'
                            : 'border-violet-400/12 bg-white/5 text-violet-200/72 hover:border-violet-400/22 hover:bg-violet-400/8',
                        ].join(' ')}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="feedback-note"
                  className="block text-sm font-semibold uppercase tracking-[0.18em] text-violet-200/60"
                >
                  Recommendation note
                </label>
                <textarea
                  id="feedback-note"
                  rows={5}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    selectedTool
                      ? `Why would you recommend ${selectedTool.name} first in ${category.name}?`
                      : 'Tell us which tool stands out and why.'
                  }
                  className="mt-3 w-full rounded-[24px] border border-violet-400/12 bg-white/5 px-5 py-4 text-violet-50 outline-none transition placeholder:text-violet-300/45 focus:border-violet-400/32 focus:ring-4 focus:ring-violet-400/15"
                />
              </div>

              <div className="flex flex-col gap-4 border-t border-violet-400/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-violet-200/60">
                  This version presents a featured choice on the page only. No database write
                  happens yet.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  <Send className="h-4 w-4" />
                  Publish top pick
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
