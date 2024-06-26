import {InputField} from '@gluestack-ui/themed';
import {InputIcon, InputSlot} from '@gluestack-ui/themed';
import {
  Text,
  Avatar,
  AvatarImage,
  Input,
  AvatarFallbackText,
  AvatarBadge,
} from '@gluestack-ui/themed';
import {ArrowLeft, Info, PanelsRightBottom, Phone, SearchIcon, Send} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {ScrollView} from 'react-native';
import {View} from 'react-native';
import ChatUser from './ChatUser';
import ChatData from './ChatData';
import {socket} from '../utils/socket';

export default function GroupChat({route, navigation}) {  
  // This variable use for socket
  const [messages, setMessages] = useState([]);

  // This variable use for input
  const [message, setMessage] = useState('');

  const userRoot = route.params.userRoot;
  const room = route.params.room;

  const idRoom = room.id;

  useEffect(() => {
    if (idRoom) {
      socket.emit('join', idRoom);
      socket.emit("init-chat-message", idRoom);
    }
  }, [idRoom]);

  const sendMessage = msg => {
    let content = message;
    let userID = userRoot.phoneNumber;
    let receiverID = room.phoneNumber;
    let type = 'text';

    // console.log("Send Messaage");
    // console.log(userID + ': ' + receiverID + ': ' + content);
    
    socket.emit('chat-message', {
      type: "text", 
      idRoom, 
      sender: userID,
      sender_name: userRoot.name,
      receiver: receiverID,
      content: content,
      chat_type: type,
      status: "ready"
    });
  };

  useEffect(() => {
    socket.on('chat-message-2', msg => {
      setMessages(msg);
    });

    socket.on("rooms", msg => {
      setMessages(msg);
    })

    return () => {
      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
  }, []);

  return (
    <View
      style={{
        height: '100%',
      }}>
      <View
        style={{
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <ArrowLeft
          size={30}
          strokeWidth={2}
          color="blue"
          onPress={() => {
            navigation.goBack();
          }}
          style={{padding: 10}}
        />

        <Avatar size="md">
          <AvatarFallbackText>{room.name}</AvatarFallbackText>
        </Avatar>

        <Text flex={1} size="xl" bold={true}>
          {room.name}
        </Text>

        {/* <Phone
          size={30}
          strokeWidth={2}
          color="blue"
          onPress={() => {
            navigation.goBack();
          }}
          style={{padding: 10}}
        /> */}

        <Info
          size={30}
          strokeWidth={2}
          color="blue"
          onPress={() => {
            navigation.navigate("Group info", {userRoot, room});
          }}
          style={{padding: 10}}
        />
      </View>

      <ScrollView
        style={{
          flex: 1,
          flexDirection: 'column',
        }}>
          {
            messages.map((msg, index) => {
              if (msg.sender == userRoot.phoneNumber)
                return <ChatUser key={index} data={msg}/>;
              else
                return <ChatData key={index} data={msg}/>;
            })
          }
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          gap: 10,
        }}>
        <Input size="xl" flex={1}>
          <InputSlot pl="$3"></InputSlot>
          <InputField 
          value={message} 
          onChangeText={setMessage} 
          placeholder="Nhap tin nhan..." />
        </Input>

        <Send
          size={30}
          strokeWidth={2}
          color="blue"
          onPress={() => {sendMessage(message); setMessage('');}}
          style={{padding: 10}}
        />
      </View>
    </View>
  );
}
