'use client'

import Link from 'next/link'
import {
  Wallet,
  Receipt,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
} from 'lucide-react'

export default function Home() {
  return (
    <div className='min-h-screen bg-slate-50/60 text-slate-900 overflow-x-hidden antialiased'>
      {/* Decorative Blur Background Accents */}
      <div className='absolute top-0 left-1/2 -z-10 h-[600px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent blur-3xl pointer-events-none' />

      {/* --- Top Navigation Bar --- */}
      <header className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-slate-200/40 backdrop-blur-md sticky top-0 z-50'>
        <div className='flex items-center gap-2.5 select-none'>
          <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center font-bold text-white shadow-sm shadow-emerald-200/80 ring-1 ring-emerald-600/10'>
            B
          </div>
          <div className='flex flex-col'>
            <span className='font-bold text-sm tracking-tight text-slate-900 leading-none mb-0.5'>
              bargeldsucher
            </span>
            <span className='text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none'>
              Cash Engine
            </span>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <Link
            href='/login'
            className='text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2'
          >
            Sign In
          </Link>
          <Link
            href='/login'
            className='inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98]'
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* --- Section 1: Hero Splat Layout --- */}
      <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center lg:pt-28'>
        <div className='mx-auto max-w-3xl space-y-6'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/30 shadow-sm'>
            <Zap className='h-3 w-3 text-emerald-600 fill-emerald-600' />
            Enterprise-Grade Cash Tracking for Errands
          </span>

          <h1 className='text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl !leading-[1.15]'>
            Stop losing track of your{' '}
            <span className='bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'>
              operational cash outflow
            </span>
          </h1>

          <p className='mx-auto max-w-2xl text-base md:text-lg text-slate-500 font-medium leading-relaxed'>
            Bargeldsucher streamlines running errand budgets, tracks distributed
            fluid funding, maps instant electronic receipt trails, and generates
            real-time auditing insights.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 pt-4'>
            <Link
              href='/dashboard'
              className='group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98]'
            >
              <span>Access Your Dashboard</span>
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </Link>
            <Link
              href='#features'
              className='w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors'
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* --- Section 2: Core Bento Feature Grid --- */}
        <section
          id='features'
          className='mt-24 lg:mt-32 pt-12 border-t border-slate-200/60'
        >
          <div className='text-center max-w-2xl mx-auto mb-16 space-y-2'>
            <h2 className='text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl'>
              Engineered to bypass spreadsheet chaos
            </h2>
            <p className='text-sm text-slate-400 font-medium'>
              A single unified ecosystem built to process volatile field
              expenses cleanly.
            </p>
          </div>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left'>
            {/* Box 1 */}
            <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 hover:border-slate-300 transition-colors duration-200 flex flex-col justify-between group'>
              <div className='space-y-4'>
                <div className='inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600 border border-emerald-100/50 group-hover:scale-105 transition-transform duration-200'>
                  <Wallet className='h-5 w-5' />
                </div>
                <h3 className='text-lg font-bold text-slate-900'>
                  Errand Allocation Control
                </h3>
                <p className='text-sm text-slate-500 leading-relaxed font-medium'>
                  Isolate capital into specialized errand containers. Set firm
                  allocation caps before funds ever touch the field to mitigate
                  systemic financial leakages.
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 hover:border-slate-300 transition-colors duration-200 flex flex-col justify-between group'>
              <div className='space-y-4'>
                <div className='inline-flex rounded-xl bg-rose-50 p-3 text-rose-600 border border-rose-100/50 group-hover:scale-105 transition-transform duration-200'>
                  <Receipt className='h-5 w-5' />
                </div>
                <h3 className='text-lg font-bold text-slate-900'>
                  Instant Outflow Logging
                </h3>
                <p className='text-sm text-slate-500 leading-relaxed font-medium'>
                  Log specific line-item expenses right down to the vendor name,
                  exact dates, and micro-descriptions using our lightning-fast
                  desktop or mobile floating inputs.
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 hover:border-slate-300 transition-colors duration-200 flex flex-col justify-between group sm:col-span-2 lg:col-span-1'>
              <div className='space-y-4'>
                <div className='inline-flex rounded-xl bg-blue-50 p-3 text-blue-600 border border-blue-100/50 group-hover:scale-105 transition-transform duration-200'>
                  <TrendingUp className='h-5 w-5' />
                </div>
                <h3 className='text-lg font-bold text-slate-900'>
                  Automated Core Insights
                </h3>
                <p className='text-sm text-slate-500 leading-relaxed font-medium'>
                  Watch advanced, multi-color reactive consumption engines
                  process thresholds. Automatically isolates your peak expense
                  weights and flags pending actions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Section 3: Metric Credibility Callout Banner --- */}
        <section className='mt-24 lg:mt-32 rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-900 to-slate-950 p-8 md:p-12 text-left relative overflow-hidden shadow-xl'>
          {/* Subtle graphical background flare inside callout banner */}
          <div className='absolute right-0 bottom-0 top-0 w-96 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent blur-2xl pointer-events-none' />

          <div className='max-w-xl space-y-6 relative z-10'>
            <h2 className='text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl !leading-tight'>
              Ready to institutionalize your petty cash auditing flows?
            </h2>
            <p className='text-sm md:text-base text-slate-400 font-medium leading-relaxed'>
              Say goodbye to missing physical receipt slips, unvouched
              expenditures, and exhausting month-end spreadsheets. Experience a
              secure, database-backed tracking engine built for continuous
              scale.
            </p>
            <div className='flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs md:text-sm text-slate-300 font-semibold'>
              <span className='flex items-center gap-1.5'>
                <CheckCircle2 className='h-4 w-4 text-emerald-400' /> Postgres
                Relational Mapping
              </span>
              <span className='flex items-center gap-1.5'>
                <ShieldCheck className='h-4 w-4 text-emerald-400' /> Secure
                NextAuth Hooks
              </span>
              <span className='flex items-center gap-1.5'>
                <Layers className='h-4 w-4 text-emerald-400' /> Server Action
                Architecture
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer Signature Block --- */}
      <footer className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium select-none'>
        <div className='flex items-center gap-2'>
          <span className='font-bold text-slate-700'>bargeldsucher</span>
          <span>© 2026 Cash Engine Inc. All rights reserved.</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
          <span>System Status: v1.0.0 Stable Build Deployment</span>
        </div>
      </footer>
    </div>
  )
}
