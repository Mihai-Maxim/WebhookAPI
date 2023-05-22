import request from "supertest"
import app from "../app"
import fs from "fs"
describe('Multi-Participant Consent Webhook API', () => {
  let authToken
  let apiKey;
  let webhookId;


  const logIn = async () => {
    const response = await request(app)
        .post('/api/login')
        .send({
          email: 'user@example.com',
          password: 'password123'
        });
    authToken = response.body.token
  }

  describe('User Registration', () => {
    it('should register a new user and return 200', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'user@example.com',
          password: 'password123'
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Account created successfully');
    });
  
    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'user@example.com'
        });
  
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });
  
    it('should return 409 if user is already registered with the provided email', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'user@example.com',
          password: 'password123'
        });
  
      expect(response.statusCode).toBe(409);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });
  

  describe('User Login', () => {
    it('should log in a user and return 200 with authorization token', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'user@example.com',
          password: 'password123'
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.message).toBe('Login successful');
      authToken = response.body.token
    });
  
    it('should return 401 if user credentials are invalid', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'user@example.com',
          password: 'invalidpassword'
        });
  
      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  
    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'user@example.com'
        });
  
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });
  });  

  describe('API Key generation', () => {
    it('should return 400 when Authorization header is not provided', async () => {
      const response = await request(app).post('/api/generate-api-key');
      expect(response.statusCode).toBe(400);
    });
  
    it('should return 200 OK and generate a new API key', async () => {
      const response = await request(app)
        .post('/api/generate-api-key')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.api_key).toBeDefined();
      apiKey = response.body.api_key
    });

    it('should return 401 Bad Request if the Authorization header is invalid', async () => {
      const response = await request(app)
        .post('/api/generate-api-key')
        .set('Authorization', 'InvalidToken');
      expect(response.statusCode).toBe(401);
    });

  })
  

  describe('Webhook Creation', () => {

    it('should return 201 Created and generate webhook ID and participant IDs', async () => {
      await logIn()

      const response = await request(app)
        .post(`/api/create-hook?api_key=${apiKey}`)
        .send({
          participants: 3,
          url: 'www.example.com/post',
          headers: { Authorization: 'Bearer ...' },
          body: { name: 'All participants consented', action: 'emit' }
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.hook_id).toBeDefined();
      expect(response.body.participant_ids).toHaveLength(3);

      webhookId = response.body.hook_id;
    });

    it('should return 400 Bad Request for incomplete webhook creation payload', async () => {
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
    const webhookResponse = await request(app)
      .post(`/api/create-hook?api_key=${apiKey}`)
      .send({
        participants: 3,
        url: 'http://localhost:5000/post',
        headers: {
          'Authorization': 'Bearer ...'
        },
        body: {
          'name': 'All participants consented',
          'action': 'emit'
        }
      });

    webhookId = webhookResponse.body.hook_id;
    participantIds = webhookResponse.body.participant_ids;
  });

  it('should activate each participant and write to a file', async () => {
    const activationPromises = participantIds.map(async (participantId) => {
      const response = await request(app)
        .post(`/api/activate-hook?hook_id=${webhookId}&participant_id=${participantId}`)
        .send({
          'name': participantId,
          'data': 'finished'
        });

      expect(response.statusCode).toBe(200);
      return response;
    });

    await Promise.all(activationPromises);

    const filePath = './activation.log';
    const fileContent = fs.readFileSync(filePath, 'utf8');

    expect(fileContent).toContain('All participants consented');
    participantIds.forEach((participantId) => {
      expect(fileContent).toContain(participantId);
    });
  });
});

  
});


