import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginMethodSelection from './views/auth/login-method-selection';
import AppWebAuth3WebView from './views/auth/login-webview';
import CustomLogin from './views/auth/login';
import Dashboard from './views/dashboard';
const Stack = createStackNavigator();

export default function App () {

  return (
    <>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="NotLoggedIn"
          component={ LoginMethodSelection }
          options={{ title: 'Pryv' }}
        />
        <Stack.Screen
          name="AppWebAuth3"
          component={AppWebAuth3WebView}
            options={{
              title: 'Log in',
            }}
          />
          <Stack.Screen
            name="Dashboard"
            component={Dashboard}
            options={{
              title: 'Dashboard',
              headerLeft: null
            }}
          />
        <Stack.Screen
          name="CustomLogin"
          component={CustomLogin}
          options={{ title: 'Custom Log in' }}
        />
      </Stack.Navigator>
      </NavigationContainer>
    </>
  ); 
}