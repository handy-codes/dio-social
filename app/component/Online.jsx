import Image from 'next/image'
import React from 'react'

export default function Online({user}) {
  return (
    <li className='font-semibold flex items-center gap-2 mb-[15px]'>
        <div className='flex m-[10px]'>
            <Image 
            src={user.profilePicture}
            alt='person_pic'
            width={49}
            height={40}
            className='rounded-full object-cover w-[40px] h-[40px]'
            />
            <span className='-ml-[8px] w-[13px] h-[13px] rounded-full right-0 -top-[20px] bg-[limegreen] border-white border-2'></span>
        </div>
        <span className="font-semibold">{user.username}</span>
    </li>
  )
}
