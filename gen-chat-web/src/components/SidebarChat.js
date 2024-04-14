import React, { useState, useEffect } from 'react'
import Chat from './Chat'
import FriendRequest from './FriendRequest'
import getListFriend from '../services/getListFriend';
import findUserByPhoneNumber from '../services/findUserByPhoneNumber';

export default function SidebarChat({user}) {
  const [showListFriendRequest, setShowListFriendRequest] = useState("");
  const [searchPhoneNumber, setSearchPhoneNumber] = useState("");
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [searchedUser, setSearchedUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [open, setOpen] = useState(false);

  const getFriendList = async () => {
    const friendList = await getListFriend(user.phoneNumber);

    const friendFound = []

    for (let i = 0; i < friendList.length; i++) {
      const friend = await findUserByPhoneNumber(friendList[i]);
      friendFound.push(friend.data);
    }

    setFriends(friendFound);
  }

  useEffect(() => {
    getFriendList();
  }, []);

  const handleSearchPhoneNumber = e => {
    setSearchPhoneNumber(e.target.value);
  }

  const handleShowSearchResult = e => {
    setSearchPhoneNumber("");
    setShowSearchResult(!showSearchResult);
  }

  const searchUserByPhone = async () => {
    handleShowSearchResult();

    if (searchPhoneNumber) {
      try {
        const userFound = await findUserByPhoneNumber(searchPhoneNumber);
        setSearchedUser(userFound)
      } catch (error) {
        console.error("Error finding user: " + error);
        setSearchedUser(null);        
      }
    }
    
    console.log(searchedUser != null);
    setShowSearchResult(true);
  }

  return (
    <div className={`h-screen bg-white duration-300 ${!open ? 'w-96' : "w-0"}`}>

    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className={`absolute cursor-pointer -right-3 top-9 w-6 border-blue-400 border-2 rounded-full ${!open && "rotate-180"} bg-blue-400`} onClick={() => setOpen(!open)}>
      <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
    </svg>

    {/* Message title */}
    <div className='flex flex-row p-5 justify-between border-solid border-b border-gray-200 font-medium text-xl' >
      <h1 className={`text-xl ${!open ? 'w-auto' : "hidden"}`}>Message</h1>

      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    </div>

    {/* Search Phone Number */}
    <div className='flex items-center justify-center pt-5'>
      <input className='p-2 ml-4 mr-4 mb-0 w-5/6 rounded-full'placeholder='Search Message'
        type='tel'
        value={searchPhoneNumber}
        onChange={handleSearchPhoneNumber}
      />

      {
        !showSearchResult ?
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 mr-4"
          onClick={searchUserByPhone}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg> :

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="black"  className="w-10 h-10 mr-4"
          onClick={handleShowSearchResult}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      }
    </div>

    {
      showSearchResult ? <>
        <div className='flex items-center justify-center pt-5 cursor-pointer'
          onClick={() => setShowListFriendRequest(!showListFriendRequest)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="w-8 h-8 ml-4 rounded-lg bg-blue-400 p-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>

          <p className='p-2 ml-4 mr-4 mb-0 w-5/6 rounded-full'>Search Result</p>
        </div>

        <h1 className='pt-6 pl-5 pr-5 font-medium'>All Result</h1>

        <div className='h-4/5 overflow-y-scroll'>
          {
            searchedUser != null ?
              <Chat user={searchedUser.data} /> : 
              <p className='ml-4'>Phone number does not exists</p>
          }
        </div>
      </> :
      !showListFriendRequest ? (
        <>
          <div className='flex items-center justify-center pt-5 cursor-pointer'
            onClick={() => setShowListFriendRequest(!showListFriendRequest)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="w-8 h-8 ml-4 rounded-lg bg-blue-400 p-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>

            <p className='p-2 ml-4 mr-4 mb-0 w-5/6 rounded-full'>Friend Request</p>
          </div>

          <h1 className='pt-6 pl-5 pr-5 font-medium'>All Message</h1>

          <div className='h-4/5 overflow-y-scroll'>

            {
              friends.map((elem, i) => <Chat key={i} user={elem} />)
            }

          </div>
        </>
      ) : (
        <>
          <div className='flex items-center justify-center pt-5 cursor-pointer'
            onClick={() => setShowListFriendRequest(!showListFriendRequest)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="w-8 h-8 ml-4 rounded-lg bg-blue-400 p-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>

            <p className='p-2 ml-4 mr-4 mb-0 w-5/6 rounded-full'>All Message</p>
          </div>

          <h1 className='pt-6 pl-5 pr-5 font-medium'>Friend Requests</h1>

          <div className='h-4/5 overflow-y-scroll'>
            <FriendRequest />
          </div>
        </>
      )
    }
   </div>
  )
}