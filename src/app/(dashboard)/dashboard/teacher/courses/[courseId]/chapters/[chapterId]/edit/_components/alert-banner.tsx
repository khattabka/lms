import { VariantProps, cva } from 'class-variance-authority'
import { AlertTriangle, CheckCircleIcon } from 'lucide-react'
import React from 'react'
import { cn } from '~/lib/utils'


const bannerVariants = cva('w-full h-16 flex items-center justify-center  text-sm', {
    variants: {
        variant: {
            success: 'bg-green-500 border-emerald-800 text-secondary',
            warning: 'bg-yellow-600 dark:bg-yellow-200/80 border-yellow-30 text-secondary',
        }
    },
    defaultVariants: {
        variant: 'warning'
    }
})

const icons = {
    warning : AlertTriangle,
    success: CheckCircleIcon
}
interface BannerProps extends VariantProps<typeof bannerVariants> {
    label: string
}


const AlertBanner = ({label, variant}: BannerProps) => {
    const Icon = icons[variant || 'warning']
  return (
    <div className={cn(bannerVariants({variant}))}>
        <Icon className='w-6 h-6 mr-2' />
        {label}
    </div>
  )
}

export default AlertBanner