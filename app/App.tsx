import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import CreateLoteScreen from './screens/CreateLoteScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Agro Mark - Gerência de lotes' }} />
          <Stack.Screen name="Criar Lote" component={CreateLoteScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
