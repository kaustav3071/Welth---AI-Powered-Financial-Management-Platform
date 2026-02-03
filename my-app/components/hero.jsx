"use client";
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Star, Users, Shield, Zap } from 'lucide-react';

const HeroSection = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const heroElement = document.getElementById('hero-section');
        if (heroElement) {
            observer.observe(heroElement);
        }

        return () => observer.disconnect();
    }, []);

  return (
        <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            {/* Elegant Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-100/20 rounded-full blur-2xl animate-pulse animation-delay-4000"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            {/* Badge */}
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                <Star className="w-4 h-4 mr-2" />
                                Trusted by 50,000+ users
                            </div>

                            {/* Main Heading */}
                            <div className="space-y-6">
                                <h1 className="text-6xl lg:text-8xl font-bold text-gray-900 leading-tight">
                                    Manage Your
                                    <span className="block text-gradient">
                                        Finances
                                    </span>
                                    with Intelligence
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                                    The most intelligent financial management platform that helps you track expenses, 
                                    set budgets, and achieve your financial goals with AI-powered insights.
                                </p>
                            </div>

                            {/* CTA Button */}
                            <div className="flex justify-start">
                                <Link href='/dashboard'>
                                    <Button size='lg' className='px-10 py-5 text-xl font-semibold btn-primary-elegant group rounded-2xl'>
                                        Get Started Free
                                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap items-center gap-8 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <Shield className="h-4 w-4 mr-2 text-green-500" />
                                    Bank-level Security
                                </div>
                                <div className="flex items-center">
                                    <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                                    AI-Powered
                                </div>
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                                    50K+ Users
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Dashboard Preview */}
                        <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div className="relative group">
                                {/* Main Dashboard Image */}
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
                                    <Image 
                                        src='/banner.jpeg' 
                                        width={600} 
                                        height={400} 
                                        alt='Welth Dashboard Preview' 
                                        priority 
                                        className='rounded-xl w-full h-auto' 
                                    />
                                    
                                    {/* Floating Cards */}
                                    <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-float">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700">Live Analytics</span>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-float animation-delay-1000">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium text-gray-700">AI Insights</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                            </div>
            </div>
        </div>
      </div>
    </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>
        </section>
  )
}

export default HeroSection;

