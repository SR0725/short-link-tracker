import type { Language } from './config';

export interface Translations {
  // Site metadata
  siteTitle: string;
  siteDescription: string;
  
  // Hero section
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroDescription: string;
  startButton: string;
  
  // Features section
  featuresTitle: string;
  featuresSubtitle: string;
  
  // Feature items
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  feature4Title: string;
  feature4Description: string;
  feature5Title: string;
  feature5Description: string;
  feature6Title: string;
  feature6Description: string;
  
  // Why choose us section
  whyChooseTitle: string;
  whyChooseSubtitle: string;
  
  // Why choose us items
  whyChoice1Title: string;
  whyChoice1Description: string;
  whyChoice1Highlight: string;
  whyChoice2Title: string;
  whyChoice2Description: string;
  whyChoice2Highlight: string;
  whyChoice3Title: string;
  whyChoice3Description: string;
  whyChoice3Highlight: string;
  whyChoice4Title: string;
  whyChoice4Description: string;
  whyChoice4Highlight: string;
  
  // CTA section
  ctaTitle: string;
  ctaDescription: string;
  ctaAdminButton: string;
  ctaGithubButton: string;
  ctaDiscordButton: string;
  
  // Language switcher
  languageSwitcher: string;

  // Footer
  footerAuthor: string;
  footerDescription: string;
  footerHideButton: string;
  footerModalTitle: string;
  footerModalDescription: string;
  footerThreadsDescription: string;
  footerSponsorDescription: string;
  footerCancel: string;
  footerHideMonth: string;

  // Admin Dashboard
  adminTitle: string;
  adminSubtitle: string;
  adminSettings: string;
  adminLogout: string;
  adminCreateTitle: string;
  adminCreateDescription: string;
  adminTargetUrl: string;
  adminCustomSlug: string;
  adminTitle2: string;
  adminTag: string;
  adminExpiresAt: string;
  adminClickLimit: string;
  adminShowAdvanced: string;
  adminHideAdvanced: string;
  adminCreateButton: string;
  adminCreating: string;
  adminLinksTitle: string;
  adminLinksDescription: string;
  adminSearchPlaceholder: string;
  adminColumnDisplay: string;
  adminColumnTitle: string;
  adminColumnShortUrl: string;
  adminColumnTargetUrl: string;
  adminColumnClickCount: string;
  adminColumnExpiresAt: string;
  adminColumnLastClick: string;
  adminColumnCreatedAt: string;
  adminColumnActions: string;
  adminNoLinks: string;
  adminNoLinksDescription: string;
  adminNoSearchResults: string;
  adminNoSearchResultsDescription: string;
  adminCreatedAt: string;
  adminLastClick: string;
  adminNever: string;
  adminPermanent: string;
  adminActions: string;
  adminVisit: string;
  adminAnalytics: string;
  adminDelete: string;
  adminCopy: string;
  adminDeleteConfirm: string;
  
  // Analytics
  analyticsTitle: string;
  analyticsReturnDashboard: string;
  analyticsReturn: string;
  analyticsVisitLink: string;
  analyticsVisit: string;
  analyticsExportCsv: string;
  analyticsTotalClicks: string;
  analyticsPeriodClicks: string;
  analyticsCoveredCountries: string;
  analyticsCreatedAt: string;
  analyticsTimeRange: string;
  analyticsTimeRangeDescription: string;
  analyticsGlobalDistribution: string;
  analyticsGlobalDistributionDescription: string;
  analyticsClickTrends: string;
  analyticsClickTrendsDescription: string;
  analyticsHourlyAnalysis: string;
  analyticsHourlyAnalysisDescription: string;
  analyticsTopReferrers: string;
  analyticsDeviceDistribution: string;
  analyticsCountryDistribution: string;
  analyticsCityDistribution: string;
  analyticsNoReferrers: string;
  analyticsNoDevices: string;
  analyticsNoCountries: string;
  analyticsNoCities: string;
  analyticsDataUpdate: string;
  analyticsTimezoneNote: string;
  analyticsMostActive: string;
  analyticsLeastActive: string;
  analyticsAveragePerHour: string;
  analyticsActivityLevel: string;
  analyticsClicks: string;
  analyticsPeakDifference: string;
  analyticsMorning: string;
  analyticsAfternoon: string;
  analyticsEvening: string;
  analyticsLateNight: string;
  analyticsAverageDaily: string;
  analyticsMainSource: string;
  analyticsMainDevice: string;
  analyticsLoadingData: string;
  analyticsNoAnalyticsData: string;

  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  settingsReturnDashboard: string;
  settingsLogoTitle: string;
  settingsLogoDescription: string;
  settingsLogoImage: string;
  settingsLogoRecommendation: string;
  settingsQrStyleTitle: string;
  settingsQrStyleDescription: string;
  settingsQrDefaultStyle: string;
  settingsQrSquare: string;
  settingsQrRounded: string;
  settingsQrDots: string;
  settings404Title: string;
  settings404Description: string;
  settings404PageTitle: string;
  settings404ButtonText: string;
  settings404DescriptionText: string;
  settings404ButtonUrl: string;
  settings404Preview: string;
  settingsSave: string;
  settingsSaving: string;
  settingsLoadingSettings: string;

