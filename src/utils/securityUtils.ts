// import { supabase } from '@/integrations/supabase/client';

/**
 * Utilitários de segurança para proteção do frontend
 * Versão simplificada — sem debugger loops, sem timing attacks, sem console suppression
 */

let protectionEnabled = true;

// Verificar configurações do banco
async function checkProtectionSettings(): Promise<boolean> {
  // try {
  //   const { data, error } = await supabase
  //     .from('system_settings')
  //     .select('setting_value')
  //     .eq('setting_key', 'debug_protection_enabled')
  //     .single();

  //   if (error || !data) return true;
  //   return data.setting_value === 'true';
  // } catch {
  return true;
  // }
}

// Detecção simples por tamanho de janela (threshold 160)
export function detectDevTools(): boolean {
  const threshold = 160;
  return (
    window.outerHeight - window.innerHeight > threshold ||
    window.outerWidth - window.innerWidth > threshold
  );
}

// Redirecionar para página de bloqueio
function blockAccess(): void {
  if (window.location.pathname !== '/blocked') {
    window.location.href = '/blocked';
  }
}

// Warning estilizado no console
function showConsoleWarning(): void {
  console.log(
    '%c⚠️ ATENÇÃO!',
    'color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 0 #000;'
  );
  console.log(
    '%cEsta é uma ferramenta de desenvolvedor do navegador.',
    'font-size: 16px;'
  );
  console.log(
    '%cSe alguém pediu para você colar algo aqui, isso é uma fraude.',
    'font-size: 16px; color: red;'
  );
  console.log(
    '%cFeche esta janela para sua segurança.',
    'font-size: 14px; color: orange;'
  );
}

// Inicializar proteções de segurança
export async function initializeSecurityProtections(): Promise<void> {
  if (typeof window === 'undefined') return;

  protectionEnabled = await checkProtectionSettings();

  // Não aplicar na página de bloqueio
  if (window.location.pathname === '/blocked') return;

  if (!protectionEnabled) {
    console.log('[Security] Debug protection disabled by admin');
    return;
  }

  // Warning no console
  showConsoleWarning();

  // Detecção por window size (verificação inicial + periódica)
  const checkDevTools = () => {
    // Ignorar em ambientes de desenvolvimento/preview
    const host = window.location.hostname;
    if (host.includes('lovable.app') || host === 'localhost' || host === '127.0.0.1') return;

    // Ignorar se zoom está ativo
    const zoomLevel = Math.round(window.devicePixelRatio * 100);
    if (zoomLevel !== 100) return;

    if (detectDevTools()) {
      blockAccess();
    }
  };

  setTimeout(checkDevTools, 1000);
  setInterval(checkDevTools, 3000);

  // Bloqueio de teclas de DevTools
  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'F12' ||
      (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C')) ||
      (event.ctrlKey && event.key === 'U')
    ) {
      event.preventDefault();
      return false;
    }
  });

  // Bloqueio de right-click
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    return false;
  });
}

// Atualizar configurações dinamicamente
export async function updateProtectionSettings(): Promise<void> {
  protectionEnabled = await checkProtectionSettings();
}

// Parar monitoramento (compatibilidade)
export function stopDevToolsMonitoring(): void {
  // No-op — monitoramento simplificado não precisa de cleanup
}

// Ofuscação básica de dados
export function obfuscateData(data: any): string {
  if (typeof data !== 'string') data = JSON.stringify(data);
  return btoa(data).split('').reverse().join('')
    .replace(/[A-Za-z]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + (char.toLowerCase() < 'n' ? 13 : -13))
    );
}

// Desofuscação
export function deobfuscateData(obfuscatedData: string): any {
  try {
    const decoded = obfuscatedData
      .replace(/[A-Za-z]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) + (char.toLowerCase() < 'n' ? 13 : -13))
      )
      .split('').reverse().join('');
    return JSON.parse(atob(decoded));
  } catch {
    return null;
  }
}

// Token manager (compatibilidade)
export class SecurityTokenManager {
  private static tokens: Map<string, string> = new Map();
  static generateToken(identifier: string): string {
    const token = btoa(Date.now() + Math.random().toString()).slice(0, 16);
    this.tokens.set(identifier, token);
    return token;
  }
  static validateToken(identifier: string, token: string): boolean {
    return this.tokens.get(identifier) === token;
  }
  static revokeToken(identifier: string): void { this.tokens.delete(identifier); }
  static clearAllTokens(): void { this.tokens.clear(); }
}
