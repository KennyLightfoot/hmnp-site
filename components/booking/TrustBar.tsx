import React from "react";
import { Shield, Star, Award } from "lucide-react";

const TrustBar: React.FC = () => (
  <div className="flex justify-center items-center space-x-6 py-4 text-sm text-gray-600 border-t border-gray-200 bg-gray-50">
    <div className="flex items-center space-x-1">
      <Star className="h-4 w-4 text-yellow-500" />
      <span>4.9★ rating</span>
    </div>
    
    <div className="flex items-center space-x-1">
      <Shield className="h-4 w-4 text-primary" />
      <span>$100K insured</span>
    </div>
    
    <div className="flex items-center space-x-1">
      <Award className="h-4 w-4 text-secondary" />
      <span>TX-licensed</span>
    </div>
  </div>
);

export default TrustBar;