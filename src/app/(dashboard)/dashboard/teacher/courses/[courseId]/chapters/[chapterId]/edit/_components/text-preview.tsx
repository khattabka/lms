"use client"
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';
interface PreviewProps {
    value : string
}

const TextPreview = ({ value}: PreviewProps) => {

    const ReactQuill = useMemo(()=> dynamic(() => import('react-quill'), {ssr: false}), [])
  return (
    <div>
        <ReactQuill value={value} readOnly theme='bubble' />
    </div>
  )
}

export default TextPreview