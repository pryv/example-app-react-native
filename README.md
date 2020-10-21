# lib-js-react-native
React native compatible extension for the Pryv.io JavaScript library

## Getting started

If you have no local react-native environment setup the quickest way 
to get up and running is to use one of the prepared docker containers.
For example to run this application with [react-native-docker docker image](https://github.com/theanam/react-native-docker) 
is as easy as 

1. starting the docker image
```
docker run --rm -it -v `pwd`:/app --network host theanam/react-native bash
```

2. Downloading [expo app](https://expo.io/tools#client) for easier testing (you can choose your different setup)

3. Building the project (in /app/PryvReactNative directory inside the container)
```
expo start (in /app/PryvReactNative directory)
```
4. In the expo app, you can scan the qr code to run the app (the mobile has to be on the
same network as the computer)


## Description

The application is based on [create-react-native-app](https://github.com/expo/create-react-native-app). 
You can check the `./LibJsReactNative/views/auth/login-method-selection.js` for the Pryv authentication related code. All you need
to do (the same as in lib-js library description) are these 3 things:
1. Import pryv lib-js library
      ```
      import { Pryv } from 'pryv';
      ```
2. Execute Pryv.Browser.setupAuth with correct settings and `state` change listener
      ```
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
      const customView = false;
      try {
        let pryvServiceObj = await Pryv.Browser.setupAuth(
          authSettings,
          serviceInfoUrl,
          serviceInfoJson,
          customView
        );
      } catch (e) {
        console.log('Error:', e);
      }
      ```
3. Update the screen depending on the state
      ```
      if (authState.id == Pryv.Browser.AuthStates.AUTHORIZED) { 
        // redirect to the dashboard 
      }
      ```

### Enjoy!

## License

[Revised BSD license](https://github.com/pryv/documents/blob/master/license-bsd-revised.md)
