import { Button, Flex, Text } from '@radix-ui/themes'
import { motion } from 'framer-motion'
import { RichPresenceForm } from '../components/RichPresenceForm';
import ContainerInterface from '../template/ContainerInterface';
import StatusConnect from '../components/richPresence/StatusConnect';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import DestinyIcon from '../components/design/destinyIcon';

export default function Home() {
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                delayChildren: 0.05,
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
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
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{height:"100%"}}>
            <Flex direction="column" gap="4" height={"100%"}>
                <motion.div variants={itemVariants} style={{ height: "100%" }}>
                    <ContainerInterface height='100%' direction='column' padding='4'>
                        <RichPresenceForm />
                    </ContainerInterface>
                </motion.div>
                <Flex width={"100%"} gap={"4"}>
                    <motion.div variants={itemVariants}>
                        <ContainerInterface direction='row' padding='3' justify='center' align='center'>
                            <Link to={'/settings'}><Settings color='gray' size={24} /></Link>
                        </ContainerInterface>
                    </motion.div>
                    <motion.div variants={itemVariants} style={{ width: "100%" }}>
                        <ContainerInterface width='100%' direction='column' padding='2' justify='center' align='end' pr='4' pl='4'>
                            <StatusConnect />
                        </ContainerInterface>
                    </motion.div>
                </Flex>
            </Flex>
        </motion.div>
    )
}
