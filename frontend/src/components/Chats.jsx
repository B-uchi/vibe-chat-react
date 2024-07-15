import { IoSearch } from "react-icons/io5";

const Chats = () => {
  return (
    <section className="p-3 font-poppins">
      <div className="w-full p-1 bg-[#efefef] rounded-md flex items-center">
        <IoSearch size={25} className="mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent flex-grow p-1 outline-none"
        />
      </div>
      <div className="flex w-full justify-between mt-3 border-b-[1px]">
        <button className="text-center w-1/2 p-2 border-r-[1px] bg-[#efefef] rounded-tl-md">Friends</button>
        <button className="text-center w-1/2 p-2 font-bold">Requests (2)</button>
      </div>
      {/* <div className="flex items-center justify-between mt-3">
        <h2 className="font-bold text-2xl">Chats</h2>
      </div> */}
      <div className="mt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 p-2">
            <img
              className="rounded-full"
              src="https://randomuser.me/api/portraits/thumb/men/75.jpg"
            />
            <div>
              <h3 className="font-bold">John Doe</h3>
              <p className="text-sm">Hey, how are you?</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <small>1:55 pm</small>
            <div className="bg-[#313131] text-white text-[10px] font-bold p-1 px-2.5 rounded-full">1</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 p-2">
            <img
              className="rounded-full"
              src="https://randomuser.me/api/portraits/thumb/men/70.jpg"
            />
            <div>
              <h3 className="font-bold">Kevin</h3>
              <p className="text-sm">Last noght was a blast!!</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <small className="">8:55 am</small>
            {/* <div className="bg-[#313131] text-white text-[10px] font-bold p-1 px-2.5 rounded-full">1</div> */}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 p-2">
            <img
              className="rounded-full"
              src="https://randomuser.me/api/portraits/thumb/men/77.jpg"
            />
            <div>
              <h3 className="font-bold">Thomas Kent</h3>
              <p className="text-sm">Did you get the message?</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <small className="">7:15 am</small>
            {/* <div className="bg-[#313131] text-white text-[10px] font-bold p-1 px-2.5 rounded-full">1</div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Chats;
