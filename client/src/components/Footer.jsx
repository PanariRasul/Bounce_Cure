import React, { useState } from "react";
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaGithub, FaYoutube } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { GoHeartFill } from "react-icons/go";

const Footer = () => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  // Scroll to top handler for selected links
  const handleNavClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="">
      <style>{`
        @keyframes float {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(5px, -5px);
          }
          50% {
            transform: translate(10px, 5px);
          }
          75% {
            transform: translate(-5px, 10px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        
        .floating-particle {
          animation: float 6s ease-in-out infinite;
        }
        
        .floating-particle:nth-child(odd) {
          animation-direction: alternate-reverse;
        }
        
        .floating-particle:nth-child(3n) {
          animation-duration: 8s;
        }
        
        .floating-particle:nth-child(4n) {
          animation-duration: 10s;
        }
        
        .floating-particle:nth-child(5n) {
          animation-duration: 12s;
        }
      `}</style>
      
      <footer className="relative bg-black text-white overflow-hidden">
        {/* Floating particles - Full footer */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-particle absolute top-[5%] left-[10%] w-2 h-2 bg-white rounded-full opacity-40"></div>
          <div
            className="floating-particle absolute top-[15%] right-[15%] w-1.5 h-1.5 bg-white rounded-full opacity-60"
            style={{ animationDelay: "1.2s" }}
          ></div>
          <div
            className="floating-particle absolute top-[25%] left-[25%] w-1 h-1 bg-white rounded-full opacity-30"
            style={{ animationDelay: "2.5s" }}
          ></div>
          <div
            className="floating-particle absolute top-[35%] right-[33%] w-2 h-2 bg-white rounded-full opacity-50"
            style={{ animationDelay: "0.8s" }}
          ></div>
          <div
            className="floating-particle absolute top-[45%] left-[50%] w-1.5 h-1.5 bg-white rounded-full opacity-40"
            style={{ animationDelay: "1.8s" }}
          ></div>
          <div
            className="floating-particle absolute top-[55%] left-[75%] w-2 h-2 bg-white rounded-full opacity-35"
            style={{ animationDelay: "3s" }}
          ></div>
          <div
            className="floating-particle absolute top-[65%] right-[20%] w-1 h-1 bg-white rounded-full opacity-45"
            style={{ animationDelay: "2.2s" }}
          ></div>
          <div
            className="floating-particle absolute top-[75%] left-[20%] w-1 h-1 bg-white rounded-full opacity-45"
            style={{ animationDelay: "2.2s" }}
          ></div>
          <div
            className="floating-particle absolute top-[85%] right-[25%] w-1.5 h-1.5 bg-white rounded-full opacity-50"
            style={{ animationDelay: "3.5s" }}
          ></div>
          <div
            className="floating-particle absolute top-[95%] left-[66%] w-2 h-2 bg-white rounded-full opacity-30"
            style={{ animationDelay: "4s" }}
          ></div>
          
          {/* Additional particles for better coverage */}
          <div
            className="floating-particle absolute top-[10%] left-[80%] w-1.5 h-1.5 bg-white rounded-full opacity-40"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="floating-particle absolute top-[30%] right-[40%] w-1 h-1 bg-white rounded-full opacity-35"
            style={{ animationDelay: "2.8s" }}
          ></div>
          <div
            className="floating-particle absolute top-[50%] left-[15%] w-2 h-2 bg-white rounded-full opacity-45"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="floating-particle absolute top-[70%] right-[10%] w-1.5 h-1.5 bg-white rounded-full opacity-30"
            style={{ animationDelay: "3.2s" }}
          ></div>
          <div
            className="floating-particle absolute top-[90%] left-[40%] w-1 h-1 bg-white rounded-full opacity-50"
            style={{ animationDelay: "1.9s" }}
          ></div>
        </div>

        {/* Footer Content */}
        <div className="relative z-20 px-8 py-20">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-46 h-16 rounded-full mb-4 hover:scale-110 transition-transform duration-300">
              <img src="../rasul-1.png" alt="Icon" className="object-contain" />
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center space-x-6 mb-12">
            {[
              { href: "https://x.com/BounceCure", icon: <FaTwitter size={24} /> },
              { href: "https://www.facebook.com/BounceCure", icon: <FaFacebookF size={24} /> },
              { href: "https://www.linkedin.com/in/bounce-cure-aa4936390/", icon: <FaLinkedinIn size={24} /> },
              { href: "https://www.youtube.com/@bouncecure", icon: <FaYoutube size={24} /> },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                target="_blank"              // ✅ opens in a new tab
                rel="noopener noreferrer"   // ✅ security best practice
                className="group relative bg-white text-black rounded-full p-4 transition-all duration-500 
                          hover:scale-110 hover:rotate-12 backdrop-blur-sm hover:bg-[#bd7a0f] hover:text-white"
              >
                {item.icon}
                <div className="absolute inset-0 rounded-full bg-[#bd7a0f] scale-0 group-hover:scale-90 
                                transition-transform duration-300 -z-10"></div>
              </a>
            ))}
          </div>


          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-8 text-lg ">
            {[
              { label: "Home", path: "/" },
              { label: "About", path: "/about" },
              { label: "Integrations", path: "/services/integrations" },
              { label: "FAQ", path: "/faq" },
              { label: "Contact", path: "/contact" },
              { label: "Terms&Conditions", path: "/terms-and-conditions", scrollTop: true },
              { label: "Refund Policy", path: "/refund-policy", scrollTop: true },
              { label: "Privacy Policy", path: "/privacy-policy", scrollTop: true },
            ].map(({ label, path, scrollTop }) => (
              <button
                key={label}
                onClick={() =>
                  scrollTop ? handleNavClick(path) : navigate(path)
                }
                className="relative group font-medium hover:text-gray-300 transition-all duration-300 cursor-pointer"
              >
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#bd7a0f] group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-8"></div>

          {/* Copyright */}
          <div className="text-center text-white text-sm tracking-wide">
            ©{new Date().getFullYear()} Bounce Cure | All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;