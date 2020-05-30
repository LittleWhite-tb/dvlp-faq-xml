'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function codeFn(code, language) {
    if (language !== 'text') {
        return `<code langage="${language}" showLines="1"><![CDATA[${code}]]></code>`;
    }
    else {
        return `<code langage="${language}"><![CDATA[${code}]]></code>`;
    }
}
function blockquoteFn(quote) {
    let text = quote;
    text = text.replace('<paragraph>', '');
    text = text.replace('</paragraph>', '');
    return `<citation>${text}</citation>`;
}
function htmlFn(html) {
    return html;
}
function headingFn(text, level) {
    if (level === 1) {
        return text;
    }
    else if (level === 2) {
        return `<question>${text}</question>`;
    }
    else {
        return '';
    }
}
function hrFn() {
    return '<br />';
}
function listFn(body, ordered) {
    return (ordered) ? `<liste type="1">${body}</liste>` : `<liste>${body}</liste>`;
}
function listitemFn(text) {
    return `<element>${text}</element>`;
}
function paragraphFn(text) {
    return `<paragraph>${text}</paragraph>`;
}
function tableFn(header, body) {
    return `<tableau width="80%" border="1">${header}${body}</tableau>`;
}
function tablerowFn(content) {
    return `<ligne>${content}</ligne>`;
}
function tablecellFn(content, flags) {
    const tag = (flags.align) ? `<colonne align=${flags.align}>` : '<colonne>';
    return `${tag}${content}</colonne>`;
}
function strongFn(text) {
    return `<b>${text}</b>`;
}
function emFn(text) {
    return `<i>${text}</i>`;
}
function codespanFn(text) {
    return `<inline>${text}</inline>`;
}
function brFn() {
    return '<br />';
}
function delFn(text) {
    return `<s>${text}</s>`;
}
function linkFn(href, title, text) {
    return `<link href="${href}">${text}</link>`;
}
function imageFn(href) {
    return `<image src="${href}" />`;
}
function textFn(text) {
    return text;
}
exports.default = {
    code: codeFn,
    blockquote: blockquoteFn,
    html: htmlFn,
    heading: headingFn,
    hr: hrFn,
    list: listFn,
    listitem: listitemFn,
    paragraph: paragraphFn,
    table: tableFn,
    tablerow: tablerowFn,
    tablecell: tablecellFn,
    strong: strongFn,
    em: emFn,
    codespan: codespanFn,
    br: brFn,
    del: delFn,
    link: linkFn,
    image: imageFn,
    text: textFn
};
