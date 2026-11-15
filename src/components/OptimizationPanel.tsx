import { Activity, Cpu, Zap } from 'lucide-react';
import { OPTIMIZATION_PRESETS } from '../data/defaultHosts';
import {
  NetworkProbeResult,
  OptimizationConfig,
  OptimizationPreset,
} from '../types/vpn';

interface OptimizationPanelProps {
  config: OptimizationConfig;
  onChange: (next: OptimizationConfig) => void;
  onRunProbe: () => void;
  probing: boolean;
  probeResult: NetworkProbeResult | null;
}

const PRESET_CARDS: {
  id: Exclude<OptimizationPreset, 'kustom'>;
  title: string;
  desc: string;
  summary: string;
}[] = [
  {
    id: 'ringan',
    title: 'Ringan & Hemat RAM',
    desc: 'Overhead CPU minimal untuk perangkat dengan memori terbatas atau baterai rendah.',
    summary: 'Keep-Alive 60s · Buffer 32 KB · Tanpa Kompresi',
  },
  {
    id: 'stabil',
    title: 'Stabil & Anti-RTO',
    desc: 'Menjaga sesi SlowDNS tetap hidup di jaringan operator dengan NAT timeout ketat.',
    summary: 'Keep-Alive 15s · TCP NoDelay · MTU 1380',
  },
  {
    id: 'responsif',
    title: 'Responsif Low-Ping',
    desc: 'Prioritaskan waktu respons cepat untuk browsing interaktif dan pesan instan.',
    summary: 'Keep-Alive 15s · Fast Open · Buffer 128 KB',
  },
];

