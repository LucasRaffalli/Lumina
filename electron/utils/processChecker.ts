import { exec } from 'child_process';

export function isDiscordRunning(): Promise<boolean> {
    return new Promise((resolve) => {
        const platform = process.platform;
        let command = '';
        
        switch (platform) {
            case 'win32':
                command = 'tasklist /FI "IMAGENAME eq Discord.exe"';
                break;
            case 'darwin':
                command = 'pgrep -x Discord';
                break;
            case 'linux':
                command = 'pgrep -x Discord';
                break;
            default:
                resolve(false);
                return;
        }

        exec(command, (error, stdout) => {
            if (error) {
                resolve(false);
                return;
            }
            
            // Sur Windows, vérifie si la sortie contient "Discord.exe"
            if (platform === 'win32') {
                resolve(stdout.toLowerCase().includes('discord.exe'));
            } else {
                // Sur Unix, pgrep renvoie un PID s'il trouve le processus
                resolve(stdout.trim().length > 0);
            }
        });
    });
}
