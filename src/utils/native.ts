import { Capacitor, registerPlugin } from '@capacitor/core';

export interface KhVpnPlugin {
  connect(opts: Record<string, unknown>): Promise<void>;
  disconnect(): Promise<void>;
  ping(opts: { host: string; port: number }): Promise<{ ms: number }>;
  addListener(
    event: 'state',
    cb: (e: { state: string; message: string }) => void
  ): Promise<{ remove: () => void }>;
}

export const isNative = Capacitor.isNativePlatform();
export const KhVpn = registerPlugin<KhVpnPlugin>('KhVpn');
