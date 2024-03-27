import React from 'react'
import MobileSidebar from '../mobilesidebar'
import NavbarRoutes from '~/components/global/navbar-routes'

const Navbar = () => {
  return (

     <div className="p-4 border-b h-full bg-white dark:bg-slate-900 flex items-center shadow-sm">
      <MobileSidebar />
      <NavbarRoutes/>
    </div>

  )
}

export default  Navbar