function main(config) {
  // 基于旧工作区最后的 Ronyo Overrides.js 增量增强，不修改 DNS 或订阅源。
  const SETTINGS = {
    pinnedRegions: ["US", "SG", "JP", "HK", "UK"],
    showAllAvailableRegions: false,  // true：所有有节点国家组都显示在顶层
    economyMaxRate: 1,             // 只允许明确标注 <=1x 的非家宽节点
    directDomesticVideo: true      // B站等国内视频网站直连；false 为保持 Firefox 代理优先
  };

  config["find-process-mode"] = "always";

  // 保留手动选中节点，避免 Clash Party 重启后恢复为其他出口。
  // 当所选节点从订阅中消失时，AI 组默认回到 REJECT，不自动换 IP。
  config.profile = (config.profile && typeof config.profile === "object" && !Array.isArray(config.profile))
    ? config.profile : {};
  config.profile["store-selected"] = true;

  // =====================================================
  // 1. 读取 Sub-Store 融合后的真实节点
  // =====================================================

  const proxyNames = [
    ...new Set(
      (Array.isArray(config.proxies) ? config.proxies : [])
        .map(p => p && p.name)
        .filter(n => typeof n === "string" && n.trim())
    )
  ];

  // =====================================================
  // 2. 家宽 / 住宅识别
  // =====================================================

  const isHome = name =>
    /(家宽|家庭宽带|宽带|住宅\s*IP|住宅|Residential|Home\s*IP|Home|Broadband)/i.test(name);

  // =====================================================
  // 3. 国家 / 地区识别
  // =====================================================

  const regions = [
    { code: "US", regex: /美国|🇺🇸|United\s*States|USA/i, shortCodes: ["US"] },
    { code: "SG", regex: /新加坡|狮城|🇸🇬|Singapore/i, shortCodes: ["SG"] },
    { code: "JP", regex: /日本|🇯🇵|Japan/i, shortCodes: ["JP"] },
    { code: "HK", regex: /香港|🇭🇰|Hong\s*Kong/i, shortCodes: ["HK"] },
    { code: "UK", regex: /英国|英國|🇬🇧|United\s*Kingdom|Britain|England/i, shortCodes: ["UK", "GB"] },
    { code: "TW", regex: /台湾|台灣|🇹🇼|Taiwan/i, shortCodes: ["TW"] },
    { code: "KR", regex: /韩国|韓國|南韩|南韓|🇰🇷|South\s*Korea|Korea/i, shortCodes: ["KR"] },
    { code: "DE", regex: /德国|德國|🇩🇪|Germany/i, shortCodes: ["DE"] },
    { code: "CA", regex: /加拿大|🇨🇦|Canada/i, shortCodes: ["CA"] },
    { code: "AU", regex: /澳大利亚|澳大利亞|澳洲|🇦🇺|Australia/i, shortCodes: ["AU"] },

    { code: "FR", regex: /法国|法國|🇫🇷|France/i, shortCodes: ["FR"] },
    { code: "NL", regex: /荷兰|荷蘭|🇳🇱|Netherlands|Holland/i, shortCodes: ["NL"] },
    { code: "CH", regex: /瑞士|🇨🇭|Switzerland/i, shortCodes: ["CH"] },
    { code: "IT", regex: /意大利|義大利|🇮🇹|Italy/i, shortCodes: ["IT"] },
    { code: "ES", regex: /西班牙|🇪🇸|Spain/i, shortCodes: ["ES"] },
    { code: "SE", regex: /瑞典|🇸🇪|Sweden/i, shortCodes: ["SE"] },
    { code: "NO", regex: /挪威|🇳🇴|Norway/i, shortCodes: ["NO"] },
    { code: "FI", regex: /芬兰|芬蘭|🇫🇮|Finland/i, shortCodes: ["FI"] },
    { code: "DK", regex: /丹麦|丹麥|🇩🇰|Denmark/i, shortCodes: ["DK"] },
    { code: "PL", regex: /波兰|波蘭|🇵🇱|Poland/i, shortCodes: ["PL"] },
    { code: "IE", regex: /爱尔兰|愛爾蘭|🇮🇪|Ireland/i, shortCodes: ["IE"] },
    { code: "AT", regex: /奥地利|奧地利|🇦🇹|Austria/i, shortCodes: ["AT"] },
    { code: "BE", regex: /比利时|比利時|🇧🇪|Belgium/i, shortCodes: ["BE"] },
    { code: "CZ", regex: /捷克|🇨🇿|Czech|Czechia/i, shortCodes: ["CZ"] },

    { code: "IN", regex: /印度|🇮🇳|India/i, shortCodes: ["IN"] },
    { code: "TH", regex: /泰国|泰國|🇹🇭|Thailand/i, shortCodes: ["TH"] },
    { code: "MY", regex: /马来西亚|馬來西亞|大马|大馬|🇲🇾|Malaysia/i, shortCodes: ["MY"] },
    { code: "PH", regex: /菲律宾|菲律賓|🇵🇭|Philippines/i, shortCodes: ["PH"] },
    { code: "ID", regex: /印度尼西亚|印度尼西亞|印尼|🇮🇩|Indonesia/i, shortCodes: ["ID"] },
    { code: "VN", regex: /越南|🇻🇳|Vietnam/i, shortCodes: ["VN"] },

    { code: "NZ", regex: /新西兰|新西蘭|紐西蘭|🇳🇿|New\s*Zealand/i, shortCodes: ["NZ"] },
    { code: "BR", regex: /巴西|🇧🇷|Brazil/i, shortCodes: ["BR"] },
    { code: "MX", regex: /墨西哥|🇲🇽|Mexico/i, shortCodes: ["MX"] },
    { code: "AE", regex: /阿联酋|阿聯酋|迪拜|杜拜|🇦🇪|United\s*Arab\s*Emirates|UAE|Dubai/i, shortCodes: ["AE"] },
    { code: "TR", regex: /土耳其|🇹🇷|Turkey|Türkiye/i, shortCodes: ["TR"] },
    { code: "RU", regex: /俄罗斯|俄羅斯|🇷🇺|Russia/i, shortCodes: ["RU"] },
    { code: "ZA", regex: /南非|🇿🇦|South\s*Africa/i, shortCodes: ["ZA"] },
    { code: "IL", regex: /以色列|🇮🇱|Israel/i, shortCodes: ["IL"] }
  ];

  // =====================================================
  // 4. 匹配节点名中的国家缩写
  // 支持 Pro.NB.us、UK-01、[JP]、US Home 等
  // =====================================================

  function hasShortCode(name, code) {
    const re = new RegExp(
      "(?:^|[.\\s|_\\-\\[\\]()])" +
      code +
      "(?:$|[.\\s|_\\-\\[\\]()])",
      "i"
    );
    return re.test(name);
  }

  function isRegion(name, region) {
    return region.regex.test(name) ||
      region.shortCodes.some(code => hasShortCode(name, code));
  }

  // =====================================================
  // 5. 初始化代理组
  // =====================================================

  if (!Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"] = [];
  }

  const groups = [];

  function addOptionalGroup(name, nodes, visible = true) {
    if (nodes.length > 0) {
      groups.push({
        name,
        type: "select",
        proxies: nodes,
        hidden: !visible
      });
    }
  }

  // 即使没有节点，仍保留一个隐身 REJECT 后端组，避免旧 Listener 的 proxy 找不到。
  // hidden 仅控制 Clash Party 等客户端展示，不会禁用 Listener。
  function addPermanentGroup(name, nodes, visible = true) {
    groups.push({
      name,
      type: "select",
      proxies: nodes.length > 0 ? nodes : ["REJECT"],
      hidden: !visible || nodes.length === 0
    });
  }

  function isAvailable(name) {
    const group = groups.find(g => g.name === name);
    return !!group &&
      group.proxies.some(p => p !== "REJECT");
  }

  // =====================================================
  // 6. 全部节点 / 家宽 / 普通节点
  // =====================================================

  const all = [...proxyNames];

  const home = proxyNames.filter(isHome);

  const nonHome = proxyNames.filter(
    name => !isHome(name)
  );

  // 永久存在，防止 Ronyo Rule 找不到 MY-ALL
  addPermanentGroup("MY-ALL", all);

  addOptionalGroup("MY-HOME", home, false);
  addOptionalGroup("MY-NON-HOME", nonHome, false);

  groups.push({
    name: "MY-DIRECT",
    type: "select",
    proxies: ["DIRECT"],
    hidden: true
  });

  // =====================================================
  // 7. 低倍率节点 / 节流业务组
  // =====================================================

  function readMultiplier(name) {
    const values = [];
    const patterns = [
      /(?:^|[^A-Za-z0-9])(\d+(?:\.\d+)?)\s*(?:x|×|倍)(?=$|[^A-Za-z])/ig,
      /(?:^|[^A-Za-z0-9])(?:x|×)\s*(\d+(?:\.\d+)?)(?=$|[^A-Za-z])/ig
    ];
    for (const regex of patterns) {
      for (const m of name.matchAll(regex)) {
        values.push(Number(m[1]));
      }
    }
    // 同一节点标注多个倍率时取最大值，避免误放行。
    return values.length ? Math.max(...values) : null;
  }

  const economyNodes = proxyNames.filter(name => {
    const rate = readMultiplier(name);
    return !isHome(name) && rate !== null && rate <= SETTINGS.economyMaxRate;
  });

  // 无明确低倍率节点则拒绝代理视频流量，不自动走昂贵节点。
  addPermanentGroup("MY-LOW-COST", economyNodes, true);
  addPermanentGroup("MY-STREAM", ["MY-LOW-COST"], economyNodes.length > 0);

  // Telegram: separate visible selector. Default is MY-LOW-COST; users may
  // select an individual eligible node in Clash Party without editing JS.
  // Deliberately exclude unknown-rate, residential and >1x nodes.
  // The REJECT fallback is retained even when the current subscription has no eligible node.
  groups.push({
    name: "TELEGRAM-PROXY",
    type: "select",
    proxies: economyNodes.length > 0
      ? ["MY-LOW-COST", ...economyNodes]
      : ["REJECT"],
    hidden: false
  });

  // =====================================================
  // AI 固定出口：Codex / Gemini (含 Antigravity/agy) / Claude
  // 支持三款独立选择，也可以统一选择 AI-STABLE-PROXY 共用一个出口。
  // 各组第一项均为 REJECT，且默认 REJECT：所选具体节点消失时
  // 不会静默切换到其它节点或流媒体低倍率组。
  // =====================================================
  const usRegion = regions.find(r => r.code === "US");
  const aiUsNodes = proxyNames.filter(name => isRegion(name, usRegion));
  const aiCandidates = [
    ...aiUsNodes.filter(isHome),
    ...aiUsNodes.filter(name => !isHome(name))
  ];

  function addStableAIGroup(name, withShared) {
    groups.push({
      name,
      type: "select",
      proxies: ["REJECT", ...(withShared ? ["AI-STABLE-PROXY"] : []), ...aiCandidates],
      "default-selected": "REJECT",
      hidden: false
    });
  }

  addStableAIGroup("AI-STABLE-PROXY", false);
  addStableAIGroup("CODEX-PROXY", true);
  addStableAIGroup("GEMINI-PROXY", true);
  addStableAIGroup("CLAUDE-PROXY", true);

  // Steam/Epic/大型下载默认直连，确有需要可以手动切到低倍率。
  addPermanentGroup(
    "MY-DOWNLOAD",
    economyNodes.length > 0 ? ["DIRECT", "MY-LOW-COST"] : ["DIRECT"],
    true
  );

  // =====================================================
  // 8. 创建国家组：可用组显示，无节点组隐藏但端口继续存在
  // =====================================================

  const fixedNormalRegions = new Set([
    "US", "SG", "JP", "HK", "UK", "TW", "KR", "DE", "CA", "AU"
  ]);
  const pinned = new Set(SETTINGS.pinnedRegions);
  const availableNormalGroups = [];
  const availableHomeGroups = [];

  for (const region of regions) {
    const normalNodes = proxyNames.filter(name =>
      isRegion(name, region) && !isHome(name)
    );
    const homeNodes = proxyNames.filter(name =>
      isRegion(name, region) && isHome(name)
    );

    const normalGroup = `MY-${region.code}`;
    const homeGroup = `MY-${region.code}-HOME`;
    const show = SETTINGS.showAllAvailableRegions || pinned.has(region.code);

    if (normalNodes.length) availableNormalGroups.push(normalGroup);
    if (homeNodes.length) availableHomeGroups.push(homeGroup);

    if (fixedNormalRegions.has(region.code)) {
      // 保留 10101-10110 的端口引用；无节点则后台 REJECT、前台隐藏。
      addPermanentGroup(normalGroup, normalNodes, show);
    } else {
      // 其余普通国家无固定端口；无节点就彻底不创建该组。
      addOptionalGroup(normalGroup, normalNodes, show);
    }
    // 保留 38 个家宽端口；即使缺失节点也保留一个隐藏的 REJECT 组。
    addPermanentGroup(homeGroup, homeNodes, show);
  }

  // 两个导航菜单收纳所有真实存在的国家组，减少顶层冗余。
  addPermanentGroup("MY-COUNTRIES", availableNormalGroups, true);
  addPermanentGroup("MY-HOME-COUNTRIES", availableHomeGroups, true);

  // =====================================================
  // 8. Firefox / Vivaldi 备用代理组
  //
  // 只展示实际有节点的地区
  // =====================================================

  function buildBrowserCandidates() {
    const candidates = [];

    // 家宽
    for (const region of regions) {
      const name = `MY-${region.code}-HOME`;
      if (isAvailable(name)) {
        candidates.push(name);
      }
    }

    // 普通
    for (const region of regions) {
      const name = `MY-${region.code}`;
      if (isAvailable(name)) {
        candidates.push(name);
      }
    }

    if (isAvailable("MY-HOME")) {
      candidates.push("MY-HOME");
    }

    if (isAvailable("MY-NON-HOME")) {
      candidates.push("MY-NON-HOME");
    }

    if (isAvailable("MY-ALL")) {
      candidates.push("MY-ALL");
    }

    return candidates.length > 0
      ? candidates
      : ["REJECT"];
  }

  groups.push({
    name: "FIREFOX-PROXY",
    type: "select",
    proxies: buildBrowserCandidates()
  });

  // Vivaldi 实际由 ZeroOmega + Listener 控制
  // 这里只保留备用组
  groups.push({
    name: "VIVALDI-PROXY",
    type: "select",
    proxies: buildBrowserCandidates(),
    hidden: true
  });

  // =====================================================
  // 9. 清理旧代理组
  //
  // 彻底删除旧 MY-LISTENER-XX-HOME
  // 避免出现两套 HOME 组
  // =====================================================

  const customNames = new Set(groups.map(g => g.name));
  [
    "MY-ALL", "MY-HOME", "MY-NON-HOME", "MY-DIRECT",
    "MY-LOW-COST", "MY-STREAM", "MY-DOWNLOAD", "TELEGRAM-PROXY",
    "AI-STABLE-PROXY", "CODEX-PROXY", "GEMINI-PROXY", "CLAUDE-PROXY",
    "MY-COUNTRIES", "MY-HOME-COUNTRIES",
    "FIREFOX-PROXY", "VIVALDI-PROXY"
  ].forEach(name => customNames.add(name));
  for (const region of regions) {
    customNames.add(`MY-${region.code}`);
    customNames.add(`MY-${region.code}-HOME`);
  }

  config["proxy-groups"] = config["proxy-groups"].filter(g => {
    if (!g || typeof g.name !== "string") return true;
    if (customNames.has(g.name)) return false;
    if (/^MY-LISTENER-[A-Z]{2}-HOME$/i.test(g.name)) return false;
    return true;
  });

  config["proxy-groups"].push(...groups);

  // =====================================================
  // 10. 保留融合订阅原规则，删除原 MATCH
  // =====================================================

  const originalRules = Array.isArray(config.rules)
    ? config.rules
    : [];

  const preservedRules = originalRules.filter(rule => {
    if (typeof rule !== "string") {
      return true;
    }

    return !/^\s*MATCH\s*,/i.test(rule);
  });

  // =====================================================
  // 11. Codex / Gemini(AGY) / Claude + Telegram / 流媒体 / 下载
  //     注意：Edge 首先判定；AI 域名/媒体域名均在 Firefox 进程规则之前。
  // =====================================================

  const streamDomains = [
    // YouTube
    "youtube.com", "youtu.be", "youtube-nocookie.com",
    "googlevideo.com", "ytimg.com", "youtubei.googleapis.com",
    // Netflix
    "netflix.com", "nflxvideo.net", "nflximg.net", "nflxso.net", "nflxext.com",
    // Disney+ / Hulu
    "disneyplus.com", "disney-plus.net", "bamgrid.com", "hulu.com", "huluim.com",
    // Twitch
    "twitch.tv", "ttvnw.net", "jtvnw.net",
    // TikTok
    "tiktok.com", "tiktokv.com", "tiktokcdn.com", "byteoversea.com",
    // Spotify
    "spotify.com", "scdn.co", "spotifycdn.com"
  ];

  const domesticVideoDomains = [
    "bilibili.com", "biliapi.com", "bilivideo.com", "b23.tv",
    "iqiyi.com", "youku.com", "mgtv.com"
  ];

  const downloadDomains = [
    // Steam 内容 CDN，而非整个 Steam 社区/商店
    "steamcontent.com", "steamserver.net", "steamcdn-a.akamaihd.net",
    // Windows/NVIDIA 大型更新与安装文件
    "download.windowsupdate.com", "dl.delivery.mp.microsoft.com",
    "download.microsoft.com", "download.nvidia.com"
  ];

  const streamRules = streamDomains.map(d => `DOMAIN-SUFFIX,${d},MY-STREAM`);
  const domesticVideoRules = SETTINGS.directDomesticVideo
    ? domesticVideoDomains.map(d => `DOMAIN-SUFFIX,${d},DIRECT`)
    : [];
  const downloadRules = downloadDomains.map(d => `DOMAIN-SUFFIX,${d},MY-DOWNLOAD`);

  config.rules = [
    // Bitwarden / Vaultwarden 强制直连（保持旧配置）
    "DOMAIN,mm.hhh999.top,DIRECT",
    "IP-CIDR,113.205.140.12/32,DIRECT,no-resolve",
    "IP-CIDR,219.152.54.195/32,DIRECT,no-resolve",
    "IP-CIDR,192.168.18.153/32,DIRECT,no-resolve",
    "DOMAIN-SUFFIX,ipvtesting.hgtcgroup.com,DIRECT",

    // Edge 强制国内直连，优先级高于 AI 域名规则（沿用用户设定）。
    "PROCESS-NAME,msedge.exe,DIRECT",

    // Codex CLI: native codex.exe。若由 IDE 扩展其它进程发送，需看连接日志补充。
    "PROCESS-NAME,codex.exe,CODEX-PROXY",
    "PROCESS-NAME,codex.exe,REJECT",

    // Antigravity IDE/App/CLI（agy），不包含泛用 node.exe / Code.exe。
    "PROCESS-NAME,agy.exe,GEMINI-PROXY",
    "PROCESS-NAME,agy.exe,REJECT",
    "PROCESS-NAME,Antigravity.exe,GEMINI-PROXY",
    "PROCESS-NAME,Antigravity.exe,REJECT",
    "PROCESS-NAME,Antigravity IDE.exe,GEMINI-PROXY",
    "PROCESS-NAME,Antigravity IDE.exe,REJECT",
    "PROCESS-NAME,gemini.exe,GEMINI-PROXY",
    "PROCESS-NAME,gemini.exe,REJECT",

    // Claude Desktop + 原生 Claude Code CLI (claude.exe)。
    "PROCESS-NAME,Claude.exe,CLAUDE-PROXY",
    "PROCESS-NAME,Claude.exe,REJECT",

    // Telegram Desktop selector: choose MY-LOW-COST or an eligible node in Clash Party.
    // REJECT immediately after it blocks UDP fallback into expensive subscription rules.
    "PROCESS-NAME,Telegram.exe,TELEGRAM-PROXY",
    "PROCESS-NAME,Telegram.exe,REJECT",

    // CLI 可能由 node.exe、IDE 扩展宿主进程发请求；只按 AI API/站点域名分流，
    // 不能把所有 node.exe / Code.exe 强制代理（会影响其它项目）。
    // 不匹配整个 googleapis.com 或 chatgpt.com（避免误伤其它业务）。
    "DOMAIN,generativelanguage.googleapis.com,GEMINI-PROXY",
    "DOMAIN,cloudcode-pa.googleapis.com,GEMINI-PROXY",
    "DOMAIN,cloudaicompanion.googleapis.com,GEMINI-PROXY",
    "DOMAIN,businessaicode.googleapis.com,GEMINI-PROXY",
    "DOMAIN,businessaicode.us.rep.googleapis.com,GEMINI-PROXY",
    "DOMAIN,businessaicode.eu.rep.googleapis.com,GEMINI-PROXY",
    "DOMAIN,businessaicode.mtls.googleapis.com,GEMINI-PROXY",
    "DOMAIN,aicode.googleapis.com,GEMINI-PROXY",
    "DOMAIN,daily-cloudcode-pa.googleapis.com,GEMINI-PROXY",
    "DOMAIN,aiplatform.googleapis.com,GEMINI-PROXY",
    "DOMAIN,aiplatform.us.rep.googleapis.com,GEMINI-PROXY",
    "DOMAIN,aiplatform.eu.rep.googleapis.com,GEMINI-PROXY",
    "DOMAIN,discoveryengine.googleapis.com,GEMINI-PROXY",
    "DOMAIN-SUFFIX,gemini.google.com,GEMINI-PROXY",
    "DOMAIN-SUFFIX,antigravity.google,GEMINI-PROXY",
    "DOMAIN-SUFFIX,antigravity.google.com,GEMINI-PROXY",

    // Claude Code API、桌面/网页；Claude 网页流量也单独归组。
    "DOMAIN,api.anthropic.com,CLAUDE-PROXY",
    "DOMAIN-SUFFIX,claude.ai,CLAUDE-PROXY",
    "DOMAIN-SUFFIX,claude.com,CLAUDE-PROXY",

    // 若 Codex 使用 ChatGPT 登录，模型接口与 ChatGPT 网页共用主机名，
    // 因此只按 codex.exe 精确匹配，不强制将整个 chatgpt.com 划到 CODEX。

    // 重点：放在 Firefox 进程规则之前，才会按网站将视频切到低倍率。
    ...domesticVideoRules,
    ...downloadRules,
    ...streamRules,

    // 下载器/游戏启动器：默认直连，可在 MY-DOWNLOAD 手动选低倍率。
    "PROCESS-NAME,steam.exe,MY-DOWNLOAD",
    "PROCESS-NAME,EpicGamesLauncher.exe,MY-DOWNLOAD",
    "PROCESS-NAME,Battle.net.exe,MY-DOWNLOAD",
    "PROCESS-NAME,OneDrive.exe,MY-DOWNLOAD",

    // Firefox 默认走 FIREFOX-PROXY，只有上面指定的域名例外。
    "PROCESS-NAME,firefox.exe,FIREFOX-PROXY",

    // Vivaldi 继续使用 ZeroOmega + 固定 Listener；固定 proxy 不会重匹配以上规则。

    // 向日葵强制直连（保持旧配置）
    "PROCESS-NAME,SunloginClient.exe,DIRECT",
    "PROCESS-NAME,SunloginService.exe,DIRECT",
    "PROCESS-NAME,SunloginRemote.exe,DIRECT",
    "PROCESS-NAME,SunloginHost.exe,DIRECT",
    "DOMAIN-SUFFIX,oray.com,DIRECT",
    "DOMAIN-SUFFIX,oray.net,DIRECT",
    "DOMAIN-SUFFIX,sunlogin.net,DIRECT",
    "IP-CIDR,153.3.236.0/24,DIRECT,no-resolve",
    "IP-CIDR,103.46.128.0/22,DIRECT,no-resolve",

    // 保留融合订阅原规则，不覆盖订阅原本分流（仅删除其 MATCH）。
    ...preservedRules,
    "MATCH,MY-ALL"
  ];

  return config;
}
