// src/renderer/RichPresenceForm.tsx
import { Box, Button, Flex, IconButton, Select, TextField, Separator, Text } from '@radix-ui/themes';
import { ArrowDown01, BookOpen, ChartArea, Clock, Fingerprint, Image, Plus, Save, Trash } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { motion } from 'framer-motion';


export function RichPresenceForm() {
    const [details, setDetails] = useState('');
    const [state, setState] = useState('');
    const [clientId, setClientId] = useState<string>('');
    const [partySize, setPartySize] = useState<number | ''>('');
    const [partyMax, setPartyMax] = useState<number | ''>('');
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [updateCooldown, setUpdateCooldown] = useState(false);
    const [cooldownTimer, setCooldownTimer] = useState(0);

    const [largeImageKeys] = useState<string[]>([]);
    const [largeImage, setLargeImage] = useState('');
    const [largeText, setLargeText] = useState('');

    const [smallImageKeys] = useState<string[]>([]);
    const [smallImage, setSmallImage] = useState('');
    const [smallText, setSmallText] = useState('');
    const [allImageKeys, setAllImageKeys] = useState<string[]>([]);
    const [timestamp, setTimestamp] = useState<string | ''>('');
    const [activityType, setActivityType] = useState<string>('PLAYING');

    useEffect(() => {
        const loadLastSession = async () => {
            try {
                const savedId = await window.electron.ipcRenderer.invoke('load-client-id');
                if (savedId) setClientId(String(savedId));

                const lastProfileStr = localStorage.getItem("lastUsedProfile");
                if (lastProfileStr) {
                    const lastProfile = JSON.parse(lastProfileStr);
                    setClientId(String(lastProfile.clientId || ''));
                    setDetails(lastProfile.details || '');
                    setState(lastProfile.state || '');
                    setTimestamp(
                        typeof lastProfile.timestamp === 'string' && lastProfile.timestamp.length >= 16
                            ? lastProfile.timestamp.slice(0, 16)
                            : ''
                    );
                    setLargeImage(lastProfile.largeImage || '');
                    setLargeText(lastProfile.largeText || '');
                    setSmallImage(lastProfile.smallImage || '');
                    setSmallText(lastProfile.smallText || '');
                    setPartySize(lastProfile.partySize === '' ? '' : Number(lastProfile.partySize));
                    setPartyMax(lastProfile.partyMax === '' ? '' : Number(lastProfile.partyMax));
                    console.log("Dernier profil chargé:", lastProfile);
                }
            } catch (error) {
                console.error("Erreur lors du chargement de la dernière session:", error);
            }
        }
        loadLastSession();
    }, [])
    useEffect(() => {
        const storedKeys = localStorage.getItem("imageKeys");
        if (storedKeys) {
            try {
                setAllImageKeys(JSON.parse(storedKeys));
            } catch (e) {
                console.error("Échec parsing imageKeys:", e);
            }
        }
    }, []);
    useEffect(() => {
        // Vérifier l'état de connexion initial
        const checkConnectionStatus = async () => {
            const status = await window.electron.ipcRenderer.invoke('rich-status');
            setIsConnected(status.isConnected);
        };
        checkConnectionStatus();

        // Mettre en place un intervalle pour vérifier l'état
        const interval = setInterval(checkConnectionStatus, 5000);
        return () => clearInterval(interval);
    }, []);
    const handleUpdate = () => {
        if (updateCooldown) return;

        const updateData: Record<string, any> = {};
        if (details.trim()) updateData.details = details.trim();
        if (state.trim()) updateData.state = state.trim();
        if (largeImage.trim()) updateData.largeImageKey = largeImage.trim();
        if (largeText.trim()) updateData.largeImageText = largeText.trim();
        if (smallImage.trim()) updateData.smallImageKey = smallImage.trim();
        if (smallText.trim()) updateData.smallImageText = smallText.trim();
        if (partySize !== '') {
            updateData.partySize = Number(partySize);
        }

        if (partyMax !== '') {
            updateData.partyMax = Number(partyMax);
        }
        if (timestamp) {
            const timestamprep = Math.floor(new Date(timestamp).getTime() / 1000);
            updateData.startTimestamp = timestamprep;
        }
        const currentProfile = {
            clientId,
            details,
            state,
            timestamp,
            largeImage,
            largeText,
            smallImage,
            smallText,
            partySize,
            partyMax,
            updatedAt: Date.now(),
        };
        localStorage.setItem("lastUsedProfile", JSON.stringify(currentProfile));
        console.log('Données envoyées à Discord RPC:', updateData);
        window.electron.ipcRenderer.send('update-rich', updateData);

        // Activer le cooldown avec compteur
        setUpdateCooldown(true);
        setCooldownTimer(5);

        const interval = setInterval(() => {
            setCooldownTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setUpdateCooldown(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 2000);
    };
    const handleConnect = async () => {
        if (!clientId.trim()) {
            console.error("L'ID d'application est requis");
            return;
        }

        setIsConnecting(true);
        try {
            const discordStatus = await window.electron.ipcRenderer.invoke('rich-status');
            if (!discordStatus.isDiscordOpen) {
                console.error("Discord n'est pas ouvert");
                return;
            }

            const currentProfile = {
                details: details.trim() || undefined,
                state: state.trim() || undefined,
                largeImageKey: largeImage.trim() || undefined,
                largeImageText: largeText.trim() || undefined,
                smallImageKey: smallImage.trim() || undefined,
                smallImageText: smallText.trim() || undefined,
                partySize: partySize === '' ? undefined : Number(partySize),
                partyMax: partyMax === '' ? undefined : Number(partyMax),
                startTimestamp: timestamp ? Math.floor(new Date(timestamp).getTime() / 1000) : undefined
            };

            await window.electron.ipcRenderer.invoke('save-app-config', {
                lastUsedProfile: currentProfile
            });

            window.electron.ipcRenderer.send('start-rich', {
                clientId: String(clientId),
                profile: currentProfile
            });

            localStorage.setItem("lastUsedProfile", JSON.stringify({
                ...currentProfile,
                clientId,
                timestamp,
                largeImage,
                largeText,
                smallImage,
                smallText,
                partySize,
                partyMax,
            }));
            setIsConnected(true);
        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
        } finally {
            setIsConnecting(false);
        }
    };
    const handleDisconnect = async () => {
        try {
            await window.electron.ipcRenderer.invoke('disconnect-rich');
            setIsConnected(false);
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        }
    };

    const handleRemoveImage = (
        key: string,
        keys: string[],
        setKeys: React.Dispatch<React.SetStateAction<string[]>>,
        storageKey?: string
    ) => {
        const updated = keys.filter(k => k !== key);
        setKeys(updated);

        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        }
    };
    const handleAddImage = (
        image: string,
        keys: string[],
        setKeys: React.Dispatch<React.SetStateAction<string[]>>,
        storageKey?: string
    ) => {
        const trimmed = image.trim();
        if (!trimmed) return;

        const localKeys = storageKey
            ? JSON.parse(localStorage.getItem(storageKey) || '[]')
            : keys;

        if (localKeys.includes(trimmed)) return;

        const updated = [...localKeys, trimmed];
        setKeys(updated);

        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        }
    };

    const handleSaveProfil = () => {
        const profileData = {
            clientId: String(clientId),
            details,
            state,
            timestamp,
            largeImage,
            largeText,
            smallImage,
            smallText,
            partySize,
            partyMax,
        };

        const existing = JSON.parse(localStorage.getItem("richProfiles") || "[]");

        if (editingProfileId) {
            const updatedProfiles = existing.map((p: any) =>
                p.id === editingProfileId
                    ? { ...profileData, id: editingProfileId, createdAt: p.createdAt }
                    : p
            );
            localStorage.setItem("richProfiles", JSON.stringify(updatedProfiles));
        } else {
            const newProfile = {
                ...profileData,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
            };
            existing.push(newProfile);
            localStorage.setItem("richProfiles", JSON.stringify(existing));
        }

        localStorage.setItem("lastUsedProfile", JSON.stringify(profileData));

        window.dispatchEvent(new Event("profile-saved"));
    };

    useEffect(() => {
        const handleFillFormData = (e: CustomEvent) => {
            if (e.detail) {
                const profile = e.detail;
                setEditingProfileId(profile.id || null);
                setClientId(String(profile.clientId || ''));
                setDetails(profile.details || '');
                setState(profile.state || '');
                setTimestamp(
                    typeof profile.timestamp === 'string' && profile.timestamp.length >= 16
                        ? profile.timestamp.slice(0, 16)
                        : ''
                );
                setLargeImage(profile.largeImage || '');
                setLargeText(profile.largeText || '');
                setSmallImage(profile.smallImage || '');
                setSmallText(profile.smallText || '');
                setPartySize(profile.partySize === '' ? '' : Number(profile.partySize));
                setPartyMax(profile.partyMax === '' ? '' : Number(profile.partyMax));
                localStorage.setItem("lastUsedProfile", JSON.stringify(profile));
            }
        };

        window.addEventListener("fill-form-data" as any, handleFillFormData as EventListener);

        return () => {
            window.removeEventListener("fill-form-data" as any, handleFillFormData as EventListener);
        };
    }, []);


    const handleReset = async () => {
        await window.electron.ipcRenderer.invoke('disconnect-rich');
        setEditingProfileId(null);
        setClientId('');
        setDetails('');
        setState('');
        setTimestamp('');
        setLargeImage('');
        setLargeText('');
        setSmallImage('');
        setSmallText('');
        setPartySize('');
        setPartyMax('');
        localStorage.removeItem('lastUsedProfile');
        console.log('✨ Formulaire réinitialisé');
    };

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                delayChildren: 0.05,
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 24,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 150,
                damping: 20
            }
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ height: "100%" }}>
            <Flex direction={"column"} gap={'4'}>
                <Flex direction={"column"} gap={"2"} width={"100%"}>
                    <Flex gap={"2"}>
                        <motion.div variants={itemVariants} style={{ width: "100%" }}>
                            <TextField.Root placeholder="Application ID" value={clientId} onChange={e => setClientId(e.target.value)} style={{ width: "100%" }}>
                                <TextField.Slot>
                                    <Fingerprint size={"18"} />
                                </TextField.Slot>
                            </TextField.Root>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <Button variant='soft' onClick={handleConnect} className='btnCursor' disabled={isConnecting || !clientId.trim() || isConnected}>
                                {isConnecting ? 'Connexion...' : 'Connect'}
                            </Button>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <Button variant='soft' color='red' onClick={handleDisconnect} className='btnCursor' disabled={!isConnected}>
                                Disconnect
                            </Button>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <Button variant='soft' color='green' onClick={handleUpdate} className='btnCursor' disabled={!isConnected || updateCooldown}>
                                {updateCooldown ? `${cooldownTimer}s` : 'Update'}
                            </Button>
                        </motion.div>
                    </Flex>
                    <Flex gap={"2"}>
                        <motion.div variants={itemVariants} style={{ width: "100%" }}>
                            <TextField.Root placeholder="Details" value={details} onChange={e => setDetails(e.target.value)} style={{ width: "100%" }}>
                                <TextField.Slot>
                                    <BookOpen size={"18"} />
                                </TextField.Slot>
                            </TextField.Root>
                        </motion.div>
                        <motion.div variants={itemVariants} style={{ width: "100%" }}>
                            <TextField.Root placeholder="timestamp" type='datetime-local' value={timestamp} onChange={e => setTimestamp(e.target.value)} />
                        </motion.div>

                    </Flex>


                    <motion.div variants={itemVariants}><Separator size={"4"} /></motion.div>


                    <Flex width={"100%"} gap={"2"}>
                        <motion.div variants={itemVariants}>
                            <TextField.Root placeholder="État" value={state} onChange={e => setState(e.target.value)} style={{ width: "100%" }}>
                                <TextField.Slot>
                                    <ChartArea size={"18"} />
                                </TextField.Slot>
                            </TextField.Root>
                        </motion.div>
                        <motion.div variants={itemVariants}>  <TextField.Root placeholder="partySize" value={partySize} style={{ width: "100%" }} type='number' onChange={e => setPartySize(e.target.value === '' ? '' : Number(e.target.value))}>
                            <TextField.Slot>
                                <ArrowDown01 size={"18"} />
                            </TextField.Slot>
                        </TextField.Root>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <TextField.Root placeholder="PartyMax" value={partyMax} style={{ width: "100%" }} type='number' onChange={e => setPartyMax(e.target.value === '' ? '' : Number(e.target.value))}>
                                <TextField.Slot>
                                    <ArrowDown01 size={"18"} />
                                </TextField.Slot>
                            </TextField.Root>
                        </motion.div>
                    </Flex>


                    <motion.div variants={itemVariants}><Separator size={"4"} /></motion.div>

                    <Flex direction={"column"} gap={"2"}>
                        <Flex gap={"2"} width={"100%"}>
                            <Select.Root value={largeImage} onValueChange={setLargeImage}>
                                <motion.div variants={itemVariants}>
                                    <Select.Trigger className='inputTextImage2 btnCursor' />
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <TextField.Root placeholder="Clé grande image" value={largeImage} className='btnW' onChange={e => setLargeImage(e.target.value)}>
                                        <TextField.Slot>
                                            <Image size={18} />
                                        </TextField.Slot>
                                        <TextField.Slot>
                                            <IconButton size={"1"} variant='ghost' color='gray' className='btnCursor' onClick={() => handleAddImage(largeImage, largeImageKeys, setAllImageKeys, "imageKeys")}>
                                                <Plus size={14} />
                                            </IconButton>
                                            <IconButton size={"1"} variant='ghost' color='gray' className='btnCursor' onClick={() => handleRemoveImage(largeImage, allImageKeys, setAllImageKeys, "imageKeys")}>
                                                <Trash size={14} />
                                            </IconButton>
                                        </TextField.Slot>
                                    </TextField.Root>
                                </motion.div>
                                <Select.Content position='popper'>
                                    <Select.Group>
                                        {allImageKeys.map(key => (
                                            <Select.Item key={key} value={key} className='btnCursor' >
                                                {key}
                                            </Select.Item>
                                        ))}
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                            <motion.div variants={itemVariants}>
                                <TextField.Root value={largeText} placeholder="Texte grande image" style={{ width: "100%" }} onChange={(e) => setLargeText(e.target.value)} />
                            </motion.div>


                        </Flex>
                    </Flex>

                    <Flex gap={"2"} width={"100%"}>
                        <Select.Root value={smallImage} onValueChange={setSmallImage} >
                            <motion.div variants={itemVariants}>
                                <Select.Trigger className='inputTextImage2 btnCursor' />
                            </motion.div>
                            <motion.div variants={itemVariants}>

                                <TextField.Root placeholder="Clé petite image" value={smallImage} className='btnW' onChange={e => setSmallImage(e.target.value)}>
                                    <TextField.Slot>
                                        <Image size={18} />
                                    </TextField.Slot>
                                    <TextField.Slot>
                                        <IconButton size={"1"} variant='ghost' color='gray' className='btnCursor' onClick={() => handleAddImage(smallImage, smallImageKeys, setAllImageKeys, "imageKeys")}>
                                            <Plus size={14} />
                                        </IconButton>
                                        <IconButton size={"1"} variant='ghost' color='gray' className='btnCursor' onClick={() => handleRemoveImage(smallImage, allImageKeys, setAllImageKeys, "imageKeys")}>
                                            <Trash size={14} />
                                        </IconButton>
                                    </TextField.Slot>
                                </TextField.Root>
                            </motion.div>
                            <Select.Content position='popper' >
                                <Select.Group>
                                    {allImageKeys.map(key => (
                                        <Select.Item key={key} value={key} className='btnCursor' >
                                            {key}
                                        </Select.Item>
                                    ))}
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                        <motion.div variants={itemVariants}>
                            <TextField.Root className='inputTextImage' value={smallText} placeholder="Texte petit image" style={{ width: "100%" }} onChange={(e) => setSmallText(e.target.value)} />
                        </motion.div>
                    </Flex>

                    <motion.div variants={itemVariants}><Separator size={"4"} /></motion.div>

                    <Flex gap={"2"}>
                        {editingProfileId
                            ?
                            < motion.div variants={itemVariants} style={{ width: "100%" }}>
                                <Box width={"100%"}>
                                    <Button variant='soft' color='orange' onClick={handleSaveProfil} className='btnW btnCursor'>
                                        <Save size={"18"} />{editingProfileId ? 'Mettre à jour le profil' : 'Ajouter le profil'}
                                    </Button>

                                </Box>
                            </motion.div>
                            : <Box style={{ display: "none" }}></Box>
                        }
                        <motion.div variants={itemVariants} style={{ width: "100%" }}>
                            <Box width={"100%"}>
                                <Button variant='soft' color='orange' onClick={handleSaveProfil} className='btnW btnCursor'>
                                    <Save size={"18"} />
                                    <Text>Add Profil</Text>
                                </Button>
                            </Box>
                        </motion.div>
                        <motion.div variants={itemVariants} style={{ width: "100%" }}>

                            <Box width={"100%"}>
                                <Button variant='soft' color='red' onClick={handleReset} className='btnW btnCursor'>
                                    <Save size={"18"} />
                                    <Text>Reset</Text>
                                </Button>
                            </Box>
                        </motion.div>
                    </Flex>
                </Flex>
            </Flex>
        </motion.div >
    );
}
