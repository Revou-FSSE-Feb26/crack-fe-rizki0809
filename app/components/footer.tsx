import Link from "next/link";

const footerNav = [
  {
    title: "Belanja",
    links: [
      { label: "Semua Kue", href: "/products" },
      { label: "Best Seller", href: "/products" },
      { label: "Custom Cake", href: "/products" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Cara Pesan", href: "/help" },
      { label: "Pengiriman", href: "/help" },
      { label: "FAQ", href: "/help" },
    ],
  },
  {
    title: "Tentang",
    links: [
      { label: "Tentang Kami", href: "/about" },
      { label: "Kontak", href: "/about" },
      { label: "Karier", href: "/about" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-cream-400 bg-cream-200">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center font-bold text-strawberry-700"
            >
              <span className="mr-1 inline-block rounded-lg bg-strawberry-700 px-2 py-1 text-cream-50">
                Hadish
              </span>
              Cake
            </Link>
            <p className="mt-3 max-w-xs text-sm text-cocoa-500">
              Kue rumahan yang dipanggang setiap pagi dengan bahan pilihan.
              Manisnya pas, bikin momen kamu berkesan.
            </p>
          </div>

          {footerNav.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-bold text-cocoa-900">{group.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-cocoa-500 transition duration-300 hover:text-strawberry-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-cream-400 pt-6 text-sm text-cocoa-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Hadish Cake. </p>
          <p>
            Butuh bantuan?{" "}
            <a
              href="https://wa.me/6281234567890"
              className="font-semibold text-strawberry-700 hover:underline"
            >
              Chat WhatsApp
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
