"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('AI Module', () => {
    let testUser;
    let authToken;
    let testDream;
    let originalFetch;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
        testDream = await test_factories_1.TestFactories.createDream(testUser.id, {
            content: 'I was flying over a colorful mountain range',
            title: 'Flying Dream',
        });
        originalFetch = global.fetch;
    });
    afterEach(async () => {
        global.fetch = originalFetch;
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('POST /api/v1/ai/analysis/:nodeId', () => {
        beforeEach(() => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    model: 'gpt-4',
                    prompt: 'Analyze this dream',
                    result: 'This dream represents a desire for freedom and escape.',
                    metadata: { tokens: 50, confidence: 0.85 },
                }),
            });
        });
        it('should request and save AI analysis', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/analysis/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                analysis_type: 'jungian',
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.analysis_type).toBe('jungian');
            expect(response.body.data.result).toBe('This dream represents a desire for freedom and escape.');
            expect(response.body.data.ai_model).toBe('gpt-4');
        });
        it('should call AI service with correct payload', async () => {
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/analysis/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                analysis_type: 'psychoanalytic',
            })
                .expect(201);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            const fetchCall = global.fetch.mock.calls[0];
            expect(fetchCall[0]).toContain('/analyze');
            const body = JSON.parse(fetchCall[1].body);
            expect(body.node_id).toBe(testDream.node.id);
            expect(body.analysis_type).toBe('psychoanalytic');
        });
        it('should return 404 for non-existent node', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/ai/analysis/00000000-0000-0000-0000-000000000000')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                analysis_type: 'jungian',
            })
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for other user node', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser();
            const otherDream = await test_factories_1.TestFactories.createDream(otherUser.id);
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/analysis/${otherDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                analysis_type: 'jungian',
            })
                .expect(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should handle AI service error response', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 500,
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/analysis/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                analysis_type: 'jungian',
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/analysis/${testDream.node.id}`)
                .send({
                analysis_type: 'jungian',
            })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/ai/analysis/:nodeId', () => {
        beforeEach(() => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    model: 'gpt-4',
                    prompt: null,
                    result: 'Analysis result from AI.',
                    metadata: null,
                }),
            });
        });
        it('should return empty array when no analysis exists', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/analysis/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
        it('should return analysis results after analysis is requested', async () => {
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/analysis/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                analysis_type: 'jungian',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/analysis/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.data[0]).toHaveProperty('analysis_type', 'jungian');
        });
        it('should return multiple analyses for same node', async () => {
            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    model: 'gpt-4',
                    prompt: null,
                    result: 'Jungian analysis result.',
                    metadata: null,
                }),
            })
                .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    model: 'gpt-4',
                    prompt: null,
                    result: 'Psychoanalytic analysis result.',
                    metadata: null,
                }),
            });
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/analysis/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ analysis_type: 'jungian' });
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/analysis/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ analysis_type: 'psychoanalytic' });
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/analysis/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
        });
        it('should return 404 for non-existent node', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/ai/analysis/00000000-0000-0000-0000-000000000000')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for other user node', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser();
            const otherDream = await test_factories_1.TestFactories.createDream(otherUser.id);
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/analysis/${otherDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/analysis/${testDream.node.id}`)
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('POST /api/v1/ai/image/:nodeId', () => {
        beforeEach(() => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    model: 'dall-e-3',
                    prompt: 'A colorful mountain range',
                    result: 'Image generated successfully',
                    metadata: { size: '1024x1024' },
                    image_url: 'https://example.com/generated-image.png',
                }),
            });
        });
        it('should request and save AI image with node content', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ prompt: null })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.image_url).toBe('https://example.com/generated-image.png');
            expect(response.body.data.ai_model).toBe('dall-e-3');
        });
        it('should request image with custom prompt', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                prompt: 'A fantastical dream landscape with purple skies',
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            const fetchCall = global.fetch.mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            expect(body.prompt).toBe('A fantastical dream landscape with purple skies');
        });
        it('should return 404 for non-existent node', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/ai/image/00000000-0000-0000-0000-000000000000')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ prompt: 'test' })
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for other user node', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser();
            const otherDream = await test_factories_1.TestFactories.createDream(otherUser.id);
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/image/${otherDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ prompt: 'test' })
                .expect(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should handle AI image service error', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 503,
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ prompt: 'test' })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should reject when AI returns no image_url', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    model: 'dall-e-3',
                    result: 'Generated',
                    metadata: null,
                }),
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ prompt: 'test' })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/image/${testDream.node.id}`)
                .send({ prompt: 'test' })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/ai/image/:nodeId', () => {
        beforeEach(() => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    model: 'dall-e-3',
                    prompt: null,
                    result: 'Generated',
                    metadata: null,
                    image_url: 'https://example.com/image.png',
                }),
            });
        });
        it('should return empty array when no images exist', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
        it('should return images after image is generated', async () => {
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ prompt: 'A beautiful landscape' });
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.data[0].image_url).toBe('https://example.com/image.png');
        });
        it('should return multiple images for same node', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    model: 'dall-e-3',
                    prompt: null,
                    result: 'Generated',
                    metadata: null,
                    image_url: 'https://example.com/image.png',
                }),
            });
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ prompt: 'first image' });
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ prompt: 'second image' });
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/image/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
        });
        it('should return 404 for non-existent node', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/ai/image/00000000-0000-0000-0000-000000000000')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for other user node', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser();
            const otherDream = await test_factories_1.TestFactories.createDream(otherUser.id);
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/image/${otherDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/ai/image/${testDream.node.id}`)
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
});
//# sourceMappingURL=ai.test.js.map