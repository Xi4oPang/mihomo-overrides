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
  // 2. 节点识别
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


  // =========================================================
  // 3. 辅助函数
  // =========================================================

  const pick = predicate =>
    proxyNames.filter(predicate);


  // =========================================================
  // 4. 动态分类
  // =========================================================

  const all = [...proxyNames];

  // 所有家宽
  const home = pick(name =>
    isHome(name)
  );


  // ---------- 美国家宽 ----------

  const usHome = pick(name =>
    isUS(name) && isHome(name)
  );


  // ---------- 新加坡家宽 ----------

  const sgHome = pick(name =>
    isSG(name) && isHome(name)
  );


  // ---------- 日本家宽 ----------

  const jpHome = pick(name =>
    isJP(name) && isHome(name)
  );


  // ---------- 香港家宽 ----------

  const hkHome = pick(name =>
    isHK(name) && isHome(name)
  );


  // =========================================================
  // 普通节点：明确排除家宽
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


  // =========================================================
  // 5. 初始化 proxy-groups
  // =========================================================

  if (!Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"] = [];
  }

  const groups = [];


  // =========================================================
  // 6. 永久 DIRECT 入口
  // =========================================================

  groups.push({
    name: "MY-DIRECT",
    type: "select",
    proxies: ["DIRECT"]
  });


  // =========================================================
  // 7. 辅助：有节点才创建业务组
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
  // 8. 动态业务组
  // =========================================================

  // 所有节点
  addGroup(
    "MY-ALL",
    all
  );

  // 所有家宽
  addGroup(
    "MY-HOME",
    home
  );


  // ---------- 美国 ----------

  // 美国普通节点
  addGroup(
    "MY-US",
    us
  );

  // 美国家宽
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


  // =========================================================
  // 9. Firefox 永久代理入口
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


  // =========================================================
  // 10. 严格家宽 Listener 永久入口
  //
  // 有对应家宽：
  //   MY-LISTENER-US-HOME -> MY-US-HOME
  //
  // 没对应家宽：
  //   MY-LISTENER-US-HOME -> REJECT
  //
  // 绝不自动降级普通节点
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
  // 11. 删除之前生成的同名组
  //
  // 防止刷新订阅 / JS 重跑产生重复组
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
  // 12. 保存机场原始规则
  // =========================================================

  const originalRules =
    Array.isArray(config.rules)
      ? config.rules
      : [];


  // =========================================================
  // 13. 自定义规则
  // =========================================================

  config.rules = [

    // =====================================================
    // 最高优先级：无条件 DIRECT
    // =====================================================

    // Bitwarden / Vaultwarden
    "DOMAIN,mm.hhh999.top,DIRECT",

    "IP-CIDR,113.205.140.12/32,DIRECT,no-resolve",
    "IP-CIDR,219.152.54.195/32,DIRECT,no-resolve",
    "IP-CIDR,192.168.18.153/32,DIRECT,no-resolve",

    "DOMAIN-SUFFIX,ipvtesting.hgtcgroup.com,DIRECT",


    // =====================================================
    // 浏览器
    // =====================================================

    // Edge 永远直连
    "PROCESS-NAME,msedge.exe,DIRECT",

    // Firefox 使用自己的动态代理组
    "PROCESS-NAME,firefox.exe,FIREFOX-PROXY",

    // Vivaldi 不写 PROCESS-NAME
    //
    // 每个 Vivaldi Profile 使用 ZeroOmega
    // 分别连接 Listener：
    //
    // 10001 -> 美国家宽
    // 10002 -> 新加坡家宽
    // 10003 -> 日本家宽
    // 10004 -> 香港家宽
    //
    // 10010 -> DIRECT
    //
    // 10101 -> 美国普通
    // 10102 -> 新加坡普通
    // 10103 -> 日本普通
    // 10104 -> 香港普通


    // =====================================================
    // 向日葵强制直连
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
    // 最后继续使用当前机场自己的规则
    // =====================================================

    ...originalRules
  ];


  // =========================================================
  // 14. 返回最终配置
  // =========================================================

  return config;
}
