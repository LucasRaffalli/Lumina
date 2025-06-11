import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const configPath = path.join(app.getPath('userData'), 'appConfig.json');

interface AppConfig {
    autoConnect: boolean;
    startMinimized: boolean;
    themeMode: 'light' | 'dark' | 'system';
    runOnStartup: boolean;
}

const defaultConfig: AppConfig = {
    autoConnect: false,
    startMinimized: false,
    themeMode: 'dark',
    runOnStartup: false
};

export function loadAppConfig(): AppConfig {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }

    try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        return { ...defaultConfig, ...JSON.parse(raw) };
    } catch {
        return defaultConfig;
    }
}

export function saveAppConfig(config: Partial<AppConfig>) {
    // On ne recharge pas la config existante, on utilise directement les valeurs par défaut
    const newConfig = { ...defaultConfig, ...config };
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    return newConfig;
}

export function toggleStartup(enable: boolean): void {
    if (process.platform === 'win32') {
        const appPath = app.getPath('exe');
        const startupPath = path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'Lumina.lnk');
        
        if (enable) {
            app.setLoginItemSettings({
                openAtLogin: true,
                path: appPath
            });
        } else {
            app.setLoginItemSettings({
                openAtLogin: false
            });
        }
    }
}

export function checkStartupEnabled(): boolean {
    if (process.platform === 'win32') {
        const settings = app.getLoginItemSettings();
        return settings.openAtLogin;
    }
    return false;
}
