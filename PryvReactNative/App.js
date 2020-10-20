import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pryv from 'pryv';

import Login from './views/auth/login';
import Logout from './views/auth/logout';
import Error from './views/error';
import Dashboard from './views/dashboard';

export default function App () {
  const [authState, setAuthState] = useState('');
  const [connection, setConnection] = useState(null);
  const [pryvService, setPryvService] = useState(null);

  // called each time the authentication state changed
  function pryvAuthStateChange (state) {
    console.log('##pryvAuthStateChange', state);
    if (state !== authState) {
      setAuthState(state);
    }
  }

  if (authState === '') {
    (async function () {
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
            }};
      try {
        setPryvService(await Pryv.Browser.setupAuth(authSettings, serviceInfoUrl, serviceInfoJson, false));
      } catch (e) {
        console.log('Error:', e);
      }
    })();
  }

  // Screens for the app login
  let screen;
  if (authState.id === Pryv.Browser.AuthStates.LOADING) {
    screen = <Text>Loading screen</Text>;
  } else if (authState.id === Pryv.Browser.AuthStates.INITIALIZED) {
    screen = <Login pryvService={pryvService} />;
  } else if (authState.id === Pryv.Browser.AuthStates.AUTHORIZED) {
    screen = <Dashboard />;
  } else if (authState.id === Pryv.Browser.AuthStates.LOGOUT) {
    screen = <Logout />;
  } else if (authState.id === Pryv.Browser.AuthStates.ERROR) {
    screen = <Error message={authState.message}/>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>
        Welcome to the Hello World Pryv app for the react-native
      </Text>
      <Text>You can replace screens with you authentication logic</Text>
      <Text>Screen:</Text>
      {screen}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',  
  },
  headline: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});