import { Box, Flex } from '@radix-ui/themes'
import { motion } from 'framer-motion'
import React, { Children } from 'react'
import { Outlet } from 'react-router-dom'

export default function LayoutDestiny() {
    return (
        <Box className='layout' height={"100%"}>
            <Flex direction="row" height={"100%"} position={"relative"} overflow={"hidden"}>
                <Box ml={"3"} mr={"3"} mb={"3"} mt={"0"} width={"100%"}>
                    <Outlet />
                </Box>
            </Flex>
        </Box>
    )
}
