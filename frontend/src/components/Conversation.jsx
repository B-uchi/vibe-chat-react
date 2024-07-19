import React from "react";

const Conversation = ({ data, onClick }) => {
  const { lastMessage, name, timestamp, profilePic } = data;
  return (
    <div
      onClick={() => onClick({ name, profilePic })}
      className="flex justify-between items-center cursor-pointer hover:bg-[#efefef] rounded-md"
    >
      <div className="flex items-center gap-2 p-2">
        <img className="rounded-full" src={profilePic} />
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-sm">{lastMessage}</p>
        </div>
      </div>
      <div className="flex flex-col items-end mr-2">
        <small>{timestamp}</small>
        <div className="bg-[#313131] text-white text-[10px] font-bold p-1 px-2.5 rounded-full">
          1
        </div>
      </div>
    </div>
  );
};

export default Conversation;
