/**
 * @description 마크다운 문법 제거 및 카카오톡 서식 범위 생성
 * @param {string} markdown 마크다운 원문
 * @param {object} [options] 범위 형식, 문자 단위, 목록·링크·제목 표시 및 서식 키 설정
 * @param {"length"|"end"} [options.rangeFormat="length"] 범위의 두 번째 숫자 의미
 * @param {"utf16"|"codepoint"} [options.offsetUnit="utf16"] 오프셋 계산 단위
 * @param {"strip"|"keep"} [options.listMarkers="keep"] 목록 표시자 유지 여부
 * @param {"textAndUrl"|"textOnly"|"urlOnly"} [options.linkMode="textAndUrl"] 링크 표시 방식
 * @param {"both"|"heading"|"bold"} [options.headingStyle="both"] 제목에 적용할 서식
 * @param {boolean} [options.includeMeta=false] 범위별 메타데이터 포함 여부
 * @param {object} [options.keyNames={}] 서식 키 이름 매핑, null 지정 시 해당 서식 생략
 * @param {string} [options.hrText="━━━━━━━━━━━━━━━━━━━━"] 수평선 대체 문자열
 * @returns {{message: string, attachment: {richText?: object, spoilers?: {loc: number, len: number}[]}}} 정리된 본문과 서식 범위
 *
 * @author hehee https://github.com/hehee9
 * @license CC BY-NC-SA 4.0
 * - 저작권자 표기
 * - 라이선스 표기
 * - 상업적 이용 금지
 * - 동일 조건 변경 가능
 */




/* =================================== 전역 상수/변수 =================================== */


