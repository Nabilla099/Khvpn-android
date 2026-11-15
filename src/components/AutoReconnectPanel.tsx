import { ArrowRightLeft, Plus, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { PROVIDER_SCENARIOS } from '../data/defaultHosts';
import { AutoReconnectConfig, ConnectionStatus } from '../types/vpn';

interface AutoReconnectPanelProps {
  config: AutoReconnectConfig;
  onChange: (next: AutoReconnectConfig) => void;
  status: ConnectionStatus;
  currentProvider: string;
  reconnectAttempts: number;
  onSimulateSwitch: (scenarioLabel: string, nextProvider: string) => void;
}

export function AutoReconnectPanel({
  config,
  onChange,
  status,
  currentProvider,
  reconnectAttempts,
  onSimulateSwitch,
}: AutoReconnectPanelProps) {
  const [newResolver, setNewResolver] = useState('');

  const handleAddResolver = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newResolver.trim();
    if (!cleaned) return;
    const withPort = cleaned.includes(':') ? cleaned : `${cleaned}:53`;
    if (!config.fallbackResolvers.includes(withPort)) {
      onChange({
        ...config,
        fallbackResolvers: [...config.fallbackResolvers, withPort],
      });
    }
    setNewResolver('');
  };

  const handleRemoveResolver = (resolver: string) => {
    if (config.fallbackResolvers.length <= 1) return;
    onChange({
      ...config,
      fallbackResolvers: config.fallbackResolvers.filter((r) => r !== resolver),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b-2 border-[#111111] pb-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#111111] sm:text-3xl">
            Auto-Reconnect &amp; Perpindahan Provider
          </h1>
          <p className="mt-1 text-sm text-[#4b4b46]">
            Jaga kestabilan tunnel SSH &amp; SlowDNS secara otomatis ketika perangkat berpindah antara Wi-Fi dan jaringan seluler atau berganti ISP.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#111111] shrink-0">
          <span>Provider Aktif: {currentProvider}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">
            Rekoneksi Sesi: {reconnectAttempts}x
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Auto-Reconnect Controls */}
        <section className="nb-card p-5 sm:p-6 lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#111111]" />
              <h2 className="font-display text-lg font-bold text-[#111111]">
                Aturan Pemulihan Koneksi
              </h2>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.enabled}
              onClick={() => onChange({ ...config, enabled: !config.enabled })}
              className={`nb-btn px-4 py-1.5 text-xs font-extrabold whitespace-nowrap cursor-pointer ${
                config.enabled
                  ? 'bg-[#b8f25a] text-[#111111]'
                  : 'bg-[#eceae2] text-[#4b4b46]'
              }`}
            >
              {config.enabled ? 'Auto-Reconnect ON' : 'Auto-Reconnect OFF'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-3.5">
              <div>
                <div className="text-sm font-bold text-[#111111]">
                  Deteksi Otomatis Perpindahan Provider Internet
                </div>
                <p className="text-xs text-[#4b4b46]">
                  Memantau perubahan interface jaringan browser (online/offline &amp; tipe koneksi) untuk memicu sambung ulang seketika.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.detectProviderSwitch}
                disabled={!config.enabled}
                onClick={() =>
                  onChange({
                    ...config,
                    detectProviderSwitch: !config.detectProviderSwitch,
                  })
                }
                className={`nb-btn px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                  config.detectProviderSwitch && config.enabled
                    ? 'bg-[#b8f25a] text-[#111111]'
                    : 'bg-[#eceae2] text-[#4b4b46]'
                }`}
              >
                {config.detectProviderSwitch ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-3.5">
              <div>
                <div className="text-sm font-bold text-[#111111]">
                  Flush DNS &amp; Reset Socket Saat Berganti ISP
                </div>
                <p className="text-xs text-[#4b4b46]">
                  Membersihkan rute DNS lama dari provider sebelumnya agar SlowDNS langsung mengikat IP lokal baru tanpa macet.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.flushDnsOnSwitch}
                disabled={!config.enabled}
                onClick={() =>
                  onChange({
                    ...config,
                    flushDnsOnSwitch: !config.flushDnsOnSwitch,
                  })
                }
                className={`nb-btn px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                  config.flushDnsOnSwitch && config.enabled
                    ? 'bg-[#b8f25a] text-[#111111]'
                    : 'bg-[#eceae2] text-[#4b4b46]'
                }`}
              >
                {config.flushDnsOnSwitch ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-1">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#111111]">
                  Jeda Sebelum Reconnect
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 3, 5] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      disabled={!config.enabled}
                      onClick={() => onChange({ ...config, delaySec: sec })}
                      className={`nb-btn py-2 font-mono text-xs font-bold cursor-pointer disabled:opacity-50 ${
                        config.delaySec === sec
                          ? 'bg-[#111111] text-white'
                          : 'bg-white text-[#111111]'
                      }`}
                    >
                      {sec} dtk
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#111111]">
                  Batas Percobaan Ulang
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { val: 5, label: '5x' },
                      { val: 10, label: '10x' },
                      { val: 0, label: 'Tanpa Batas' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      disabled={!config.enabled}
                      onClick={() =>
                        onChange({ ...config, maxRetries: opt.val })
                      }
                      className={`nb-btn py-2 text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                        config.maxRetries === opt.val
                          ? 'bg-[#111111] text-white'
                          : 'bg-white text-[#111111]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fallback Resolvers & Provider Switch Tester */}
        <section className="nb-card p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-[#111111] border-b-2 border-[#111111] pb-3">
              Fallback DNS &amp; Uji Pindah Provider
            </h2>

            <div>
              <div className="mb-2 text-xs font-bold text-[#111111]">
                Urutan Resolver Cadangan Saat ISP Baru Memblokir DNS
              </div>
              <div className="space-y-2">
                {config.fallbackResolvers.map((resolver, idx) => (
                  <div
                    key={resolver}
                    className="flex items-center justify-between border-2 border-[#111111] bg-[#f6f5f0] px-3 py-2"
                  >
                    <span className="font-mono text-xs font-bold text-[#111111]">
                      {idx + 1}. {resolver}
                    </span>
                    {config.fallbackResolvers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveResolver(resolver)}
                        aria-label={`Hapus resolver ${resolver}`}
                        className="text-[#4b4b46] hover:text-[#dc2626] cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddResolver} className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={newResolver}
                  onChange={(e) => setNewResolver(e.target.value)}
                  placeholder="Tambah IP DNS (mis. 94.140.14.14:53)"
                  className="nb-input w-full px-3 py-1.5 font-mono text-xs"
                />
                <button
                  type="submit"
                  className="nb-btn inline-flex items-center gap-1 bg-white px-3 py-1.5 text-xs font-bold text-[#111111] whitespace-nowrap cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah</span>
                </button>
              </form>
            </div>

            <div className="border-t-2 border-[#111111] pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111]">
                  Simulasi Perpindahan Provider Internet
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#4b4b46]">
                  Status: {status}
                </span>
              </div>
              <div className="space-y-2">
                {PROVIDER_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => onSimulateSwitch(sc.label, sc.to)}
                    className="nb-btn flex w-full items-center justify-between bg-white px-3.5 py-2.5 text-xs font-bold text-[#111111] cursor-pointer hover:bg-[#b8f25a]"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
                      <span>{sc.label}</span>
                    </span>
                    <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
