import {AppShell, UnstyledButton} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {ReactNode} from 'react';
import {useRouter} from 'next/router';
import classes from './layout.module.css';
import {CustomHeader} from './Header';

interface LayoutProps {
    children: ReactNode;
}

const authRoutes = ['/auth/Login', '/auth/Signup']; // Add your authentication routes here

export function Layout({children}: LayoutProps) {
    const [opened, {toggle}] = useDisclosure();
    const router = useRouter();
    const isAuthRoute = authRoutes.includes(router.pathname);

    if (isAuthRoute) {
        return <>{children}</>;
    }

    return (
        <AppShell
            header={{height: 100}}
            navbar={{width: 300, breakpoint: 'sm', collapsed: {desktop: true, mobile: !opened}}}
            padding="md"
        >
            <AppShell.Header>
                <CustomHeader/>
            </AppShell.Header>

            <AppShell.Navbar py="md" px={4}>
                <UnstyledButton className={classes.control}>Home</UnstyledButton>
                <UnstyledButton className={classes.control}>Blog</UnstyledButton>
                <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
                <UnstyledButton className={classes.control}>Support</UnstyledButton>
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}