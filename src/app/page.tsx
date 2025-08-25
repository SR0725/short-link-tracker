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

export default function Home() {
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
      title: "一鍵生成短網址",
      description: "自訂或隨機產生，完全由你控制",
    },
    {
      icon: BarChart3,
      title: "即時數據分析",
      description: "點擊數、來源、時間，一目了然",
    },
    {
      icon: Settings2,
      title: "管理後台",
      description: "分組、排序、搜尋，井井有條",
    },
    {
      icon: Download,
      title: "QR Code 生成",
      description: "支援 Logo 與多種樣式選擇",
    },
    {
      icon: Shield,
      title: "個人化 404",
      description: "自定義錯誤頁面，保持品牌一致",
    },
    {
      icon: Database,
      title: "密碼登入",
      description: "環境變數配置，安全又簡單",
    },
  ];

  const whyChooseUs = [
    {
      icon: GitBranch,
      title: "開源免費",
      description: "無需付費限制，完全透明",
      highlight: "100% 開源",
    },
    {
      icon: Shield,
      title: "自我掌控",
      description: "資料存在自己伺服器，不怕被封",
      highlight: "完全掌控",
    },
    {
      icon: Zap,
      title: "輕量部署",
      description: "Zeabur 一鍵部署，快速上線",
      highlight: "秒級部署",
    },
    {
      icon: Settings2,
      title: "可客製化",
      description: "程式碼開源，隨你改造",
      highlight: "無限可能",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
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
              你的短網址
            </motion.h1>
            <motion.h2
              className="text-4xl md:text-6xl font-black text-gray-600 mb-6"
              variants={itemVariants}
            >
              你自己掌控
            </motion.h2>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            簡單、自由、開源、可自訂
            <br />
            <span className="text-black font-semibold">不受限於第三方平台</span>
          </motion.p>

          <motion.div variants={itemVariants}>
            <Button
              asChild
              size="lg"
              className="text-lg px-12 py-6 bg-black hover:bg-gray-800 text-white rounded-full shadow-2xl hover:shadow-black/25 transition-all duration-300"
            >
              <Link href="/admin">開始使用</Link>
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
              功能亮點
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              一個工具，解決所有短網址需求
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
              為什麼選擇我們？
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              不只是短網址服務，更是你數位自主的開始
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
            開始掌控你的連結
          </motion.h3>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            加入數位自主革命，讓每個連結都為你所用
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
                  進入管理後台
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
                  GitHub
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="text-lg px-12 py-6 bg-white hover:bg-gray-100 text-black rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300"
              >
                <Link href="https://discord.com/invite/fH8BxMWaYb">
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Discord
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}
