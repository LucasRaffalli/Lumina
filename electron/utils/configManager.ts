import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const configPath = path.join(app.getPath('userData'), 'luminaConfig.json');

export function saveClientId(clientId: string) {
    fs.writeFileSync(configPath, JSON.stringify({ clientId }, null, 2));
}

export function loadClientId(): string | null {
    if (!fs.existsSync(configPath)) return null;

    try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const data = JSON.parse(raw);
        return data.clientId || null;
    } catch {
        return null;
    }
}

export function resetClientId() {
    if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
    }
}