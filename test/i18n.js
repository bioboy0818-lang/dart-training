/* 飛鏢特訓室：介面語言（中文／English／日本語）
   用法：頁面在主程式前載入本檔，並用 I18N.add({ '中文原文': ['English', '日本語'], ... }) 加入字典。
   程式裡的文字用 T('中文 {0}', 值) 取得目前語言；靜態 HTML 文字在載入時自動依字典替換。 */
(function () {
  const root = document.documentElement;
  const store = root.dataset.store || 'gt';
  const KEY = store + '.lang';
  const LANGS = ['zh', 'en', 'ja'];
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) {}
  if (!LANGS.includes(lang)) {
    const n = (navigator.language || 'zh').toLowerCase();
    lang = n.startsWith('zh') ? 'zh' : n.startsWith('ja') ? 'ja' : 'en';
  }
  const dict = {};
  const I18N = {
    lang, LANGS,
    names: { zh: '中文', en: 'English', ja: '日本語' },
    add(d) { Object.assign(dict, d); },
    set(l) {
      if (!LANGS.includes(l)) return;
      try { localStorage.setItem(KEY, l); } catch (e) {}
      I18N.lang = l;
    },
    has(s) { return Object.prototype.hasOwnProperty.call(dict, s); },
    tr(s) {
      if (I18N.lang === 'zh' || !I18N.has(s)) return s;
      const v = dict[s][I18N.lang === 'en' ? 0 : 1];
      return v == null ? s : v;
    },
    /* 把一段 DOM 裡的文字節點、aria-label、placeholder、title 依字典換掉 */
    dom(el) {
      if (I18N.lang === 'zh') return;
      const w = document.createTreeWalker(el || document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: n => n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
      });
      const list = [];
      while (w.nextNode()) list.push(w.currentNode);
      for (const n of list) {
        const t = n.nodeValue.trim();
        if (t && I18N.has(t)) n.nodeValue = n.nodeValue.replace(t, I18N.tr(t));
      }
      (el || document).querySelectorAll('[aria-label],[placeholder],[title]').forEach(e => {
        for (const a of ['aria-label', 'placeholder', 'title']) {
          const v = e.getAttribute(a);
          if (v && I18N.has(v)) e.setAttribute(a, I18N.tr(v));
        }
      });
      if (I18N.has(document.title)) document.title = I18N.tr(document.title);
    }
  };
  window.I18N = I18N;
  window.T = window.TR = (s, ...a) => String(I18N.tr(s)).replace(/\{(\d)\}/g, (m, i) => a[i] == null ? '' : a[i]);
  root.lang = { zh: 'zh-Hant', en: 'en', ja: 'ja' }[lang];
  if (lang === 'ja') {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;800&display=swap';
    document.head.appendChild(l);
    const st = document.createElement('style');
    st.textContent = ':root{--txt:"Noto Sans JP","Hiragino Sans",system-ui,sans-serif!important}';
    document.head.appendChild(st);
  }
})();
