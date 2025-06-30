# 台中等公車

一個結合即時公車到站資訊與動態天氣效果的網頁應用程式，讓等公車的時光變得更有趣！使用者可查詢附近公車站的即時到站時間，同時體驗隨天氣變化的動畫效果。

![圖片1](https://res.cloudinary.com/db4834tsd/image/upload/v1751250666/%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2_2025-06-30_103019_cr0wdg.jpg)

![圖片2](https://res.cloudinary.com/db4834tsd/image/upload/v1751250666/%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2_2025-06-30_103039_mus16y.jpg)

![圖片3](https://res.cloudinary.com/db4834tsd/image/upload/v1751250838/%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2_2025-06-30_103345_ebqdlx.jpg)

[示範影片](https://youtu.be/watch?v=874cddlhPAk)

## 安裝與使用（Installation & Usage）

1. 克隆專案：
   ```bash
   git clone https://github.com/Rassor957/waiting-bus/.git
   cd waiting-bus
   ```

2. 設定 API 金鑰：
   
   a. Google Maps API - 在 `index.html` 中更新：
   ```html
   <script async
        src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap&loading=async">
        </script>
   ```
   
   b. TDX API - 在 `script.js` 中更新：
   ```javascript
   const clientId = 'YOUR_CLIENT_ID';
   const clientSecret = 'YOUR_CLIENT_SECRET';
   ```

3. 開啟 `index.html`。若要測試各天氣、時段的動畫效果，請開啟 `index_testanimate.html`。

## 專案結構（Project Structure）

```
waiting-bus/
│  index.html                         # 主頁面
│  index_testanimate.html            # 動畫測試頁面
│  styles.css                        # 樣式表與動畫
│  script.js                         # 核心邏輯
│  script_testAnimate.js             # 動畫測試腳本
│  README.md                         # 專案說明
│
├─ image/
│  ├─ fog1.png                       # 霧氣效果
│  ├─ fog2.png                       # 霧氣效果
│  ├─ sun.svg                        # 太陽圖示
│  ├─ svg1.svg                       # 雲朵素材
│  ├─ svg2.svg                       # 雲朵素材
│  ├─ svg3.svg                       # 雲朵素材
│  └─ umbrella.svg                   # 雨傘圖示
│
└─ json/
   ├─ bus_station_coordinates.json   # 站點座標資料
   └─ origin_destination_stations.json # 路線起訖站資料
```

## 動機（Motivation）

在台中等公車時，常常需要在不同 APP 之間切換查詢公車到站時間和天氣狀況。因此決定開發這個整合性的網頁應用，不僅能查詢即時公車資訊，還能知道天氣情況，並在下雨時提醒使用者帶傘。

## 功能（Features）

### 公車查詢功能
* GPS 自動定位，顯示附近的公車站
* 即時到站時間查詢
* 顯示路線資訊（起點站、終點站）

### 天氣動畫系統
* 自動取得台中市即時天氣資料
* 動態天氣效果：
  * 晴天
  * 多雲
  * 陰天
  * 雨天
  * 雷雨
  * 起霧
* 不同時段呈現不同背景色彩
* 下雨自動顯示帶傘提醒通知
* `index_testanimate.html`支援手動調整天氣和時間，體驗各種效果

## 技術棧（Tech Stack）

### 前端技術
* HTML5 + CSS3 + JavaScript
* jQuery 3.6.0（DOM 操作）
* Canvas API（動畫繪製）
* CSS3 Animation（天氣特效）

### API 與服務
* Google Maps JavaScript API（地圖顯示與定位）
* TDX 運輸資料流通服務（即時公車資料）
* 中央氣象署開放資料平台（天氣資訊）

## 授權（License）

本專案採用 MIT License，詳見 [LICENSE](LICENSE)。

---

歡迎提出 issue 或 PR！如有建議或功能需求，請隨時聯絡。
