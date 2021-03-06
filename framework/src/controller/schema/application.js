module.exports = {
	appLabel: {
		id: '#appLabel',
		type: 'string',
		pattern: '^[a-zA-Z][0-9a-zA-Z\\_\\-]*$',
	},

	genesisBlock: {
		id: '#genesisBlock',
		type: 'object',
	},

	constants: {
		id: '#/app/constants',
		type: 'object',
	},

	logger: {
		$id: '#/app/logger',
		type: 'object',
		required: ['filename'],
		properties: {
			filename: {
				type: 'string',
			},
			fileLogLevel: {
				type: 'string',
				enum: ['info', 'debug', 'trace'],
			},
			consoleLogLevel: {
				type: 'string',
				enum: ['info', 'debug', 'trace'],
			},
			echo: {
				type: 'string',
			},
		},
	},

	config: {
		id: '#/app/config',
		type: 'object',
		properties: {
			components: {
				type: 'object',
				properties: {
					logger: {
						$ref: '#/app/logger',
					},
				},
			},
		},
		additionalProperties: false,
	},
};
