"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeGenerator } from "@/components/qr-code-generator";
import { TagSelector } from "@/components/tag-selector";
import {
  Plus,
  ExternalLink,
  BarChart,
  Copy,
  LogOut,
  Settings,
  ChevronUp,
  ChevronDown,
  QrCode,
  Search,
  Filter,
  Link as LinkIcon,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Link {
  id: string;
  slug: string;
  targetUrl: string;
  title?: string;
  tag?: string;
  expiresAt?: string;
  clickLimit?: number;
  lastClickAt?: string;
  createdAt: string;
  clickCount: number;
}

interface ColumnVisibility {
  title: boolean;
  shortUrl: boolean;
  targetUrl: boolean;
  clickCount: boolean;
  expiresAt: boolean;
  actions: boolean;
  lastClickAt: boolean;
  createdAt: boolean;
}

export default function AdminPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [clickLimit, setClickLimit] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [error, setError] = useState("");
  const [showQrCode, setShowQrCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showColumnOptions, setShowColumnOptions] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
    () => {
      // Load from localStorage on initial render
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("admin-column-visibility");
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {
            console.error(
              "Failed to parse column visibility from localStorage:",
              e
            );
          }
        }
      }
      // Default values if no saved settings
      return {
        title: true,
        shortUrl: true,
        targetUrl: true,
        clickCount: true,
        expiresAt: true,
        actions: true,
        lastClickAt: false,
        createdAt: false,
      };
    }
  );
  const router = useRouter();

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  // Helper function to toggle column visibility
  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => {
      const newVisibility = {
        ...prev,
        [column]: !prev[column],
      };
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "admin-column-visibility",
          JSON.stringify(newVisibility)
        );
      }
      return newVisibility;
    });
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, isAuthenticated]);

  // Filter links based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredLinks(links);
    } else {
      const filtered = links.filter((link) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          link.title?.toLowerCase().includes(searchLower) ||
          link.tag?.toLowerCase().includes(searchLower) ||
          link.targetUrl.toLowerCase().includes(searchLower) ||
          link.slug.toLowerCase().includes(searchLower)
        );
      });
      setFilteredLinks(filtered);
    }
  }, [links, searchQuery]);

  const checkAuth = async () => {
    try {
      console.log("Checking authentication...");
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      console.log("Auth check response:", data);

      if (data.authenticated) {
        console.log("User is authenticated, loading links...");
        setIsAuthenticated(true);
        loadLinks();
      } else {
        console.log("User not authenticated, redirecting to login...");
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLinks = async () => {
    try {
      const url = `/api/links?sort=${sortBy}&order=${sortOrder}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error("Failed to load links:", error);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("已登出");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("登出失敗");
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUrl,
          customSlug: customSlug || undefined,
          title: title || undefined,
          tag: tag || undefined,
          expiresAt: expiresAt || undefined,
          clickLimit: clickLimit ? parseInt(clickLimit) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTargetUrl("");
        setCustomSlug("");
        setTitle("");
        setTag("");
        setExpiresAt("");
        setClickLimit("");
        toast.success("短網址建立成功！");
        loadLinks(); // Refresh the list
      } else {
        const errorMsg = data.error || "建立短網址失敗";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = "網路錯誤，請重試";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已複製到剪貼簿");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("複製失敗");
    }
  };

  const handleDeleteLink = async (linkId: string, linkTitle?: string) => {
    if (
      !confirm(`確定要刪除短網址 "${linkTitle || linkId}" 嗎？此操作無法復原。`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("短網址已刪除");
        loadLinks(); // 重新載入列表
      } else {
        const data = await response.json();
        const errorMsg = data.error || "刪除失敗";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Delete link error:", error);
      toast.error("網路錯誤，請重試");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <LinkIcon className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-xl font-medium text-black">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 sm:space-y-8 lg:space-y-12"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-black tracking-tight">
                    管理中心
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-1">
                    掌控你的每一個連結
                  </p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto"
            >
              <Button
                onClick={() => router.push("/admin/settings")}
                variant="outline"
                size="default"
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <Settings className="w-5 h-5 mr-2" />
                設定
              </Button>
              <Button
                onClick={handleLogout}
                size="default"
                className="bg-black hover:bg-gray-800 text-white transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                登出
              </Button>
            </motion.div>
          </motion.div>

          {/* Create New Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-bold text-black">
                  <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center mr-3">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  建立新短網址
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  將長網址轉換為簡潔優雅的短連結
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleCreateLink} className="space-y-6">
                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      className="space-y-3"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Label
                        htmlFor="target-url"
                        className="text-base font-semibold text-gray-900"
                      >
                        目標網址 *
                      </Label>
                      <Input
                        id="target-url"
                        type="url"
                        placeholder="https://example.com/very-long-url"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        required
                        disabled={isCreating}
                        className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                      />
                    </motion.div>
                    <motion.div
                      className="space-y-3"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Label
                        htmlFor="custom-slug"
                        className="text-base font-semibold text-gray-900"
                      >
                        自訂短碼（選用）
                      </Label>
                      <Input
                        id="custom-slug"
                        type="text"
                        placeholder="my-custom-slug"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        disabled={isCreating}
                        className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                      />
                    </motion.div>
                  </div>

                  {/* Advanced Options Toggle */}
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() =>
                        setShowAdvancedOptions(!showAdvancedOptions)
                      }
                      disabled={isCreating}
                      className="border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    >
                      {showAdvancedOptions ? (
                        <ChevronUp className="w-5 h-5 mr-2" />
                      ) : (
                        <ChevronDown className="w-5 h-5 mr-2" />
                      )}
                      {showAdvancedOptions ? "隱藏進階選項" : "顯示進階選項"}
                    </Button>
                  </div>

                  {/* Advanced Fields with Animation */}
                  <AnimatePresence>
                    {showAdvancedOptions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
                          <div className="space-y-3">
                            <Label
                              htmlFor="title"
                              className="text-base font-semibold text-gray-900"
                            >
                              標題/名稱（選用）
                            </Label>
                            <Input
                              id="title"
                              type="text"
                              placeholder="連結描述或名稱"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              disabled={isCreating}
                              className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                            />
                          </div>
                          <TagSelector
                            value={tag}
                            onChange={setTag}
                            disabled={isCreating}
                            placeholder="輸入標籤名稱"
                          />
                          <div className="space-y-3">
                            <Label
                              htmlFor="expires-at"
                              className="text-base font-semibold text-gray-900"
                            >
                              到期日（選用）
                            </Label>
                            <Input
                              id="expires-at"
                              type="datetime-local"
                              value={expiresAt}
                              onChange={(e) => setExpiresAt(e.target.value)}
                              disabled={isCreating}
                              className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="click-limit"
                              className="text-base font-semibold text-gray-900"
                            >
                              點擊上限（選用）
                            </Label>
                            <Input
                              id="click-limit"
                              type="number"
                              min="1"
                              placeholder="例如：100"
                              value={clickLimit}
                              onChange={(e) => setClickLimit(e.target.value)}
                              disabled={isCreating}
                              className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-base text-red-600 font-medium bg-red-50 p-4 rounded-xl border border-red-200"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isCreating}
                      size="lg"
                      className="w-full bg-black hover:bg-gray-800 text-white h-14 text-lg font-semibold rounded-xl transition-colors"
                    >
                      {isCreating ? (
                        <div className="flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          建立中...
                        </div>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          建立短網址
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Links List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-bold text-black">
                  <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center mr-3">
                    <BarChart className="w-5 h-5 text-white" />
                  </div>
                  您的短網址
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  管理您建立的短連結並查看分析數據
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Search and Column Visibility Controls */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {/* Search Input */}
                  <motion.div
                    className="flex-1 relative"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <Input
                      placeholder="搜尋標題、標籤、目標網址或短碼..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base border-gray-300 focus:border-black focus:ring-black rounded-xl"
                    />
                  </motion.div>

                  {/* Column Visibility Toggle */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => setShowColumnOptions(!showColumnOptions)}
                      className="hidden lg:flex items-center gap-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 h-12 sm:h-14"
                    >
                      <Filter className="w-5 h-5" />
                      欄位顯示
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          showColumnOptions ? "rotate-180" : ""
                        }`}
                      />
                    </Button>

                    {/* Column Options Dropdown */}
                    <AnimatePresence>
                      {showColumnOptions && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-6 space-y-4">
                            <div className="text-base font-semibold text-black">
                              顯示欄位
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Checkbox
                                  id="col-title"
                                  checked={columnVisibility.title}
                                  onCheckedChange={() =>
                                    toggleColumnVisibility("title")
                                  }
                                />
                                <Label
                                  htmlFor="col-title"
                                  className="text-base font-medium"
                                >
                                  標題/名稱
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Checkbox
                                  id="col-shortUrl"
                                  checked={columnVisibility.shortUrl}
                                  onCheckedChange={() =>
                                    toggleColumnVisibility("shortUrl")
                                  }
                                />
                                <Label
                                  htmlFor="col-shortUrl"
                                  className="text-base font-medium"
                                >
                                  短網址
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Checkbox
                                  id="col-targetUrl"
                                  checked={columnVisibility.targetUrl}
                                  onCheckedChange={() =>
                                    toggleColumnVisibility("targetUrl")
                                  }
                                />
                                <Label
                                  htmlFor="col-targetUrl"
                                  className="text-base font-medium"
                                >
                                  目標網址
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Checkbox
                                  id="col-clickCount"
                                  checked={columnVisibility.clickCount}
                                  onCheckedChange={() =>
                                    toggleColumnVisibility("clickCount")
                                  }
                                />
                                <Label
                                  htmlFor="col-clickCount"
                                  className="text-base font-medium"
                                >
                                  點擊數/上限
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Checkbox
                                  id="col-expiresAt"
                                  checked={columnVisibility.expiresAt}
                                  onCheckedChange={() =>
                                    toggleColumnVisibility("expiresAt")
                                  }
                                />
                                <Label
                                  htmlFor="col-expiresAt"
                                  className="text-base font-medium"
                                >
                                  到期日
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Checkbox
                                  id="col-lastClickAt"
                                  checked={columnVisibility.lastClickAt}
                                  onCheckedChange={() =>
                                    toggleColumnVisibility("lastClickAt")
                                  }
                                />
                                <Label
                                  htmlFor="col-lastClickAt"
                                  className="text-base font-medium"
                                >
                                  最近點擊
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Checkbox
                                  id="col-createdAt"
                                  checked={columnVisibility.createdAt}
                                  onCheckedChange={() =>
                                    toggleColumnVisibility("createdAt")
                                  }
                                />
                                <Label
                                  htmlFor="col-createdAt"
                                  className="text-base font-medium"
                                >
                                  建立時間
                                </Label>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {links.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 sm:py-16"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <LinkIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">
                      還沒有短網址
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      建立您的第一個短連結開始使用吧！
                    </p>
                  </motion.div>
                ) : filteredLinks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 sm:py-16"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">
                      找不到符合條件的連結
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      試試調整搜尋條件或建立新的短連結
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-gray-50 rounded-2xl p-6 border border-gray-200">
                      <div className="overflow-x-auto">
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow className="border-gray-300 hover:bg-gray-100">
                              {columnVisibility.title && (
                                <TableHead
                                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                  onClick={() => handleSort("title")}
                                >
                                  <div className="flex items-center">
                                    標題/名稱
                                    {getSortIcon("title")}
                                  </div>
                                </TableHead>
                              )}
                              {columnVisibility.shortUrl && (
                                <TableHead>短網址</TableHead>
                              )}
                              {columnVisibility.targetUrl && (
                                <TableHead>目標網址</TableHead>
                              )}
                              {columnVisibility.clickCount && (
                                <TableHead
                                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                  onClick={() => handleSort("clickCount")}
                                >
                                  <div className="flex items-center">
                                    點擊數/上限
                                    {getSortIcon("clickCount")}
                                  </div>
                                </TableHead>
                              )}
                              {columnVisibility.lastClickAt && (
                                <TableHead
                                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                  onClick={() => handleSort("lastClickAt")}
                                >
                                  <div className="flex items-center">
                                    最近點擊
                                    {getSortIcon("lastClickAt")}
                                  </div>
                                </TableHead>
                              )}
                              {columnVisibility.expiresAt && (
                                <TableHead
                                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                  onClick={() => handleSort("expiresAt")}
                                >
                                  <div className="flex items-center">
                                    到期日
                                    {getSortIcon("expiresAt")}
                                  </div>
                                </TableHead>
                              )}
                              {columnVisibility.createdAt && (
                                <TableHead
                                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                  onClick={() => handleSort("createdAt")}
                                >
                                  <div className="flex items-center">
                                    建立時間
                                    {getSortIcon("createdAt")}
                                  </div>
                                </TableHead>
                              )}
                              {columnVisibility.actions && (
                                <TableHead>操作</TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLinks.map((link) => (
                              <TableRow key={link.id}>
                                {columnVisibility.title && (
                                  <TableCell>
                                    <div className="max-w-xs sm:max-w-sm">
                                      <div className="font-medium truncate flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <span className="truncate">
                                          {link.title || link.slug}
                                        </span>
                                        {link.tag && (
                                          <Badge
                                            variant={"default"}
                                            className="text-xs w-fit"
                                          >
                                            {link.tag}
                                          </Badge>
                                        )}
                                      </div>
                                      {link.title && (
                                        <div className="text-sm text-gray-500 truncate mt-1">
                                          {link.slug}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                )}
                                {columnVisibility.shortUrl && (
                                  <TableCell>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                                      <code className="text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate max-w-[150px] sm:max-w-none">
                                        {baseUrl}/{link.slug}
                                      </code>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          copyToClipboard(
                                            `${baseUrl}/${link.slug}`
                                          )
                                        }
                                        className="p-1 sm:p-2"
                                      >
                                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                )}
                                {columnVisibility.targetUrl && (
                                  <TableCell>
                                    <div
                                      className="max-w-xs sm:max-w-sm truncate text-sm"
                                      title={link.targetUrl}
                                    >
                                      {link.targetUrl}
                                    </div>
                                  </TableCell>
                                )}
                                {columnVisibility.clickCount && (
                                  <TableCell>
                                    <div className="flex items-center space-x-1">
                                      <span className="font-medium">
                                        {link.clickCount}
                                      </span>
                                      {link.clickLimit && (
                                        <>
                                          <span className="text-gray-400">
                                            /
                                          </span>
                                          <span className="text-gray-600 dark:text-gray-400">
                                            {link.clickLimit}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </TableCell>
                                )}
                                {columnVisibility.lastClickAt && (
                                  <TableCell>
                                    {link.lastClickAt ? (
                                      <div className="text-sm">
                                        {new Date(
                                          link.lastClickAt
                                        ).toLocaleDateString("zh-TW")}
                                        <div className="text-xs text-gray-500">
                                          {new Date(
                                            link.lastClickAt
                                          ).toLocaleTimeString("zh-TW", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">
                                        從未
                                      </span>
                                    )}
                                  </TableCell>
                                )}
                                {columnVisibility.expiresAt && (
                                  <TableCell>
                                    {link.expiresAt ? (
                                      <div
                                        className={`text-sm ${
                                          new Date(link.expiresAt) < new Date()
                                            ? "text-red-600 dark:text-red-400"
                                            : new Date(link.expiresAt) <
                                              new Date(
                                                Date.now() +
                                                  7 * 24 * 60 * 60 * 1000
                                              )
                                            ? "text-yellow-600 dark:text-yellow-400"
                                            : "text-gray-900 dark:text-gray-100"
                                        }`}
                                      >
                                        {new Date(
                                          link.expiresAt
                                        ).toLocaleDateString("zh-TW")}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">
                                        永久
                                      </span>
                                    )}
                                  </TableCell>
                                )}
                                {columnVisibility.createdAt && (
                                  <TableCell>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {new Date(
                                        link.createdAt
                                      ).toLocaleDateString("zh-TW")}
                                    </div>
                                  </TableCell>
                                )}
                                {columnVisibility.actions && (
                                  <TableCell>
                                    <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setShowQrCode(
                                            showQrCode === link.id
                                              ? null
                                              : link.id
                                          )
                                        }
                                        className="w-full sm:w-auto"
                                      >
                                        <QrCode className="w-4 h-4" />
                                        <span className="sm:hidden ml-2">
                                          QR
                                        </span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          router.push(
                                            `/admin/analytics/${link.id}`
                                          )
                                        }
                                        className="w-full sm:w-auto"
                                      >
                                        <BarChart className="w-4 h-4" />
                                        <span className="sm:hidden ml-2">
                                          分析
                                        </span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        asChild
                                        className="w-full sm:w-auto"
                                      >
                                        <a
                                          href={`${baseUrl}/${link.slug}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                          <span className="sm:hidden ml-2">
                                            訪問
                                          </span>
                                        </a>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteLink(
                                            link.id,
                                            link.title || link.slug
                                          )
                                        }
                                        className="w-full sm:w-auto hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="sm:hidden ml-2">
                                          刪除
                                        </span>
                                      </Button>

                                      {!columnVisibility.shortUrl && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            copyToClipboard(
                                              `${baseUrl}/${link.slug}`
                                            )
                                          }
                                          className="w-full sm:w-auto"
                                        >
                                          <Copy className="w-4 h-4" />
                                          <span className="sm:hidden ml-2">
                                            複製
                                          </span>
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {filteredLinks.map((link) => (
                        <motion.div
                          key={link.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {/* Card Header - Compact */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-semibold text-gray-900 truncate text-base">
                                  {link.title || link.slug}
                                </h3>
                                {link.tag && (
                                  <Badge
                                    variant="default"
                                    className="text-xs flex-shrink-0"
                                  >
                                    {link.tag}
                                  </Badge>
                                )}
                              </div>
                              {link.title && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  /{link.slug}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                copyToClipboard(`${baseUrl}/${link.slug}`)
                              }
                              className="p-1 flex-shrink-0 hover:bg-gray-100"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          {/* URLs Section - More Compact */}
                          <div className="space-y-1.5 mb-3">
                            <div className="p-2 bg-blue-50 rounded-lg flex items-center gap-2">
                              <span className="text-xs text-blue-900 break-all line-clamp-2 flex items-center gap-2">
                                <LinkIcon className="w-3 h-3 text-blue-600" />
                                {`${baseUrl}/${link.slug}`}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1.5 mb-3">
                            <a
                              href={link.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-green-50 rounded-lg flex items-center gap-2"
                            >
                              <span className="text-xs text-green-900 break-all line-clamp-2 flex items-center gap-2">
                                <ExternalLink className="w-3 h-3 text-green-600" />
                                {link.targetUrl}
                              </span>
                            </a>
                          </div>

                          {/* Metadata and Actions Combined */}
                          <div className="space-y-3">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <span className="text-gray-500 font-medium">
                                  建立時間
                                </span>
                                <div className="text-gray-700 font-semibold mt-0.5 text-xs">
                                  {new Date(link.createdAt).toLocaleDateString(
                                    "zh-TW",
                                    { month: "short", day: "numeric" }
                                  )}
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-2">
                                <span className="text-gray-500 font-medium flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  點擊數 / 點擊上限
                                </span>
                                <div className="text-gray-700 font-semibold mt-0.5 text-xs">
                                  {link.clickCount}
                                  {link.clickLimit
                                    ? ` / ${link.clickLimit}`
                                    : ""}
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-2">
                                <span className="text-gray-500 font-medium">
                                  最近一次點擊
                                </span>
                                <div className="text-gray-700 font-semibold mt-0.5 text-xs">
                                  {link.lastClickAt
                                    ? new Date(
                                        link.lastClickAt
                                      ).toLocaleDateString("zh-TW", {
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "從未點擊"}
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2">
                                <span className="text-gray-500 font-medium">
                                  過期時間
                                </span>
                                <div className="text-gray-700 font-semibold mt-0.5 text-xs">
                                  {link.expiresAt
                                    ? new Date(
                                        link.expiresAt
                                      ).toLocaleDateString("zh-TW", {
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "永久"}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-4 gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setShowQrCode(
                                    showQrCode === link.id ? null : link.id
                                  )
                                }
                                className="flex items-center justify-center gap-1 py-2.5 h-auto whitespace-nowrap border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                              >
                                <QrCode className="w-4 h-4" />
                                <span className="text-xs font-medium">QR</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  router.push(`/admin/analytics/${link.id}`)
                                }
                                className="flex items-center justify-center gap-1 py-2.5 h-auto whitespace-nowrap border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                              >
                                <BarChart className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  分析
                                </span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="flex items-center justify-center gap-1 py-2.5 h-auto whitespace-nowrap border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                              >
                                <a
                                  href={`${baseUrl}/${link.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span className="text-xs font-medium">
                                    訪問
                                  </span>
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDeleteLink(
                                    link.id,
                                    link.title || link.slug
                                  )
                                }
                                className="flex items-center justify-center gap-1 py-2.5 h-auto whitespace-nowrap border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  刪除
                                </span>
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrCode && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowQrCode(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowQrCode(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-fit mx-auto my-8 p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-black">
                    QR Code
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowQrCode(null)}
                    className="hover:bg-gray-100 p-1"
                  >
                    ✕
                  </Button>
                </div>
                <QRCodeGenerator
                  url={`${baseUrl}/${
                    filteredLinks.find((l) => l.id === showQrCode)?.slug
                  }`}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside handler for column options */}
      <AnimatePresence>
        {showColumnOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setShowColumnOptions(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
