import React, { useEffect, useState } from 'react';
const styles = require('../styles');
import { Text, Button, View, Alert } from 'react-native';

const Pryv = require('pryv');
import * as SecureStore from 'expo-secure-store';

export default ({ navigation, route }) => {
  const params = route.params;
  let action = (params?.action) ? params?.action: '';
  const [authState, setAuthState] = useState('');
  const [pryvService, setPryvService] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [connection, setConnection] = useState(null);

  if (action == 'logout' && loggedIn === true) {
    setLoggedIn(false);
    setAuthState('');
    checkAuth();
    action = null;
  } else if ((loggedIn === false && authState?.id === Pryv.Browser.AUTHORIZED) || authState === '') {
    // set initial auth state so that this method would not be called each time on rerendering
    setAuthState({
      id: 'STARTED_AUTH'
    });
    checkAuth();
  }

  /**
   * Checks when Pryv library state is changed and set it 
   * to local authState variable
   * @param {*} state 
   */
  function pryvAuthStateChange (state) {
    console.log('##pryvAuthStateChange', state);
    if (state !== authState) {
      setAuthState(state);
    }
  }

  /**
   * Each time when authState changes, refresh
   * the screens accordingly. 
   * a) if user is logged in, shows dashboard
   * b) if user is logged out, shows this page with login buttons
   * c) on Error, shows an alert
   */ 
  useEffect(() => {   
    if (authState.id == Pryv.Browser.AuthStates.AUTHORIZED) {
      const { endpoint, _ } = pryvService.extractTokenAndApiEndpoint(authState.apiEndpoint);
      SecureStore.setItemAsync('api_endpoint', authState.apiEndpoint);
      navigation.navigate('Dashboard', {
        username: authState.displayName,
        endpoint: endpoint
      });
      setEndpoint(endpoint);
      setUsername(username);
    } else if (authState.id == Pryv.Browser.AuthStates.ERROR) {
      console.log('Error', authState.error);
      navigation.navigate('NotLoggedIn');
      Alert.alert(
        "Error",
        pryvService.getErrorMessage(),
        [
          {
            text: "Cancel",
            style: "cancel"
          },
        ],
        { cancelable: true }
      );
    }
  }, [authState]);
    
  /**
   * Creates user connection and sets username and enpoint
   * @param {*} userConnection 
   */
  async function setUserInfo (userConnection) {
    if (userConnection != null) {
      console.log('Started user connection');
      setLoggedIn(true);
      setConnection(userConnection);
      const connectionUsername = await userConnection.username();
      setUsername(connectionUsername);
      setEndpoint(userConnection.endpoint);
      navigation.navigate('Dashboard', {
        username: connectionUsername,
        endpoint: userConnection.endpoint
      })
    }
  }

  /**
   * Checks if user is authenticated.
   * In other words, checks if there are user 
   * token and endpoint saved in secure storage
   */
  async function checkAuth () {
    const apiEndpoint = await SecureStore.getItemAsync('api_endpoint');
    if (apiEndpoint != null) {
      const userConnection = new Pryv.Connection(apiEndpoint);
      await setUserInfo(userConnection);
    } else {
      // Otherwise - crete service for not logged in user
      initializePryvService();
    }
  }

  /**
   * For Not logged in users, Pryv.Browser.setupAuth method should be called.
   * The example settings for function initialization is showed in this function
   */
  async function initializePryvService () {
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
      let pryvServiceObj = await Pryv.Browser.setupAuth(
        authSettings,
        serviceInfoUrl,
        serviceInfoJson
      );
      setPryvService(pryvServiceObj);
    } catch (e) {
      console.log('Error:', e);
    }
  };

  /**
   * Before user starts to log in, we start Auth request
   */
  async function startAuthProcess () {
    await pryvService.startAuthRequest();
    const loginUrl = pryvService.getAccessData().authUrl;
    if (loginUrl == null) {
      checkAuth();
    }
    return navigation.navigate('AppWebAuth3', {
      url: loginUrl
    });
  }

  /**
   * Simulate personal login with test user example
   */
  async function simulatePersonalLogin () {
    const username = 'jslibtest5';
    const password = username;
    const appId = 'js-lib-test';
    try {
      const userConnection = await pryvService.login(username, password, appId);
      await setUserInfo(userConnection);
    } catch (error) {
      console.log(error, 'error');
    }
    console.log('Login simulation ended');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>
        Welcome to the Hello World Pryv app for the react-native
      </Text>
      {loggedIn === false &&
        <>
        {pryvService == null &&
          <Text style={styles.title}>Loading service information</Text>
        }
        {pryvService != null &&
          <>
          <View>
            <Text style={styles.title}> Log in using app-web-auth3 UI </Text>
              <Button
                color="#C63130"
                onPress={(async () => await startAuthProcess())}
                title={'Login with app-web-auth3'}
              />
            
          </View>
          <View style={styles.separator} />
          <View>
            <Text style={styles.title}>
              Login using your own UI screens. All app-web-auth3 logic has to be reimplemented.
            </Text>
            <Button
              onPress={ simulatePersonalLogin }
              title={'Simulate personal log in'}
            />
          </View>
        </>
        }
      </>
    }
    {loggedIn === true &&
        <Button
        onPress={() => navigation.navigate('Dashboard', {
            username: username,
            endpoint: endpoint
          }) }
        title={'You are logged in. Go to dashboard'}
        />
    }
    </View>
  );
};