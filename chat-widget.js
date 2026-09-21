/**
 * HACCP Pro — Widget de Chat IA
 * Incluir no final do <body> de qualquer página:
 *
 *   <script>
 *     var HACCP_CHAT_CONTEXT = 'landing'; // 'landing' | 'parceiros' | 'app'
 *     var HACCP_CHAT_WORKER  = 'https://haccp-sync.dontasko-geral.workers.dev';
 *   </script>
 *   <script src="chat-widget.js"></script>
 */
(function(){
  const WORKER   = window.HACCP_CHAT_WORKER || 'https://haccp-sync.dontasko-geral.workers.dev';
  const CONTEXT  = window.HACCP_CHAT_CONTEXT || 'landing';
  const history  = [];
  let   open     = false;

  const greetings = {
    landing:   'Olá! 👋 Sou o assistente do **HACCP Pro**. Posso ajudá-lo com informações sobre a aplicação, preços ou como começar o trial gratuito.',
    parceiros: 'Olá! 👋 Sou o assistente de parcerias do **HACCP Pro**. Posso explicar como funciona o programa de parceiros e quais são as vantagens.',
    app:       'Olá! 👋 Sou o suporte do **HACCP Pro**. Posso ajudá-lo a usar a aplicação ou responder a questões sobre HACCP e segurança alimentar.',
  };

  // ── Estilos ──
  const style = document.createElement('style');
  style.textContent = `
    #hpw-btn{position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#4f46e5);border:none;cursor:pointer;z-index:9999;box-shadow:0 4px 20px rgba(37,99,235,.4);display:flex;align-items:center;justify-content:center;font-size:24px;transition:transform .2s,box-shadow .2s;color:#fff}
    #hpw-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(37,99,235,.5)}
    #hpw-badge{position:absolute;top:-4px;right:-4px;width:18px;height:18px;background:#ef4444;border-radius:50%;font-size:11px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #fff;opacity:0;transition:opacity .3s}
    #hpw-badge.visible{opacity:1}
    #hpw-box{position:fixed;bottom:86px;right:20px;width:340px;max-width:calc(100vw - 32px);height:480px;max-height:calc(100vh - 120px);background:#131929;border:1px solid rgba(255,255,255,.1);border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.5);z-index:9998;display:flex;flex-direction:column;transform:scale(.92) translateY(16px);opacity:0;pointer-events:none;transition:transform .25s cubic-bezier(.34,1.56,.64,1),opacity .2s;overflow:hidden}
    #hpw-box.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
    #hpw-head{padding:14px 16px;background:linear-gradient(135deg,#1e3a8a,#312e81);display:flex;align-items:center;gap:10px;flex-shrink:0}
    #hpw-head-icon{width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:10px;display:grid;place-items:center;font-size:18px;flex-shrink:0}
    #hpw-head-info{flex:1;min-width:0}
    #hpw-head-name{font-family:system-ui,sans-serif;font-size:14px;font-weight:700;color:#fff;margin:0}
    #hpw-head-status{font-size:11px;color:rgba(255,255,255,.6);margin:0;display:flex;align-items:center;gap:4px}
    #hpw-head-status::before{content:'';width:7px;height:7px;background:#22c55e;border-radius:50%;display:inline-block}
    #hpw-close{background:none;border:none;color:rgba(255,255,255,.6);font-size:20px;cursor:pointer;padding:4px;line-height:1;flex-shrink:0}
    #hpw-close:hover{color:#fff}
    #hpw-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
    #hpw-msgs::-webkit-scrollbar{width:4px}
    #hpw-msgs::-webkit-scrollbar-track{background:transparent}
    #hpw-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
    .hpw-msg{max-width:88%;line-height:1.55;font-size:13.5px;font-family:system-ui,sans-serif;border-radius:14px;padding:10px 14px;animation:hpwFadeIn .2s ease}
    .hpw-msg.bot{background:#1a2235;color:#e2e8f0;border-bottom-left-radius:4px;align-self:flex-start}
    .hpw-msg.user{background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;border-bottom-right-radius:4px;align-self:flex-end}
    .hpw-msg p{margin:0 0 6px}
    .hpw-msg p:last-child{margin:0}
    .hpw-msg ul{margin:6px 0 0 16px;padding:0}
    .hpw-msg li{margin-bottom:3px}
    .hpw-msg strong{font-weight:700}
    .hpw-typing{display:flex;gap:5px;align-items:center;padding:12px 14px;background:#1a2235;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start}
    .hpw-typing span{width:7px;height:7px;background:#4b5270;border-radius:50%;animation:hpwBounce 1.2s infinite}
    .hpw-typing span:nth-child(2){animation-delay:.2s}
    .hpw-typing span:nth-child(3){animation-delay:.4s}
    #hpw-foot{padding:10px 12px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:8px;flex-shrink:0;background:#0d1120}
    #hpw-input{flex:1;background:#1a2235;border:1.5px solid rgba(255,255,255,.08);border-radius:10px;color:#e2e8f0;font-size:13px;font-family:system-ui,sans-serif;padding:9px 12px;outline:none;resize:none;max-height:80px;line-height:1.4;transition:border-color .2s}
    #hpw-input:focus{border-color:rgba(59,130,246,.5)}
    #hpw-input::placeholder{color:#4b5270}
    #hpw-send{width:36px;height:36px;background:linear-gradient(135deg,#2563eb,#4f46e5);border:none;border-radius:9px;color:#fff;font-size:16px;cursor:pointer;flex-shrink:0;transition:opacity .15s;align-self:flex-end}
    #hpw-send:hover{opacity:.88}
    #hpw-send:disabled{opacity:.4;cursor:default}
    @keyframes hpwFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes hpwBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
    @media(max-width:400px){#hpw-box{width:calc(100vw - 16px);right:8px;bottom:80px}}
  `;
  document.head.appendChild(style);

  // ── HTML ──
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button id="hpw-btn" title="Suporte IA HACCP Pro">
      🛡️
      <div id="hpw-badge">1</div>
    </button>
    <div id="hpw-box">
      <div id="hpw-head">
        <div id="hpw-head-icon">🛡️</div>
        <div id="hpw-head-info">
          <p id="hpw-head-name">Assistente HACCP Pro</p>
          <p id="hpw-head-status">Online — disponível 24h</p>
        </div>
        <button id="hpw-close" title="Fechar">✕</button>
      </div>
      <div id="hpw-msgs"></div>
      <div id="hpw-foot">
        <textarea id="hpw-input" placeholder="Escreva a sua questão..." rows="1"></textarea>
        <button id="hpw-send">➤</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  const btn    = document.getElementById('hpw-btn');
  const box    = document.getElementById('hpw-box');
  const msgs   = document.getElementById('hpw-msgs');
  const input  = document.getElementById('hpw-input');
  const send   = document.getElementById('hpw-send');
  const badge  = document.getElementById('hpw-badge');
  const close  = document.getElementById('hpw-close');

  // ── Saudação inicial ──
  let greeted = false;
  function showGreeting(){
    if(greeted) return;
    greeted = true;
    badge.classList.remove('visible');
    addMsg('bot', greetings[CONTEXT] || greetings.landing);
  }

  // Mostrar badge após 3 segundos
  setTimeout(()=>{ if(!open) badge.classList.add('visible'); }, 3000);

  // ── Toggle ──
  btn.addEventListener('click', ()=>{
    open = !open;
    box.classList.toggle('open', open);
    if(open){ showGreeting(); setTimeout(()=>input.focus(), 300); }
  });
  close.addEventListener('click', ()=>{ open=false; box.classList.remove('open'); });

  // ── Converter markdown simples ──
  function mdToHtml(text){
    return text
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/^- (.+)$/gm,'<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs,'<ul>$1</ul>')
      .split('\n\n').map(p => p.startsWith('<ul>') ? p : `<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
  }

  function addMsg(role, text){
    const div = document.createElement('div');
    div.className = 'hpw-msg ' + role;
    div.innerHTML = mdToHtml(text);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function showTyping(){
    const div = document.createElement('div');
    div.className = 'hpw-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  async function sendMessage(){
    const text = input.value.trim();
    if(!text) return;
    input.value = '';
    input.style.height = 'auto';
    send.disabled = true;

    addMsg('user', text);
    history.push({role:'user', content:text});

    const typing = showTyping();

    try {
      const res = await fetch(WORKER + '/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          message:    text,
          history:    history.slice(-6),
          context:    CONTEXT,
          session_id: sessionStorage.getItem('hpw_session') || Math.random().toString(36).slice(2),
        }),
      });

      const data = await res.json();
      typing.remove();

      const reply = data.reply || data.erro || 'Ocorreu um erro. Por favor tente novamente.';
      addMsg('bot', reply);
      history.push({role:'assistant', content:reply});

    } catch(e) {
      typing.remove();
      addMsg('bot', 'Sem ligação ao servidor. Contacte-nos em **suporte@haccpdigital.online**.');
    }

    send.disabled = false;
    input.focus();
  }

  // ── Eventos ──
  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e=>{
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
  });
  input.addEventListener('input', ()=>{
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });

  // Guardar session id
  if(!sessionStorage.getItem('hpw_session')){
    sessionStorage.setItem('hpw_session', Math.random().toString(36).slice(2));
  }

})();
