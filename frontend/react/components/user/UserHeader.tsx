import type React from 'react';
import { Button } from '../ui/Button';

type Props = {
	user: string;
	totalSeconds: number;
	netKarmaSeconds: number;
	onDownloadUser: (user: string) => void;
};

export const UserHeader: React.FC<Props> = ({
	user,
	totalSeconds,
	netKarmaSeconds,
	onDownloadUser,
}) => {
	return (
		<>
			<h2>{user}</h2>
			{totalSeconds > 0 && (
				<div style={{ marginBottom: '0.5em' }}>
					<Button onClick={() => onDownloadUser(user)}>Download CSV</Button>
				</div>
			)}
			<div style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>
				Karma hours (net): {(netKarmaSeconds / 3600).toFixed(2)} h
			</div>
		</>
	);
};
