/* Dựng website tĩnh: đọc content/data.mjs và content/posts/*.md rồi sinh HTML, sitemap, robots, llms.txt vào thư mục dist.
   Chạy tự động trên Vercel (lệnh: node build.mjs). Không cần cài thư viện nào. */
import { mkdirSync, writeFileSync, readFileSync, readdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { C, CASES, SB } from "./content/data.mjs";

const OUT = "dist", today = new Date().toISOString().slice(0, 10);
const E = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const base = C.url.replace(/\/$/, ""), abs = p => (/^https?:/.test(p) ? p : base + p);
const href = c => (c.proj ? "/du-an/" : "/case-study/") + c.slug;
const trim = (s, n = 158) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s);
const write = (p, s) => { const f = OUT + p; mkdirSync(f.slice(0, f.lastIndexOf("/")), { recursive: true }); writeFileSync(f, s); };
const page = (p, html) => write(p === "/" ? "/index.html" : p + "/index.html", html);
const json = o => JSON.stringify(o).replace(/</g, "\\u003c");
const cases = CASES.filter(c => !c.proj), projects = CASES.filter(c => c.proj);

/* ---------- blog: markdown tối giản ---------- */
const inline = s => E(s).replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\*([^*]+)\*/g, "<i>$1</i>");
function md(src) {
  const out = []; let list = null, para = [];
  const flush = () => { if (para.length) { out.push("<p>" + inline(para.join(" ")) + "</p>"); para = []; } };
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const line of src.split("\n")) {
    const t = line.trim(); let m;
    if (!t) { flush(); close(); continue; }
    if ((m = t.match(/^(#{2,3})\s+(.*)$/))) { flush(); close(); out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); continue; }
    if ((m = t.match(/^[*-]\s+(.*)$/))) { flush(); if (list !== "ul") { close(); out.push("<ul>"); list = "ul"; } out.push("<li>" + inline(m[1]) + "</li>"); continue; }
    if ((m = t.match(/^\d+\.\s+(.*)$/))) { flush(); if (list !== "ol") { close(); out.push("<ol>"); list = "ol"; } out.push("<li>" + inline(m[1]) + "</li>"); continue; }
    if ((m = t.match(/^>\s?(.*)$/))) { flush(); close(); out.push("<blockquote>" + inline(m[1]) + "</blockquote>"); continue; }
    close(); para.push(t);
  }
  flush(); close(); return out.join("\n");
}
const posts = existsSync("content/posts") ? readdirSync("content/posts").filter(f => f.endsWith(".md") && !f.startsWith("_")).map(f => {
  const raw = readFileSync("content/posts/" + f, "utf8").replace(/\r/g, ""), m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/), meta = {};
  (m ? m[1] : "").split("\n").forEach(l => { const i = l.indexOf(":"); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  return { slug: meta.slug || f.replace(/\.md$/, ""), title: meta.title || f, desc: meta.description || "", date: meta.date || today, tags: (meta.tags || "").split(",").map(s => s.trim()).filter(Boolean), html: md(m ? m[2] : raw) };
}).sort((a, b) => b.date.localeCompare(a.date)) : [];

/* ---------- dữ liệu có cấu trúc (JSON-LD) ---------- */
const personId = base + "/#person";
const person = { "@type": "Person", "@id": personId, name: C.name, jobTitle: C.role, url: base + "/", email: C.email, image: abs(C.ogImage), description: C.desc,
  sameAs: C.contact.social.map(s => s.u), knowsAbout: C.skills.map(s => s[0]), address: { "@type": "PostalAddress", addressLocality: C.contact.loc } };
const crumbs = items => ({ "@type": "BreadcrumbList", itemListElement: items.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: base + u })) });

/* ---------- khung trang ---------- */
const head = ({ title, desc, path, type = "website", img = C.ogImage, ld, noindex }) => `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${E(title)}</title><meta name="description" content="${E(desc)}">
<link rel="canonical" href="${base}${path}">
<meta name="robots" content="${noindex ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1"}">
<meta name="author" content="${E(C.name)}"><meta name="theme-color" content="#0A0F1D">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="${E(C.name)}"><meta property="og:locale" content="vi_VN">
<meta property="og:title" content="${E(title)}"><meta property="og:description" content="${E(desc)}"><meta property="og:url" content="${base}${path}"><meta property="og:image" content="${abs(img)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${E(title)}"><meta name="twitter:description" content="${E(desc)}"><meta name="twitter:image" content="${abs(img)}">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">${posts.length ? `\n<link rel="alternate" type="application/rss+xml" title="${E(C.name)}" href="/feed.xml">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css">
${ld ? `<script type="application/ld+json">${json({ "@context": "https://schema.org", "@graph": ld })}</script>` : ""}</head>`;
const im = (src, alt, w, h, hero) => `<img src="${E(src)}" alt="${E(alt)}" width="${w}" height="${h}"${hero ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
const nav = (cur = "") => {
  const groups = [...new Set(C.projects.map(x => x.g))];
  return `<a class="skip" href="#main">Bỏ qua điều hướng</a>
<nav aria-label="Điều hướng chính"><div class="wrap"><a class="logo" href="/">${E(C.name)}</a><button id="burger" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
<ul class="menu" id="menu"><li><a href="/#about">Giới thiệu</a></li>
<li><a href="/#projects">Dự án</a><div class="dd">${groups.map(g => `<b>${E(g)}</b>` + C.projects.filter(p => p.g === g).map(p => { const u = href(CASES[p.ref]); return `<a href="${u}"${cur === u ? ' aria-current="page"' : ""}>${E(p.t)}</a>`; }).join("")).join("")}</div></li>
<li><a href="/#cases">Case study</a><div class="dd">${cases.map(c => `<a href="${href(c)}"${cur === href(c) ? ' aria-current="page"' : ""}>${E(c.title)}</a>`).join("")}</div></li>
<li><a href="/#strategies">Chiến lược</a></li><li><a href="/#certs">Chứng chỉ</a></li>${posts.length ? '<li><a href="/blog">Blog</a></li>' : ""}<li><a href="/#contact">Liên hệ</a></li>
<li><a class="btn fill" href="mailto:${E(C.email)}">Hợp tác</a></li></ul></div></nav>`;
};
const footer = () => `<footer class="ft"><div class="wrap"><div class="fg">
<div class="fb"><a class="logo" href="/">${E(C.name)}</a><p>${E(C.tagline)}</p><a class="btn fill" href="mailto:${E(C.email)}">Hợp tác cùng mình</a></div>
<nav aria-label="Khám phá"><p class="fh">Khám phá</p><ul><li><a href="/#about">Giới thiệu</a></li><li><a href="/#projects">Dự án</a></li><li><a href="/#cases">Case study</a></li><li><a href="/#strategies">Chiến lược</a></li><li><a href="/#certs">Chứng chỉ</a></li>${posts.length ? '<li><a href="/blog">Blog</a></li>' : ""}<li><a href="/#contact">Liên hệ</a></li></ul></nav>
<nav aria-label="Case study nổi bật"><p class="fh">Case study</p><ul>${cases.map(c => `<li><a href="${href(c)}">${E(trim(c.title, 52))}</a></li>`).join("")}</ul></nav>
<div><p class="fh">Liên hệ</p><address><a href="mailto:${E(C.email)}">${E(C.email)}</a><span>${E(C.contact.phone)}</span><span>${E(C.contact.loc)}</span></address>
<div class="fsoc">${C.contact.social.map(s => `<a href="${E(s.u)}" target="_blank" rel="noopener me" aria-label="${E(s.n)}" title="${E(s.n)}">${E(s.m)}</a>`).join("")}</div></div></div>
<div class="fbar"><span>© ${new Date().getFullYear()} ${E(C.name)}. Toàn bộ nội dung thuộc quyền sở hữu tác giả.</span><span><a href="/quyen-rieng-tu">Quyền riêng tư</a><a href="#main">Lên đầu trang</a></span></div></div>${C.demo ? '<div class="demo">Đây là nội dung mẫu để xem trước. Thay bằng nội dung thật và đặt demo:false trong content/data.mjs.</div>' : ""}</footer>
<script src="/assets/js/app.js" defer></script></body></html>`;
const shell = (meta, body, cls = "") => head(meta) + `\n<body${cls ? ` class="${cls}"` : ""}>\n` + nav(meta.nav) + `<main id="main">${body}</main>\n` + footer();
const kp = k => `<div class="kp">${k.map(x => `<div><b>${E(x[0])}</b><span>${E(x[1])}</span></div>`).join("")}</div>`;

/* ---------- trang chủ ---------- */
const home = () => `<section class="hf">${C.photo ? `<video autoplay muted loop playsinline><source src="https://avuggemsmyuuhfdnuyuj.supabase.co/storage/v1/object/public/portfolio/173707-849839066_medium.mp4" type="video/mp4"></video>` : ""}
<h1>${E(C.name)}</h1><p class="rl">${E(C.role)}</p>
<a class="dl" href="${E(C.cv || "#contact")}"${C.cv ? " download" : ""}>Tải CV</a>
<a class="sc" href="#about" aria-label="Cuộn xuống">CUỘN<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg></a></section>
<section class="about-hero" id="about">
    <div class="wrap">
        <!-- Sub-tag nghiêng kiểu Serif -->
        <div class="about-top-tag">/ Who Am I</div>
        
        <!-- Tiêu đề lớn 2 màu (Chữ đậm + Chữ màu nhạt) -->
        <h2 class="about-main-title">
            Hơn 5 năm kiến tạo <span class="highlight-text">dấu ấn thương hiệu</span>
        </h2>
        
        <div class="about-grid-layout">
            <!-- CỘT TRÁI: Khung ảnh nghiêng + Tên & Chức danh góc dưới bên phải -->
            <div class="about-col-left">
                <div class="about-photo-card">
                    <img src="https://avuggemsmyuuhfdnuyuj.supabase.co/storage/v1/object/public/portfolio/486142766_4014331232221528_4098672848268785320_n-Photoroom.png" alt="Lê Phục Sinh" loading="lazy">
                </div>
                <div class="about-author-info">
                    <h4>Lê Phục Sinh</h4>
                    <p>Người hành nghề Ma-két</p>
                </div>
            </div>

            <!-- CỘT PHẢI: Bio phía trên + Bảng kinh nghiệm có đường vạch dọc ngăn cách -->
            <div class="about-col-right">
                <p class="about-bio-text">
                    Hơn 5 năm kinh nghiệm trong lĩnh vực tiếp thị, chuyển hóa những thấu hiểu về con người thành tác động thương hiệu đầy ý nghĩa. Bởi lẽ, tiếp thị xuất sắc không chỉ dừng lại ở việc được nhìn thấy — mà còn là để lại dấu ấn khó phai trong tâm trí.
                </p>

                <div class="about-exp-wrapper">
                    <!-- Đường vạch dọc kẻ trái giống ảnh gốc -->
                    <div class="exp-vertical-line"></div>
                    <div class="about-exp-table">
                        <div class="exp-row">
                            <span class="exp-role">Digital Strategist</span>
                            <span class="exp-company">Gene Solutions</span>
                            <span class="exp-time">2024 &rarr; Present</span>
                        </div>
                        <div class="exp-row">
                            <span class="exp-role">MarCom</span>
                            <span class="exp-company">Viet Can JSC & DAS</span>
                            <span class="exp-time">2023 &rarr; 2024</span>
                        </div>
                        <div class="exp-row">
                            <span class="exp-role">MarCom & Digital Specialist</span>
                            <span class="exp-company">U&I Logistics</span>
                            <span class="exp-time">2022 &rarr; 2023</span>
                        </div>
                        <div class="exp-row">
                            <span class="exp-role">Marketing Executive</span>
                            <span class="exp-company">Ha Phan JSC</span>
                            <span class="exp-time">2019 &rarr; 2022</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<section class="sec" id="skills"><div class="wrap"><h2>${E(C.heads.skills[0])}</h2><p class="sub">${E(C.heads.skills[1])}</p>
<div class="grid3">${C.skills.map(s => `<div class="box"><h3>${E(s[0])}</h3><p>${E(s[1])}</p></div>`).join("")}</div></div></section>
<section class="sec" id="projects"><div class="wrap"><h2>${E(C.heads.projects[0])}</h2><p class="sub">${E(C.heads.projects[1])}</p>
<div class="grid3">${C.projects.map(p => `<a class="box pcard" href="${href(CASES[p.ref])}"><div class="top"><div class="lg">${p.logo ? im(p.logo, "", 200, 200) : "Logo"}</div><span class="tg">${E(p.tag)}</span></div><h3>${E(p.t)}</h3><p>${E(p.d)}</p>${kp(p.k)}<span class="more">Xem dự án</span></a>`).join("")}</div></div></section>
<section class="sec" id="cases"><div class="wrap"><h2>${E(C.heads.cases[0])}</h2><p class="sub">${E(C.heads.cases[1])}</p>
<div class="grid2">${cases.map(c => `<a class="box pcard" href="${href(c)}"><div class="cimg">${c.cover ? im(c.cover, c.title, 1600, 686) : ""}</div><span class="tg">${E(c.tag)}</span><h3>${E(c.title)}</h3><p>${E(c.summary)}</p>${kp(c.kpi)}<span class="more">Đọc case study</span></a>`).join("")}</div></div></section>
<section class="sec" id="strategies"><div class="wrap"><h2>${E(C.heads.strategies[0])}</h2><p class="sub">${E(C.heads.strategies[1])}</p>
<div class="grid4">${C.strategies.map(s => `<a class="box" href="${E(s.href)}" target="_blank" rel="noopener"><span class="tg">${E(s.tag)}</span><h3 style="margin:.4rem 0">${E(s.t)}</h3><p>${E(s.d)}</p></a>`).join("")}</div></div></section>
<section class="sec" id="certs"><div class="wrap"><h2>${E(C.heads.certs[0])}</h2>${C.heads.certs[1] ? `<p class="sub">${E(C.heads.certs[1])}</p>` : ""}<div class="certs">${C.certs.map(c => `<a href="${E(c[1])}">${E(c[0])}</a>`).join("")}</div></div></section>
<section class="sec" id="contact"><div class="wrap"><h2>${E(C.contact.h)}</h2>
<div class="ctg"><div><dl class="cd"><div><dt>Email</dt><dd><a href="mailto:${E(C.email)}">${E(C.email)}</a></dd></div><div><dt>Điện thoại</dt><dd>${E(C.contact.phone)}</dd></div><div><dt>Địa điểm</dt><dd>${E(C.contact.loc)}</dd></div></dl>
${E(C.contact.note)}</p><div class="soc">${C.contact.social.map(s => `<a href="${E(s.u)}" target="_blank" rel="noopener me" aria-label="${E(s.n)}"><i>${E(s.m)}</i>${E(s.n)}</a>`).join("")}</div></div>
<form id="cf" class="cf" data-sb-url="${E(SB.url)}" data-sb-key="${E(SB.key)}"><div class="r2"><input name="name" placeholder="Họ và tên" aria-label="Họ và tên" required maxlength="100" autocomplete="name"><input name="email" type="email" placeholder="Email" aria-label="Email" required maxlength="150" autocomplete="email"></div>
<input name="subject" placeholder="Chủ đề" aria-label="Chủ đề" maxlength="150"><textarea name="message" placeholder="Nội dung" aria-label="Nội dung" required minlength="5" maxlength="2000"></textarea>
<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label class="cs"><input type="checkbox" name="consent" required><span>Tôi đồng ý để ${E(C.name)} lưu thông tin này nhằm phản hồi liên hệ. Xem <a href="/quyen-rieng-tu"><u>chính sách quyền riêng tư</u></a>.</span></label>
<button class="btn fill big" type="submit">Gửi tin nhắn</button><p class="st" role="status" aria-live="polite"></p></form></div></div></section>`;
page("/", shell({ title: `${C.name} | ${C.role}`, desc: C.desc, path: "/", ld: [
  { "@type": "WebSite", "@id": base + "/#website", url: base + "/", name: C.name, inLanguage: "vi", publisher: { "@id": personId } },
  person, { "@type": "ProfilePage", "@id": base + "/#profile", url: base + "/", name: `${C.name} | ${C.role}`, dateModified: today, mainEntity: { "@id": personId } }] }, home()));

/* ---------- trang case study và dự án ---------- */
CASES.forEach(c => {
  const u = href(c), blk = (o, x = "") => `<section class="blk"><h2>${E(o.h)}</h2><div><p>${E(o.p)}</p>${x}</div></section>`;
  const pic = (s, a, w, h) => `<div class="ph has">${im(s, a, w, h)}</div>`;
  const others = CASES.filter(x => x !== c && !!x.proj === !!c.proj);
  const label = c.proj ? "Dự án" : "Case study", hub = c.proj ? "/#projects" : "/#cases";
  const body = `<article class="wrap narrow"><nav class="bc" aria-label="Breadcrumb"><a href="/">Trang chủ</a> › <a href="${hub}">${label}</a> › <span>${E(trim(c.title, 60))}</span></nav>
<header class="ch"><span class="tg">${E(c.tag)}</span><h1>${E(c.title)}</h1><p>${E(c.summary)}</p>
<ul class="kk">${c.kpi.map(k => `<li><b>${E(k[0])}</b>${E(k[1])}</li>`).join("")}</ul>
<dl class="meta">${c.meta.map(m => `<div><dt>${E(m[0])}</dt><dd>${E(m[1])}</dd></div>`).join("")}</dl></header>
<div class="cover">${c.cover ? pic(c.cover, c.title, 1600, 686) : ""}</div>
${blk(c.ctx)}${blk(c.goal)}
${blk(c.sol, `<ol class="steps">${c.sol.steps.map(s => `<li><b>${E(s.h)}</b><span>${E(s.p)}</span></li>`).join("")}</ol><div class="gal">${c.sol.gallery.map((g, n) => pic(g, `${c.title} (hình ${n + 1})`, 1200, 900)).join("")}</div>`)}
${blk(c.res, `<div class="mets">${c.res.m.map(m => `<div class="met"><i>Trước ${E(m.b)}</i><b>${E(m.a)}</b><small>${E(m.l)}</small><i>${E(m.s)}</i></div>`).join("")}</div><p class="note">${E(c.res.limit)}</p><div class="files">${c.res.files.map(f => `<a href="${E(f.url || "#")}"${f.url ? ' target="_blank" rel="noopener"' : ""}>${E(f.name)}</a>`).join("")}</div>`)}
${blk(c.les)}
<section class="others"><h2>${c.proj ? "Các dự án khác" : "Case study khác"}</h2><div class="og">${others.map(x => `<a class="oc" href="${href(x)}"><span class="tg">${E(x.tag)}</span><h3>${E(x.title)}</h3><p>${E(x.summary)}</p></a>`).join("")}</div></section></article>`;
  page(u, shell({ title: `${c.title} | ${C.name}`, desc: trim(c.summary), path: u, type: "article", img: c.cover || C.ogImage, nav: u, ld: [
    { "@type": "Article", "@id": base + u + "#article", headline: c.title, description: c.summary, image: c.cover ? [abs(c.cover)] : undefined, inLanguage: "vi", about: c.tag, author: { "@id": personId }, publisher: { "@id": personId }, mainEntityOfPage: base + u, dateModified: today, ...(c.date ? { datePublished: c.date } : {}) },
    person, crumbs([["Trang chủ", "/"], [label, hub], [c.title, u]])] }, body, "protect"));
});

/* ---------- quyền riêng tư, 404, blog ---------- */
page("/quyen-rieng-tu", shell({ title: `Quyền riêng tư | ${C.name}`, desc: `Cách ${C.name} thu thập và sử dụng thông tin bạn gửi qua biểu mẫu liên hệ.`, path: "/quyen-rieng-tu" }, `<div class="wrap narrow pg" style="max-width: 800px; margin: 0 auto; padding: 3rem 1.25rem;">
<h1 style="margin-bottom: 1.5rem;">Quyền riêng tư</h1>
<p><b>CHÍNH SÁCH QUYỀN RIÊNG TƯ</b></p>
<h2>1. Phạm vi và Mục đích thu thập thông tin</h2>
<ul>
    <li>Trang web thu thập các thông tin cá nhân do người dùng <b>chủ động cung cấp</b> qua biểu mẫu liên hệ, bao gồm: <b>Họ và tên</b>, <b>địa chỉ email</b>, <b>chủ đề</b> và <b>nội dung tin nhắn</b>.</li>
    <li>Thông tin này được sử dụng <b>độc quyền</b> nhằm mục đích phản hồi các yêu cầu liên hệ, giải đáp thắc mắc và trao đổi về các <b>cơ hội hợp tác nghề nghiệp</b>.</li>
    <li>Website cam kết <b>không sử dụng cookie theo dõi quảng cáo</b>, đồng thời <b>không bán, trao đổi hoặc chia sẻ</b> thông tin cá nhân với bên thứ ba vì mục đích thương mại.</li>
</ul>
<h2>2. Lưu trữ và Bảo mật dữ liệu</h2>
<ul>
    <li>Dữ liệu tin nhắn liên hệ được <b>lưu trữ an toàn</b> trong cơ sở dữ liệu có áp dụng các biện pháp kiểm soát truy cập nghiêm ngặt.</li>
    <li>Thông tin sẽ được <b>rà soát và xóa định kỳ</b> khi không còn cần thiết cho mục đích trao đổi hoặc theo yêu cầu hợp pháp của người dùng.</li>
    <li><b>Lưu trữ trình duyệt (Local Storage):</b> Website lưu trữ tạm thời một mốc thời gian (timestamp) trên trình duyệt nhằm mục đích kỹ thuật thuần túy: <b>giới hạn tần suất gửi tin nhắn lặp lại</b> (tối thiểu cách nhau 01 phút) nhằm ngăn chặn spam.</li>
</ul>
<h2>3. Quyền lợi của người dùng</h2>
<ul>
    <li>Người dùng có toàn quyền <b>yêu cầu truy cập, chỉnh sửa hoặc xóa bỏ</b> thông tin cá nhân của mình bất kỳ lúc nào.</li>
    <li>Mọi yêu cầu liên quan đến quyền riêng tư hoặc cần hỗ trợ, vui lòng gửi email trực tiếp về địa chỉ: <b>lephucsinh82@gmail.com</b>.</li>
</ul>
</div>`));

write("/404.html", shell({ title: `Không tìm thấy trang | ${C.name}`, desc: "Trang bạn tìm không tồn tại.", path: "/404", noindex: true }, `<div class="wrap narrow pg"><h1>Không tìm thấy trang</h1><p>Đường dẫn có thể đã thay đổi. Hãy quay về <a href="/"><u>trang chủ</u></a> hoặc xem các <a href="/#cases"><u>case study</u></a>.</p></div>`));

if (posts.length) {
  page("/blog", shell({ title: `Blog | ${C.name}`, desc: `Bài viết về ${C.role} của ${C.name}.`, path: "/blog", ld: [crumbs([["Trang chủ", "/"], ["Blog", "/blog"]])] },
    `<div class="wrap narrow pg"><h1>Blog</h1><div class="pl">${posts.map(p => `<a class="oc" href="/blog/${p.slug}"><span class="tg">${E(p.date)}</span><h3>${E(p.title)}</h3><p>${E(p.desc)}</p></a>`).join("")}</div></div>`));
  posts.forEach(p => { const u = "/blog/" + p.slug;
    page(u, shell({ title: `${p.title} | ${C.name}`, desc: trim(p.desc), path: u, type: "article", nav: u, ld: [
      { "@type": "BlogPosting", "@id": base + u + "#post", headline: p.title, description: p.desc, datePublished: p.date, dateModified: p.date, inLanguage: "vi", keywords: p.tags.join(", "), author: { "@id": personId }, mainEntityOfPage: base + u },
      person, crumbs([["Trang chủ", "/"], ["Blog", "/blog"], [p.title, u]])] },
      `<article class="wrap narrow pg"><nav class="bc" aria-label="Breadcrumb"><a href="/">Trang chủ</a> › <a href="/blog">Blog</a></nav><h1>${E(p.title)}</h1><p><time datetime="${E(p.date)}">${E(p.date)}</time>${p.tags.length ? " · " + E(p.tags.join(", ")) : ""}</p>${p.html}</article>`)); });
  write("/feed.xml", `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${E(C.name)}</title><link>${base}/</link><description>${E(C.desc)}</description>${posts.map(p => `<item><title>${E(p.title)}</title><link>${base}/blog/${p.slug}</link><guid>${base}/blog/${p.slug}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${E(p.desc)}</description></item>`).join("")}</channel></rss>`);
}

/* ---------- tệp cho công cụ tìm kiếm và trợ lý AI ---------- */
cpSync("src/assets", OUT + "/assets", { recursive: true });
const urls = ["/", ...cases.map(href), ...projects.map(href), ...(posts.length ? ["/blog", ...posts.map(p => "/blog/" + p.slug)] : []), "/quyen-rieng-tu"];
write("/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${base}${u === "/" ? "/" : u}</loc><lastmod>${today}</lastmod></url>`).join("")}</urlset>`);
const bots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"];
write("/robots.txt", `User-agent: *\nAllow: /\n\n${bots.map(b => `User-agent: ${b}\n${C.ai === false ? "Disallow: /" : "Allow: /"}\n`).join("\n")}\nSitemap: ${base}/sitemap.xml\n`);
const li = (t, u, d) => `- [${t}](${base}${u}): ${d.replace(/\n/g, " ")}`;
write("/llms.txt", `# ${C.name}\n\n> ${C.role}. ${C.desc}\n\n## Trang chính\n${li("Trang chủ", "/", C.tagline)}\n${li("Quyền riêng tư", "/quyen-rieng-tu", "Cách xử lý thông tin liên hệ")}\n\n## Case study\n${cases.map(c => li(c.title, href(c), c.summary)).join("\n")}\n\n## Dự án\n${projects.map(c => li(c.title, href(c), c.summary)).join("\n")}\n${posts.length ? `\n## Blog\n${posts.map(p => li(p.title, "/blog/" + p.slug, p.desc)).join("\n")}\n` : ""}`);
console.log(`Đã dựng ${urls.length} trang vào ${OUT}/ (${cases.length} case study, ${projects.length} dự án, ${posts.length} bài blog)`);
