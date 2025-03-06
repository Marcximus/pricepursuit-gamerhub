
import React from 'react';

const Footer = () => {
  return (
    <div className="bg-gray-50 py-8 text-center">
      <p className="text-gray-600">
        © {new Date().getFullYear()} Laptop Hunter • Made with 💻 for people who love 💻
      </p>
      <p className="text-sm text-gray-400 mt-2">
        P.S. No laptops were harmed in the making of this website. They were all treated ethically and released back into the wild after data collection. 🌿
      </p>
    </div>
  );
};

export default Footer;
