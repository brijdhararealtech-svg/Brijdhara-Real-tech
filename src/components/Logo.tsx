import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, light = false }) => {
  const primaryColor = "#FFFFFF";
  const greenColor = light ? "#4ADE80" : "#FFFFFF";
  const goldColor = "#C5A059";

  return (
    <svg 
      viewBox="0 0 600 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Buildings - Green Silhouettes */}
      <path d="M220 180V120H245V180H220Z" fill={greenColor} />
      <path d="M250 180V90H280V180H250Z" fill={greenColor} />
      <path d="M285 180V110H315V180H285Z" fill={greenColor} />
      
      {/* Windows on buildings */}
      <rect x="228" y="130" width="8" height="2" fill="white" />
      <rect x="228" y="140" width="8" height="2" fill="white" />
      <rect x="228" y="150" width="8" height="2" fill="white" />
      
      <rect x="260" y="105" width="10" height="2" fill="white" />
      <rect x="260" y="115" width="10" height="2" fill="white" />
      <rect x="260" y="125" width="10" height="2" fill="white" />
      <rect x="260" y="135" width="10" height="2" fill="white" />
      <rect x="260" y="145" width="10" height="2" fill="white" />
      
      <rect x="295" y="120" width="12" height="2" fill="white" />
      <rect x="295" y="135" width="12" height="2" fill="white" />
      <rect x="295" y="150" width="12" height="2" fill="white" />

      {/* House Roof - Dark Blue */}
      <path d="M190 220L295 160L410 220" stroke={primaryColor} strokeWidth="8" fill="white" />
      <path d="M200 225H390V235H200V225Z" fill={primaryColor} />
      
      {/* Roof Windows */}
      <rect x="230" y="200" width="15" height="15" fill={greenColor} />
      <rect x="237" y="200" width="1" height="15" fill="white" />
      <rect x="230" y="207" width="15" height="1" fill="white" />
      
      <rect x="350" y="195" width="15" height="15" fill={greenColor} />
      <rect x="357" y="195" width="1" height="15" fill="white" />
      <rect x="350" y="202" width="15" height="1" fill="white" />

      {/* BRIJ DHARA Text */}
      <text x="300" y="290" textAnchor="middle" fill={primaryColor} fontFamily="serif" fontWeight="900" fontSize="72" letterSpacing="2">BRIJ DHARA</text>
      
      {/* Flute (Bansuri) */}
      <rect x="150" y="305" width="300" height="8" rx="4" fill="#8B4513" />
      <circle cx="170" cy="309" r="1.5" fill="#DEB887" />
      <circle cx="190" cy="309" r="1.5" fill="#DEB887" />
      <circle cx="210" cy="309" r="1.5" fill="#DEB887" />
      <circle cx="230" cy="309" r="1.5" fill="#DEB887" />
      <circle cx="250" cy="309" r="1.5" fill="#DEB887" />
      
      {/* Tassels on flute */}
      <rect x="440" y="310" width="2" height="15" fill="#FFD700" />
      <circle cx="441" cy="328" r="3" fill="#B22222" />

      {/* Tagline Cursive */}
      <text x="300" y="335" textAnchor="middle" fill={greenColor} fontFamily="cursive, serif" italic="true" fontSize="20">A land of your dream home</text>
      
      {/* Company Name Gold */}
      <text x="300" y="380" textAnchor="middle" fill={goldColor} fontFamily="sans-serif" fontWeight="900" fontSize="32" letterSpacing="4">BRIJ DHARA REALTECH (PVT) LTD</text>
    </svg>
  );
};
