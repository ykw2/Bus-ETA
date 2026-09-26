// ==========================================
// 預設資料設定
// ==========================================
const DEFAULT_STOP_MAPPING = {
  "001704": "B337148DB333E5C4", // 蒲崗村道富山邨 (城巴 001704 -> 九巴 Hash)
};

const DEFAULT_STOPS = [
  { id: "1", company: "kmb", stop_id: "B337148DB333E5C4", stop_code: "WT357", route: "", stop_name: "富山邨 (WT357)" },
  { id: "2", company: "ctb", stop_id: "001704", stop_code: "001704", route: "116", stop_name: "富山邨蒲崗村道" },
];

// ==========================================
// 前台網頁範本 (HTML_FRONTEND)
// ==========================================
const HTML_FRONTEND = `<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>123巴膠恆到站時間表</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root { --kmb-red: #D20A11; --ctb-yellow: #0082CA; --bg-gray: #F2F2F4; --card-bg: #FFFFFF; --text-dark: #1A1A1A; --text-muted: #666666; --eta-blue: #0A539B; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background-color: var(--bg-gray); color: var(--text-dark); padding-bottom: 24px; -webkit-tap-highlight-color: transparent; }
        .header { background-color: var(--kmb-red); color: white; padding: 12px 16px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.18); display: flex; justify-content: space-between; align-items: center; }
        .header-title { font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px; }
        .header-btns { display: flex; gap: 8px; align-items: center; }
        .btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 20px; font-size: 0.9rem; cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 6px; }
        .spin-anim { animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        @keyframes redBlink {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.35; transform: scale(0.97); }
            100% { opacity: 1; transform: scale(1); }
        }
        .urgent-blink {
            background-color: #FDEDED !important;
            border-color: #F5C6CB !important;
            animation: redBlink 1.2s ease-in-out infinite;
        }
        .urgent-blink .eta-num {
            color: #D20A11 !important;
        }

        .bus-list { padding: 12px 10px; display: flex; flex-direction: column; gap: 10px; max-width: 600px; margin: 0 auto; }
        .bus-card { background: var(--card-bg); padding: 14px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border-left: 5px solid var(--kmb-red); }
        .bus-left { display: flex; flex-direction: column; width: 42%; gap: 2px; }
        
        .route-header { display: flex; align-items: center; gap: 6px; }
        .route-no { font-size: 1.6rem; font-weight: 900; color: #111; line-height: 1; }
        .co-badge { font-size: 0.6rem; font-weight: 700; padding: 2px 4px; border-radius: 4px; color: white; line-height: 1.2; text-transform: uppercase; }
        .co-joint { background: linear-gradient(135deg, #D20A11 50%, #0082CA 50%); }

        .bus-dest { font-size: 0.95rem; font-weight: 700; color: #222; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .stop-info { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; margin-top: 4px; display: flex; align-items: center; gap: 4px; word-break: break-word; }
        
        .eta-container { display: flex; gap: 4px; align-items: center; justify-content: flex-end; width: 58%; }
        .eta-slot { 
            background: #F8F9FA; 
            border: 1px solid #E5E5E5; 
            border-radius: 8px; 
            padding: 4px 2px; 
            text-align: center; 
            flex: 1; 
            min-width: 0; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            height: 58px; 
            gap: 2px;
        }
        .eta-slot.first { background: #EBF3FA; border-color: #B8D5F2; }
        .eta-num { font-size: 1rem; font-weight: 800; color: var(--eta-blue); line-height: 1.1; white-space: nowrap; }
        .eta-sub { font-size: 0.6rem; color: var(--text-muted); font-weight: 600; display: flex; justify-content: center; align-items: center; gap: 2px; line-height: 1; }
        
        .eta-rmk { 
            font-size: 0.55rem; 
            color: #666666; 
            font-weight: 600; 
            line-height: 1; 
            height: 12px; 
            width: 100%; 
            overflow: hidden; 
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .eta-rmk.is-scheduled { color: #198754; font-weight: 700; }
        .eta-rmk.is-last { color: #D20A11; font-weight: 700; }
        
        .rmk-text {
            display: inline-block;
            white-space: nowrap;
        }
        .marquee {
            display: inline-block;
            white-space: nowrap;
            padding-left: 100%;
            animation: marquee-anim 6s linear infinite;
        }

        @keyframes marquee-anim {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
        }

        .sub-co { font-size: 0.55rem; padding: 1px 3px; border-radius: 3px; color: white; font-weight: 700; zoom: 0.9; }
        .sub-kmb { background-color: #D20A11; }
        .sub-ctb { background-color: #0082CA; }

        .loading-box { text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 0.95rem; }

        .footer { text-align: center; padding: 16px 10px; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid #E5E5E5; margin-top: 20px; }
        .footer a { color: #D20A11; text-decoration: none; font-weight: 600; }
        .footer a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-title"><i class="fa-solid fa-bus"></i> 巴膠恆的到站時間表</div>
        <div class="header-btns">
            <a href="/admin" class="btn" title="後台管理"><i class="fa-solid fa-gear"></i></a>
            <button class="btn" onclick="manualRefresh()" title="更新數據"><i class="fa-solid fa-rotate-right" id="refreshIcon"></i> 更新</button>
        </div>
    </div>
    <div class="bus-list" id="busContainer">
        <div class="loading-box"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>正在搜尋路線與時間...</div>
    </div>

    <div class="footer">
        © 2026 巴膠恆的到站時間表. All rights reserved. | 聯絡我們：<a href="mailto:yukafa6@gmail.com">yukafa6@gmail.com</a>
    </div>

    <script>
        let pollTimer = null;

        async function fetchETA() {
            if (pollTimer) clearTimeout(pollTimer);
            let nextInterval = 30000;

            try {
                const response = await fetch('/api/eta?t=' + Date.now());
                const data = await response.json();
                const container = document.getElementById('busContainer');
                
                const validData = (data || []).filter(item => {
                    const activeEtas = (item.etas || []).filter(eta => eta !== null && eta !== undefined);
                    return activeEtas.length > 0;
                });

                if (validData.length === 0) {
                    container.innerHTML = '<div class="loading-box">暫無班次資料。</div>';
                } else {
                    let minEtaValue = 999;

                    container.innerHTML = validData.map(item => {
                        const activeEtas = (item.etas || []).filter(eta => eta !== null && eta !== undefined);

                        let etaSlotsHtml = '';
                        for (let i = 0; i < 3; i++) {
                            let etaObj = activeEtas[i] || null;
                            
                            if (etaObj) {
                                if (etaObj.min < minEtaValue) minEtaValue = etaObj.min;

                                let minText = '';
                                if (etaObj.min === 0) {
                                    minText = '即將到達';
                                } else if (etaObj.min < 0) {
                                    minText = '-';
                                } else {
                                    minText = etaObj.min + '分鐘';
                                }

                                let isUrgent = etaObj.min <= 2; 
                                let slotClass = isUrgent ? 'eta-slot urgent-blink' : (i === 0 ? 'eta-slot first' : 'eta-slot');
                                
                                let subCoHtml = '';
                                if (item.isJoint) {
                                    let coTagClass = etaObj.co === 'ctb' ? 'sub-ctb' : 'sub-kmb';
                                    let coTagName = etaObj.co === 'ctb' ? '城巴' : '九巴';
                                    subCoHtml = \`<span class="sub-co \${coTagClass}">\${coTagName}</span>\`;
                                }
                                
                                let rmkText = etaObj.rmk ? etaObj.rmk.trim() : '';
                                
                                let isScheduled = rmkText.includes('原定班次') || rmkText.includes('預定班次');
                                let isLast = rmkText.includes('最後班次');
                                
                                let rmkClass = 'eta-rmk';
                                if (isScheduled) rmkClass += ' is-scheduled';
                                if (isLast) rmkClass += ' is-last';
                                
                                let rmkHtml = \`<div class="\${rmkClass}" title="\${rmkText || '實時班次'}">
                                    <span class="rmk-text">\${rmkText}</span>
                                </div>\`;
                                
                                etaSlotsHtml += \`<div class="\${slotClass}"><div class="eta-num">\${minText}</div><div class="eta-sub">\${subCoHtml}<span>\${etaObj.time}</span></div>\${rmkHtml}</div>\`;
                            } else {
                                etaSlotsHtml += \`<div class="eta-slot"><div class="eta-num">-</div><div class="eta-sub"></div><div class="eta-rmk"></div></div>\`;
                            }
                        }
                        
                        let badgeHtml = item.isJoint ? '<span class="co-badge co-joint">聯營</span>' : '';
                        let cardBorder = (item.company === 'ctb' && !item.isJoint) ? '#0082CA' : '#D20A11';
                        
                        let displayStopName = (item.stop_name || '')
                            .replace(/\\s*\\([0-9A-Fa-f]{16}\\)/g, '')
                            .replace(/\\s*\\([0-9]{6}\\)/g, '')
                            .trim();
                        
                        return \`<div class="bus-card" style="border-left-color: \${cardBorder};"><div class="bus-left"><div class="route-header"><span class="route-no">\${item.route}</span>\${badgeHtml}</div><div class="bus-dest">往 \${item.bound}</div><div class="stop-info"><i class="fa-solid fa-location-dot"></i> \${displayStopName}</div></div><div class="eta-container">\${etaSlotsHtml}</div></div>\`;
                    }).join('');

                    checkMarquee();

                    if (minEtaValue <= 3) {
                        nextInterval = 10000;
                    }
                }
            } catch (err) { 
                console.error("載入時間資料失敗:", err); 
            } finally {
                pollTimer = setTimeout(fetchETA, nextInterval);
            }
        }

        function checkMarquee() {
            const rmkElems = document.querySelectorAll('.eta-rmk');
            rmkElems.forEach(container => {
                const textElem = container.querySelector('.rmk-text');
                if (textElem) {
                    if (textElem.scrollWidth > container.clientWidth) {
                        textElem.classList.add('marquee');
                    } else {
                        textElem.classList.remove('marquee');
                    }
                }
            });
        }

        async function manualRefresh() {
            const icon = document.getElementById('refreshIcon');
            icon.classList.add('spin-anim');
            await fetchETA();
            setTimeout(() => { icon.classList.remove('spin-anim'); }, 600);
        }

        fetchETA();
    </script>
</body>
</html>`;

