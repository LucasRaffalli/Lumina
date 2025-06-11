import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import "@radix-ui/themes/styles.css";
import "@radix-ui/themes/layout.css";
import './index.css'
import '../electron/win/window.css'
import { HashRouter, useLocation } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import './i18n';
import { WindowContextProvider } from '../electron/win/components/WindowContext';
import { menuItems } from '../electron/win';
import { WindowSizeProvider } from './context/WindowSizeContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { t } from 'i18next';
import { UpdateProvider } from './context/UpdateContext';


const Root = () => {
  const { themeMode, toggleTheme, accentColor } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Lumina - ' + t('menu.file.home');
      case '/settings':
        return 'Lumina - ' + t('settings.title');
      default:
        return 'Lumina';
    }
  };
  React.useEffect(() => {
    const initializeSettings = async () => {
      const config = await window.ipcRenderer.invoke('get-app-config');
      if (config.themeMode !== themeMode) {
        toggleTheme(config.themeMode);
      }

      if (config.autoConnect) {
        const lastProfile = localStorage.getItem("lastUsedProfile");
        if (lastProfile) {
          const profile = JSON.parse(lastProfile);
          window.ipcRenderer.send('start-rich', {
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
        <UpdateProvider>
          <WindowSizeProvider>
            <App />
          </WindowSizeProvider>
        </UpdateProvider>
      </WindowContextProvider>
    </Theme>
  );
}

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement as HTMLElement).render(
  <ThemeProvider>
    <HashRouter>
      <Root />
    </HashRouter>
  </ThemeProvider>
);
window.postMessage({ payload: 'removeLoading' }, '*');