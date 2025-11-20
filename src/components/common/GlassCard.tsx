import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return (
    <div
      className={`backdrop-blur-md bg-white/10 border border-white/20 shadow-lg rounded-2xl p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
