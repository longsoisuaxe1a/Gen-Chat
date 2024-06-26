import { createProvider } from "@gluestack-ui/provider"
import { StyledProvider } from "@gluestack-style/react"
import { config } from "@gluestack-ui/config"
import { createNativeStackNavigator } from '@react-navigation/native-stack';
  
import React from 'react'
import Main from "../pages/Main";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";
import ForgotPassword from "../components/ForgotPassword";
import Chat from "../components/Chat";
import GroupChat from "../components/GroupChat";
import Search from "../components/Search";
import FriendProfile from "../components/FriendProfile";
import ForwardMessage from "../components/ForwardMessage";
import GroupInfo from "../components/GroupInfo";
import AddNewUserForm from "../components/AddNewUserForm";
  
export const Provider = createProvider({
  StyledProvider,
})

const Screen = createNativeStackNavigator();
  
export default function Home({navigation}) {
  return (
    <Provider config={config}>
      <Screen.Navigator
        screenOptions={
          ({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let elem;

              if (route.name === 'Chat') {
                iconName = focused
                ? elem = <MessageCircleMore strokeWidth={1.75} color="blue" />
                : elem = <MessageCircleMore strokeWidth={1} color="blue" />
              } else if (route.name === 'Call') {
                iconName = focused 
                ? elem = <Phone strokeWidth={1.75} color="blue" />
                : elem = <Phone strokeWidth={1} color="blue" />
              } else if (route.name === 'GenChatLogo') {
                iconName = focused 
                ? elem = <Image source={require('../assets/logo.png')} style={{borderRadius: 80}}></Image>
                : elem = <Image source={require('../assets/logo.png')} style={{borderRadius: 80}}></Image>
              } else if (route.name === 'Contact') {
                iconName = focused 
                ? elem = <SquareUserRound strokeWidth={1.75} color="blue" />
                : elem = <SquareUserRound strokeWidth={1} color="blue" />
              } else if (route.name === 'Profile') {
                iconName = focused 
                  ? elem = <CircleUserRound strokeWidth={1.75} color="blue" />
                  : elem = <CircleUserRound strokeWidth={1} color="blue" />
              }

              return elem;
              
            },
            tabBarActiveTintColor: 'blue',
            tabBarInactiveTintColor: 'gray',
            headerShown: false
          })
        }
      >
        <Screen.Screen name="Sign In">
          {(props) => <SignIn {...props} />}
        </Screen.Screen>
        
        <Screen.Screen name="Main">
          {(props) => <Main {...props} />}
        </Screen.Screen> 

        <Screen.Screen name="Sign Up">
          {(props) => <SignUp {...props} />}
        </Screen.Screen>

        <Screen.Screen name="Forgot Password">
          {(props) => <ForgotPassword {...props} />}
        </Screen.Screen>

        <Screen.Screen name="Chat">
          {(props) => <Chat {...props} />}
        </Screen.Screen>

        <Screen.Screen name="GroupChat">
          {(props) => <GroupChat {...props} />}
        </Screen.Screen>

        <Screen.Screen name="Search">
          {(props) => <Search {...props} />}
        </Screen.Screen>

        <Screen.Screen name="FriendProfile">
          {(props) => <FriendProfile {...props} />}
        </Screen.Screen>

        <Screen.Screen name="Forward Message">
          {(props) => <ForwardMessage {...props} />}
        </Screen.Screen>

        <Screen.Screen name="Group info">
          {(props) => <GroupInfo {...props} />}
        </Screen.Screen>

        <Screen.Screen name="Add new user form">
          {(props) => <AddNewUserForm {...props} />}
        </Screen.Screen>
        
      </Screen.Navigator>
    </Provider>
  )
}
  