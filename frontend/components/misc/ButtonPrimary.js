import React from "react";
import Link from "next/link";

const ButtonPrimary = ({ children, addClass, href }) => {
  return (
    <Link href={href} legacyBehavior>
      <a
        className={
          "py-3 lg:py-4 px-12 lg:px-16 text-white-500 font-semibold rounded-lg bg-orange-500 hover:shadow-orange-md transition-all outline-none " +
          addClass
        }
      >
        {children}
      </a>
    </Link>
  );
};

export default ButtonPrimary;
