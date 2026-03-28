import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import {
  Bell,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Newspaper,
  Search,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Dashboard from "./pages/Dashboard";
import Inzichten from "./pages/Inzichten";
import Nieuws from "./pages/Nieuws";
import Watchlist from "./pages/Watchlist";

type Page = "dashboard" | "watchlist" | "nieuws" | "inzichten";

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  { id: "watchlist", label: "Watchlist", icon: <Star className="h-5 w-5" /> },
  { id: "nieuws", label: "Nieuws", icon: <Newspaper className="h-5 w-5" /> },
  {
    id: "inzichten",
    label: "Inzichten",
    icon: <BookOpen className="h-5 w-5" />,
  },
];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();

  const isLoggedIn = !!identity;
  const principalShort = identity?.getPrincipal().toString().slice(0, 8) ?? "";
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 bg-header border-b border-border/60 backdrop-blur-sm">
        <div className="flex items-center h-14 px-4 gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-teal" />
            </div>
            <span className="font-bold text-sm text-foreground hidden sm:block">
              MijnBeleggerspagina
            </span>
          </div>

          <nav
            className="hidden md:flex items-center gap-1 ml-4 relative"
            aria-label="Hoofdnavigatie"
          >
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  page === item.id
                    ? "text-teal bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-ocid={`nav.${item.id}.link`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Zoeken..."
                className="pl-9 h-8 w-48 bg-muted border-border text-sm placeholder:text-muted-foreground"
                data-ocid="header.search_input"
              />
            </div>

            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Notificaties"
            >
              <Bell className="h-4 w-4" />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/20 text-teal text-xs font-bold">
                    {principalShort.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground hidden lg:block font-mono">
                  {principalShort}…
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clear}
                  className="h-8 px-2 text-muted-foreground hover:text-negative"
                  data-ocid="auth.secondary_button"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                data-ocid="auth.primary_button"
              >
                <LogIn className="h-3.5 w-3.5 mr-1" />
                {isLoggingIn ? "Inloggen..." : "Inloggen"}
              </Button>
            )}

            <button
              type="button"
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Menu openen"
              data-ocid="nav.toggle"
            >
              {sidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR (desktop) */}
        <aside className="hidden md:flex flex-col w-16 bg-sidebar-custom border-r border-border/60 py-4 gap-2 items-center sticky top-14 h-[calc(100vh-3.5rem)]">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setPage(item.id)}
              title={item.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                page === item.id
                  ? "bg-primary/20 text-teal shadow-teal-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              data-ocid={`sidebar.${item.id}.link`}
              aria-label={item.label}
            >
              {item.icon}
            </button>
          ))}
          <div className="flex-1" />
          <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
        </aside>

        {/* MOBILE SIDEBAR */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="md:hidden fixed inset-y-14 left-0 z-40 w-60 bg-sidebar-custom border-r border-border/60 py-4 px-3 flex flex-col gap-1"
            >
              {NAV_ITEMS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    page === item.id
                      ? "bg-primary/20 text-teal"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  data-ocid={`mobile-nav.${item.id}.link`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto" id="main-content">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {page === "dashboard" && (
                  <Dashboard onNavigate={(p) => setPage(p as Page)} />
                )}
                {page === "watchlist" && <Watchlist />}
                {page === "nieuws" && <Nieuws />}
                {page === "inzichten" && <Inzichten />}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="border-t border-border/40 mt-8 py-4 px-4">
            <p className="text-center text-xs text-muted-foreground">
              © {currentYear}. Gebouwd met ❤️ met{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
