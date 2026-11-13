import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Swords,
  Layers,
  Wrench,
  ShieldCheck,
  BarChart3,
  FileText,
  Boxes,
  Settings,
  Shield
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'LLM Chat', path: '/chat', icon: MessageSquare },
  { name: 'AI Agent', path: '/agent', icon: Bot },
  { name: 'Attack Tests', path: '/tests', icon: Swords },
  { name: 'OWASP Matrix', path: '/matrix', icon: Layers },
  { name: 'MCP Connector', path: '/mcp', icon: Wrench },
  { name: 'Mitigations', path: '/mitigations', icon: ShieldCheck },
  { name: 'Before / After', path: '/before-after', icon: BarChart3 },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Integrations', path: '/integrations', icon: Boxes },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#080808] border-r border-[#1c1c1c] flex flex-col justify-between h-screen select-none shrink-0 sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-[#171717]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A00] to-[#E06D00] flex items-center justify-center shadow-[0_0_15px_rgba(255,138,0,0.4)] border border-[#FFA842]/40">
            <Shield className="w-6 h-6 text-black fill-black" strokeWidth={2.5} />
            <span className="absolute text-[11px] font-black text-white tracking-tighter">A</span>
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-white uppercase font-sans">
              AI SECURITY
            </div>
            <div className="text-xs font-black tracking-widest text-[#FF8A00] uppercase font-mono">
              FASTER
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-gradient-to-r from-[#FF8A00] to-[#E06D00] text-black font-semibold shadow-[0_0_12px_rgba(255,138,0,0.35)]'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#141414]'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#888888]'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-[#171717] bg-[#0c0c0c]/80 m-3 rounded-xl border border-[#222222]">
        <div className="text-[10px] text-[#666666] uppercase tracking-wider mb-1 font-mono">
          Powered by
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A3A3]">
          <Shield className="w-4 h-4 text-[#FF8A00]" />
          <span>OWASP Foundation</span>
        </div>
      </div>
    </aside>
  );
};

