'use client';

import React from 'react';
import { useTranslation } from "react-i18next";
import NextImage from "next/image";
import Link from "next/link";

const Footer = () => {
  const goToPrivacyPolicy = () => {
      window.location.href = `/privacyPolicy`;
    };

  const goToTermsConditions = () => {
      window.location.href = `/termsConditions`;
    };

  const goToAbout = () => {
      window.location.href = `/about`;
    };

  const { t } = useTranslation();

  return (
    <footer className="relative bg-black text-white py-10 overflow-hidden z-12 w-full flex flex-col items-center justify-center">
      {/* Marca de agua de fondo */}
      <NextImage
        src="/images/white-logo-cillan.webp"
        alt="Cillan"
        width={1600}
        height={900}
        className="absolute inset-0 m-auto w-[500px] md:w-[100%] opacity-5 pointer-events-none select-none"
      />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-4xl px-6 pt-16 pb-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-48 mx-auto">
        {/* Enlaces */}
        <div className="flex flex-col items-start md:items-start space-y-2 text-sm sm:text-left md:text-left">
          <Link href="#" onClick={() => goToAbout()} className="hover:underline">{t("navbar.about")}</Link>
          <Link href="https://www.instagram.com/sergio.cillan?igsh=MXkxNngwMjZkZXU1dQ==" target="_blank" rel="noopener noreferrer" className="hover:underline">instagram</Link>
          <Link href="#" onClick={() => goToTermsConditions()} className="hover:underline">{t("general.terms_conditions")}</Link>
          <Link href="#" onClick={() => goToPrivacyPolicy()} className="hover:underline">{t("bag.privacy_policy")}</Link>
        </div>

        <div className="flex flex-col items-center md:items-start space-y-8"></div>

        {/* Signup */}
        <div className="flex flex-col items-end text-right space-y-4 w-full">
          <h3 className="text-sm uppercase tracking-wide">Sign-up</h3>
          <input
            type="email"
            placeholder="Enter your Email"
            className="px-4 py-2 bg-white text-black rounded-md text-base focus:outline-none w-auto min-w-[175px] max-w-fit text-right"
          />
          <label className="text-xs flex items-center space-x-2 w-full justify-end">
            <input type="checkbox" className="w-4 h-4" />
            <span className='w-auto min-w-[175px] max-w-fit ml-4 text-right'>
              I agree to receive email updates and have read the Privacy Policy
            </span>
          </label>
          <button className="text-black px-6 py-2 bg-white border border-black rounded-md font-semibold hover:bg-black hover:text-white transition">
            SIGN UP
          </button>
        </div>
      </div>

      {/* Créditos */}
      <div className="absolute bottom-4 right-4 z-20 flex items-end">
        <Link href="https://www.linkedin.com/in/juan-luis-bertoncini-ferreras/" target="_blank" rel="noopener noreferrer">
          <NextImage
            src="/images/white-logo.webp"
            alt="Logo Créditos"
            width={500}
            height={181}
            className="w-24 h-auto object-contain"
          />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;