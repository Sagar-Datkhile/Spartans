'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const features = [
  {
    title: 'Advanced Analytics & KPIs',
    description: 'Monitor real-time KPIs across every project. Drill down from company metrics to individual tasks.',
    colSpan: 'md:col-span-2 lg:col-span-2',
  },
  {
    title: 'Project Management',
    description: 'Create and manage projects from planning to delivery. Assign managers, set budgets.',
    colSpan: 'md:col-span-1 lg:col-span-1',
  },
  {
    title: 'Task Management Engine',
    description: 'Break projects into granular tasks with priorities, deadlines, and dependencies.',
    colSpan: 'md:col-span-1 lg:col-span-1',
  },
  {
    title: 'Role-Based Access Control',
    description: 'Three-tier access model ensuring every user sees exactly what they need.',
    colSpan: 'md:col-span-1 lg:col-span-1',
  },
  {
    title: 'Real-Time Project Chat',
    description: 'Built-in per-project messaging keeps communication in context.',
    colSpan: 'md:col-span-1 lg:col-span-1',
  },
  {
    title: 'Asset Lifecycle Tracking',
    description: 'Track every company asset from purchase to retirement. Know exactly who has what.',
    colSpan: 'md:col-span-2 lg:col-span-3',
  },
]

const roles = [
  {
    name: 'Employee',
    tagline: 'Personal productivity hub',
    popular: false,
    perms: ['View assigned tasks', 'Track personal progress', 'Personal analytics', 'Team chat participation'],
  },
  {
    name: 'Manager',
    tagline: 'Team & project operations',
    popular: true,
    perms: ['Create & manage projects', 'Delegate and track tasks', 'Team performance analytics', 'Risk assessment'],
  },
  {
    name: 'Admin',
    tagline: 'Full organizational control',
    popular: false,
    perms: ['All platform features', 'Role & permission config', 'System-wide settings', 'Company KPI oversight'],
  },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-8')
            entry.target.classList.add('opacity-100', 'translate-y-0')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-200">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Spartans</span>
          </div>

          <div className="hidden md:flex items-center gap-8 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-slate-200/50 shadow-sm">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#roles" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Roles</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
              Login
            </Link>
            <Link href="/admin/signup" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all duration-200 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] max-w-5xl opacity-40 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-400/30 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 text-xs font-semibold mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            New - Spartans v1.0 is now available
          </div>

          <h1 className="text-5xl md:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 mb-6 drop-shadow-sm">
            Turn Scattered Work Into <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Seamless Teamwork</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Spartans brings projects, tasks, and collaboration together <br className="hidden md:block" /> so your team can focus on progress.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#features" className="flex items-center gap-2 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-6 py-3.5 rounded-full font-semibold transition-all shadow-sm">
              Explore Features
            </a>
            <Link href="/admin/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-200 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5">
              Try Spartans For Free
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4 font-medium">No credit card required.</p>
        </div>

        {/* Hero Mockup */}
        <div className="mt-20 max-w-[1100px] mx-auto relative z-10">
          <div className="p-3 md:p-4 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl shadow-blue-900/10">
            <div className="rounded-[1.25rem] border border-slate-200/60 bg-white overflow-hidden flex flex-col shadow-inner h-[400px] md:h-[600px]">
              {/* Window Chrome */}
              <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white border border-slate-200 rounded-md px-24 py-1 text-[10px] text-slate-400 shadow-sm">spartans.app/dashboard</div>
                </div>
                <div className="w-12"></div>
              </div>
              {/* App Content */}
              <div className="flex flex-1 overflow-hidden bg-slate-50/50">
                {/* Sidebar */}
                <div className="w-48 border-r border-slate-100 bg-white p-4 hidden md:flex flex-col gap-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
                  <div className="text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100/50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    Dashboard
                  </div>
                  <div className="text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    Projects
                  </div>
                  <div className="text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Team Members
                  </div>
                  <div className="text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Calendar
                  </div>
                </div>
                {/* Main area */}
                <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Welcome back, Sarah</h2>
                      <p className="text-xs text-slate-500 mt-1">Here is what's happening in your workspace today.</p>
                    </div>
                    <button className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-blue-600/20">
                      + New Project
                    </button>
                  </div>
                  {/* Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 flex flex-col gap-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Projects</p>
                      <div className="flex items-end gap-2 mt-auto">
                        <span className="text-3xl font-extrabold text-slate-900">12</span>
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded pb-1 mb-1">+2 this week</span>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 flex flex-col gap-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Tasks</p>
                      <div className="flex items-end gap-2 mt-auto">
                        <span className="text-3xl font-extrabold text-slate-900">48</span>
                        <span className="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded pb-1 mb-1">5 overdue</span>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 flex flex-col gap-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Team Velocity</p>
                      <div className="flex items-end gap-2 mt-auto">
                        <span className="text-3xl font-extrabold text-slate-900">94%</span>
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded pb-1 mb-1">+4%</span>
                      </div>
                    </div>
                  </div>
                  {/* List */}
                  <div className="flex-1 bg-white border border-slate-100 rounded-xl shadow-sm p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-bold text-slate-900">Recent Tasks</h3>
                      <span className="text-xs text-blue-600 font-medium cursor-pointer">View All</span>
                    </div>

                    {[
                      { title: 'Update Q3 Marketing Site', project: 'Website Redesign', status: 'In Progress', statusColor: 'text-blue-600 bg-blue-50' },
                      { title: 'Review Database Schema Maps', project: 'Backend V2', status: 'Review', statusColor: 'text-amber-600 bg-amber-50' },
                      { title: 'Finalize Client Pitch Deck', project: 'Q3 Sales', status: 'Done', statusColor: 'text-emerald-600 bg-emerald-50' },
                    ].map((task, i) => (
                      <div key={i} className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${task.status === 'Done' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                            <p className="text-xs text-slate-500">{task.project}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${task.statusColor}`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Farm */}
        <div className="mt-24 mb-10 max-w-4xl mx-auto items-center animate-on-scroll opacity-0 translate-y-8">
          <p className="text-sm font-semibold text-slate-400 mb-6">Trusted by thousands of teams worldwide...</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale select-none">
            <span className="text-xl font-bold font-serif italic text-slate-700">OpalLabs</span>
            <span className="text-xl font-bold tracking-tight text-slate-700">Kintsugi</span>
            <span className="text-xl font-bold text-slate-700">StackEd Lab</span>
            <span className="text-xl font-bold font-mono text-slate-700">Magnolia</span>
            <span className="text-xl font-bold tracking-widest text-slate-700">Sisyphus</span>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Our Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Features To Boost Your Productivity</h2>
            <p className="text-slate-500 text-lg">Everything you need to plan, track, and deliver on all your tasks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 ${f.colSpan} animate-on-scroll opacity-0 translate-y-8 flex flex-col justify-end min-h-[280px] relative overflow-hidden`}
                style={{ transitionDelay: `${(i % 3) * 100}ms` }}
              >
                {/* Abstract decorative elements inside cards */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-in-out opacity-50"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-50/50 rounded-full group-hover:bg-blue-100/50 transition-colors duration-500"></div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-sm">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Get Started in 3 Simple Steps</h2>
            <p className="text-slate-500 text-lg">Three steps to set up Spartans and get your team moving.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: 1, title: 'Set Up Your Workspace', desc: 'Customise the platform to your needs and fit your workflow.' },
              { num: 2, title: 'Invite Your Team', desc: 'Add your organisation members and assign them roles.' },
              { num: 3, title: 'Manage Work Together', desc: 'Create projects, assign tasks, and monitor KPIs live.' },
            ].map((step, i) => (
              <div key={step.num} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-6 shadow-sm border border-blue-100">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Roles */}
      <section id="roles" className="py-24 px-6 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Access Control</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Choose The Perfect Role</h2>
            <p className="text-slate-500 text-lg">Flexible access control designed to match every team's workflow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            {roles.map((r, i) => (
              <div
                key={r.name}
                className={`rounded-3xl p-8 border hover:shadow-2xl transition-all duration-300 animate-on-scroll opacity-0 translate-y-8
                  ${r.popular
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/30 md:-translate-y-4'
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-bold ${r.popular ? 'text-blue-50' : 'text-slate-900'}`}>{r.name}</h3>
                  {r.popular && <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-blue-600 px-2 py-1 rounded-full">Most Popular</span>}
                </div>
                <p className={`text-sm mb-6 ${r.popular ? 'text-blue-200' : 'text-slate-500'}`}>{r.tagline}</p>

                <hr className={`border-t my-6 ${r.popular ? 'border-blue-500/50' : 'border-slate-100'}`} />

                <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${r.popular ? 'text-blue-200' : 'text-slate-400'}`}>What's included in {r.name.toLowerCase()}</p>
                <ul className="space-y-4 mb-8">
                  {r.perms.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm font-medium">
                      <svg className={`w-5 h-5 flex-shrink-0 ${r.popular ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={r.popular ? 'text-blue-50' : 'text-slate-600'}>{p}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3.5 rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-95 ${r.popular ? 'bg-white text-blue-600 shadow-md' : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100'}`}>
                  Select {r.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-600 rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden relative shadow-2xl shadow-blue-600/20 animate-on-scroll opacity-0 translate-y-8">
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                Ready to Supercharge <br className="hidden md:block" />
                Your Team's Productivity?
              </h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
                Join thousands of teams already using Spartans. No credit card required, set up in minutes.
              </p>
              <Link href="/admin/signup" className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl">
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 px-6 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-slate-900 text-xl tracking-tight">Spartans</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              Targeted towards organizations wanting a unified platform to track everything seamlessly.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
              <Link href="#roles" className="hover:text-blue-600 transition-colors">Pricing & Roles</Link>
              <Link href="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <a href="#" className="hover:text-blue-600 transition-colors">About Us</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Careers</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
          <p className="text-slate-400 text-sm">© 2026 Spartans Platform. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Cookie Policy</a>
          </div>
        </div>

        {/* Giant subtle watermark text like in Trickly footer */}
        <div className="mt-20 flex justify-center overflow-hidden pointer-events-none select-none">
          <h1 className="text-[150px] md:text-[250px] font-extrabold text-[#F1F5F9] tracking-tighter leading-none -mb-10">
            Spartans
          </h1>
        </div>
      </footer>
    </div>
  )
}
