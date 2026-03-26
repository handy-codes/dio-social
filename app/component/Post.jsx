/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { MoreVert } from '@mui/icons-material';
import { useState } from 'react';
import TimeAgo from "./TimeAgo";
import Image from "next/image";

export default function Post({post}){

    const [like, setLike] = useState(0);
    const [isLiked, setIsLiked] =useState(false);
    const likeHandler =() => {
        setLike(isLiked ? like - 1 : like + 1);
        setIsLiked(!isLiked);
    }
    return(
        <>
            <div className='post w-[100%] rounded-md bg-white hover:scale-[1.025] transition-transform'>
            <div className='p-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                        <Image src={post.authorImageUrl || "/assets/team/girl.png"}
                        alt='user picture'
                        width={32}
                        height={32}
                        className='w-[32px] h-[32px] rounded-full object-cover mr-[10px]'    
                        />
                        <span className='text-[15px] font-semibold mx-[10px]'>
                            {post.authorName}{" "}
                        </span>
                        <TimeAgo className='text-[12px]' date={post.createdAt} />
                    </div>
                    <div className=''>
                        <MoreVert/>
                    </div>
                </div>

                <div className='my-[20px]'>
                    <span>{post?.content}</span>
                    {post.imageUrl ? (
                      <img
                        className='w-full cursor-pointer max-h-[500px] mt-[20px] object-cover rounded-md'
                        alt="post"
                        src={post.imageUrl}
                      />
                    ) : null}
                </div>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                        <Image
                            className='cursor-pointer w-[24px] h-[24px] mr-[10px]'
                            src="/assets/team/like.png"
                            onClick={likeHandler}
                            alt="like_image"
                            width={40}
                            height={40}
                        />
                        <Image
                            className='cursor-pointer w-[24px] mr-[10px]'
                            src="/assets/team/heart.jpg"
                            onClick={likeHandler}
                            alt="like_image"
                            width={40}
                            height={40}
                        />
                        <span className='text-[15px]'>{like} people likes</span>
                    </div>

                    <div>
                        <span>@{post.authorUsername}</span>
                    </div>
                </div>
            </div>
          </div>
        </>
    );
}