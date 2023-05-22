import request from "supertest"
import app from "../app"
import fs from "fs"
import { response } from "express";
import { uuid } from "uuidv4";
describe('Multi-Participant Consent Webhook API', () => {
  let authToken
  let apiKey;
  let webhookId;

  const randID = uuid()



  const logIn = async () => {
    let response = await request(app)
        .post('/api/login')
        .send({
          email: `user@example.com`,
          password: 'password123'
        });
    authToken = response.body.token

    response = await request(app)
        .post('/api/generate-api-key')
        .set('Authorization', `Bearer ${authToken}`);
    apiKey = response.body.api_key
  }


  describe('User Login', () => {
    test('should log in a user and return 200 with authorization token', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: `user@example.com`,
          password: 'password123'
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();
      authToken = response.body.token
    });
  
    test('should return 401 if user credentials are invalid', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: `user@example.com`,
          password: 'invalidpassword'
        });
  
      expect(response.statusCode).toBe(401);
      // expect(response.body.error).toBe('Invalid credentials');
    });
  
    test('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: `user@example.com`
        });
  
      expect(response.statusCode).toBe(400);
      // expect(response.body.error).toBe('Email and password are required');
    });
  });  

  describe('API Key generation', () => {
    test('should return 401 when Authorization header is not provided', async () => {
      const response = await request(app).post('/api/generate-api-key');
      expect(response.statusCode).toBe(401);
    });
  
    test('should return 200 OK and generate a new API key', async () => {
      const response = await request(app)
        .post('/api/generate-api-key')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.api_key).toBeDefined();
      apiKey = response.body.api_key
    });

    test('should return 401 Bad Request if the Authorization header is invalid', async () => {
      const response = await request(app)
        .post('/api/generate-api-key')
        .set('Authorization', 'InvalidToken');
      expect(response.statusCode).toBe(401);
    });

  })
  

  describe('Webhook Creation', () => {

    test('should return 201 Created and generate webhook ID and participant IDs', async () => {
      await logIn()

      const response = await request(app)
        .post(`/api/create-hook?api_key=${apiKey}`)
        .send({
          participants: 3,
          url: 'https://httpbin.org/post',
          headers: { Authorization: 'Bearer ...' },
          body: { name: 'All participants consented', action: 'emit' }
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.hook_id).toBeDefined();
      expect(response.body.participants_id).toHaveLength(3);

      webhookId = response.body.hook_id;
    });

    test('should return 400 Bad Request for incomplete webhook creation payload', async () => {
      const response = await request(app)
        .post('/api/create-hook')
        .set('Authorization', `Bearer ${apiKey}`)
        .send({ participants: 2, url: 'www.example.com/post' });
      expect(response.statusCode).toBe(400);
    });

    
  });


describe('Participant Activation', () => {
  let participantIds;

  beforeAll(async () => {
    // Create a webhook with 3 participants
    await logIn()
    const webhookResponse = await request(app)
      .post(`/api/create-hook?api_key=${apiKey}`)
      .send({
        participants: 3,
        url: 'https://httpbin.org/post',
        headers: {
          'Authorization': 'Bearer ...'
        },
        body: {
          'name': 'All participants consented',
          'action': 'emit'
        }
      });


    webhookId = webhookResponse.body.hook_id;
    participantIds = webhookResponse.body.participants_id;
  });

  test('should activate each participant and write to a file', async () => {
    let finalResp
    const activationPromises = participantIds.map(async (participantId, index) => {
      const response = await request(app)
        .post(`/api/activate-hook?hook_id=${webhookId}&participant_id=${participantId}`)
        .send({
          'name': participantId,
          'data': 'finished ' + index
        });

      expect(response.statusCode).toBe(200);
      if (response.body.allConsented === true) finalResp = response.body
      return response; 
    });

    await Promise.all(activationPromises);

    const json_response = JSON.stringify(finalResp, null, 2)


    expect(json_response).toContain('All participants consented');
    participantIds.forEach((participantId) => {
      expect(json_response).toContain(participantId);
    });
  });
});

  
});


