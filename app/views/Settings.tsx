import { Box, Flex, Switch, Text, Select, Separator } from '@radix-ui/themes'
import React, { useEffect, useState } from 'react'
import ContainerInterface from '../template/ContainerInterface'
import { Link } from 'react-router-dom'
import { useTheme } from '@/lib/theme/ThemeContext'
import { AccentColor } from '@/lib/lumina'
import { useTranslation } from 'react-i18next'

const ACCENT_COLORS: AccentColor[] = [
    "tomato", "red", "ruby", "crimson", "pink", "plum", "purple",
    "violet", "iris", "indigo", "blue", "cyan", "teal", "jade",
    "green", "grass", "brown", "orange", "sky", "mint", "lime",
    "yellow", "amber", "gold", "bronze", "gray"
];

interface AppSettings {
    autoConnect: boolean;
    startMinimized: boolean;
    themeMode: 'light' | 'dark' | 'system';
    runOnStartup: boolean;
    accentColor: AccentColor;
}

export default function Settings() {
    const { t, i18n } = useTranslation();
    const { setAccentColor, toggleTheme } = useTheme();
    const [settings, setSettings] = useState<AppSettings>({
        autoConnect: false,
        startMinimized: false,
        themeMode: 'dark',
        runOnStartup: false,
        accentColor: 'amber'
    });

    useEffect(() => {
        // Charger la configuration au démarrage
        window.electron.ipcRenderer.invoke('get-app-config').then((config) => {
            setSettings(config);
            if (config.accentColor) {
                setAccentColor(config.accentColor);
            }
        });
    }, [setAccentColor]);

    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        if (key === 'themeMode') {
            toggleTheme(value);
        } else if (key === 'accentColor') {
            setAccentColor(value);
        }

        window.electron.ipcRenderer.invoke('save-app-config', newSettings);
    };

    const handleLanguageChange = (language: string) => {
        i18n.changeLanguage(language);
    };

    return (
        <ContainerInterface direction='column' padding='4' width='100%' height='100%' gap="4">
            <Flex justify="between" align="center">
                <Text size="5">{t('settings.title')}</Text>
                <Link to={'/'}>Retour</Link>
            </Flex>
            <Separator size={"4"} />
            <Flex gap="4" direction="column">
                <Flex justify="between" align="center">
                    <Text>{t('settings.language')}</Text>
                    <Select.Root defaultValue={i18n.language} onValueChange={handleLanguageChange}>
                        <Select.Trigger />
                        <Select.Content>
                            <Select.Item value="fr">Français</Select.Item>
                            <Select.Item value="en">English</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Flex justify="between" align="center">
                    <Text>Thème</Text>
                    <Select.Root value={settings.themeMode} onValueChange={(v) => handleSettingChange('themeMode', v)}>
                        <Select.Trigger />
                        <Select.Content>
                            <Select.Item value="light">Clair</Select.Item>
                            <Select.Item value="dark">Sombre</Select.Item>
                            <Select.Item value="system">Système</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Flex justify="between" align="center">
                    <Text>Couleur d'accent</Text>
                    <Select.Root value={settings.accentColor} onValueChange={(v) => handleSettingChange('accentColor', v as AccentColor)}>
                        <Select.Trigger />
                        <Select.Content position='popper'>
                            {ACCENT_COLORS.map((color) => (
                                <Select.Item key={color} value={color}>
                                    {color.charAt(0).toUpperCase() + color.slice(1)}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Flex justify="between" align="center">
                    <Text>Connexion automatique</Text>
                    <Switch checked={settings.autoConnect} onCheckedChange={(v) => handleSettingChange('autoConnect', v)} />
                </Flex>

                <Flex justify="between" align="center">
                    <Text>Démarrer minimisé</Text>
                    <Switch checked={settings.startMinimized} onCheckedChange={(v) => handleSettingChange('startMinimized', v)} />
                </Flex>

                <Flex justify="between" align="center">
                    <Text>Lancer au démarrage</Text>
                    <Switch checked={settings.runOnStartup} onCheckedChange={(v) => handleSettingChange('runOnStartup', v)} />
                </Flex>
            </Flex>
        </ContainerInterface>
    )
}
