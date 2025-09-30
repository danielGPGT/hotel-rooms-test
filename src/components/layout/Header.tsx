import { useLocation } from 'react-router-dom'
import { User, Bell } from 'lucide-react'

const getPageTitle = (pathname: string) => {
  const routes: Record<string, string> = {
    '/hotels': 'Hotels',
    '/contracts': 'Contracts', 
    '/tours': 'Tours',
    '/inventory': 'Inventory',
    '/rates': 'Rates',
    '/pricing': 'Pricing Sandbox',
  }
  
  return routes[pathname] || 'Dashboard'
}

export function Header() {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{pageTitle}</h2>
        <p className="text-sm text-slate-500">
          {location.pathname === '/pricing' 
            ? 'Create customer quotes and manage pricing'
            : 'Manage your hotel operations'
          }
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
          <Bell className="w-5 h-5" />
        </button>
        <button className="flex items-center space-x-2 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
          <User className="w-5 h-5" />
          <span className="text-sm">Admin</span>
        </button>
      </div>
    </header>
  )
}
