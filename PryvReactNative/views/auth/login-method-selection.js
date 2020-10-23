import React, { useState } from 'react';
import styles from '../styles';
import { Text, Button, View, Alert } from 'react-native';

const Pryv = require('../../lib-js/src/index.js');
import * as SecureStore from 'expo-secure-store';

const LoginMethodSelection = ({ navigation, route }) => {
  const params = route.params;
  let action = (params?.action) ? params?.action : '';
  const [authState, setAuthState] = useState('');
  const [pryvService, setPryvService] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [loginButton, setLoginButton] = useState(null);

  class MyLoginButton extends Pryv.MobileApp.HumanInteractionInterface {

    /**
     * Optional
     * Whatever needs to be done before the start of auth process
     * async init () { }
     */

    /**
     * The same button can redirect, open auth popup or logout
     * this action should implement 
     * this.auth.handleClick();
     */
    onClick () {
      this.auth.handleClick();
    }

    /**
     * Called each time when the state changes. 
     * It will set state to local authState variable
     * Or show error alert when the state is equal to the error
     */
    onStateChange () {
      console.log('State just changed to:', this.auth.getState());
      if (this.auth.getState() !== authState) {
        setAuthState(this.auth.getState());
        if (authState.id == Pryv.MobileApp.AuthStates.ERROR) {
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
      }
    }

    startLoginScreen (loginUrl) {
      console.log('My custom popup that is huge:');
      return navigation.navigate('AppWebAuth3', {
        url: loginUrl
      });
    }

    saveAuthorizationData (authData) {
      SecureStore.setItemAsync('auth_state', JSON.stringify(authData));
      navigation.navigate('Dashboard', {
        username: authData.displayName,
        endpoint: authData.apiEndpoint
      });
      setEndpoint(authData.apiEndpoint);
      setUsername(authData.displayName);
    }

    stopAuthRequest () {
      this.auth.stopAuthRequest();
    }

    async getAuthorizationData () {
      const authData = await SecureStore.getItemAsync('auth_data');
      return JSON.parse(authData);
    }

    async deleteAuthorizationData () {
      if (await SecureStore.isAvailableAsync('auth_data')) {
        await SecureStore.deleteItemAsync('auth_data');
      }
    }
  }

  async function logout () {
    setLoggedIn(false);
    setAuthState('');
    console.log('uuu in logout');
    await loginButton.deleteAuthorizationData();
  }

  if (action == 'logout' && loggedIn === true) {
    console.log(action, 'aaaaaction', loggedIn, 'loggedIn');
    logout();
    action = null;
  } else if (authState === '') {
    // set initial auth state so that this method would not be called each time on rerendering
    setAuthState({
      id: 'STARTED_AUTH'
    });
    initializePryvService();
  } else if ((loggedIn === false && authState?.id === Pryv.MobileApp.AUTHORIZED)
    || authState === '') {
    // set initial auth state so that this method would not be called each time on rerendering
    setAuthState({
      id: 'STARTED_AUTH'
    });
    autoLogin();
  }

  /**
   * Checks if user is authenticated.
   * In other words, checks if there are user 
   * token and endpoint saved in secure storage
   */
  async function autoLogin () {
    const apiEndpoint = await SecureStore.getItemAsync('auth_data');
    if (apiEndpoint != null) {
      const userConnection = new Pryv.Connection(apiEndpoint);
      setLoggedIn(true);
      setEndpoint(userConnection.endpoint);
      setUsername(await userConnection.username());
    }
  }

  /**
   * For Not logged in users, Pryv.MobileApp.setupAuth method should be called.
   * The example settings for function initialization is showed in this function
   */
  async function initializePryvService () {
    const authSettings = {
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
      let loginBtn = new MyLoginButton();
      setLoginButton(loginBtn);
      let authService = await Pryv.MobileApp.setupAuth(
        authSettings,
        serviceInfoUrl,
        serviceInfoJson,
        loginBtn
      );
      setPryvService(authService);
    } catch (e) {
      console.log('Error:', e);
    }
  };

  const startLogin = () => {
    if (loginButton != null) {
      loginButton.onClick();
    }
  }

  /**
   * Simulate personal login with test user example
   */
  async function simulatePersonalLogin () {
    const username = 'jslibtest5';
    const password = username;
    const appId = 'js-lib-test';
    const originHeader = `https://{username}.pryv.me`;
    try {
      const userConnection = await pryvService.login(username, password, appId, originHeader);
      if (userConnection != null) {
        console.log('Started user connection');
        setLoggedIn(true);
        navigation.navigate('Dashboard', {
          username: await userConnection.username(),
          endpoint: userConnection.endpoint
        })
      }
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
                  onPress={ startLogin }
                  title={'Login with app-web-auth3'}
                />

              </View>
              <View style={styles.separator} />
              <View>
                <Text style={styles.title}>
                  Login using your own UI screens. All app-web-auth3 logic has to be reimplemented.
            </Text>
                <Button
                  onPress={simulatePersonalLogin}
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
          })}
          title={'You are logged in. Go to dashboard'}
        />
      }
    </View>
  );
};


export default LoginMethodSelection;