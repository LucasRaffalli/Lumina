import React from 'react'
import ReactDOM from 'react-dom/client'
import { WindowContextProvider, menuItems } from '@/lib/window'
import '@/lib/window/window.css'
import './styles/global.css'
import "@radix-ui/themes/styles.css";
import { Theme } from '@radix-ui/themes'
import { BrowserRouter } from 'react-router-dom'
import { HashRouter, useLocation } from 'react-router-dom';
import App from './App'
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeContext'
import './i18n' // Importer la configuration i18n


function Main() {
  const { themeMode, toggleTheme, accentColor } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Lumina - Accueil';
      case '/settings':
        return 'Lumina - Paramètres';
      case '/destiny':
        return 'Lumina - Destiny';
      default:
        return 'Lumina';
    }
  };

  React.useEffect(() => {
    // Charger et appliquer les paramètres au démarrage
    const initializeSettings = async () => {
      const config = await window.electron.ipcRenderer.invoke('get-app-config');
      if (config.themeMode !== themeMode) {
        toggleTheme(config.themeMode);
      }

      if (config.autoConnect) {
        // TODO: Implémenter la connexion automatique
        const lastProfile = localStorage.getItem("lastUsedProfile");
        if (lastProfile) {
          const profile = JSON.parse(lastProfile);
          window.electron.ipcRenderer.send('start-rich', {
            clientId: profile.clientId,
            profile: profile
          });
        }
      }
    };

    initializeSettings();
  }, []);

  const resolvedAppearance =
    themeMode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : themeMode;
  return (
    <Theme appearance={resolvedAppearance} panelBackground="translucent" grayColor='sand' accentColor={accentColor} radius="medium" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <WindowContextProvider titlebar={{ title: getPageTitle(), icon: "./assets/favicon.ico", menuItems }}>
        <App />
      </WindowContextProvider>
    </Theme>
  );
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <ThemeProvider>
    <HashRouter>
      <Main />
    </HashRouter>
  </ThemeProvider>
)
