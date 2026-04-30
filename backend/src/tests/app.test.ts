import request from 'supertest';
import { app } from '../index';

describe('GET /', () => {
    it('responds with Hola LTI!', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hola LTI!');
    });
});
