# Multi-Participant Consent Webhook

The multi-participant consent webhook project aims to create a webhook system that requires multiple participants to give their consent before it can be activated or fired. This ensures that all participants involved in a particular process or event agree to proceed before any action is taken.

## Basic Workflow

1. **User Authentication**: Users log in to the system and obtain an API key associated with their email address. This API key will be used for subsequent API requests.

2. **Webhook Creation**: The user creates a webhook by making a POST request to the designated API endpoint (`https://webhookapi/api/create-hook`). The request includes the necessary payload, which specifies the number of participants required for consent, the target URL where the webhook will be sent, the headers to be included in the request, and the initial body content.

3. **Participant Activation**: Each participant involved in the webhook activates their individual participation by making a POST request to the activation endpoint (`https://webhookapi/api/activate-hook`). The request includes the specific webhook ID and the participant ID, uniquely identifying the participant. The participant can contribute additional data to the webhook's body, as specified in their payload.

4. **Webhook Execution**: Once all the required participants have given their consent and activated their participation, the webhook is ready to be sent. The system generates a final POST request with the complete webhook data, including the target URL, headers, and a consolidated body containing the contributions from all participants. This request is sent to the specified target URL, triggering the desired action or event.

By implementing this multi-participant consent webhook system, users can ensure that critical processes or events are not executed until all involved participants have explicitly given their consent. This provides a robust mechanism for ensuring the collective agreement and readiness of all parties involved in a webhook-based workflow.


# Example Workfolow

1. User gets an API key for an email address.
```javascript
https://webhookapi/api/get-api-key => 8adecb78-4b4d-4ba7-bd21-f96df2adb2fd
```
2. User creates a webhook.
```javascript

response = https://webhookapi/api/create-hook?api_key=8adecb78-4b4d-4ba7-bd21-f96df2adb2fd (POST)

(Payload) hook_data: {
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

response: {
  "hook_id": "4dc470b2-80f9-4c80-a65c-d3d482c10757",
  "participant_ids": [
    "0a2e451d-d059-4ce0-bee2-e7bc3a5965df",
    "a8e1eee0-d4e6-4c5c-860c-f27ef355f87a",
    "3e528def-21ad-477e-9538-7e83cbd0102f"
   ],
}
```
3. Each participant activates his hook and contributes to the hook_data body.
```javascript

Example for participant_1:

https://webhookapi/api/activate-hook?hook_id=4dc470b2-80f9-4c80-a65c-d3d482c10757&participant_id=0a2e451d-d059-4ce0-bee2-e7bc3a5965df (POST)

participant_1 Payload: {
  "name": "p1",
  "data": "finished"
}

```
4. The webhook is sent.

 ```javascript
Final POST request sent to the target url: {
  "url": "www.example.com/post",
  "headers": {
    "Authorization": "Bearer ..."
  },
  "body": {
    "name": "All participants consented",
    "action": "emit",
    "participants_data": {
      "0a2e451d-d059-4ce0-bee2-e7bc3a5965df": {
        "name": "p1",
        "status": "finished"
      },
      "a8e1eee0-d4e6-4c5c-860c-f27ef355f87a": {
        "name": "p2",
        "data": "finished"
      },
      "3e528def-21ad-477e-9538-7e83cbd0102f": {
        "name": "p3",
        "data": "finished"
      }
    }
  }
}

``` 


