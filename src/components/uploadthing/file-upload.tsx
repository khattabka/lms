// "use client"

import { ourFileRouter } from "~/app/api/uploadthing/core"
import { UploadDropzone } from "./upload"
import toast from "react-hot-toast"



interface FileUploadProps {
    endpoint : keyof typeof ourFileRouter
    onChange : (url? : any) => void
}
export const FileUpload = ({endpoint, onChange}: FileUploadProps) => {
        return(
            <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                console.log(res);
                
                onChange(res)
            }}
            onUploadError={(err) => {
                console.log(err)
                toast.error(err.message)
            }}
            />
            
        )
}