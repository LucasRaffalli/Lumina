import { Box, Flex } from '@radix-ui/themes'
import { motion } from 'framer-motion'
import React, { Children } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function LayoutLumina() {
    return (
        <Box className='layout' height={"100%"}>
            <Flex direction="row" height={"100%"} position={"relative"} overflow={"hidden"}>
                <Flex ml={"3"} mt={"3"} mb={"3"}>
                    <Navbar />
                </Flex>
                <Box ml={"0"} mr={"3"} mb={"3"} mt={"3"}>
                    <Outlet />
                </Box>
            </Flex>
        </Box>
    )
}
