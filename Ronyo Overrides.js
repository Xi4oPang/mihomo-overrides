
function main(config) {
  config["find-process-mode"] = "always";

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

  function addOptionalGroup(name, nodes) {
    if (nodes.length > 0) {
      groups.push({
        name,
        type: "select",
        proxies: nodes
      });
    }
  }

  function addPermanentGroup(name, nodes) {
    groups.push({
      name,
      type: "select",
      proxies: nodes.length > 0 ? nodes : ["REJECT"]
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

  addOptionalGroup("MY-HOME", home);
  addOptionalGroup("MY-NON-HOME", nonHome);

  groups.push({
    name: "MY-DIRECT",
    type: "select",
    proxies: ["DIRECT"]
  });

  // =====================================================
  // 7. 创建所有国家普通节点和 HOME 组
  //
  // MY-US
  // MY-US-HOME
  // MY-UK
  // MY-UK-HOME
  //
  // 家宽组永久存在：
  // 有家宽 -> 节点列表
  // 没家宽 -> REJECT
  // =====================================================

  // 这些国家的普通组被固定 Listener 引用
  // 因此也必须永久存在
  const fixedNormalRegions = new Set([
    "US", "SG", "JP", "HK", "UK",
    "TW", "KR", "DE", "CA", "AU"
  ]);

  for (const region of regions) {
    const normalNodes = proxyNames.filter(name =>
      isRegion(name, region) && !isHome(name)
    );

    const homeNodes = proxyNames.filter(name =>
      isRegion(name, region) && isHome(name)
    );

    const normalGroup = `MY-${region.code}`;
    const homeGroup = `MY-${region.code}-HOME`;

    // 普通节点组
    if (fixedNormalRegions.has(region.code)) {
      addPermanentGroup(normalGroup, normalNodes);
    } else {
      addOptionalGroup(normalGroup, normalNodes);
    }

    // 家宽节点组：永久存在
    // Listener 直接引用这一组
    addPermanentGroup(homeGroup, homeNodes);
  }

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
    proxies: buildBrowserCandidates()
  });

  // =====================================================
  // 9. 清理旧代理组
  //
  // 彻底删除旧 MY-LISTENER-XX-HOME
  // 避免出现两套 HOME 组
  // =====================================================

  const customNames = new Set(groups.map(g => g.name));

  [
    "MY-ALL",
    "MY-HOME",
    "MY-NON-HOME",
    "MY-DIRECT",
    "FIREFOX-PROXY",
    "VIVALDI-PROXY"
  ].forEach(name => customNames.add(name));

  config["proxy-groups"] =
    config["proxy-groups"].filter(g => {
      if (!g || typeof g.name !== "string") {
        return true;
      }

      // 删除新的同名组旧版本
      if (customNames.has(g.name)) {
        return false;
      }

      // 删除以前那层多余的 Listener 代理组
      if (/^MY-LISTENER-[A-Z]{2}-HOME$/i.test(g.name)) {
        return false;
      }

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
  // 11. 自定义分流规则
  // =====================================================

  config.rules = [
    // Bitwarden / Vaultwarden 强制直连
    "DOMAIN,mm.hhh999.top,DIRECT",
    "IP-CIDR,113.205.140.12/32,DIRECT,no-resolve",
    "IP-CIDR,219.152.54.195/32,DIRECT,no-resolve",
    "IP-CIDR,192.168.18.153/32,DIRECT,no-resolve",
    "DOMAIN-SUFFIX,ipvtesting.hgtcgroup.com,DIRECT",

    // Claude 独立 App -> 美国家宽
    "PROCESS-NAME,Claude.exe,MY-US-HOME",

    // Edge -> DIRECT
    "PROCESS-NAME,msedge.exe,DIRECT",

    // Firefox -> 代理组
    "PROCESS-NAME,firefox.exe,FIREFOX-PROXY",

    // Vivaldi 不做进程规则
    // 各 Profile 使用 ZeroOmega + Listener

    // 向日葵强制直连
    "PROCESS-NAME,SunloginClient.exe,DIRECT",
    "PROCESS-NAME,SunloginService.exe,DIRECT",
    "PROCESS-NAME,SunloginRemote.exe,DIRECT",
    "PROCESS-NAME,SunloginHost.exe,DIRECT",
    "DOMAIN-SUFFIX,oray.com,DIRECT",
    "DOMAIN-SUFFIX,oray.net,DIRECT",
    "DOMAIN-SUFFIX,sunlogin.net,DIRECT",
    "IP-CIDR,153.3.236.0/24,DIRECT,no-resolve",
    "IP-CIDR,103.46.128.0/22,DIRECT,no-resolve",

    // 保留机场其他规则
    ...preservedRules,

    // 最终兜底
    "MATCH,MY-ALL"
  ];

  return config;
}
