import React from "react";

const Conversation = ({ data, onClick }) => {
  const {
    lastMessage,
    username,
    timestamp,
    profilePhoto,
    onlineStatus,
    chatId,
    participantId,
    isFriend,
    initiatedBy,
    lastSender,
  } = data;

  function convertTimestampToTime(timestamp) {
    let seconds, nanoseconds;
    if (timestamp.seconds && timestamp.nanoseconds) {
      seconds = timestamp.seconds;
      nanoseconds = timestamp.nanoseconds;
    }
    seconds = timestamp.seconds || timestamp._seconds;
    nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds;

    const date = new Date(seconds * 1000 + nanoseconds / 1000000);
    const now = new Date();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date < yesterday) {
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    } else {
      return date.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "numeric",
      });
    }
  }

  return (
    <div
      onClick={() =>
        onClick({
          username,
          profilePhoto,
          onlineStatus,
          chatId,
          participantId,
          isFriend,
          initiatedBy,
        })
      }
      className="flex items-center cursor-pointer hover:bg-[#efefef] rounded-lg p-2 transition-all duration-200 relative"
    >
      <div className="flex items-center gap-3 w-[85%]">
        <div className="relative">
          <img
            className="rounded-full w-[45px] h-[45px] object-cover border-2 border-gray-200"
            src={profilePhoto}
            alt={username}
          />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              onlineStatus ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
        </div>
        <div className="w-full overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">{username}</h3>
            {!isFriend && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                Request
              </span>
            )}
          </div>
          {lastMessage ? (
            <p className="text-sm text-gray-600 line-clamp-1 max-w-[90%] break-words">
              {lastSender != participantId ? "You::: " : ""} {lastMessage}
            </p>
          ) : (
            <p className="text-sm text-gray-500 italic">Start a conversation</p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 w-[15%] min-w-fit">
        {timestamp && (
          <small className="text-xs text-gray-500">
            {convertTimestampToTime(timestamp)}
          </small>
        )}
        <div className="bg-[#313131] text-white text-[10px] font-bold p-1 px-2.5 rounded-full">
          1
        </div>
      </div>
    </div>
  );
};

export default Conversation;
