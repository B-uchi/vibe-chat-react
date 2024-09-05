import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineSecurity } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { CiCamera } from "react-icons/ci";
import { connect } from 'react-redux';

const Settings = ({ currentUser }) => {
  const [page, setPage] = useState('profile')
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [charactersLeft, setCharactersLeft] = useState(100)
  const [activeButton, setActiveBtn] = useState("profile")


  const handleBtnClick = (page) => {
    setPage(page)
    setActiveBtn(page)
  }

  return (
    <div className='bg-[#efefef] h-full flex justify-center items-center lg:p-0 p-2'>
      <div className="border-[1px] border-[#e1e1e1] lg:w-1/2 rounded-md p-3 bg-white h-[80%] flex">
        <div className="p-3 border-r-[1px] border-[#e1e1e1] lg:w-[30%] h-full flex flex-col items-start gap-2">
          <h1 className='text-2xl hidden lg:block font-bold font-poppins'>Settings</h1>
          <button onClick={() => handleBtnClick("profile")} className={`flex p-3 items-center gap-3 hover:bg-[#efefef] w-full rounded-md ${activeButton == "profile" ? " bg-[#efefef] " : ""}`}><IoPerson size={22} /> <span className='lg:block hidden'>Profile Settings</span></button>
          <button onClick={() => handleBtnClick("security")} className={`flex p-3 items-center gap-3 hover:bg-[#efefef] w-full rounded-md ${activeButton == "security" ? " bg-[#efefef] " : ""}`}><MdOutlineSecurity size={22} /> <span className='lg:block hidden'>Security</span> </button>
        </div>
        <div className="h-full flex-grow p-3 overflow-scroll">
          {page === 'profile' && (
            <div className="flex flex-col gap-3">
              <h1 className='text-2xl font-bold font-poppins'>Profile Settings</h1>
              <div className="">
                <div className="mx-auto rounded-full w-[120px] h-[120px] border-[1px] border-[#e1e1e1] bg-[#efefef] flex items-center justify-center cursor-pointer"><CiCamera size={30} /></div>
              </div>
              <div>
                <label>Username</label>
                <input type="text" placeholder={currentUser && currentUser.profileData.username} value={username} onChange={(e) => setUsername(e.target.value)} className='w-full p-2 border-[1px] border-[#e1e1e1] rounded-md' />
              </div>
              <div className="">
                <div>
                  <label>Bio</label>
                  <textarea placeholder={currentUser && currentUser.profileData.bio} rows={3} value={bio} onChange={(e) => {
                    if (e.target.value.length <=100) {
                      setBio(e.target.value)
                      setCharactersLeft(100-e.target.value.length)
                    }
                  }} className='w-full p-2 border-[1px] border-[#e1e1e1] resize-none rounded-md' />
                </div>
                <small>Characters Left: {charactersLeft}/100</small>
              </div>
              <button className='bg-[#333] text-white p-2 rounded-md'>Save</button>
            </div>
          )}
          {page === 'security' && (
            <div className="flex flex-col gap-3">
              <h1 className='text-2xl font-bold font-poppins'>Security Settings</h1>
              <div>
                <label>Current Password</label>
                <input type="password" className='w-full p-2 border-[1px] border-[#e1e1e1] rounded-md' />
              </div>
              <div>
                <label>New Password</label>
                <input type="password" className='w-full p-2 border-[1px] border-[#e1e1e1] rounded-md' />
              </div>
              <div>
                <label>Confirm New Password</label>
                <input type="password" className='w-full p-2 border-[1px] border-[#e1e1e1] rounded-md' />
              </div>

              <button className='bg-[#333] text-white p-2 rounded-md'>Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = ({ user }) => ({
  currentUser: user.currentUser
})

export default connect(mapStateToProps, null)(Settings)