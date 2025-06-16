import { Box, Flex } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'
import { useWindowSize } from '../context/WindowSizeContext';
import Navbar from '@/components/Navbar';
import PreviewRich from '@/components/PreviewRich';

export default function LayoutLumina() {
    const { isLarge } = useWindowSize();
    return (
        <Box className='layout' height={"100%"}>
            <Flex direction="row" height={"100%"} position={"relative"} overflow={"hidden"}>
                <Flex ml={"3"} mt={"3"} mb={"3"}>
                    <Navbar />
                </Flex>
                <Box ml={"0"} mr={"3"} mb={"3"} mt={"3"} width={"100%"}>
                    <Outlet />
                </Box>
                {isLarge &&
                    <Flex ml={"0"} mr={"3"} mb={"3"} mt={"3"} width={"60%"}>
                        <PreviewRich />
                    </Flex>
                }
            </Flex>
        </Box>
    )
}
