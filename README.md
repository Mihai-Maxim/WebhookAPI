# WebhookAPI
 Create a webhook that requires multiple participants to consent in order for it to be activated / fired.

# Basic Workfolow

1. User gets an API key for an email address.
```javascript
https://webhookapi/api/get-api-key?email=example@gmail.com => 8adecb78-4b4d-4ba7-bd21-f96df2adb2fd
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


