import React, { useState } from 'react';
import { Text, Button, View } from 'react-native';

export default ({ navigation }) => {
  const [authState, setAuthState] = useState('Before login');
  const username = 'jslibtest5';
  const password = username;
  const appId = 'js-lib-test';

  async function simulatePersonalLogin () {
    setAuthState('Executing login request');
    try {
      const connection = await pryvService.login(username, password, appId);
      const token = connection.token; // you should save the token for the later use
      setAuthState('Logged in');
    } catch (error) {
      console.log(error, 'error');
    }
    console.log('Login simulation ended');
  }
  /*
  async function simulateAppLoginOnly () {
    // start auth request
    await pryvService.startAuthRequest({
      state: authState
    });
    setAuthState('Executing login request');
    try {
      const connection = await pryvService.login(username, password, appId);
      // TODO 
      // Execute POST /accesses/check-app
      // Execute POST /accesses if user agrees with accesses
    } catch (error) {
      console.log(error, 'error');
      pryvService.stopAuthRequest();
    }
  }
  */

  return (
    <View>
      <Text>Login screen</Text>
      <Button
        onPress={ simulatePersonalLogin }
        title={`Simulate log in - State: ${authState}`}
        />
    </View>
  );
};
