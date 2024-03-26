import React from "react";

const CtaButton = ({ text, onClick }) => {
    return (
      // Add a max-width class and mx-auto for centering the button container
      <div className="flex items-center justify-center bg-black-600 py-3 px-12 rounded-full mx-auto max-w-xl">
        <p className="text-white-500 font-bold text-lg mr-4">{text}</p>
        <button
          onClick={onClick}
          className="bg-red-500 text-white font-bold py-2 px-6 rounded-full hover:bg-red-600 transition duration-300"
        >
          Start Now
        </button>
      </div>
    );
};

export default CtaButton;
