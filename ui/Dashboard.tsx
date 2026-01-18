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

	const formatMemory = (mb: number) => `${mb} MB`;

	return (
        <Box flexDirection="row" gap={2} padding={1}>
            {/* left column */}
            <Box flexDirection="column" borderStyle="round" borderColor="blue" paddingX={1} width={30}>
                <Text bold underline>System Status</Text>
                
                <StatusRow label="Twitch IRC" status={stats.modules.Twitch} />
                <StatusRow label="Database" status={stats.modules.Database} />
                <StatusRow label="Redis" status={stats.modules.Redis} />
                <StatusRow label="SevenTV" status={stats.modules.SevenTV} />
                <StatusRow label="EventSub" status={stats.modules.EventSub} />
                <StatusRow label="Telegram" status={stats.modules.Telegram} />
                
                <Box marginTop={1}>
                    <Text dimColor>Uptime: </Text>
                    <Text bold color="cyan">{stats.uptime}</Text>
                </Box>

                {/* System Resources */}
                <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
                    <Text bold underline>Resources</Text>
                    <Text dimColor>RAM: </Text>
                    <Text color="yellow">{formatMemory(stats.memoryUsage.rss)}</Text>
                    <Text dimColor>Heap: </Text>
                    <Text color="yellow">{formatMemory(stats.memoryUsage.heapUsed)}/{formatMemory(stats.memoryUsage.heapTotal)}</Text>
                </Box>
            </Box>

            {/* right column */}
            <Box flexDirection="column" flexGrow={1}>
                {/* row 1 */}
                <Box flexDirection="row" gap={1} marginBottom={1}>
                    <MetricBox label="Messages" value={stats.messages} color="green" />
                    <MetricBox label="Msg/sec" value={stats.messagesPerSecond} color="green" />
                     <MetricBox label="Cmd/min" value={stats.commandsPerMinute} color="yellow" />
                </Box>
                
                {/* row 2 */}
                <Box flexDirection="row" gap={1} marginBottom={1}>
                    <MetricBox label="Commands" value={stats.commands} color="yellow" />
                    <MetricBox label="Channels" value={stats.channels} color="cyan" />
                    <MetricBox label="Errors" value={stats.errors} color="red" />
                </Box>
                
                {/* row 3 */}
                <Box flexDirection="row" gap={1} marginBottom={1}>
                    
                    <MetricBox label="DB Queries" value={stats.dbQueries} color="blue" />
                    <MetricBox label="Redis Q" value={stats.redisQueries} color="red" />
                </Box>

                {/* row 4 */}
                <Box flexDirection="row" gap={1} marginBottom={1}>
                    
                    <MetricBox label="Commands Loaded" value={stats.commandsLoaded} color="blue" />
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