// ==========================================
// 後台管理介面 HTML (HTML_ADMIN)
// ==========================================
const HTML_ADMIN = `<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>巴士站點管理後台</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root { --kmb-red: #D20A11; --bg-gray: #F4F6F9; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        body { background: var(--bg-gray); padding: 20px; color: #333; max-width: 800px; margin: 0 auto; }
        h2 { margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-weight: 600; margin-bottom: 5px; font-size: 0.9rem; }
        input, select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.95rem; }
        .btn-submit { background: var(--kmb-red); color: white; border: none; padding: 12px; border-radius: 6px; width: 100%; font-weight: bold; cursor: pointer; font-size: 1rem; }
        .btn-search { background: #0082CA; color: white; border: none; padding: 10px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.9rem; margin-top: 5px; width: 100%; }
        .btn-action { background: #6c757d; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 6px; }
        .btn-action:hover { opacity: 0.9; }
        .stop-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; }
        .stop-item:last-child { border-bottom: none; }
        .stop-title { font-weight: bold; font-size: 1rem; }
        .stop-sub { font-size: 0.8rem; color: #666; margin-top: 2px; }
        .btn-del { background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
        .back-link { text-decoration: none; color: #555; font-size: 0.9rem; }
        .search-results { max-height: 250px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; margin-top: 5px; display: none; background: #fff; }
        .search-result-item { padding: 10px 12px; font-size: 0.85rem; border-bottom: 1px solid #f2f2f2; cursor: pointer; }
        .search-result-item:hover { background: #f8f9fa; }
        .badge-outbound { background-color: #0082CA; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.7rem; }
        .badge-inbound { background-color: #198754; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.7rem; }
        .badge-stopcode { background-color: #D20A11; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold; font-size: 0.75rem; font-family: monospace; }
        .note-box { font-size: 0.82rem; color: #666; background: #f8f9fa; border-left: 3px solid #0082CA; padding: 8px 12px; margin-bottom: 15px; border-radius: 0 4px 4px 0; }
        .backup-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
    </style>
</head>
<body>
    <h2>
        <span><i class="fa-solid fa-sliders"></i> 巴士站點管理後台</span>
        <a href="/" class="back-link"><i class="fa-solid fa-arrow-left"></i> 返回前台</a>
    </h2>

    <div class="card">
        <h3 style="margin-bottom:15px;"><i class="fa-solid fa-file-export"></i> 匯出與匯入設定</h3>
        <div class="note-box">
            您可以備份目前所有的站點清單（包含站號 BS Code）與對照表，或將 JSON 設定檔匯入還原。
        </div>
        <div class="backup-btns">
            <button class="btn-action" style="background:#28a745;" onclick="exportConfig()"><i class="fa-solid fa-download"></i> 匯出設定 (JSON)</button>
            <button class="btn-action" style="background:#17a2b8;" onclick="document.getElementById('importFile').click()"><i class="fa-solid fa-upload"></i> 匯入設定</button>
            <input type="file" id="importFile" accept=".json" style="display:none" onchange="importConfig(event)">
        </div>
    </div>

    <div class="card">
        <h3 style="margin-bottom:15px;"><i class="fa-solid fa-plus-circle"></i> 新增巴士站</h3>
        <form id="addForm">
            <div class="form-group">
                <label>巴士公司</label>
                <select id="company" onchange="updateSearchPlaceholder()">
                    <option value="kmb">九巴 (KMB)</option>
                    <option value="ctb">城巴 (CTB)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label id="searchLabel">搜尋站名 / 路線號碼</label>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="searchKeyword" placeholder="例如: 富山邨、黃大仙">
                    <button type="button" class="btn-search" style="width: auto; margin-top: 0;" onclick="searchStopsAPI()">搜尋</button>
                </div>
                <div id="searchResults" class="search-results"></div>
            </div>

            <div class="form-group">
                <label>站點 ID / Hash ID</label>
                <input type="text" id="stop_id" placeholder="例如: CF89BD775D2ABDC9" required>
            </div>

            <div class="form-group">
                <label>巴士站號 (Stop Code)</label>
                <input type="text" id="stop_code" placeholder="例如: WT359 (九巴站號)">
            </div>

            <div class="form-group">
                <label>路線號碼 (Route) <span style="font-weight:normal; color:#888;">(城巴必需輸入，例如: 116)</span></label>
                <input type="text" id="route" placeholder="例如: 116, E22 (九巴可留空)">
            </div>
            <div class="form-group">
                <label>自訂巴士站名稱</label>
                <input type="text" id="stop_name" placeholder="例如: 富山邨 (WT359)" required>
            </div>
            <button type="submit" class="btn-submit">新增站點</button>
        </form>
    </div>

    <div class="card">
        <h3 style="margin-bottom:15px;"><i class="fa-solid fa-list"></i> 目前監控的巴士站</h3>
        <div id="stopsList">正在載入站點...</div>
    </div>

    <div class="card">
        <h3 style="margin-bottom:10px;"><i class="fa-solid fa-link"></i> 聯營路線站號對照設定</h3>
        <div class="note-box">
            用途：當監控城巴/九巴站點時，綁定對應的九巴 Hash Stop ID 與城巴 Stop ID。請直接從下方已監控的站點清單中選取。
        </div>
        <form id="mapForm" style="margin-bottom: 20px;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 140px;">
                    <label>城巴站點 (從已監控站點選取)</label>
                    <select id="ctb_stop_id" required>
                        <option value="">載入中...</option>
                    </select>
                </div>
                <div style="flex: 1; min-width: 180px;">
                    <label>九巴站點 (從已監控站點選取)</label>
                    <select id="kmb_hash_id" required>
                        <option value="">載入中...</option>
                    </select>
                </div>
                <div style="min-width: 100px; display: flex; align-items: flex-end;">
                    <button type="submit" class="btn-submit" style="background-color: #28a745;">新增綁定</button>
                </div>
            </div>
        </form>
        <div id="mappingList">正在載入對照表...</div>
    </div>

    <script>
        let allStopsCache = { kmb: [], ctb: {} };
        let currentStopsCache = [];

        function updateSearchPlaceholder() {
            clearSearch();
            const company = document.getElementById('company').value;
            const input = document.getElementById('searchKeyword');
            if (company === 'kmb') {
                input.placeholder = "例如: 富山邨、黃大仙";
            } else {
                input.placeholder = "輸入路線號碼，例如: 116, E22, A21";
            }
        }

        async function loadStops() {
            const res = await fetch('/api/stops');
            const stops = await res.json();
            currentStopsCache = stops;
            
            const container = document.getElementById('stopsList');
            if(stops.length === 0) {
                container.innerHTML = '<div style="color:#888;">目前沒有任何站點</div>';
            } else {
                container.innerHTML = stops.map(s => \`
                    <div class="stop-item">
                        <div>
                            <div class="stop-title">\${s.stop_name}</div>
                            <div class="stop-sub">\${s.company.toUpperCase()}\${s.route ? ' | 路線: ' + s.route : ''} | 站號: \${s.stop_code || '-'} | ID: \${s.stop_id}</div>
                        </div>
                        <button class="btn-del" onclick="deleteStop('\${s.id}')"><i class="fa-solid fa-trash"></i> 刪除</button>
                    </div>
                \`).join('');
            }

            updateMappingDropdowns();
        }

        function updateMappingDropdowns() {
            const ctbSelect = document.getElementById('ctb_stop_id');
            const kmbSelect = document.getElementById('kmb_hash_id');

            const ctbStops = currentStopsCache.filter(s => s.company === 'ctb');
            const kmbStops = currentStopsCache.filter(s => s.company === 'kmb');

            ctbSelect.innerHTML = ctbStops.length > 0 
                ? '<option value="">請選擇城巴站點</option>' + ctbStops.map(s => \`<option value="\${s.stop_id}">\${s.stop_name} (ID: \${s.stop_id})</option>\`).join('')
                : '<option value="">(無可用城巴站點，請先新增)</option>';

            kmbSelect.innerHTML = kmbStops.length > 0 
                ? '<option value="">請選擇九巴站點</option>' + kmbStops.map(s => \`<option value="\${s.stop_id}">\${s.stop_name} (ID: \${s.stop_id})</option>\`).join('')
                : '<option value="">(無可用九巴站點，請先新增)</option>';
        }

        async function loadMapping() {
            const res = await fetch('/api/mapping');
            const mapping = await res.json();
            const container = document.getElementById('mappingList');
            const keys = Object.keys(mapping);
            
            if(keys.length === 0) {
                container.innerHTML = '<div style="color:#888;">目前沒有任何站號對照綁定</div>';
                return;
            }
            container.innerHTML = keys.map(ctbId => \`
                <div class="stop-item">
                    <div>
                        <div class="stop-title">城巴 ID: <span style="color:#0082CA;">\${ctbId}</span></div>
                        <div class="stop-sub">對應九巴 Hash: <span style="font-family:monospace; color:#D20A11;">\${mapping[ctbId]}</span></div>
                    </div>
                    <button class="btn-del" onclick="deleteMapping('\${ctbId}')"><i class="fa-solid fa-trash"></i> 刪除</button>
                </div>
            \`).join('');
        }

        async function exportConfig() {
            try {
                const res = await fetch('/api/config/export');
                const config = await res.json();
                const jsonStr = JSON.stringify(config, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`bus_config_\${new Date().toISOString().slice(0,10)}.json\`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch(e) {
                alert('匯出失敗：' + e.message);
            }
        }

        function importConfig(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const config = JSON.parse(e.target.result);
                    if (!confirm('匯入設定將會覆蓋現有的站點與綁定，確定要繼續嗎？')) return;

                    const res = await fetch('/api/config/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(config)
                    });
                    const result = await res.json();
                    if (result.success) {
                        alert('設定匯入成功！');
                        loadStops();
                        loadMapping();
                    } else {
                        alert('匯入失敗：' + (result.message || '未知錯誤'));
                    }
                } catch (err) {
                    alert('檔案格式錯誤，請確認是否為有效的 JSON 設定檔');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        function clearSearch() {
            document.getElementById('searchResults').style.display = 'none';
            document.getElementById('searchResults').innerHTML = '';
        }

        function selectStopFromElement(el) {
            const id = el.getAttribute('data-id');
            const code = el.getAttribute('data-code') || '';
            const rawName = el.getAttribute('data-name') || '';
            const route = el.getAttribute('data-route') || '';

            document.getElementById('stop_id').value = id;
            document.getElementById('stop_code').value = code;

            if (code && !rawName.includes(code)) {
                document.getElementById('stop_name').value = \`\${rawName.trim()} (\${code})\`;
            } else {
                document.getElementById('stop_name').value = rawName.trim();
            }

            if (route) {
                document.getElementById('route').value = route;
            }
            document.getElementById('searchResults').style.display = 'none';
        }

        async function searchStopsAPI() {
            const company = document.getElementById('company').value;
            const keyword = document.getElementById('searchKeyword').value.trim();
            const resultsDiv = document.getElementById('searchResults');

            if (!keyword) {
                alert(company === 'kmb' ? '請輸入搜尋關鍵字（如：富山）' : '請輸入城巴路線號碼（如：116, E22）');
                return;
            }

            resultsDiv.innerHTML = '<div class="search-result-item"><i class="fa-solid fa-spinner fa-spin"></i> 搜尋中...</div>';
            resultsDiv.style.display = 'block';

            try {
                if (company === 'kmb') {
                    if (allStopsCache.kmb.length === 0) {
                        const res = await fetch('https://data.etabus.gov.hk/v1/transport/kmb/stop');
                        const json = await res.json();
                        if (json && json.data) allStopsCache.kmb = json.data;
                    }

                    const list = allStopsCache.kmb;
                    const matched = list.filter(s => {
                        const nameTc = s.name_tc || '';
                        const nameEn = s.name_en || '';
                        const stopCode = s.stop || '';
                        return nameTc.includes(keyword) || nameEn.toLowerCase().includes(keyword.toLowerCase()) || stopCode.toLowerCase().includes(keyword.toLowerCase());
                    }).slice(0, 30);

                    if (matched.length === 0) {
                        resultsDiv.innerHTML = '<div class="search-result-item" style="color:#888;">找不到符合的九巴站點</div>';
                        return;
                    }

                    resultsDiv.innerHTML = matched.map(s => {
                        const stopHash = s.stop;
                        const stopCode = s.stop; 
                        const nameTc = s.name_tc || '';
                        return \`<div class="search-result-item" data-id="\${stopHash}" data-code="\${stopCode}" data-route="" data-name="\${nameTc}" onclick="selectStopFromElement(this)">
                            <strong>\${nameTc}</strong> <span class="badge-stopcode">\${stopCode}</span><br>
                            <span style="font-family:monospace; color:#0082CA; font-size:0.75rem;">ID: \${stopHash}</span>
                        </div>\`;
                    }).join('');

                } else if (company === 'ctb') {
                    const route = keyword.toUpperCase();
                    const [routeRes, outRes, inRes] = await Promise.all([
                        fetch(\`https://rt.data.gov.hk/v2/transport/citybus/route/ctb/\${route}\`).catch(() => null),
                        fetch(\`https://rt.data.gov.hk/v2/transport/citybus/route-stop/ctb/\${route}/outbound\`).catch(() => null),
                        fetch(\`https://rt.data.gov.hk/v2/transport/citybus/route-stop/ctb/\${route}/inbound\`).catch(() => null)
                    ]);

                    let origTc = '', destTc = '';
                    if (routeRes && routeRes.ok) {
                        const routeJson = await routeRes.json();
                        if (routeJson && routeJson.data) {
                            origTc = routeJson.data.orig_tc || '';
                            destTc = routeJson.data.dest_tc || '';
                        }
                    }

                    let stopsWithDir = [];
                    if (outRes && outRes.ok) {
                        const outData = await outRes.json();
                        if (outData && outData.data) {
                            outData.data.forEach(item => {
                                stopsWithDir.push({
                                    stop: item.stop,
                                    dir: 'outbound',
                                    dest: destTc ? \`往 \${destTc}\` : '去程'
                                });
                            });
                        }
                    }

                    if (inRes && inRes.ok) {
                        const inData = await inRes.json();
                        if (inData && inData.data) {
                            inData.data.forEach(item => {
                                stopsWithDir.push({
                                    stop: item.stop,
                                    dir: 'inbound',
                                    dest: origTc ? \`往 \${origTc}\` : '回程'
                                });
                            });
                        }
                    }

                    if (stopsWithDir.length === 0) {
                        resultsDiv.innerHTML = \`<div class="search-result-item" style="color:#888;">找不到城巴路線 \${route}，請確認路線號碼（如：116, E22）</div>\`;
                        return;
                    }

                    resultsDiv.innerHTML = \`<div class="search-result-item"><i class="fa-solid fa-spinner fa-spin"></i> 正在獲取路線 \${route} 站點詳細名稱...</div>\`;

                    const uniqueStopIds = [...new Set(stopsWithDir.map(s => s.stop))];
                    await Promise.all(uniqueStopIds.map(async (id) => {
                        if (!allStopsCache.ctb[id]) {
                            try {
                                const res = await fetch(\`https://rt.data.gov.hk/v2/transport/citybus/stop/\${id}\`);
                                if (res.ok) {
                                    const json = await res.json();
                                    if (json && json.data) allStopsCache.ctb[id] = json.data;
                                }
                            } catch (e) {}
                        }
                    }));

                    resultsDiv.innerHTML = stopsWithDir.map(s => {
                        const stopData = allStopsCache.ctb[s.stop] || { stop: s.stop, name_tc: \`站點 \${s.stop}\` };
                        const stopId = s.stop;
                        const nameTc = stopData.name_tc || '';
                        const isOutbound = s.dir === 'outbound';
                        const badgeClass = isOutbound ? 'badge-outbound' : 'badge-inbound';
                        const badgeText = isOutbound ? '去程' : '回程';
                        
                        return \`<div class="search-result-item" data-id="\${stopId}" data-code="\${stopId}" data-route="\${route}" data-name="\${nameTc}" onclick="selectStopFromElement(this)">
                            <strong>\${nameTc}</strong><br>
                            <span style="font-family:monospace; color:#333; font-size:0.75rem;">
                                <span class="\${badgeClass}">\${badgeText}</span> <strong>\${s.dest}</strong> | 路線: \${route} | ID: \${stopId}
                            </span>
                        </div>\`;
                    }).join('');
                }
            } catch (err) {
                resultsDiv.innerHTML = '<div class="search-result-item" style="color:red;">搜尋失敗，請再試一次</div>';
            }
        }

        document.getElementById('addForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const company = document.getElementById('company').value;
            const stop_id = document.getElementById('stop_id').value.trim();
            const stop_code = document.getElementById('stop_code').value.trim();
            const route = document.getElementById('route').value.trim().toUpperCase();
            const stop_name = document.getElementById('stop_name').value.trim();
            
            const res = await fetch('/api/stops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company, stop_id, stop_code, route, stop_name })
            });
            const result = await res.json();
            if (!result.success) {
                alert(result.message || '新增失敗');
                return;
            }

            document.getElementById('stop_id').value = '';
            document.getElementById('stop_code').value = '';
            document.getElementById('route').value = '';
            document.getElementById('stop_name').value = '';
            document.getElementById('searchKeyword').value = '';
            loadStops();
        });

        document.getElementById('mapForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const ctb_stop_id = document.getElementById('ctb_stop_id').value;
            const kmb_hash_id = document.getElementById('kmb_hash_id').value;
            
            if (!ctb_stop_id || !kmb_hash_id) {
                alert('請完整選擇城巴與九巴站點');
                return;
            }

            await fetch('/api/mapping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ctb_stop_id, kmb_hash_id })
            });
            loadMapping();
        });

        async function deleteStop(id) {
            if(!confirm('確定要刪除此巴士站嗎？')) return;
            await fetch('/api/stops?id=' + id, { method: 'DELETE' });
            loadStops();
        }

        async function deleteMapping(ctb_stop_id) {
            if(!confirm('確定要刪除此對照綁定嗎？')) return;
            await fetch('/api/mapping?ctb_stop_id=' + ctb_stop_id, { method: 'DELETE' });
            loadMapping();
        }

        loadStops();
        loadMapping();
    </script>
</body>
</html>`;

