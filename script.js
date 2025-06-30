
        let routeInfoData = null;

        // 載入	origin_destination_stations.json
        async function loadRouteInfo() {
            try {
                const response = await fetch("json/origin_destination_stations.json");
                routeInfoData = await response.json();
                console.log("成功載入起點站終點站資料：", routeInfoData);
            } catch (error) {
                console.error("載入origin_destination_stations.json 時發生錯誤：", error);
            }
        }


        // 取得 canvas 與 2D context
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");

        // 設定畫布相關參數
        var width = 0.0;
        var height = 0.0;
        var scale = 1.0;

        // FPS 與前一禎的時間
        var fps = 45.0;
        var lastFrame = (new Date()).getTime();

        // 螢幕閃光與閃電參數
        var flashOpacity = 0.0;
        var boltFlashDuration = 0.25;
        var boltFadeDuration = 0.5;
        var totalBoltDuration = boltFlashDuration + boltFadeDuration;

        // 儲存所有閃電
        var bolts = [];

        // 調整畫布大小
        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // 同步更新所有 bolt canvas 的尺寸
            for (var i = 0; i < bolts.length; i++) {
                var b = bolts[i];
                b.canvas.width = window.innerWidth;
                b.canvas.height = window.innerHeight;
            }

            width = Math.ceil(window.innerWidth / scale);
            height = Math.ceil(window.innerHeight / scale);
        }

        // 發射閃電
        function launchBolt(x, y, length, direction) {
            // 螢幕閃爍
            flashOpacity = Math.random() * 0.1;

            // 建立一個 canvas 來繪製閃電
            var boltCanvas = document.createElement("canvas");
            boltCanvas.width = window.innerWidth;
            boltCanvas.height = window.innerHeight;

            var boltContext = boltCanvas.getContext("2d");
            boltContext.scale(scale, scale);

            // 推進 bolts 陣列
            bolts.push({ canvas: boltCanvas, duration: 0.0 });

            // 真正開始畫閃電
            recursiveLaunchBolt(x, y, length, direction, boltContext);
        }

        // 遞迴畫閃電
        function recursiveLaunchBolt(x, y, length, direction, boltContext) {
            var originalDirection = direction;

            // 透過 setInterval 逐步畫出閃電
            var boltInterval = setInterval(function () {
                if (length <= 0) {
                    clearInterval(boltInterval);
                    return;
                }

                var steps = 0;
                // 一次畫一小段
                while (steps++ < Math.floor(45 / scale) && length > 0) {
                    var x1 = Math.floor(x);
                    var y1 = Math.floor(y);

                    x += Math.cos(direction);
                    y -= Math.sin(direction);
                    length--;

                    if (x1 !== Math.floor(x) || y1 !== Math.floor(y)) {
                        var alpha = Math.min(1.0, length / 350.0);
                        boltContext.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
                        boltContext.fillRect(x1, y1, 1.0, 1.0);

                        // 小幅度偏移，讓閃電分支
                        direction = originalDirection + (-Math.PI / 8.0 + Math.random() * (Math.PI / 4.0));

                        // 分支 or 重新launch
                        if (Math.random() > 0.98) {
                            // 新的分支
                            recursiveLaunchBolt(
                                x1, y1,
                                length * (0.3 + Math.random() * 0.4),
                                originalDirection + (-Math.PI / 6.0 + Math.random() * (Math.PI / 3.0)),
                                boltContext
                            );
                        } else if (Math.random() > 0.95) {
                            recursiveLaunchBolt(
                                x1, y1,
                                length,
                                originalDirection + (-Math.PI / 6.0 + Math.random() * (Math.PI / 3.0)),
                                boltContext
                            );
                            length = 0;
                        }
                    }
                }
            }, 10);
        }
        let currentWeather = '';
        // 每禎都會執行
        function tick() {
            var frame = (new Date()).getTime();
            var elapsed = (frame - lastFrame) / 1000.0;
            lastFrame = frame;

            // 清空畫布
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // 隨機機率產生閃電
            if (Math.random() > 0.98 && currentWeather.includes('雷')) {
        var x = Math.floor(-10.0 + Math.random() * (width + 20.0));
        var y = Math.floor(5.0 + Math.random() * (height / 3.0));
        var length = Math.floor(height / 2.0 + Math.random() * (height / 3.0));
        launchBolt(x, y, length, Math.PI * 3.0 / 2.0);
    }

    // 螢幕閃光效果
    if (flashOpacity > 0.0) {
        context.fillStyle = "rgba(255, 255, 255, " + flashOpacity + ")";
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        flashOpacity = Math.max(0.0, flashOpacity - 0.5 * elapsed);
    }

            // 繪製所有閃電
            for (var i = 0; i < bolts.length; i++) {
                var bolt = bolts[i];
                bolt.duration += elapsed;

                if (bolt.duration >= totalBoltDuration) {
                    // 閃電時間到，移除
                    bolts.splice(i, 1);
                    i--;
                    continue;
                }

                // 計算閃電 fade out 程度
                var fadeRatio = (totalBoltDuration - bolt.duration) / boltFadeDuration;
                context.globalAlpha = Math.max(0.0, Math.min(1.0, fadeRatio));

                context.drawImage(bolt.canvas, 0, 0);
            }
        }

        // 初始化
        window.addEventListener("resize", setCanvasSize);
        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // 同步更新 bolts
            for (var i = 0; i < bolts.length; i++) {
                bolts[i].canvas.width = window.innerWidth;
                bolts[i].canvas.height = window.innerHeight;
            }

            width = Math.ceil(window.innerWidth / scale);
            height = Math.ceil(window.innerHeight / scale);
        }

        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);
        setInterval(tick, 1000.0 / fps);
        /* ============================
           1. 原本的 lab2 JS 邏輯
           ============================ */
        const body = document.body;
        const weatherSelect = document.getElementById('weather');
        const timeSlider = document.getElementById('time');
        const timeDisplay = document.getElementById('timeDisplay');
        const toggleTimeBtn = document.getElementById('toggleTime');
        const clouds = document.querySelectorAll('.cloud');
        const sun = document.querySelector('.sun');

        let acceleratedTime = false;
        let currentHour = parseInt(timeSlider.value);

        const weatherColors = {
            '晴': ['#6C8EBF', '#87CEEB', '#FF7F50', '#483D8B'],
            '多雲': ['#6C8EBF', '#87CEEB', '#DB714B', '#483D8B'],
            '陰': ['#606060', '#808080', '#696969', '#404040'],
            '陰有靄': ['#606060', '#808080', '#696969', '#404040'],
            '陰有雨': ['#606060', '#808080', '#696969', '#404040'],
            '陰有雷雨': ['#606060', '#808080', '#696969', '#404040'],
            '無法取得天氣資料': ['#f0f0f0', '#f0f0f0', '#f0f0f0', '#f0f0f0']
        };

        function parseColor(hex) {
            // 移除 #，轉大寫
            hex = hex.replace('#', '');
            if (hex.length === 3) {
                // 簡寫 #abc => #aabbcc
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return { r, g, b };
        }

        // 亮/暗處理 => amt >0 => 變亮, <0 => 變暗
        function lightenOrDarken({ r, g, b }, amt) {
            // clamp => 0~255
            const nr = Math.min(255, Math.max(0, r + amt));
            const ng = Math.min(255, Math.max(0, g + amt));
            const nb = Math.min(255, Math.max(0, b + amt));
            // 回成 #RRGGBB
            return '#' + nr.toString(16).padStart(2, '0')
                + ng.toString(16).padStart(2, '0')
                + nb.toString(16).padStart(2, '0');
        }

        // 建立漸層: top(稍微亮一些) => bottom(原色或稍暗)
        // 這裡 amt = 30 => 代表 top 亮 30, bottom 暗 30
        // 你可依需求微調
        function makeGradient(baseColor) {
            const c = parseColor(baseColor);
            const topColor = lightenOrDarken(c, 40);   // 上方比較亮
            const bottomColor = lightenOrDarken(c, -40); // 下方比較暗
            return `linear-gradient(to bottom, ${topColor}, ${bottomColor})`;
        }

        function getCloudBrightness(hour) {
            if (hour >= 5 && hour < 7) {
                return 0.8;
            } else if (hour >= 7 && hour < 16) {
                return 1.0;
            } else if (hour >= 16 && hour < 19) {
                return 0.8;
            } else {
                return 0.6;
            }
        }

        function getCloudFilter(weather, hour) {
            const brightness = getCloudBrightness(hour);
            const base = 'drop-shadow(0 0 5px rgba(0,0,0,0.5))';
            if (weather.includes('陰')) {
                let factor = 0.4;
                if (hour >= 7 && hour < 16) {
                    factor = 0.5; // 白天陰天稍微亮一點
                } else {
                    factor = 0.3; // 晚上更暗
                }
                return `${base} grayscale(100%) brightness(${factor})`;
            } else if (weather === '多雲') {
                if (hour >= 16 && hour < 19) {
                    // 黃昏
                    return `${base} sepia(1) hue-rotate(-30deg) brightness(${brightness}) saturate(5)`;
                } else {
                    return `${base} brightness(${brightness})`;
                }
            } else {
                // 晴 or 其他
                return `${base} brightness(${brightness})`;
            }
        }

        // 取得提示框元素與關閉按鈕
        const umbrellaNotification = document.getElementById('umbrellaNotification');
        const closeUmbrellaBtn = document.getElementById('closeUmbrellaBtn');

        /** 顯示提示框：加上 .show 觸發 CSS transition */
        function showUmbrellaNotification() {
            // 先將 display 設為 flex，等下一個事件循環再加上 show
            umbrellaNotification.style.display = 'flex';
            requestAnimationFrame(() => {
                umbrellaNotification.classList.add('show');
            });
        }

        /** 隱藏提示框：移除 .show，待 transition 結束後再設 display:none */
        function hideUmbrellaNotification() {
            umbrellaNotification.classList.remove('show');
            // 等 0.5 秒（和 CSS transition 時間一致），再隱藏
            setTimeout(() => {
                umbrellaNotification.style.display = 'none';
            }, 500);
        }


        // 點擊「×」按鈕後隱藏提示框
        closeUmbrellaBtn.addEventListener('click', () => {
            hideUmbrellaNotification();
        });

        document.addEventListener('click', (event) => {
            // 如果提示框本身是顯示中的狀態，而且點擊不在提示框內
            if (
                umbrellaNotification.classList.contains('show') &&
                !umbrellaNotification.contains(event.target)
            ) {
                hideUmbrellaNotification();
            }
        });
        async function initWeather() {
            const weatherUrl = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWA-F5269C99-76E7-4501-9A20-73782145C9CE&format=JSON&StationName=%E8%87%BA%E4%B8%AD&WeatherElement=Weather";
            const rainUrl = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-F5269C99-76E7-4501-9A20-73782145C9CE&locationName=%E8%87%BA%E4%B8%AD%E5%B8%82&elementName=Wx";

            try {
                // 獲取天氣狀況
                const weatherResponse = await fetch(weatherUrl);
                const weatherData = await weatherResponse.json();
                const weather = weatherData.records.Station[0].WeatherElement.Weather;
                //const weather = "陰";//debug用的
                console.log("天氣狀況：", weather);

                // 更新背景
                console.log("即將呼叫 updateBackground...");
                updateBackground(weather);


                // 獲取是否需要帶雨具
                const rainResponse = await fetch(rainUrl);
                const rainData = await rainResponse.json();
                const weatherElements = rainData.records.location[0].weatherElement[0].time;
                const firstWeather = weatherElements[0].parameter.parameterName;
                const secondWeather = weatherElements[1].parameter.parameterName;

                // 判斷是否需要提醒帶雨具
                if (firstWeather.includes("雨") || secondWeather.includes("雨")) {
                    showUmbrellaNotification();
                } else {
                    hideUmbrellaNotification();
                }
            } catch (error) {
                console.error("取得天氣資料時發生錯誤：", error);
                updateBackground("無法取得天氣資料");
                hideUmbrellaNotification();
            }
        }


        function updateBackground(weather) {
            // 確保 weather 是字串，若不是則使用預設值
            currentWeather = weather;
            console.log("updateBackground 被呼叫，接收到的 weather：", weather);
            if (typeof weather !== "string") {
                console.warn("接收到無效的天氣資料，使用預設值：無法取得天氣資料");
                weather = "無法取得天氣資料";
            }
            // 雷雨效果判斷
        // 雷雨效果判斷
        if (weather.includes('雷')) {
        canvas.style.display = 'block';
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);  // 清空畫布
    } else {
        canvas.style.display = 'none';
    }
            const colors = weatherColors[weather] || weatherColors['無法取得天氣資料'];

            let color;
            if (currentHour >= 5 && currentHour < 7) {
                color = colors[0]; // 清晨
            } else if (currentHour >= 7 && currentHour < 16) {
                color = colors[1]; // 白天
            } else if (currentHour >= 16 && currentHour < 19) {
                color = colors[2]; // 黃昏
            } else {
                color = colors[3]; // 夜晚
            }
            body.style.background = makeGradient(color);

    // 雲朵顯示/退出
    if (weather.includes('雲') || weather.includes('陰')) {
        console.log("顯示雲朵：目前天氣", weather);
        clouds.forEach((cloud, i) => {
    // 移除進入動畫的類別
    cloud.classList.remove('slideInRight', 'slideInLeft');
    // 加上退出動畫
    if (i < 5) {
        cloud.classList.add('cloudExitRight');
    } else {
        cloud.classList.add('cloudExitLeft');
    }
    // 無論目前 display 為何，均在 1 秒後隱藏
    setTimeout(() => {
        cloud.style.display = 'none';
    }, 1000);
});
    } else {
        console.log("隱藏雲朵：目前天氣", weather);
        clouds.forEach((cloud, i) => {
            cloud.classList.remove('slideInRight', 'slideInLeft');
    if (i < 5) {
        cloud.classList.add('cloudExitRight');
    } else {
        cloud.classList.add('cloudExitLeft');
    }
    // 無條件隱藏
    setTimeout(() => {
        cloud.style.display = 'none';
    }, 1000);
});
    }

            // 太陽顯示/隱藏
            if (currentHour >= 7 && currentHour < 19 && weather === '晴') {
                sun.style.display = 'block';
                requestAnimationFrame(() => {
        sun.style.animation = 'slideInDown 1s forwards';
    });
                console.log("顯示太陽：目前時間", currentHour, "天氣", weather); // 加入除錯訊息

            } else {
                if (sun.style.display === 'block') {
        sun.style.animation = 'slideOutUp 1s forwards';
        setTimeout(() => {
            sun.style.display = 'none';
        }, 1000);
    }
    console.log("隱藏太陽：目前時間", currentHour, "天氣", weather);
            }

            // ===== 新增霧效果控制 =====
            const fogWrapper = document.querySelector('.fogwrapper');
            if (weather.includes('靄')) {
                fogWrapper.style.display = 'block'; // 顯示霧
            } else {
                fogWrapper.style.display = 'none';  // 隱藏霧
            }


            // 雨滴顯示/隱藏
            if (weather.includes('雨')) {
                // 顯示 rain
                document.querySelectorAll('.rain').forEach(r => {
                    r.style.display = 'block';
                });
                makeItRain();
            } else {
                // 隱藏 rain
                document.querySelectorAll('.rain').forEach(r => {
                    r.style.display = 'none';
                    r.innerHTML = ''; // 清空雨滴
                });
            }

            // === 雨傘提示框顯示/隱藏 ===
            if (weather.includes('雨')) {
                showUmbrellaNotification();
            } else {
                hideUmbrellaNotification();
            }


        }

        function updateTimeDisplay() {
            timeDisplay.textContent = `${String(currentHour).padStart(2, '0')}:00`;
        }


        timeSlider.addEventListener('input', (e) => {
            currentHour = parseInt(e.target.value);
            updateTimeDisplay();
            updateBackground();
        });
        toggleTimeBtn.addEventListener('click', () => {
            acceleratedTime = !acceleratedTime;
            toggleTimeBtn.textContent = acceleratedTime ? '停用時間加速' : '啟用時間加速';
        });

        setInterval(() => {
            if (acceleratedTime) {
                currentHour = (currentHour + 1) % 24;
                timeSlider.value = currentHour;
                updateTimeDisplay();
                updateBackground();
            }
        }, 1000);

        // 初始化
        updateTimeDisplay();
        updateBackground();

        /* ============================
           2. 新增的「雨滴」程式
           ============================ */
        function makeItRain() {
            // 清空現有的雨滴
            $('.rain').empty();

            let increment = 0;
            let drops = "";
            let backDrops = "";

            while (increment < 100) {
                // random number between 98 and 1
                let randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
                // random number between 5 and 2
                let randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));

                increment += randoFiver;

                // front row
                drops += '<div class="drop" style="left: ' + increment + '%; bottom: '
                    + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.'
                    + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;">'
                    + '<div class="stem" style="animation-delay: 0.' + randoHundo
                    + 's; animation-duration: 0.5' + randoHundo + 's;"></div>'
                    + '<div class="splat" style="animation-delay: 0.' + randoHundo
                    + 's; animation-duration: 0.5' + randoHundo + 's;"></div>'
                    + '</div>';

                // back row
                backDrops += '<div class="drop" style="right: ' + increment + '%; bottom: '
                    + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.'
                    + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;">'
                    + '<div class="stem" style="animation-delay: 0.' + randoHundo
                    + 's; animation-duration: 0.5' + randoHundo + 's;"></div>'
                    + '<div class="splat" style="animation-delay: 0.' + randoHundo
                    + 's; animation-duration: 0.5' + randoHundo + 's;"></div>'
                    + '</div>';
            }

            $('.rain.front-row').append(drops);
            $('.rain.back-row').append(backDrops);
        }
        let map;
        let userMarker;
        let infoWindow;
        let panelOpenTime = 0;  // 紀錄面板開啟時間（毫秒）
        /* 全域變數：避免重複申請 Token、快取 Route Info */
        let globalTDXToken = null;
        let globalTokenExpireTime = 0; // 紀錄 Token 何時到期 (毫秒時間戳)
        const routeInfoCache = new Map(); // 路線資訊快取

        function startApp() {
            // 隱藏黑色透明玻璃
            document.getElementById('overlay').style.display = 'none';
            // 呼叫搜尋最近公車站的功能
            findNearestFiveStops();
        }


        async function initMap() {
            // 載入起點站終點站資料
            await loadRouteInfo();

            const initialCenter = { lat: 24.1508, lng: 120.6510 };
            map = new google.maps.Map(document.getElementById("map"), {
                center: initialCenter,
                zoom: 16,
                styles: [
                    { featureType: "poi", stylers: [{ visibility: "off" }] },
                    { featureType: "transit.station", stylers: [{ visibility: "off" }] }
                ]
            });
            infoWindow = new google.maps.InfoWindow();

            // 初始化天氣資料
            console.log("即將呼叫 initWeather...");
            await initWeather();

            // 綁定 Tab 切換事件
            document.getElementById('goBtn').addEventListener('click', () => showTab('go'));
            document.getElementById('backBtn').addEventListener('click', () => showTab('back'));

            // 綁定關閉按鈕事件
            document.getElementById('closeBtn').addEventListener('click', () => {
                closeInfoPanel();
            });

            // 點擊資訊面板本身則讓面板變大（展開更多資訊）
            const infoPanel = document.getElementById('infoPanel');
            infoPanel.addEventListener('click', (e) => {
                e.stopPropagation();
                if (infoPanel.classList.contains('open') && !infoPanel.classList.contains('big')) {
                    infoPanel.classList.add('big');
                }
            });

            // 地圖點擊事件：點擊 map (非 marker 或 infoPanel)時關閉面板
            map.addListener("click", () => {
                const infoPanel = document.getElementById('infoPanel');
                if (infoPanel.classList.contains('open')) {
                    closeInfoPanel();
                }
            });

            // 確保地圖 zoom 不低於 16
            google.maps.event.addListenerOnce(map, "idle", () => {
                if (map.getZoom() < 16) {
                    map.setZoom(16);
                }
            });
        }

        function closeInfoPanel() {
            const infoPanel = document.getElementById('infoPanel');
            infoPanel.classList.remove('big');
            infoPanel.classList.remove('open');
            setTimeout(() => {
                infoPanel.style.display = 'none';
            }, 600);
        }

        function showTab(tab) {
            const goBtn = document.getElementById('goBtn');
            const backBtn = document.getElementById('backBtn');
            const goContent = document.getElementById('goContent');
            const backContent = document.getElementById('backContent');

            if (tab === 'go') {
                goBtn.classList.add('active');
                backBtn.classList.remove('active');
                goContent.style.display = 'block'; // 顯示去程內容
                backContent.style.display = 'none'; // 隱藏回程內容
            } else if (tab === 'back') {
                goBtn.classList.remove('active');
                backBtn.classList.add('active');
                goContent.style.display = 'none'; // 隱藏去程內容
                backContent.style.display = 'block'; // 顯示回程內容
            }
        }

        function getDistance(lat1, lon1, lat2, lon2) {
            const R = 6378137;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }

        async function handleNearestStops(userLat, userLng) {
            console.log(`使用座標：lat=${userLat}, lng=${userLng}`);

            if (userMarker) userMarker.setMap(null);
            userMarker = new google.maps.Marker({
                position: { lat: userLat, lng: userLng },
                map: map,
                title: "我的位置",
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 2,
                    scale: 6,
                },
                zIndex: 9999,
            });

            try {
                const response = await fetch("json/bus_station_coordinates.json");
                const data = await response.json();
                const stops = [];
                for (const stationName in data) {
                    const stationData = data[stationName];
                    let coords = null;
                    if (stationData["去程"] && stationData["去程"]["經度"] && stationData["去程"]["緯度"]) {
                        coords = stationData["去程"];
                    } else if (stationData["回程"] && stationData["回程"]["經度"] && stationData["回程"]["緯度"]) {
                        coords = stationData["回程"];
                    } else {
                        console.warn(`站名 "${stationName}" 缺少經緯度資訊`);
                        continue;
                    }
                    const lat = parseFloat(coords["緯度"]);
                    const lng = parseFloat(coords["經度"]);
                    const dist = getDistance(userLat, userLng, lat, lng);
                    stops.push({ stationName, lat, lng, distance: dist, rawData: stationData });
                }

                stops.sort((a, b) => a.distance - b.distance);
                const nearestFive = stops.slice(0, 5);
                const bounds = new google.maps.LatLngBounds();
                bounds.extend({ lat: userLat, lng: userLng });

                nearestFive.forEach((stop) => {
                    const marker = new google.maps.Marker({
                        position: { lat: stop.lat, lng: stop.lng },
                        map: map,
                        icon: "http://maps.google.com/mapfiles/ms/icons/bus.png",
                    });

                    marker.addListener("click", async () => {
                        map.panTo(marker.getPosition());
                        const infoPanel = document.getElementById('infoPanel');
                        infoPanel.style.display = "block";
                        infoPanel.classList.remove('big');
                        void infoPanel.offsetWidth; // 強制 reflow
                        infoPanel.classList.add("open");

                        // 記錄開啟時間
                        panelOpenTime = Date.now();

                        document.getElementById('stationTitle').textContent = stop.stationName;
                        try {
                            const busData = await getBusArrivalTimes(stop.stationName);
                            await displayBusArrivalTimes(busData);
                        } catch (error) {
                            console.error("取得公車到站資料時發生錯誤：", error);
                            document.getElementById('goContent').innerHTML = "<p>無法取得去程資料</p>";
                            document.getElementById('backContent').innerHTML = "<p>無法取得回程資料</p>";
                        }
                        showTab('go');
                    });

                    bounds.extend({ lat: stop.lat, lng: stop.lng });
                });

                map.fitBounds(bounds);
                google.maps.event.addListenerOnce(map, "idle", () => {
                    if (map.getZoom() < 16) {
                        map.setZoom(16);
                    }
                });
            } catch (error) {
                console.error("載入或處理 JSON 時發生錯誤：", error);
            }
        }

        function findNearestFiveStops() {
            if (!navigator.geolocation) {
                console.error("瀏覽器不支援 geolocation。");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    handleNearestStops(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    console.error("無法取得使用者位置：", err);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        async function getBusArrivalTimes(stationName) {
            const clientId = 'niyangex-c9a03f8f-f658-4f40';
            const clientSecret = 'f0067ed7-d17c-422f-8306-491a54480a14';

            async function getAccessToken() {
                // 若有尚未到期的 Token，就直接用
                if (globalTDXToken && Date.now() < globalTokenExpireTime) {
                    return globalTDXToken;
                }

                // 否則，重新申請
                const url = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
                const params = new URLSearchParams();
                params.append('grant_type', 'client_credentials');
                params.append('client_id', clientId);
                params.append('client_secret', clientSecret);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: params.toString()
                });
                if (!response.ok) {
                    throw new Error("取得 TDX Token 失敗: HTTP " + response.status);
                }
                const data = await response.json();
                if (!data.access_token) {
                    throw new Error("取得 TDX Token 失敗: " + JSON.stringify(data));
                }

                // 記錄 Token 與過期時間 (data.expires_in 單位是秒)
                globalTDXToken = data.access_token;
                const expiresInSec = data.expires_in || 1800; // 預設 30 分鐘
                globalTokenExpireTime = Date.now() + expiresInSec * 1000;

                return globalTDXToken;
            }


            try {
                const token = await getAccessToken();
                const url = `https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/Taichung` +
                    `?$filter=StopName/Zh_tw eq '${stationName}'&$format=JSON`;
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                return data;
            } catch (error) {
                console.error("取得公車到站資料時發生錯誤：", error);
                throw error;
            }
        }

        async function getRouteInfo(routeName) {
            if (!routeInfoData) {
                console.error("尚未載入起點站終點站資料");
                return null;
            }

            // 從 routeInfoData 中查找路線資訊
            const routeInfo = routeInfoData[routeName];
            if (!routeInfo) {
                console.warn(`找不到路線 ${routeName} 的起點與終點資料`);
                return null;
            }

            return {
                DepartureStopNameZh: routeInfo["起點"],
                DestinationStopNameZh: routeInfo["終點"]
            };
        }


        /*************************************
         * 只需覆蓋以下函式：displayBusArrivalTimes
         *************************************/
        async function displayBusArrivalTimes(busData) {
            const goDiv = document.getElementById('goContent');
            const backDiv = document.getElementById('backContent');
            goDiv.innerHTML = "";
            backDiv.innerHTML = "";

            // 若無任何到站資料
            if (!Array.isArray(busData) || busData.length === 0) {
                goDiv.innerHTML = "<p>查無去程資料</p>";
                backDiv.innerHTML = "<p>查無回程資料</p>";
                return;
            }

            // 依「路線名稱」分組
            const routeMap = new Map();
            for (const item of busData) {
                const rName = item.RouteName?.Zh_tw || "未知路線";
                if (!routeMap.has(rName)) {
                    routeMap.set(rName, []);
                }
                routeMap.get(rName).push(item);
            }

            // 逐條路線分別處理
            for (const [routeName, items] of routeMap.entries()) {
                // 檢查該路線是否全部都「無預估時間」
                const hasAnyTime = items.some(b => b.EstimateTime || b.EstimateTime === 0);
                let routeInfo = null;

                // 若有至少一筆有預估時間，才呼叫 getRouteInfo (減少呼叫次數)
                if (hasAnyTime) {
                    // 先看快取
                    if (routeInfoCache.has(routeName)) {
                        routeInfo = routeInfoCache.get(routeName);
                    } else {
                        try {
                            routeInfo = await getRouteInfo(routeName);
                            routeInfoCache.set(routeName, routeInfo);
                        } catch (err) {
                            console.error("取得路線資訊失敗：", err);
                            // 若失敗，routeInfo 依舊是 null
                        }
                    }
                }

                // 取得起訖站名稱，若 routeInfo = null 就給「未知起點/終點」
                const depName = routeInfo?.DepartureStopNameZh || "未知起點";
                const destName = routeInfo?.DestinationStopNameZh || "未知終點";

                // 分出去程 (Direction=0) 與回程 (Direction=1)
                const goData = items.filter(b => b.Direction === 0);
                const backData = items.filter(b => b.Direction === 1);

                // 組合「去程」
                let goHtml = "";
                if (goData.length === 0) {
                    goHtml = `<p>【${routeName}】查無去程資料</p>`;
                } else {
                    for (const bus of goData) {
                        const t = bus.EstimateTime;
                        // 預設「尚無預估時間」 => 該行文字灰色 & 不顯示終點站
                        let arrivalText = "尚無預估時間";
                        let styleColor = "gray";
                        let showDest = false;

                        if (t || t === 0) {
                            // 表示有預估時間
                            if (t <= 180) {
                                arrivalText = (t === 0) ? "正在進站" : "即將抵達";
                            } else {
                                arrivalText = `${Math.floor(t / 60)} 分鐘後`;
                            }
                            styleColor = "black";   // 有預估時間 => 用黑色
                            showDest = true;        // 顯示終點站
                        }

                        // 若 showDest=false => 不顯示終點站
                        if (!showDest) {
                            goHtml += `<p style="color:${styleColor};">路線 <b>${routeName}</b> - ${arrivalText}</p>`;
                        } else {
                            goHtml += `<p style="color:${styleColor};">路線 <b>${routeName}</b> 往 <b>${destName}</b> - ${arrivalText}</p>`;
                        }
                    }
                }

                // 組合「回程」
                let backHtml = "";
                if (backData.length === 0) {
                    backHtml = `<p>【${routeName}】查無回程資料</p>`;
                } else {
                    for (const bus of backData) {
                        const t = bus.EstimateTime;
                        let arrivalText = "尚無預估時間";
                        let styleColor = "gray";
                        let showDep = false;

                        if (t || t === 0) {
                            if (t <= 180) {
                                arrivalText = (t === 0) ? "正在進站" : "即將抵達";
                            } else {
                                arrivalText = `${Math.floor(t / 60)} 分鐘後`;
                            }
                            styleColor = "black";
                            showDep = true;
                        }

                        if (!showDep) {
                            backHtml += `<p style="color:${styleColor};">路線 <b>${routeName}</b> - ${arrivalText}</p>`;
                        } else {
                            backHtml += `<p style="color:${styleColor};">路線 <b>${routeName}</b> 往 <b>${depName}</b> - ${arrivalText}</p>`;
                        }
                    }
                }

                document.getElementById('goContent').innerHTML += goHtml;
                document.getElementById('backContent').innerHTML += backHtml;
            }

            // 若最終 goDiv / backDiv 都是空 => 顯示無資料
            if (!goDiv.innerHTML) goDiv.innerHTML = "<p>查無去程資料</p>";
            if (!backDiv.innerHTML) backDiv.innerHTML = "<p>查無回程資料</p>";
        }