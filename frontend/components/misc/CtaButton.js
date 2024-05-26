import React from "react";

const CtaButton = ({ text, href }) => {
  return (
    // Add a max-width class and mx-auto for centering the button container
    <div className="flex items-center justify-center bg-black-600 py-3 px-12 rounded-full mx-auto max-w-xl">
      <p className="text-white-500 font-bold text-lg mr-4">{text}</p>
      <a
        href={href}
        className="bg-red-500 text-white-500 font-bold py-2 px-6 rounded-full hover:bg-red-600 transition duration-300"
      >
        Start Now
      </a>
    </div>
  );
};

export default CtaButton;