export function OptimizationPanel({
  config,
  onChange,
  onRunProbe,
  probing,
  probeResult,
}: OptimizationPanelProps) {
  const applyPreset = (presetId: Exclude<OptimizationPreset, 'kustom'>) => {
    onChange({
      preset: presetId,
      ...OPTIMIZATION_PRESETS[presetId],
    });
  };

  const updateField = <K extends keyof Omit<OptimizationConfig, 'preset'>>(
    key: K,
    value: OptimizationConfig[K]
  ) => {
    onChange({
      ...config,
      preset: 'kustom',
      [key]: value,
    });
  };

  const estimatedRamMb =
    14 + (config.bufferKb === 128 ? 6 : config.bufferKb === 64 ? 3 : 1) + (config.dnsCache ? 2 : 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b-2 border-[#111111] pb-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#111111] sm:text-3xl">
            Optimasi Performa &amp; Stabilitas
          </h1>
          <p className="mt-1 text-sm text-[#4b4b46]">
            Atur parameter TCP, MTU, dan cache DNS agar tunnel SlowDNS tetap ringan, stabil, dan responsif.
          </p>
        </div>

        <button
          type="button"
          onClick={onRunProbe}
          disabled={probing}
          className="nb-btn inline-flex items-center gap-2 bg-[#b8f25a] px-4 py-2 text-xs font-extrabold text-[#111111] whitespace-nowrap shrink-0 cursor-pointer hover:bg-[#a5e63f] disabled:opacity-60"
        >
          <Activity className="h-4 w-4" />
          <span>{probing ? 'Mengukur Stabilitas...' : 'Uji Responsivitas Sekarang'}</span>
        </button>
      </div>

      {/* Presets */}
      <section aria-label="Preset optimasi">
        <div className="grid gap-4 md:grid-cols-3">
          {PRESET_CARDS.map((card) => {
            const active = config.preset === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => applyPreset(card.id)}
                className={`nb-card text-left p-5 cursor-pointer transition-colors ${
                  active ? 'bg-[#b8f25a]' : 'bg-white hover:bg-[#f6f5f0]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-[#111111]">
                    {card.title}
                  </h2>
                  <span className="border border-[#111111] bg-white px-2 py-0.5 text-[11px] font-bold text-[#111111]">
                    {active ? 'Aktif' : 'Pilih'}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#27272a]">
                  {card.desc}
                </p>
                <div className="mt-3 border-t border-[#111111]/20 pt-2.5 font-mono text-[11px] font-semibold text-[#111111]">
                  {card.summary}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Parameter Tuning & Real-time Probe */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="nb-card p-5 sm:p-6 lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <h2 className="font-display text-lg font-bold text-[#111111]">
              Parameter Lanjutan
            </h2>
            <span className="text-xs font-semibold text-[#4b4b46]">
              Mode:{' '}
              {config.preset === 'kustom'
                ? 'Kustom'
                : config.preset.charAt(0).toUpperCase() + config.preset.slice(1)}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#111111]">
                Interval Keep-Alive
              </label>
              <select
                value={config.keepAliveSec}
                onChange={(e) =>
                  updateField(
                    'keepAliveSec',
                    Number(e.target.value) as OptimizationConfig['keepAliveSec']
                  )
                }
                className="nb-input w-full px-3 py-2 font-mono text-sm font-semibold"
              >
                <option value={15}>15 detik (Agresif)</option>
                <option value={30}>30 detik (Normal)</option>
                <option value={60}>60 detik (Hemat)</option>
                <option value={0}>Nonaktif</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#111111]">
                MTU Tunnel
              </label>
              <select
                value={config.mtu}
                onChange={(e) =>
                  updateField(
                    'mtu',
                    Number(e.target.value) as OptimizationConfig['mtu']
                  )
                }
                className="nb-input w-full px-3 py-2 font-mono text-sm font-semibold"
              >
                <option value={1280}>1280 bytes (Responsif)</option>
                <option value={1380}>1380 bytes (Anti-Fragmentasi)</option>
                <option value={1420}>1420 bytes (Standar)</option>
                <option value={1500}>1500 bytes (Maksimum)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#111111]">
                Ukuran Buffer Socket
              </label>
              <select
                value={config.bufferKb}
                onChange={(e) =>
                  updateField(
                    'bufferKb',
                    Number(e.target.value) as OptimizationConfig['bufferKb']
                  )
                }
                className="nb-input w-full px-3 py-2 font-mono text-sm font-semibold"
              >
                <option value={32}>32 KB (Paling Ringan)</option>
                <option value={64}>64 KB (Seimbang)</option>
                <option value={128}>128 KB (Throughput Tinggi)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 border-t border-neutral-200 pt-4">
            {[
              {
                key: 'tcpNoDelay' as const,
                title: 'TCP NoDelay (Matikan Algoritma Nagle)',
                desc: 'Mengirim paket kecil SSH tanpa menunggu antrean buffer agar respons klik dan ketikan instan.',
              },
              {
                key: 'tcpFastOpen' as const,
                title: 'TCP Fast Open',
                desc: 'Mempercepat proses handshake ulang saat membuka sesi koneksi baru.',
              },
              {
                key: 'dnsCache' as const,
                title: 'DNS Cache & Prefetching Lokal',
                desc: 'Menyimpan resolusi domain yang sering diakses untuk memangkas delay SlowDNS.',
              },
              {
                key: 'zlibCompression' as const,
                title: 'Kompresi SSH (zlib)',
                desc: 'Mengompres payload teks/web pada jalur SlowDNS berkecepatan rendah.',
              },
            ].map((item) => {
              const checked = config[item.key];
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <div className="text-sm font-bold text-[#111111]">
                      {item.title}
                    </div>
                    <p className="text-xs text-[#4b4b46]">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => updateField(item.key, !checked)}
                    className={`nb-btn px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                      checked
                        ? 'bg-[#b8f25a] text-[#111111]'
                        : 'bg-[#eceae2] text-[#4b4b46]'
                    }`}
                  >
                    {checked ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Diagnostics & Lightweight Footprint */}
        <section className="nb-card p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-[#111111] border-b-2 border-[#111111] pb-3">
              Hasil Diagnostik &amp; Efisiensi
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-[#111111] bg-[#f6f5f0] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4b4b46]">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Jejak Memori</span>
                </div>
                <div className="mt-1 font-mono text-xl font-extrabold text-[#111111]">
                  ~{estimatedRamMb} MB
                </div>
                <div className="mt-0.5 text-[11px] text-[#4b4b46]">
                  Client minimalis ringan
                </div>
              </div>

              <div className="border-2 border-[#111111] bg-[#f6f5f0] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4b4b46]">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Respons Paket</span>
                </div>
                <div className="mt-1 font-mono text-xl font-extrabold text-[#111111]">
                  {config.tcpNoDelay ? 'Instan' : 'Normal'}
                </div>
                <div className="mt-0.5 text-[11px] text-[#4b4b46]">
                  MTU {config.mtu} bytes
                </div>
              </div>
            </div>

            <div className="border-2 border-[#111111] bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111]">
                  Pengukuran Jaringan Browser
                </span>
                <span className="font-mono text-xs text-[#4b4b46]">
                  {probeResult ? probeResult.measuredAt : 'Belum diuji'}
                </span>
              </div>

              {probeResult ? (
                <dl className="space-y-2 border-t border-neutral-200 pt-2.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-[#4b4b46]">Rata-rata RTT</dt>
                    <dd className="font-mono font-bold text-[#111111]">
                      {probeResult.rttMs} ms
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#4b4b46]">Jitter Jaringan</dt>
                    <dd className="font-mono font-bold text-[#111111]">
                      ±{probeResult.jitterMs} ms
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#4b4b46]">Tipe Koneksi Terdeteksi</dt>
                    <dd className="font-mono font-bold text-[#111111]">
                      {probeResult.effectiveType}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#4b4b46]">Status Stabilitas</dt>
                    <dd className="font-bold text-[#16a34a]">
                      {probeResult.stabilityScore}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs leading-relaxed text-[#4b4b46]">
                  Klik Uji Responsivitas Sekarang untuk mengukur RTT dan jitter koneksi perangkat Anda secara langsung.
                </p>
              )}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[#4b4b46]">
            Tips: Untuk jaringan SlowDNS yang sering mengalami timeout saat pindah BTS, gunakan preset Stabil dengan Keep-Alive 15 detik dan MTU 1380.
          </p>
        </section>
      </div>
    </div>
  );
}
