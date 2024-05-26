import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import placeholderLogo from '../../public/assets/logo-red.png';
import Facebook from "../../public/assets/Icon/facebook.svg";
import Twitter from "../../public/assets/Icon/twitter.svg";
import Instagram from "../../public/assets/Icon/instagram.svg";
import { Link as LinkScroll } from "react-scroll";

const Footer = () => {
  const [activeLink, setActiveLink] = useState(null);
  const [scrollActive, setScrollActive] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScrollActive(window.scrollY > 20);
    });
  }, []);

  return (
    <div className="bg-white-300 pt-44 pb-24">
      <div className="max-w-screen-xl w-full mx-auto px-6 sm:px-8 lg:px-16 grid grid-rows-6 sm:grid-rows-1 grid-flow-row sm:grid-flow-col grid-cols-3 sm:grid-cols-12 gap-4">
        <div className="row-span-2 sm:col-span-4 col-start-1 col-end-4 sm:col-end-5 flex flex-col items-start ">
          <Image src={placeholderLogo} alt="Logo" width={80} height={32} />
          <p className="mb-4">
            <strong className="font-medium">Podcast Agent</strong> is an AI agent that generates weekly newsletters summarising whatever podcasts you choose. Customize and never miss a beat.
          </p>
          <div className="flex w-full mt-2 mb-8 -mx-2">
            <div className="mx-2 bg-white-500 rounded-full items-center justify-center flex p-2 shadow-md">
              <Twitter className="h-6 w-6" />
            </div>
          </div>
          <p className="text-gray-400">©{new Date().getFullYear()} - Agents Newsletters</p>
        </div>
        <div className="row-span-2 sm:col-span-2 sm:col-start-9 sm:col-end-11 flex flex-col">
          <p className="text-black-600 mb-4 font-medium text-lg">Engage</p>
          <ul className="text-black-500">
            <li className="my-2 hover:text-orange-500 cursor-pointer transition-all">
              <Link href="/faq">FAQ</Link>
            </li>
            <li className="my-2 hover:text-orange-500 cursor-pointer transition-all">
              <Link href="/privacy_policy">Privacy Policy</Link>
            </li>
            <li className="my-2 hover:text-orange-500 cursor-pointer transition-all">
              <Link href="/terms_of_service">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Footer;
