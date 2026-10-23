import Link from "next/link";

import { Logo } from "./Logo";

type FooterLink = {
  href: string;
  label: string;
};

// 求職者向けのフッターのリンク。追加・並べ替えはこの配列だけで行う
const seekerLinks: FooterLink[] = [
  { href: "/jobs", label: "求人を探す" },
  { href: "/for-companies", label: "企業の方はこちら" },
  { href: "/login", label: "ログイン" },
  { href: "/register", label: "会員登録" },
];

// 企業向けページのフッターのリンク
export const companyFooterLinks: FooterLink[] = [
  { href: "/", label: "求職者の方はこちら" },
  { href: "/company/login", label: "企業ログイン" },
  { href: "/company/register", label: "企業登録" },
];

type FooterProps = {
  /** 並べるリンク。省略すると求職者向けのリンク */
  links?: FooterLink[];
};

export function Footer({ links = seekerLinks }: FooterProps) {
  return (
    <footer className="border-t-2 border-primary bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6">
        <Logo size="sm" />
        <nav aria-label="フッター">
          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-sm font-bold">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block py-2 text-primary hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <small className="font-display text-xs text-ink-sub">
          © 2026 Tech Match
        </small>
      </div>
    </footer>
  );
}
