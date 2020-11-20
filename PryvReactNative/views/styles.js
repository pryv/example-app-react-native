import React from 'react';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
   container: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5FCFF',
   },
   headline: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
   },
   container: {
      flex: 1,
      justifyContent: 'center',
      marginHorizontal: 16,
   },
   title: {
      textAlign: 'center',
      marginVertical: 8,
   },
   separator: {
      marginVertical: 8,
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth,
   },
});

export default styles;