const _KEYS = [
    "bold", "italic", "strike"
    // 카카오톡 미지원 서식
    // "underline", "code", "codeBlock", "link", "heading", "quote",
    // "bulletList", "orderedList", "taskList", "highlight", "superscript", "subscript", "table"
    // 카카오톡 미지원 서식, attachment.spoilers로 별도 저장
    // "spoiler"
];
const _HTML_STYLES = Object.assign(Object.create(null), {
    b: "bold", strong: "bold", i: "italic", em: "italic", u: "underline", ins: "underline",
    s: "strike", del: "strike", strike: "strike", code: "code", mark: "highlight",
    sup: "superscript", sub: "subscript"
});
const _CJK_SCRIPT = /[\p{Script=Hangul}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;




/* =================================== 헬퍼/유틸 =================================== */


/** @description 참조 링크 이름의 공백 및 대소문자 정규화 */
function _referenceName(text) {
    return text.trim().replace(/\s+/g, " ").toLowerCase();
}
/** @description 이스케이프된 문장부호 복원 */
function _unescape(text) {
    return text.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~])/g, "$1");
}
/** @description 링크 주소 및 선택적 제목 구분 */
function _destination(text) {
    const match = /^\s*(?:<([^<>\n]*)>|(\S+?))(?:[ \t\n]+(?:"[^"\n]*"|'[^'\n]*'|\([^\n]*\)))?\s*$/.exec(text);
    if (!match) return null;
    return _unescape(match[1] === undefined ? match[2] : match[1]);
}
/** @description 따옴표와 이스케이프를 고려한 괄호 짝 색인 */
function _parentheses(text) {
    const pairs = new Map();
    const stack = [];
    let quote = "";
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === "\\") {
            i++;
        } else if (quote) {
            if (ch === quote) quote = "";
        } else if (stack.length && (ch === '"' || ch === "'") && /\s/.test(text[i - 1])) {
            quote = ch;
        } else if (ch === "(") {
            stack.push(i);
        } else if (ch === ")" && stack.length) {
            pairs.set(stack.pop(), i);
        }
    }
    return pairs;
}
/** @description 구분자 길이별 위치 색인 */
function _markerRuns(text, marker) {
    const runs = new Map();
    for (let i = 0; i < text.length; i++) {
        if (text[i] !== marker) continue;
        const start = i;
        while (text[i + 1] === marker) i++;
        const length = i - start + 1;
        if (!runs.has(length)) runs.set(length, { positions: [], cursor: 0 });
        runs.get(length).positions.push(start);
    }
    return runs;
}
/** @description 내부에 다른 여는 꺾쇠가 없는 태그 경계 색인 */
function _angleEnds(text) {
    const ends = new Map();
    let start = -1;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === "<") start = i;
        else if (text[i] === ">" && start !== -1) {
            ends.set(start, i);
            start = -1;
        }
    }
    return ends;
}
/** @description 강조 구분자의 좌우 공백과 문장부호 판정 */
function _flanking(text, start, length, marker) {
    const before = start ? String.fromCodePoint(text.codePointAt(start - (/[\uDC00-\uDFFF]/.test(text[start - 1]) && start > 1 ? 2 : 1))) : "";
    const after = text[start + length] === undefined ? "" : String.fromCodePoint(text.codePointAt(start + length));
    const beforeSpace = !before || /\s/.test(before);
    const afterSpace = !after || /\s/.test(after);
    const punctuation = /[!-/:-@\[-`{-~\u2000-\u206f\u3000-\u303f]/;
    const beforePunctuation = punctuation.test(before);
    const afterPunctuation = punctuation.test(after);
    const beforeCjk = _CJK_SCRIPT.test(before);
    const afterCjk = _CJK_SCRIPT.test(after);
    const left = !afterSpace && (!afterPunctuation || beforeSpace || beforePunctuation || beforeCjk);
    const right = !beforeSpace && (!beforePunctuation || afterSpace || afterPunctuation || afterCjk);
    return {
        canOpen: marker === "_" ? left && (!right || beforePunctuation) : left,
        canClose: marker === "_" ? right && (!left || afterPunctuation) : right
    };
}
/**
 * @description 구분자 연결 목록을 이용한 중첩 강조 짝 연결
 * @param {object[]} delimiters 토큰 문자열과 연결 상태를 갱신할 구분자 목록
 * @param {object[]} pairs 발견한 서식 경계를 추가할 공유 목록
 * @returns {void}
 */
function _pairDelimiters(delimiters, pairs) {
    const bottoms = Object.create(null);
    for (let i = 0; i < delimiters.length; i++) {
        delimiters[i].prev = i - 1;
        delimiters[i].next = i + 1 < delimiters.length ? i + 1 : -1;
    }
    /** @description 처리한 구분자를 연결 목록에서 제거 */
    function _remove(index) {
        const node = delimiters[index];
        if (node.prev !== -1) delimiters[node.prev].next = node.next;
        if (node.next !== -1) delimiters[node.next].prev = node.prev;
    }
    let closerIndex = delimiters.length ? 0 : -1;
    while (closerIndex !== -1) {
        const closer = delimiters[closerIndex];
        const emphasis = closer.marker === "*" || closer.marker === "_";
        const minimum = emphasis || closer.marker === "^" ? 1 : 2;
        if (!closer.canClose || closer.length < minimum) {
            closerIndex = closer.next;
            continue;
        }
        const category = closer.marker + ":" + closer.canOpen + ":" + (emphasis ? closer.originalLength % 3 : 0);
        const bottom = bottoms[category] === undefined ? -1 : bottoms[category];
        let openerIndex = closer.prev;
        while (openerIndex > bottom) {
            const opener = delimiters[openerIndex];
            const oddMatch = emphasis && (closer.canOpen || opener.canClose) &&
                (opener.originalLength + closer.originalLength) % 3 === 0 &&
                (opener.originalLength % 3 !== 0 || closer.originalLength % 3 !== 0);
            // 위첨자는 비어 있지 않고 이스케이프하지 않은 공백이 없는 내용에만 적용
            const validSuperscript = closer.marker !== "^" ||
                (closer.position > opener.position + opener.originalLength && closer.lastWhitespace < opener.position + opener.originalLength);
            if (opener.marker === closer.marker && opener.canOpen && opener.length >= minimum && !oddMatch && validSuperscript) break;
            openerIndex = opener.prev;
        }
        if (openerIndex <= bottom) {
            bottoms[category] = closer.prev;
            const next = closer.next;
            if (!closer.canOpen) _remove(closerIndex);
            closerIndex = next;
            continue;
        }
        const opener = delimiters[openerIndex];
        const used = emphasis ? (opener.length >= 2 && closer.length >= 2 ? 2 : 1) : minimum;
        const key = emphasis ? (used === 2 ? "bold" : "italic") : {
            "~": "strike", "|": "spoiler", "=": "highlight", "+": "underline", "^": "superscript"
        }[closer.marker];
        pairs.push({ open: opener.token, close: closer.token, key });
        opener.length -= used;
        closer.length -= used;
        let inner = opener.next;
        while (inner !== closerIndex) {
            const next = delimiters[inner].next;
            _remove(inner);
            inner = next;
        }
        if (!opener.length) _remove(openerIndex);
        if (!closer.length) {
            const next = closer.next;
            _remove(closerIndex);
            closerIndex = next;
        }
    }
    for (const delimiter of delimiters) delimiter.token.text = delimiter.marker.repeat(delimiter.length);
}
/**
 * @description 인라인 문법 토큰화 및 서식 경계 출력
 * @param {string} text 인라인 마크다운 원문
 * @param {object} state 본문 조각·출력 길이·서식 범위를 누적할 공유 상태
 * @returns {void}
 */
function _inline(text, state) {
    const tokens = [];
    const delimiters = [];
    const pairs = [];
    const brackets = [];
    const html = Object.create(null);
    const openMarkers = Object.create(null);
    const parentheses = _parentheses(text);
    const ticks = _markerRuns(text, "`");
    const dollars = _markerRuns(text, "$");
    const angleEnds = _angleEnds(text);
    const codeClosings = [];
    const codePattern = /<\/code\s*>/ig;
    let codeMatch;
    while ((codeMatch = codePattern.exec(text))) codeClosings.push({ start: codeMatch.index, end: codePattern.lastIndex });
    let codeCursor = 0;
    let linkCount = 0;
    let whitespaceCursor = 0;
    let lastWhitespace = -1;
    /** @description 표시 문자열과 서식 경계를 저장한 토큰 추가 */
    function _token(value) {
        const token = { text: value, opens: [], closes: [] };
        tokens.push(token);
        return token;
    }
    for (let i = 0; i < text.length;) {
        const ch = text[i];
        if (ch === "\\" && text[i + 1] === " ") {
            const token = _token("\\ ");
            token.escapedSpace = true;
            i += 2;
        } else if (ch === "\\" && i + 1 < text.length && /[!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~\n]/.test(text[i + 1])) {
            _token(text[i + 1]);
            i += 2;
        } else if (ch === "$" || ch === "`") {
            let length = 1;
            while (text[i + length] === ch) length++;
            const run = (ch === "`" ? ticks : dollars).get(length);
            while (run.cursor < run.positions.length && run.positions[run.cursor] <= i) run.cursor++;
            if (run.cursor < run.positions.length) {
                const end = run.positions[run.cursor++];
                if (ch === "$") {
                    _token(text.slice(i, end + length));
                } else {
                    let code = text.slice(i + length, end).replace(/\n/g, " ");
                    if (code.startsWith(" ") && code.endsWith(" ") && /[^ ]/.test(code)) code = code.slice(1, -1);
                    _token("⦗ " + code + " ⦘");
                }
                i = end + length;
            } else {
                _token(ch.repeat(length));
                i += length;
            }
        } else if (ch === "<") {
            const end = angleEnds.has(i) ? angleEnds.get(i) : -1;
            const inside = end === -1 ? "" : text.slice(i + 1, end);
            const tag = /^(\/)?([a-z]+)(?:\s+[^<>]*?)?\s*(\/)?$/i.exec(inside);
            if (/^https?:\/\/[^\s<>]+$/i.test(inside)) {
                const open = _token("");
                _token(inside);
                const close = _token("");
                pairs.push({ open, close, key: "link", meta: { url: inside } });
                i = end + 1;
            } else if (tag && tag[2].toLowerCase() === "br" && !tag[1]) {
                _token("\n");
                i = end + 1;
            } else if (tag && _HTML_STYLES[tag[2].toLowerCase()]) {
                const name = tag[2].toLowerCase();
                if (name === "code" && !tag[1]) {
                    while (codeCursor < codeClosings.length && codeClosings[codeCursor].start <= end) codeCursor++;
                    if (codeCursor < codeClosings.length) {
                        const closing = codeClosings[codeCursor++];
                        _token("⦗ " + text.slice(end + 1, closing.start) + " ⦘");
                        i = closing.end;
                        continue;
                    }
                }
                const token = _token(text.slice(i, end + 1));
                if (!html[name]) html[name] = [];
                if (tag[1] && html[name].length) {
                    const open = html[name].pop();
                    open.text = "";
                    token.text = "";
                    pairs.push({ open, close: token, key: _HTML_STYLES[name] });
                } else if (!tag[1]) {
                    html[name].push(token);
                }
                i = end + 1;
            } else {
                _token("<");
                i++;
            }
        } else if (text.startsWith("https://", i) || text.startsWith("http://", i)) {
            let end = i;
            while (end < text.length && !/[\s<>\[\]]/.test(text[end])) {
                const marker = text[end];
                if (openMarkers[marker]) {
                    let length = 1;
                    while (text[end + length] === marker) length++;
                    if ((length >= 2 || marker === "*" || marker === "_" || marker === "^") && _flanking(text, end, length, marker).canClose) break;
                    end += length;
                    continue;
                }
                end++;
            }
            _token(text.slice(i, end));
            i = end;
        } else if (ch === "[" || (ch === "!" && text[i + 1] === "[")) {
            const image = ch === "!";
            const token = _token(image ? "![" : "[");
            brackets.push({ token, start: i + (image ? 2 : 1), image, linkCount, delimiterStart: delimiters.length });
            i += image ? 2 : 1;
        } else if (ch === "]" && brackets.length) {
            const bracket = brackets.pop();
            let end = i + 1;
            let url = null;
            const label = i - bracket.start <= 999 ? text.slice(bracket.start, i) : null;
            if (text[end] === "(" && parentheses.has(end)) {
                const closing = parentheses.get(end);
                url = _destination(text.slice(end + 1, closing));
                if (url !== null) end = closing + 1;
            } else if (text[end] === "[") {
                const closing = text.indexOf("]", end + 1);
                if (closing !== -1 && closing - end <= 1000) {
                    const reference = text.slice(end + 1, closing) || label;
                    if (reference !== null) url = state.references.get(_referenceName(reference));
                    if (url !== undefined) end = closing + 1;
                }
            } else if (label !== null && !label.startsWith("^")) {
                url = state.references.get(_referenceName(label));
            }
            if (url !== null && url !== undefined && (bracket.image || bracket.linkCount === linkCount)) {
                _pairDelimiters(delimiters.splice(bracket.delimiterStart), pairs);
                const close = _token("");
                bracket.token.text = "";
                const pair = { open: bracket.token, close, key: "link", meta: { url }, linkMode: state.options.linkMode };
                pairs.push(pair);
                if (!bracket.image) linkCount++;
                i = end;
            } else {
                _token("]");
                i++;
            }
        } else if (ch === "*" || ch === "_" || ch === "~" || ch === "|" || ch === "=" || ch === "+" || ch === "^") {
            let length = 1;
            while (text[i + length] === ch) length++;
            const token = _token(ch.repeat(length));
            // 단일 ~는 일반 텍스트이며 아래첨자는 <sub>로만 처리
            if ((ch === "*" || ch === "_" || ch === "^") || length >= 2) {
                while (whitespaceCursor < i) {
                    if (text[whitespaceCursor] === "\\") whitespaceCursor += 2;
                    else {
                        if (/\s/.test(text[whitespaceCursor])) lastWhitespace = whitespaceCursor;
                        whitespaceCursor++;
                    }
                }
                const flank = _flanking(text, i, length, ch);
                delimiters.push({ token, marker: ch, length, originalLength: length, canOpen: flank.canOpen, canClose: flank.canClose, position: i, lastWhitespace });
                if (flank.canOpen) openMarkers[ch] = true;
            }
            i += length;
        } else {
            let end = i + 1;
            while (end < text.length && !/[\\`$<\[\]!_*~|=+^]/.test(text[end]) && !text.startsWith("https://", end) && !text.startsWith("http://", end)) end++;
            _token(text.slice(i, end).replace(/ {2,}(\n)?/g, (match, newline) => newline ? "\n" : match));
            i = end;
        }
    }
    _pairDelimiters(delimiters, pairs);
    for (const pair of pairs) {
        pair.open.opens.push(pair);
        pair.close.closes.push(pair);
    }
    let hidden = 0;
    let superscript = 0;
    for (const token of tokens) {
        for (const pair of token.closes) {
            if (pair.key === "superscript") superscript--;
            if (pair.linkMode === "urlOnly") hidden--;
            if (pair.range) pair.range.end = state.length;
            if (!hidden && pair.linkMode === "textAndUrl") {
                const label = state.parts.slice(pair.partStart).join("");
                const same = label.trim().toLowerCase() === pair.meta.url.trim().toLowerCase();
                if (same) {
                    state.replaceLinkLabel(pair.start, pair.partStart, pair.meta.url);
                    state.append(" ");
                } else {
                    state.append("( " + pair.meta.url + " )");
                }
            }
        }
        if (!hidden) state.append(token.escapedSpace && superscript ? " " : token.text);
        for (const pair of token.opens) {
            if (pair.key === "superscript") superscript++;
            if (pair.key === "spoiler") {
                pair.range = { start: state.length, end: state.length };
                state.spoilers.push(pair.range);
            } else {
                // 카카오톡 미지원 서식: pair.range = hidden ? null : state.start(pair.key, pair.meta);
                pair.range = hidden || !_KEYS.includes(pair.key) ? null : state.start(pair.key, pair.meta);
            }
            pair.start = state.length;
            pair.partStart = state.parts.length;
            if (pair.linkMode === "urlOnly") {
                if (!hidden) state.append(pair.meta.url);
                hidden++;
            }
        }
    }
}
/** @description 인용 및 목록 접두사 구분 */
function _prefix(line) {
    let text = line;
    let quote = 0;
    let match;
    while ((match = /^ {0,3}>[ \t]?/.exec(text))) {
        quote++;
        text = text.slice(match[0].length);
    }
    const list = /^([ \t]*)([-+*]|\d{1,9}[.)])[ \t]+(?:\[([ xX])\][ \t]+)?(.*)$/.exec(text);
    return { text, quote, list };
}
/** @description 코드 본문의 외부 인용 접두사만 제거 */
function _stripQuote(line, depth) {
    let text = line;
    for (let i = 0; i < depth; i++) {
        const match = /^ {0,3}>[ \t]?/.exec(text);
        if (!match) break;
        text = text.slice(match[0].length);
    }
    return text;
}
/** @description 코드와 이스케이프 안의 세로줄을 보존한 표 셀 분리 */
function _cells(line) {
    const cells = [];
    let start = 0;
    let code = 0;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === "\\") {
            i++;
        } else if (line[i] === "`") {
            let length = 1;
            while (line[i + length] === "`") length++;
            if (!code) code = length;
            else if (code === length) code = 0;
            i += length - 1;
        } else if (line[i] === "|" && !code) {
            cells.push(line.slice(start, i).trim());
            start = i + 1;
        }
    }
    cells.push(line.slice(start).trim());
    if (cells.length > 1 && !cells[0]) cells.shift();
    if (cells.length > 1 && !cells[cells.length - 1]) cells.pop();
    return cells;
}
/** @description 수평선 여부 판정 */
function _isRule(text) {
    return /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/.test(text);
}
/** @description 펜스 코드 시작 여부 판정 */
function _fence(text) {
    const match = /^ {0,3}(`{3,}|~{3,})([^\n]*)$/.exec(text);
    return match && !(match[1][0] === "`" && match[2].includes("`")) ? match : null;
}
/** @description 표 구분 행 여부 판정 */
function _tableDelimiter(text) {
    const cells = _cells(text);
    return text.includes("|") && cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}
/** @description 일반 텍스트용 코드 블록 렌더링 */
function _renderCodeBlock(code, lang) {
    return "\n┏━━━━━ " + lang + " ━━━━━┓\n" + code + "\n┗" + "━".repeat(10 + Math.ceil(lang.length / 2)) + "┛\n";
}
/** @description 인용 수준별 일반 텍스트 접두사 */
function _quotePrefix(level) {
    return "  ".repeat(level) + "‖ ".repeat(level);
}
/** @description 선행 공백과 탭의 들여쓰기 너비 계산 */
function _indentWidth(text) {
    let width = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") width++;
        else if (text[i] === "\t") width += 4 - width % 4;
        else break;
    }
    return width;
}
/** @description 지정 너비의 들여쓰기 제거 및 남는 탭 너비 보존 */
function _stripIndent(text, width) {
    let removed = 0;
    let end = 0;
    while (end < text.length && removed < width) {
        if (text[end] === " ") removed++;
        else if (text[end] === "\t") removed += 4 - removed % 4;
        else break;
        end++;
    }
    return " ".repeat(Math.max(0, removed - width)) + text.slice(end);
}
/** @description 문단이나 표를 중단하는 블록 시작 여부 판정 */
function _blockOpener(prefix) {
    return prefix.list || _fence(prefix.text) || _isRule(prefix.text) ||
        /^ {0,3}#{1,6}(?:[ \t]|$)/.test(prefix.text) || /^(?: {4}|\t)/.test(prefix.text) ||
        /^ {0,3}\$\$[ \t]*$/.test(prefix.text) || /^ {0,3}\[\^[^\]]+\]:/.test(prefix.text);
}
/**
 * @description 목록 항목 문맥을 유지한 블록 문법 및 문단 경계 처리
 * @param {string[]} lines 줄바꿈을 정규화한 원문 행
 * @param {object} state 본문 조각·출력 길이·서식 범위를 누적할 공유 상태
 * @returns {void}
 */
function _blocks(lines, state) {
    let hasBlock = false;
    let blank = false;
    // 표 출력 끝에 이미 포함된 줄바꿈 상태
    let tableTail = false;
    const items = [];
    const bullets = ["⦁", "￮", "▸", "▹"];
    /**
     * @description 활성 목록의 들여쓰기를 제거한 행과 소속 항목 조회
     * @param {number} index 원문 행 번호
     * @returns {object} 정규화한 접두사와 항목·들여쓰기 문맥
     */
    function _view(index) {
        const raw = lines[index];
        const prefix = _prefix(raw);
        const outside = new Map();
        for (let depth = items.length - 1; depth >= 0; depth--) {
            const item = items[depth];
            if (prefix.quote < item.outerQuote) continue;
            if (!outside.has(item.outerQuote)) {
                const text = _stripQuote(raw, item.outerQuote);
                outside.set(item.outerQuote, { text, indent: _indentWidth(text), blank: !text.trim() });
            }
            const body = outside.get(item.outerQuote);
            if (!body.blank && body.indent < item.contentIndent) continue;
            const nested = _prefix(_stripIndent(body.text, item.contentIndent));
            nested.quote += item.outerQuote;
            return { prefix: nested, item, depth, baseIndent: item.contentIndent, outerQuote: item.outerQuote };
        }
        return { prefix, item: null, depth: -1, baseIndent: 0, outerQuote: 0 };
    }
    /** @description 코드 본문에서 목록·외부 인용 접두사만 제거 */
    function _contentLine(index, item, quote) {
        const raw = lines[index];
        if (!item) return _stripQuote(raw, quote);
        if (raw.trim() && _prefix(raw).quote < item.outerQuote) return null;
        const outside = _stripQuote(raw, item.outerQuote);
        if (outside.trim() && _indentWidth(outside) < item.contentIndent) return null;
        return _stripQuote(_stripIndent(outside, item.contentIndent), quote - item.outerQuote);
    }
    /** @description 블록 사이 줄바꿈 준비 */
    function _begin(quote) {
        if (hasBlock) state.append(tableTail ? (blank ? "\n" : "") : blank ? "\n\n" : "\n");
        tableTail = false;
        // 카카오톡 미지원 서식: if (quote && !quoteRange) quoteRange = state.start("quote", { depth: quote });
        hasBlock = true;
        blank = false;
    }
    for (let i = 0; i < lines.length;) {
        const view = _view(i);
        let prefix = view.prefix;
        let text = prefix.text;
        if (state.definitionLines.has(i)) {
            i++;
            continue;
        }
        if (!text.trim()) {
            blank = hasBlock;
            i++;
            continue;
        }
        items.length = view.depth + 1;
        let item = view.item;
        let marker = "";
        if (prefix.list && !_isRule(text)) {
            const list = prefix.list;
            const depth = items.length;
            const ordered = /^\d/.test(list[2]);
            const task = list[3] !== undefined;
            const checked = task && list[3].toLowerCase() === "x";
            if (state.options.listMarkers === "keep") {
                marker = "  ".repeat(depth) + (task ? (checked ? "✔ " : "✖ ") : ordered ? list[2].slice(0, -1) + ". " : bullets[Math.min(depth, 3)] + " ");
            }
            const contentIndent = _indentWidth(list[1]) + list[0].length - list[1].length - list[4].length;
            item = {
                outerQuote: prefix.quote,
                contentIndent: (prefix.quote === view.outerQuote ? view.baseIndent : 0) + contentIndent
            };
            items.push(item);
            const nested = _prefix(list[4]);
            prefix = { text: nested.text, quote: prefix.quote + nested.quote, list: null };
            text = prefix.text;
        }
        _begin(prefix.quote);
        state.append(_quotePrefix(prefix.quote));
        state.append(marker);
        // 카카오톡 미지원 서식: if (item && !item.range) item.range = state.start(item.key, item.meta);
        const fence = _fence(text);
        if (fence) {
            const content = [];
            const marker = fence[1][0];
            const count = fence[1].length;
            const indent = _indentWidth(text);
            let end = i + 1;
            let closed = false;
            for (; end < lines.length; end++) {
                const body = _contentLine(end, item, prefix.quote);
                if (body === null) break;
                const closing = /^ {0,3}(`+|~+)[ \t]*$/.exec(body);
                if (closing && closing[1][0] === marker && closing[1].length >= count) {
                    closed = true;
                    break;
                }
                content.push(_stripIndent(body, indent));
            }
            // 카카오톡 미지원 서식: const range = state.start("codeBlock", { lang: fence[2].trim().split(/\s+/)[0] });
            const lang = fence[2].trim().split(/\s+/)[0] || "Code";
            state.append(_renderCodeBlock(content.join("\n").trim(), lang));
            i = closed ? end + 1 : end;
        } else if (/^(?: {4}|\t)/.test(text)) {
            const content = [];
            let end = i;
            for (; end < lines.length; end++) {
                const body = end === i ? text : _contentLine(end, item, prefix.quote);
                if (body === null || (body.trim() && !/^(?: {4}|\t)/.test(body))) break;
                content.push(_stripIndent(body, 4));
            }
            const contentLength = content.length;
            while (content.length && !content[content.length - 1]) content.pop();
            // 카카오톡 미지원 서식: const range = state.start("codeBlock", { lang: "" });
            state.append(_renderCodeBlock(content.join("\n").trim(), "Code"));
            if (content.length < contentLength) blank = true;
            i = end;
        } else if (/^ {0,3}\$\$[ \t]*$/.test(text)) {
            const content = [text];
            let end = i + 1;
            for (; end < lines.length; end++) {
                const body = _contentLine(end, item, prefix.quote);
                if (body === null) break;
                content.push(body);
                if (/^ {0,3}\$\$[ \t]*$/.test(body)) {
                    end++;
                    break;
                }
            }
            state.append(content.join("\n"));
            i = end;
        } else if (_isRule(text)) {
            state.append(state.options.hrText);
            i++;
        } else if (/^ {0,3}\[\^[^\]]+\]:/.test(text)) {
            state.append(text);
            i++;
        } else {
            const nextView = i + 1 < lines.length ? _view(i + 1) : null;
            const next = nextView && nextView.item === item ? nextView.prefix : null;
            const atx = /^ {0,3}(#{1,6})(?:[ \t]+(.*)|[ \t]*)$/.exec(text);
            const setext = next && next.quote === prefix.quote && /^ {0,3}(=+|-+)[ \t]*$/.exec(next.text);
            if (atx || setext) {
                const level = atx ? atx[1].length : setext[1][0] === "=" ? 1 : 2;
                const content = atx ? (atx[2] || "") : text.trim();
                // 카카오톡 미지원 서식: const heading = state.start("heading", { level });
                state.append("\n" + " ".repeat(Math.max(0, 8 - level * 2)) + "【");
                const heading = state.options.headingStyle === "heading" ? null : state.start("bold");
                _inline(content, state);
                if (heading) heading.end = state.length;
                state.append("】\n");
                i += atx ? 1 : 2;
            } else if (next && next.quote === prefix.quote && _tableDelimiter(next.text) && text.includes("|")) {
                // 카카오톡 미지원 서식: const table = state.start("table");
                let row = i;
                const headers = _cells(text);
                const rows = [];
                while (row < lines.length) {
                    if (row === i || row === i + 1) {
                        row++;
                        continue;
                    }
                    const bodyView = row === i ? { prefix, item } : _view(row);
                    const body = bodyView.prefix;
                    if (bodyView.item !== item || body.quote !== prefix.quote || !body.text.includes("|") || !body.text.trim() || (row !== i && _blockOpener(body))) break;
                    rows.push(_cells(body.text));
                    row++;
                }
                for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
                    if (!rows[rowIndex][0]) rows[rowIndex][0] = rows[rowIndex - 1][0];
                }
                for (let cell = 0; cell < headers.length; cell++) {
                    state.append("【");
                    const header = state.start("bold");
                    _inline(headers[cell], state);
                    if (header) header.end = state.length;
                    state.append("】\n");
                    const isGenre = headers[cell] === "장르";
                    let itemCounter = 0;
                    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                        const cellValue = rows[rowIndex][cell] || "";
                        if (isGenre && rowIndex > 0 && cellValue === rows[rowIndex - 1][cell]) continue;
                        itemCounter++;
                        const number = isGenre ? rowIndex + 1 : itemCounter;
                        state.append("    《" + number + "》 ");
                        _inline(cellValue, state);
                        state.append("\n");
                    }
                    state.append("-".repeat(25) + "\n");
                }
                i = row;
                tableTail = true;
            } else {
                const paragraph = [text];
                let paragraphHeading = 0;
                let end = i + 1;
                for (; end < lines.length; end++) {
                    const bodyView = _view(end);
                    const body = bodyView.prefix;
                    if (bodyView.item !== item || !body.text.trim() || body.quote !== prefix.quote || body.list || state.definitionLines.has(end)) break;
                    const underline = /^ {0,3}(=+|-+)[ \t]*$/.exec(body.text);
                    if (underline) {
                        paragraphHeading = underline[1][0] === "=" ? 1 : 2;
                        end++;
                        break;
                    }
                    if (_blockOpener(body)) break;
                    const followingView = end + 1 < lines.length ? _view(end + 1) : null;
                    const following = followingView && followingView.item === item ? followingView.prefix : null;
                    if (following && following.quote === body.quote && _tableDelimiter(following.text)) break;
                    paragraph.push(body.text);
                }
                if (paragraphHeading) {
                    // 카카오톡 미지원 서식: const heading = state.start("heading", { level: paragraphHeading });
                    state.append("\n" + " ".repeat(Math.max(0, 8 - paragraphHeading * 2)) + "【");
                    const heading = state.options.headingStyle === "heading" ? null : state.start("bold");
                    _inline(paragraph.join("\n").trim(), state);
                    if (heading) heading.end = state.length;
                    state.append("】\n");
                } else if (prefix.quote) {
                    const paragraphLines = paragraph.join("\n").split("\n");
                    for (let line = 0; line < paragraphLines.length; line++) {
                        if (line) {
                            state.append("\n");
                            state.append(_quotePrefix(prefix.quote));
                        }
                        _inline(paragraphLines[line], state);
                    }
                } else {
                    _inline(paragraph.join("\n"), state);
                }
                i = end;
            }
        }
        // 카카오톡 미지원 서식: if (item && item.range) item.range.end = state.length;
    }
}
/** @description 코드 블록 밖의 참조 링크 정의 수집 */
function _references(lines) {
    const references = new Map();
    const definitionLines = new Set();
    let fence = null;
    let math = false;
    for (let i = 0; i < lines.length; i++) {
        if (fence) {
            const body = _stripQuote(lines[i], fence.quote).replace(fence.stripIndent, "");
            const closing = /^ {0,3}(`+|~+)[ \t]*$/.exec(body);
            if (closing && closing[1][0] === fence.marker[0] && closing[1].length >= fence.marker.length) fence = null;
            continue;
        }
        const prefix = _prefix(lines[i]);
        const text = prefix.list ? prefix.list[4] : prefix.text;
        if (/^ {0,3}\$\$[ \t]*$/.test(text)) {
            math = !math;
            continue;
        }
        if (math) continue;
        const candidate = _fence(text);
        if (candidate) {
            const listIndent = prefix.list ? prefix.list[0].length - prefix.list[4].length : 0;
            fence = { marker: candidate[1], quote: prefix.quote, stripIndent: new RegExp("^ {0," + listIndent + "}") };
            continue;
        }
        const match = /^ {0,3}\[([^\]\n]{1,999})\]:[ \t]*(.*)$/.exec(text);
        if (!match || match[1].startsWith("^")) continue;
        const url = _destination(match[2]);
        if (url === null) continue;
        const name = _referenceName(match[1]);
        if (!references.has(name)) references.set(name, url);
        definitionLines.add(i);
    }
    return { references, definitionLines };
}
/** @description 서로게이트 쌍을 하나로 계산한 문자 경계 색인 */
function _codepointOffsets(text) {
    const offsets = new Array(text.length + 1);
    let count = 0;
    for (let i = 0; i < text.length; i++) {
        offsets[i] = count;
        const high = text.charCodeAt(i);
        if (high >= 0xD800 && high <= 0xDBFF && i + 1 < text.length) {
            const low = text.charCodeAt(i + 1);
            if (low >= 0xDC00 && low <= 0xDFFF) offsets[++i] = count;
        }
        count++;
    }
    offsets[text.length] = count;
    return offsets;
}




/* =================================== 메인 로직 =================================== */


/**
 * @description 마크다운을 일반 문자열과 카카오톡 서식 범위로 변환
 * @param {string} markdown 마크다운 원문
 * @param {object} [options] 범위 형식, 문자 단위, 목록·링크·제목 표시 및 서식 키 설정
 * @param {"length"|"end"} [options.rangeFormat="length"] 범위의 두 번째 숫자 의미
 * @param {"utf16"|"codepoint"} [options.offsetUnit="utf16"] 오프셋 계산 단위
 * @param {"strip"|"keep"} [options.listMarkers="keep"] 목록 표시자 유지 여부
 * @param {"textAndUrl"|"textOnly"|"urlOnly"} [options.linkMode="textAndUrl"] 링크 표시 방식
 * @param {"both"|"heading"|"bold"} [options.headingStyle="both"] 제목에 적용할 서식
 * @param {boolean} [options.includeMeta=false] 범위별 메타데이터 포함 여부
 * @param {object} [options.keyNames={}] 서식 키 이름 매핑, null 지정 시 해당 서식 생략
 * @param {string} [options.hrText="━━━━━━━━━━━━━━━━━━━━"] 수평선 대체 문자열
 * @returns {{message: string, attachment: {richText?: object, spoilers?: {loc: number, len: number}[]}}} 정리된 본문과 서식 범위
 */
function markdownToRichText(markdown, options) {
    const settings = Object.assign({
        rangeFormat: "length", offsetUnit: "utf16", listMarkers: "keep", linkMode: "textAndUrl",
        headingStyle: "both", includeMeta: false, keyNames: {}, hrText: "━".repeat(20)
    }, options);
    const keyNames = Object.create(null);
    for (const key of _KEYS) keyNames[key] = key;
    Object.assign(keyNames, settings.keyNames);
    const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
    const referenceData = _references(lines);
    const ranges = Object.create(null);
    const state = {
        options: settings, references: referenceData.references, definitionLines: referenceData.definitionLines,
        parts: [], length: 0, spoilers: [],
        /** @description 변환된 문자열 누적 */
        append(text) {
            if (text) {
                this.parts.push(text);
                this.length += text.length;
            }
        },
        /** @description 출력 위치의 서식 시작점 기록 */
        start(key, meta) {
            const name = keyNames[key];
            if (name === null) return null;
            if (!ranges[name]) ranges[name] = [];
            const range = { start: this.length, end: this.length, meta: settings.includeMeta ? meta : undefined };
            // 출력 순서에 따라 키별 시작점 정렬 유지
            ranges[name].push(range);
            return range;
        },
        /** @description URL과 같은 링크 표시를 대상 주소로 교체 */
        replaceLinkLabel(start, partStart, text) {
            const previous = this.parts.slice(partStart).join("");
            const end = this.length;
            const sourceStart = previous.length - previous.trimStart().length;
            const sourceLength = previous.trim().length;
            const mapOffset = position => {
                if (position <= start + sourceStart) return start;
                if (position >= start + sourceStart + sourceLength) return start + text.length;
                return start + Math.round((position - start - sourceStart) * text.length / sourceLength);
            };
            const delta = text.length - previous.length;
            for (const name of Object.keys(ranges)) {
                for (const range of ranges[name]) {
                    if (range.start >= start && range.start <= end) range.start = mapOffset(range.start);
                    if (range.end >= start && range.end <= end) range.end = mapOffset(range.end);
                    else if (range.end > end) range.end += delta;
                }
            }
            for (const range of this.spoilers) {
                if (range.start >= start && range.start <= end) range.start = mapOffset(range.start);
                if (range.end >= start && range.end <= end) range.end = mapOffset(range.end);
                else if (range.end > end) range.end += delta;
            }
            this.parts.length = partStart;
            this.append(text);
        }
    };
    _blocks(lines, state);
    const raw = state.parts.join("");
    const message = raw.trim();
    const left = raw.length - raw.trimStart().length;
    const right = left + message.length;
    const offsets = settings.offsetUnit === "codepoint" ? _codepointOffsets(message) : null;
    const richText = {};
    for (const name of Object.keys(ranges)) {
        const merged = [];
        const previous = new Map();
        for (const range of ranges[name]) {
            let start = Math.max(left, range.start) - left;
            let end = Math.min(right, range.end) - left;
            if (end <= start) continue;
            if (offsets) {
                start = offsets[start];
                end = offsets[end];
            }
            const signature = range.meta === undefined ? "" : JSON.stringify(range.meta);
            const last = previous.get(signature);
            if (last && last.end >= start) {
                last.end = Math.max(last.end, end);
            } else {
                const item = { start, end, meta: range.meta };
                merged.push(item);
                previous.set(signature, item);
            }
        }
        if (!merged.length) continue;
        const output = merged.map(range => {
            const item = [range.start, settings.rangeFormat === "end" ? range.end : range.end - range.start];
            if (range.meta !== undefined) item.push(range.meta);
            return item;
        });
        Object.defineProperty(richText, name, { value: output, enumerable: true, configurable: true, writable: true });
    }
    const attachment = {};
    if (Object.keys(richText).length) attachment.richText = richText;
    const spoilers = [];
    for (const range of state.spoilers) {
        let start = Math.max(left, range.start) - left;
        let end = Math.min(right, range.end) - left;
        if (end <= start) continue;
        if (offsets) {
            start = offsets[start];
            end = offsets[end];
        }
        const last = spoilers[spoilers.length - 1];
        if (last && last.loc + last.len >= start) last.len = Math.max(last.loc + last.len, end) - last.loc;
        else spoilers.push({ loc: start, len: end - start });
    }
    if (spoilers.length) attachment.spoilers = spoilers;
    return { message, attachment };
}




/* =================================== 이벤트/내보내기 =================================== */


module.exports = markdownToRichText;
