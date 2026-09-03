import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, AlertTriangle, Smartphone, Wallet,
  Briefcase, GitCompare, CreditCard
} from "lucide-react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import DemoBanner from "../common/DemoBanner";
import ToastContainer from "../common/Toast";
import { useAuth } from "../../context/AuthContext";

const CASEWORKER_NAV = [
  { to: "/dashboard",   icon: LayoutDashboard, label: "Home" },
  { to: "/clients",     icon: Users,            label: "Clients" },
  { to: "/risk-alerts", icon: AlertTriangle,    label: "Risk" },
  { to: "/demo/sms",    icon: Smartphone,       label: "SMS" },
  { to: "/demo/payment",icon: Wallet,           label: "Pay" },
];

const EMPLOYER_NAV = [
  { to: "/dashboard",   icon: LayoutDashboard, label: "Home" },
  { to: "/jobs",        icon: Briefcase,        label: "Jobs" },
  { to: "/job-matches", icon: GitCompare,       label: "Matches" },
  { to: "/demo/payment",icon: CreditCard,       label: "MoMo" },
  { to: "/payments",    icon: Wallet,           label: "Ledger" },
];

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { role } = useAuth();

  const mobileNav = role === "employer" ? EMPLOYER_NAV : CASEWORKER_NAV;

  return (
    <div className="min-h-screen bg-[#f4f7f8] flex flex-col">
      <DemoBanner />
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Role-aware mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-1px_0_rgba(15,23,42,0.06)]">
        <div className="grid text-[10px] font-semibold" style={{ gridTemplateColumns: `repeat(${mobileNav.length}, 1fr)` }}>
          {mobileNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                    isActive ? "text-teal-700" : "text-slate-400 hover:text-slate-600"
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <ToastContainer />
    </div>
  );
}
