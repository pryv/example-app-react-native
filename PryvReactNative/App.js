import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pryv } from 'pryv';
import Login from './views/auth/login';
import Logout from './views/auth/logout';
import Error from './views/error';
import Dashboard from './views/dashboard';

export default function App () {
  const [authState, setAuthState] = useState('');
  const [connection, setConnection] = useState(null);

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
  
  if (authState === '') {
    (async function () {
      //let serviceInfoUrl = 'https://api.pryv.com/lib-js/demos/service-info.json';
      let serviceInfoUrl = './lib-js/web-demos/service-info.json';
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
      console.log(pryvService, 'pryvService');
    })();
  }

  
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

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>
        Welcome to the Hello World Pryv app for the react-native
      </Text>
      <Text>You can replace screens with you authentication logic</Text>
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