"use client";

import { Plane, Compass, FileText, Database } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-10 border-b border-tsa-border/60 runway-grid-pattern">
      {/* Subtle Aviation Background Gradient Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-tsa-accent/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Extremely Subtle Static World Map Outline Overlay (12% Opacity) */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none bg-center bg-no-repeat bg-contain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500' fill='%234DA3FF'%3E%3Cpath d='M150 150 Q 200 100, 300 120 T 450 200 T 600 150 T 850 180 T 900 300 T 700 400 T 500 350 T 300 420 T 100 300 Z' opacity='0.3'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Top Aviation Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tsa-surface border border-tsa-accent/30 text-tsa-accent text-xs font-semibold tracking-wider uppercase shadow-sm mb-6">
            <Plane className="w-3.5 h-3.5 text-tsa-accent" />
            <span>Research & Enterprise Intelligence Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-tsa-text leading-tight mb-4">
            ✈️ TSA Lost & Found Pattern Analysis
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-tsa-muted max-w-2xl font-normal leading-relaxed mb-8">
            Interactive analytics platform for exploring historical TSA airport claim patterns across the United States.
          </p>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
            <div className="p-4 rounded-xl bg-tsa-surface/80 border border-tsa-border/80 text-left shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-tsa-muted text-xs mb-1">
                <Database className="w-3.5 h-3.5 text-tsa-accent" />
                <span>Dataset Scale</span>
              </div>
              <p className="text-lg font-bold text-tsa-text">218,489 Records</p>
            </div>

            <div className="p-4 rounded-xl bg-tsa-surface/80 border border-tsa-border/80 text-left shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-tsa-muted text-xs mb-1">
                <Plane className="w-3.5 h-3.5 text-tsa-accent" />
                <span>Airports Covered</span>
              </div>
              <p className="text-lg font-bold text-tsa-text">470 U.S. Airports</p>
            </div>

            <div className="p-4 rounded-xl bg-tsa-surface/80 border border-tsa-border/80 text-left shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-tsa-muted text-xs mb-1">
                <Compass className="w-3.5 h-3.5 text-tsa-accent" />
                <span>Geographic Scope</span>
              </div>
              <p className="text-lg font-bold text-tsa-text">56 States & Terr.</p>
            </div>

            <div className="p-4 rounded-xl bg-tsa-surface/80 border border-tsa-border/80 text-left shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-tsa-muted text-xs mb-1">
                <FileText className="w-3.5 h-3.5 text-tsa-accent" />
                <span>Historical Span</span>
              </div>
              <p className="text-lg font-bold text-tsa-text">2002 – 2017</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
