'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const features = [
  {
    title: 'Advanced Analytics & KPIs',
    description: 'Monitor real-time KPIs across every project, team, and department. Drill down from company-wide metrics to individual task performance.',
    bullets: ['Task completion rate tracking', 'Monthly trend charts', 'Risk scoring per project', 'Custom KPI targets per team'],
    badge: 'Analytics',
  },
  {
    title: 'Full Project Management',
    description: 'Create and manage projects from planning to delivery. Assign managers, set budgets, track milestones, and measure outcomes.',
    bullets: ['Project status: Planning → Completed', 'Budget & KPI target fields', 'Risk level flagging (Low–Critical)', 'Team member assignment'],
    badge: 'Projects',
  },
  {
    title: 'Task Management Engine',
    description: 'Break projects into granular tasks with priorities, deadlines, skill requirements, dependencies, and file attachments.',
    bullets: ['Status: TODO → IN_REVIEW → DONE', 'Priority levels: Low / Medium / High', 'Task dependencies mapping', 'Estimated vs actual hours'],
    badge: 'Tasks',
  },
  {
    title: 'Asset Lifecycle Tracking',
    description: 'Track every company asset from purchase to retirement. Know exactly who has what, where it is, and when maintenance is due.',
    bullets: ['Available / In-Use / Maintenance / Retired', 'Asset value & serial number records', 'Current user assignment', 'Purchase & expiry date tracking'],
    badge: 'Assets',
  },
  {
    title: 'Real-Time Project Chat',
    description: 'Built-in per-project messaging keeps communication in context. No more lost Slack threads — everything lives alongside the work.',
    bullets: ['Project-specific chat channels', 'File and attachment sharing', 'Live updates via Firestore', 'Accessible to all project members'],
    badge: 'Chat',
  },
  {
    title: 'Role-Based Access Control',
    description: 'Three-tier access model ensuring every user sees exactly what they need — nothing more. Invite-only onboarding with email verification.',
    bullets: ['SUPERADMIN / MANAGER / EMPLOYEE', 'Feature-level permission flags', 'Invite-only account creation', 'Pending → Active status flow'],
    badge: 'Security',
  },
]

const roles = [
  {
    name: 'Super Admin',
    tagline: 'Full organizational control',
    color: 'border-gray-900',
    tagColor: 'bg-gray-900 text-white',
    perms: [
      'All platform features unlocked',
      'Create & manage Managers + Employees',
      'CSV bulk user import',
      'Department management',
      'Role & permission configuration',
      'System-wide settings & audit logs',
      'Company-level KPI oversight',
    ],
  },
  {
    name: 'Manager',
    tagline: 'Team & project operations',
    color: 'border-gray-400',
    tagColor: 'bg-gray-700 text-white',
    perms: [
      'Create & manage projects',
      'Delegate and track tasks',
      'View Gantt chart timelines',
      'Team performance analytics',
      'Assign & track company assets',
      'Risk assessment per project',
      'Project-level chat access',
    ],
  },
  {
    name: 'Employee',
    tagline: 'Personal productivity hub',
    color: 'border-gray-300',
    tagColor: 'bg-gray-500 text-white',
    perms: [
      'View assigned tasks & deadlines',
      'Track personal project progress',
      'View Gantt chart timelines',
      'Personal analytics & performance',
      'Team chat participation',
      'Deadline & priority visibility',
    ],
  },
]