  // Login page
  loginTitle: string;
  loginDescription: string;
  loginPassword: string;
  loginRememberMe: string;
  loginButton: string;
  loginLoading: string;
  loginSuccess: string;
  loginErrorPassword: string;
  loginErrorNetwork: string;

  // QR Code Generator
  qrPreview: string;
  qrStyleSelect: string;
  qrColorSelect: string;
  qrLogoUpload: string;
  qrUploadLogo: string;
  qrRemoveLogo: string;
  qrPreviewAll: string;
  qrCopy: string;
  qrDownloadPng: string;
  qrDownloadSvg: string;
  qrScanInfo: string;
  qrFileSizeError: string;
  qrLogoUploaded: string;
  qrNotGenerated: string;
  qrDownloaded: string;
  qrDownloadFailed: string;
  qrCopied: string;
  qrCopyFailed: string;
  qrLogoRemoved: string;
  qrSquareStyle: string;
  qrRoundedStyle: string;
  qrDotsStyle: string;

  // Tag Selector
  tagLabel: string;
  tagPlaceholder: string;
  tagExistingLabel: string;
  tagLoading: string;

  // Analytics detailed (additional)
  analyticsPeriodClicksWithPeriod: string;
  analyticsTimeRangeTitle: string;
  analyticsTimeRangeDesc: string;
  analyticsDays: string;
  analyticsGlobalDistTitle: string;
  analyticsGlobalDistDesc: string;
  analyticsGlobalDistMobile: string;
  analyticsClicksDistribution: string;
  analyticsLogScale: string;
  analyticsClickTrendsTitle: string;
  analyticsClickTrendsDesc: string;
  analyticsDailyAnalysis: string;
  analyticsHourlyTitle: string;
  analyticsHourlyDesc: string;
  analyticsMostActiveTime: string;
  analyticsLeastActiveTime: string;
  analyticsAverageHourly: string;
  analyticsActivityRate: string;
  analyticsPeakGap: string;
  analyticsClicksUnit: string;
  analyticsTimezoneTitle: string;
  analyticsTimezoneDesc: string;
  analyticsTimezoneDesc2: string;
  analyticsReferrersTitle: string;
  analyticsReferrersDesc: string;
  analyticsReferrersDesc2: string;
  analyticsDeviceTitle: string;
  analyticsDeviceDesc: string;
  analyticsCountryTitle: string;
  analyticsCountryDesc: string;
  analyticsCityTitle: string;
  analyticsCityDesc: string;
  analyticsNoReferrerData: string;
  analyticsNoDeviceData: string;
  analyticsNoCountryData: string;
  analyticsNoCityData: string;
  analyticsDirectAccess: string;
  analyticsDataRealtime: string;
  analyticsLastUpdated: string;
  analyticsClicksTooltipText: string;
  analyticsClicksTooltipLabel: string;
  analyticsPercentOfTotal: string;

  // Validation error messages
  validationRequired: string;
  validationFieldName404Title: string;
  validationFieldName404Description: string;
  validationFieldName404ButtonText: string;
  validationFieldName404ButtonUrl: string;
  validationFieldNameLogoUrl: string;
  validationFieldNameTargetUrl: string;
  validationFieldNameCustomSlug: string;
  validationFieldNameTitle: string;
  validationFieldNameTag: string;
  validationFieldNameExpiresAt: string;
  validationFieldNameClickLimit: string;
  validationTitleEmpty: string;
  validationTitleMaxLength: string;
  validationDescriptionEmpty: string;
  validationDescriptionMaxLength: string;
  validationButtonTextEmpty: string;
  validationButtonTextMaxLength: string;
  validationButtonUrlInvalid: string;
  validationLogoUrlInvalid: string;
  validationTargetUrlRequired: string;
  validationTargetUrlInvalid: string;
  validationCustomSlugInvalid: string;
  validationTitleMaxLength200: string;
  validationTagMaxLength50: string;
  validationDateTimeInvalid: string;
  validationTagInvalid: string;
  validationImageRequired: string;
  validationImageFormatInvalid: string;
  validationContainsDisallowedContent: string;
  validationSlugExists: string;
}

