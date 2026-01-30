'use client';

import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import NextImage from "next/image";
import Link from "next/link";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');
  const [errors, setErrors] = useState({ email: '', comments: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToPrivacyPolicy = () => {
      window.location.href = `/privacyPolicy`;
    };

  const goToTermsConditions = () => {
      window.location.href = `/termsConditions`;
    };

  const goToLegalNotice = () => {
      window.location.href = `/legalNotice`;
    };

  const goToCookiesPolicy = () => {
      window.location.href = `/cookiesPolicy`;
    };

  const goToAbout = () => {
      window.location.href = `/about`;
    };

  const { t } = useTranslation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    const newErrors = { email: '', comments: '' };
    let isValid = true;

    // Validar email
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'El email no es válido';
      isValid = false;
    }

    // Validar comentarios
    if (!comments.trim()) {
      newErrors.comments = 'Los comentarios son obligatorios';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';
      const response = await fetch(`${strapiUrl}/api/contact/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: email,
          comments: comments,
        }),
      });

      if (response.ok) {
        alert('Mensaje enviado correctamente');
        setEmail('');
        setComments('');
        setErrors({ email: '', comments: '' });
      } else {
        alert('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-black text-white py-10 overflow-hidden z-[12] w-full flex flex-col items-center justify-center">
      {/* Marca de agua de fondo */}
      <NextImage
        src="/images/white-logo-cillan.webp"
        alt="Cillan"
        width={1600}
        height={900}
        className="absolute inset-0 m-auto w-[500px] md:w-[100%] opacity-5 pointer-events-none select-none"
      />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-6xl px-6 pt-8 pb-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-48 mx-auto">
        {/* Enlaces */}
        <div className="flex flex-col items-center md:items-start space-y-2 text-sm text-center md:text-left">
          <Link href="#" onClick={() => goToAbout()} className="hover:underline">{t("navbar.about")}</Link>
          <Link href="https://www.instagram.com/sergio.cillan?igsh=MXkxNngwMjZkZXU1dQ==" target="_blank" rel="noopener noreferrer" className="hover:underline">instagram</Link>
          <Link href="#" onClick={() => goToLegalNotice()} className="hover:underline">{t("general.legal_notice")}</Link>
          <Link href="#" onClick={() => goToCookiesPolicy()} className="hover:underline">{t("general.cookies_policy")}</Link>
          <Link href="#" onClick={() => goToPrivacyPolicy()} className="hover:underline">{t("bag.privacy_policy")}</Link>
          <Link href="#" onClick={() => goToTermsConditions()} className="hover:underline">{t("general.terms_conditions")}</Link> 
          <p>{t("general.contact")}: cillan.world@gmail.com</p>
        </div>
    
        {/* Signup */}
        <div className="flex flex-col items-end text-right space-y-2 w-full">
          <h3 className="text-m tracking-wide">{t("footer.title")}</h3>
          <div className="w-full">
            <textarea
              placeholder={t("footer.email")}
              rows={1}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`px-4 py-2 bg-white text-black rounded-md text-base focus:outline-none w-full resize-none ${errors.email ? 'border-2 border-red-500' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 text-right">{errors.email}</p>}
          </div>
          <div className="w-full">
            <textarea
              placeholder={t("footer.comments")}
              rows={6}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className={`px-4 py-2 bg-white text-black rounded-md text-base focus:outline-none w-full resize-none ${errors.comments ? 'border-2 border-red-500' : ''}`}
            />
            {errors.comments && <p className="text-red-500 text-xs mt-1 text-right">{errors.comments}</p>}
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-black px-6 py-2 bg-white border border-black rounded-md font-semibold hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Enviando...' : t("footer.send")}
          </button>
        </div>
      </div>

      {/* Créditos */}
      <div className="absolute bottom-4 left-4 z-20 flex items-end max-w-56">
        <p className='flex flex-col items-start md:items-start space-y-2 text-xs sm:text-left md:text-left'>
          © {new Date().getFullYear()} Cillan World. {t("general.rights_reserved")}
        </p>
      </div>
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
