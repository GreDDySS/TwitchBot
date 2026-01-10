import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { logStore, type LogMessage } from '../Utils/LogStore';

const Logs = () => {
	const [logs, setLogs] = useState<LogMessage[]>(logStore.getLogs());

	useEffect(() => {
		const handleUpdate = (newLogs: LogMessage[]) => {
			setLogs(newLogs);
		};

		logStore.on('change', handleUpdate);

		return () => {
			logStore.off('change', handleUpdate);
		}
	})


	return (
		<Box flexDirection="column">
      {logs.length === 0 && <Text dimColor>No logs yet...</Text>}
      
      {logs.map((log) => (
        <Box key={log.id}>
          <Text color="gray">[{log.timestamp}] </Text>
          <Text 
            color={log.level === 'error' ? 'red' : log.level === 'warn' ? 'yellow' : 'green'} 
            bold={log.level === 'error'}
          >
            {log.level.toUpperCase()}: 
          </Text>
          <Text> {log.message}</Text>
        </Box>
      ))}
    </Box>
	);
};

export default Logs;