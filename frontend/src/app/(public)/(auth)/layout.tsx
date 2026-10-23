/**
 * 求職者のログイン・会員登録などの画面の枠。ヘッダー・フッターは(public)のものを使い、フォームを中央に置く
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <div className="px-4 py-12 sm:px-6 sm:py-16">{children}</div>;
}
