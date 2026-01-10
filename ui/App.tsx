import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import Dashboard from './Dashboard';
import Logs from './Logs';

interface AppProps {
    config: any;
}

const App: React.FC<AppProps> = ({config}) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'logs'>('dashboard');

    useInput((input, key) => {
        if (key.tab) {
            setActiveTab((prev) => (prev === 'dashboard' ? 'logs' : 'dashboard'))
        }
    })

    return (
        <Box flexDirection="column">

			<Box borderStyle="round" borderColor="green">
				<Text color="green" bold> GreDDBot v2.0 </Text>
				<Text> | </Text>
				<Text > Status: <Text color="green">Online 🟢</Text> </Text>
			</Box>

			<Box>
				<Tab name="Dashboard" isActive={activeTab === 'dashboard'} />
				<Tab name="Logs" isActive={activeTab === 'logs'} />
			</Box>

			<Box borderStyle="round" padding={1} flexGrow={1}>
				{activeTab === 'dashboard' && <Dashboard />}
				{activeTab === 'logs' && <Logs />}
			</Box>
		</Box>
    )
}

const Tab = ({ name, isActive }: { name: string; isActive: boolean }) => {
	return (
		<Box paddingX={2} borderStyle={isActive ? 'double' : undefined} borderColor={isActive ? 'blue' : undefined}>
			<Text bold={isActive} color={isActive ? 'blue' : 'gray'}>
				{name}
			</Text>
		</Box>
	);
};

export default App;