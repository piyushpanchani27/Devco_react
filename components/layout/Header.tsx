import {Icon, IconAlarmPlus, IconChevronDown, IconHistory,} from '@tabler/icons-react';
import {
    Box,
    Burger,
    Button,
    Center,
    Divider,
    Drawer,
    Group,
    HoverCard,
    Image,
    ScrollArea,
    SimpleGrid,
    Text,
    ThemeIcon,
    UnstyledButton,
    useMantineTheme,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import classes from './header.module.css';
import Link from "next/link";
import {useAtom} from "jotai";
import {userAtom} from "../../src/atoms/userAtoms";
import {UserMenu} from "./UserMenu";

interface LinkProps {
    icon: Icon;
    title: string;
    description: string;
}

const AuctionLinks: LinkProps[] = [
    {
        icon: IconAlarmPlus,
        title: 'Upcoming auctions',
        description: 'View all upcoming auctions.',
    },
    {
        icon: IconHistory,
        title: 'Past auctions',
        description: 'View all past auctions.',
    },

];
const BidsLinks: LinkProps[] = [
    {
        icon: IconAlarmPlus,
        title: 'Upcoming bids',
        description: 'View all you bids from upcoming auctions.',
    },
    {
        icon: IconHistory,
        title: 'Past bids',
        description: 'View all your bids from past auctions.',
    },

];

export function CustomHeader() {
    const [user] = useAtom(userAtom)


    const [drawerOpened, {toggle: toggleDrawer, close: closeDrawer}] = useDisclosure(false);
    const [linksOpened, {toggle: toggleLinks}] = useDisclosure(false);
    const theme = useMantineTheme();

    const getLinks = (links: LinkProps[]) => {
        return links.map((item) => (
            <UnstyledButton className={classes.subLink} key={item.title}>
                <Group wrap="nowrap" align="flex-start">
                    <ThemeIcon size={34} variant="default" radius="md">
                        <item.icon size={22} color={theme.colors.blue[6]}/>
                    </ThemeIcon>
                    <div>
                        <Text size="sm" fw={500}>
                            {item.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {item.description}
                        </Text>
                    </div>
                </Group>
            </UnstyledButton>
        ));
    }

    return (
        <Box pb={120}>
            <header className={classes.header}>
                <Group justify="space-between" h="100%">
                    <Image height={98} src='/logo.png' alt="Logo" className={classes.logo}/>

                    <Group h="100%" gap={0} visibleFrom="sm">
                        <a href="#" className={classes.link}>
                            Home
                        </a>
                        <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
                            <HoverCard.Target>
                                <a href="#" className={classes.link}>
                                    <Center inline>
                                        <Box component="span" mr={5}>
                                            Auctions
                                        </Box>
                                        <IconChevronDown size={16} color={theme.colors.blue[6]}/>
                                    </Center>
                                </a>
                            </HoverCard.Target>

                            <HoverCard.Dropdown style={{overflow: 'hidden'}}>
                                <SimpleGrid cols={2} spacing={0}>
                                    {getLinks(AuctionLinks)}
                                </SimpleGrid>
                            </HoverCard.Dropdown>
                        </HoverCard>
                        <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
                            <HoverCard.Target>
                                <a href="#" className={classes.link}>
                                    <Center inline>
                                        <Box component="span" mr={5}>
                                            My Bids
                                        </Box>
                                        <IconChevronDown size={16} color={theme.colors.blue[6]}/>
                                    </Center>
                                </a>
                            </HoverCard.Target>

                            <HoverCard.Dropdown style={{overflow: 'hidden'}}>
                                <SimpleGrid cols={2} spacing={0}>
                                    {getLinks(BidsLinks)}
                                </SimpleGrid>
                            </HoverCard.Dropdown>
                        </HoverCard>
                        <a href="#" className={classes.link}>
                            Watched Lots
                        </a>
                        <a href="#" className={classes.link}>
                            FAQ
                        </a>
                    </Group>

                    {
                        !user ? <Group visibleFrom="sm">
                                <Link href="/auth/Login" passHref>
                                    <Button variant="default">Log in</Button>
                                </Link>
                                <Button>Sign up</Button>

                            </Group> :
                            <UserMenu/>
                    }


                    <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm"/>
                </Group>
            </header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title="Navigation"
                hiddenFrom="sm"
                zIndex={1000000}
            >
                <ScrollArea h="calc(100vh - 80px" mx="-md">
                    <Divider my="sm"/>

                    <a href="#" className={classes.link}>
                        Home
                    </a>
                    <UnstyledButton className={classes.link} onClick={toggleLinks}>
                        <Center inline>
                            <Box component="span" mr={5}>
                                Features
                            </Box>
                            <IconChevronDown size={16} color={theme.colors.blue[6]}/>
                        </Center>
                    </UnstyledButton>
                    <a href="#" className={classes.link}>
                        Learn
                    </a>
                    <a href="#" className={classes.link}>
                        Academy
                    </a>

                    <Divider my="sm"/>

                    <Group justify="center" grow pb="xl" px="md">
                        <Link href="/auth/Login" passHref>
                            <Button variant="default">Log in</Button>
                        </Link>
                        <Button>Sign up</Button>
                    </Group>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}