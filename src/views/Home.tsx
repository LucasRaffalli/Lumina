import { Flex, Text } from '@radix-ui/themes'
import { Link } from 'react-router-dom';
import ContainerInterface from '@/components/template/ContainerInterface';
import { motion } from 'framer-motion'
import { RichPresenceForm } from '@/components/RichPresenceForm';
import StatusConnect from '@/components/richPresence/StatusConnect';
import { ArrowUpFromLine, Settings } from 'lucide-react';
import { useUpdate } from '@/context/UpdateContext';
import { t } from 'i18next';

export default function Home() {
  const { updateAvailable } = useUpdate();
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ height: "100%", maxWidth: "700px", display: "flex", flexDirection: "column" }}>
      <Flex direction="column" gap="4" height={"100%"}>
        <motion.div variants={itemVariants} style={{ height: "100%" }}>
          <ContainerInterface height='100%' direction='column' padding='4' gap='2'>
            <RichPresenceForm />
          </ContainerInterface>
        </motion.div>
        <Flex width={"100%"} gap={"4"}>
          <motion.div variants={itemVariants}>
            <ContainerInterface padding='3' justify='center' align='center'>
              <Link to={'/settings'}>
                <Settings color='gray' size={24} />
              </Link>
            </ContainerInterface>
          </motion.div>
          {updateAvailable && (
            <motion.div variants={itemVariants}>
              <ContainerInterface padding='3' justify='center' align='center'>
                <Link to={'/settings'} className='update'>
                  <Link to={'/settings/update'} title="Update available!">
                    <ArrowUpFromLine color='var(--accent-11)' size={24} />
                  </Link>
                </Link>
              </ContainerInterface>
            </motion.div>
          )}
          <motion.div variants={itemVariants} style={{ width: "100%" }}>
            <ContainerInterface width='100%' direction='row' padding='2' justify='between' align='center' pr='4' pl='4'>
              <Text size='2' color='gray' align='center'>
                <Link to={'https://discord.com/developers/applications'} target="_blank" rel="noopener noreferrer" className='hover__underline'>{t('settings.discordPortal')}</Link>
              </Text>
              <StatusConnect />
            </ContainerInterface>
          </motion.div>

        </Flex>
      </Flex>
    </motion.div>
  );
}

