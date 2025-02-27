"use client";

import React from 'react';
import { useTheme } from 'next-themes'; // Import useTheme from next-themes
import { useTranslations } from 'next-intl'
import Image from 'next/image'


const Footer = () => {
  const t = useTranslations('')
  
  const { theme } = useTheme(); // Use the useTheme hook to get the current theme

  // Determine image source based on 4 themes
  const imageSrc = (() => {
    switch (theme) {
      case 'dark':
      return '/Color=Purple-Glossy.png';
      case 'reddit': // Replace 'theme1' with your actual theme name
        return '/Color=Orange-Glossy.png'; // Replace with your image file name
      case 'facebook': // Replace 'theme2' with your actual theme name
        return '/Color=Blue-Glossy.png'; // Replace with your image file name
      case 'discord': // Replace 'theme2' with your actual theme name
        return '/Color=Blue-Glossy.png'; // Replace with your image file name
      case 'netflix': // Replace 'theme2' with your actual theme name
        return '/Color=Orange-Glossy.png'; // Replace with your image file name
      case 'light': // Explicitly handle 'light' theme for clarity, though it's the default
      default:
        return '/Color=White-Matte.png'; // Default to white matte for light or unknown themes
    }
  })();
  return (
    <footer className="bg-gradient-to-r from-background to-background-secondary py-14 ">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-8 relative">
        {/* Company Info */}
        <div className="md:col-span-1">
          <div className='absolute bottom-0 left-0 w-[300px] h-[300px] max-lg:w-[200px] max-lg:h-[200px] animate-float-up-down p-4'> {/* Thêm class animate-float-up-down */}
            <Image
              src={imageSrc}
              alt='Background image'
              layout='responsive'
              width={300}
              height={300}
              objectFit='contain'
              className='object-contain'
            />
          </div>
        </div>

        {/* Follow Us */}
        <div className="md:col-span-1">
          <h4 className=" uppercase font-bold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" className="bg-white  rounded-full p-2 hover:opacity-80">
              {/* Facebook SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-5 h-5 fill-current">
                <path d="M279.14 288l14.22-92.66h-88.91v-62.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
              </svg>
            </a>
            <a href="#" className="bg-white  rounded-full p-2 hover:opacity-80">
              {/* Twitter SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 fill-current">
                <path d="M459.37 151.716c.243 45.487-6.525 86.84-19.546 117.714-13.02 30.873-31.992 56.848-56.848 78.675-24.856 21.829-53.464 39.983-86.055 53.224-32.592 13.242-67.679 22.887-105.325 28.898-37.646 6.011-75.84 9.34-113.714 9.34-27.58 0-53.247-4.104-78.2-12.167C28.77 438.505 8 405.138 8 368.576c0-18.524 1.722-35.979 5.096-52.383C13.127 306.382 22.672 291.057 35.792 278.62c13.12-12.436 29.435-22.754 48.334-29.523 18.898-6.769 39.606-11.403 61.044-14.028 21.438-2.625 43.495-4.057 66.52-4.057 47.58 0 89.986 10.227 122.776 28.72C403.56 179.37 447.932 163.772 459.37 151.716zM48.04 368.576c0 18.36-1.857 34.83-5.447 50.199-3.589 15.369-9.441 28.059-17.453 38.556C21.802 464.21 14.482 470.42 8.39 474.042c-6.093 3.622-12.605 5.979-19.488 7.223C-11.85 499.62 14.813 512 56 512c29.215 0 56.952-5.863 81.928-16.498 24.976-10.635 46.367-25.977 63.973-45.602 17.606-19.625 31.58-42.783 41.586-68.921 10.006-26.137 16.932-54.351 20.531-84.211 3.598-29.859 3.922-60.676.094-91.346-3.828-30.67-12.528-59.352-25.854-85.272-13.326-25.92-30.496-49.473-50.639-69.399-20.143-19.926-43.752-36.412-70.183-48.072-26.431-11.66-55.965-19.757-86.701-24.074-30.736-4.317-61.833-6.575-92.964-6.575-17.29 0-34.59.878-51.463 2.602C17.872 157.608 31.225 169.773 42.995 183.159c11.77 13.386 21.351 28.272 28.483 44.169 7.132 15.897 11.847 32.93 13.894 50.247 2.047 17.317 1.289 35.01-.23 52.75-1.52 17.74-5.432 34.882-11.596 51.063-6.164 16.181-14.482 31.491-24.806 45.495-10.324 14.004-22.623 26.974-36.597 38.516-13.974 11.542-29.447 21.703-46.194 29.218-16.746 7.515-34.814 13.074-53.73 16.343-18.916 3.269-38.394 4.008-57.945 2.18-19.552-1.827-38.961-6.375-57.872-13.592-18.911-7.217-37.164-16.91-54.446-29.114-17.282-12.204-33.562-26.624-48.52-42.939-14.957-16.315-28.454-34.343-39.172-53.418-10.718-19.075-18.772-39.29-23.95-60.245-5.177-20.955-7.484-42.842-6.621-64.589.863-21.747 4.447-43.49 10.516-64.293 6.069-20.803 14.638-40.209 25.425-57.894 10.787-17.685 23.564-33.261 37.915-46.347 14.352-13.086 30.235-24.318 47.294-33.372 17.059-9.054 35.14-16.871 53.845-23.164 18.705-6.293 37.952-11.007 57.536-14.07 19.584-3.063 39.493-4.44 59.392-4.037 20.07.41 40.108 1.953 59.794 4.557 19.687 2.603 39.082 6.269 57.898 10.942 18.817 4.673 37.024 10.327 54.304 16.828 17.28 6.501 33.659 13.83 49.003 21.839 15.344 8.009 29.688 16.694 42.864 25.963 13.176 9.269 24.99 19.128 35.223 29.447 10.232 10.319 18.89 21.052 25.74 32.066 6.849 11.014 11.835 22.392 14.72 33.995 2.886 11.603 4.637 23.383 5.152 35.203.515 11.82 0 23.707-1.544 35.457-1.544 11.75-4.14 23.387-7.747 34.82-3.607 11.433-8.134 22.58-13.559 33.311-5.425 10.732-11.722 20.912-18.74 30.453-7.018 9.541-14.707 18.42-23.015 26.504-8.308 8.084-17.242 15.365-26.734 21.775-9.492 6.41-19.516 11.82-29.922 16.194-10.406 4.374-21.14 7.812-32.008 10.234-10.868 2.422-21.893 3.83-32.928 4.221-11.035.391-22.107.068-33.128-.943C137.683 488.093 119.952 488.695 102.34 488.695 84.727 488.695 67.016 488.082 49.344 486.859 31.673 485.636 14.014 483.613 8 480.764c-6.014-2.849-11.531-6.256-16.392-10.154-4.86-3.898-8.98-8.315-12.212-13.124-3.232-4.809-5.577-10.037-6.909-15.59-1.332-5.553-1.732-11.291-1.2-17.059.532-5.768 1.971-11.484 4.235-17.009 2.264-5.525 5.32-10.813 9.053-15.807 3.734-4.994 8.115-9.643 13.011-13.892 4.896-4.249 10.306-8.004 16.13-11.172 5.824-3.168 12.032-5.737 18.51-7.588 6.478-1.851 13.19-2.975 20.002-3.335 6.812-.36 13.716-.043 20.604.866 6.888.909 13.728 2.824 20.422 5.691 6.694 2.867 13.225 6.732 19.454 11.447 6.229 4.715 12.126 10.225 17.563 16.469 5.437 6.244 10.393 13.192 14.716 20.701 4.323 7.509 8.004 15.59 10.933 24.113 2.929 8.523 5.072 17.44 6.342 26.677 1.27 9.237 1.672 18.636 1.183 28.079-.489 9.443-2.141 18.796-4.743 27.985-2.602 9.189-6.14 18.18-10.426 26.858-4.286 8.678-9.282 17.015-14.901 24.966-5.619 7.951-11.847 15.42-18.621 22.363-6.774 6.943-14.104 13.301-21.934 19.032-7.83 5.731-16.132 10.842-24.821 15.224-8.689 4.382-17.742 8.012-27.003 10.833-9.261 2.821-18.706 4.894-28.203 6.145-9.497 1.251-19.095 1.66-28.633 1.218C171.53 490.184 153.798 489.582 136.186 488.576c-17.612-1.006-35.323-2.309-53.037-3.901-17.714-1.592-35.313-3.479-52.782-5.635-17.469-2.156-34.795-4.572-51.862-7.223-17.067-2.651-33.87-5.527-50.309-8.598-16.439-3.071-32.595-6.327-48.356-9.734C53.959 413.341 48.04 391.457 48.04 368.576z"/>
              </svg>
            </a>
            <a href="#" className="bg-white  rounded-full p-2 hover:opacity-80">
              {/* Instagram SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current">
                <path d="M224 309.3c-36.2 0-65.7-29.4-65.7-65.7 0-36.2 29.4-65.7 65.7-65.7 36.2 0 65.7 29.4 65.7 65.7 0 36.2-29.5 65.7-65.7 65.7zm-106.3-11.3c-22.2 0-40.2-17.9-40.2-40.2 0-22.2 17.9-40.2 40.2-40.2 22.2 0 40.2 17.9 40.2 40.2 0 22.3-18 40.2-40.2 40.2zm193.4 22.2c-22.2 0-40.2-17.9-40.2-40.2 0-22.2 17.9-40.2 40.2-40.2 22.2 0 40.2 17.9 40.2 40.2 0 22.2-17.9 40.2-40.2 40.2zM448 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48zm-135.2 178.3c0 33.4-27.1 60.5-60.5 60.5-33.4 0-60.5-27.1-60.5-60.5 0-33.4 27.1-60.5 60.5-60.5 33.4 0 60.5 27.1 60.5 60.5zm93.7-21.5c0-9.7-7.8-17.5-17.5-17.5-9.7 0-17.5 7.8-17.5 17.5 0 9.7 7.8 17.5 17.5 17.5 9.7 0 17.5-7.8 17.5-17.5zM400 112c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h320c8.8 0 16 7.2 16 16v48z"/>
              </svg>
            </a>
            <a href="#" className="bg-white  rounded-full p-2 hover:opacity-80">
              {/* LinkedIn SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current">
                <path d="M416 32H32A32 32 0 0 0 0 64v384a32 32 0 0 0 32 32h384a32 32 0 0 0 32-32V64a32 32 0 0 0-32-32zm-288 384V212.2h-67.1V416H128zM190.7 101.2c-24.8 0-39.9 17.1-39.9 40.5 0 23.1 14.6 40.5 39.4 40.5 24.9 0 39.9-17.4 39.9-40.5 0-23.4-15-40.5-40-40.5zM416 416H272.7V295.9c0-24.1-8.9-40.8-25.2-40.8-17.3 0-29.4 17.7-29.4 40.8V416H160V212.2h67.1v30.4c8.3-12.9 21.3-31 49.2-31 46.9 0 72.9 32.4 72.9 102.8V416z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-1">
          <h4 className=" uppercase font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-text-secondary text-sm">Author Services</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Contact</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Frequently Asked Questions</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Journal Publication</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Upcoming Conferences</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Popular Topics */}
        <div className="md:col-span-1">
          <h4 className=" uppercase font-bold mb-4">Popular Topics</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-text-secondary text-sm">Business</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Banking and Economics</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Engineering</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Education</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Health</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Medical</a></li>
          </ul>
        </div>

        {/* Popular Countries */}
        <div className="md:col-span-1">
          <h4 className=" uppercase font-bold mb-4">Popular Countries</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-text-secondary text-sm">Australia</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Canada</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">Germany</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">India</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">United States</a></li>
            <li><a href="#" className="hover:text-text-secondary text-sm">United Kingdom</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 border-t border-text-secondary pt-8">
        <p className="text-center text-sm">Copyrights © 2025. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;