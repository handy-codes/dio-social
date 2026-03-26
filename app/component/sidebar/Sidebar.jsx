import { RssFeed, Chat, PlayCircleFilledOutlined, Group, Bookmarks, WorkOutline, HelpOutline, School, Event } from '@mui/icons-material';
import React from 'react'
import "./sidebar.css"
import {Users} from "../../../dummyData"
import CloseFriend from "../CloseFriend"

export default function Sidebar() {
  return (
    <div className="sidebar hidden md:block w-[25vw] px-5 py-3 font-semibold">
      <div className=''>
        <ul>
          <li className='flex items-center my-4 cursor-pointer gap-2'>
            <RssFeed sx={{fontSize: 25}}/>
            <span>Feed</span>
          </li>
          <li className='flex items-center my-4 cursor-pointer gap-2'>
            <Chat sx={{fontSize: 25}}/>
            <span>Chat</span>
          </li>
          <li className='flex items-center my-4 cursor-pointer gap-2'>
            <PlayCircleFilledOutlined sx={{fontSize: 25}}/>
            <span>Videos</span>
          </li>
          <li className='flex items-center my-4 cursor-pointer gap-2'>
            <Group sx={{fontSize: 25}}/>
            <span>Group </span>
          </li>
          <li className='flex items-center my-4 cursor-pointer gap-2'>
            <Bookmarks sx={{fontSize: 25}}/>
            <span>Bookmarks</span>
          </li>
          <li className='flex items-center my-4 cursor-pointer gap-2'>
            <HelpOutline sx={{fontSize: 25}}/>
            <span>Question</span>
          </li>
          <li className='flex items-center my-4 cursor-pointer gap-2'>
            <WorkOutline sx={{fontSize: 25}}/>
            <span>Job</span>
          </li>
          <li className='flex items-center my-4 cursor-pointer gap-2'>
            <School sx={{fontSize: 25}}/>
            <span>Courses</span>
          </li>
          <li className='flex items-center my-4 cursor-pointer gap-2'>
            <Event sx={{fontSize: 25}}/>
            <span>Event</span>
          </li>
        </ul>
        <button className='mb-4 border border-black rounded-md bg-[#f0f0f0] mx-10 px-8 py-2 text-sm font font-semibold '>
          Read More
        </button>
        <hr />
        <ul className="mb-3 mt-6">
          {Users.map(u=>(
          <CloseFriend key={u.id} user={u}/>
        ))}
        </ul>
      </div>
    </div>
  );
}
