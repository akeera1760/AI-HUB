import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail } from 'lucide-react';

const contactLinks = [
  {
    label: 'Email',
    value: 'akeera1760@gmail.com',
    href: 'mailto:akeera1760@gmail.com',
    note: 'Best for collaboration and project discussions.',
    icon: Mail,
  },
  {
    label: 'LinkedIn',
    value: 'Akeera Nandan',
    href: 'https://www.linkedin.com/in/akeera-nandan-undefined-1a4aba3a0?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    note: 'Professional profile and updates.',
    icon: Linkedin,
  },
  {
    label: 'Instagram',
    value: 'Akeera Nandan',
    href: 'https://www.instagram.com/mr__akeera__176?igsh=MW4zaWx3aWcwN2lndQ==',
    note: 'Behind-the-scenes and creative posts.',
    icon: Instagram,
  },
  {
    label: 'Facebook',
    value: 'Facebook profile',
    href: 'https://www.facebook.com/share/1CsPYVN4eW/',
    note: 'Social presence and quick reach-out.',
    icon: Facebook,
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-violet-400/10 bg-[#090611]/85 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] bottom-[-8rem] h-72 w-72 rounded-full bg-violet-600/14 blur-3xl" />
        <div className="absolute right-[-6rem] top-[-4rem] h-80 w-80 rounded-full bg-fuchsia-500/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-white/5 px-4 py-2 text-sm font-medium text-violet-200">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Let&apos;s connect
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-violet-50">
              Built with curiosity, motion, and a love for AI tools.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-8 text-violet-200/72">
              AI Hub is designed to help people discover strong tools faster. If you want to
              collaborate, connect, or just say hi, these are the best places to reach out.
            </p>

            <div className="mt-8 rounded-[28px] border border-violet-400/10 bg-white/5 p-6 shadow-[0_18px_44px_rgba(5,3,10,0.32)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200/55">
                Direct Contact
              </p>
              <a
                href="mailto:akeera1760@gmail.com"
                className="mt-3 inline-flex items-center gap-3 text-lg font-semibold text-violet-100 transition-colors hover:text-fuchsia-300"
              >
                <Mail className="h-5 w-5 text-violet-300" />
                akeera1760@gmail.com
              </a>
              <p className="mt-3 text-sm leading-7 text-violet-200/65">
                Open for thoughtful conversations around UI, frontend work, and AI-led product
                experiences.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {contactLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="group rounded-[28px] border border-violet-400/10 bg-white/5 p-6 shadow-[0_18px_44px_rgba(5,3,10,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-violet-500/[0.08] hover:shadow-[0_24px_60px_rgba(79,45,163,0.26)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-violet-950/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-violet-300/50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-200" />
                  </div>

                  <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-violet-200/50">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-violet-50">{item.value}</h3>
                  <p className="mt-3 text-sm leading-7 text-violet-200/68">{item.note}</p>
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-violet-400/10 pt-6 text-sm text-violet-200/55 md:flex-row md:items-center md:justify-between">
          <p>AI Hub</p>
          <p>Designed to discover standout AI tools across every category.</p>
        </div>
      </div>
    </footer>
  );
}
