import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'

import getListFriend from '../services/users/getListFriend';
import findUserByPhoneNumber from '../services/users/findUserByPhoneNumber';
import Chat from './Chat';

export default function ChatUser({message, socketRef}) {
  const [searchedUser, setSearchedUser] = useState(null);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [friends, setFriends] = useState([]);
  const [searchPhoneNumber, setSearchPhoneNumber] = useState("");

  console.log("Message " + message.content);

  const handleDeleteMessage = () => {
    console.log("Called handle delete message");
    socketRef.current.emit("deleteMessage", message.id)
  }

  const handleSearchPhoneNumber = e => {
    setSearchPhoneNumber(e.target.value);
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

  const handleShowSearchResult = e => {
    setSearchPhoneNumber("");
    setShowSearchResult(!showSearchResult);
  }

  const handleReplyMessage = () => {
    document.getElementById('forward_modal').showModal()
  }

  const handleForwardMessage = () => {
    let checkedUsers = getCheckedBoxes("userInGroup");
    console.log("Forwarded message");
    console.log("Friend to forward");
    console.log(checkedUsers);

    console.log("Message to forward " + message.content);

    for (let i = 0; i < checkedUsers.length; i++) {
      message.receiver = checkedUsers[i]
      socketRef.current.emit(message.sender, message);
    }
  }

  const getFriendList = async () => {
    const friendList = await getListFriend(message.sender);

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

  function getCheckedBoxes(chkboxName) {
    var checkboxes = document.getElementsByName(chkboxName);
    var checkboxesChecked = [];
    // loop over them all
    for (var i=0; i<checkboxes.length; i++) {
      // And stick the checked ones onto an array...
      if (checkboxes[i].checked) {
        checkboxesChecked.push(checkboxes[i].value);
      }
    }
    // Return the array if it is non-empty, or null
    return checkboxesChecked.length > 0 ? checkboxesChecked : null;
  }

  return (
    <div className="flex items-start gap-2.5" dir='rtl'>
      
      
      {/* Group Modal */}
      <dialog id="forward_modal" className="modal" add="true" dir='ltr'>
        <div className="modal-box">

          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button id='btnCloseModal' className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>

          <h1 className='pb-5 font-bold'>Forward message</h1>

          {/* Search user by name */}
          <div className='flex items-center justify-center pt-5 pb-5 border-b-2 border-gray-200'>
            <input className='p-2 ml-4 mr-4 mb-0 w-5/6 rounded-full'placeholder='Search Message'
              type='tel'
              value={searchPhoneNumber}
              onChange={handleSearchPhoneNumber}
            />

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 mr-4"
              onClick={searchUserByPhone}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg> 
          </div>

          {/* All friend title */}
          <p className='font-bold pb-5'>Friend list</p>

          {/* All friend title */}
          <div className='border-b-2 border-gray-200'>
            {
              friends.map((elem, i) => 
                <div key={i} className='flex items-center'>
                  <input type='checkbox' name='userInGroup' value={elem.phoneNumber}></input>
                  <Chat user={elem} setCurrentFriend={null} />
                </div>
              )
            }
          </div>

          {/* Forward Message */}
          <div className='flex justify-end'>
            <button className="btn-primary bg-blue-400 p-2 m-5 rounded-md btn text-white"
              onClick={handleForwardMessage}
            >
              Forward Message
            </button>
          </div>
        </div>
      </dialog>
      
      
      <img className="w-8 h-8 rounded-full" src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="Jese image" />
      <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{message.name}</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              {message.date} {message.id}
            </span>
          </div>

          <div className='flex'>
            <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-white rounded-e-xl rounded-es-xl dark:bg-gray-700">              
              {
                message.type == "text" ? 
                  <div className="text-sm font-normal text-gray-900 dark:text-white">
                    {message.content}
                  </div> : 
                    message.type == "image/png" || 
                    message.type == "image/jpeg" || 
                    message.type == "image/jpg" ? 
                      <img src={message.content} width={200}></img> :
                      // message.type == "video" ?
                      // <video width="400" controls>
                      //   <source src="C:\Users\Student\Downloads\mov_bbb.mp4" type="video/mp4" />
                      //   Your browser does not support HTML video.
                      // </video>
                      // : 
                      <a download={message.filename} href={message.link} className='underline text-blue-400'>{message.filename}</a>
              }
            </div>

            <details className="dropdown bg-transparent border-0">
              <summary className="m-1 btn bg-transparent border-0">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                  <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
                </svg>
              </summary>
              <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-auto">
                <li><a>Reply</a></li>
                <li><a onClick={handleReplyMessage}>Forward</a></li>
                <li><a onClick={handleDeleteMessage}>Delete</a></li>
              </ul>
            </details>
          </div>
          
          {/* <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span> */}
      </div>
    </div>
  )
}