// ==========================================
// 後端資料庫 (KV) 與 API 解析邏輯
// ==========================================

// 解析時間與中文備註（允許過期最多 2 分鐘，避免車還在站但提早被濾除）
function parseETAData(etaStr, company, rmk_tc) {
  if (!etaStr) return null;
  try {
    const etaDate = new Date(etaStr);
    const now = new Date();
    const diffMs = etaDate - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    
    // 允許已過時 2 分鐘內的班次繼續保留，避免車還在站但被強制抹去
    if (diffMinutes < -2) return null;

    const timeString = etaDate.toLocaleTimeString('zh-HK', {
      timeZone: 'Asia/Hong_Kong',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(/[上午下午]/g, '').trim();
    
    return {
      min: diffMinutes,
      time: timeString,
      co: company,
      rmk: rmk_tc ? rmk_tc.trim() : ""
    };
  } catch (e) {
    return null;
  }
}

// 從 KV 讀取站點清單
async function getStops(env) {
  if (env.BUS_KV) {
    const saved = await env.BUS_KV.get("STOPS_LIST", { type: "json" });
    if (saved) return saved;
  }
  return DEFAULT_STOPS;
}

// 從 KV 讀取對照表 (STOP_MAPPING)
async function getStopMapping(env) {
  if (env.BUS_KV) {
    const saved = await env.BUS_KV.get("STOP_MAPPING", { type: "json" });
    if (saved) return saved;
  }
  return DEFAULT_STOP_MAPPING;
}

// 抓取 ETA 數據並進行聯營班次整合
async function getETA(env) {
  const STOPS_LIST = await getStops(env);
  const STOP_MAPPING = await getStopMapping(env);

  // 建立九巴站點名稱對照表 (KMB Hash -> stop_name)
  const kmbStopMap = new Map();
  STOPS_LIST.forEach(s => {
    if (s.company === 'kmb') {
      kmbStopMap.set(s.stop_id, s.stop_name);
    }
  });

  // 建立反向對照表 (KMB Hash -> CTB Stop ID)
  const REVERSE_MAPPING = {};
  for (const [ctbId, kmbHash] of Object.entries(STOP_MAPPING)) {
    if (kmbHash) {
      REVERSE_MAPPING[kmbHash] = ctbId;
    }
  }

  const customHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json"
  };

  const routeMap = new Map();

  await Promise.all(
    STOPS_LIST.map(async (stop) => {
      try {
        let ctbStopId = null;
        let kmbHashId = null;

        if (stop.company === "kmb") {
          kmbHashId = stop.stop_id;
          ctbStopId = REVERSE_MAPPING[stop.stop_id] || null;
        } else {
          ctbStopId = stop.stop_id;
          kmbHashId = STOP_MAPPING[stop.stop_id] || null;
        }

        let requests = [];

        if (kmbHashId) {
          requests.push({
            url: `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${kmbHashId}`,
            defaultCo: 'kmb'
          });
        }

        if (ctbStopId) {
          const ctbUrl = stop.route 
            ? `https://rt.data.gov.hk/v2/transport/citybus/eta/ctb/${ctbStopId}/${stop.route}`
            : `https://rt.data.gov.hk/v2/transport/citybus/eta/ctb/${ctbStopId}`;
          
          requests.push({ url: ctbUrl, defaultCo: 'ctb' });
        }

        const responses = await Promise.all(
          requests.map(req => 
            fetch(req.url, {
              headers: customHeaders,
              signal: AbortSignal.timeout(4000),
              cf: { cacheTtl: 0 }
            }).then(res => res.ok ? res.json() : null).catch(() => null)
          )
        );

        responses.forEach((data, index) => {
          if (data && Array.isArray(data.data)) {
            const reqInfo = requests[index];
            data.data.forEach((e) => {
              if (!e.eta || !e.route) return;
              
              if (stop.route && e.route.toUpperCase() !== stop.route.toUpperCase()) return;

              const rmkText = e.rmk_tc || e.rmk_sc || e.rmk_en || "";
              const rawCo = (e.co || reqInfo.defaultCo || "").toLowerCase();
              const itemCo = (rawCo === 'ctb' || rawCo === 'nwfb' || rawCo === 'citybus') ? 'ctb' : 'kmb';

              const etaObj = parseETAData(e.eta, itemCo, rmkText);
              if (etaObj === null) return;

              const rawDest = (e.dest_tc || "目的地").replace(/湧/g, "涌").trim();
              const groupDest = rawDest.replace(/\s*\(.*?\)/g, "").trim();

              const canonicalId = ctbStopId || kmbHashId || stop.stop_id;
              const key = `${e.route}_${groupDest}_${canonicalId}`;

              let displayStopName = stop.stop_name;
              if (kmbHashId && kmbStopMap.has(kmbHashId)) {
                displayStopName = kmbStopMap.get(kmbHashId);
              } else if (stop.company === 'ctb' && ctbStopId) {
                for (const [kmbHash, ctbId] of Object.entries(STOP_MAPPING)) {
                  if (ctbId === ctbStopId && kmbStopMap.has(kmbHash)) {
                    displayStopName = kmbStopMap.get(kmbHash);
                    break;
                  }
                }
              }

              if (!routeMap.has(key)) {
                routeMap.set(key, {
                  route: e.route,
                  company: stop.company,
                  bound: groupDest,
                  stop_name: displayStopName, 
                  companiesFound: new Set([itemCo]),
                  etas: []
                });
              } else {
                routeMap.get(key).companiesFound.add(itemCo);
              }

              const existingList = routeMap.get(key).etas;
              if (!existingList.some(item => item.min === etaObj.min && item.co === etaObj.co)) {
                existingList.push(etaObj);
              }
            });
          }
        });
      } catch (err) {
        console.error(`[${stop.company}] 站點 ${stop.stop_name} 抓取失敗`);
      }
    })
  );

  let results = Array.from(routeMap.values()).map((item) => {
    item.etas.sort((a, b) => a.min - b.min);
    item.etas = item.etas.slice(0, 3);
    
    const JOINT_LIST = [
        "101", "102", "103", "104", "106", "107", "109", "111", "112", "113", "115", "116", "118", 
        "170", "171", "307", "601", "606", "619", "621", "641", "671", "678", "680", "681", "690", "694S", 
        "904", "905", "907B", "907C", "914", "936", "948", "980A", "980X", "981P", "982X", "985", 
        "E23", "E23A", "R8", "S1"
    ];
    const baseRoute = item.route.replace(/[A-Za-z]+$/, '');
    const isKnownJoint = JOINT_LIST.includes(item.route) || JOINT_LIST.includes(baseRoute);

    item.isJoint = item.companiesFound.size > 1 || item.etas.some(e => e.co !== item.company) || isKnownJoint;
    
    return item;
  });

  results.sort((a, b) => {
    const minA = a.etas[0]?.min ?? 999999;
    const minB = b.etas[0]?.min ?? 999999;
    return minA - minB;
  });

  return results;
}

// ==========================================
// Worker 主請求轉發處理器
// ==========================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(HTML_FRONTEND, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    if (url.pathname === "/admin") {
      return new Response(HTML_ADMIN, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    if (url.pathname === "/api/eta") {
      const results = await getETA(env);
      return new Response(JSON.stringify(results), {
        headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" }
      });
    }

    if (url.pathname === "/api/config/export") {
      const stops = await getStops(env);
      const mapping = await getStopMapping(env);
      const configData = {
        version: 1,
        exported_at: new Date().toISOString(),
        stops: stops,
        mapping: mapping
      };
      return new Response(JSON.stringify(configData, null, 2), {
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "content-disposition": "attachment; filename=bus_config.json"
        }
      });
    }

    if (url.pathname === "/api/config/import" && request.method === "POST") {
      try {
        const body = await request.json();
        if (body && Array.isArray(body.stops) && typeof body.mapping === "object") {
          if (env.BUS_KV) {
            await env.BUS_KV.put("STOPS_LIST", JSON.stringify(body.stops));
            await env.BUS_KV.put("STOP_MAPPING", JSON.stringify(body.mapping));
          }
          return new Response(JSON.stringify({ success: true }), { headers: { "content-type": "application/json;charset=UTF-8" } });
        } else {
          return new Response(JSON.stringify({ success: false, message: "無效的設定資料格式" }), { status: 400, headers: { "content-type": "application/json;charset=UTF-8" } });
        }
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500, headers: { "content-type": "application/json;charset=UTF-8" } });
      }
    }

    if (url.pathname === "/api/stops") {
      let stops = await getStops(env);

      if (request.method === "GET") {
        return new Response(JSON.stringify(stops), { headers: { "content-type": "application/json;charset=UTF-8" } });
      }

      if (request.method === "POST") {
        const body = await request.json();
        const company = body.company;
        const stop_id = body.stop_id;
        const route = (body.route || "").toUpperCase();

        const isDuplicate = stops.some(s => 
          s.company === company && 
          s.stop_id === stop_id && 
          (s.route || "").toUpperCase() === route
        );

        if (isDuplicate) {
          return new Response(JSON.stringify({ success: false, message: "此巴士站與路線已經存在清單中，無法重複新增！" }), { 
            status: 400, 
            headers: { "content-type": "application/json;charset=UTF-8" } 
          });
        }

        const newStop = {
          id: Date.now().toString(),
          company: company,
          stop_id: stop_id,
          stop_code: body.stop_code || stop_id,
          route: body.route || "",
          stop_name: body.stop_name
        };
        stops.push(newStop);
        if (env.BUS_KV) {
          await env.BUS_KV.put("STOPS_LIST", JSON.stringify(stops));
        }
        return new Response(JSON.stringify({ success: true, stops }), { headers: { "content-type": "application/json;charset=UTF-8" } });
      }

      if (request.method === "DELETE") {
        const delId = url.searchParams.get("id");
        stops = stops.filter(s => s.id !== delId);
        if (env.BUS_KV) {
          await env.BUS_KV.put("STOPS_LIST", JSON.stringify(stops));
        }
        return new Response(JSON.stringify({ success: true, stops }), { headers: { "content-type": "application/json;charset=UTF-8" } });
      }
    }

    if (url.pathname === "/api/mapping") {
      let mapping = await getStopMapping(env);

      if (request.method === "GET") {
        return new Response(JSON.stringify(mapping), { headers: { "content-type": "application/json;charset=UTF-8" } });
      }

      if (request.method === "POST") {
        const body = await request.json();
        const { ctb_stop_id, kmb_hash_id } = body;
        if (ctb_stop_id && kmb_hash_id) {
          mapping[ctb_stop_id] = kmb_hash_id;
          if (env.BUS_KV) {
            await env.BUS_KV.put("STOP_MAPPING", JSON.stringify(mapping));
          }
        }
        return new Response(JSON.stringify({ success: true, mapping }), { headers: { "content-type": "application/json;charset=UTF-8" } });
      }

      if (request.method === "DELETE") {
        const ctb_stop_id = url.searchParams.get("ctb_stop_id");
        if (ctb_stop_id && mapping[ctb_stop_id]) {
          delete mapping[ctb_stop_id];
          if (env.BUS_KV) {
            await env.BUS_KV.put("STOP_MAPPING", JSON.stringify(mapping));
          }
        }
        return new Response(JSON.stringify({ success: true, mapping }), { headers: { "content-type": "application/json;charset=UTF-8" } });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};