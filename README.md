# React Native app example with lib-js

React native application using the [Pryv.io JavaScript library](https://github.com/pryv/lib-js).
This applications displays 2 implementations of the Pryv.io authentication process.

1. Login button that launches the [Pryv.io Authentication process](https://api.pryv.com/reference/#authenticate-your-app).
2. Personal login simulation

| Login selection | App-web-auth3 login | Consent | Dashboard |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| <img src="doc-src/login-selection.png" alt="login-selection" style="zoom:33%;" /> | <img src="doc-src/login.png" alt="app-web-auth-login" style="zoom:33%;" /> | <img src="doc-src/consent.png" alt="consent" style="zoom:33%;" /> | <img src="doc-src/dashboard1.png" alt="Dashboard" style="zoom:33%;" /> |

## Getting started

If you have no local react-native environment setup, the quickest way to get up and running is to use a prepared docker container.  
To run this application with the [react-native-docker image](https://github.com/theanam/react-native-docker):

1. start the docker image

```bash
docker run --rm -it -v `pwd`:/app --network host theanam/react-native bash
```

2. Download [expo app](https://expo.io/tools#client) for easier testing

3. Build the project (in the `/app/PryvReactNative` directory inside the container):

```bash
expo start (in /app/PryvReactNative directory)
```

4. In the expo app, you can scan the QR code to run the app (the mobile device has to be on the same network as the computer)

## Description

The application is based on [create-react-native-app](https://github.com/expo/create-react-native-app). 

You can check [./PryvReactNative/views/auth/login-method-selection.js](/PryvReactNative/views/auth/login-method-selection.js) for the Pryv.io authentication related code. As explained in the [lib-js README](https://github.com/pryv/lib-js), you need to do the following:

1. Import `pryv` library:

```javascript
import { Pryv } from 'pryv';
```

2. Execute `Pryv.Browser.setupAuth()` with correct settings and `state` change listener (it is important that authSettings would NOT have `spanButtonID` setting,
 otherwise, default Pryv login button would be rendered):

```javascript
// called each time the authentication state changed
function pryvAuthStateChange (state) {
  console.log('##pryvAuthStateChange', state);
  if (state !== authState) {
    setAuthState(state);
  }
}

const authSettings = {
  onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
  authRequest: { // See: https://api.pryv.com/reference/#auth-request
    requestingAppId: 'lib-js-test',
    languageCode: 'fr', // optional (default english)
    requestedPermissions: [
      {
        streamId: 'test',
        defaultName: 'test',
        level: 'manage'
      }
    ],
    clientData: {
      'app-web-auth:description': {
        'type': 'note/txt', 'content': 'This is a consent message.'
      }
    },
    // referer: 'my test with lib-js', // optional string to track registration source
  }
};
// To avoid CORS problem in local environment we use json and not the url
let serviceInfoUrl = null; // 'https://api.pryv.com/lib-js/demos/service-info.json';
let serviceInfoJson = {
  "register": "https://reg.pryv.me",
  "access": "https://access.pryv.me/access",
  "api": "https://{username}.pryv.me/",
  "name": "Pryv Lab",
  "home": "https://www.pryv.com",
  "support": "https://pryv.com/helpdesk",
  "terms": "https://pryv.com/pryv-lab-terms-of-use/",
  "eventTypes": "https://api.pryv.com/event-types/flat.json",
  "assets": {
    "definitions": "https://pryv.github.io/assets-pryv.me/index.json"
  }
};
try {
  let pryvService = await Pryv.Browser.setupAuth(
    authSettings,
    serviceInfoUrl,
    serviceInfoJson
  );
} catch (e) {
  console.log('Error:', e);
}
```

3. When the user clicks on the login button, the application should start the auth process and redirect to the URL that is received from the [auth request](https://api.pryv.com/reference/#auth-request) as shown in the example below:

```javascript
async function startAuthProcess () {
  await pryvService.startAuthRequest();
  const authUrl = pryvService.getAccessData().authUrl;
  // open webview with authUrl
}
```

[startAuthProcess in react-native example](https://github.com/pryv/lib-js-react-native/blob/dbb45f9192661b198e6b5b86a1c20e387a3a9c7e/PryvReactNative/views/auth/login-method-selection.js#L169).

4. In case of the error or when user don't finish login process, the application should stop the auth process:

```javascript
await pryvService.stopAuthProcess();
```

5. When `state.id` is equal to `Pryv.Browser.AuthStates.AUTHORIZED`, you can get the `apiEndpoint` containing the token from the `state` as shown below:

```javascript
if (authState.id == Pryv.Browser.AuthStates.AUTHORIZED) {
  const { endpoint, token } = pryvService.extractTokenAndApiEndpoint(authState.apiEndpoint);
  // username = authState.displayName
}
```

### Personal login

As shown in the [./PryvReactNative/views/auth/login.js](/PryvReactNative/views/auth/login.js), to perform a direct login call you can use `pryvService.login()` method for authentication.

```javascript
const connection = await pryvService.login(username, password, appId);
const token = connection.token;
```

### Enjoy!

## License

[Revised BSD license](https://github.com/pryv/documents/blob/master/license-bsd-revised.md)
