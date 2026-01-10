import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { statsStore } from '../Utils/StatsStore';
import type { ModuleStatus } from '../Utils/StatsStore'

const Dashboard = () => {
	const [stats, setStats] = useState(statsStore.getStats());

	useEffect(() => {
		const update = (newStats: any) => setStats(newStats);
		statsStore.on('change', update);
		return () => { statsStore.off('change', update); };
	}, []);

	return (
        <Box flexDirection="row" gap={2} padding={1}>
            {/* left collumn */}
            <Box flexDirection="column" borderStyle="round" borderColor="blue" paddingX={1} width={25}>
                <Text bold underline>System Status</Text>
                
                <StatusRow label="Twitch IRC" status={stats.modules.Twitch} />
                <StatusRow label="Database" status={stats.modules.Database} />
                <StatusRow label="SevenTV" status={stats.modules.SevenTV} />
                <StatusRow label="EventSub" status={stats.modules.EventSub} />
                <StatusRow label="Telegram" status={stats.modules.Telegram} />
                
                <Box marginTop={1}>
                    <Text dimColor>Uptime: </Text>
                    <Text bold color="cyan">{stats.uptime}</Text>
                </Box>
            </Box>
            {/* right column */}
            <Box flexDirection="column" flexGrow={1}>
                {/* collumn 1 */}
                <Box flexDirection="row" gap={1} marginBottom={1}>
                    <MetricBox label="Messages" value={stats.messages} color="green" />
                    <MetricBox label="Unique Users" value={stats.uniqueUsersCount} color="magenta" />
                    <MetricBox label="Commands" value={stats.commands} color="yellow" />
                </Box>
                
                {/* collumn 2 */}
                <Box flexDirection="row" gap={1} marginBottom={1}>
                    <MetricBox label="Channels" value={stats.channels} color="cyan" />
                    <MetricBox label="DB Queries" value={stats.dbQueries} color="blue" />
                    <MetricBox label="Errors" value={stats.errors} color="red" />
                </Box>
                
                <Box marginTop={1}>
                    <Text dimColor>Loaded Commands: {stats.commandsLoaded}</Text>
                </Box>
            </Box>
        </Box>
    );
};

const StatusRow = ({ label, status }: {label: string, status: ModuleStatus}) => {
	let icon = '⚪';
    let color = 'gray';

    if (status === 'online') { icon = '🟢'; color = 'green'; }
    if (status === 'offline') { icon = '💤'; color = 'red'; }
    if (status === 'error') { icon = '🔥'; color = 'red'; }
    if (status === 'loading') { icon = '🟡'; color = 'yellow'; }

	return (
        <Box gap={1}>
            <Text>{icon}</Text>
            <Text color={color}>{label}</Text>
        </Box>
    );
}

const MetricBox = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <Box borderStyle="single" borderColor={color} flexDirection="column" paddingX={5} flexGrow={1}>
        <Text color={color}>{label}</Text>
        <Text bold>{value}</Text>
    </Box>
);

export default Dashboard;