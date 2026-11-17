export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

export function getUserThemePreference(): Theme | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return null;
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Each page declares its default (blueprint, or whiteprint for long reading); a stored choice wins.
export function getResolvedTheme(root: HTMLElement = document.documentElement): Theme {
  return getUserThemePreference() ?? (root.dataset.defaultTheme === 'light' ? 'light' : 'dark');
}

export function getStoredTheme(): Theme {
  return getResolvedTheme();
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): Theme {
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  return theme;
}

export function applyResolvedTheme(root: HTMLElement = document.documentElement): Theme {
  return applyTheme(getResolvedTheme(root), root);
}

export function applyStoredTheme(root: HTMLElement = document.documentElement): Theme {
  return applyResolvedTheme(root);
}

function dispatchThemeApplied(theme: Theme): void {
  document.dispatchEvent(new CustomEvent('theme-applied', { detail: { theme } }));
}

export function registerThemePersistence(): void {
  if (window.__themePersistenceRegistered) return;
  window.__themePersistenceRegistered = true;

  document.addEventListener('astro:before-swap', (event) => {
    const swapEvent = event as Event & {
      newDocument?: Document;
      detail?: { newDocument?: Document };
    };
    const newDocument = swapEvent.newDocument ?? swapEvent.detail?.newDocument;
    if (newDocument?.documentElement) {
      applyResolvedTheme(newDocument.documentElement);
    }
  });

  document.addEventListener('astro:after-swap', () => {
    const theme = applyResolvedTheme();
    dispatchThemeApplied(theme);
  });
}
