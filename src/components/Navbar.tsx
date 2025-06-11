import { Avatar, Box, Flex, Heading, HoverCard, ScrollArea, Tooltip, Text, Link, Separator, Button } from '@radix-ui/themes'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import EditableText from './EditableText';
import { t } from 'i18next';

type Profile = {
    id: string;
    profileName?: string;
    clientId: string;
    details: string;
    timestamp: string;
    state: string;
    largeImage: string;
    largeText: string;
    smallImage: string;
    smallText: string;
    partySize: string;
    partyMax: string;
    createdAt: number;
}

export default function Navbar() {
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };
    useEffect(() => {
        const loadProfiles = () => {
            const saved = JSON.parse(localStorage.getItem("richProfiles") || "[]");
            const sanitizedProfiles = saved.map((profile: Profile) => ({
                ...profile,
                clientId: String(profile.clientId || '')
            }));
            setProfiles(sanitizedProfiles);
        }
        loadProfiles();
        window.addEventListener("profile-saved", loadProfiles);
        return () => window.removeEventListener("profile-saved", loadProfiles);
    }, []);
    const handleChange = (index: number, field: keyof Profile, value: string) => {
        const updated = [...profiles];
        if (field === 'clientId') {
            updated[index] = { ...updated[index], [field]: String(value) };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setProfiles(updated);
        localStorage.setItem("richProfiles", JSON.stringify(updated));
    };

    const deleteProfile = (index: number) => {
        const updated = [...profiles];
        updated.splice(index, 1);
        setProfiles(updated);
        localStorage.setItem("richProfiles", JSON.stringify(updated));
    };

    const insertProfile = (index: number) => {
        const profile = profiles[index];
        window.dispatchEvent(new CustomEvent("fill-form-data", {
            detail: {
                ...profile,
                clientId: String(profile.clientId)
            }
        }));
    };
    return (
        <Flex direction="column" justify="between" width="64px">
            <ScrollArea type="hover" scrollbars="vertical" style={{ height: 428, width: "64px" }}>
                <Flex gap="2" direction="column">
                    {profiles.map((p, i) => (
                        <HoverCard.Root key={i}>
                            <HoverCard.Trigger>
                                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.1 }}>
                                    <Avatar radius='full' size="4" fallback="P1" className='btnCursor' />
                                </motion.div>
                            </HoverCard.Trigger>
                            <HoverCard.Content side='right' sideOffset={-5} width={"26rem"}>
                                <Flex direction="column" gap="2">
                                    <Flex direction={"column"}>
                                        <Text color='gray' size={'1'}>{t('discord.profilName')}</Text>
                                        <EditableText value={p.profileName || ''} onChange={(newVal) => handleChange(i, 'profileName', newVal)} as='heading' size='3' />
                                    </Flex>
                                    <Flex direction={"column"}>
                                        <Text color='gray' size={"1"} >
                                            {t('discord.clientId')}
                                        </Text>
                                        <EditableText value={p.clientId} onChange={(newVal) => handleChange(i, 'clientId', newVal)} as='heading' size='2' />
                                    </Flex>
                                    <Flex direction={"column"}>
                                        <Text color='gray' size={"1"}>
                                            {t('discord.details')}
                                        </Text>
                                        <EditableText value={p.details} onChange={(newVal) => handleChange(i, 'details', newVal)} size='3' />
                                    </Flex>
                                    <Flex direction={"column"}>
                                        <Text color='gray' size={"1"}>
                                            {t('discord.timestamp')}
                                        </Text>
                                        <EditableText value={p.timestamp} onChange={(newVal) => handleChange(i, 'details', newVal)} size='3' />
                                    </Flex>
                                    <Flex width={"100%"} gap={"3"} align={"center"}>
                                        <Flex direction={"column"}>
                                            <Text color='gray' size={"1"}>
                                                {t('discord.state')}
                                            </Text>
                                            <Box width={"120px"}>
                                                <EditableText value={p.state} onChange={(newVal) => handleChange(i, 'state', newVal)} size='3' />
                                            </Box>
                                        </Flex>
                                        <Separator orientation={'vertical'} size={"2"} />
                                        <Flex direction={"column"} width={"94px"}>
                                            <Text color='gray' size={"1"}>
                                                {t('discord.party.title')}
                                            </Text>
                                            <Box width={"76px"}>
                                                <Flex gap={"2"} align={"center"}>
                                                    <EditableText value={p.partySize} onChange={(newVal) => handleChange(i, 'partySize', newVal)} size='3' />
                                                    /
                                                    <EditableText value={p.partyMax} onChange={(newVal) => handleChange(i, 'partyMax', newVal)} size='3' />
                                                </Flex>
                                            </Box>
                                        </Flex>
                                    </Flex>

                                    <Flex width={"100%"} gap={"3"} align={"center"}>
                                        <Flex direction={"column"} width={"120px"}>
                                            <Text color='gray' size={"1"} >
                                                {t('discord.largeImage')}
                                            </Text>
                                            <Box width={"120px"}>
                                                <EditableText value={p.largeImage} onChange={(newVal) => handleChange(i, 'largeImage', newVal)} size='3' />
                                            </Box>
                                        </Flex>
                                        <Separator orientation={'vertical'} size={"2"} />
                                        <Flex direction={"column"} width={"94px"}>
                                            <Text color='gray' size={"1"}>
                                                {t('discord.largeText')}
                                            </Text>
                                            <Box width={"240px"}>
                                                <EditableText value={p.largeText} onChange={(newVal) => handleChange(i, 'largeText', newVal)} size='3' />
                                            </Box>
                                        </Flex>
                                    </Flex>

                                    <Flex width={"100%"} gap={"3"} align={"center"}>
                                        <Flex direction={"column"}>
                                            <Text color='gray' size={"1"}>
                                                {t('discord.smallImage')}
                                            </Text>
                                            <Box width={"120px"}>
                                                <EditableText value={p.smallImage} onChange={(newVal) => handleChange(i, 'smallImage', newVal)} size='3' />
                                            </Box>
                                        </Flex>
                                        <Separator orientation={'vertical'} size={"2"} />
                                        <Flex direction={"column"} width={"94px"}>
                                            <Text color='gray' size={"1"}>
                                                {t('discord.smallText')}
                                            </Text>
                                            <Box width={"240px"}>
                                                <EditableText value={p.smallText} onChange={(newVal) => handleChange(i, 'smallText', newVal)} size='3' />

                                            </Box>
                                        </Flex>
                                    </Flex>
                                    <Flex width={"100%"} align={"center"} justify={"between"}>
                                        <Text size="1" color="gray">{t('discord.createdAt')} {new Date(p.createdAt).toLocaleString()}</Text>
                                        <Flex gap={"2"}>
                                            <Button variant='soft' className='btnCursor' onClick={() => insertProfile(i)} >{t('buttons.insert')}</Button>
                                            <Button variant='soft' color='red' className='btnCursor' onClick={() => deleteProfile(i)}>{t('buttons.delete')}</Button>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </HoverCard.Content>
                        </HoverCard.Root>
                    ))}
                </Flex>
            </ScrollArea >
        </Flex >
    )
}
