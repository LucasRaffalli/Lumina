import { Box, Flex, Switch, Text, Select, Separator, ScrollArea } from '@radix-ui/themes'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { version } from '../../package.json';
import { useTranslation } from 'react-i18next'
import ContainerInterface from '@/components/template/ContainerInterface';
import ImportExportProfiles from '@/components/ImportExportProfiles';
import { ACCENT_COLORS, AccentColor, AppSettings } from '@/utils/lumina';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';


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
        window.ipcRenderer.invoke('get-app-config').then((config: any) => {
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

        window.ipcRenderer.invoke('save-app-config', newSettings);
    };

    const handleLanguageChange = (language: string) => {
        i18n.changeLanguage(language);
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
            <ContainerInterface direction='column' padding='4' width='100%' height='100%' gap="4" overflow='hidden'>
                <Flex justify="between" align="center">
                    <motion.div variants={itemVariants}>
                        <Text size="5">{t('settings.title')}</Text>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Link to={'/'} className='hover__underline'><ChevronLeft />{t('buttons.back')}</Link>
                    </motion.div>
                </Flex>
                <motion.div variants={itemVariants}>
                    <Separator size={"4"} />
                </motion.div>

                <Flex gap="4" direction="column" className='scroll-area' height={"295px"}>
                    <motion.div variants={itemVariants}>
                        <Flex justify="between" align="center">
                            <Text>{t('settings.language')}</Text>
                            <Select.Root defaultValue={i18n.language} onValueChange={handleLanguageChange}>
                                <Select.Trigger />
                                <Select.Content>
                                    <Select.Item value="fr">{t('settings.french')}</Select.Item>
                                    <Select.Item value="en">{t('settings.english')}</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </Flex>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Flex justify="between" align="center">
                            <Text>{t('settings.theme')}</Text>
                            <Select.Root value={settings.themeMode} onValueChange={(v) => handleSettingChange('themeMode', v)}>
                                <Select.Trigger />
                                <Select.Content>
                                    <Select.Item value="light">{t('settings.light')}</Select.Item>
                                    <Select.Item value="dark">{t('settings.dark')}</Select.Item>
                                    <Select.Item value="system">{t('settings.system')}</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </Flex>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Flex justify="between" align="center">
                            <Text>{t('settings.accentColor')}</Text>
                            <Select.Root value={settings.accentColor} onValueChange={(v) => handleSettingChange('accentColor', v as AccentColor)}>
                                <Select.Trigger value={settings.accentColor} />
                                <Select.Content position='popper'>
                                    {ACCENT_COLORS.map((color) => (
                                        <Select.Item key={color} value={color}>
                                            {color.charAt(0).toUpperCase() + color.slice(1)}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                        </Flex>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Flex justify="between" align="center">
                            <Text>{t('settings.autoConnect')}</Text>
                            <Switch checked={settings.autoConnect} onCheckedChange={(v) => handleSettingChange('autoConnect', v)} />
                        </Flex>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Flex justify="between" align="center">
                            <Text>{t('settings.startMinimized')}</Text>
                            <Switch checked={settings.startMinimized} onCheckedChange={(v) => handleSettingChange('startMinimized', v)} />
                        </Flex>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Flex justify="between" align="center">
                            <Text>{t('settings.runOnStartup')}</Text>
                            <Switch checked={settings.runOnStartup} onCheckedChange={(v) => handleSettingChange('runOnStartup', v)} />
                        </Flex>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <ImportExportProfiles />
                    </motion.div>
                </Flex>
                <motion.div variants={itemVariants}>
                    <Separator size={"4"} />

                </motion.div>

                <Flex justify="between" align="center">
                    <motion.div variants={itemVariants}>
                        <Text size='2' color='gray' align='center'>
                            <Link to={'https://discord.com/developers/applications'} target="_blank" rel="noopener noreferrer" className='hover__underline'>{t('settings.discordPortal')}</Link>
                        </Text>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Text size='2' color='gray' align='center'>
                            {t('settings.version')}: {version}
                        </Text>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Text size='2' color='gray' align='center'>
                            <Link to={'https://discord.com/developers/applications'} target="_blank" rel="noopener noreferrer" className='hover__underline'>{t('settings.github')}</Link>
                        </Text>
                    </motion.div>
                </Flex>
            </ContainerInterface>
        </motion.div>

    )
}
