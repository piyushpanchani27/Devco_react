import { createTheme } from "@mantine/core";
import {generateColors} from "@mantine/colors-generator";


const primaryColor = '#1A1547';
const primaryShades = generateColors(primaryColor);
export const theme   = createTheme({
    colors: {
        primary: primaryShades,
    },

    primaryColor: 'primary',
    white: '#FFFFFF',
});



export const darkTheme = createTheme({
    colors: {
        primary: primaryShades,
    },
    primaryColor: 'primary',
    white: '#FFFFFF',
});