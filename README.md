# 短網址追蹤器

[![English](https://img.shields.io/badge/README-English-blue)](./README.en.md) | [![繁體中文](https://img.shields.io/badge/README-繁體中文-red)](./README.md)

使用 Next.js 15 構建的完整短網址服務，具備網址縮短、點擊追蹤和全面的數據分析功能。

## 功能特色

- **網址縮短**：將長網址轉換為短而易分享的連結
- **自訂短碼**：可選擇建立自訂的短代碼
- **進階連結管理**：新增標題、標籤、到期日期和點擊次數限制
- **表格排序**：按各種條件排序連結（日期、點擊次數、標籤等）
- **點擊追蹤**：詳細追蹤點擊數據和分析
- **數據分析儀表板**：查看點擊趨勢、來源、設備類型和地理數據（國家檢測為可選功能）
- **QR 碼生成**：生成可自訂的 QR 碼，支援 Logo 上傳
- **CSV 匯出**：匯出分析數據供外部分析使用
- **個人化 404 頁面**：自訂 404 頁面內容和品牌形象
- **管理員認證**：安全的管理面板，具備「記住我」功能
- **設定管理**：集中式的個人化配置
- **現代化介面**：使用 shadcn/ui 組件和 Tailwind CSS 構建（繁體中文）

## 技術架構

- **框架**：Next.js 15 with App Router
- **資料庫**：PostgreSQL with Prisma ORM
- **快取**：Redis 效能優化
- **介面**：Tailwind CSS + shadcn/ui 組件
- **圖表**：Recharts 數據視覺化
- **QR 碼**：qr-code-styling 高度自訂樣式支援
- **認證**：JWT 安全 HTTP-only cookies
- **檔案上傳**：Logo 自訂圖片處理
- **地理位置**：MaxMind GeoLite2 精確國家檢測

## 快速開始

### 🚀 一鍵部署（推薦）

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://goto.ray-realms.com/short-link-zeabur)

點擊上方按鈕使用 Zeabur 模板一鍵部署，自動設定 PostgreSQL 和 Redis 服務！

---

### 🏗️ 自行部署

#### 📋 環境需求
- Node.js 18+ 
- pnpm 套件管理器
- PostgreSQL 資料庫
- Redis 快取服務

#### 🔧 部署步驟

1. **下載並安裝相依套件**
   ```bash
   git clone <repository-url>
   cd short-link-tracker
   pnpm install
   ```

2. **設定環境變數**
   
   複製環境變數範本：
   ```bash
   cp .env.example .env
   ```
   
   編輯 `.env` 檔案並設定以下變數：

   | 環境變數 | 說明 | 範例值 |
   |---------|------|--------|
   | `DATABASE_URL` | **必要** PostgreSQL 連線字串 | `postgresql://user:pass@localhost:5432/shortlink` |
   | `REDIS_URL` | **必要** Redis 連線字串 | `redis://localhost:6379` |
   | `ADMIN_PASSWORD` | **必要** 管理員密碼 | `your_secure_password` |
   | `JWT_SECRET` | **必要** JWT 簽章密鑰（建議 32+ 字元） | `your-super-secret-jwt-key-here` |
   | `MAXMIND_LICENSE_KEY` | **可選** MaxMind 地理位置授權金鑰，用於根據訪客 IP 識別國家位置 | `your_maxmind_key` |

   > 💡 **MaxMind 說明**：本服務利用 MaxMind 提供免費的 GeoLite2 資料庫，將訪客的 IP 位址轉換為國家資訊，讓您在分析報表中查看訪客的地理分佈。Maxmind 是完全免費的，如果你不需要取得訪客的國家資料，可以留空。

3. **建置應用程式**
   ```bash
   pnpm build
   ```

4. **啟動正式環境伺服器**
   ```bash
   pnpm start
   ```
   
   🎉 **部署完成！** 您的短網址服務現已上線

#### 🌍 地理位置功能設定（可選）

> 💡 **提示**：此功能完全可選，不影響應用程式正常運作

若要在分析中顯示訪客國家資訊：

1. **取得 MaxMind 免費授權金鑰**
   - 前往 https://www.maxmind.com/en/geolite2/signup 註冊免費帳戶
   - 在控制台產生授權金鑰
   - 將金鑰新增至 `.env` 檔案：`MAXMIND_LICENSE_KEY=your_license_key`

2. **更新地理位置資料庫**
   ```bash
   # 使用便利腳本更新
   pnpm update-geoip
   ```

**不設定地理位置功能時**：
- ✅ 應用程式正常運作
- 📍 國家欄位顯示「未知」
- 💬 首次查詢時會在控制台顯示設定說明

---

### 🛠️ 開發環境設定

如需本地開發，請參考以下步驟：

```bash
# 啟動 Prisma 開發環境（會自動設定 PostgreSQL）
npx prisma dev

# 應用資料庫遷移
npx prisma migrate dev --name init

# 啟動開發伺服器
pnpm dev
```

開發環境將運行於 http://localhost:3000

## 使用方式

### 🔗 應用程式入口
- **首頁**：`http://localhost:3000`
- **管理面板**：`http://localhost:3000/admin`

### 👤 登入管理面板
- 使用 `.env` 檔案中設定的 `ADMIN_PASSWORD`（預設："admin123"）
- 勾選「記住我」可延長登入時效（1年）

### ✨ 建立短網址
1. 在管理儀表板輸入目標網址
2. 可選設定：
   - 🏷️ 自訂短碼
   - 📝 標題和標籤
   - ⏰ 到期日期
   - 🔢 點擊次數限制
3. 生成可自訂樣式的 QR 碼
4. 複製並分享生成的短網址

### 📊 連結管理
- **排序功能**：按標題、標籤、點擊次數、建立日期、最後點擊或到期日排序
- **快速切換**：點擊表格標題切換升序/降序
- **狀態指示**：查看完整連結資訊和狀態指標

### 📈 分析數據
- 點擊任一短網址的「分析」按鈕
- 查看 7 天或 30 天點擊趨勢
- 檢視熱門來源、裝置分佈和地理數據
- 國家數據（需設定 GeoIP，否則顯示「未知」）
- 匯出 CSV 供外部分析

### ⚙️ 自訂設定
- 上傳 Logo 用於 QR 碼和 404 頁面
- 設定預設 QR 碼樣式偏好
- 個人化 404 頁面內容和外觀

### 🎯 短網址使用
- 訪問 `http://localhost:3000/{短碼}` 重新導向至目標網址
- 每次訪問自動追蹤並記錄分析數據

## API 端點

### 認證相關
- `POST /api/auth/login` - 管理員登入
- `POST /api/auth/logout` - 管理員登出
- `GET /api/auth/check` - 檢查認證狀態

### 連結管理
- `GET /api/links` - 取得所有短連結及排序支援（需認證）
- `POST /api/links` - 建立新短連結及進階選項（需認證）
- `GET /api/links/[id]/analytics` - 取得連結分析數據（需認證）
- `GET /api/links/[id]/export` - 匯出分析數據為 CSV（需認證）

### 設定管理
- `GET /api/settings` - 取得管理員設定（需認證）
- `PUT /api/settings` - 更新設定（需認證）
- `GET /api/settings/public` - 取得 404 頁面的公開設定

### 網址重新導向
- `GET /[slug]` - 重新導向至目標網址並追蹤點擊

## 資料庫架構

### Links 資料表（連結）
- `id`：唯一識別碼
- `slug`：網址短代碼
- `target_url`：原始長網址
- `title`：可選的描述標題
- `tag`：分組/分類標籤
- `expires_at`：可選的到期日期
- `click_limit`：可選的最大點擊次數限制
- `last_click_at`：最近點擊時間戳記
- `created_at`：建立時間戳記
- `updated_at`：最後更新時間戳記

### Clicks 資料表（點擊記錄）
- `id`：唯一識別碼
- `link_id`：連結資料表參照
- `timestamp`：點擊時間戳記
- `referrer`：HTTP 來源標頭
- `user_agent`：瀏覽器使用者代理
- `device`：裝置類型（桌機/手機/平板等）
- `country`：ISO 3166-1 國家代碼（若已設定 GeoIP）

### Settings 資料表（設定）
- `id`：唯一識別碼
- `logo_url`：上傳 Logo 圖片的 URL
- `default_qr_style`：預設 QR 碼樣式（方形/圓角/點狀）
- `custom_404_title`：自訂 404 頁面標題
- `custom_404_description`：自訂 404 頁面描述
- `custom_404_button_text`：自訂 404 頁面按鈕文字
- `custom_404_button_url`：自訂 404 頁面按鈕網址
- `created_at`：建立時間戳記
- `updated_at`：最後更新時間戳記

## 安全功能

- 🔐 密碼式管理員認證
- 🎫 可設定到期時間的 JWT 令牌
- 🍪 HTTP-only 安全 Cookie 設定
- 🛡️ SameSite Cookie CSRF 防護
- ✅ 輸入驗證和清理
- 💉 Prisma ORM SQL 注入防護

## 效能優化

- ⚡ Redis 快取經常存取的數據
- 🔍 常查詢欄位的資料庫索引
- 🔄 非同步點擊追蹤避免重新導向阻塞
- 📄 可能的靜態頁面生成
- 📦 Tree shaking 優化套件大小

## 部署選項

本應用程式可部署於任何支援 Node.js 的平台：

- **Vercel**：零設定部署，內建 PostgreSQL 和 Redis
- **Railway**：簡易部署，支援資料庫附加元件
- **Docker**：使用內附的 Dockerfile 容器化部署
- **傳統主機**：部署至 VPS，搭配 PostgreSQL 和 Redis 實例

## 問題回報與支援

如果您在使用過程中遇到問題或有任何建議，歡迎加入我們的 Discord 社群討論：

[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/fH8BxMWaYb)

## 授權條款

MIT 授權條款 - 詳細資訊請參見 LICENSE 檔案。
