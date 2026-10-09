function main(config) {
  config["find-process-mode"] = "always";

  // =========================================================
  // 1. 读取当前订阅所有真实节点
  // =========================================================

  const proxies = Array.isArray(config.proxies)
    ? config.proxies
    : [];

  const proxyNames = proxies
    .map(p => p && p.name)
    .filter(Boolean);


  // =========================================================
  // 2. 节点类型识别
  // =========================================================

  // 家宽 / 住宅
  const isHome = name =>
    /(家宽|住宅\s*IP|住宅|Residential|Home\s*IP|Home)/i.test(name);


  // ---------- 美国 ----------
  const isUS = name =>
    /(美国|🇺🇸|United\s*States|USA|\.us(?:$|[.\s|_-]))/i.test(name);


  // ---------- 新加坡 ----------
  const isSG = name =>
    /(新加坡|狮城|🇸🇬|Singapore|\.sg(?:$|[.\s|_-]))/i.test(name);


  // ---------- 日本 ----------
  const isJP = name =>
    /(日本|🇯🇵|Japan|\.jp(?:$|[.\s|_-]))/i.test(name);


  // ---------- 香港 ----------
  const isHK = name =>
    /(香港|🇭🇰|Hong\s*Kong|\.hk(?:$|[.\s|_-]))/i.test(name);


  // ---------- 英国 ----------
  const isUK = name =>
    /(英国|🇬🇧|United\s*Kingdom|Britain|England|\.uk(?:$|[.\s|_-]))/i.test(name);


  // ---------- 台湾 ----------
  const isTW = name =>
    /(台湾|台灣|🇹🇼|Taiwan|\.tw(?:$|[.\s|_-]))/i.test(name);


  // ---------- 韩国 ----------
  const isKR = name =>
    /(韩国|韓國|🇰🇷|South\s*Korea|Korea|\.kr(?:$|[.\s|_-]))/i.test(name);


  // ---------- 德国 ----------
  const isDE = name =>
    /(德国|德國|🇩🇪|Germany|\.de(?:$|[.\s|_-]))/i.test(name);


  // ---------- 加拿大 ----------
  const isCA = name =>
    /(加拿大|🇨🇦|Canada|\.ca(?:$|[.\s|_-]))/i.test(name);


  // ---------- 澳大利亚 ----------
  const isAU = name =>
    /(澳大利亚|澳洲|🇦🇺|Australia|\.au(?:$|[.\s|_-]))/i.test(name);


  // =========================================================
  // 3. 辅助函数
  // =========================================================

  const pick = predicate =>
    proxyNames.filter(predicate);


  // =========================================================
  // 4. 动态分类
  // =========================================================

  const all = [...proxyNames];


  // =========================================================
  // 所有家宽 / 所有非家宽
  // =========================================================

  const home = pick(name =>
    isHome(name)
  );

  const nonHome = pick(name =>
    !isHome(name)
  );


  // =========================================================
  // 5. 各国家家宽节点
  // =========================================================

  const usHome = pick(name =>
    isUS(name) && isHome(name)
  );

  const sgHome = pick(name =>
    isSG(name) && isHome(name)
  );

  const jpHome = pick(name =>
    isJP(name) && isHome(name)
  );

  const hkHome = pick(name =>
    isHK(name) && isHome(name)
  );

  const ukHome = pick(name =>
    isUK(name) && isHome(name)
  );

  const twHome = pick(name =>
    isTW(name) && isHome(name)
  );

  const krHome = pick(name =>
    isKR(name) && isHome(name)
  );

  const deHome = pick(name =>
    isDE(name) && isHome(name)
  );

  const caHome = pick(name =>
    isCA(name) && isHome(name)
  );

  const auHome = pick(name =>
    isAU(name) && isHome(name)
  );


  // =========================================================
  // 6. 各国家普通节点
  //
  // 明确排除家宽
  // =========================================================

  const us = pick(name =>
    isUS(name) && !isHome(name)
  );

  const sg = pick(name =>
    isSG(name) && !isHome(name)
  );

  const jp = pick(name =>
    isJP(name) && !isHome(name)
  );

  const hk = pick(name =>
    isHK(name) && !isHome(name)
  );

  const uk = pick(name =>
    isUK(name) && !isHome(name)
  );

  const tw = pick(name =>
    isTW(name) && !isHome(name)
  );

  const kr = pick(name =>
    isKR(name) && !isHome(name)
  );

  const de = pick(name =>
    isDE(name) && !isHome(name)
  );

  const ca = pick(name =>
    isCA(name) && !isHome(name)
  );

  const au = pick(name =>
    isAU(name) && !isHome(name)
  );


  // =========================================================
  // 7. 初始化 proxy-groups
  // =========================================================

  if (!Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"] = [];
  }

  const groups = [];


  // =========================================================
  // 永久 DIRECT 入口
  // =========================================================

  groups.push({
    name: "MY-DIRECT",
    type: "select",
    proxies: ["DIRECT"]
  });


  // =========================================================
  // 8. 辅助：有节点才建立动态业务组
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
  // 9. 全局动态组
  // =========================================================

  addGroup(
    "MY-ALL",
    all
  );

  addGroup(
    "MY-HOME",
    home
  );

  addGroup(
    "MY-NON-HOME",
    nonHome
  );


  // =========================================================
  // 10. 美国
  // =========================================================

  addGroup(
    "MY-US",
    us
  );

  addGroup(
    "MY-US-HOME",
    usHome
  );


  // =========================================================
  // 11. 新加坡
  // =========================================================

  addGroup(
    "MY-SG",
    sg
  );

  addGroup(
    "MY-SG-HOME",
    sgHome
  );


  // =========================================================
  // 12. 日本
  // =========================================================

  addGroup(
    "MY-JP",
    jp
  );

  addGroup(
    "MY-JP-HOME",
    jpHome
  );


  // =========================================================
  // 13. 香港
  // =========================================================

  addGroup(
    "MY-HK",
    hk
  );

  addGroup(
    "MY-HK-HOME",
    hkHome
  );


  // =========================================================
  // 14. 英国
  // =========================================================

  addGroup(
    "MY-UK",
    uk
  );

  addGroup(
    "MY-UK-HOME",
    ukHome
  );


  // =========================================================
  // 15. 台湾
  // =========================================================

  addGroup(
    "MY-TW",
    tw
  );

  addGroup(
    "MY-TW-HOME",
    twHome
  );


  // =========================================================
  // 16. 韩国
  // =========================================================

  addGroup(
    "MY-KR",
    kr
  );

  addGroup(
    "MY-KR-HOME",
    krHome
  );


  // =========================================================
  // 17. 德国
  // =========================================================

  addGroup(
    "MY-DE",
    de
  );

  addGroup(
    "MY-DE-HOME",
    deHome
  );


  // =========================================================
  // 18. 加拿大
  // =========================================================

  addGroup(
    "MY-CA",
    ca
  );

  addGroup(
    "MY-CA-HOME",
    caHome
  );


  // =========================================================
  // 19. 澳大利亚
  // =========================================================

  addGroup(
    "MY-AU",
    au
  );

  addGroup(
    "MY-AU-HOME",
    auHome
  );


  // =========================================================
  // 20. Firefox / Vivaldi 永久入口
  // =========================================================

  function buildBrowserCandidates() {
    const candidates = [

      // =====================
      // 家宽
      // =====================

      "MY-US-HOME",
      "MY-SG-HOME",
      "MY-JP-HOME",
      "MY-HK-HOME",
      "MY-UK-HOME",
      "MY-TW-HOME",
      "MY-KR-HOME",
      "MY-DE-HOME",
      "MY-CA-HOME",
      "MY-AU-HOME",

      // =====================
      // 普通节点
      // =====================

      "MY-US",
      "MY-SG",
      "MY-JP",
      "MY-HK",
      "MY-UK",
      "MY-TW",
      "MY-KR",
      "MY-DE",
      "MY-CA",
      "MY-AU",

      // =====================
      // 汇总组
      // =====================

      "MY-HOME",
      "MY-NON-HOME",
      "MY-ALL"

    ].filter(hasGroup);

    if (candidates.length > 0) {
      return candidates;
    }

    return ["REJECT"];
  }


  groups.push({
    name: "FIREFOX-PROXY",
    type: "select",
    proxies: buildBrowserCandidates()
  });


  // 当前 Vivaldi 实际上由 ZeroOmega + Listener 分流
  // 这个组可以保留备用
  groups.push({
    name: "VIVALDI-PROXY",
    type: "select",
    proxies: buildBrowserCandidates()
  });


  // =========================================================
  // 21. 严格家宽 Listener
  //
  // 有对应国家家宽：
  //   -> MY-XX-HOME
  //
  // 没有：
  //   -> REJECT
  //
  // 绝不自动退回普通节点
  // =========================================================

  function buildStrictHomeListener(homeGroup) {
    if (hasGroup(homeGroup)) {
      return [homeGroup];
    }

    return ["REJECT"];
  }


  // ---------- 美国 ----------

  groups.push({
    name: "MY-LISTENER-US-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-US-HOME"
    )
  });


  // ---------- 新加坡 ----------

  groups.push({
    name: "MY-LISTENER-SG-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-SG-HOME"
    )
  });


  // ---------- 日本 ----------

  groups.push({
    name: "MY-LISTENER-JP-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-JP-HOME"
    )
  });


  // ---------- 香港 ----------

  groups.push({
    name: "MY-LISTENER-HK-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-HK-HOME"
    )
  });


  // ---------- 英国 ----------

  groups.push({
    name: "MY-LISTENER-UK-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-UK-HOME"
    )
  });


  // ---------- 台湾 ----------

  groups.push({
    name: "MY-LISTENER-TW-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-TW-HOME"
    )
  });


  // ---------- 韩国 ----------

  groups.push({
    name: "MY-LISTENER-KR-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-KR-HOME"
    )
  });


  // ---------- 德国 ----------

  groups.push({
    name: "MY-LISTENER-DE-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-DE-HOME"
    )
  });


  // ---------- 加拿大 ----------

  groups.push({
    name: "MY-LISTENER-CA-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-CA-HOME"
    )
  });


  // ---------- 澳大利亚 ----------

  groups.push({
    name: "MY-LISTENER-AU-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-AU-HOME"
    )
  });


  // =========================================================
  // 22. 删除之前生成的同名组
  //
  // 防止订阅刷新 / JS 重跑产生重复组
  // =========================================================

  const customNames = new Set(
    groups.map(g => g.name)
  );

  config["proxy-groups"] =
    config["proxy-groups"].filter(
      g => !customNames.has(g.name)
    );


  // 加入我们的动态组
  config["proxy-groups"].push(
    ...groups
  );


  // =========================================================
  // 23. 保留当前订阅原始规则
  //     但删除原订阅自己的最终 MATCH
  // =========================================================

  const originalRules =
    Array.isArray(config.rules)
      ? config.rules
      : [];


  const preservedRules = originalRules.filter(rule => {
    if (typeof rule !== "string") {
      return true;
    }

    return !/^\s*MATCH\s*,/i.test(rule);
  });


  // =========================================================
  // 24. 自定义规则
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
    // Claude 独立 App
    //
    // 强制美国家宽
    //
    // 有美国家宽 -> 使用
    // 无美国家宽 -> REJECT
    // =====================================================

    "PROCESS-NAME,Claude.exe,MY-LISTENER-US-HOME",


    // =====================================================
    // Edge
    // =====================================================

    "PROCESS-NAME,msedge.exe,DIRECT",


    // =====================================================
    // Firefox
    // =====================================================

    "PROCESS-NAME,firefox.exe,FIREFOX-PROXY",


    // =====================================================
    // Vivaldi
    //
    // 不启用进程规则。
    // 每个 Profile 由 ZeroOmega + Listener 控制。
    // =====================================================

    // "PROCESS-NAME,vivaldi.exe,VIVALDI-PROXY",


    // =====================================================
    // 向日葵
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
    // 保留融合订阅原来的分流规则
    //
    // 原来的 MATCH 已经删除
    // =====================================================

    ...preservedRules,


    // =====================================================
    // 最终兜底
    //
    // 所有前面都没有匹配的：
    // Telegram
    // Discord
    // Google
    // GitHub
    // ChatGPT
    // ...
    //
    // 全部进入 MY-ALL
    // =====================================================

    "MATCH,MY-ALL"
  ];


  // =========================================================
  // 25. 返回最终配置
  // =========================================================

  return config;
}
