"use client";
import HeroSection from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle, Star, Users, DollarSign, Clock, Award } from "lucide-react";

export default function Home() {
    const [visibleSections, setVisibleSections] = useState(new Set());
    const sectionRefs = useRef({});

    useEffect(() => {
        const observers = Object.values(sectionRefs.current).map((ref) => {
            if (!ref) return null;
            
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setVisibleSections(prev => new Set([...prev, entry.target.id]));
                    }
                },
                { threshold: 0.1 }
            );
            
            observer.observe(ref);
            return observer;
        });

        return () => {
            observers.forEach(observer => observer?.disconnect());
        };
    }, []);

    const addToRefs = (id) => (el) => {
        if (el) {
            sectionRefs.current[id] = el;
            el.id = id;
        }
    };

    return (
        <div>
            <HeroSection />

            {/* Elegant Stats Section */}
            <section className="py-20 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-4xl mb-4">Trusted by Thousands</h2>
                        <p className="text-lg text-gray-600 leading-relaxed text-xl">Join the financial revolution</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {statsData.map((item, index) => (
                            <div 
                                key={index} 
                                ref={addToRefs(`stats-${index}`)}
                                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-8 ${
                                    visibleSections.has(`stats-${index}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                                    {item.value}
                                </div>
                                <div className="text-lg text-gray-600 leading-relaxed font-medium">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Elegant Features Section */}
            <section className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-4xl mb-4">Everything you need to manage your finances</h2>
                        <p className="text-lg text-gray-600 leading-relaxed text-xl max-w-3xl mx-auto">
                            Powerful features designed to give you complete control over your financial future
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuresData.map((feature, index) => (
                            <div 
                                key={index} 
                                ref={addToRefs(`feature-${index}`)}
                                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group p-8 ${
                                    visibleSections.has(`feature-${index}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="space-y-6">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                   {feature.icon}
                                    </div>
                                    <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-2xl group-hover:text-blue-600 transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                                        Learn more <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Elegant How It Works Section */}
            <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-dots-pattern opacity-10"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-4xl mb-4">How it Works</h2>
                        <p className="text-lg text-gray-600 leading-relaxed text-xl">Get started in three simple steps</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {howItWorksData.map((step, index) => (
                            <div 
                                key={index} 
                                ref={addToRefs(`step-${index}`)}
                                className={`text-center group ${
                                    visibleSections.has(`step-${index}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                            >
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        {step.icon}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-2xl mb-4 group-hover:text-blue-600 transition-colors duration-300">
                                    {step.title}
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed text-lg">
                                    {step.description}
                                </p>
                        </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Elegant Testimonials Section */}
            <section className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-4xl mb-4">What Our Users Say</h2>
                        <p className="text-lg text-gray-600 leading-relaxed text-xl">Real stories from real users</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonialsData.map((testimonial, index) => (
                            <div 
                                key={index} 
                                ref={addToRefs(`testimonial-${index}`)}
                                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group p-8 ${
                                    visibleSections.has(`testimonial-${index}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="flex items-center mb-6">
                                    <div className="relative">
                                    <Image 
                                            src={testimonial.image} 
                                            alt={testimonial.name}
                                            width={60}
                                            height={60}
                                            className="rounded-full border-4 border-blue-100"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-lg">{testimonial.name}</div>
                                        <div className="text-sm text-lg text-gray-600 leading-relaxed">{testimonial.role}</div>
                                        <div className="flex items-center mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                   </div>
                                <p className="text-lg text-gray-600 leading-relaxed text-lg italic">
                                    "{testimonial.quote}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Elegant CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                            Ready to take Control of your Finances?
                        </h2>
                        <p className="text-xl text-gray-200 mb-12 leading-relaxed">
                        Join thousands of users who are already managing their finances effectively with Welth.
                            Start your free trial today and experience the future of financial management.
                    </p>

                        <div className="flex justify-center mb-12">
                    <Link href='/dashboard'>
                    <Button
                    size='lg'
                                    className='px-12 py-6 text-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-2xl group'
                                >
                        Start Free Trial
                                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    </Link>
                        </div>

                        <div className="flex flex-wrap justify-center items-center space-x-8 text-gray-200">
                            <div className="flex items-center">
                                <Users className="h-5 w-5 mr-2 text-blue-400" />
                                50,000+ Users
                            </div>
                            <div className="flex items-center">
                                <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                                $2B+ Tracked
                            </div>
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-yellow-400" />
                                99.9% Uptime
                            </div>
                            <div className="flex items-center">
                                <Award className="h-5 w-5 mr-2 text-purple-400" />
                                4.9/5 Rating
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
