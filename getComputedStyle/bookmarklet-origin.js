// 要件の洗い出し
// ・ページ内の全ての要素を対象にする
// ・各要素のcomputedStyleを取得する
// ・すべてのプロパティを対象にする

if (confirm("このページの全スタイルを取得してJSONファイルをダウンロードしますか？")) {
  new PageStyle();
}

class PageStyle {
  constructor() {
    this.allDom = document.querySelectorAll("*");
    this.excludeProperties = ["font-family"];
    this.excludeTags = ["html", "head", "meta", "link", "title", "style", "script", "noscript"];
    this.getComputedStyleInit()
  }

  getComputedStyleInit() {

    const returnObj = {}
    this.allDom.forEach((el, idx) => {
      if (!this.filterTargetTag(el)) {
        const key = `${this.createElIdentification(el)}__[${idx}]`;
        returnObj[key] = this.getComputedStyleEachEl(el);
      }
    });

    const json = JSON.stringify(returnObj, null, 2);
    const filename = this.createFileName();
    this.downloadJsonFile(json, filename);

    // navigator.clipboard.writeText(JSON.stringify(returnObj, null, 2))
    //   .then(() => {
    //     const excludeTagsList = this.excludeTags.join(", ");
    //     const excludePropertiesList = this.excludeProperties.join(", ");
    //     console.log(`Copied to Clipboard：[exclude tags: ${excludeTagsList}] [exclude properties: ${excludePropertiesList}]`);
    //   })
    //   .catch(e => console.log('Failed to Copy:', e));
  }

  filterTargetTag(element) {
    return this.excludeTags.includes(element.tagName.toLowerCase());
  }

  getComputedStyleEachEl(element) {
    const CSSStyleDeclaration = window.getComputedStyle(element);

    let elComputedStyle = {};
    for (let i = 0; i < CSSStyleDeclaration.length; i++) {
      const prop = CSSStyleDeclaration[i];
      if (this.excludeProperties.includes(prop)) continue;
      elComputedStyle[prop] = CSSStyleDeclaration.getPropertyValue(prop);
    }
    return elComputedStyle;
  }

  createElIdentification(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const cls = element.classList.length > 0 ? `.${[...element.classList].join(".")}` : "";
    return `${tag}${id}${cls}`;
  }

  // styles_ドメイン_yyyy-mm-ddThh-mm-ss.json
  createFileName() {
    const hostname = window.location.hostname.split(".").join("-");
    const [ymd, hms] = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' }).split(" ");
    const fmtDate = `${ymd.replaceAll("/", "-")}T${hms.replaceAll(":", "-")}`;
    return `styles_${hostname}_${fmtDate}.json`;
  }

  downloadJsonFile(json, filename) {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}