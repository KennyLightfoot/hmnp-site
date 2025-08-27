"use client";

import { Star } from "lucide-react";

export default function Testimonials() {
  return (
    <div className="container mx-auto px-4">
      <h3 className="text-2xl font-bold text-[#002147] mb-6 text-center">What Clients Say</h3>
      <div className="grid md:grid-cols-3 gap-6 text-sm">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-1 mb-2 text-amber-500">
            <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" />
          </div>
          <p className="text-gray-700">“Fast and professional. They came to our office within an hour—will use again.”</p>
          <div className="mt-2 text-xs text-gray-500">— Dana R., Houston</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-1 mb-2 text-amber-500">
            <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" />
          </div>
          <p className="text-gray-700">“Clear pricing, on time, and super courteous. Made notarizing easy.”</p>
          <div className="mt-2 text-xs text-gray-500">— Michael T., Pearland</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-1 mb-2 text-amber-500">
            <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" />
          </div>
          <p className="text-gray-700">“They handled our loan signing flawlessly—great communication throughout.”</p>
          <div className="mt-2 text-xs text-gray-500">— Alicia S., Sugar Land</div>
        </div>
      </div>
    </div>
  );
}
