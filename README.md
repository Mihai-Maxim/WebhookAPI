# Multi-Participant Consent Webhook

The multi-participant consent webhook project aims to create a webhook system that requires multiple participants to give their consent before it can be activated or fired. This ensures that all participants involved in a particular process or event agree to proceed before any action is taken.

## Basic Workflow

1. **User Authentication**: Users log in to the system and obtains an API key associated with their email address. This API key will be used for subsequent API requests.

2. **Webhook Creation**: The user creates a webhook by making a POST request to the designated API endpoint (`https://webhookapi/api/create-hook`). The request includes the necessary payload, which specifies the number of participants required for consent, the target URL where the webhook will be sent, the headers to be included in the request, and the initial body content.

3. **Participant Activation**: Each participant involved in the webhook activates their individual participation by making a POST request to the activation endpoint (`https://webhookapi/api/activate-hook`). The request includes the specific webhook ID and the participant ID, uniquely identifying the participant. The participant can contribute additional data to the webhook's body, as specified in their payload.

4. **Webhook Execution**: Once all the required participants have given their consent and activated their participation, the webhook is ready to be sent. The system generates a final POST request with the complete webhook data, including the target URL, headers, and a consolidated body containing the contributions from all participants. This request is sent to the specified target URL, triggering the desired action or event.

By implementing this multi-participant consent webhook system, users can ensure that critical processes or events are not executed until all involved participants have explicitly given their consent. This provides a robust mechanism for ensuring the collective agreement and readiness of all parties involved in a webhook-based workflow.


## Endpoints

### User Registration Endpoint

- Endpoint: `POST /api/login`
- Description: This endpoint handles user login and authentication.
- Request Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
- Response:
  - Status code:
    - 200 OK: Successful login. The user is authenticated.
    ```json
      Response Body:
      {
        "token": "<auth_token>"
      }
    ```
    - 401 Unauthorized: Login failed. The user's credentials are invalid.
    - 400 Bad Request: The request payload is invalid or missing required fields.

### User Registration Endpoint

- Endpoint: `POST /api/register`
- Description: This endpoint handles user registration of an user.
- Request Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response:
  - Status code:
    - 200 OK: Successful login. The user is authenticated.
    - 409 Conflict: Register failed. There already exists an user with the provided email.
    - 400 Bad Request: The request payload is invalid or missing required fields.

### Generate API Key Endpoint

- Endpoint: `POST /api/generate-api-key`
- Description: This endpoint generates a new API key associated with the user's email address. The user must be logged in to access this endpoint.
- Response:
  - Status code:
    - 200 OK: Successful generation of API key. The response body contains the newly generated API key.
      ```json
      Response Body:
      {
        "api_key": "8adecb78-4b4d-4ba7-bd21-f96df2adb2fd"
      }
      ```
    - 401 Unauthorized: The user is not logged in. Please log in to generate an API key.

### Webhook Creation Endpoint

- Endpoint: `POST /api/create-hook?api_key={api_key}`
- Description: This endpoint allows the user to create a webhook by providing the necessary details in the request payload.  
  It must include a positive participants number, a target url and a body. Headers are optional.
- Request Payload:
  ```json
  {
    "participants": 3,
    "url": "www.example.com/post",
    "headers": {
      "Authorization": "Bearer ..."
    },
    "body": {
      "name": "All participants consented",
      "action": "emit"
    }
  }
- Response
  - Status code:
    - 201 Created: The webhook is successfully created. The response body contains the webhook ID and participant IDs.
      ```json
      Response Body:
      {
        "hook_id": "4dc470b2-80f9-4c80-a65c-d3d482c10757",
        "participant_ids": [
          "0a2e451d-d059-4ce0-bee2-e7bc3a5965df",
          "a8e1eee0-d4e6-4c5c-860c-f27ef355f87a",
          "3e528def-21ad-477e-9538-7e83cbd0102f"
        ]
      }
      ```
    - 400 Bad Request: The request payload is invalid or missing required fields.
    - 401 Unauthorized: The user provided an invalid API key.

### Participant Activation Endpoint

- Endpoint: `POST /api/activate-hook?hook_id={hook_id}&participant_id={participant_id}`
- Description: This endpoint allows participants to activate their involvement in the webhook and contribute data to the webhook's body.
- Request Payload Example:
  ```json
  {
  "name": "p1",
  "data": "finished"
  }
  ```
- Response
  - Status code:
    - 200 OK: Participant activation is successful.
    - 400 Bad Request: The request payload is missing required fields (hook_id, participant_id).
    - 401 Unauthorized: The user provided an invalid participant_id or hook_id.

