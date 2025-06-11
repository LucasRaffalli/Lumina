import React from 'react';
import { Box, Button, Flex } from '@radix-ui/themes';
import { t } from 'i18next';

export function exportProfiles() {
    const profiles = localStorage.getItem("richProfiles");
    if (!profiles) {
        alert("Aucun profil à exporter.");
        return;
    }
    const blob = new Blob([profiles], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "lumina-rich-profiles.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importProfiles() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const profiles = JSON.parse(content);
                if (!Array.isArray(profiles)) throw new Error("Format de profils invalide");
                localStorage.setItem("richProfiles", JSON.stringify(profiles));
                window.dispatchEvent(new Event("profile-saved"));
                alert("Profils importés avec succès !");
            } catch (err) {
                alert("Erreur lors de l'import : " + (err as Error).message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

const ImportExportProfiles: React.FC = () => (
    <Flex gap="2">
        <Box>
            <Button onClick={exportProfiles} variant="soft" color='blue' className='btnW btnCursor'>{t('buttons.exportProfiles')}</Button>
        </Box>
        <Box >
            <Button onClick={importProfiles} variant="soft" color='green' className='btnW btnCursor'>{t('buttons.importProfiles')}</Button>
        </Box>
    </Flex>
);

export default ImportExportProfiles; 