import React from 'react';
import Image from 'next/image';
import Topbar from '../component/Topbar';
import Sidebar from '../component/sidebar/Sidebar';
import Rightbar from '../component/Rightbar';
import Rightbarprofile from '../component/Rightbarprofile';
import Feed from '../Feed';


export default function page() {
  return (
    <>
    <Topbar />
    <div className="flex w-full min-h-[calc(100vh-65px)] items-start justify-start bg-[#f0f2f5]">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="w-full">
          <div className="h-[320px] w-full relative">
            <div className="w-full h-[250px] relative">
              <Image src="/assets/team/lagosrail.jpg" fill className='object-cover' alt="cover"/>
            </div>
            <Image
            className='w-[160px] h-[160px] object-cover rounded-full absolute top-[160px] left-0 right-0 border-4 border-white m-auto'
            src="/assets/team/girl.png"
            width={160}
            height={160}
            alt='profile'
            />
          </div>
          <div className="flex flex-col items-center justify-center py-2">
            <h4 className="text-[24px] font-semibold ">Kemi Michael</h4>
            <span className="">Hello my friends Welcome {new Date().getFullYear()}</span>
          </div>
        </div>

        <div className="flex flex-row items-start gap-2 px-2 pb-6">
          <div className="flex-1 min-w-0">
            <Feed />
          </div>
          <div className="w-[280px] shrink-0 flex flex-col gap-4">
            <Rightbarprofile />
            <Rightbar />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
