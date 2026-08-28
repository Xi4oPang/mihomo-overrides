function main(config) {
  config["find-process-mode"] = "always";

  // =========================================================
  // 1. 读取当前订阅的所有真实节点
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

  // 美国
  const isUS = name =>
    /(美国|🇺🇸|\.us(?:$|[.\s|_-]))/i.test(name);

  // 新加坡
  const isSG = name =>
    /(新加坡|狮城|🇸🇬|\.sg(?:$|[.\s|_-]))/i.test(name);

  // 日本
  const isJP = name =>
    /(日本|🇯🇵|\.jp(?:$|[.\s|_-]))/i.test(name);

  // 香港
  const isHK = name =>
    /(香港|🇭🇰|\.hk(?:$|[.\s|_-]))/i.test(name);
  
  // 英国
  const isUK = name =>
    /(英国|🇬🇧|United\s*Kingdom|Britain|\.uk(?:$|[.\s|_-]))/i.test(name);
  
  // 台湾
  const isTW = name =>
    /(台湾|台灣|🇹🇼|Taiwan|\.tw(?:$|[.\s|_-]))/i.test(name);
  
  // 韩国
  const isKR = name =>
    /(韩国|韓國|🇰🇷|Korea|\.kr(?:$|[.\s|_-]))/i.test(name);
  
  // 德国
  const isDE = name =>
    /(德国|德國|🇩🇪|Germany|\.de(?:$|[.\s|_-]))/i.test(name);
  
  // 加拿大
  const isCA = name =>
    /(加拿大|🇨🇦|Canada|\.ca(?:$|[.\s|_-]))/i.test(name);
  
  // 澳大利亚
  const isAU = name =>
    /(澳大利亚|澳洲|🇦🇺|Australia|\.au(?:$|[.\s|_-]))/i.test(name);

  // =========================================================
  // 3. 辅助函数
  // =========================================================

  const pick = predicate =>
    proxyNames.filter(predicate);


  // =========================================================
  // 4. 动态分类节点
  // =========================================================

  const all = [...proxyNames];

  const home = pick(name =>
    isHome(name)
  );
  // 所有非家宽 / 非住宅节点
  const nonHome = pick(name =>
    !isHome(name)
  );
  
  // 家宽
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

  // 普通节点：明确排除家宽
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
  // 5. 初始化 proxy-groups
  // =========================================================

  if (!Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"] = [];
  }

  const groups = [];

  groups.push({
    name: "MY-DIRECT",
    type: "select",
    proxies: ["DIRECT"]
  });

  // =========================================================
  // 6. 辅助：只有存在节点时才建立动态业务组
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
  // 7. 动态业务组
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
  // ---------- 美国 ----------

  addGroup(
    "MY-US",
    us
  );

  addGroup(
    "MY-US-HOME",
    usHome
  );


  // ---------- 新加坡 ----------

  addGroup(
    "MY-SG",
    sg
  );

  addGroup(
    "MY-SG-HOME",
    sgHome
  );


  // ---------- 日本 ----------

  addGroup(
    "MY-JP",
    jp
  );

  addGroup(
    "MY-JP-HOME",
    jpHome
  );


  // ---------- 香港 ----------

  addGroup(
    "MY-HK",
    hk
  );

  addGroup(
    "MY-HK-HOME",
    hkHome
  );

  addGroup(
    "MY-UK",
    uk
  );
  
  addGroup(
    "MY-TW",
    tw
  );
  
  addGroup(
    "MY-KR",
    kr
  );
  
  addGroup(
    "MY-DE",
    de
  );
  
  addGroup(
    "MY-CA",
    ca
  );
  
  addGroup(
    "MY-AU",
    au
  );
  // =========================================================
  // 8. Firefox / Vivaldi 永久入口组
  // =========================================================

  function buildBrowserCandidates() {
    const candidates = [
      "MY-US-HOME",
      "MY-SG-HOME",
      "MY-JP-HOME",
      "MY-HK-HOME",

      "MY-US",
      "MY-SG",
      "MY-JP",
      "MY-HK",

      "MY-HOME",
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


  groups.push({
    name: "VIVALDI-PROXY",
    type: "select",
    proxies: buildBrowserCandidates()
  });


  // =========================================================
  // 9. 严格家宽 Listener 入口
  //
  // 核心：
  // 有家宽 -> 只允许对应家宽组
  // 无家宽 -> REJECT
  //
  // 绝不降级到普通节点
  // =========================================================

  function buildStrictHomeListener(homeGroup) {
    if (hasGroup(homeGroup)) {
      return [homeGroup];
    }

    return ["REJECT"];
  }


  groups.push({
    name: "MY-LISTENER-US-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-US-HOME"
    )
  });


  groups.push({
    name: "MY-LISTENER-SG-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-SG-HOME"
    )
  });


  groups.push({
    name: "MY-LISTENER-JP-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-JP-HOME"
    )
  });


  groups.push({
    name: "MY-LISTENER-HK-HOME",
    type: "select",
    proxies: buildStrictHomeListener(
      "MY-HK-HOME"
    )
  });


  // =========================================================
  // 10. 删除之前生成的同名组
  //
  // 防止订阅刷新 / JS 重跑以后出现重复组
  // =========================================================

  const customNames = new Set(
    groups.map(g => g.name)
  );

  config["proxy-groups"] =
    config["proxy-groups"].filter(
      g => !customNames.has(g.name)
    );


  // 把我们的动态组加入当前订阅
  config["proxy-groups"].push(
    ...groups
  );


 // =========================================================
  // 11. 保留当前订阅原始规则
  //     但是删除原订阅最终 MATCH
  // =========================================================

  const originalRules =
    Array.isArray(config.rules)
      ? config.rules
      : [];

  // 保留原机场的所有正常分流规则，
  // 只删除它自己的最终 MATCH。
  //
  // 例如：
  // MATCH,DIRECT
  // MATCH,Proxy
  //
  // 最终统一由我们自己的 MY-ALL 负责兜底。
  const preservedRules = originalRules.filter(rule => {
    if (typeof rule !== "string") {
      return true;
    }

    return !/^\s*MATCH\s*,/i.test(rule);
  });


  // =========================================================
  // 12. 自定义进程规则放最前面
  // =========================================================

  
  config.rules = [
    // Edge 永远国内直连
    "PROCESS-NAME,msedge.exe,DIRECT",

    // Firefox 永远进入自己的代理选择组
    "PROCESS-NAME,firefox.exe,FIREFOX-PROXY",

    // Vivaldi 永远进入自己的代理选择组
    //"PROCESS-NAME,vivaldi.exe,VIVALDI-PROXY",

    // Bitwarden / Vaultwarden 强制直连
    "DOMAIN,mm.hhh999.top,DIRECT",
    "IP-CIDR,113.205.140.12/32,DIRECT,no-resolve",
    "IP-CIDR,219.152.54.195/32,DIRECT,no-resolve",
    "IP-CIDR,192.168.18.153/32,DIRECT,no-resolve",

    // 向日葵
    "PROCESS-NAME,SunloginClient.exe,DIRECT",
    "PROCESS-NAME,SunloginService.exe,DIRECT",
    "PROCESS-NAME,SunloginRemote.exe,DIRECT",
    "PROCESS-NAME,SunloginHost.exe,DIRECT",

    "DOMAIN-SUFFIX,oray.com,DIRECT",
    "DOMAIN-SUFFIX,oray.net,DIRECT",
    "DOMAIN-SUFFIX,sunlogin.net,DIRECT",

    "IP-CIDR,153.3.236.0/24,DIRECT,no-resolve",
    "IP-CIDR,103.46.128.0/22,DIRECT,no-resolve",

    "DOMAIN-SUFFIX,ipvtesting.hgtcgroup.com,DIRECT",

    // 保留融合订阅原本的分流规则
    // 但已经删除它原来的 MATCH xxx
    ...preservedRules,

    // =====================================================
    // 最终兜底
    //
    // 所有前面没有匹配到的流量：
    // Telegram / Discord / Google / GitHub / ChatGPT ...
    // 统一进入 MY-ALL。
    //
    // MY-ALL 中的实际节点仍然由你自己选择。
    // =====================================================
    "MATCH,MY-ALL"
  ];


  // =========================================================
  // 13. 返回最终配置
  // =========================================================

  return config;
}
