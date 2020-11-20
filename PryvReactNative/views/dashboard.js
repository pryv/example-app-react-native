import React from 'react';
import styles from './styles';
import { Text, View, Button } from 'react-native';

export default ({ route, navigation }) => {
  const { username, endpoint } = route.params;

  /**
   * When user click login button, delete api_endpoint with token
   * And go back to not logged in screen
   */
  async function logout () {
    return navigation.navigate('NotLoggedIn',
      { action: 'logout' }
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.headline} >
        Dashboard screen for the logged in user {username} and endpoint {endpoint}</Text>
      <Button
        color="#C63130"
        onPress={(async () => await logout())}
        title={'Logout'}
      /> 
    </View>
  );
};