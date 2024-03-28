import React from "react";
import Link from 'next/link';

const ButtonOutline = ({ children, href, className, buttonType = "button", style }) => {
  // If `href` is provided, we'll use Link, otherwise, it's a regular button
  return href ? (
    <Link href={href} passHref legacyBehavior>
      <a
        style={style}
        className={`inline-block font-medium tracking-wide py-2 px-5 sm:px-8 border border-orange-500 text-orange-500 bg-white-500 outline-none rounded-full capitalize hover:bg-orange-500 hover:text-white-500 transition-all hover:shadow-orange text-center ${className}`}
      >
        {children}
      </a>
    </Link>
  ) : (
    <button
      type={buttonType} // can be "button", "submit", etc.
      style={style}
      className={`inline-block font-medium tracking-wide py-2 px-5 sm:px-8 border border-orange-500 text-orange-500 bg-white-500 outline-none rounded-full capitalize hover:bg-orange-500 hover:text-white-500 transition-all hover:shadow-orange text-center ${className}`}
      >
      {children}
    </button>
  );
};

export default ButtonOutline;