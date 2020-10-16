# lib-js-react-native
React native compatible extension for the Pryv.io JavaScript library

## Getting started
If you have no local react-native environment setup the quickest way 
to get up and running is to use one of the prepared docker containers.
For example to run this application with [react-native-docker docker image](https://github.com/theanam/react-native-docker) 
is as easy as starting the docker image
```
docker run --rm -it -v `pwd`:/app --network host theanam/react-native bash
```
And building the project
```
yarn web (in /app/PryvReactNative directory)
```

## Description

The application is based on [create-react-native-app](https://github.com/expo/create-react-native-app). 
You can check the `./LibJsReactNative/App.js` for the Pryv authentication related code. All you need
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
        
        if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
          setConnection(Pryv.Connection(state.apiEndpoint));
          console.log('# Browser succeeded for user ' + connection.apiEndpoint);
        }
        if (state.id === Pryv.Browser.AuthStates.LOGOUT) {
          setConnection(null);
          console.log('# Logout');
        }
      }
      let serviceInfoUrl = 'https://api.pryv.com/lib-js/demos/service-info.json';
      const authSettings = {
        spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
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
      let pryvService = await Pryv.Browser.setupAuth(
        authSettings,
        serviceInfoUrl,
        null,
        false
      );
      ```
3. Update the screen depending on the state
      ```
      let screen;
      if (authState.id === Pryv.Browser.AuthStates.LOADING) {
        screen = <Text>Loading screen</Text>;
      } else if (authState.id === Pryv.Browser.AuthStates.INITIALIZED) {
        screen = <Login />;
      } else if (authState.id === Pryv.Browser.AuthStates.AUTHORIZED) {
        screen = <Dashboard />;
      } else if (authState.id === Pryv.Browser.AuthStates.LOGOUT) {
        screen = <Logout />;
      } else if (authState.id === Pryv.Browser.AuthStates.ERROR) {
        screen = <Error message={authState.message}/>;
      }
      ```

### Enjoy!

##License

[Revised BSD license](https://github.com/pryv/documents/blob/master/license-bsd-revised.md)