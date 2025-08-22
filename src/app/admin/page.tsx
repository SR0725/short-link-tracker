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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeGenerator } from "@/components/qr-code-generator";
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
} from "lucide-react";
import { toast } from "sonner";

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
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    title: true,
    shortUrl: true,
    targetUrl: true,
    clickCount: true,
    expiresAt: true,
    actions: true,
    lastClickAt: false,
    createdAt: false,
  });
  const router = useRouter();

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  // Helper function to get tag color variants
  const getTagVariant = (
    tag: string | undefined
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (!tag) return "outline";

    const tagColors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      工作: "default",
      個人: "secondary",
      行銷: "destructive",
      社群媒體: "outline",
      測試: "secondary",
    };

    return tagColors[tag] || "outline";
  };

  // Helper function to toggle column visibility
  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">短網址管理系統</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              建立和管理您的短網址
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => router.push("/admin/settings")}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">設定</span>
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">登出</span>
            </Button>
          </div>
        </div>

        {/* Create New Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              建立新短網址
            </CardTitle>
            <CardDescription>為您的長網址生成短連結</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLink} className="space-y-4">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-url">目標網址 *</Label>
                  <Input
                    id="target-url"
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-slug">自訂短碼（選用）</Label>
                  <Input
                    id="custom-slug"
                    type="text"
                    placeholder="my-custom-slug"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  disabled={isCreating}
                >
                  {showAdvancedOptions ? (
                    <ChevronUp className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  )}
                  {showAdvancedOptions ? "隱藏進階選項" : "顯示進階選項"}
                </Button>
              </div>

              {/* Advanced Fields with Animation */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showAdvancedOptions
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">標題/名稱（選用）</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="連結描述或名稱"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag">分組/標籤（選用）</Label>
                    <Select
                      value={tag}
                      onValueChange={setTag}
                      disabled={isCreating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇或輸入標籤" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="工作">工作</SelectItem>
                        <SelectItem value="個人">個人</SelectItem>
                        <SelectItem value="行銷">行銷</SelectItem>
                        <SelectItem value="社群媒體">社群媒體</SelectItem>
                        <SelectItem value="測試">測試</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expires-at">到期日（選用）</Label>
                    <Input
                      id="expires-at"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="click-limit">點擊上限（選用）</Label>
                    <Input
                      id="click-limit"
                      type="number"
                      min="1"
                      placeholder="例如：100"
                      value={clickLimit}
                      onChange={(e) => setClickLimit(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isCreating}>
                {isCreating ? "建立中..." : "建立短網址"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Links List */}
        <Card>
          <CardHeader>
            <CardTitle>您的短網址</CardTitle>
            <CardDescription>管理您建立的短連結並查看分析數據</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Column Visibility Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜尋標題、標籤、目標網址或短碼..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Column Visibility Toggle */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColumnOptions(!showColumnOptions)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  欄位顯示
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showColumnOptions ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {/* Column Options Dropdown */}
                {showColumnOptions && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10 max-h-80 overflow-y-auto">
                    <div className="p-3 space-y-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        顯示欄位
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-title"
                            checked={columnVisibility.title}
                            onCheckedChange={() =>
                              toggleColumnVisibility("title")
                            }
                          />
                          <Label htmlFor="col-title" className="text-sm">
                            標題/名稱
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-shortUrl"
                            checked={columnVisibility.shortUrl}
                            onCheckedChange={() =>
                              toggleColumnVisibility("shortUrl")
                            }
                          />
                          <Label htmlFor="col-shortUrl" className="text-sm">
                            短網址
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-targetUrl"
                            checked={columnVisibility.targetUrl}
                            onCheckedChange={() =>
                              toggleColumnVisibility("targetUrl")
                            }
                          />
                          <Label htmlFor="col-targetUrl" className="text-sm">
                            目標網址
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-clickCount"
                            checked={columnVisibility.clickCount}
                            onCheckedChange={() =>
                              toggleColumnVisibility("clickCount")
                            }
                          />
                          <Label htmlFor="col-clickCount" className="text-sm">
                            點擊數/上限
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-expiresAt"
                            checked={columnVisibility.expiresAt}
                            onCheckedChange={() =>
                              toggleColumnVisibility("expiresAt")
                            }
                          />
                          <Label htmlFor="col-expiresAt" className="text-sm">
                            到期日
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-lastClickAt"
                            checked={columnVisibility.lastClickAt}
                            onCheckedChange={() =>
                              toggleColumnVisibility("lastClickAt")
                            }
                          />
                          <Label htmlFor="col-lastClickAt" className="text-sm">
                            最近點擊
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-createdAt"
                            checked={columnVisibility.createdAt}
                            onCheckedChange={() =>
                              toggleColumnVisibility("createdAt")
                            }
                          />
                          <Label htmlFor="col-createdAt" className="text-sm">
                            建立時間
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {links.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                尚未建立任何短網址，請在上方建立您的第一個！
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                找不到符合條件的連結
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
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
                                  <span className="truncate">{link.title || link.slug}</span>
                                  {link.tag && (
                                    <Badge
                                      variant={getTagVariant(link.tag)}
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
                                    copyToClipboard(`${baseUrl}/${link.slug}`)
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
                                    <span className="text-gray-400">/</span>
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
                                <span className="text-gray-400">從未</span>
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
                                          Date.now() + 7 * 24 * 60 * 60 * 1000
                                        )
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-gray-900 dark:text-gray-100"
                                  }`}
                                >
                                  {new Date(link.expiresAt).toLocaleDateString(
                                    "zh-TW"
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">永久</span>
                              )}
                            </TableCell>
                          )}
                          {columnVisibility.createdAt && (
                            <TableCell>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(link.createdAt).toLocaleDateString(
                                  "zh-TW"
                                )}
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
                                      showQrCode === link.id ? null : link.id
                                    )
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <QrCode className="w-4 h-4" />
                                  <span className="sm:hidden ml-2">QR</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    router.push(`/admin/analytics/${link.id}`)
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <BarChart className="w-4 h-4" />
                                  <span className="sm:hidden ml-2">分析</span>
                                </Button>
                                <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
                                  <a
                                    href={`${baseUrl}/${link.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="sm:hidden ml-2">訪問</span>
                                  </a>
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                {showQrCode && (
                  <div className="mt-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">QR Code</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowQrCode(null)}
                        >
                          ✕
                        </Button>
                      </div>
                      <div className="flex justify-center">
                        <QRCodeGenerator
                          url={`${baseUrl}/${
                            filteredLinks.find((l) => l.id === showQrCode)?.slug
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Click outside handler for column options */}
      {showColumnOptions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowColumnOptions(false)}
        />
      )}
    </div>
  );
}
