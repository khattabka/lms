import { ArrowLeft, Eye, LayoutDashboard, Video } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import toast from 'react-hot-toast';
import { buttonVariants } from '~/components/ui/button';
import { api } from '~/trpc/server';
import ChapterTitleForm from './_components/chapter-title-form';
import ChapterDescForm from './_components/chapter-desc-form';
import ChapterAccessForm from './_components/chapter-access-form';
import ChapterVideoForm from './_components/chapter-video-form';
import AlertBanner from './_components/alert-banner';
import ChapterActions from './_components/chapter-actions';

const ChapterEditPage = async({params}: {params: {courseId: string, chapterId: string}}) => {
  const {courseId, chapterId} = params

  const chapter =await api.course.getChapterById(
    {
      chapterId: chapterId,
      courseId: courseId
    }
  )
  if(!chapter) {
    toast.error('Chapter not found')
    redirect('/dashboard/teacher/courses')
  }
  const requiredFields = [
    chapter.title,
    chapter.description,
    chapter.videoUrl
  ]

  const total = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionPercentage = Math.floor((completedFields / total) * 100);
  const completionText = `${completedFields}/${total} fields completed (${completionPercentage}%)`;

  const isComplete = requiredFields.every(Boolean);
  return (
    <>
    {!chapter.isPublished && (
      <AlertBanner label="This chapter is not published yet" variant="warning"/>
    )}
    <div className='p-6'>
      <div className='w-full flex items-center justify-between'>
        <div className='w-full'>
        <Link href={`/dashboard/teacher/courses/${courseId}`}
          className={buttonVariants({variant: 'ghost', size: 'icon'})}
        >
          <ArrowLeft className='w-4 h-4  mr-2'/>
        </Link>
        <div className='flex items-center justify-between w-full'>
        <div className='flex flex-col gap-y-2'>
          <h1 className='text-3xl font-semibold'>Edit Chapter</h1>
          <span>
            {completionText}
          </span>
        </div>
        <ChapterActions
          courseId={courseId}
          chapter={chapter}
          isChapterComplete = {isComplete}
          disabled = {!isComplete}
          isPublished = {chapter.isPublished}
        />
        </div>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-16'>
        <div className='space-y-4'>
          <div>
            <div className='flex items-center gap-x-3'>
              <LayoutDashboard className='w-6 h-6'/>
              <h2 className='text-xl font-semibold'>Edit Chapter</h2>
            </div>
            <ChapterTitleForm courseId={courseId} chapter={chapter}/>
            <ChapterDescForm courseId={courseId} chapter={chapter}/>
          </div>
          <div>
            <div className='flex items-center gap-x-3'>
              <Eye className='w-6 h-6'/>
              <h2 className= 'text-xl font-semibold'>
                Access Settings
              </h2>
            </div>
            <ChapterAccessForm courseId={courseId} chapter={chapter} />
          </div>
        </div>
        <div>
          <div>
            <div className='flex items-center gap-x-3'>
              <Video className='w-6 h-6'/>
              <h2 className='text-xl font-semibold'>
                Add Video
              </h2>
          </div>
          <ChapterVideoForm courseId={courseId} chapter={chapter}/>
        </div>
      </div>
    </div>
    </div>
    </>

  )
}

export default ChapterEditPage