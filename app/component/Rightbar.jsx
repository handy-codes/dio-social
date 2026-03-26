import Image from 'next/image'
import React from 'react'
import Online from "./Online"
import { Users } from '../../dummyData'


export default function Rightbar() {
  return (
    // <div className="hidden sm:block w-[280px] shrink-0 font-semibold overflow-hidden bg-white shadow-sm rounded-md">
    <div className="hidden lg:block w-[30vw] font-semibold overflow-hidden">
      <div className="pt-[20px] pr-[20px] pl-[10px]">
        <div className="flex items-center">
          <Image
          src="/assets/team/hennessyad.jpg"
          alt='hennessyad'
          width={40}
          height={40}
          className='w-[40px] h-[40px] mr-[10px]'
          />
          <span className='text-[15px]'><b>Agwabuma Owo</b> and <b>3 Others</b> like this</span>
        </div>
    
        <div className="flex items-center">
          <Image
          src="/assets/team/hennessyad.jpg"
          alt='hennessyad'
          width={500}
          height={500}
          className='w-full rounded-md object-contain my-[30px] hover:scale-110 transition-transform duration-300 overflow-hidden'
          />
        </div>
        <h4 className='mb-[20px]'>Online Friends</h4>
        <ul>
          {Users.map((u) => (
            <Online key={u.id} user={u} />
          ))}
        </ul>
      </div>
    </div>
  )
}