const stats = [
  { value: '3', label: 'Access Roles', sub: 'Super Admin, Manager, Employee' },
  { value: '6+', label: 'Core Modules', sub: 'Projects, Tasks, Assets, Chat...' },
  { value: '99.8%', label: 'Uptime SLA', sub: 'Firebase-backed infrastructure' },
  { value: 'Real-Time', label: 'Data Sync', sub: 'Firestore live listeners' },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-200 ${scrolled ? 'border-b border-gray-200 shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">Spartans</p>
              <p className="text-[10px] text-gray-400 leading-tight">Performance Management</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#roles" className="hover:text-gray-900 transition-colors">Roles</a>
            <a href="#platform" className="hover:text-gray-900 transition-colors">Platform</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Sign In
            </Link>
            <Link
              href="/admin/signup"
              className="text-sm bg-gray-900 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-150 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center border-b border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500 text-xs font-medium mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Enterprise Performance Management — v1.0
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
            One platform to manage<br />
            <span className="text-gray-400">your entire organization.</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Spartans brings project management, task tracking, asset inventory, team collaboration, and advanced analytics together — with strict role-based access for every level of your company.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin/signup"
              className="group flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-150 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start as Super Admin
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-8 py-4 rounded-xl font-medium text-base border border-gray-200 hover:border-gray-400 bg-white transition-all duration-150 hover:-translate-y-0.5 shadow-sm"
            >
              Sign In to Account
            </Link>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-gray-200 overflow-hidden shadow-2xl bg-white text-left">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4 h-6 rounded-md bg-gray-100 flex items-center px-3">
              <span className="text-gray-400 text-xs">localhost:3000/dashboard</span>
            </div>
            <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded font-medium">SUPERADMIN</span>
          </div>
          {/* Two-column dashboard layout */}
          <div className="flex">
            {/* Fake sidebar */}
            <div className="w-48 bg-gray-900 p-4 space-y-1 hidden sm:block">
              {['Dashboard', 'Projects', 'Tasks', 'Assets', 'Analytics', 'Chat', 'User Management', 'Settings'].map((item, i) => (
                <div key={item} className={`text-xs py-2 px-3 rounded-lg ${i === 0 ? 'bg-white text-gray-900 font-semibold' : 'text-gray-400 hover:text-white'}`}>
                  {item}
                </div>
              ))}
            </div>
            {/* Fake main content */}
            <div className="flex-1 p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-800">Dashboard</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Users', val: '1,250', sub: '+12% from last month' },
                  { label: 'Active Projects', val: '45', sub: '+2 this week' },
                  { label: 'System Health', val: '99.8%', sub: 'Uptime' },
                  { label: 'Pending Tasks', val: '324', sub: 'Across all projects' },
                ].map((c) => (
                  <div key={c.label} className="border border-gray-100 rounded-xl p-3 bg-white">
                    <p className="text-xs text-gray-400">{c.label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{c.val}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">{c.sub}</p>
                  </div>
                ))}
              </div>
              {/* Fake bar chart */}
              <div className="border border-gray-100 rounded-xl p-4 bg-white">
                <p className="text-xs font-semibold text-gray-700 mb-3">Platform Overview — Monthly Statistics</p>
                <div className="flex items-end justify-around gap-2 h-24">
                  {[
                    { h1: 70, h2: 50, h3: 95 },
                    { h1: 50, h2: 40, h3: 88 },
                    { h1: 35, h2: 45, h3: 92 },
                    { h1: 60, h2: 38, h3: 80 },
                    { h1: 40, h2: 42, h3: 90 },
                  ].map((bar, i) => (
                    <div key={i} className="flex items-end gap-1">
                      <div className="w-3 rounded-t bg-blue-400" style={{ height: `${bar.h1}%` }} />
                      <div className="w-3 rounded-t bg-purple-400" style={{ height: `${bar.h2}%` }} />
                      <div className="w-3 rounded-t bg-pink-400" style={{ height: `${bar.h3}%` }} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-2">
                  {[['bg-blue-400', 'Users'], ['bg-purple-400', 'Projects'], ['bg-pink-400', 'Tasks']].map(([c, l]) => (
                    <div key={l} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${c}`} />
                      <span className="text-[10px] text-gray-400">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section id="platform" className="py-14 px-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Core Modules</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Everything your team needs</h2>
            <p className="text-gray-500 mt-3 max-w-xl text-base">Six tightly integrated modules, designed to work together — from day-to-day task execution to strategic company oversight.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group border border-gray-200 rounded-2xl p-7 hover:border-gray-300 hover:shadow-lg transition-all duration-200 bg-white hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{f.description}</p>
                <ul className="space-y-2">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-24 px-6 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Role-Based Access Control</p>
            <h2 className="text-4xl font-extrabold text-gray-900">The right access for every role</h2>
            <p className="text-gray-500 mt-3 max-w-xl text-base">Spartans uses a strict three-tier RBAC model. Each role sees exactly the features they need — nothing exposed that shouldn't be.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div key={r.name} className={`bg-white rounded-2xl border-2 ${r.color} p-7 hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{r.name}</h3>
                    <p className="text-sm text-gray-400">{r.tagline}</p>
                  </div>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${r.tagColor}`}>
                    {r.name.split(' ')[0]}
                  </span>
                </div>
                <ul className="space-y-2">
                  {r.perms.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">How It Works</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Up and running in minutes</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register as Super Admin', desc: 'Create your organization account. You immediately get full platform access.' },
              { step: '02', title: 'Invite your Managers', desc: 'Send email invites to team leads. They receive a secure link to set their password and join.' },
              { step: '03', title: 'Managers onboard Employees', desc: 'Managers invite their team members. Employees get task and project access on day one.' },
              { step: '04', title: 'Start managing at scale', desc: 'Create projects, assign tasks, track assets, monitor KPIs — all in one place.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">{s.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to manage smarter?</h2>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Register as a Super Admin, set up your organization, and invite your team — all in under five minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin/signup"
              className="group flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-150 shadow-lg hover:-translate-y-0.5"
            >
              Create Admin Account
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm px-4 py-2">
              Already have an account? Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-gray-400">Spartans Platform</span>
          </div>
          <p className="text-gray-600 text-sm">© 2025 Spartans. Enterprise Performance Management.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/login" className="hover:text-gray-300 transition-colors">Sign In</Link>
            <Link href="/admin/signup" className="hover:text-gray-300 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
