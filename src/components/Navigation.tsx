'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  
  // Don't show navigation on the QR scanner page
  if (pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          DCLR Photoboot
        </Link>
        
        <div className="flex space-x-4">
          <Link 
            href="/photo" 
            className={`hover:text-blue-300 ${pathname === '/photo' ? 'text-blue-300 font-semibold' : ''}`}
          >
            Photo
          </Link>
          <Link 
            href="/api-test" 
            className={`hover:text-blue-300 ${pathname === '/api-test' ? 'text-blue-300 font-semibold' : ''}`}
          >
            API Test
          </Link>
        </div>
      </div>
    </nav>
  );
} 