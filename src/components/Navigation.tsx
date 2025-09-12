'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Home, Library, Palette, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      active: pathname === '/dashboard'
    },
    {
      href: '/prompts',
      label: 'Prompts',
      icon: Library,
      active: pathname === '/prompts'
    },
    {
      href: '/categorias',
      label: 'Categorías',
      icon: Palette,
      active: pathname === '/categorias'
    }
  ]

  return (
    <nav className="flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <CustomButton
            key={item.href}
            asChild
            variant={item.active ? "primary" : "ghost"}
            size="sm"
          >
            <Link href={item.href} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </CustomButton>
        )
      })}
      
      <ThemeToggle />
      
      <CustomButton
        variant="neutral"
        size="sm"
        onClick={() => signOut()}
        className="ml-4"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Salir
      </CustomButton>
    </nav>
  )
}