import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "@/app/providers/app-provider";
import { useAuth } from "@/app/providers/auth-provider";
import { formatClockTime, formatLongIndonesianDate } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

type IconProps = { className?: string };

export type ShellOutletContext = {
  sidebarCollapsed: boolean;
};

function IconBase({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
    >
      {children}
    </svg>
  );
}

function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconBase>
  );
}

function PanelOpenIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="m14 12 3-3" />
      <path d="m14 12 3 3" />
    </IconBase>
  );
}

function PanelCloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M15 4v16" />
      <path d="m10 12 3-3" />
      <path d="m10 12 3 3" />
    </IconBase>
  );
}

function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m4 11 8-6 8 6" />
      <path d="M6 10.5V20h12v-9.5" />
    </IconBase>
  );
}

function PosIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M10 16v4" />
      <path d="M14 16v4" />
    </IconBase>
  );
}

function GridIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </IconBase>
  );
}

function BoxIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m12 12 8-4.5" />
      <path d="m12 12-8-4.5" />
      <path d="M12 12v9" />
    </IconBase>
  );
}

function RotateIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v6h-6" />
    </IconBase>
  );
}

function TruckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 7h11v8H3Z" />
      <path d="M14 10h3l3 3v2h-6Z" />
      <circle cx="8" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </IconBase>
  );
}

function PeopleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M14.5 19a4 4 0 0 1 5-3.86" />
    </IconBase>
  );
}

function BuildingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20V5l8-2v17" />
      <path d="M12 20V9h8v11" />
      <path d="M7 8h1" />
      <path d="M7 12h1" />
      <path d="M15 12h1" />
      <path d="M15 16h1" />
    </IconBase>
  );
}

function ChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20h16" />
      <path d="M7 17V10" />
      <path d="M12 17V6" />
      <path d="M17 17v-4" />
    </IconBase>
  );
}

function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Z" />
      <path d="m19.4 15-.9 1.6-1.9-.2a6.8 6.8 0 0 1-1.2.7l-.6 1.8h-1.8l-.6-1.8a6.8 6.8 0 0 1-1.2-.7l-1.9.2-.9-1.6 1.3-1.4a6.5 6.5 0 0 1 0-1.4L6.4 9l.9-1.6 1.9.2a6.8 6.8 0 0 1 1.2-.7l.6-1.8h1.8l.6 1.8a6.8 6.8 0 0 1 1.2.7l1.9-.2.9 1.6-1.3 1.4a6.5 6.5 0 0 1 0 1.4Z" />
    </IconBase>
  );
}

const employeeNavItems = [
  { to: "/transactions", label: "Transaksi", icon: PosIcon },
  { to: "/refunds", label: "Refund", icon: RotateIcon },
  { to: "/products", label: "Produk", icon: BoxIcon },
  { to: "/reports", label: "Laporan", icon: ChartIcon },
];

const ownerNavItems = [
  { to: "/transactions", label: "Transaksi", icon: PosIcon },
  { to: "/refunds", label: "Refund", icon: RotateIcon },
  { to: "/products", label: "Produk", icon: BoxIcon },
  { to: "/reports", label: "Laporan", icon: ChartIcon },
];

export function AppShell() {
  const { state } = useAppContext();
  const { session, logout } = useAuth();
  const navItems =
    state.settings.activeRole === "owner" ? ownerNavItems : employeeNavItems;
  const location = useLocation();
  const [now, setNow] = useState(() => new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const isPosPage = location.pathname === "/pos";
  const activeItem = navItems.find((item) => item.to === location.pathname);
  const desktopSidebarWidth = sidebarCollapsed ? 84 : 244;
  const sidebarCompact = sidebarCollapsed && !mobileSidebarOpen;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-ink/20 lg:hidden"
        />
      ) : null}

      <div
        className="relative min-h-screen lg:grid"
        style={{
          gridTemplateColumns: `${desktopSidebarWidth}px minmax(0,1fr)`,
        }}
      >
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex flex-col bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-secondary/10",
            mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
          )}
          style={{ width: mobileSidebarOpen ? 244 : desktopSidebarWidth }}
        >
          <div
            className={cn(
              "flex h-16 items-center px-4",
              sidebarCompact ? "justify-center" : "justify-between gap-3",
            )}
          >
            {!sidebarCompact ? (
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
                  POS Lokal
                </p>
                <h1 className="truncate font-display text-lg font-bold text-ink">
                  {state.settings.storeName}
                </h1>
              </div>
            ) : null}

            <button
              type="button"
              aria-label={sidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="hidden h-10 w-10 items-center justify-center rounded-2xl text-secondary transition-colors hover:bg-secondary/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 lg:inline-flex"
            >
              {sidebarCollapsed ? <PanelOpenIcon /> : <PanelCloseIcon />}
            </button>
          </div>

          <div className="border-t border-secondary/10" />

          <nav className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex h-12 items-center gap-3 rounded-2xl text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                        sidebarCompact
                          ? "justify-center px-0 text-secondary hover:bg-secondary/8 hover:text-ink"
                          : "px-3",
                        sidebarCompact
                          ? isActive
                            ? "text-primary"
                            : ""
                          : isActive
                            ? "bg-primary text-white"
                            : "text-secondary hover:bg-secondary/8 hover:text-ink",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                            isActive
                              ? sidebarCompact
                                ? "bg-primary text-white shadow-[0_10px_24px_-16px_rgba(37,99,235,0.9)]"
                                : "bg-white/14 text-white"
                              : "bg-secondary/10 text-primary",
                          )}
                        >
                          <Icon />
                        </span>
                        {!sidebarCompact ? (
                          <span className="min-w-0 truncate">{item.label}</span>
                        ) : null}
                        {sidebarCompact ? (
                          <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block group-focus-visible:block">
                            {item.label}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {!sidebarCompact ? (
            <>
              <div className="border-t border-secondary/10" />
              <div className="px-4 py-4 space-y-3">
                <div className="text-sm text-muted">
                  <div className="font-medium text-ink">
                    {session?.name ??
                      (state.settings.activeRole === "owner"
                        ? "Pemilik"
                        : "Karyawan")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                  }}
                  className="w-full rounded-2xl border border-secondary/12 px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary/8 hover:text-ink"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : null}
        </aside>

        <main className="min-w-0">
          <header
            className={cn(
              "sticky top-0 z-20 border-b border-secondary/10 bg-canvas/95 backdrop-blur",
              isPosPage ? "h-14" : "h-16",
            )}
          >
            <div className="flex h-full items-center gap-3 px-4 lg:px-6">
              <button
                type="button"
                aria-label="Buka menu navigasi"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-secondary transition-colors hover:bg-secondary/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 lg:hidden"
              >
                <MenuIcon />
              </button>

              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-lg font-bold text-ink">
                  {activeItem?.label ?? "Transaksi"}
                </h2>
              </div>

              <div className="text-right">
                <div className="font-display text-base font-bold tabular-nums text-ink">
                  {formatClockTime(now)}
                </div>
                {!isPosPage ? (
                  <div className="text-xs text-secondary">
                    {formatLongIndonesianDate(now)}
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <div className="px-4 py-4 lg:px-6">
            <Outlet context={{ sidebarCollapsed }} />
          </div>
        </main>
      </div>
    </div>
  );
}
