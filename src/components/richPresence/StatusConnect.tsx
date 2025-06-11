import React, { useEffect, useState } from 'react'
import { Flex, Text } from '@radix-ui/themes'
import { Dot } from 'lucide-react';
import { t } from 'i18next';

export default function StatusConnect() {
    const [status, setStatus] = useState({ isConnected: false, isDiscordOpen: false });

    useEffect(() => {
        const checkStatus = async () => {
            const response = await window.ipcRenderer.invoke('rich-status');
            setStatus(response);
        };

        const interval = setInterval(checkStatus, 2000);
        checkStatus();

        return () => clearInterval(interval);
    }, []);

    const getMessage = () => {
        if (!status.isDiscordOpen) {
            return t('status.discordNotOpen');
        }
        return status.isConnected ? t('status.connected') : t('status.disconnected');
    };

    const getColor = () => {
        if (!status.isDiscordOpen) return 'gray';
        return status.isConnected ? 'green' : 'red';
    };

    return (
        <>
            <Flex align="center" gap="1">
                <Dot color={getColor()} size={32} />
                <Text size="2">
                    {getMessage()}
                </Text>
            </Flex>
        </>
    )
}
