import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <>
      <style>{`
        .lp *{box-sizing:border-box}
        .lp{margin:0;background:#F8FAFC;color:#0F172A;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
        .lp a{color:inherit;text-decoration:none}
        .lp .container{max-width:1200px;margin:0 auto;padding:0 32px}
        @media(max-width:720px){.lp .container{padding:0 20px}}

        .lp .btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;padding:12px 20px;border-radius:12px;border:0;cursor:pointer;transition:all 180ms cubic-bezier(0.22,1,0.36,1);font-family:inherit;line-height:1;white-space:nowrap}
        .lp .btn-primary{background:#4F46E5;color:#fff;box-shadow:0 1px 2px rgba(79,70,229,.4),0 10px 24px -8px rgba(79,70,229,.5)}
        .lp .btn-primary:hover{background:#4338CA;transform:translateY(-1px);box-shadow:0 14px 32px -8px rgba(79,70,229,.6)}
        .lp .btn-secondary{background:#fff;color:#0F172A;border:1px solid #E2E8F0;box-shadow:0 1px 2px rgba(0,0,0,.05)}
        .lp .btn-secondary:hover{border-color:#CBD5E1;background:#FCFDFF}
        .lp .btn-ghost{background:transparent;color:#475569;padding:12px 14px}
        .lp .btn-ghost:hover{color:#0F172A}
        .lp .btn-lg{font-size:16px;padding:14px 24px;border-radius:14px}
        .lp .btn .arr{display:inline-block;transition:transform 200ms cubic-bezier(0.22,1,0.36,1)}
        .lp .btn:hover .arr{transform:translateX(3px)}

        .lp nav.top{position:sticky;top:0;z-index:50;background:rgba(248,250,252,.78);backdrop-filter:blur(14px) saturate(180%);-webkit-backdrop-filter:blur(14px) saturate(180%);border-bottom:1px solid rgba(15,23,42,0.06)}
        .lp nav.top .row{display:flex;align-items:center;justify-content:space-between;height:68px}
        .lp nav .brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;letter-spacing:-.01em}
        .lp nav .links{display:flex;gap:6px;align-items:center}
        .lp nav .links a{padding:8px 14px;border-radius:10px;font-size:14px;font-weight:500;color:#475569;transition:all 160ms}
        .lp nav .links a:hover{color:#0F172A;background:rgba(15,23,42,.04)}
        .lp nav .actions{display:flex;gap:8px;align-items:center}
        @media(max-width:840px){.lp nav .links{display:none}}

        .lp .hero{position:relative;padding:80px 0 96px;overflow:hidden;background:radial-gradient(1200px 600px at 10% -10%,#DBE3FF 0%,transparent 60%),radial-gradient(900px 500px at 90% 10%,#CFFAFE 0%,transparent 55%),linear-gradient(180deg,#F8FAFC 0%,#FFFFFF 100%)}
        .lp .hero::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,rgba(15,23,42,0.08),transparent)}
        .lp .hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
        @media(max-width:980px){.lp .hero-grid{grid-template-columns:1fr;gap:48px}.lp .hero{padding:56px 0 72px}}
        .lp .eyebrow-pill{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid rgba(15,23,42,0.08);padding:6px 12px 6px 6px;border-radius:999px;font-size:13px;font-weight:500;color:#475569;box-shadow:0 1px 2px rgba(0,0,0,.05);margin-bottom:24px}
        .lp .eyebrow-pill .tag{background:#EEF2FF;color:#4338CA;font-weight:700;padding:3px 10px;border-radius:999px;font-size:11px;letter-spacing:.04em}
        .lp h1.hero-h{font-weight:800;font-size:clamp(44px,5.6vw,72px);line-height:1.04;letter-spacing:-.032em;margin:0 0 20px}
        .lp h1.hero-h em{font-style:normal;background:linear-gradient(135deg,#06B6D4,#4F46E5);-webkit-background-clip:text;background-clip:text;color:transparent}
        .lp p.hero-sub{font-size:19px;line-height:1.55;color:#475569;margin:0 0 32px;max-width:520px}
        .lp .hero-meta{display:flex;align-items:center;gap:18px;color:#94A3B8;font-size:13px}
        .lp .hero-meta .av{display:flex}
        .lp .hero-meta .av span{width:28px;height:28px;border-radius:50%;border:2px solid #fff;margin-left:-8px;display:inline-block}
        .lp .hero-meta .av span:nth-child(1){background:linear-gradient(135deg,#FCA5A5,#F87171);margin-left:0}
        .lp .hero-meta .av span:nth-child(2){background:linear-gradient(135deg,#A5B4FC,#6366F1)}
        .lp .hero-meta .av span:nth-child(3){background:linear-gradient(135deg,#5EEAD4,#10B981)}
        .lp .hero-meta .av span:nth-child(4){background:linear-gradient(135deg,#FDE68A,#F59E0B)}
        .lp .hero-meta b{color:#0F172A;font-weight:600}

        .lp .mock-stage{position:relative;perspective:1400px}
        .lp .mock-card{background:#fff;border:1px solid rgba(15,23,42,0.08);border-radius:24px;box-shadow:0 30px 80px -20px rgba(15,23,42,.18),0 12px 32px -8px rgba(79,70,229,.15);overflow:hidden;transform:rotateY(-4deg) rotateX(2deg);transform-style:preserve-3d}
        .lp .mock-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(15,23,42,0.06);background:#fff}
        .lp .mock-head .dots{display:flex;gap:6px}
        .lp .mock-head .dots span{width:10px;height:10px;border-radius:50%;background:#E2E8F0}
        .lp .mock-head .url{font-family:'JetBrains Mono',monospace;font-size:11px;color:#94A3B8;background:#F1F5F9;padding:4px 12px;border-radius:8px}
        .lp .mock-body{display:grid;grid-template-columns:140px 1fr;min-height:380px}
        .lp .side{background:#FAFBFC;border-right:1px solid rgba(15,23,42,0.06);padding:14px 10px;display:flex;flex-direction:column;gap:4px}
        .lp .side .s-row{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;font-size:12px;color:#475569;font-weight:500}
        .lp .side .s-row.active{background:#fff;color:#0F172A;box-shadow:0 1px 2px rgba(0,0,0,.05);font-weight:600}
        .lp .side .s-row svg{width:14px;height:14px;flex-shrink:0;stroke:currentColor;stroke-width:1.75;fill:none;stroke-linecap:round;stroke-linejoin:round}
        .lp .side .s-sec{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94A3B8;padding:14px 10px 6px}
        .lp .main{padding:18px}
        .lp .main-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
        .lp .main-head h3{margin:0;font-size:16px;font-weight:700}
        .lp .main-head .filt{display:flex;gap:6px}
        .lp .filt .f{font-size:11px;padding:5px 10px;border-radius:999px;background:#F1F5F9;color:#475569;font-weight:600}
        .lp .filt .f.on{background:#4F46E5;color:#fff}
        .lp .item-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .lp .item{background:#fff;border:1px solid rgba(15,23,42,0.08);border-radius:12px;overflow:hidden}
        .lp .item .ph{height:78px;display:flex;align-items:center;justify-content:center;font-size:24px}
        .lp .item .ph.a{background:linear-gradient(135deg,#FEE2E2,#FECACA)}
        .lp .item .ph.b{background:linear-gradient(135deg,#D1FAE5,#A7F3D0)}
        .lp .item .ph.c{background:linear-gradient(135deg,#CFFAFE,#A5F3FC)}
        .lp .item .ph.d{background:linear-gradient(135deg,#EDE9FE,#DDD6FE)}
        .lp .item .meta{padding:8px 10px}
        .lp .item .pill{display:inline-block;font-size:9px;font-weight:700;padding:2px 7px;border-radius:999px;letter-spacing:.04em;text-transform:uppercase}
        .lp .pill.lost{background:#FEE2E2;color:#991B1B}
        .lp .pill.found{background:#D1FAE5;color:#065F46}
        .lp .item h4{margin:4px 0 1px;font-size:11.5px;font-weight:600;color:#0F172A}
        .lp .item p{margin:0;font-size:10px;color:#94A3B8}

        .lp .float{position:absolute;background:rgba(255,255,255,.82);backdrop-filter:blur(18px) saturate(180%);-webkit-backdrop-filter:blur(18px) saturate(180%);border:1px solid rgba(255,255,255,.6);border-radius:16px;box-shadow:0 20px 48px -12px rgba(15,23,42,.18),inset 0 1px 0 rgba(255,255,255,.5);padding:12px 14px;display:flex;align-items:center;gap:10px;animation:lp-float 6s ease-in-out infinite}
        .lp .float .ic{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;background:linear-gradient(135deg,#06B6D4,#4F46E5);font-size:14px}
        .lp .float .ic.ok{background:linear-gradient(135deg,#34D399,#10B981)}
        .lp .float h4{margin:0;font-size:12.5px;font-weight:600;color:#0F172A}
        .lp .float p{margin:1px 0 0;font-size:11px;color:#94A3B8}
        .lp .float.t1{top:-18px;right:-30px;animation-delay:0s}
        .lp .float.t2{bottom:40px;left:-44px;animation-delay:-2s}
        @keyframes lp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @media(max-width:980px){.lp .float.t1{right:0;top:-12px}.lp .float.t2{left:0;bottom:0}}

        .lp .trust{padding:64px 0 32px;border-bottom:1px solid rgba(15,23,42,0.06)}
        .lp .trust-label{text-align:center;font-size:13px;font-weight:600;color:#94A3B8;letter-spacing:.06em;margin-bottom:28px}
        .lp .logo-strip{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:32px 48px;opacity:.7;filter:grayscale(1);margin-bottom:48px}
        .lp .logo-strip .lg{font-weight:700;font-size:20px;letter-spacing:-.02em;color:#64748B;display:flex;align-items:center;gap:8px}
        .lp .logo-strip .lg .sq{width:18px;height:18px;border-radius:4px;background:#94A3B8}
        .lp .logo-strip .lg .ci{width:18px;height:18px;border-radius:50%;background:#94A3B8}
        .lp .logo-strip .lg .tri{width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:16px solid #94A3B8}
        .lp .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        @media(max-width:760px){.lp .stats{grid-template-columns:1fr}}
        .lp .stat{background:#fff;border:1px solid rgba(15,23,42,0.08);border-radius:20px;padding:28px;box-shadow:0 4px 16px -4px rgba(15,23,42,.08);position:relative;overflow:hidden}
        .lp .stat .big{font-size:44px;font-weight:800;letter-spacing:-.03em;line-height:1;background:linear-gradient(135deg,#4F46E5,#06B6D4);-webkit-background-clip:text;background-clip:text;color:transparent}
        .lp .stat .lab{margin-top:8px;font-size:14px;color:#475569}
        .lp .stat::after{content:"";position:absolute;top:-40px;right:-40px;width:120px;height:120px;background:radial-gradient(circle,rgba(79,70,229,.10),transparent 70%);border-radius:50%}

        .lp section.sx{padding:96px 0}
        @media(max-width:760px){.lp section.sx{padding:64px 0}}
        .lp .sec-head{text-align:center;max-width:680px;margin:0 auto 56px}
        .lp .sec-head .eb{display:inline-block;font-size:13px;font-weight:700;color:#4F46E5;letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px}
        .lp .sec-head h2{margin:0 0 14px;font-size:clamp(32px,3.4vw,46px);line-height:1.1;letter-spacing:-.025em;font-weight:700}
        .lp .sec-head p{margin:0;font-size:18px;color:#475569;line-height:1.55}

        .lp .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        @media(max-width:860px){.lp .steps{grid-template-columns:1fr}}
        .lp .step{background:#fff;border:1px solid rgba(15,23,42,0.08);border-radius:20px;padding:32px;box-shadow:0 4px 16px -4px rgba(15,23,42,.08);transition:all 250ms cubic-bezier(0.22,1,0.36,1)}
        .lp .step:hover{transform:translateY(-3px);box-shadow:0 12px 32px -8px rgba(15,23,42,.16)}
        .lp .step .num{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:12px;background:#EEF2FF;color:#4338CA;font-weight:700;font-size:14px;letter-spacing:.04em;margin-bottom:18px}
        .lp .step .ico{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#EEF2FF,#CFFAFE);display:flex;align-items:center;justify-content:center;margin-bottom:18px;color:#4F46E5}
        .lp .step .ico svg{width:24px;height:24px;stroke:currentColor;stroke-width:1.75;fill:none;stroke-linecap:round;stroke-linejoin:round}
        .lp .step h3{margin:0 0 8px;font-size:20px;font-weight:700;letter-spacing:-.01em}
        .lp .step p{margin:0;color:#475569;font-size:15px;line-height:1.55}

        .lp .features{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        @media(max-width:960px){.lp .features{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:520px){.lp .features{grid-template-columns:1fr}}
        .lp .feat{background:#fff;border:1px solid rgba(15,23,42,0.08);border-radius:18px;padding:24px;transition:all 220ms cubic-bezier(0.22,1,0.36,1)}
        .lp .feat:hover{transform:translateY(-2px);box-shadow:0 12px 32px -8px rgba(15,23,42,.14);border-color:#C7D2FE}
        .lp .feat .ic{width:42px;height:42px;border-radius:12px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;color:#4F46E5;margin-bottom:16px}
        .lp .feat .ic svg{width:22px;height:22px;stroke:currentColor;stroke-width:1.75;fill:none;stroke-linecap:round;stroke-linejoin:round}
        .lp .feat h4{margin:0 0 6px;font-size:15px;font-weight:650;letter-spacing:-.005em}
        .lp .feat p{margin:0;color:#94A3B8;font-size:13.5px;line-height:1.5}

        .lp .ps{background:linear-gradient(180deg,#FAFBFF 0%,#F8FAFC 100%);border-top:1px solid rgba(15,23,42,0.06);border-bottom:1px solid rgba(15,23,42,0.06)}
        .lp .ps-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
        @media(max-width:880px){.lp .ps-grid{grid-template-columns:1fr;gap:40px}}
        .lp .ps-illu{position:relative;aspect-ratio:1/1;max-width:480px;margin:0 auto;background:radial-gradient(circle at 30% 30%,#FEE2E2 0%,transparent 55%),radial-gradient(circle at 70% 70%,#CFFAFE 0%,transparent 55%),#fff;border:1px solid rgba(15,23,42,0.08);border-radius:28px;box-shadow:0 12px 40px -8px rgba(15,23,42,.16);overflow:hidden}
        .lp .ps-illu .person{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:110px}
        .lp .ps-illu .q{position:absolute;background:#fff;border:1px solid rgba(15,23,42,0.08);border-radius:14px;padding:10px 14px;font-size:12px;color:#475569;box-shadow:0 4px 16px -4px rgba(15,23,42,.12)}
        .lp .ps-illu .q1{top:14%;left:10%;animation:lp-wobble 5s ease-in-out infinite}
        .lp .ps-illu .q2{bottom:18%;right:8%;animation:lp-wobble 5s ease-in-out -2.5s infinite}
        .lp .ps-illu .q3{top:46%;right:6%;animation:lp-wobble 5s ease-in-out -1s infinite}
        @keyframes lp-wobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .lp .ps-right h2{margin:0 0 16px;font-size:clamp(30px,3.2vw,44px);line-height:1.1;letter-spacing:-.025em;font-weight:700}
        .lp .ps-right h2 em{font-style:normal;background:linear-gradient(135deg,#06B6D4,#4F46E5);-webkit-background-clip:text;background-clip:text;color:transparent}
        .lp .ps-right p{font-size:17px;line-height:1.6;color:#475569;margin:0 0 24px}
        .lp .flow{display:flex;flex-direction:column;gap:12px}
        .lp .flow .r{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid rgba(15,23,42,0.08);padding:14px 18px;border-radius:14px;box-shadow:0 1px 4px rgba(15,23,42,.04)}
        .lp .flow .n{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#06B6D4);color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .lp .flow .r b{display:block;font-size:14px;font-weight:600}
        .lp .flow .r span{font-size:13px;color:#94A3B8}

        .lp .ap{background:#0F172A;color:#fff;position:relative;overflow:hidden}
        .lp .ap::before{content:"";position:absolute;inset:0;background:radial-gradient(800px 500px at 20% 20%,rgba(79,70,229,.30),transparent 60%),radial-gradient(700px 500px at 80% 80%,rgba(6,182,212,.22),transparent 60%);pointer-events:none}
        .lp .ap .sec-head h2{color:#fff}
        .lp .ap .sec-head p{color:#CBD5E1}
        .lp .ap .sec-head .eb{color:#A5B4FC}
        .lp .phones{display:flex;justify-content:center;align-items:flex-end;gap:24px;flex-wrap:wrap;position:relative}
        .lp .phone{width:240px;background:#0B1020;border:7px solid #1B2440;border-radius:36px;padding:0;box-shadow:0 40px 80px -20px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04);overflow:hidden;position:relative}
        .lp .phone::before{content:"";position:absolute;top:8px;left:50%;transform:translateX(-50%);width:80px;height:18px;background:#0B1020;border-radius:0 0 12px 12px;z-index:3}
        .lp .phone .scr{aspect-ratio:9/19;background:#fff;color:#0F172A;font-size:11px;padding:30px 14px 14px;overflow:hidden}
        .lp .phone.dark .scr{background:#0B1020;color:#F8FAFC}
        .lp .phone .top-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
        .lp .phone .top-row .ti{font-weight:700;font-size:14px}
        .lp .phone .top-row .av{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#A5B4FC,#6366F1)}
        .lp .phone .sb{background:#F1F5F9;border-radius:10px;padding:8px 10px;display:flex;align-items:center;gap:7px;color:#94A3B8;font-size:11px;margin-bottom:12px}
        .lp .phone.dark .sb{background:#161E36;color:#64748B}
        .lp .phone .li{display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:#F8FAFC;margin-bottom:8px}
        .lp .phone.dark .li{background:#161E36}
        .lp .phone .li .th{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#FEE2E2,#FECACA);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
        .lp .phone .li.b .th{background:linear-gradient(135deg,#D1FAE5,#A7F3D0)}
        .lp .phone .li.c .th{background:linear-gradient(135deg,#CFFAFE,#A5F3FC)}
        .lp .phone .li .tx{flex:1;min-width:0}
        .lp .phone .li b{display:block;font-size:11px;font-weight:600}
        .lp .phone .li span{font-size:10px;color:#94A3B8}
        .lp .phone .li .pl{font-size:9px;font-weight:700;padding:2px 6px;border-radius:999px;background:#FEE2E2;color:#991B1B;text-transform:uppercase;letter-spacing:.04em}
        .lp .phone .li.b .pl{background:#D1FAE5;color:#065F46}
        .lp .phone .li.c .pl{background:#D1FAE5;color:#065F46}
        .lp .phone .form-row{padding:8px 10px;border:1px solid #E2E8F0;border-radius:10px;font-size:11px;color:#94A3B8;margin-bottom:8px}
        .lp .phone.dark .form-row{border-color:#1B2440;color:#64748B}
        .lp .phone .btn-m{margin-top:10px;background:#4F46E5;color:#fff;text-align:center;padding:10px;border-radius:10px;font-weight:600;font-size:12px}
        .lp .phone .notif{padding:10px;border-radius:10px;background:linear-gradient(135deg,rgba(79,70,229,.12),rgba(6,182,212,.12));border:1px solid rgba(79,70,229,.2);margin-bottom:8px;display:flex;gap:8px;align-items:flex-start}
        .lp .phone .notif .dot{width:8px;height:8px;border-radius:50%;background:#4F46E5;margin-top:4px;flex-shrink:0}
        .lp .phone .notif b{font-size:11px;font-weight:600;display:block}
        .lp .phone .notif p{margin:2px 0 0;font-size:10px;color:#94A3B8;line-height:1.4}

        .lp .testi{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        @media(max-width:980px){.lp .testi{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:560px){.lp .testi{grid-template-columns:1fr}}
        .lp .quote{background:#fff;border:1px solid rgba(15,23,42,0.08);border-radius:20px;padding:24px;box-shadow:0 1px 4px rgba(15,23,42,.04);display:flex;flex-direction:column;gap:18px;min-height:240px}
        .lp .quote .mk{font-family:Georgia,serif;font-size:42px;line-height:1;color:#C7D2FE;height:14px}
        .lp .quote p{margin:0;font-size:14.5px;line-height:1.6;color:#0F172A;flex:1}
        .lp .quote .who{display:flex;align-items:center;gap:10px}
        .lp .quote .av{width:36px;height:36px;border-radius:50%;flex-shrink:0}
        .lp .quote .av.a{background:linear-gradient(135deg,#A5B4FC,#6366F1)}
        .lp .quote .av.b{background:linear-gradient(135deg,#5EEAD4,#10B981)}
        .lp .quote .av.c{background:linear-gradient(135deg,#FDBA74,#F59E0B)}
        .lp .quote .av.d{background:linear-gradient(135deg,#FCA5A5,#EF4444)}
        .lp .quote b{display:block;font-size:13px;font-weight:600}
        .lp .quote span{font-size:12px;color:#94A3B8}

        .lp .cta{padding:96px 0}
        .lp .cta-card{position:relative;background:#0F172A;color:#fff;border-radius:32px;padding:80px 48px;text-align:center;overflow:hidden;box-shadow:0 40px 80px -20px rgba(79,70,229,.4)}
        .lp .cta-card::before{content:"";position:absolute;inset:-40px;background:radial-gradient(500px 320px at 20% 20%,rgba(79,70,229,.55),transparent 60%),radial-gradient(500px 320px at 80% 30%,rgba(6,182,212,.45),transparent 60%),radial-gradient(500px 320px at 50% 90%,rgba(16,185,129,.35),transparent 60%);filter:blur(20px)}
        .lp .cta-card>*{position:relative}
        .lp .cta-card .blob{position:absolute;border-radius:50%;filter:blur(60px);opacity:.6}
        .lp .cta-card .blob.b1{width:220px;height:220px;background:#4F46E5;top:-60px;right:10%}
        .lp .cta-card .blob.b2{width:180px;height:180px;background:#06B6D4;bottom:-40px;left:8%}
        .lp .cta-card .blob.b3{width:160px;height:160px;background:#10B981;top:40%;right:6%}
        .lp .cta-card h2{margin:0 0 14px;font-size:clamp(36px,4.4vw,60px);line-height:1.05;letter-spacing:-.03em;font-weight:800}
        .lp .cta-card p{margin:0 0 36px;font-size:18px;color:#CBD5E1;max-width:520px;margin-left:auto;margin-right:auto}
        .lp .cta-card .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .lp .cta-card .btn-w{background:#fff;color:#0F172A}
        .lp .cta-card .btn-w:hover{background:#F1F5F9}
        .lp .cta-card .btn-o{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.2)}
        .lp .cta-card .btn-o:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.4)}

        .lp footer{background:#fff;border-top:1px solid rgba(15,23,42,0.06);padding:64px 0 32px}
        .lp .foot-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
        @media(max-width:880px){.lp .foot-grid{grid-template-columns:1fr 1fr;gap:32px}}
        .lp .foot-brand p{font-size:14px;color:#94A3B8;line-height:1.55;max-width:280px;margin:12px 0 18px}
        .lp .foot-soc{display:flex;gap:8px}
        .lp .foot-soc a{width:36px;height:36px;border-radius:10px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;color:#475569;transition:all 160ms}
        .lp .foot-soc a:hover{background:#EEF2FF;color:#4F46E5}
        .lp .foot-soc svg{width:16px;height:16px;stroke:currentColor;stroke-width:1.75;fill:none;stroke-linecap:round;stroke-linejoin:round}
        .lp .foot-col h5{margin:0 0 14px;font-size:13px;font-weight:700;color:#0F172A}
        .lp .foot-col ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
        .lp .foot-col a{font-size:13.5px;color:#475569;transition:color 160ms}
        .lp .foot-col a:hover{color:#4F46E5}
        .lp .foot-bot{padding-top:28px;border-top:1px solid rgba(15,23,42,0.06);display:flex;justify-content:space-between;align-items:center;color:#94A3B8;font-size:13px;flex-wrap:wrap;gap:12px}
      `}</style>

      <div className="lp">
        {/* NAV */}
        <nav className="top">
          <div className="container row">
            <Link to="/" className="brand">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              Lost &amp; Found
            </Link>
            <div className="links">
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#testimonials">Customers</a>
            </div>
            <div className="actions">
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Get started <span className="arr">→</span></Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <header className="hero">
          <div className="container hero-grid">
            <div>
              <div className="eyebrow-pill"><span className="tag">NEW</span> AI similarity matching just shipped</div>
              <h1 className="hero-h">Lost something?<br /><em>Find it faster.</em></h1>
              <p className="hero-sub">A smart, community-powered lost &amp; found platform for offices, gyms, libraries, and shared spaces.</p>
              <div className="hero-meta">
                <div className="av"><span /><span /><span /><span /></div>
                <div><b>10,000+</b> people recovered their stuff this month</div>
              </div>
            </div>

            <div className="mock-stage">
              <div className="mock-card">
                <div className="mock-head">
                  <div className="dots"><span /><span /><span /></div>
                  <div className="url">app.lostandfound.com/space/atlas</div>
                  <div style={{ width: 36 }} />
                </div>
                <div className="mock-body">
                  <aside className="side">
                    <div className="s-row active">
                      <svg viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg> Feed
                    </div>
                    <div className="s-row">
                      <svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> Map
                    </div>
                    <div className="s-row">
                      <svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg> Alerts
                    </div>
                    <div className="s-sec">Spaces</div>
                    <div className="s-row">🏢 Atlas HQ</div>
                    <div className="s-row">🏋️ Gym</div>
                    <div className="s-row">📚 Library</div>
                  </aside>
                  <div className="main">
                    <div className="main-head">
                      <h3>Today's items</h3>
                      <div className="filt"><span className="f on">All</span><span className="f">Lost</span><span className="f">Found</span></div>
                    </div>
                    <div className="item-grid">
                      <div className="item"><div className="ph a">🎒</div><div className="meta"><span className="pill lost">Lost</span><h4>Black backpack</h4><p>Floor 2 · 14m ago</p></div></div>
                      <div className="item"><div className="ph b">🔑</div><div className="meta"><span className="pill found">Found</span><h4>Keys, red lanyard</h4><p>Cafe · 1h ago</p></div></div>
                      <div className="item"><div className="ph c">📱</div><div className="meta"><span className="pill found">Found</span><h4>iPhone 14 silver</h4><p>Gym locker</p></div></div>
                      <div className="item"><div className="ph d">👜</div><div className="meta"><span className="pill lost">Lost</span><h4>Tote bag</h4><p>Library</p></div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="float t1">
                <div className="ic ok">✓</div>
                <div><h4>Your wallet may have been found nearby</h4><p>Building A · 3 minutes ago</p></div>
              </div>
              <div className="float t2">
                <div className="ic">87%</div>
                <div><h4>AI match · high confidence</h4><p>Brown leather wallet · 2nd floor</p></div>
              </div>
            </div>
          </div>
        </header>

        {/* TRUST */}
        <section className="trust">
          <div className="container">
            <div className="trust-label">Used in coworking spaces, campuses, and gyms</div>
            <div className="logo-strip">
              <div className="lg"><span className="sq" /> Atlas Works</div>
              <div className="lg"><span className="ci" /> Northwave U</div>
              <div className="lg"><span className="tri" /> PeakFit</div>
              <div className="lg"><span className="sq" style={{ borderRadius: '9999px' }} /> Mercer Library</div>
              <div className="lg"><span className="ci" /> Loft &amp; Co</div>
              <div className="lg" style={{ letterSpacing: '-.04em' }}>●●● Hubspace</div>
            </div>
            <div className="stats">
              <div className="stat"><div className="big">2,500+</div><div className="lab">Items recovered every month</div></div>
              <div className="stat"><div className="big">87%</div><div className="lab">Match success rate, on average</div></div>
              <div className="stat"><div className="big">10,000+</div><div className="lab">Community members across 140 spaces</div></div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="sx" id="how">
          <div className="container">
            <div className="sec-head">
              <div className="eb">How it works</div>
              <h2>Three steps to reunite</h2>
              <p>From the second something goes missing to the moment it's back in your hands — designed to feel effortless.</p>
            </div>
            <div className="steps">
              <div className="step">
                <div className="num">01</div>
                <div className="ico"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg></div>
                <h3>Report an item</h3>
                <p>Upload photos, tag a category, drop a pin on where it was last seen. Takes under a minute.</p>
              </div>
              <div className="step">
                <div className="num">02</div>
                <div className="ico" style={{ background: 'linear-gradient(135deg,#CFFAFE,#D1FAE5)' }}><svg viewBox="0 0 24 24"><path d="M12 2 2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
                <h3>Community matching</h3>
                <p>AI similarity scans lost and found posts across your space. High-confidence matches notify both sides.</p>
              </div>
              <div className="step">
                <div className="num">03</div>
                <div className="ico" style={{ background: 'linear-gradient(135deg,#D1FAE5,#EEF2FF)' }}><svg viewBox="0 0 24 24"><path d="M12 22s-8-4.5-8-12a8 8 0 0 1 16 0c0 7.5-8 12-8 12z"/><path d="m9 12 2 2 4-4"/></svg></div>
                <h3>Reconnect safely</h3>
                <p>Verify ownership with a private question, then arrange a pickup spot — no shared phone numbers needed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="sx" id="features" style={{ background: '#FAFBFF', borderTop: '1px solid rgba(15,23,42,0.06)', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
          <div className="container">
            <div className="sec-head">
              <div className="eb">Features</div>
              <h2>Everything a shared space needs</h2>
              <p>Built for the front-desk reality of busy gyms, campuses, and coworking floors.</p>
            </div>
            <div className="features">
              <div className="feat"><div className="ic"><svg viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg></div><h4>Real-time feed</h4><p>Lost and found posts appear the moment they're submitted.</p></div>
              <div className="feat"><div className="ic"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg></div><h4>Photo upload</h4><p>Three photos per item, auto-rotated and optimized.</p></div>
              <div className="feat"><div className="ic"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></div><h4>Smart search</h4><p>Filter by category, date, location, or color in one tap.</p></div>
              <div className="feat"><div className="ic" style={{ background: 'linear-gradient(135deg,#EEF2FF,#CFFAFE)' }}><svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg></div><h4>AI matching</h4><p>Visual similarity engine surfaces likely pairs automatically.</p></div>
              <div className="feat"><div className="ic"><svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg></div><h4>Location pins</h4><p>Mark exactly where something was last seen on a floorplan.</p></div>
              <div className="feat"><div className="ic"><svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg></div><h4>Instant alerts</h4><p>Push, email, and in-app — only when there's a real match.</p></div>
              <div className="feat"><div className="ic"><svg viewBox="0 0 24 24"><path d="M12 22s-8-4.5-8-12a8 8 0 0 1 16 0c0 7.5-8 12-8 12z"/><path d="m9 12 2 2 4-4"/></svg></div><h4>Secure verification</h4><p>Owners answer a private question only they would know.</p></div>
              <div className="feat"><div className="ic" style={{ background: 'linear-gradient(135deg,#EEF2FF,#D1FAE5)' }}><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg></div><h4>Manager console</h4><p>Approve claims, archive resolved items, see space-wide stats.</p></div>
            </div>
          </div>
        </section>

        {/* PROBLEM / SOLUTION */}
        <section className="ps sx">
          <div className="container ps-grid">
            <div className="ps-illu">
              <div className="person">😩</div>
              <div className="q q1">Where did I leave it?</div>
              <div className="q q2">Front desk says no one turned it in…</div>
              <div className="q q3">My laptop bag had everything in it.</div>
            </div>
            <div className="ps-right">
              <div className="eb" style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: '#4F46E5', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 14 }}>From panic to peace of mind</div>
              <h2>Turning chaos into <em>community accountability</em>.</h2>
              <p>Most lost items never make it back because the system is broken — bins of stuff at the front desk, no record, no way to search. We fix that with a feed your community can actually use.</p>
              <div className="flow">
                <div className="r"><div className="n">1</div><div><b>Report in under a minute</b><span>Photo, category, where you last had it</span></div></div>
                <div className="r"><div className="n">2</div><div><b>AI finds the match</b><span>Compares your post to every found item</span></div></div>
                <div className="r"><div className="n">3</div><div><b>Verified handoff</b><span>Both sides confirm — no awkward DMs</span></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* APP PREVIEW */}
        <section className="ap sx">
          <div className="container">
            <div className="sec-head">
              <div className="eb">Mobile app</div>
              <h2>In your pocket, in seconds.</h2>
              <p>Report on the go, get notified the moment a match appears, and arrange pickup right in the app.</p>
            </div>
            <div className="phones">
              <div className="phone">
                <div className="scr">
                  <div className="top-row"><div className="ti">Report item</div><div className="av" /></div>
                  <div className="form-row">Type · Lost</div>
                  <div className="form-row">Title · Black umbrella</div>
                  <div className="form-row">Category · Accessory</div>
                  <div className="form-row" style={{ height: 54 }}>📷 Add photos</div>
                  <div className="btn-m">Submit report</div>
                </div>
              </div>
              <div className="phone">
                <div className="scr">
                  <div className="top-row"><div className="ti">Alerts</div><div className="av" style={{ background: 'linear-gradient(135deg,#5EEAD4,#10B981)' }} /></div>
                  <div className="notif"><div className="dot" /><div><b>Wallet may be found</b><p>Building A · floor 3 · 3 min ago</p></div></div>
                  <div className="notif" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.12),rgba(6,182,212,.12))', borderColor: 'rgba(16,185,129,.2)' }}><div className="dot" style={{ background: '#10B981' }} /><div><b>Claim verified ✓</b><p>Pick up at front desk between 9–11am</p></div></div>
                  <div className="notif"><div className="dot" style={{ background: '#06B6D4' }} /><div><b>2 new found items in PeakFit</b><p>Matching your lost watch</p></div></div>
                </div>
              </div>
              <div className="phone dark">
                <div className="scr">
                  <div className="top-row"><div className="ti">Search</div><div className="av" style={{ background: 'linear-gradient(135deg,#FDBA74,#F59E0B)' }} /></div>
                  <div className="sb">🔍 Black backpack, floor 2…</div>
                  <div className="li"><div className="th">🎒</div><div className="tx"><b>Black backpack</b><span>Floor 2 · 14m</span></div><span className="pl">Lost</span></div>
                  <div className="li b"><div className="th">🔑</div><div className="tx"><b>Keys, red lanyard</b><span>Cafe · 1h</span></div><span className="pl">Found</span></div>
                  <div className="li c"><div className="th">📱</div><div className="tx"><b>iPhone 14 silver</b><span>Gym locker</span></div><span className="pl">Found</span></div>
                  <div className="li b"><div className="th" style={{ background: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' }}>👜</div><div className="tx"><b>Tote bag</b><span>Library</span></div><span className="pl">Found</span></div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 48, color: '#94A3B8', fontSize: 13 }}>Light &amp; dark mode included — system preference respected.</div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="sx" id="testimonials">
          <div className="container">
            <div className="sec-head">
              <div className="eb">From the field</div>
              <h2>Loved by spaces that hate clutter.</h2>
              <p>Office managers, gym owners, librarians, and students — they all stop losing things to the void.</p>
            </div>
            <div className="testi">
              <div className="quote"><div className="mk">"</div><p>Our front desk used to be drowning in unclaimed water bottles. Now everything has a feed entry and gets matched in a day.</p><div className="who"><div className="av a" /><div><b>Priya Shah</b><span>Office manager · Atlas Works</span></div></div></div>
              <div className="quote"><div className="mk">"</div><p>Members used to call the desk asking about earbuds. Now they just open the app and find them — or report them — themselves.</p><div className="who"><div className="av b" /><div><b>Marcus Lee</b><span>Owner · PeakFit Gym</span></div></div></div>
              <div className="quote"><div className="mk">"</div><p>I'd been looking for my chemistry textbook for two weeks. Posted it on the app at lunch, had it back by 4pm.</p><div className="who"><div className="av c" /><div><b>Sara Mendez</b><span>Student · Northwave U</span></div></div></div>
              <div className="quote"><div className="mk">"</div><p>The manager dashboard tells me exactly how many items we recover each month. It's data we never had before.</p><div className="who"><div className="av d" /><div><b>Jordan Park</b><span>Facility lead · Mercer Library</span></div></div></div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta" id="cta">
          <div className="container">
            <div className="cta-card">
              <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
              <h2>Recover what matters.</h2>
              <p>Spin up Lost &amp; Found for your space in under five minutes. No card required.</p>
              <div className="btns">
                <Link to="/register" className="btn btn-lg btn-w">Get started <span className="arr">→</span></Link>
                <Link to="/login" className="btn btn-lg btn-o">Sign in</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="container">
            <div className="foot-grid">
              <div className="foot-brand">
                <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                  Lost &amp; Found
                </Link>
                <p>The community-powered lost &amp; found platform for offices, gyms, libraries, and shared spaces.</p>
                <div className="foot-soc">
                  <a href="#"><svg viewBox="0 0 24 24"><path d="M22 4.01s-2 1.5-4 2c-1.5-2-5-2-7 0-2 2-1 6-1 6S5 11.5 2 4c0 0-3 8 5 12-2 1-5 2-7 1 0 0 4 3 11 1 7-2 12-7 12-12.5 0-1-.5-2-1-2.5z"/></svg></a>
                  <a href="#"><svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
                  <a href="#"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4a4 4 0 1 1-8 .6 4 4 0 0 1 8-.6zM17.5 6.5h.01"/></svg></a>
                  <a href="#"><svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.3-.3 6.8-1.6 6.8-7.4a5.7 5.7 0 0 0-1.6-4 5.3 5.3 0 0 0-.1-4S18.5 0 16 2a13.4 13.4 0 0 0-7 0C6.5 0 5 0 5 0a5.3 5.3 0 0 0-.1 4 5.7 5.7 0 0 0-1.6 4c0 5.8 3.5 7.1 6.8 7.4-1 .9-1 2.3-1 2.6V22"/></svg></a>
                </div>
              </div>
              <div className="foot-col"><h5>Product</h5><ul><li><a href="#features">Features</a></li><li><a href="#how">How it works</a></li><li><a href="#cta">Pricing</a></li></ul></div>
              <div className="foot-col"><h5>Company</h5><ul><li><a href="#">About</a></li><li><a href="#testimonials">Customers</a></li><li><a href="#">Contact</a></li></ul></div>
              <div className="foot-col"><h5>Resources</h5><ul><li><a href="#">Help center</a></li><li><a href="#">Blog</a></li></ul></div>
              <div className="foot-col"><h5>Legal</h5><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li><li><a href="#">Security</a></li></ul></div>
            </div>
            <div className="foot-bot">
              <div>© 2026 Lost &amp; Found, Inc. All rights reserved.</div>
              <div>Made for shared spaces · v1.0</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