export const translations: Record<Language, Translations> = {
  'zh-TW': {
    siteTitle: '短網址追蹤器',
    siteDescription: '簡單強大的網址縮短服務，具備完整分析功能',
    
    heroTitle1: '你的短網址',
    heroTitle2: '你自己掌控',
    heroSubtitle: '簡單、自由、開源、可自訂',
    heroDescription: '不受限於第三方平台',
    startButton: '開始使用',
    
    featuresTitle: '功能亮點',
    featuresSubtitle: '一個工具，解決所有短網址需求',
    
    feature1Title: '一鍵生成短網址',
    feature1Description: '自訂或隨機產生，完全由你控制',
    feature2Title: '即時數據分析',
    feature2Description: '點擊數、來源、時間，一目了然',
    feature3Title: '管理後台',
    feature3Description: '分組、排序、搜尋，井井有條',
    feature4Title: 'QR Code 生成',
    feature4Description: '支援 Logo 與多種樣式選擇',
    feature5Title: '個人化 404',
    feature5Description: '自定義錯誤頁面，保持品牌一致',
    feature6Title: '密碼登入',
    feature6Description: '環境變數配置，安全又簡單',
    
    whyChooseTitle: '為什麼選擇我們？',
    whyChooseSubtitle: '不只是短網址服務，更是你數位自主的開始',
    
    whyChoice1Title: '開源免費',
    whyChoice1Description: '無需付費限制，完全透明',
    whyChoice1Highlight: '100% 開源',
    whyChoice2Title: '自我掌控',
    whyChoice2Description: '資料存在自己伺服器，不怕被封',
    whyChoice2Highlight: '完全掌控',
    whyChoice3Title: '輕量部署',
    whyChoice3Description: 'Zeabur 一鍵部署，快速上線',
    whyChoice3Highlight: '秒級部署',
    whyChoice4Title: '可客製化',
    whyChoice4Description: '程式碼開源，隨你改造',
    whyChoice4Highlight: '無限可能',
    
    ctaTitle: '開始掌控你的連結',
    ctaDescription: '加入數位自主革命，讓每個連結都為你所用',
    ctaAdminButton: '進入管理後台',
    ctaGithubButton: 'GitHub',
    ctaDiscordButton: 'Discord',
    
    languageSwitcher: '語言',

    // Footer
    footerAuthor: 'Ray 貓',
    footerDescription: '這個網站的開發者，🚀 Vibe Coding 研究者 × 新創路上的 AI 工程師',
    footerHideButton: '隱藏底部',
    footerModalTitle: '稍等一下！',
    footerModalDescription: '在隱藏底部之前，願意追蹤我的動態或支持我的創作嗎？',
    footerThreadsDescription: '獲取最新動態與技術分享',
    footerSponsorDescription: '支持開源專案的持續開發',
    footerCancel: '取消',
    footerHideMonth: '隱藏一個月',

    // Admin Dashboard
    adminTitle: '管理中心',
    adminSubtitle: '掌控你的每一個連結',
    adminSettings: '設定',
    adminLogout: '登出',
    adminCreateTitle: '建立新短網址',
    adminCreateDescription: '將長網址轉換為簡潔優雅的短連結',
    adminTargetUrl: '目標網址 *',
    adminCustomSlug: '自訂短碼（選用）',
    adminTitle2: '標題/名稱（選用）',
    adminTag: '標籤',
    adminExpiresAt: '到期日（選用）',
    adminClickLimit: '點擊上限（選用）',
    adminShowAdvanced: '顯示進階選項',
    adminHideAdvanced: '隱藏進階選項',
    adminCreateButton: '建立短網址',
    adminCreating: '建立中...',
    adminLinksTitle: '您的短網址',
    adminLinksDescription: '管理您建立的短連結並查看分析數據',
    adminSearchPlaceholder: '搜尋標題、標籤、目標網址或短碼...',
    adminColumnDisplay: '欄位顯示',
    adminColumnTitle: '標題/名稱',
    adminColumnShortUrl: '短網址',
    adminColumnTargetUrl: '目標網址',
    adminColumnClickCount: '點擊數/上限',
    adminColumnExpiresAt: '到期日',
    adminColumnLastClick: '最近點擊',
    adminColumnCreatedAt: '建立時間',
    adminColumnActions: '操作',
    adminNoLinks: '還沒有短網址',
    adminNoLinksDescription: '建立您的第一個短連結開始使用吧！',
    adminNoSearchResults: '找不到符合條件的連結',
    adminNoSearchResultsDescription: '試試調整搜尋條件或建立新的短連結',
    adminCreatedAt: '建立時間',
    adminLastClick: '最近一次點擊',
    adminNever: '從未',
    adminPermanent: '永久',
    adminActions: '操作',
    adminVisit: '訪問',
    adminAnalytics: '分析',
    adminDelete: '刪除',
    adminCopy: '複製',
    adminDeleteConfirm: '確定要刪除嗎？',

    // Analytics
    analyticsTitle: '分析中心',
    analyticsReturnDashboard: '返回儀表板',
    analyticsReturn: '返回',
    analyticsVisitLink: '訪問連結',
    analyticsVisit: '訪問',
    analyticsExportCsv: '匯出 CSV',
    analyticsTotalClicks: '總點擊數',
    analyticsPeriodClicks: '期間點擊',
    analyticsCoveredCountries: '覆蓋國家',
    analyticsCreatedAt: '建立時間',
    analyticsTimeRange: '時間範圍',
    analyticsTimeRangeDescription: '選擇要查看的分析時段',
    analyticsGlobalDistribution: '全球點擊分佈',
    analyticsGlobalDistributionDescription: '顏色越深表示該地區的點擊量越高，滑鼠移到國家上查看詳細資訊',
    analyticsClickTrends: '點擊趨勢',
    analyticsClickTrendsDescription: '過去',
    analyticsHourlyAnalysis: '時段分析',
    analyticsHourlyAnalysisDescription: '24小時點擊活動分佈',
    analyticsTopReferrers: '主要推薦來源',
    analyticsDeviceDistribution: '裝置分佈',
    analyticsCountryDistribution: '國家分佈',
    analyticsCityDistribution: '城市分佈',
    analyticsNoReferrers: '暫無推薦來源資料',
    analyticsNoDevices: '暫無裝置資料',
    analyticsNoCountries: '暫無國家資料',
    analyticsNoCities: '暫無城市資料',
    analyticsDataUpdate: '資料即時更新 • 最後更新:',
    analyticsTimezoneNote: '時區說明：',
    analyticsMostActive: '最活躍時段',
    analyticsLeastActive: '最少活動',
    analyticsAveragePerHour: '平均每小時',
    analyticsActivityLevel: '活躍度',
    analyticsClicks: '次點擊',
    analyticsPeakDifference: '峰值差距',
    analyticsMorning: '早上',
    analyticsAfternoon: '下午',
    analyticsEvening: '晚上',
    analyticsLateNight: '深夜',
    analyticsAverageDaily: '平均每日',
    analyticsMainSource: '主要來源',
    analyticsMainDevice: '主要裝置',
    analyticsLoadingData: '載入分析資料中...',
    analyticsNoAnalyticsData: '找不到分析數據',

    // Settings
    settingsTitle: '設定中心',
    settingsSubtitle: '打造專屬的短網址體驗',
    settingsReturnDashboard: '返回儀表板',
    settingsLogoTitle: 'Logo 設定',
    settingsLogoDescription: '設定在 QR Code 中央顯示的 Logo 圖片',
    settingsLogoImage: 'Logo 圖片',
    settingsLogoRecommendation: '建議尺寸：100x100 像素，PNG/JPG 格式，檔案大小不超過 2MB',
    settingsQrStyleTitle: 'QR Code 預設樣式',
    settingsQrStyleDescription: '選擇新建立短網址時的預設 QR Code 樣式',
    settingsQrDefaultStyle: '預設樣式',
    settingsQrSquare: '方形（傳統）',
    settingsQrRounded: '圓角方形',
    settingsQrDots: '圓點樣式',
    settings404Title: '404 頁面個人化',
    settings404Description: '自訂當短連結不存在或過期時顯示的頁面內容',
    settings404PageTitle: '標題',
    settings404ButtonText: '按鈕文字',
    settings404DescriptionText: '描述文字',
    settings404ButtonUrl: '按鈕連結',
    settings404Preview: '頁面預覽',
    settingsSave: '儲存設定',
    settingsSaving: '儲存中...',
    settingsLoadingSettings: '載入設定中...',

    // Login page
    loginTitle: '管理員登入',
    loginDescription: '請輸入密碼以進入管理後台',
    loginPassword: '密碼',
    loginRememberMe: '記住我 1 年',
    loginButton: '登入',
    loginLoading: '登入中...',
    loginSuccess: '登入成功',
    loginErrorPassword: '密碼錯誤',
    loginErrorNetwork: '網路錯誤，請重試',

    // QR Code Generator
    qrPreview: 'QR Code 預覽',
    qrStyleSelect: 'QR Code 樣式',
    qrColorSelect: 'QR Code 色系',
    qrLogoUpload: '中央 Logo（選用）',
    qrUploadLogo: '上傳 Logo',
    qrRemoveLogo: '移除',
    qrPreviewAll: '預覽所有組合',
    qrCopy: '複製',
    qrDownloadPng: 'PNG',
    qrDownloadSvg: 'SVG',
    qrScanInfo: '掃描此 QR Code 將跳轉到',
    qrFileSizeError: '檔案大小不得超過 2MB',
    qrLogoUploaded: 'Logo 已上傳',
    qrNotGenerated: 'QR Code 尚未生成',
    qrDownloaded: 'QR Code 已下載',
    qrDownloadFailed: '下載失敗',
    qrCopied: 'QR Code 已複製到剪貼簿',
    qrCopyFailed: '複製失敗，請嘗試下載',
    qrLogoRemoved: 'Logo 已移除',
    qrSquareStyle: '方形（傳統）',
    qrRoundedStyle: '圓角方形',
    qrDotsStyle: '圓點樣式',

    // Tag Selector
    tagLabel: '分組/標籤（選用）',
    tagPlaceholder: '輸入標籤名稱',
    tagExistingLabel: '或選擇現有標籤：',
    tagLoading: '載入標籤中...',

    // Analytics detailed  
    analyticsPeriodClicksWithPeriod: '期間點擊',
    analyticsTimeRangeTitle: '時間範圍',
    analyticsTimeRangeDesc: '選擇要查看的分析時段',
    analyticsDays: '天',
    analyticsGlobalDistTitle: '全球點擊分佈',
    analyticsGlobalDistDesc: '顏色越深表示該地區的點擊量越高，滑鼠移到國家上查看詳細資訊',
    analyticsGlobalDistMobile: '點擊國家查看詳細資訊',
    analyticsClicksDistribution: '點擊數量分佈',
    analyticsLogScale: '對數比例',
    analyticsClickTrendsTitle: '點擊趨勢',
    analyticsClickTrendsDesc: '過去',
    analyticsDailyAnalysis: '天的每日點擊分析',
    analyticsHourlyTitle: '時段分析',
    analyticsHourlyDesc: '24小時點擊活動分佈',
    analyticsMostActiveTime: '最活躍時段',
    analyticsLeastActiveTime: '最少活動',
    analyticsAverageHourly: '平均每小時',
    analyticsActivityRate: '活躍度',
    analyticsPeakGap: '峰值差距',
    analyticsClicksUnit: '次',
    analyticsTimezoneTitle: '時區說明：',
    analyticsTimezoneDesc: '所有時間均以用戶所在的時區為準，目前顯示為',
    analyticsTimezoneDesc2: '讓您更準確了解不同地區用戶的活動模式。',
    analyticsReferrersTitle: '主要推薦來源',
    analyticsReferrersDesc: '過去',
    analyticsReferrersDesc2: '天的流量來源',
    analyticsDeviceTitle: '裝置分佈',
    analyticsDeviceDesc: '用戶使用的裝置類型',
    analyticsCountryTitle: '國家分佈',
    analyticsCountryDesc: '點擊量的地理分佈',
    analyticsCityTitle: '城市分佈',
    analyticsCityDesc: '點擊來源的主要城市',
    analyticsNoReferrerData: '暫無推薦來源資料',
    analyticsNoDeviceData: '暫無裝置資料',
    analyticsNoCountryData: '暫無國家資料',
    analyticsNoCityData: '暫無城市資料',
    analyticsDirectAccess: '直接訪問',
    analyticsDataRealtime: '資料即時更新',
    analyticsLastUpdated: '最後更新',
    analyticsClicksTooltipText: '次點擊',
    analyticsClicksTooltipLabel: '點擊數',
    analyticsPercentOfTotal: '佔總數',

    // Validation error messages
    validationRequired: '為必填',
    validationFieldName404Title: '404 標題',
    validationFieldName404Description: '404 描述',
    validationFieldName404ButtonText: '按鈕文字',
    validationFieldName404ButtonUrl: '按鈕連結',
    validationFieldNameLogoUrl: '網站 Logo',
    validationFieldNameTargetUrl: '目標網址',
    validationFieldNameCustomSlug: '自訂短網址',
    validationFieldNameTitle: '標題',
    validationFieldNameTag: '標籤',
    validationFieldNameExpiresAt: '過期時間',
    validationFieldNameClickLimit: '點擊限制',
    validationTitleEmpty: '標題不能為空',
    validationTitleMaxLength: '標題最多 100 字元',
    validationDescriptionEmpty: '描述不能為空',
    validationDescriptionMaxLength: '描述最多 500 字元',
    validationButtonTextEmpty: '按鈕文字不能為空',
    validationButtonTextMaxLength: '按鈕文字最多 50 字元',
    validationButtonUrlInvalid: '請輸入有效的網址（http:// 或 https://）或相對路徑（如 /）',
    validationLogoUrlInvalid: '請上傳有效的圖片',
    validationTargetUrlRequired: '目標網址為必填',
    validationTargetUrlInvalid: '請輸入有效的網址（必須以 http:// 或 https:// 開頭）',
    validationCustomSlugInvalid: '只能包含英文字母、數字、連字號和底線',
    validationTitleMaxLength200: '標題最多 200 字元',
    validationTagMaxLength50: '標籤最多 50 字元',
    validationDateTimeInvalid: '日期時間格式不正確',
    validationTagInvalid: '標籤只能包含字母、數字、中文、連字號、底線和空格',
    validationImageRequired: '圖片資料為必填',
    validationImageFormatInvalid: '圖片格式不正確',
    validationContainsDisallowedContent: '包含不允許的內容，請使用純文字',
    validationSlugExists: '此自訂短網址已被使用',
  },
  'en': {
    siteTitle: 'Short Link Tracker',
    siteDescription: 'Simple and powerful URL shortening service with comprehensive analytics',
    
    heroTitle1: 'Your Short Links',
    heroTitle2: 'Under Your Control',
    heroSubtitle: 'Simple, Free, Open Source, Customizable',
    heroDescription: 'No limits from third-party platforms',
    startButton: 'Get Started',
    
    featuresTitle: 'Key Features',
    featuresSubtitle: 'One tool to solve all your short link needs',
    
    feature1Title: 'One-Click Short Links',
    feature1Description: 'Custom or random generation, completely under your control',
    feature2Title: 'Real-time Analytics',
    feature2Description: 'Clicks, sources, timing - all at a glance',
    feature3Title: 'Admin Dashboard',
    feature3Description: 'Group, sort, search - everything organized',
    feature4Title: 'QR Code Generation',
    feature4Description: 'Support for logos and various style options',
    feature5Title: 'Custom 404 Pages',
    feature5Description: 'Customize error pages to maintain brand consistency',
    feature6Title: 'Password Authentication',
    feature6Description: 'Environment variable configuration, secure and simple',
    
    whyChooseTitle: 'Why Choose Us?',
    whyChooseSubtitle: 'More than a short link service - your digital autonomy begins here',
    
    whyChoice1Title: 'Open Source',
    whyChoice1Description: 'No payment restrictions, completely transparent',
    whyChoice1Highlight: '100% Open Source',
    whyChoice2Title: 'Self-Controlled',
    whyChoice2Description: 'Data on your own server, no fear of being blocked',
    whyChoice2Highlight: 'Full Control',
    whyChoice3Title: 'Easy Deployment',
    whyChoice3Description: 'One-click deployment with Zeabur',
    whyChoice3Highlight: 'Deploy in Seconds',
    whyChoice4Title: 'Customizable',
    whyChoice4Description: 'Open source code, customize as you wish',
    whyChoice4Highlight: 'Unlimited Possibilities',
    
    ctaTitle: 'Start Controlling Your Links',
    ctaDescription: 'Join the digital autonomy revolution, make every link work for you',
    ctaAdminButton: 'Enter Admin Dashboard',
    ctaGithubButton: 'GitHub',
    ctaDiscordButton: 'Discord',
    
    languageSwitcher: 'Language',

    // Footer
    footerAuthor: 'Ray Cat',
    footerDescription: 'The developer of this website, 🚀 Vibe Coding researcher × AI engineer on startup journey',
    footerHideButton: 'Hide Footer',
    footerModalTitle: 'Wait a moment!',
    footerModalDescription: 'Before hiding the footer, would you like to follow my updates or support my work?',
    footerThreadsDescription: 'Get latest updates and tech sharing',
    footerSponsorDescription: 'Support continuous development of open source projects',
    footerCancel: 'Cancel',
    footerHideMonth: 'Hide for a month',

    // Admin Dashboard
    adminTitle: 'Admin Dashboard',
    adminSubtitle: 'Control every link you create',
    adminSettings: 'Settings',
    adminLogout: 'Logout',
    adminCreateTitle: 'Create New Short URL',
    adminCreateDescription: 'Transform long URLs into elegant short links',
    adminTargetUrl: 'Target URL *',
    adminCustomSlug: 'Custom Slug (Optional)',
    adminTitle2: 'Title/Name (Optional)',
    adminTag: 'Tag',
    adminExpiresAt: 'Expires At (Optional)',
    adminClickLimit: 'Click Limit (Optional)',
    adminShowAdvanced: 'Show Advanced Options',
    adminHideAdvanced: 'Hide Advanced Options',
    adminCreateButton: 'Create Short URL',
    adminCreating: 'Creating...',
    adminLinksTitle: 'Your Short URLs',
    adminLinksDescription: 'Manage your short links and view analytics',
    adminSearchPlaceholder: 'Search title, tag, target URL or slug...',
    adminColumnDisplay: 'Column Display',
    adminColumnTitle: 'Title/Name',
    adminColumnShortUrl: 'Short URL',
    adminColumnTargetUrl: 'Target URL',
    adminColumnClickCount: 'Clicks/Limit',
    adminColumnExpiresAt: 'Expires At',
    adminColumnLastClick: 'Last Click',
    adminColumnCreatedAt: 'Created At',
    adminColumnActions: 'Actions',
    adminNoLinks: 'No Short URLs Yet',
    adminNoLinksDescription: 'Create your first short link to get started!',
    adminNoSearchResults: 'No matching links found',
    adminNoSearchResultsDescription: 'Try adjusting search criteria or create new short links',
    adminCreatedAt: 'Created At',
    adminLastClick: 'Last Click',
    adminNever: 'Never',
    adminPermanent: 'Permanent',
    adminActions: 'Actions',
    adminVisit: 'Visit',
    adminAnalytics: 'Analytics',
    adminDelete: 'Delete',
    adminCopy: 'Copy',
    adminDeleteConfirm: 'Are you sure you want to delete?',

    // Analytics
    analyticsTitle: 'Analytics Center',
    analyticsReturnDashboard: 'Back',
    analyticsReturn: 'Return',
    analyticsVisitLink: 'Visit Link',
    analyticsVisit: 'Visit',
    analyticsExportCsv: 'Export CSV',
    analyticsTotalClicks: 'Total Clicks',
    analyticsPeriodClicks: 'Period Clicks',
    analyticsCoveredCountries: 'Countries Covered',
    analyticsCreatedAt: 'Created At',
    analyticsTimeRange: 'Time Range',
    analyticsTimeRangeDescription: 'Select analysis period to view',
    analyticsGlobalDistribution: 'Global Click Distribution',
    analyticsGlobalDistributionDescription: 'Darker colors indicate higher click volumes in that region',
    analyticsClickTrends: 'Click Trends',
    analyticsClickTrendsDescription: 'Past',
    analyticsHourlyAnalysis: 'Hourly Analysis',
    analyticsHourlyAnalysisDescription: '24-hour click activity distribution',
    analyticsTopReferrers: 'Top Referrers',
    analyticsDeviceDistribution: 'Device Distribution',
    analyticsCountryDistribution: 'Country Distribution',
    analyticsCityDistribution: 'City Distribution',
    analyticsNoReferrers: 'No referrer data available',
    analyticsNoDevices: 'No device data available',
    analyticsNoCountries: 'No country data available',
    analyticsNoCities: 'No city data available',
    analyticsDataUpdate: 'Data updates in real-time • Last updated:',
    analyticsTimezoneNote: 'Timezone Note:',
    analyticsMostActive: 'Most Active',
    analyticsLeastActive: 'Least Active',
    analyticsAveragePerHour: 'Average Per Hour',
    analyticsActivityLevel: 'Activity Level',
    analyticsClicks: 'clicks',
    analyticsPeakDifference: 'Peak Difference',
    analyticsMorning: 'Morning',
    analyticsAfternoon: 'Afternoon',
    analyticsEvening: 'Evening',
    analyticsLateNight: 'Late Night',
    analyticsAverageDaily: 'Average Daily',
    analyticsMainSource: 'Main Source',
    analyticsMainDevice: 'Main Device',
    analyticsLoadingData: 'Loading analytics data...',
    analyticsNoAnalyticsData: 'No analytics data found',

    // Settings
    settingsTitle: 'Settings Center',
    settingsSubtitle: 'Customize your short URL experience',
    settingsReturnDashboard: 'Back',
    settingsLogoTitle: 'Logo Settings',
    settingsLogoDescription: 'Set the logo image displayed in the center of QR codes',
    settingsLogoImage: 'Logo Image',
    settingsLogoRecommendation: 'Recommended size: 100x100 pixels, PNG/JPG format, file size under 2MB',
    settingsQrStyleTitle: 'Default QR Code Style',
    settingsQrStyleDescription: 'Choose the default QR code style for newly created short URLs',
    settingsQrDefaultStyle: 'Default Style',
    settingsQrSquare: 'Square (Traditional)',
    settingsQrRounded: 'Rounded Square',
    settingsQrDots: 'Dots Style',
    settings404Title: 'Custom 404 Page',
    settings404Description: 'Customize the page content displayed when short links don\'t exist or have expired',
    settings404PageTitle: 'Title',
    settings404ButtonText: 'Button Text',
    settings404DescriptionText: 'Description',
    settings404ButtonUrl: 'Button URL',
    settings404Preview: 'Page Preview',
    settingsSave: 'Save Settings',
    settingsSaving: 'Saving...',
    settingsLoadingSettings: 'Loading settings...',

    // Login page
    loginTitle: 'Admin Login',
    loginDescription: 'Enter password to access admin dashboard',
    loginPassword: 'Password',
    loginRememberMe: 'Remember me for 1 year',
    loginButton: 'Login',
    loginLoading: 'Logging in...',
    loginSuccess: 'Login successful',
    loginErrorPassword: 'Invalid password',
    loginErrorNetwork: 'Network error, please try again',

    // QR Code Generator
    qrPreview: 'QR Code Preview',
    qrStyleSelect: 'QR Code Style',
    qrColorSelect: 'QR Code Color Scheme',
    qrLogoUpload: 'Center Logo (Optional)',
    qrUploadLogo: 'Upload Logo',
    qrRemoveLogo: 'Remove',
    qrPreviewAll: 'Preview All Combinations',
    qrCopy: 'Copy',
    qrDownloadPng: 'PNG',
    qrDownloadSvg: 'SVG',
    qrScanInfo: 'Scan this QR Code to redirect to',
    qrFileSizeError: 'File size cannot exceed 2MB',
    qrLogoUploaded: 'Logo uploaded',
    qrNotGenerated: 'QR Code not generated yet',
    qrDownloaded: 'QR Code downloaded',
    qrDownloadFailed: 'Download failed',
    qrCopied: 'QR Code copied to clipboard',
    qrCopyFailed: 'Copy failed, please try download',
    qrLogoRemoved: 'Logo removed',
    qrSquareStyle: 'Square (Traditional)',
    qrRoundedStyle: 'Rounded Square',
    qrDotsStyle: 'Dots Style',

    // Tag Selector
    tagLabel: 'Group/Tag (Optional)',
    tagPlaceholder: 'Enter tag name',
    tagExistingLabel: 'Or select existing tag:',
    tagLoading: 'Loading tags...',

    // Analytics detailed
    analyticsPeriodClicksWithPeriod: 'Period Clicks',
    analyticsTimeRangeTitle: 'Time Range',
    analyticsTimeRangeDesc: 'Select analysis period to view',
    analyticsDays: 'days',
    analyticsGlobalDistTitle: 'Global Click Distribution',
    analyticsGlobalDistDesc: 'Darker colors indicate higher click volumes in that region',
    analyticsGlobalDistMobile: 'Click on countries for details',
    analyticsClicksDistribution: 'Click Distribution',
    analyticsLogScale: 'logarithmic scale',
    analyticsClickTrendsTitle: 'Click Trends',
    analyticsClickTrendsDesc: 'Past',
    analyticsDailyAnalysis: 'days of daily click analysis',
    analyticsHourlyTitle: 'Hourly Analysis',
    analyticsHourlyDesc: '24-hour click activity distribution',
    analyticsMostActiveTime: 'Most Active',
    analyticsLeastActiveTime: 'Least Active', 
    analyticsAverageHourly: 'Average Per Hour',
    analyticsActivityRate: 'Activity Level',
    analyticsPeakGap: 'Peak Difference',
    analyticsClicksUnit: 'clicks',
    analyticsTimezoneTitle: 'Timezone Note:',
    analyticsTimezoneDesc: 'All times are based on user timezone, currently showing',
    analyticsTimezoneDesc2: 'for better understanding of user activity patterns across regions.',
    analyticsReferrersTitle: 'Top Referrers',
    analyticsReferrersDesc: 'Past',
    analyticsReferrersDesc2: 'days traffic sources',
    analyticsDeviceTitle: 'Device Distribution',
    analyticsDeviceDesc: 'Device types used by visitors',
    analyticsCountryTitle: 'Country Distribution',
    analyticsCountryDesc: 'Geographic distribution of clicks',
    analyticsCityTitle: 'City Distribution',
    analyticsCityDesc: 'Main cities where clicks originated',
    analyticsNoReferrerData: 'No referrer data available',
    analyticsNoDeviceData: 'No device data available',
    analyticsNoCountryData: 'No country data available',
    analyticsNoCityData: 'No city data available',
    analyticsDirectAccess: 'Direct Access',
    analyticsDataRealtime: 'Data updates in real-time',
    analyticsLastUpdated: 'Last updated',
    analyticsClicksTooltipText: 'clicks',
    analyticsClicksTooltipLabel: 'Clicks',
    analyticsPercentOfTotal: 'of total',

    // Validation error messages
    validationRequired: 'is required',
    validationFieldName404Title: '404 Title',
    validationFieldName404Description: '404 Description',
    validationFieldName404ButtonText: 'Button Text',
    validationFieldName404ButtonUrl: 'Button URL',
    validationFieldNameLogoUrl: 'Logo',
    validationFieldNameTargetUrl: 'Target URL',
    validationFieldNameCustomSlug: 'Custom Slug',
    validationFieldNameTitle: 'Title',
    validationFieldNameTag: 'Tag',
    validationFieldNameExpiresAt: 'Expires At',
    validationFieldNameClickLimit: 'Click Limit',
    validationTitleEmpty: 'Title cannot be empty',
    validationTitleMaxLength: 'Title cannot exceed 100 characters',
    validationDescriptionEmpty: 'Description cannot be empty',
    validationDescriptionMaxLength: 'Description cannot exceed 500 characters',
    validationButtonTextEmpty: 'Button text cannot be empty',
    validationButtonTextMaxLength: 'Button text cannot exceed 50 characters',
    validationButtonUrlInvalid: 'Please enter a valid URL (http:// or https://) or relative path (e.g., /)',
    validationLogoUrlInvalid: 'Please upload a valid image',
    validationTargetUrlRequired: 'Target URL is required',
    validationTargetUrlInvalid: 'Please enter a valid URL (must start with http:// or https://)',
    validationCustomSlugInvalid: 'Can only contain letters, numbers, hyphens, and underscores',
    validationTitleMaxLength200: 'Title cannot exceed 200 characters',
    validationTagMaxLength50: 'Tag cannot exceed 50 characters',
    validationDateTimeInvalid: 'Invalid date/time format',
    validationTagInvalid: 'Tag can only contain letters, numbers, Chinese characters, hyphens, underscores, and spaces',
    validationImageRequired: 'Image data is required',
    validationImageFormatInvalid: 'Invalid image format',
    validationContainsDisallowedContent: 'Contains disallowed content, please use plain text only',
    validationSlugExists: 'This custom slug already exists',
  }
};