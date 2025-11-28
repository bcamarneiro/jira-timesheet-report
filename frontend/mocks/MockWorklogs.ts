const MockWorklogs = [
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1768942',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment:
			'The VDI froze, crashed, and had a typing problem that required a reboot.',
		created: '2025-08-01T17:01:35.666+0200',
		updated: '2025-08-01T17:01:35.666+0200',
		started: '2025-08-01T12:00:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1768942',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1768956',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-01T17:10:34.320+0200',
		updated: '2025-08-01T17:10:34.320+0200',
		started: '2025-08-01T17:09:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1768956',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1768881',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-01T17:13:45.959+0200',
		updated: '2025-08-01T17:13:45.959+0200',
		started: '2025-08-01T17:13:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1768881',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1769500',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-04T16:02:00.437+0200',
		updated: '2025-08-04T16:02:00.437+0200',
		started: '2025-08-04T16:01:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1769500',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1769476',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'unable to connect to vdi',
		created: '2025-08-04T16:54:36.717+0200',
		updated: '2025-08-04T16:54:36.717+0200',
		started: '2025-08-04T14:54:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1769476',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1769494',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'help setting up new colleague',
		created: '2025-08-04T17:45:17.252+0200',
		updated: '2025-08-14T17:55:07.876+0200',
		started: '2025-08-01T17:44:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1769494',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1769616',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-04T22:56:41.964+0200',
		updated: '2025-08-04T22:56:41.964+0200',
		started: '2025-08-04T22:56:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1769616',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1769778',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'VDI stucked',
		created: '2025-08-05T11:10:45.553+0200',
		updated: '2025-08-05T11:10:45.553+0200',
		started: '2025-08-04T11:10:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1769778',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770146',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T16:59:44.909+0200',
		updated: '2025-08-05T16:59:44.909+0200',
		started: '2025-08-05T16:59:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770146',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770062',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T17:25:06.031+0200',
		updated: '2025-08-05T17:25:25.124+0200',
		started: '2025-08-05T16:25:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1770062',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770162',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T17:49:38.914+0200',
		updated: '2025-08-05T17:49:38.914+0200',
		started: '2025-08-05T17:49:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770162',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770432',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: 'dev environment setup',
		created: '2025-08-06T11:12:40.325+0200',
		updated: '2025-08-06T11:12:40.325+0200',
		started: '2025-08-04T11:11:00.000+0200',
		timeSpent: '7h 30m',
		timeSpentSeconds: 27000,
		id: '1770432',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770433',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: 'dev environment setup',
		created: '2025-08-06T11:13:17.283+0200',
		updated: '2025-08-06T11:13:17.283+0200',
		started: '2025-08-01T11:13:00.000+0200',
		timeSpent: '7h 30m',
		timeSpentSeconds: 27000,
		id: '1770433',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770434',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: 'dev environment setup',
		created: '2025-08-06T11:14:05.801+0200',
		updated: '2025-08-06T11:14:05.801+0200',
		started: '2025-08-05T11:13:00.000+0200',
		timeSpent: '5h 30m',
		timeSpentSeconds: 19800,
		id: '1770434',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770784',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:00:57.815+0200',
		updated: '2025-08-07T11:00:57.815+0200',
		started: '2025-08-07T11:00:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770784',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770786',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:01:45.382+0200',
		updated: '2025-08-07T11:01:45.382+0200',
		started: '2025-08-06T11:01:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770786',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770794',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:12:29.888+0200',
		updated: '2025-08-07T11:12:29.888+0200',
		started: '2025-08-06T11:12:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770794',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770796',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'VDI stucked',
		created: '2025-08-07T11:12:55.989+0200',
		updated: '2025-08-07T11:12:55.989+0200',
		started: '2025-08-06T11:12:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1770796',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1770901',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'VDI stucked',
		created: '2025-08-07T11:15:28.692+0200',
		updated: '2025-08-07T11:15:28.692+0200',
		started: '2025-08-05T11:15:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1770901',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1771152',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'VDI stucked',
		created: '2025-08-07T17:56:21.260+0200',
		updated: '2025-08-07T17:56:21.260+0200',
		started: '2025-08-07T17:56:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1771152',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1771588',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-08T14:12:39.752+0200',
		updated: '2025-08-08T14:12:39.752+0200',
		started: '2025-08-07T10:12:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1771588',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1771724',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-08T15:00:53.017+0200',
		updated: '2025-08-08T15:00:53.017+0200',
		started: '2025-08-08T09:00:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1771724',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1771855',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-08T18:19:40.541+0200',
		updated: '2025-08-08T18:19:40.541+0200',
		started: '2025-08-08T11:19:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1771855',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1772273',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T12:45:04.610+0200',
		updated: '2025-08-11T12:45:04.610+0200',
		started: '2025-08-08T12:44:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1772273',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1772635',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T16:35:05.710+0200',
		updated: '2025-08-11T16:35:05.710+0200',
		started: '2025-08-11T16:34:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1772635',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1772596',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T17:30:20.913+0200',
		updated: '2025-08-11T17:30:20.913+0200',
		started: '2025-08-11T17:30:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1772596',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1773004',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-12T11:11:42.826+0200',
		updated: '2025-08-12T11:11:42.826+0200',
		started: '2025-08-11T09:00:00.000+0200',
		timeSpent: '3h 30m',
		timeSpentSeconds: 12600,
		id: '1773004',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1773590',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-13T10:55:49.030+0200',
		updated: '2025-08-13T10:55:49.030+0200',
		started: '2025-08-12T09:00:00.000+0200',
		timeSpent: '3h 30m',
		timeSpentSeconds: 12600,
		id: '1773590',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774058',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'VDI',
		created: '2025-08-14T10:54:30.361+0200',
		updated: '2025-08-14T10:54:30.361+0200',
		started: '2025-08-11T10:54:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774058',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774059',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'vdi',
		created: '2025-08-14T10:54:46.975+0200',
		updated: '2025-08-14T10:54:46.975+0200',
		started: '2025-08-12T10:54:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1774059',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774060',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'VDI',
		created: '2025-08-14T10:55:02.140+0200',
		updated: '2025-08-14T10:55:02.140+0200',
		started: '2025-08-13T10:54:00.000+0200',
		timeSpent: '7h',
		timeSpentSeconds: 25200,
		id: '1774060',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774133',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T11:06:37.307+0200',
		updated: '2025-08-14T11:06:37.307+0200',
		started: '2025-08-13T09:00:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1774133',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774081',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:07:14.957+0200',
		updated: '2025-08-14T12:07:14.957+0200',
		started: '2025-08-06T11:06:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774081',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774087',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:09:59.122+0200',
		updated: '2025-08-14T12:09:59.122+0200',
		started: '2025-08-12T14:00:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774087',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774385',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T16:54:26.163+0200',
		updated: '2025-08-14T16:54:26.163+0200',
		started: '2025-08-14T11:54:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1774385',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774285',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'handle complains, contact support',
		created: '2025-08-14T17:52:26.623+0200',
		updated: '2025-08-14T17:52:26.623+0200',
		started: '2025-08-14T17:52:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774285',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774291',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment:
			'Setup kubernetes with, handle VDI complaints, coordinate with IT.',
		created: '2025-08-14T18:10:37.128+0200',
		updated: '2025-08-14T18:10:37.128+0200',
		started: '2025-08-05T18:09:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1774291',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774297',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T18:18:20.701+0200',
		updated: '2025-08-14T18:18:20.701+0200',
		started: '2025-08-06T18:18:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774297',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774401',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'restaring machines, handling vdi complaints',
		created: '2025-08-14T18:23:47.627+0200',
		updated: '2025-08-14T18:23:47.627+0200',
		started: '2025-08-14T18:23:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774401',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774404',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'follow ups on the vdi upgrades understand performance changes',
		created: '2025-08-14T18:29:49.376+0200',
		updated: '2025-08-14T18:29:49.376+0200',
		started: '2025-08-11T18:28:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1774404',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774408',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'handling vdi complaints',
		created: '2025-08-14T18:51:40.666+0200',
		updated: '2025-08-14T18:51:40.666+0200',
		started: '2025-08-12T18:51:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774408',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774412',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'handle vdi complaints',
		created: '2025-08-14T18:55:15.292+0200',
		updated: '2025-08-14T18:55:15.292+0200',
		started: '2025-08-13T18:54:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774412',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774417',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:06:40.215+0200',
		updated: '2025-08-14T19:06:40.215+0200',
		started: '2025-08-14T15:06:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1774417',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774425',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:55:59.233+0200',
		updated: '2025-08-14T19:55:59.233+0200',
		started: '2025-08-12T19:55:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1774425',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774426',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:56:09.694+0200',
		updated: '2025-08-14T19:56:09.694+0200',
		started: '2025-08-13T19:56:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1774426',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/1774427',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:56:15.421+0200',
		updated: '2025-08-14T19:56:15.421+0200',
		started: '2025-08-14T19:56:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1774427',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1768597',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-01T13:09:35.957+0200',
		updated: '2025-08-01T13:09:35.957+0200',
		started: '2025-08-01T13:09:00.000+0200',
		timeSpent: '30m',
		timeSpentSeconds: 1800,
		id: '1768597',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1768959',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-01T17:11:37.028+0200',
		updated: '2025-08-01T17:11:37.028+0200',
		started: '2025-08-01T17:11:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1768959',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1769852',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T12:19:42.456+0200',
		updated: '2025-08-05T17:23:38.512+0200',
		started: '2025-08-05T09:45:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1769852',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1769790',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'retro and daily',
		created: '2025-08-05T12:21:46.360+0200',
		updated: '2025-08-05T12:21:46.360+0200',
		started: '2025-08-05T12:21:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1769790',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770043',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T16:58:43.192+0200',
		updated: '2025-08-05T16:58:43.192+0200',
		started: '2025-08-04T09:45:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1770043',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770144',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T16:59:13.678+0200',
		updated: '2025-08-05T16:59:13.678+0200',
		started: '2025-08-05T16:59:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1770144',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770159',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T17:48:54.403+0200',
		updated: '2025-08-05T17:48:54.403+0200',
		started: '2025-08-05T17:48:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770159',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770099',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-05T18:43:42.105+0200',
		updated: '2025-08-05T18:43:42.105+0200',
		started: '2025-08-01T18:43:00.000+0200',
		timeSpent: '30m',
		timeSpentSeconds: 1800,
		id: '1770099',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770200',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-05T18:45:06.149+0200',
		updated: '2025-08-05T18:45:06.149+0200',
		started: '2025-08-04T18:44:00.000+0200',
		timeSpent: '30m',
		timeSpentSeconds: 1800,
		id: '1770200',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770201',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-05T18:45:18.228+0200',
		updated: '2025-08-05T18:46:02.307+0200',
		started: '2025-08-05T18:45:00.000+0200',
		timeSpent: '2h 30m',
		timeSpentSeconds: 9000,
		id: '1770201',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770783',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:00:29.494+0200',
		updated: '2025-08-07T11:00:29.494+0200',
		started: '2025-08-07T10:59:00.000+0200',
		timeSpent: '1h 30m',
		timeSpentSeconds: 5400,
		id: '1770783',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770785',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:01:31.972+0200',
		updated: '2025-08-07T11:01:31.972+0200',
		started: '2025-08-06T11:01:00.000+0200',
		timeSpent: '1h 30m',
		timeSpentSeconds: 5400,
		id: '1770785',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770799',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:14:29.476+0200',
		updated: '2025-08-07T11:14:29.476+0200',
		started: '2025-08-06T11:14:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1770799',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1770902',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:15:53.600+0200',
		updated: '2025-08-07T11:15:53.600+0200',
		started: '2025-08-07T11:15:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1770902',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1771645',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-08T14:48:58.197+0200',
		updated: '2025-08-08T14:48:58.197+0200',
		started: '2025-08-06T14:18:00.000+0200',
		timeSpent: '30m',
		timeSpentSeconds: 1800,
		id: '1771645',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1772274',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T12:45:16.459+0200',
		updated: '2025-08-11T12:45:16.459+0200',
		started: '2025-08-08T12:45:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1772274',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1772637',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T16:35:55.185+0200',
		updated: '2025-08-11T16:35:55.185+0200',
		started: '2025-08-11T16:35:00.000+0200',
		timeSpent: '30m',
		timeSpentSeconds: 1800,
		id: '1772637',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1772595',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T17:30:09.651+0200',
		updated: '2025-08-11T17:30:09.651+0200',
		started: '2025-08-11T17:30:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1772595',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1773591',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-13T10:56:18.060+0200',
		updated: '2025-08-13T10:56:18.060+0200',
		started: '2025-08-12T10:56:00.000+0200',
		timeSpent: '30m',
		timeSpentSeconds: 1800,
		id: '1773591',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774134',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T11:06:47.062+0200',
		updated: '2025-08-14T11:06:47.062+0200',
		started: '2025-08-13T09:36:00.000+0200',
		timeSpent: '30m',
		timeSpentSeconds: 1800,
		id: '1774134',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774080',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:06:48.450+0200',
		updated: '2025-08-14T12:06:48.450+0200',
		started: '2025-08-06T09:45:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774080',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774082',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:07:46.207+0200',
		updated: '2025-08-14T12:07:46.207+0200',
		started: '2025-08-07T09:45:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774082',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774083',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:08:02.871+0200',
		updated: '2025-08-14T12:08:02.871+0200',
		started: '2025-08-08T09:45:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774083',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774084',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:08:26.565+0200',
		updated: '2025-08-14T12:08:26.565+0200',
		started: '2025-08-11T09:45:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774084',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774085',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:08:56.955+0200',
		updated: '2025-08-14T12:08:56.955+0200',
		started: '2025-08-13T09:45:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774085',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774086',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:09:35.098+0200',
		updated: '2025-08-14T12:09:35.098+0200',
		started: '2025-08-12T09:45:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774086',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774382',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T16:54:02.295+0200',
		updated: '2025-08-14T16:54:02.295+0200',
		started: '2025-08-14T14:54:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774382',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774281',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'meetings, follow ups, team coordination',
		created: '2025-08-14T17:48:18.175+0200',
		updated: '2025-08-14T17:48:18.175+0200',
		started: '2025-08-01T17:47:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774281',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774286',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'meetings, follow ups, team coordination',
		created: '2025-08-14T17:57:47.402+0200',
		updated: '2025-08-14T17:58:51.338+0200',
		started: '2025-08-04T17:57:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774286',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774288',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'prepare 1on1s with the team members. 1on1s with team members',
		created: '2025-08-14T18:02:57.344+0200',
		updated: '2025-08-14T18:02:57.344+0200',
		started: '2025-08-04T18:02:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1774288',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774289',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment:
			"Daily meeting, Sprint Retro, follow'ups, and time logging discussions with TMs",
		created: '2025-08-14T18:08:44.305+0200',
		updated: '2025-08-14T18:08:44.305+0200',
		started: '2025-08-05T18:07:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1774289',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774295',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'multiple 1on1s, coordination calls ',
		created: '2025-08-14T18:17:58.529+0200',
		updated: '2025-08-14T18:17:58.529+0200',
		started: '2025-08-06T18:15:00.000+0200',
		timeSpent: '7h',
		timeSpentSeconds: 25200,
		id: '1774295',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774400',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment:
			'meetings, 1on1, management calls, follow ups, prepare tasks for next sprint',
		created: '2025-08-14T18:22:51.721+0200',
		updated: '2025-08-14T18:22:51.721+0200',
		started: '2025-08-07T18:21:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1774400',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774402',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'meetings, demo, follow ups, prepare tasks',
		created: '2025-08-14T18:25:38.493+0200',
		updated: '2025-08-14T18:25:38.493+0200',
		started: '2025-08-08T18:24:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1774402',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774403',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'daily meeting, weekly sync,  retro review log, follow ups',
		created: '2025-08-14T18:28:13.108+0200',
		updated: '2025-08-14T18:28:13.108+0200',
		started: '2025-08-11T18:27:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1774403',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774405',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'prepare further tickets',
		created: '2025-08-14T18:30:26.663+0200',
		updated: '2025-08-14T18:30:26.663+0200',
		started: '2025-08-11T18:30:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774405',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774406',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment:
			'daily meeting, calls with team memebers and management, ticket preparation and sprint planning',
		created: '2025-08-14T18:50:21.093+0200',
		updated: '2025-08-14T18:50:21.093+0200',
		started: '2025-08-12T18:42:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1774406',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774410',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment:
			'daily meetings, coordinating ongoing tasks, preparing upcoming tickets',
		created: '2025-08-14T18:53:51.037+0200',
		updated: '2025-08-14T18:53:51.037+0200',
		started: '2025-08-13T18:53:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1774410',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774411',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'prepare timesheet exporting script',
		created: '2025-08-14T18:54:47.978+0200',
		updated: '2025-08-14T18:56:05.910+0200',
		started: '2025-08-13T18:54:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774411',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774413',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'Daily meeting followups.',
		created: '2025-08-14T18:56:50.185+0200',
		updated: '2025-08-14T18:56:50.185+0200',
		started: '2025-08-14T18:56:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774413',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774414',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'add details to upcoming tickets',
		created: '2025-08-14T18:57:22.213+0200',
		updated: '2025-08-14T18:57:22.213+0200',
		started: '2025-08-14T18:56:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774414',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774419',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'review 1on1s',
		created: '2025-08-14T19:22:33.071+0200',
		updated: '2025-08-14T19:22:33.071+0200',
		started: '2025-08-07T19:22:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774419',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774422',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:55:27.924+0200',
		updated: '2025-08-14T19:55:27.924+0200',
		started: '2025-08-12T19:55:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774422',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774423',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:55:37.447+0200',
		updated: '2025-08-14T19:55:37.447+0200',
		started: '2025-08-13T19:55:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774423',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716690/worklog/1774424',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:55:44.456+0200',
		updated: '2025-08-14T19:55:44.456+0200',
		started: '2025-08-14T19:55:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1774424',
		issueId: '716690',
		issueKey: 'COM-64135',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/713006/worklog/1771584',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-08T14:00:34.391+0200',
		updated: '2025-08-08T14:00:34.391+0200',
		started: '2025-08-07T14:00:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1771584',
		issueId: '713006',
		issueKey: 'COM-63550',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/713006/worklog/1771856',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-08T18:19:46.662+0200',
		updated: '2025-08-08T18:19:46.662+0200',
		started: '2025-08-08T15:19:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1771856',
		issueId: '713006',
		issueKey: 'COM-63550',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/713006/worklog/1773588',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-13T10:55:10.627+0200',
		updated: '2025-08-13T10:55:10.627+0200',
		started: '2025-08-12T10:54:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1773588',
		issueId: '713006',
		issueKey: 'COM-63550',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/713006/worklog/1774383',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T16:54:10.639+0200',
		updated: '2025-08-14T16:54:10.639+0200',
		started: '2025-08-14T13:54:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774383',
		issueId: '713006',
		issueKey: 'COM-63550',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1768960',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-01T17:11:54.119+0200',
		updated: '2025-08-01T17:11:54.119+0200',
		started: '2025-08-01T17:11:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1768960',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1769502',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-04T16:02:10.274+0200',
		updated: '2025-08-04T16:02:10.274+0200',
		started: '2025-08-04T16:02:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1769502',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1769477',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-04T16:55:41.009+0200',
		updated: '2025-08-04T16:55:41.009+0200',
		started: '2025-08-01T09:00:00.000+0200',
		timeSpent: '1d',
		timeSpentSeconds: 28800,
		id: '1769477',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1769853',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T12:21:24.219+0200',
		updated: '2025-08-05T12:21:24.219+0200',
		started: '2025-08-04T09:00:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1769853',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1770147',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T16:59:54.761+0200',
		updated: '2025-08-05T16:59:54.761+0200',
		started: '2025-08-05T16:59:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1770147',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1770787',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:02:02.347+0200',
		updated: '2025-08-07T11:02:02.347+0200',
		started: '2025-08-07T11:01:00.000+0200',
		timeSpent: '4h 30m',
		timeSpentSeconds: 16200,
		id: '1770787',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1770788',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:02:11.996+0200',
		updated: '2025-08-07T11:02:11.996+0200',
		started: '2025-08-06T11:02:00.000+0200',
		timeSpent: '4h 30m',
		timeSpentSeconds: 16200,
		id: '1770788',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1770797',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:13:04.353+0200',
		updated: '2025-08-07T11:13:04.353+0200',
		started: '2025-08-06T11:12:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770797',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1772597',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T17:30:41.723+0200',
		updated: '2025-08-11T17:30:41.723+0200',
		started: '2025-08-11T17:30:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1772597',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1774073',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T11:58:10.492+0200',
		updated: '2025-08-14T11:58:10.492+0200',
		started: '2025-08-13T09:15:00.000+0200',
		timeSpent: '7h',
		timeSpentSeconds: 25200,
		id: '1774073',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1774074',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T11:59:13.183+0200',
		updated: '2025-08-14T11:59:13.183+0200',
		started: '2025-08-05T10:00:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1774074',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1774075',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:01:01.326+0200',
		updated: '2025-08-14T12:01:01.326+0200',
		started: '2025-08-06T10:15:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1774075',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1774076',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:02:06.870+0200',
		updated: '2025-08-14T12:02:06.870+0200',
		started: '2025-08-07T09:01:00.000+0200',
		timeSpent: '7h',
		timeSpentSeconds: 25200,
		id: '1774076',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1774077',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:02:45.327+0200',
		updated: '2025-08-14T12:02:45.327+0200',
		started: '2025-08-08T09:00:00.000+0200',
		timeSpent: '7h',
		timeSpentSeconds: 25200,
		id: '1774077',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1774078',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:03:31.575+0200',
		updated: '2025-08-14T12:03:31.575+0200',
		started: '2025-08-11T10:15:00.000+0200',
		timeSpent: '7h',
		timeSpentSeconds: 25200,
		id: '1774078',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/712034/worklog/1774079',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=SMITH_D',
			name: 'SMITH_D',
			key: 'JIRAUSER40313',
			emailAddress: 'david.smith@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'David Smith',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T12:04:00.319+0200',
		updated: '2025-08-14T12:04:00.319+0200',
		started: '2025-08-12T11:03:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1774079',
		issueId: '712034',
		issueKey: 'COM-63389',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1766255',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment:
			'Evaluation of the Window Management API for automatic window positioning on multiple screens:\r\n\r\nAccording to MDN Web Docs, the Window Management API is marked as Experimental and Limited availability (not part of the baseline, only compatible with recent Chromium browsers and often requiring specific flags or permission policies).\r\nAdoption in production would cause inconsistent behavior (or complete failure) in non-Chromium browsers, violating our stability and compatibility requirements.',
		created: '2025-07-30T15:14:12.635+0200',
		updated: '2025-07-30T15:47:18.815+0200',
		started: '2025-07-29T15:13:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1766255',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1766258',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment:
			'Reading:\r\nhttps://javascript.info/popup-windows\r\nhttps://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API/Using\r\n https://javascript.info/cross-window-communication\r\nhttps://developer.chrome.com/docs/capabilities/web-apis/window-management',
		created: '2025-07-30T15:14:48.744+0200',
		updated: '2025-07-30T15:14:48.744+0200',
		started: '2025-07-30T15:14:00.000+0200',
		timeSpent: '1d',
		timeSpentSeconds: 28800,
		id: '1766258',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1768947',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment:
			'Development is in the process of correcting the logic. I have currently created a class to centralize the logic, which obtains the list of available screens and positions the screen. It is activated by the ExternalWindowHandler method, but I am receiving an error: Window Management API: NotAllowedError: Transient activation is required to request permission.\r\nI understand that the error occurs because there is no user interaction such as a click or touch. I am changing the logic to execute WindowManager before openNewExternalWindow.',
		created: '2025-08-01T17:06:59.580+0200',
		updated: '2025-08-01T17:06:59.580+0200',
		started: '2025-08-01T09:01:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1768947',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1770795',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'try to upload the code',
		created: '2025-08-07T11:12:31.985+0200',
		updated: '2025-08-07T11:12:31.985+0200',
		started: '2025-08-06T11:12:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770795',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1770903',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:16:52.399+0200',
		updated: '2025-08-07T11:16:52.399+0200',
		started: '2025-08-04T11:16:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770903',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1770904',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:17:04.480+0200',
		updated: '2025-08-07T11:17:04.480+0200',
		started: '2025-08-05T11:16:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1770904',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1771153',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T17:56:33.247+0200',
		updated: '2025-08-07T17:56:33.247+0200',
		started: '2025-08-07T17:56:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1771153',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1771722',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '\n',
		created: '2025-08-08T15:00:44.494+0200',
		updated: '2025-08-08T15:00:44.494+0200',
		started: '2025-08-08T12:00:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1771722',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1773003',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-12T11:11:18.072+0200',
		updated: '2025-08-12T11:11:18.072+0200',
		started: '2025-08-11T11:11:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1773003',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1774055',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T10:53:49.638+0200',
		updated: '2025-08-14T10:53:49.638+0200',
		started: '2025-08-12T10:53:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774055',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1774056',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T10:53:58.332+0200',
		updated: '2025-08-14T10:53:58.332+0200',
		started: '2025-08-13T10:53:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774056',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1774057',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T10:54:14.872+0200',
		updated: '2025-08-14T10:54:14.872+0200',
		started: '2025-08-11T10:54:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '1774057',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1774407',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'help debugging',
		created: '2025-08-14T18:51:11.351+0200',
		updated: '2025-08-14T18:51:11.351+0200',
		started: '2025-08-12T18:50:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774407',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/711809/worklog/1774416',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:06:35.641+0200',
		updated: '2025-08-14T19:06:35.641+0200',
		started: '2025-08-14T13:06:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1774416',
		issueId: '711809',
		issueKey: 'COM-63356',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/710450/worklog/1772275',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T12:45:29.863+0200',
		updated: '2025-08-11T12:45:29.863+0200',
		started: '2025-08-08T12:45:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1772275',
		issueId: '710450',
		issueKey: 'COM-63063',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/710450/worklog/1772598',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T17:30:52.682+0200',
		updated: '2025-08-11T17:30:52.682+0200',
		started: '2025-08-11T17:30:00.000+0200',
		timeSpent: '5h',
		timeSpentSeconds: 18000,
		id: '1772598',
		issueId: '710450',
		issueKey: 'COM-63063',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/710450/worklog/1774428',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:57:08.323+0200',
		updated: '2025-08-14T19:57:08.323+0200',
		started: '2025-08-12T19:56:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '1774428',
		issueId: '710450',
		issueKey: 'COM-63063',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/710450/worklog/1774429',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:57:15.821+0200',
		updated: '2025-08-14T19:57:15.821+0200',
		started: '2025-08-13T19:57:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774429',
		issueId: '710450',
		issueKey: 'COM-63063',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/710450/worklog/1774430',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T19:57:19.813+0200',
		updated: '2025-08-14T19:57:19.813+0200',
		started: '2025-08-14T19:57:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774430',
		issueId: '710450',
		issueKey: 'COM-63063',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1770161',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T17:49:31.424+0200',
		updated: '2025-08-05T17:49:31.424+0200',
		started: '2025-08-05T17:49:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1770161',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1770900',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:14:59.165+0200',
		updated: '2025-08-07T11:14:59.165+0200',
		started: '2025-08-06T11:14:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1770900',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1771590',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-08T14:13:02.967+0200',
		updated: '2025-08-08T14:13:02.967+0200',
		started: '2025-08-07T12:13:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1771590',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1771643',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-08T14:48:29.628+0200',
		updated: '2025-08-08T14:48:29.628+0200',
		started: '2025-08-07T14:48:00.000+0200',
		timeSpent: '1d',
		timeSpentSeconds: 28800,
		id: '1771643',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1771644',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-08T14:48:44.233+0200',
		updated: '2025-08-08T14:48:44.233+0200',
		started: '2025-08-06T10:00:00.000+0200',
		timeSpent: '7h 30m',
		timeSpentSeconds: 27000,
		id: '1771644',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1773429',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-13T10:56:06.772+0200',
		updated: '2025-08-13T10:56:06.772+0200',
		started: '2025-08-08T10:00:00.000+0200',
		timeSpent: '1d',
		timeSpentSeconds: 28800,
		id: '1773429',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1773431',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-13T11:04:49.398+0200',
		updated: '2025-08-13T11:04:49.398+0200',
		started: '2025-08-11T11:04:00.000+0200',
		timeSpent: '1d',
		timeSpentSeconds: 28800,
		id: '1773431',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1773432',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-13T11:05:04.126+0200',
		updated: '2025-08-13T11:05:04.126+0200',
		started: '2025-08-12T10:00:00.000+0200',
		timeSpent: '1d',
		timeSpentSeconds: 28800,
		id: '1773432',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1773433',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-13T11:05:07.673+0200',
		updated: '2025-08-13T11:05:07.673+0200',
		started: '2025-08-13T10:00:00.000+0200',
		timeSpent: '1d',
		timeSpentSeconds: 28800,
		id: '1773433',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1774136',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T11:08:54.700+0200',
		updated: '2025-08-14T11:08:54.700+0200',
		started: '2025-08-13T11:08:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774136',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1774088',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=MARQUE_H',
			name: 'MARQUE_H',
			key: 'JIRAUSER40316',
			emailAddress: 'henry.miller@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10341',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10341',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10341',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10341',
			},
			displayName: 'Henry Miller',
			active: true,
			timeZone: 'Europe/Lisbon',
		},
		comment: '',
		created: '2025-08-14T12:12:12.689+0200',
		updated: '2025-08-14T12:12:12.689+0200',
		started: '2025-08-14T10:00:00.000+0200',
		timeSpent: '1d',
		timeSpentSeconds: 28800,
		id: '1774088',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1774384',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T16:54:17.138+0200',
		updated: '2025-08-14T16:54:17.138+0200',
		started: '2025-08-14T14:54:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1774384',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1774284',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'fix pipeline issues',
		created: '2025-08-14T17:50:18.514+0200',
		updated: '2025-08-14T17:50:18.514+0200',
		started: '2025-08-01T17:50:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1774284',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695798/worklog/1774287',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'prepare ticket for handover',
		created: '2025-08-14T18:01:52.815+0200',
		updated: '2025-08-14T18:01:52.815+0200',
		started: '2025-08-04T18:01:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774287',
		issueId: '695798',
		issueKey: 'COM-61140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1766363',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=ADAMS_S',
			name: 'ADAMS_S',
			key: 'JIRAUSER38514',
			emailAddress: 'sarah.adams@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Sarah Adams',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=ADAMS_S',
			name: 'ADAMS_S',
			key: 'JIRAUSER38514',
			emailAddress: 'sarah.adams@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Sarah Adams',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'review',
		created: '2025-07-30T17:47:21.186+0200',
		updated: '2025-07-30T17:47:21.186+0200',
		started: '2025-07-30T17:47:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1766363',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1768598',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-01T13:10:01.810+0200',
		updated: '2025-08-01T13:10:01.810+0200',
		started: '2025-08-01T13:09:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1768598',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1768882',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-01T17:14:32.336+0200',
		updated: '2025-08-01T17:14:32.336+0200',
		started: '2025-08-01T17:14:00.000+0200',
		timeSpent: '1h 30m',
		timeSpentSeconds: 5400,
		id: '1768882',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1769615',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-04T22:56:08.980+0200',
		updated: '2025-08-04T22:56:08.980+0200',
		started: '2025-08-04T22:55:00.000+0200',
		timeSpent: '4h',
		timeSpentSeconds: 14400,
		id: '1769615',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1770165',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=ADAMS_S',
			name: 'ADAMS_S',
			key: 'JIRAUSER38514',
			emailAddress: 'sarah.adams@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Sarah Adams',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=ADAMS_S',
			name: 'ADAMS_S',
			key: 'JIRAUSER38514',
			emailAddress: 'sarah.adams@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Sarah Adams',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T18:00:31.289+0200',
		updated: '2025-08-05T18:00:31.289+0200',
		started: '2025-08-05T18:00:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1770165',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1770166',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=ADAMS_S',
			name: 'ADAMS_S',
			key: 'JIRAUSER38514',
			emailAddress: 'sarah.adams@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Sarah Adams',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=ADAMS_S',
			name: 'ADAMS_S',
			key: 'JIRAUSER38514',
			emailAddress: 'sarah.adams@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Sarah Adams',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-05T18:00:39.797+0200',
		updated: '2025-08-05T18:00:39.797+0200',
		started: '2025-08-04T18:00:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1770166',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1770798',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T11:13:35.956+0200',
		updated: '2025-08-07T11:13:35.956+0200',
		started: '2025-08-06T11:13:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1770798',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1771226',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=ADAMS_S',
			name: 'ADAMS_S',
			key: 'JIRAUSER38514',
			emailAddress: 'sarah.adams@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Sarah Adams',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=ADAMS_S',
			name: 'ADAMS_S',
			key: 'JIRAUSER38514',
			emailAddress: 'sarah.adams@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Sarah Adams',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-07T17:53:26.978+0200',
		updated: '2025-08-07T17:53:26.978+0200',
		started: '2025-08-07T17:53:00.000+0200',
		timeSpent: '30m',
		timeSpentSeconds: 1800,
		id: '1771226',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1771589',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-08T14:12:58.687+0200',
		updated: '2025-08-08T14:12:58.687+0200',
		started: '2025-08-07T12:12:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1771589',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1772636',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-11T16:35:29.277+0200',
		updated: '2025-08-11T16:35:29.277+0200',
		started: '2025-08-11T16:35:00.000+0200',
		timeSpent: '1h',
		timeSpentSeconds: 3600,
		id: '1772636',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1774135',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=JWILSO',
			name: 'JWILSO',
			key: 'JIRAUSER40310',
			emailAddress: 'james.wilson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10346',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10346',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10346',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10346',
			},
			displayName: 'James Wilson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: '',
		created: '2025-08-14T11:07:08.032+0200',
		updated: '2025-08-14T11:07:08.032+0200',
		started: '2025-08-13T09:37:00.000+0200',
		timeSpent: '30m',
		timeSpentSeconds: 1800,
		id: '1774135',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/695796/worklog/1774292',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'review previous day session and related discussions',
		created: '2025-08-14T18:12:09.349+0200',
		updated: '2025-08-14T18:12:09.349+0200',
		started: '2025-08-05T18:11:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '1774292',
		issueId: '695796',
		issueKey: 'COM-61139',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/9998001',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'exact 8h test',
		created: '2025-08-06T18:00:00.000+0200',
		updated: '2025-08-06T18:00:00.000+0200',
		started: '2025-08-06T09:00:00.000+0200',
		timeSpent: '8h',
		timeSpentSeconds: 28800,
		id: '9998001',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/9998002',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'under 8h test',
		created: '2025-08-07T18:00:00.000+0200',
		updated: '2025-08-07T18:00:00.000+0200',
		started: '2025-08-07T10:00:00.000+0200',
		timeSpent: '6h',
		timeSpentSeconds: 21600,
		id: '9998002',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/9998003',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=THOMP_A',
			name: 'THOMP_A',
			key: 'JIRAUSER40312',
			emailAddress: 'alex.thompson@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Alex Thompson',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'over 8h test',
		created: '2025-08-08T19:00:00.000+0200',
		updated: '2025-08-08T19:00:00.000+0200',
		started: '2025-08-08T09:00:00.000+0200',
		timeSpent: '9h 30m',
		timeSpentSeconds: 34200,
		id: '9998003',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/9998004',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=COOPER_B',
			name: 'COOPER_B',
			key: 'JIRAUSER40307',
			emailAddress: 'brian.cooper@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Brian Cooper',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'weekend logging test (should highlight red)',
		created: '2025-08-09T15:00:00.000+0200',
		updated: '2025-08-09T15:00:00.000+0200',
		started: '2025-08-09T12:00:00.000+0200',
		timeSpent: '3h',
		timeSpentSeconds: 10800,
		id: '9998004',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
	{
		self: 'https://jira.example.com/rest/api/2/issue/716809/worklog/9998005',
		author: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		updateAuthor: {
			self: 'https://jira.example.com/rest/api/2/user?username=DAVIS_I',
			name: 'DAVIS_I',
			key: 'JIRAUSER40311',
			emailAddress: 'ian.davis@example.com',
			avatarUrls: {
				'48x48': 'https://jira.example.com/secure/useravatar?avatarId=10122',
				'24x24':
					'https://jira.example.com/secure/useravatar?size=small&avatarId=10122',
				'16x16':
					'https://jira.example.com/secure/useravatar?size=xsmall&avatarId=10122',
				'32x32':
					'https://jira.example.com/secure/useravatar?size=medium&avatarId=10122',
			},
			displayName: 'Ian Davis',
			active: true,
			timeZone: 'Europe/Berlin',
		},
		comment: 'today partial hours (excluded from net karma)',
		created: '2025-08-20T13:30:00.000+0200',
		updated: '2025-08-20T13:30:00.000+0200',
		started: '2025-08-20T11:00:00.000+0200',
		timeSpent: '2h',
		timeSpentSeconds: 7200,
		id: '9998005',
		issueId: '716809',
		issueKey: 'COM-64140',
	},
];

export default MockWorklogs;
