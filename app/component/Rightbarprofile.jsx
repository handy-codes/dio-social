import Image from 'next/image';
import React from 'react';

export default function Rightbarprofile() {
  const ProfileRightbar = () => {
    return (
      <>

        <div className="bigcover mt4 w-full">
          <h4 className="font-semibold text-lg">User information</h4>
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex gap-2 items-center">
              <span className="">City</span>
              <span className="font-semibold">Port Harcourt</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="">From</span>
              <span className="font-semibold">Lagos</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="">Relationship</span>
              <span className="font-semibold">Single but not Searching!</span>
            </div>
          </div>
          <h4 className="mt-6 font-bold text-lg">User friends</h4>
          <div className="flex flex-wrap mr-4 mt-4 justify-between">
            <div className="flex flex-col items-center mb-[20px] cursor-pointer">
              <Image
              src="/assets/team/eleven.jpeg"
              alt="someone"
              width={100}
              height={100}
              className="w-[100px] h-[100px] rounded-md object-cover"
              />
              <span className="font-semibold">Osuofia</span>
            </div>
            <div className="flex flex-col items-center mb-[20px] cursor-pointer">
              <Image
              src="/assets/team/one.webp"
              alt="someone"
              width={100}
              height={100}
              className="w-[100px] h-[100px] rounded-md object-cover"
              />
              <span className="font-semibold">Mr Ibu</span>
            </div>
            <div className="flex flex-col items-center mb-[20px] cursor-pointer">
              <Image
              src="/assets/team/five.webp"
              alt="someone"
              width={100}
              height={100}
              className="w-[100px] h-[100px] rounded-md object-cover"
              />
              <span className="font-semibold">Ada Abia</span>
            </div>
            <div className="flex flex-col items-center mb-[20px] cursor-pointer">
              <Image
              src="/assets/team/six.webp"
              alt="someone"
              width={100}
              height={100}
              className="w-[100px] h-[100px] rounded-md object-cover"
              />
              <span className="font-semibold">Nick Bull</span>
            </div>
            <div className="flex flex-col items-center mb-[20px] cursor-pointer">
              <Image
              src="/assets/team/ten.webp"
              alt="someone"
              width={100}
              height={100}
              className="w-[100px] h-[100px] rounded-md object-cover"
              />
              <span className="font-semibold">Ozi Oma</span>
            </div>
            <div className="flex flex-col items-center mb-[20px] cursor-pointer">
              <Image
              src="/assets/team/nine.webp"
              alt="someone"
              width={100}
              height={100}
              className="w-[100px] h-[100px] rounded-md object-cover"
              />
              <span className="font-semibold">Guy Richie</span>
            </div>
            <div className="flex flex-col items-center mb-[20px] cursor-pointer">
              <Image
              src="/assets/team/three.webp"
              alt="someone"
              width={100}
              height={100}
              className="w-[100px] h-[100px] rounded-md object-cover"
              />
              <span className="font-semibold">Akachi Diya</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  return(
    <div className="rightbar">
      <div className="rightbarWrapper">
        <ProfileRightbar/>
      </div>
    </div>
  );
}
