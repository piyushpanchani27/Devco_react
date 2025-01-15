import {Button, Checkbox, Divider, Flex, Grid, Group, Select, Stack, Text, TextInput} from "@mantine/core";
import {Auction} from "../../lib/types";
import {useForm, yupResolver} from "@mantine/form";
import * as yup from 'yup';

export default function AuctionRegistrationForm({auction}: { auction: Auction }) {
    const schema = yup.object().shape({
        first_name: yup.string().min(3, 'Name should have at least 3 letters'),
        last_name: yup.string().min(3, 'Last Name should have at least 3 letters'),
        phone: yup.string().required('Phone is required'),
        address: yup.string().required('Address is required'),
        city: yup.string().required('City is required'),
        state: yup.string().required('State is required'),
        zipcode: yup.string().required('Zipcode is required'),
    });
    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            company_name: '',
            phone: '',
            address: '',
            address2: '',
            country: '',
            city: '',
            state: '',
            zipcode: '',
            t_c: false,
            age: false,
        },
        validate: yupResolver(schema),
    });

    const handleSubmit = () => {
        form.validate();
        console.log(form.isValid())
    }

    return (
        <Grid>
            <Grid.Col span={6}>
                <Stack>
                    <Text c={'primary.9'} fw={800} fz={15}>User Information</Text>
                    <Divider/>
                    <TextInput {...form.getInputProps('first_name')} label={'First Name'} placeholder={'First Name'}
                               required/>
                    <TextInput {...form.getInputProps('last_name')} label={'Last Name'} placeholder={'Last Name'}
                               required/>
                    <TextInput {...form.getInputProps('company_name')} label={'Company Name'}
                               placeholder={'Company Name'}/>
                    <TextInput {...form.getInputProps('phone')} label={'Phone'} placeholder={'Phone'} required/>
                </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
                <Stack>
                    <Text c={'primary.9'} fw={800} fz={15}>Shipping Address</Text>
                    <Divider/>
                    <Select {...form.getInputProps('country')} label="Contry" placeholder="Contry"
                            data={['South Africa',]}/>
                    <TextInput {...form.getInputProps('address')} label={'Address'} placeholder={'Address'} required/>
                    <TextInput {...form.getInputProps('address2')} label={'Address 2'} placeholder={'Address 2'}/>
                    <TextInput {...form.getInputProps('city')} label={'City'} placeholder={'City'} required/>
                    <TextInput {...form.getInputProps('state')} label={'State'} placeholder={'State'} required/>
                    <TextInput {...form.getInputProps('zipcode')} label={'Zipcode'} placeholder={'Zipcode'} required/>
                </Stack>
            </Grid.Col>
            <Grid.Col span={12}>
                <Stack>
                    <Divider/>
                    <Text c={'dimmed'} fz={14}>By checking below you agree.</Text>
                    <Group pl={20}>
                        <Checkbox {...form.getInputProps('t_c')} label="I have read and agree to the T&C's"/>
                        <Checkbox {...form.getInputProps('age')} label="I am 18 years of age or older"/>
                    </Group>
                    <Flex justify={'flex-end'}>
                        <Button disabled={!form.values.t_c || !form.values.age} onClick={handleSubmit}>Submit</Button>
                    </Flex>
                </Stack>
            </Grid.Col>

        </Grid>
    );
}