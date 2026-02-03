import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { LayoutDashboard, PenBox, Users, Receipt } from 'lucide-react';
import UserButtonWrapper from './user-button-wrapper';

const Header = () => {
    return (
        <header className='fixed top-0 w-full bg-white/90 backdrop-blur-lg z-50 border-b border-gray-200 shadow-lg'>
            <nav className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
                <Link href='/' className="group">
                    <Image
                        src={"/logo.png"} 
                        alt='Welth Logo' 
                        height={60} 
                        width={200}
                        className='h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300' 
                    />
                </Link>
                
                <div className='flex items-center space-x-2'>
                    <SignedIn>
                        <Link href='/dashboard' className='group'>
                            <Button variant='outline' className='px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50 group-hover:scale-105 transition-all duration-300'>
                                <LayoutDashboard size={16} className="mr-1"/>
                                <span className='hidden lg:inline'>Dashboard</span>
                            </Button>
                        </Link>

                        <Link href='/friends' className='group'>
                            <Button variant='outline' className='px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border-2 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 group-hover:scale-105 transition-all duration-300'>
                                <Users size={16} className="mr-1"/>
                                <span className='hidden lg:inline'>Friends</span>
                            </Button>
                        </Link>

                        <Link href='/splits' className='group'>
                            <Button variant='outline' className='px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border-2 border-gray-300 text-gray-700 hover:border-purple-500 hover:bg-purple-50 group-hover:scale-105 transition-all duration-300'>
                                <Receipt size={16} className="mr-1"/>
                                <span className='hidden lg:inline'>Splits</span>
                            </Button>
                        </Link>

                        <Link href='/transaction/create' className='group'>
                            <Button className='px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl group-hover:scale-105 transition-all duration-300'>
                                <PenBox size={16} className="mr-1"/>
                                <span className='hidden lg:inline'>Add Transaction</span>
                            </Button>
                        </Link>
                    </SignedIn>

                    <SignedOut>
                        <SignInButton forceRedirectUrl='/'>
                            <Button className='px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'>Get Started</Button>
                        </SignInButton>
                    </SignedOut>
                    
                    <SignedIn>
                        <UserButtonWrapper />
                    </SignedIn>
                </div>
            </nav>
        </header>
    )
}

export default Header;
