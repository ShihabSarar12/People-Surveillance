import request from 'supertest';
import app from '../../src/app';
import blockchainService from '../../src/services/blockchain.service';
import { PublicUser } from '../../src/services/blockchain.service';

describe('Blockchain API', () => {
    const mockUser: PublicUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
    };

    beforeEach(() => {
        jest.spyOn(blockchainService, 'getUserData').mockResolvedValue(mockUser);
        jest.spyOn(blockchainService, 'sanitizeQuery').mockImplementation(() =>
            '&lt;sanitized&gt;'
        );
        jest.spyOn(blockchainService, 'initializeBlockchain').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return user with specific id', async () => {
        const response = await request(app).get(
            '/api/v1/blockchain/user/1?query=<script>alert("test")</script><a href="http://example.com">link</a>'
        );

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('query');
        expect(Object.keys(response.body)).toHaveLength(2);
        expect(response.body.user).toEqual(mockUser);
        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body.query).toBe('&lt;sanitized&gt;');
    });

    it('should return a message on GET /message', async () => {
        const response = await request(app).get('/api/v1/blockchain/message');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Blockchain controller initialized successfully',
        });
    });

    it('should create a user with valid data', async () => {
        const newUser = {
            username: 'shihabsarar12',
            email: 'shihab@gmail.om',
            password: '@Chk232h',
            eventTime: '2022-12-31T23:00:00',
            eventDate: '2025-05-12',
        };
        const response = await request(app)
            .post('/api/v1/blockchain/test')
            .send(newUser);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Blockchain controller initialized successfully',
        });
    });
});
