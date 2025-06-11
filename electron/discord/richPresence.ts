import RPC from 'discord-rpc';
import { randomUUID } from 'crypto';
import { isDiscordRunning } from '../utils/processChecker';

let rpc: RPC.Client | null = null;
let connected = false;
let currentClientId = '';
let currentActivity: Partial<RPC.Presence> = {};
let currentPartyId = '';
let retryTimeout: NodeJS.Timeout | null = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const CONNECTION_TIMEOUT = 10000;
let manualDisconnect = false;

async function cleanup(force = false) {
    if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
    }

    if (rpc) {
        try {
            if (!force) {
                await rpc.clearActivity();
            }
            await rpc.destroy();
        } catch (e) {
            console.warn('⚠️ Erreur lors du nettoyage:', e);
        }
        rpc = null;
    }

    if (force) {
        connected = false;
        currentActivity = {};
        currentPartyId = '';
        currentClientId = '';
        connectionAttempts = 0;
    }
}

async function attemptConnection(clientId: string, profile?: Partial<RPC.Presence>) {
    try {
        const isRunning = await isDiscordRunning();
        if (!isRunning) {
            throw new Error('DISCORD_NOT_RUNNING');
        }
        await cleanup();
        connectionAttempts++;
        console.log(`⌛ Tentative de connexion ${connectionAttempts}/${MAX_RETRIES}...`);

        await RPC.register(clientId);
        rpc = new RPC.Client({ transport: 'ipc' });

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(async () => {
                if (connectionAttempts < MAX_RETRIES) {
                    console.log(`⌛ Timeout de connexion, tentative ${connectionAttempts + 1}/${MAX_RETRIES}...`);
                    await cleanup();
                    try {
                        const result = await attemptConnection(clientId, profile);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    await cleanup(true);
                    reject(new Error('CONNECTION_TIMEOUT_MAX_RETRIES'));
                }
            }, CONNECTION_TIMEOUT);

            rpc!.once('ready', async () => {
                clearTimeout(timeoutId);
                connected = true;
                connectionAttempts = 0;
                console.log('RPC connecte avec ID:', clientId);

                const initialActivity: RPC.Presence = {
                    instance: false,
                    partyId: currentPartyId,
                    buttons: [
                        { label: 'Site web', url: 'https://lumina.app' },
                        { label: 'Documentation', url: 'https://www.youtube.com/' }
                    ]
                };

                if (profile) {
                    const updates = {
                        details: profile.details?.trim(),
                        state: profile.state?.trim(),
                        largeImageKey: profile.largeImageKey || profile.largeImageKey,
                        largeImageText: profile.largeImageText || profile.largeImageText,
                        smallImageKey: profile.smallImageKey || profile.smallImageKey,
                        smallImageText: profile.smallImageText || profile.smallImageText,
                        startTimestamp: profile.startTimestamp || (profile.endTimestamp ? new Date(profile.endTimestamp).getTime() : undefined),
                        partySize: profile.partySize ? Number(profile.partySize) : undefined,
                        partyMax: profile.partyMax ? Number(profile.partyMax) : undefined
                    };

                    Object.entries(updates).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            (initialActivity as any)[key] = value;
                        }
                    });
                }

                currentActivity = { ...initialActivity };
                try {
                    await rpc?.setActivity(initialActivity);
                    resolve(true);
                } catch (error) {
                    console.error('❌ Erreur lors de la définition de l\'activité initiale:', error);
                    reject(error);
                }
            });

            rpc!.on('disconnected', async () => {
                console.log('RPC deconnecte');
                connected = false;

                if (retryTimeout) {
                    clearTimeout(retryTimeout);
                }

                if (!manualDisconnect) {
                    retryTimeout = setTimeout(async () => {
                        if (!connected && connectionAttempts < MAX_RETRIES) {
                            try {
                                await attemptConnection(clientId, profile);
                            } catch (error) {
                                console.error('❌ Échec de la reconnexion automatique:', error);
                                await cleanup(true);
                            }
                        }
                    }, RETRY_DELAY);
                }
            });

            rpc!.login({ clientId }).catch(async error => {
                clearTimeout(timeoutId);
                await cleanup();
                reject(error);
            });
        });
    } catch (error: any) {
        console.error(`❌ Tentative de connexion ${connectionAttempts} échouée:`, error);

        if (error?.message === 'DISCORD_NOT_RUNNING') {
            console.log('⚠️ Discord n\'est pas en cours d\'exécution');
            await cleanup(true);
            return;
        }

        if (connectionAttempts < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return attemptConnection(clientId, profile);
        }

        await cleanup(true);
        throw error;
    }
}

export async function startRichPresence(clientId: string, profile?: Partial<RPC.Presence>) {
    manualDisconnect = false;
    try {
        // Si déjà connecté avec le même ID, déconnecter d'abord
        if (connected && clientId === currentClientId && rpc) {
            await stopRichPresence();
        }

        // Réinitialiser l'état
        connected = false;
        currentClientId = clientId;
        currentActivity = {};
        currentPartyId = randomUUID();

        // Tenter la connexion avec retry
        await attemptConnection(clientId, profile);
    } catch (error) {
        console.error('❌ Erreur globale dans startRichPresence:', error);
        // S'assurer que tout est nettoyé en cas d'erreur
        await stopRichPresence();
        throw error;
    }
}

export async function stopRichPresence() {
    manualDisconnect = true;
    try {
        await cleanup();
    } catch (error) {
        console.error('❌ Erreur lors de l\'arrêt du RPC:', error);
    }
}

export function updateRichPresence(data: Partial<{
    details: string;
    state: string;
    largeImageKey: string;
    largeImageText: string;
    smallImageKey: string;
    smallImageText: string;
    partySize: number;
    partyMax: number;
    startTimestamp: number;
}>) {
    if (!rpc || !connected) {
        console.warn('⚠️ Impossible de mettre à jour: RPC non connecté');
        return;
    }

    try {
        const updatedActivity: any = { ...currentActivity };
        // Ne met à jour que si la valeur n'est pas vide après le trim
        if (data.details) {
            const trimmedDetails = data.details.trim();
            if (trimmedDetails) updatedActivity.details = trimmedDetails;
        }
        if (data.state) {
            const trimmedState = data.state.trim();
            if (trimmedState) updatedActivity.state = trimmedState;
        }
        if (data.largeImageKey) updatedActivity.largeImageKey = data.largeImageKey;
        if (data.largeImageText) {
            const trimmedText = data.largeImageText.trim();
            if (trimmedText) updatedActivity.largeImageText = trimmedText;
        }
        if (data.smallImageKey) updatedActivity.smallImageKey = data.smallImageKey;
        if (data.smallImageText) {
            const trimmedText = data.smallImageText.trim();
            if (trimmedText) updatedActivity.smallImageText = trimmedText;
        }
        if (typeof data.partyMax === 'number') updatedActivity.partyMax = data.partyMax;
        if (typeof data.partySize === 'number') updatedActivity.partySize = data.partySize;
        if (data.startTimestamp) updatedActivity.startTimestamp = data.startTimestamp;

        currentActivity = { ...updatedActivity };
        rpc.setActivity(updatedActivity);
        console.log('✅ RPC mis à jour avec:', updatedActivity);
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du RPC:', error);
    }
}
