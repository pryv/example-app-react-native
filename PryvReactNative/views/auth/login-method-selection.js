import React, { useState } from 'react';
import styles from '../styles';
import { Text, Button, View, Alert } from 'react-native';
const Pryv = require('pryv');
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

  const startLoginScreen = (loginUrl) => {
    console.log('startLoginScreen');
    return navigation.navigate('AppWebAuth3', {
      url: loginUrl
    });
  }

  /**
   * Example login button class
   */
  class MyLoginButton {

    constructor(authSettings, service) {
      this.authSettings = authSettings;
      this.service = service;
      this.serviceInfo = service.infoSync();
    }
    /**
     * Optional
     * Whatever needs to be done before the start of auth process
     *
     */
    async init () {
      // set cookie key for authorization data
      this._cookieKey = 'pryv-libjs-' + this.authSettings.authRequest.requestingAppId;

      // initialize controller
      this.auth = new  Pryv.Auth.AuthController(this.authSettings, this.service, this);
      await this.auth.init();
      return this.service;
    }

    /**
     * The same button can redirect, open auth popup or logout
     * this action should implement
     * this.auth.handleClick();
     */
    onClick () {
      this.auth.handleClick();
    }

    logout () {
      this.auth.state = { status: Pryv.Browser.AuthStates.SIGNOUT };
    }

    /**
     * Called each time when the state changes.
     * It will set state to local authState variable
     * Or show error alert when the state is equal to the error
     */
    async onStateChange (state) {
      if (state.status !== authState.status) {
        console.log('State just changed to:', state.status);
        setAuthState(state);

        switch (state.status) {
          case Pryv.Browser.AuthStates.LOADING:
            console.log(this.auth.messages.LOADING);
            break;
          case Pryv.Browser.AuthStates.INITIALIZED:
            console.log(this.auth.messages.LOGIN + ': ' + this.serviceInfo.name);
            break;
          case Pryv.Browser.AuthStates.NEED_SIGNIN:
            startLoginScreen(state.authUrl);
            break;
          case Pryv.Browser.AuthStates.AUTHORIZED:
            console.log(state.username);
            this.saveAuthorizationData({
              apiEndpoint: state.apiEndpoint,
              username: state.username
            });
            break;
          case Pryv.Browser.AuthStates.SIGNOUT:
            this.deleteAuthorizationData();
            this.auth.init();
            break;
          case Pryv.Browser.AuthStates.ERROR:
            console.log('Error', authState.error);
            navigation.navigate('NotLoggedIn');
            Alert.alert(
              "Error",
              this.auth.messages.ERROR + ': ' + state.message,
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
              ],
              { cancelable: true }
            );
            break;
          default:
            console.log('WARNING Unhandled state for Login: ' + state.status);
        }
      }
    }

    async getAuthorizationData () {
      console.log('getAuthorizationData');
      const authData = await SecureStore.getItemAsync(this._cookieKey);
      return JSON.parse(authData);
    }

    saveAuthorizationData (authData) {
      SecureStore.setItemAsync(this._cookieKey, JSON.stringify(authData));
      navigation.navigate('Dashboard', {
        username: authData.displayName,
        endpoint: authData.apiEndpoint
      });
      setEndpoint(authData.apiEndpoint);
      setUsername(authData.displayName);
    }

    /**
     * Should be called when user somehow navigates back from login screen
     */
    stopAuthRequest () {
      this.auth.stopAuthRequest();
    }

    /**
     * Delete saved auth data
     */
    async deleteAuthorizationData () {
      console.log('deleteAuthorizationData')
      if (await SecureStore.isAvailableAsync(this._cookieKey)) {
        await SecureStore.deleteItemAsync(this._cookieKey);
      }
    }
  }

  /**
   * Initialize Auth process or if action came to logout, delete auth data
   */
  if (action == 'logout' && loggedIn === true) {
    action = null;
    setLoggedIn(false);
    loginButton.logout();
  } else if (authState === '') {
    // set initial auth state so that this method would not be called each time on rerendering
    setAuthState({ id: Pryv.Auth.AuthStates.LOADING });
    initializePryvService();
  }

  /**
   * For Not logged in users, Pryv.Browser.setupAuth method should be called.
   * The example settings for function initialization is showed in this function
   */
  async function initializePryvService () {
    console.log('initializePryvService');
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
      let authService = new Pryv.Service(serviceInfoUrl, serviceInfoJson);
      await authService.info()

      const loginBtn = new MyLoginButton(authSettings, authService);
      await loginBtn.init();

      setLoginButton(loginBtn);
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
          { pryvService == null &&
            <Text style={styles.title}>Loading service information</Text>
          }
          { pryvService != null &&
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
      { loggedIn === true &&
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