function main(config) {
  config["find-process-mode"] = "always";

  // =========================================================
  // 1. 读取当前订阅全部真实节点
  // =========================================================

  const proxies = Array.isArray(config.proxies)
    ? config.proxies
    : [];

  const proxyNames = proxies
    .map(p => p && p.name)
    .filter(Boolean);


  // =========================================================
  // 2. 家宽 / 住宅识别
  // =========================================================

  const isHome = name =>
    /(家宽|家庭宽带|宽带|住宅\s*IP|住宅|Residential|Home\s*IP|Home|Broadband)/i.test(name);


  // =========================================================
  // 3. 国家 / 地区识别
  //
  // code:
  //   内部组名使用
  //
  // regex:
  //   中文 / 国旗 / 英文名称
  //
  // shortCodes:
  //   节点中常见的 .us / .uk / US / UK 等
  // =========================================================

  const regions = [
    {
      code: "US",
      regex: /(美国|🇺🇸|United\s*States|USA)/i,
      shortCodes: ["US"]
    },

    {
      code: "SG",
      regex: /(新加坡|狮城|🇸🇬|Singapore)/i,
      shortCodes: ["SG"]
    },

    {
      code: "JP",
      regex: /(日本|🇯🇵|Japan)/i,
      shortCodes: ["JP"]
    },

    {
      code: "HK",
      regex: /(香港|🇭🇰|Hong\s*Kong)/i,
      shortCodes: ["HK"]
    },

    {
      code: "UK",
      regex: /(英国|英國|🇬🇧|United\s*Kingdom|Britain|England)/i,
      shortCodes: ["UK", "GB"]
    },

    {
      code: "TW",
      regex: /(台湾|台灣|🇹🇼|Taiwan)/i,
      shortCodes: ["TW"]
    },

    {
      code: "KR",
      regex: /(韩国|韓國|南韩|南韓|🇰🇷|South\s*Korea|Korea)/i,
      shortCodes: ["KR"]
    },

    {
      code: "DE",
      regex: /(德国|德國|🇩🇪|Germany)/i,
      shortCodes: ["DE"]
    },

    {
      code: "CA",
      regex: /(加拿大|🇨🇦|Canada)/i,
      shortCodes: ["CA"]
    },

    {
      code: "AU",
      regex: /(澳大利亚|澳大利亞|澳洲|🇦🇺|Australia)/i,
      shortCodes: ["AU"]
    },

    {
      code: "FR",
      regex: /(法国|法國|🇫🇷|France)/i,
      shortCodes: ["FR"]
    },

    {
      code: "NL",
      regex: /(荷兰|荷蘭|🇳🇱|Netherlands|Holland)/i,
      shortCodes: ["NL"]
    },

    {
      code: "CH",
      regex: /(瑞士|🇨🇭|Switzerland)/i,
      shortCodes: ["CH"]
    },

    {
      code: "IT",
      regex: /(意大利|義大利|🇮🇹|Italy)/i,
      shortCodes: ["IT"]
    },

    {
      code: "ES",
      regex: /(西班牙|🇪🇸|Spain)/i,
      shortCodes: ["ES"]
    },

    {
      code: "SE",
      regex: /(瑞典|🇸🇪|Sweden)/i,
      shortCodes: ["SE"]
    },

    {
      code: "NO",
      regex: /(挪威|🇳🇴|Norway)/i,
      shortCodes: ["NO"]
    },

    {
      code: "FI",
      regex: /(芬兰|芬蘭|🇫🇮|Finland)/i,
      shortCodes: ["FI"]
    },

    {
      code: "DK",
      regex: /(丹麦|丹麥|🇩🇰|Denmark)/i,
      shortCodes: ["DK"]
    },

    {
      code: "PL",
      regex: /(波兰|波蘭|🇵🇱|Poland)/i,
      shortCodes: ["PL"]
    },

    {
      code: "IE",
      regex: /(爱尔兰|愛爾蘭|🇮🇪|Ireland)/i,
      shortCodes: ["IE"]
    },

    {
      code: "AT",
      regex: /(奥地利|奧地利|🇦🇹|Austria)/i,
      shortCodes: ["AT"]
    },

    {
      code: "BE",
      regex: /(比利时|比利時|🇧🇪|Belgium)/i,
      shortCodes: ["BE"]
    },

    {
      code: "CZ",
      regex: /(捷克|🇨🇿|Czech|Czechia)/i,
      shortCodes: ["CZ"]
    },

    {
      code: "IN",
      regex: /(印度|🇮🇳|India)/i,
      shortCodes: ["IN"]
    },

    {
      code: "TH",
      regex: /(泰国|泰國|🇹🇭|Thailand)/i,
      shortCodes: ["TH"]
    },

    {
      code: "MY",
      regex: /(马来西亚|馬來西亞|大马|大馬|🇲🇾|Malaysia)/i,
      shortCodes: ["MY"]
    },

    {
      code: "PH",
      regex: /(菲律宾|菲律賓|🇵🇭|Philippines)/i,
      shortCodes: ["PH"]
    },

    {
      code: "ID",
      regex: /(印度尼西亚|印度尼西亞|印尼|🇮🇩|Indonesia)/i,
      shortCodes: ["ID"]
    },

    {
      code: "VN",
      regex: /(越南|🇻🇳|Vietnam)/i,
      shortCodes: ["VN"]
    },

    {
      code: "NZ",
      regex: /(新西兰|紐西蘭|新西蘭|🇳🇿|New\s*Zealand)/i,
      shortCodes: ["NZ"]
    },

    {
      code: "BR",
      regex: /(巴西|🇧🇷|Brazil)/i,
      shortCodes: ["BR"]
    },

    {
      code: "MX",
      regex: /(墨西哥|🇲🇽|Mexico)/i,
      shortCodes: ["MX"]
    },

    {
      code: "AE",
      regex: /(阿联酋|阿聯酋|迪拜|杜拜|🇦🇪|United\s*Arab\s*Emirates|UAE|Dubai)/i,
      shortCodes: ["AE"]
    },

    {
      code: "TR",
      regex: /(土耳其|🇹🇷|Turkey|Türkiye)/i,
      shortCodes: ["TR"]
    },

    {
      code: "RU",
      regex: /(俄罗斯|俄羅斯|🇷🇺|Russia)/i,
      shortCodes: ["RU"]
    },

    {
      code: "ZA",
      regex: /(南非|🇿🇦|South\s*Africa)/i,
      shortCodes: ["ZA"]
    },

    {
      code: "IL",
      regex: /(以色列|🇮🇱|Israel)/i,
      shortCodes: ["IL"]
    }
  ];


  // =========================================================
  // 4. 国家代码识别辅助
  //
  // 支持：
  // Pro.NB.us
  // xxx-US
  // US 01
  // .uk
  // -jp
  // =========================================================

  function hasShortCode(name, code) {
    const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const re = new RegExp(
      `(?:^|[.\\s|_\\-])${escaped}(?:$|[.\\s|_\\-])`,
      "i"
    );

    return re.test(name);
  }


  function isRegion(name, region) {
    if (region.regex.test(name)) {
      return true;
    }

    return region.shortCodes.some(code =>
      hasShortCode(name, code)
    );
  }


  // =========================================================
  // 5. 初始化 proxy-groups
  // =========================================================

  if (!Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"] = [];
  }

  const groups = [];


  // =========================================================
  // 6. 辅助函数
  // =========================================================

  function addGroup(name, nodes) {
    if (nodes.length > 0) {
      groups.push({
        name,
        type: "select",
        proxies: nodes
      });
    }
  }


  function hasGroup(name) {
    return groups.some(g => g.name === name);
  }


  // =========================================================
  // 7. 基础总组
  // =========================================================

  const all = [...proxyNames];

  const home = proxyNames.filter(name =>
    isHome(name)
  );

  const nonHome = proxyNames.filter(name =>
    !isHome(name)
  );


  // MY-ALL 永久存在
  // 避免其他 Rule 引用 MY-ALL 时找不到
  groups.push({
    name: "MY-ALL",
    type: "select",
    proxies: all.length > 0
      ? all
      : ["REJECT"]
  });


  addGroup(
    "MY-HOME",
    home
  );


  addGroup(
    "MY-NON-HOME",
    nonHome
  );


  // DIRECT 永久存在
  groups.push({
    name: "MY-DIRECT",
    type: "select",
    proxies: ["DIRECT"]
  });


  // =========================================================
  // 8. 自动建立所有国家组
  //
  // MY-US
  // MY-US-HOME
  //
  // MY-UK
  // MY-UK-HOME
  //
  // ...
  // =========================================================

  for (const region of regions) {

    const normalNodes = proxyNames.filter(name =>
      isRegion(name, region) &&
      !isHome(name)
    );


    const homeNodes = proxyNames.filter(name =>
      isRegion(name, region) &&
      isHome(name)
    );


    // 普通节点
    addGroup(
      `MY-${region.code}`,
      normalNodes
    );


    // 家宽节点
    addGroup(
      `MY-${region.code}-HOME`,
      homeNodes
    );
  }


  // =========================================================
  // 9. Firefox / Vivaldi 可选入口
  // =========================================================

  function buildBrowserCandidates() {
    const candidates = [];


    // 优先显示家宽
    for (const region of regions) {
      const groupName =
        `MY-${region.code}-HOME`;

      if (hasGroup(groupName)) {
        candidates.push(groupName);
      }
    }


    // 然后普通节点
    for (const region of regions) {
      const groupName =
        `MY-${region.code}`;

      if (hasGroup(groupName)) {
        candidates.push(groupName);
      }
    }


    if (hasGroup("MY-HOME")) {
      candidates.push("MY-HOME");
    }


    if (hasGroup("MY-NON-HOME")) {
      candidates.push("MY-NON-HOME");
    }


    candidates.push("MY-ALL");


    return candidates.length > 0
      ? candidates
      : ["REJECT"];
  }


  groups.push({
    name: "FIREFOX-PROXY",
    type: "select",
    proxies: buildBrowserCandidates()
  });


  // Vivaldi 当前还是 ZeroOmega + Listener
  // 这个组保留备用
  groups.push({
    name: "VIVALDI-PROXY",
    type: "select",
    proxies: buildBrowserCandidates()
  });


  // =========================================================
  // 10. 严格家宽 Listener
  //
  // 对所有国家自动建立：
  //
  // MY-LISTENER-US-HOME
  // MY-LISTENER-UK-HOME
  // MY-LISTENER-FR-HOME
  // ...
  //
  // 有家宽：
  // -> MY-XX-HOME
  //
  // 没家宽：
  // -> REJECT
  //
  // 永远不会退回普通节点
  // =========================================================

  for (const region of regions) {

    const homeGroup =
      `MY-${region.code}-HOME`;

    const listenerGroup =
      `MY-LISTENER-${region.code}-HOME`;


    groups.push({
      name: listenerGroup,
      type: "select",

      proxies: hasGroup(homeGroup)
        ? [homeGroup]
        : ["REJECT"]
    });
  }


  // =========================================================
  // 11. 去掉旧的同名动态组
  // =========================================================

  const customNames = new Set(
    groups.map(g => g.name)
  );


  config["proxy-groups"] =
    config["proxy-groups"].filter(
      g => !customNames.has(g.name)
    );


  config["proxy-groups"].push(
    ...groups
  );


  // =========================================================
  // 12. 保存原订阅规则
  //
  // 删除原订阅最后的 MATCH
  // =========================================================

  const originalRules =
    Array.isArray(config.rules)
      ? config.rules
      : [];


  const preservedRules =
    originalRules.filter(rule => {

      if (typeof rule !== "string") {
        return true;
      }

      return !/^\s*MATCH\s*,/i.test(rule);
    });


  // =========================================================
  // 13. 自定义规则
  // =========================================================

  config.rules = [

    // =====================================================
    // 最高优先级 DIRECT
    // =====================================================

    // Bitwarden / Vaultwarden
    "DOMAIN,mm.hhh999.top,DIRECT",

    "IP-CIDR,113.205.140.12/32,DIRECT,no-resolve",
    "IP-CIDR,219.152.54.195/32,DIRECT,no-resolve",
    "IP-CIDR,192.168.18.153/32,DIRECT,no-resolve",

    "DOMAIN-SUFFIX,ipvtesting.hgtcgroup.com,DIRECT",


    // =====================================================
    // Claude App -> 美国家宽
    // =====================================================

    "PROCESS-NAME,Claude.exe,MY-LISTENER-US-HOME",


    // =====================================================
    // Edge -> DIRECT
    // =====================================================

    "PROCESS-NAME,msedge.exe,DIRECT",


    // =====================================================
    // Firefox
    // =====================================================

    "PROCESS-NAME,firefox.exe,FIREFOX-PROXY",


    // =====================================================
    // Vivaldi
    //
    // 不启用 PROCESS-NAME
    // 每个 Profile 用 ZeroOmega + Listener
    // =====================================================

    // "PROCESS-NAME,vivaldi.exe,VIVALDI-PROXY",


    // =====================================================
    // 向日葵 -> DIRECT
    // =====================================================

    "PROCESS-NAME,SunloginClient.exe,DIRECT",
    "PROCESS-NAME,SunloginService.exe,DIRECT",
    "PROCESS-NAME,SunloginRemote.exe,DIRECT",
    "PROCESS-NAME,SunloginHost.exe,DIRECT",

    "DOMAIN-SUFFIX,oray.com,DIRECT",
    "DOMAIN-SUFFIX,oray.net,DIRECT",
    "DOMAIN-SUFFIX,sunlogin.net,DIRECT",

    "IP-CIDR,153.3.236.0/24,DIRECT,no-resolve",
    "IP-CIDR,103.46.128.0/22,DIRECT,no-resolve",


    // =====================================================
    // 保留融合订阅正常规则
    // =====================================================

    ...preservedRules,


    // =====================================================
    // 最终兜底
    // =====================================================

    "MATCH,MY-ALL"
  ];


  // =========================================================
  // 14. 返回
  // =========================================================

  return config;
}
