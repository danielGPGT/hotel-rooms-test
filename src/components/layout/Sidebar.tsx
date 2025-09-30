import { NavLink } from 'react-router-dom'
import { 
  Building2, 
  FileText, 
  Calendar, 
  Package, 
  DollarSign, 
  Calculator,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Hotels', href: '/hotels', icon: Building2 },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Tours', href: '/tours', icon: Calendar },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Rates', href: '/rates', icon: DollarSign },
  { name: 'Pricing', href: '/pricing', icon: Calculator, highlight: true },
]

export function Sidebar() {
  return (
    <div className="w-60 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Hotel Rooms</h1>
        <p className="text-sm text-slate-500">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-100 text-blue-600 border-r-2 border-blue-600'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              } ${item.highlight ? 'bg-blue-50 text-blue-700' : ''}`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center text-sm text-slate-500">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </div>
      </div>
    </div>
  )
}
