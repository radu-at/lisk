/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const lisk = require('lisk-elements').default;
const { CACHE } = require('../../../components/cache/constants');
const createCache = require('../../../components');
const Logger = require('../../../logger');
const accountFixtures = require('../../fixtures/accounts');
const randomUtil = require('../../common/utils/random');

describe('components: cache', () => {
	let cache;

	before(async () => {
		__testContext.config.cacheEnabled = true;
		this.logger = new Logger({
			echo: null,
			errorLevel: __testContext.config.fileLogLevel,
			filename: __testContext.config.logFileName,
		});
		cache = createCache(__testContext.config.redis, this.logger);
		await cache.bootstrap();
		return expect(cache).to.be.an('object');
	});

	afterEach(async () => {
		const result = await cache.flushDb();
		return expect(result).to.equal('OK');
	});

	after(() => {
		return cache.quit();
	});

	describe('connect', () => {});

	describe('_onConnectionError', () => {});

	describe('_onReady', () => {});

	describe('isConnected', () => {});

	describe('isReady', () => {});

	describe('setJsonForKey', () => {
		it('should set the key value correctly', async () => {
			const key = 'test_key';
			const value = { testObject: 'testValue' };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			const res = await cache.getJsonForKey(key);
			expect(res).to.eql(value);
		});
	});

	describe('getJsonForKey', () => {
		it('should return null for non-existent key', async () => {
			const key = 'test_key';

			const value = await cache.getJsonForKey(key);
			expect(value).to.equal(null);
		});

		it('should get the correct value for the key', async () => {
			const key = 'test_key';
			const value = { testObject: 'testValue' };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			const res = await cache.getJsonForKey(key);
			expect(res).to.eql(value);
		});
	});

	describe('removeByPattern', () => {
		it('should remove keys matching the pattern', async () => {
			const key = '/api/transactions?123';
			const key2 = '/api/transactions?1234';
			const value = { testObject: 'testValue' };
			const pattern = '/api/transactions*';

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			const result2 = await cache.setJsonForKey(key2, value);
			expect(result2).to.equal('OK');
			await cache.removeByPattern(pattern);
			const res = await cache.getJsonForKey(key);
			expect(res).to.equal(null);
			const res2 = await cache.getJsonForKey(key2);
			expect(res2).to.equal(null);
		});

		it('should not remove keys that dont match pattern', async () => {
			const key = '/api/transactions?123';
			const value = { testObject: 'testValue' };
			const pattern = '/api/delegate*';
			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.removeByPattern(pattern);
			const res = await cache.getJsonForKey(key);
			expect(res).to.eql(value);
		});
	});

	describe('flushDb', () => {
		it('should remove all keys from cache', async () => {
			const keys = ['test_key1', 'test_key2'];
			const dummyValue = {
				a: 'dummyValue',
			};

			const setPromises = keys.map(key => cache.setJsonForKey(key, dummyValue));
			const setResults = await Promise.all(setPromises);
			expect(setResults.filter(status => status !== 'OK')).to.have.length(0);

			const resultFlush = await cache.flushDb();
			expect(resultFlush).to.equal('OK');

			const getPromises = keys.map(key => cache.getJsonForKey(key));
			const getResults = await Promise.all(getPromises);
			expect(getResults.filter(status => status === null)).to.have.length(
				keys.length
			);
		});
	});

	describe('cleanup', () => {});

	describe('quit', () => {});

	describe('clearCacheFor', () => {
		it('should remove all keys matching pattern /api/transactions', async () => {
			const key = '/api/transactions?123';
			const value = { testObject: 'testValue' };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.clearCacheFor('/api/transactions*');
			const res = await cache.getJsonForKey(key);
			expect(res).to.equal(null);
		});

		it('should remove all keys matching pattern /api/blocks', async () => {
			const key = '/api/blocks';
			const value = { testObject: 'testValue' };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.clearCacheFor('/api/blocks*');
			const res = await cache.getJsonForKey(key);
			expect(res).to.equal(null);
		});

		it('should not remove keys that dont match pattern /api/blocks', async () => {
			const key = '/api/delegates';
			const value = { testObject: 'testValue' };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.clearCacheFor('/api/delegates*');
			const res = await cache.getJsonForKey(key);
			expect(res).to.equal(null);
		});

		it('should not remove keys when cacheReady = false', async () => {
			const key = '/api/transactions';
			const value = { testObject: 'testValue' };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.onSyncStarted();
			const clearCacheForErr = await cache.clearCacheFor('/api/transactions*');
			expect(clearCacheForErr.message).to.equal('Cache Disabled');
			await cache.onSyncFinished();
			const res = await cache.getJsonForKey(key);
			expect(res).to.eql(value);
		});
	});

	describe('onFinishRound', () => {
		it('should remove all keys matching pattern /api/delegates', async () => {
			const key = '/api/delegates?123';
			const value = { testObject: 'testValue' };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.onFinishRound();
			const res = await cache.getJsonForKey(key);
			expect(res).to.equal(null);
		});

		it('should not remove keys that dont match pattern /api/delegates', async () => {
			const key = '/api/blocks';
			const value = { testObject: 'testValue' };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.onFinishRound();
			const res = await cache.getJsonForKey(key);
			expect(res).to.eql(value);
		});

		it('should not remove keys when cacheReady = false', async () => {
			const key = '/api/delegates';
			const value = { testObject: 'testValue' };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.onSyncStarted();
			const onFinishRoundErr = await cache.onFinishRound();
			expect(onFinishRoundErr.message).to.equal('Cache Disabled');
			await cache.onSyncFinished();
			const res = await cache.getJsonForKey(key);
			expect(res).to.eql(value);
		});
	});

	describe('onTransactionsSaved', () => {
		it('shouldnt remove keys with pattern /api/delegate if there is no type 2 transaction', async () => {
			const key = '/api/delegates?123';
			const value = { testObject: 'testValue' };
			const transaction = lisk.transaction.transfer({
				amount: 1,
				passphrase: accountFixtures.genesis.passphrase,
				secondPassphrase: accountFixtures.genesis.secondPassphrase,
				recipientId: '1L',
			});

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.onTransactionsSaved([transaction]);
			const res = await cache.getJsonForKey(key);
			expect(res).to.eql(value);
		});

		it('should remove keys that match pattern /api/delegate on type 2 transaction', async () => {
			const key = '/api/delegates?123';
			const value = { testObject: 'testValue' };
			const transaction = lisk.transaction.registerDelegate({
				passphrase: randomUtil.password(),
				username: randomUtil.delegateName().toLowerCase(),
			});

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.onTransactionsSaved([transaction]);
			const res = await cache.getJsonForKey(key);
			expect(res).to.equal(null);
		});

		it('should remove keys "transactionCount" if there is any transaction saved', async () => {
			const key = CACHE.KEYS.transactionCount;
			const value = { confirmed: 34 };
			const transaction = lisk.transaction.registerDelegate({
				passphrase: randomUtil.password(),
				username: randomUtil.delegateName().toLowerCase(),
			});

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.onTransactionsSaved([transaction]);
			const res = await cache.getJsonForKey(key);
			expect(res).to.equal(null);
		});

		it('should not remove keys "transactionCount" if no transaction saved', async () => {
			const key = CACHE.KEYS.transactionCount;
			const value = { confirmed: 34 };

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.onTransactionsSaved([]);
			const res = await cache.getJsonForKey(key);
			expect(res).to.eql(value);
		});

		it('should not remove keys when cacheReady = false', async () => {
			const key = '/api/delegates?123';
			const value = { testObject: 'testValue' };
			const transaction = lisk.transaction.registerDelegate({
				passphrase: randomUtil.password(),
				username: randomUtil.delegateName().toLowerCase(),
			});

			const result = await cache.setJsonForKey(key, value);
			expect(result).to.equal('OK');
			await cache.onSyncStarted();
			const onTransactionsSavedErr = await cache.onTransactionsSaved([
				transaction,
			]);
			expect(onTransactionsSavedErr.message).to.equal('Cache Disabled');
			await cache.onSyncFinished();
			const res = await cache.getJsonForKey(key);
			expect(res).to.eql(value);
		});
	});

	describe('onSyncStarted', () => {});

	describe('onSyncFinished', () => {});
});
