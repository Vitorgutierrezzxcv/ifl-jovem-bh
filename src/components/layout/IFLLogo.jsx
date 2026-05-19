import React from "react";

export default function IFLLogo({ size = 32, className = "" }) {
  return (
    <img
      src="https://media.base44.com/images/public/6a0b57f13c4a250612768cd9/c299c4be3_573701454_18394071325120339_697112218739004400_n2.jpg"
      alt="IFL Logo"
      width={size}
      height={size}
      className={`rounded-lg object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}