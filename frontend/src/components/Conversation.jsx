import React from "react";

const Conversation = ({ data, onClick }) => {
  const { lastMessage, username, timestamp, profilePhoto, onlineStatus, chatId, participantId } = data;
  return (
    <div
      onClick={() => onClick({ username, profilePhoto, onlineStatus, chatId, participantId })}
      className="flex justify-between items-center cursor-pointer hover:bg-[#efefef] rounded-md"
    >
      <div className="flex items-center gap-2 p-2 w-[85%]">
        <img className="rounded-full w-[40px] h-[40px]" src={profilePhoto} />
        <div>
          <h3 className="font-bold">{username}</h3>
          {lastMessage ? <p className="text-sm line-clamp-1 w-[90%]">{lastMessage}</p> : <p className="text-sm italics">You havent sent a message yet</p>}
        </div>
      </div>
      <div className="flex flex-col items-end mr-2 w-[15%]">
        <small>{timestamp}</small>
        <div className="bg-[#313131] text-white text-[10px] font-bold p-1 px-2.5 rounded-full">
          1
        </div>
      </div>
    </div>
  );
};

export default Conversation;
