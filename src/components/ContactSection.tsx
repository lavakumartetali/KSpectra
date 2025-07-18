import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, ExternalLink } from 'lucide-react';

const ContactSection: React.FC = () => {
  const contactLinks = [
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:lavakumartetali@gmail.com',
      text: 'lavakumartetali@gmail.com'
    },
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/lavakumartetali',
      text: 'github.com/lavakumartetali'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/lava-kumar-reddy-tetali-30829b1a1/',
      text: 'linkedin.com/in/lava-kumar-reddy-tetali/'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Get in Touch with Lava Kumar
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Have questions about KSpectra or want to collaborate? 
            Feel free to reach out through any of these channels.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-8 hover:bg-slate-900/70 transition-all duration-300 hover:border-blue-500/50"
              >
                <div className="text-center">
                  <div className="inline-flex p-4 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                    <link.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{link.label}</h3>
                  <p className="text-slate-400 break-all">{link.text}</p>
                  <div className="mt-4 flex items-center justify-center space-x-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                    <span className="text-sm">Visit</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;