import React, { useEffect, useState } from 'react'
import { Avatar, Box, Flex, Heading, HoverCard, Text } from '@radix-ui/themes'
import '@/css/previewRich.css'
import { t } from 'i18next';
import ContainerInterface from './template/ContainerInterface';

function formatElapsedTime(isoString: string, now: Date) {
  const start = new Date(isoString);
  let diff = Math.floor((now.getTime() - start.getTime()) / 1000); // en secondes
  if (diff < 0) diff = 0;
  const hours = Math.floor(diff / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function handleGlow(field: string, active: boolean) {
  const el = document.getElementById(`form-field-${field}`);
  if (el) {
    if (active) {
      el.classList.add('glow');
    } else {
      el.classList.remove('glow');
    }
  }
}

export default function PreviewRich() {
  const [profile, setProfile] = useState<any>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const storedProfile = localStorage.getItem('lastUsedProfile');
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (e) {
        setProfile(storedProfile); // fallback si ce n'est pas du JSON
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ContainerInterface width='100%' direction='column' overflow='hidden' >
      <Flex className='header__preview' direction={'column'}>
        <Box className='banner__preview' width={'100%'} height={'100px'} />
      </Flex>
      <Flex className='body__preview' direction={'column'} height={'100%'}>
        <Box position={'relative'}>
          <Box className='avatar__preview__container'>
            <Avatar fallback='A' size={"6"} radius='full' variant='solid' className='avatar__preview' src='/img/lumina_icon.png' />
          </Box>
        </Box>
        <Flex className='name__preview' direction={'column'} ml={'4'} mr={'6'} mt={'8'}>
          <Text weight={'bold'} size={"6"}>{t('app.title')}</Text>
          <Text size={"2"} color='gray'>{t('app.description')}</Text>
        </Flex>
        <Flex className='rich__preview' direction={'column'} m={"4"} p={'3'} gap={"2"}>
          <Text>{t('preview.playing')}</Text>
          <Flex direction={'row'} gap={"3"}>
            <Box position={'relative'}>
              <HoverCard.Root>
                <HoverCard.Trigger>
                  <Box onMouseEnter={() => handleGlow('largeImage', true)}
                    onMouseLeave={() => handleGlow('largeImage', false)}>
                    <Avatar fallback='A' size={"5"} radius='small' variant='solid' className='avatar__preview__large btnCursor' onMouseEnter={() => handleGlow('largeImage', true)}
                      onMouseLeave={() => handleGlow('largeImage', false)} />
                  </Box>
                </HoverCard.Trigger>
                <HoverCard.Content maxWidth="300px">
                  <Box>
                    <Heading size="3" as="h3">
                      <Text onMouseEnter={() => handleGlow('largeImage', true)}
                        onMouseLeave={() => handleGlow('largeImage', false)}>
                        {profile?.largeImage}
                      </Text>
                    </Heading>
                    <Text as="div" size="2" color="gray">
                      <Text onMouseEnter={() => handleGlow('largeText', true)}
                        onMouseLeave={() => handleGlow('largeText', false)}>
                        {profile?.largeText}
                      </Text>
                    </Text>
                  </Box>
                </HoverCard.Content>
              </HoverCard.Root>
              <HoverCard.Root>
                <HoverCard.Trigger>
                  <Box onMouseEnter={() => handleGlow('smallImage', true)} onMouseLeave={() => handleGlow('smallImage', false)}>
                    <Avatar fallback='A' size={"2"} radius='full' variant='solid' className='avatar__preview__small btnCursor' onMouseEnter={() => handleGlow('smallImage', true)}
                      onMouseLeave={() => handleGlow('smallImage', false)} />
                  </Box>
                </HoverCard.Trigger>
                <HoverCard.Content maxWidth="300px">
                  <Box>
                    <Heading size="3" as="h3">
                      <Text onMouseEnter={() => handleGlow('smallImage', true)}
                        onMouseLeave={() => handleGlow('smallImage', false)}>
                        {profile?.smallImage}
                      </Text>
                    </Heading>
                    <Text as="div" size="2" color="gray">
                      <Text onMouseEnter={() => handleGlow('smallText', true)}
                        onMouseLeave={() => handleGlow('smallText', false)}>
                        {profile?.smallText}
                      </Text>
                    </Text>
                  </Box>
                </HoverCard.Content>
              </HoverCard.Root>
            </Box>
            <Flex direction={'column'}>
              <Text weight={'bold'} size={"2"} onMouseEnter={() => handleGlow('clientId', true)} onMouseLeave={() => handleGlow('clientId', false)}>{profile?.profileName}</Text>
              <Text size={"1"} onMouseEnter={() => handleGlow('details', true)} onMouseLeave={() => handleGlow('details', false)}>{profile?.details}</Text>
              <Flex direction={'row'} gap={"2"}>
                <Text weight={'bold'} size={"1"} color='green' onMouseEnter={() => handleGlow('timestamp', true)} onMouseLeave={() => handleGlow('timestamp', false)}>
                  {profile?.timestamp ? formatElapsedTime(profile.timestamp, now) : '0:00'}
                </Text>
                <Flex direction={'row'} gap={"1"}>
                  <Text size={"1"} color='gray' onMouseEnter={() => handleGlow('state', true)} onMouseLeave={() => handleGlow('state', false)}>{profile?.state}</Text>
                  <Text size={"1"} color='gray'>
                    (
                    <Text onMouseEnter={() => handleGlow('partySize', true)} onMouseLeave={() => handleGlow('partySize', false)}>{profile?.partySize}</Text>
                    sur
                    <Text onMouseEnter={() => handleGlow('partyMax', true)} onMouseLeave={() => handleGlow('partyMax', false)}>{profile?.partyMax}</Text>
                    )
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </ContainerInterface>
  )
}
