"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Link as LinkIcon,
  BarChart3,
  Shield,
  Zap,
  Download,
  Settings2,
  GitBranch,
  Database,
  MessageCircle,
} from "lucide-react";
import { useRef } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Home() {
  const { t } = useI18n();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const whyUsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const whyUsInView = useInView(whyUsRef, { once: true });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const features = [
    {
      icon: LinkIcon,
      title: t.feature1Title,
      description: t.feature1Description,
    },
    {
      icon: BarChart3,
      title: t.feature2Title,
      description: t.feature2Description,
    },
    {
      icon: Settings2,
      title: t.feature3Title,
      description: t.feature3Description,
    },
    {
      icon: Download,
      title: t.feature4Title,
      description: t.feature4Description,
    },
    {
      icon: Shield,
      title: t.feature5Title,
      description: t.feature5Description,
    },
    {
      icon: Database,
      title: t.feature6Title,
      description: t.feature6Description,
    },
  ];

  const whyChooseUs = [
    {
      icon: GitBranch,
      title: t.whyChoice1Title,
      description: t.whyChoice1Description,
      highlight: t.whyChoice1Highlight,
    },
    {
      icon: Shield,
      title: t.whyChoice2Title,
      description: t.whyChoice2Description,
      highlight: t.whyChoice2Highlight,
    },
    {
      icon: Zap,
      title: t.whyChoice3Title,
      description: t.whyChoice3Description,
      highlight: t.whyChoice3Highlight,
    },
    {
      icon: Settings2,
      title: t.whyChoice4Title,
      description: t.whyChoice4Description,
      highlight: t.whyChoice4Highlight,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher size={48} />
      </div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ y }}
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto text-center px-8 relative z-10"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <LinkIcon className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-black text-black mb-4 tracking-tight"
              variants={itemVariants}
            >
              {t.heroTitle1}
            </motion.h1>
            <motion.h2
              className="text-4xl md:text-6xl font-black text-gray-600 mb-6"
              variants={itemVariants}
            >
              {t.heroTitle2}
            </motion.h2>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {t.heroSubtitle}
            <br />
            <span className="text-black font-semibold">{t.heroDescription}</span>
          </motion.p>

          <motion.div variants={itemVariants}>
            <Button
              asChild
              size="lg"
              className="text-lg px-12 py-6 bg-black hover:bg-gray-800 text-white rounded-full shadow-2xl hover:shadow-black/25 transition-all duration-300"
            >
              <Link href="/admin">{t.startButton}</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section ref={featuresRef} className="py-32 bg-gray-50">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h3 className="text-5xl md:text-6xl font-black text-black mb-6">
              {t.featuresTitle}
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.featuresSubtitle}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-black mb-4">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section ref={whyUsRef} className="py-32 bg-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={whyUsInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h3 className="text-5xl md:text-6xl font-black text-black mb-6">
              {t.whyChooseTitle}
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.whyChooseSubtitle}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
          >
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black rounded-3xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative bg-white m-1 p-8 rounded-3xl">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-2xl font-bold text-black">
                          {item.title}
                        </h4>
                        <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
                          {item.highlight}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="py-32 bg-black text-white">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center px-8"
        >
          <motion.h3
            className="text-5xl md:text-7xl font-black mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            {t.ctaTitle}
          </motion.h3>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            {t.ctaDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6 flex md:gap-16 gap-8 items-start justify-between md:justify-center"
          >
              <Button
                asChild
                size="lg"
                className="text-lg px-12 mb-0 py-6 bg-white hover:bg-gray-100 text-black rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300"
              >
                <Link href="/admin">
                  <Settings2 className="w-6 h-6 mr-3" />
                  {t.ctaAdminButton}
                </Link>
              </Button>
            <div className="flex items-center gap-4 flex-wrap justify-end md:justify-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-12 py-6 bg-white hover:bg-gray-100 text-black rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300"
              >
                <Link href="https://github.com/SR0725/short-link-tracker">
                  <GitBranch className="w-4 h-4" />
                  {t.ctaGithubButton}
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="text-lg px-12 py-6 bg-white hover:bg-gray-100 text-black rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300"
              >
                <Link href="https://discord.com/invite/fH8BxMWaYb">
                  <MessageCircle className="w-6 h-6 mr-3" />
                  {t.ctaDiscordButton}
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}
