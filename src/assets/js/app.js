/* Tương tác phía trình duyệt: nội dung đã có sẵn trong HTML, file này chỉ thêm hiệu ứng, biểu mẫu và bảo vệ nội dung. */
(()=>{
const d=document,$=s=>d.querySelector(s),rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
const b=$("#burger"),m=$("#menu");
if(b&&m){b.addEventListener("click",()=>b.setAttribute("aria-expanded",m.classList.toggle("on")));m.addEventListener("click",e=>{if(e.target.closest("a"))m.classList.remove("on")})}
const bar=d.createElement("div");bar.id="bar";d.body.appendChild(bar);let t=0;
const u=()=>{t=0;const mx=d.documentElement.scrollHeight-innerHeight;bar.style.transform="scaleX("+(mx>0?Math.min(scrollY/mx,1):0)+")"};
addEventListener("scroll",()=>{t||(t=requestAnimationFrame(u))},{passive:true});addEventListener("resize",u);u();
d.addEventListener("pointermove",e=>{const c=e.target.closest&&e.target.closest(".box,.oc,.met");if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty("--mx",e.clientX-r.left+"px");c.style.setProperty("--my",e.clientY-r.top+"px")},{passive:true});
if(!rm&&"IntersectionObserver" in window){
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(!x.isIntersecting)return;const el=x.target;io.unobserve(el);
  const done=ev=>{if(ev.target!==el)return;el.removeEventListener("transitionend",done);el.classList.remove("rv","in");el.style.transitionDelay=""};
  el.addEventListener("transitionend",done);el.style.transitionDelay=(el.dataset.d||0)+"ms";el.classList.add("in")}),{threshold:.12,rootMargin:"0px 0px -6% 0px"});
 d.querySelectorAll(".box,.oc,.met,.blk,.cf,.meta,.certs a,.soc a").forEach((el,i)=>{el.dataset.d=(i%3)*70;el.classList.add("rv");io.observe(el)})}
const f=$("#cf");
if(f)f.addEventListener("submit",async e=>{
 e.preventDefault();const st=f.querySelector(".st"),bt=f.querySelector("button"),fd=new FormData(f),url=f.dataset.sbUrl,key=f.dataset.sbKey;
 const say=(x,ok)=>{st.textContent=x;st.style.color=ok?"var(--em)":"#B91C1C"};
 if(fd.get("website"))return;
 if(!url||url.indexOf("YOUR_")>-1){say("Biểu mẫu chưa được kết nối. Vui lòng gửi email trực tiếp.",false);return}
 let last=0;try{last=+localStorage.getItem("msgAt")||0}catch(_){}
 if(Date.now()-last<60000){say("Bạn vừa gửi tin nhắn, vui lòng đợi một phút.",false);return}
 bt.disabled=true;say("Đang gửi...",true);
 try{const r=await fetch(url+"/rest/v1/messages",{method:"POST",headers:{"Content-Type":"application/json",apikey:key,Prefer:"return=minimal"},
  body:JSON.stringify({name:fd.get("name").trim(),email:fd.get("email").trim(),subject:(fd.get("subject")||"").trim(),message:fd.get("message").trim()})});
  if(!r.ok)throw new Error(r.status);f.reset();try{localStorage.setItem("msgAt",Date.now())}catch(_){}say("Đã gửi. Mình sẽ phản hồi qua email của bạn.",true)}
 catch(_){say("Chưa gửi được. Vui lòng thử lại hoặc gửi email trực tiếp.",false)}
 bt.disabled=false});
if(d.body.classList.contains("protect")){
 const free=e=>e.target.closest&&e.target.closest(".open");
 ["contextmenu","copy","cut","dragstart","selectstart"].forEach(x=>d.addEventListener(x,e=>{if(!free(e))e.preventDefault()}));
 d.addEventListener("keydown",e=>{const k=e.key.toLowerCase(),c=e.ctrlKey||e.metaKey;if(k==="f12"||(c&&e.shiftKey&&"ijc".includes(k))||(c&&"usp".includes(k)))e.preventDefault()})}
})();
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('caseSlider');
  const btnNext = document.getElementById('caseScrollNext');
  const btnPrev = document.getElementById('caseScrollPrev');

  if (!slider) return;

  // 1. Xử lý nút bấm điều hướng
  const updateButtons = () => {
    if (!btnPrev || !btnNext) return;
    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    btnPrev.disabled = slider.scrollLeft <= 10;
    btnNext.disabled = slider.scrollLeft >= maxScrollLeft - 10;
  };

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      slider.scrollBy({ left: 440, behavior: 'smooth' });
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      slider.scrollBy({ left: -440, behavior: 'smooth' });
    });
  }

  slider.addEventListener('scroll', updateButtons);
  updateButtons();

  // 2. Xử lý Nắm kéo chuột (Drag-to-Scroll)
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.8; // Tốc độ lướt
    slider.scrollLeft = scrollLeft - walk;
  });
});
// Hiệu ứng Scroll Reveal chuyên nghiệp khi cuộn xuống
document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal-item');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Thêm độ trễ (stagger) cho từng khối tròn trồi lên mượt mà
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, index * 120);
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15 // Kích hoạt khi thấy 15% phần tử
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback cho trình duyệt cũ
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
});
