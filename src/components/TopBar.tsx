import { Gauge, RefreshCw, Server, Wifi, type LucideIcon } from 'lucide-react';
import { ActiveTab, ConnectionStatus } from '../types/vpn';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  status: ConnectionStatus;
  onToggleConnect: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string; icon: LucideIcon }[] = [
  { id: 'koneksi', label: 'Koneksi', icon: Wifi },
  { id: 'host', label: 'Host', icon: Server },
  { id: 'optimasi', label: 'Optimasi', icon: Gauge },
  { id: 'reconnect', label: 'Reconnect', icon: RefreshCw },
];

const STATUS_STYLE: Record<ConnectionStatus, { dot: string; label: string }> = {
  disconnected: { dot: 'bg-[#9ca3af]', label: 'Terputus' },
  connecting: { dot: 'bg-[#f59e0b]', label: 'Menghubungkan' },
  reconnecting: { dot: 'bg-[#f97316]', label: 'Reconnect' },
  connected: { dot: 'bg-[#16a34a]', label: 'Terhubung' },
};

export function TopBar({ activeTab, onSelectTab, status, onToggleConnect }: TopBarProps) {
  const isConnected = status === 'connected';
  const isBusy = status === 'connecting' || status === 'reconnecting';
  const st = STATUS_STYLE[status];

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b-[3px] border-[#111] bg-[#ffe14d]">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
          <button
            type="button"
            onClick={() => onSelectTab('koneksi')}
            className="flex shrink-0 cursor-pointer items-center gap-2"
          >
            <span className="font-display -rotate-3 border-[3px] border-[#111] bg-[#111] px-2 py-0.5 text-lg font-extrabold text-[#b8f25a] shadow-[3px_3px_0_#ff8fc7]">
              KH
            </span>
            <span className="font-display text-xl font-extrabold">vpn</span>
          </button>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-2 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`nb-btn flex cursor-pointer items-center gap-1.5 px-3 text-sm font-bold ${
                    active ? 'bg-[#111] text-white' : 'bg-white text-[#111]'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 border-[3px] border-[#111] bg-white px-2.5 py-1 text-xs font-bold sm:inline-flex">
              <span className={`h-2.5 w-2.5 rounded-full ${st.dot} ${isBusy ? 'kh-dot' : ''}`} />
              {st.label}
            </span>
            <button
              type="button"
              onClick={onToggleConnect}
              className={`nb-btn cursor-pointer whitespace-nowrap px-4 text-sm font-extrabold ${
                isConnected ? 'bg-[#111] text-white' : isBusy ? 'bg-white text-[#111]' : 'bg-[#b8f25a] text-[#111]'
              }`}
            >
              {isConnected ? 'Putuskan' : isBusy ? 'Batal' : 'Hubungkan'}
            </button>
          </div>
        </div>
      </header>

      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1.5 border-t-[3px] border-[#111] bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex min-h-[52px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[10px] border-[3px] text-[11px] font-bold transition-all duration-200 ${
                active
                  ? 'border-[#111] bg-[#b8f25a] shadow-[3px_3px_0_#111]'
                  : 'border-transparent text-[#4b4b46]'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
