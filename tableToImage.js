/**
 * @description 마크다운 테이블을 이미지로 변환
 * @param {string} markdown 마크다운 테이블
 * @param {boolean} [saveAndReturnPath=false] true: 파일 저장 후 경로 반환, false: byte[] 반환
 * @returns {string|byte[]} 파일 경로 또는 PNG byte[]
 *
 * @author hehee https://github.com/hehee9
 * @license CC BY-NC-SA 4.0
 * - 저작권자 표기
 * - 라이선스 표기
 * - 상업적 이용 금지
 * - 동일 조건 변경 가능
 */




/* =================================== 상수/전역 =================================== */


const Bitmap = Java.type("android.graphics.Bitmap");
const BitmapFactory = Java.type("android.graphics.BitmapFactory");
const Canvas = Java.type("android.graphics.Canvas");
const Paint = Java.type("android.graphics.Paint");
const Color = Java.type("android.graphics.Color");
const Typeface = Java.type("android.graphics.Typeface");
const File = Java.type("java.io.File");
const FileOutputStream = Java.type("java.io.FileOutputStream");
const ByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream");
const RectF = Java.type("android.graphics.RectF");
const Jsoup = Java.type("org.jsoup.Jsoup");
const Base64 = Java.type("android.util.Base64");
const URLEncoder = Java.type("java.net.URLEncoder");


const REUSE_RECT = new RectF();


const TF_NORMAL = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL);
const TF_BOLD = Typeface.create(Typeface.DEFAULT, Typeface.BOLD);
const TF_ITALIC = Typeface.create(Typeface.DEFAULT, Typeface.ITALIC);
const TF_BOLD_ITALIC = Typeface.create(Typeface.DEFAULT, Typeface.BOLD_ITALIC);
const TF_MONO = Typeface.create(Typeface.MONOSPACE, Typeface.NORMAL);
const TF_MONO_BOLD = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD);
const TF_MONO_ITALIC = Typeface.create(Typeface.MONOSPACE, Typeface.ITALIC);
const TF_MONO_BOLD_ITALIC = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD_ITALIC);
const TF_LOOKUP = [
    // code=0
    TF_NORMAL,       // 0000: body, normal
    TF_BOLD,         // 0001: header (bold 기본)
    TF_BOLD,         // 0010: body, bold
    TF_BOLD,         // 0011: header, bold
    TF_ITALIC,       // 0100: body, italic
    TF_BOLD_ITALIC,  // 0101: header, italic
    TF_BOLD_ITALIC,  // 0110: body, bold+italic
    TF_BOLD_ITALIC,  // 0111: header, bold+italic
    // code=1
    TF_MONO,              // 1000: body, code
    TF_MONO_BOLD,         // 1001: header, code (bold 기본)
    TF_MONO_BOLD,         // 1010: body, code+bold
    TF_MONO_BOLD,         // 1011: header, code+bold
    TF_MONO_ITALIC,       // 1100: body, code+italic
    TF_MONO_BOLD_ITALIC,  // 1101: header, code+italic
    TF_MONO_BOLD_ITALIC,  // 1110: body, code+bold+italic
    TF_MONO_BOLD_ITALIC,  // 1111: header, code+bold+italic
];


const CODE_PAD_X = 10, CODE_PAD_Y = 6;
const IMAGE_PAD_X = 8, IMAGE_PAD_Y = 6;


const RE_ALIGN_CELL = /^:?-{2,}:?$/;
const RE_BR_TAG = /<br\s*\/?>/gi;
const RE_BASE64_PREFIX = /^base64[:|,]/;


const IMG_CACHE = new Map();


const BASE_ASPECT_RATIO = 2.5;  // 기본 최대 비율 (5:2)
const MAX_ASPECT_RATIO = 5.0;   // 허용 가능한 최대 비율 (10:2)
const MIN_CELL_WIDTH = 200;     // 최소 셀 폭




/* =================================== 유틸/헬퍼 =================================== */


/** @description 마크다운 테이블 1줄을 셀 배열로 변환 */
function _tokenizeRow(line) {
    let s = line.trim();
    if (s.startsWith("|")) s = s.slice(1);
    if (s.endsWith("|")) s = s.slice(0, -1);

    const cells = [];
    let buf = "";
    let code = false;

    for (let i = 0; i < s.length; i++) {
        const ch = s.charAt(i);

        // 코드 밖에서는 셀 구분자 escape만 소비하고 LaTeX 명령 백슬래시는 보존
        if (!code && ch === "\\") {
            if (i + 1 < s.length) {
                const next = s.charAt(i + 1);
                if (next === "|" || next === "\\") {
                    if (next === "\\" && i + 2 < s.length && /[A-Za-z()[\]{}]/.test(s.charAt(i + 2))) {
                        buf += "\\";
                        i += 1;
                        continue;
                    }
                    if (next === "|") {
                        buf += next;
                        i += 1;
                        continue;
                    }
                }
            }
            buf += "\\";
            continue;
        }

        // 인라인 코드 토글
        if (!code && ch === "`") {
            // 앞으로 닫힘 백틱이 존재하는지 검색(이스케이프 무시)
            let j = i + 1, close = -1;
            while (true) {
                j = s.indexOf("`", j);
                if (j < 0) break;
                let bs = 0;
                for (let k = j - 1; k >= 0 && s.charAt(k) === "\\"; k--) bs++;
                if (bs % 2 === 0) { close = j; break; }
                j = j + 1;
            }
            if (close < 0) {
                buf += ch;
                continue;
            }
            code = true;
            buf += ch;
            continue;
        }

        // 코드 내부의 닫힘 백틱
        if (code && ch === "`") {
            let bs = 0;
            for (let k = i - 1; k >= 0 && s.charAt(k) === "\\"; k--) bs++;
            if (bs % 2 === 1) {
                buf += ch;
                continue;
            }
            code = false;
            buf += ch;
            continue;
        }

        // 코드 밖의 실제 셀 구분자
        if (ch === "|" && !code) {
            cells.push(buf.trim());
            buf = "";
            continue;
        }

        buf += ch;
    }

    cells.push(buf.trim());
    return cells;
}
/** @description <br> 줄바꿈 변환 */
function _normalizeBr(s) {
    return (s || "").replace(RE_BR_TAG, "\n");
}


/** @description 정렬 추출 */
function _parseAlign(token) {
    const t = token.trim();
    const starts = t.startsWith(":");
    const ends = t.endsWith(":");
    if (starts && ends) return "center";
    if (ends) return "right";
    if (starts) return "left";
    return "left";
}
/** @description 문자 위치가 백슬래시로 이스케이프되었는지 확인 */
function _isEscapedAt(source, index) {
    let count = 0;
    for (let i = index - 1; i >= 0 && source.charAt(i) === "\\"; i--) count++;
    return count % 2 === 1;
}
/** @description 닫힘 수식 구분자 검색 */
function _findLatexClose(source, start, closeToken, allowNewline) {
    for (let i = start; i < source.length; i++) {
        if (!allowNewline && source.charAt(i) === "\n") return -1;
        if (source.startsWith(closeToken, i) && !_isEscapedAt(source, i)) return i;
    }
    return -1;
}
/** @description LaTeX 이미지 run 생성 */
function _makeLatexImageRun(tex, display) {
    const trimmed = String(tex || "").trim();
    if (!trimmed) return null;
    const formula = display
        ? "\\dpi{200} \\bg_white \\displaystyle " + trimmed
        : "\\dpi{200}\\bg{white}" + trimmed;
    const url = "https://latex.codecogs.com/png.latex?" + URLEncoder.encode(formula, "UTF-8");
    return { image: true, src: url, alt: trimmed };
}
/**
 * @description 인라인 변환(볼드/이탤릭/취소선/인라인 코드/LaTeX)
 * @param {string} line
 * @return {object[]} [{text, bold, italic, strike, code} | {image:true, src, alt}]
 */
function _parseInlineMdToRuns(line) {
    const s = line || "";
    let runs = [];
    let buf = "";
    let bold = false, italic = false, strike = false, code = false;

    function _flush() { if (buf.length > 0) { runs.push({ text: buf, bold, italic, strike }); buf = ""; } }
    function _flushCode() { if (buf.length > 0) { runs.push({ text: buf, code: true, bold, italic, strike }); buf = ""; } }

    let i = 0;
    while (i < s.length) {
        const ch = s.charAt(i);

        // 이미지 문법: ![alt](src)
        if (!code && ch === "!" && s.startsWith("![", i)) {
            const altStart = i + 2;
            const altEnd = s.indexOf("]", altStart);
            if (altEnd > 0 && altEnd + 1 < s.length && s.charAt(altEnd + 1) === "(") {
                const srcStart = altEnd + 2;
                const srcEnd = s.indexOf(")", srcStart);
                if (srcEnd > 0) {
                    const alt = s.slice(altStart, altEnd);
                    const src = s.slice(srcStart, srcEnd).trim();
                    _flush();
                    runs.push({ image: true, src, alt });
                    i = srcEnd + 1;
                    continue;
                }
            }
        }

        // LaTeX 토큰 처리 (추가) - 코드 블록(`) 바깥에서만
        if (!code) {
            // \(...\), \[...\]
            if ((s.startsWith("\\(", i) || s.startsWith("\\[", i)) && !_isEscapedAt(s, i)) {
                const closeToken = s.startsWith("\\(", i) ? "\\)" : "\\]";
                const end = _findLatexClose(s, i + 2, closeToken, closeToken === "\\]");
                if (end > i + 2) {
                    const run = _makeLatexImageRun(s.slice(i + 2, end), closeToken === "\\]");
                    if (run) {
                        _flush();
                        runs.push(run);
                        i = end + 2;
                        continue;
                    }
                }
            }
            // $$...$$ (display math)
            if (s.startsWith("$$", i)) {
                const end = _findLatexClose(s, i + 2, "$$", true);
                if (end > i + 2) {
                    const run = _makeLatexImageRun(s.slice(i + 2, end), true);
                    if (run) {
                        _flush();
                        runs.push(run);
                        i = end + 2;
                        continue;
                    }
                }
            }
            // $...$ (inline math)
            if (ch === "$" && !_isEscapedAt(s, i)) {
                // 이스케이프되지 않은 닫힘 '$' 찾기
                let end = _findLatexClose(s, i + 1, "$", false);
                if (end > i) {
                    const run = _makeLatexImageRun(s.slice(i + 1, end), false);
                    if (run) {
                        _flush();
                        runs.push(run);
                        i = end + 1;
                        continue;
                    }
                }
            }
        }

        // 코드 토글
        if (ch === "`") {
            if (code) { _flushCode(); code = false; }
            else { _flush(); code = true; }
            i += 1; continue;
        }

        // 코드 내부 literal 처리
        if (code) { buf += ch; i += 1; continue; }

        // 이스케이프
        if (ch === "\\") {
            if (i + 1 < s.length) { buf += s.charAt(i + 1); i += 2; continue; }
            buf += "\\"; i += 1; continue;
        }

        // 텍스트 스타일 토글
        if (s.startsWith("~~", i)) { _flush(); strike = !strike; i += 2; continue; }
        if (s.startsWith("**", i) || s.startsWith("__", i)) { _flush(); bold = !bold; i += 2; continue; }
        if (ch === "*" || ch === "_") { _flush(); italic = !italic; i += 1; continue; }

        buf += ch; i += 1;
    }
    if (code) _flushCode(); else _flush();
    if (runs.length === 0) runs.push({ text: "", bold: false, italic: false, strike: false });
    return runs;
}
function _isTextRun(run) {
    return run && run.image !== true;
}
function _isWhitespaceText(text) {
    return /^[\s]+$/.test(text || "");
}
function _splitWrapTokens(text) {
    return (text || "").match(/\s+|[^\s]+/g) || [];
}
function _sameTextStyle(a, b) {
    return _isTextRun(a) && _isTextRun(b) &&
           a.bold === b.bold &&
           a.italic === b.italic &&
           a.strike === b.strike &&
           a.code === b.code;
}
function _makeTextRun(run, text) {
    return {
        text,
        bold: run.bold,
        italic: run.italic,
        strike: run.strike,
        code: run.code
    };
}
function _measureTextSegment(run, text, paint, isHeader, isNewRun) {
    if (!text) return 0;
    paint.setTypeface(_getTypefaceFor(isHeader, run));
    const pad = (isNewRun && run.code === true) ? CODE_PAD_X * 2 : 0;
    return paint.measureText(text) + pad;
}
function _trimWrappedLine(line) {
    const trimmed = line.slice();

    while (trimmed.length > 0) {
        const first = trimmed[0];
        if (!_isTextRun(first) || first.code === true) break;
        first.text = (first.text || "").replace(/^\s+/, "");
        if (first.text.length > 0) break;
        trimmed.shift();
    }

    while (trimmed.length > 0) {
        const last = trimmed[trimmed.length - 1];
        if (!_isTextRun(last) || last.code === true) break;
        last.text = (last.text || "").replace(/\s+$/, "");
        if (last.text.length > 0) break;
        trimmed.pop();
    }

    return trimmed;
}
function _appendTextSegment(line, run, text, paint, isHeader) {
    if (!text) return 0;
    const last = line.length > 0 ? line[line.length - 1] : null;
    const merge = last && _sameTextStyle(last, run);
    const width = _measureTextSegment(run, text, paint, isHeader, !merge);
    if (merge) last.text += text;
    else line.push(_makeTextRun(run, text));
    return width;
}
function _maxUnbreakableTextWidth(text, run, paint, isHeader) {
    let maxW = 0;
    const tokens = _splitWrapTokens(text);
    for (let token of tokens) {
        if (_isWhitespaceText(token)) continue;
        maxW = Math.max(maxW, _measureTextSegment(run, token, paint, isHeader, true));
    }
    return Math.ceil(maxW);
}
function _maxUnbreakableLineWidth(line, paint, isHeader) {
    let maxW = 0;
    for (let run of line.runs || []) {
        if (run.image === true) {
            maxW = Math.max(maxW, run._w || 0);
            continue;
        }
        maxW = Math.max(maxW, _maxUnbreakableTextWidth(run.text || "", run, paint, isHeader));
    }
    return Math.ceil(maxW);
}
/**
 * @description runs 배열을 maxWidth에 맞게 공백/단어 우선으로 워드랩
 * @param {object[]} runs 텍스트/이미지 runs 배열
 * @param {number} maxWidth 최대 폭 (px)
 * @param {Paint} paint 측정용 Paint
 * @param {boolean} isHeader 헤더 여부
 * @returns {object[][]} 줄별 runs 배열
 */
function _wrapRuns(runs, maxWidth, paint, isHeader) {
    if (!runs || runs.length === 0 || maxWidth <= 0) {
        return [runs];
    }

    const wrappedLines = [];
    let currentLine = [];
    let currentLineW = 0;

    const pushCurrentLine = () => {
        const trimmed = _trimWrappedLine(currentLine);
        if (trimmed.length > 0) wrappedLines.push(trimmed);
        currentLine = [];
        currentLineW = 0;
    };

    const addByChars = (run, text) => {
        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);
            if (!run.code && _isWhitespaceText(ch) && currentLine.length === 0) continue;

            const last = currentLine.length > 0 ? currentLine[currentLine.length - 1] : null;
            const merge = last && _sameTextStyle(last, run);
            const chW = _measureTextSegment(run, ch, paint, isHeader, !merge);

            if (currentLineW > 0 && currentLineW + chW > maxWidth) {
                pushCurrentLine();
                if (!run.code && _isWhitespaceText(ch)) continue;
            }

            currentLineW += _appendTextSegment(currentLine, run, ch, paint, isHeader);
        }
    };

    for (let run of runs) {
        // 이미지는 워드랩 불가 - 줄 안에 들어가지 않으면 다음 줄로 이동
        if (run.image === true) {
            const imgW = run._w || 0;
            if (currentLineW > 0 && currentLineW + imgW > maxWidth) pushCurrentLine();
            currentLine.push(run);
            currentLineW += imgW;
            continue;
        }

        const text = run.text || "";
        if (text.length === 0) continue;

        const tokens = _splitWrapTokens(text);
        for (let token of tokens) {
            const isSpace = _isWhitespaceText(token);
            if (!run.code && isSpace && currentLine.length === 0) continue;

            const last = currentLine.length > 0 ? currentLine[currentLine.length - 1] : null;
            const merge = last && _sameTextStyle(last, run);
            const tokenW = _measureTextSegment(run, token, paint, isHeader, !merge);

            if (!isSpace && tokenW > maxWidth) {
                if (currentLineW > 0) pushCurrentLine();
                addByChars(run, token);
                continue;
            }

            if (currentLineW > 0 && currentLineW + tokenW > maxWidth) {
                pushCurrentLine();
                if (!run.code && isSpace) continue;
            }

            currentLineW += _appendTextSegment(currentLine, run, token, paint, isHeader);
        }
    }

    if (currentLine.length > 0) pushCurrentLine();

    if (wrappedLines.length === 0) {
        return [[{ text: "", bold: false, italic: false, strike: false }]];
    }

    return wrappedLines;
}
/**
 * @description 한 셀을 레이아웃으로 변환
 * @param {string} text
 * @param {boolean} isHeader
 * @param {Paint} paint
 * @param {object} fm FontMetrics
 * @param {number} [maxCellWidth=0] 최대 셀 폭 (0이면 워드랩 없음)
 * @return {object} { lines: {runs: object[], width: number}[], maxWidth: number, lineCount: number }
 */
function _layoutCell(text, isHeader, paint, fm, maxCellWidth = 0) {
    const rawLines = _normalizeBr(text).split("\n");
    const unitH = (fm.descent - fm.ascent);

    let lines = [];
    let maxW = 0;

    /**
     * @description runs 배열의 폭 계산 (이미지 스케일링 포함)
     * @param {object[]} runs
     * @param {number} units 이미지 높이 단위
     * @param {boolean} onlyImages 이미지만 있는 줄인지
     * @returns {{width: number, hasContent: boolean}}
     */
    const calcRunsWidth = (runs, units, onlyImages) => {
        let width = 0;
        let hasContent = false;

        for (let run of runs) {
            if (run.image === true) {
                const info = run._imgInfo || _getImageInfo(run.src);
                if (info?.w > 0 && info.h > 0) {
                    const availH = Math.max(1, (onlyImages ? units : 1) * unitH - IMAGE_PAD_Y * 2);
                    const scale = availH / info.h;
                    const imgW = Math.ceil(info.w * scale);
                    const imgH = Math.ceil(info.h * scale);
                    run._img = info.bmp;
                    run._imgW = imgW;
                    run._imgH = imgH;
                    run._w = imgW + IMAGE_PAD_X * 2;
                    hasContent = true;
                    width += run._w;
                    continue;
                }
                // 대체 텍스트
                paint.setTypeface(_getTypefaceFor(isHeader, { bold: false, italic: false }));
                const fallback = run.alt ? `[${run.alt}]` : "[img]";
                const tW = paint.measureText(fallback);
                width += tW;
                hasContent = true;
                continue;
            }

            // 텍스트/코드
            paint.setTypeface(_getTypefaceFor(isHeader, run));
            if (run.text?.length > 0) {
                hasContent = true;
                const tW = paint.measureText(run.text);
                width += (run.code === true ? (tW + CODE_PAD_X * 2) : tW);
            }
        }

        return { width: Math.ceil(width), hasContent };
    };

    for (let raw of rawLines) {
        let runs = _parseInlineMdToRuns(raw);

        const onlyImages = runs.length > 0 && runs.every(r => r.image === true);

        let units = 1;
        if (onlyImages) {
            let maxSrcH = 0;
            for (let r of runs) {
                const info = _getImageInfo(r.src);
                r._imgInfo = info;
                if (info?.h > maxSrcH) maxSrcH = info.h;
            }
            if (maxSrcH > 0) {
                if (maxSrcH <= 128) units = 1;
                if (maxSrcH <= 400) units = 2;
                else if (maxSrcH <= 876) units = 3;
                else if (maxSrcH <= 1600) units = 4;
                else units = 5;
            }
        }

        // 이미지 스케일링을 위해 먼저 한번 계산 (이미지의 _w 값 설정)
        calcRunsWidth(runs, units, onlyImages);

        // 워드랩 적용 여부 결정
        if (maxCellWidth > 0 && !onlyImages) {
            // 워드랩 적용
            const wrappedLines = _wrapRuns(runs, maxCellWidth, paint, isHeader);
            for (let wrappedRuns of wrappedLines) {
                const { width, hasContent } = calcRunsWidth(wrappedRuns, 1, false);
                maxW = Math.max(maxW, width);
                lines.push({
                    runs: hasContent ? wrappedRuns : [{ text: "", bold: false, italic: false, strike: false }],
                    width,
                    units: 1
                });
            }
        } else {
            // 워드랩 없음 (기존 동작)
            const { width, hasContent } = calcRunsWidth(runs, units, onlyImages);
            maxW = Math.max(maxW, width);
            lines.push({
                runs: hasContent ? runs : [{ text: "", bold: false, italic: false, strike: false }],
                width,
                units
            });
        }
    }

    const unitsTotal = lines.reduce((acc, l) => acc + (l.units || 1), 0);
    if (lines.length === 0) lines.push({ runs: [{ text: "", bold: false, italic: false, strike: false }], width: 0, units: 1 });

    return { lines, maxWidth: Math.ceil(maxW), lineCount: lines.length, unitsTotal };
}


/**
 * @description 헤더 여부/스타일에 따른 폰트
 * @param {boolean} isHeader
 * @param {object} run
 * @return {android.graphics.Typeface}
 */
function _getTypefaceFor(isHeader, run) {
    const idx = (isHeader ? 1 : 0) |
              (run?.bold ? 2 : 0) |
              (run?.italic ? 4 : 0) |
              (run?.code ? 8 : 0);
    return TF_LOOKUP[idx];
}


/**
 * @description 캐시 포함 이미지 정보 조회
 * @param {string} src
 * @return {{bmp: android.graphics.Bitmap, w: number, h: number}|null}
 */
function _getImageInfo(src) {
    let info = IMG_CACHE.get(src);
    if (info) return info;
    const bmp = _loadBitmapFromSrc(src);
    if (!bmp) return null;
    info = { bmp, w: bmp.getWidth(), h: bmp.getHeight() };
    IMG_CACHE.set(src, info);
    return info;
}
/**
 * @description src에서 비트맵 로드
 * @param {string} src
 * @return {android.graphics.Bitmap|null}
 */
function _loadBitmapFromSrc(src) {
    try {
        if (!src) return null;
        if (src.startsWith("http://") || src.startsWith("https://")) {
            const res = Jsoup.connect(src).ignoreContentType(true).maxBodySize(1024 * 1024 * 8).timeout(15000).execute();
            const bytes = res.bodyAsBytes();
            return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        }
        if (src.startsWith("data:")) {
            let comma = src.indexOf(",");
            if (comma > 0) {
                let b64 = src.slice(comma + 1);
                const bytes = Base64.decode(b64, Base64.DEFAULT);
                return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            }
            return null;
        }
        if (src.startsWith("base64:") || src.startsWith("base64,")) {
            let b64 = src.replace(RE_BASE64_PREFIX, "");
            const bytes = Base64.decode(b64, Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        }
        // 파일 경로로 처리
        return BitmapFactory.decodeFile(src);
    } catch (e) {
        Log.e(`${e.name}\n${e.message}\n${e.stack}`);
        return null;
    }
}


/** @description 정렬 구분선 라인인지 검사 */
function _isAlignLine(line) {
    let tokens = _tokenizeRow(line);
    if (tokens.length === 0) return false;
    for (let t of tokens) {
        if (!RE_ALIGN_CELL.test(t)) return false;
    }
    return true;
}




/* =================================== 메인 로직 =================================== */


/**
 * @description Markdown 테이블 파싱
 * @param {string} table
 * @return {object} { header: string[], align: string[], body: string[][] }
 */
function parseMarkdownTable(table) {
    let lines = table
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    if (lines.length === 0) throw new Error("비어있는 테이블 문자열입니다.");

    let alignIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (_isAlignLine(lines[i])) { alignIdx = i; break; }
    }

    let header = [];
    let align = [];
    let body = [];

    if (alignIdx >= 0) {
        let headerIdx = alignIdx > 0 ? alignIdx - 1 : 0;
        header = _tokenizeRow(lines[headerIdx]);
        align = _tokenizeRow(lines[alignIdx]).map(_parseAlign);
        body = lines.slice(alignIdx + 1).map(_tokenizeRow);
    } else {
        header = _tokenizeRow(lines[0]);
        align = header.map(() => "left");
        body = lines.slice(1).map(_tokenizeRow);
    }

    // 컬럼 수 정규화
    let colCount = header.length;
    for (let row of body) if (row.length > colCount) colCount = row.length;

    if (align.length < colCount) for (let i = align.length; i < colCount; i++) align.push("left");
    if (header.length < colCount) for (let i = header.length; i < colCount; i++) header.push("");
    for (let r = 0; r < body.length; r++) {
        if (body[r].length < colCount) {
            let pad = new Array(colCount - body[r].length).fill("");
            body[r] = body[r].concat(pad);
        } else if (body[r].length > colCount) {
            body[r] = body[r].slice(0, colCount);
        }
    }
    return { header, align, body };
}

/**
 * @description Markdown 테이블을 이미지로 변환
 * @param {string} table 마크다운 테이블 문자열
 * @param {boolean} [saveAndReturnPath=false] true: 파일 저장 후 경로 반환, false: byte[] 반환
 * @return {string|byte[]} 파일 경로 또는 PNG byte[]
 */
function tableToImage(table, saveAndReturnPath = false) {
    const marginX = 24, marginY = 24;
    const cellPadX = 16, cellPadY = 10;
    const bodyTextSize = 36, headerTextSize = 36;
    const gridStroke = 2;
    let bitmap = null;

    try {
        const { header, align, body } = parseMarkdownTable(table);
        const rows = body.length, cols = header.length;
        if (cols === 0) throw new Error("유효한 컬럼이 없습니다.");

        const headerPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        headerPaint.setColor(Color.BLACK);
        headerPaint.setTextSize(headerTextSize);
        headerPaint.setTypeface(TF_BOLD);

        const bodyPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        bodyPaint.setColor(Color.BLACK);
        bodyPaint.setTextSize(bodyTextSize);
        bodyPaint.setTypeface(TF_NORMAL);

        const gridPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        gridPaint.setColor(Color.rgb(200, 200, 200));
        gridPaint.setStrokeWidth(gridStroke);

        const headerBgPaint = new Paint();
        headerBgPaint.setColor(Color.rgb(245, 245, 245));
        const codeBgPaint = new Paint();
        codeBgPaint.setColor(Color.rgb(238, 238, 238));

        // 레이아웃
        const hfm = headerPaint.getFontMetrics();
        const bfm = bodyPaint.getFontMetrics();

        /**
         * @description 모든 셀 레이아웃 수행
         * @param {number} maxCellWidth 최대 셀 폭 (0이면 워드랩 없음)
         * @returns {{headerLayouts: object[], bodyLayouts: object[][]}}
         */
        const layoutAllCells = (maxCellWidth = 0) => {
            const hLayouts = new Array(cols);
            for (let c = 0; c < cols; c++) {
                hLayouts[c] = _layoutCell(header[c] || "", true, headerPaint, hfm, maxCellWidth);
            }

            const bLayouts = new Array(rows);
            for (let r = 0; r < rows; r++) {
                bLayouts[r] = new Array(cols);
                for (let c = 0; c < cols; c++) {
                    bLayouts[r][c] = _layoutCell(body[r][c] || "", false, bodyPaint, bfm, maxCellWidth);
                }
            }

            return { headerLayouts: hLayouts, bodyLayouts: bLayouts };
        };

        /**
         * @description 레이아웃에서 테이블 크기 계산
         * @param {object[]} hLayouts
         * @param {object[][]} bLayouts
         * @returns {{colWidths: number[], tableW: number, tableH: number, headerRowH: number, bodyRowHeights: number[]}}
         */
        const calcTableSize = (hLayouts, bLayouts) => {
            // 컬럼 너비
            const cWidths = new Array(cols).fill(0);
            for (let c = 0; c < cols; c++) {
                let maxW = hLayouts[c].maxWidth;
                for (let r = 0; r < rows; r++) {
                    if (bLayouts[r][c].maxWidth > maxW) maxW = bLayouts[r][c].maxWidth;
                }
                cWidths[c] = Math.ceil(maxW + cellPadX * 2);
            }

            // 행 높이
            const headerLineH = (hfm.descent - hfm.ascent);
            const bodyLineH = (bfm.descent - bfm.ascent);

            let headerMaxUnits = 1;
            for (let c = 0; c < cols; c++) {
                const u = hLayouts[c].unitsTotal || hLayouts[c].lineCount;
                if (u > headerMaxUnits) headerMaxUnits = u;
            }
            const hRowH = Math.ceil(headerMaxUnits * headerLineH + cellPadY * 2);

            const bRowHeights = new Array(rows);
            for (let r = 0; r < rows; r++) {
                let maxUnits = 1;
                for (let c = 0; c < cols; c++) {
                    const u = bLayouts[r][c].unitsTotal || bLayouts[r][c].lineCount;
                    if (u > maxUnits) maxUnits = u;
                }
                bRowHeights[r] = Math.ceil(maxUnits * bodyLineH + cellPadY * 2);
            }

            const tW = cWidths.reduce((a, b) => a + b, 0);
            const bodyTotalH = bRowHeights.reduce((a, b) => a + b, 0);
            const tH = hRowH + bodyTotalH;

            return { colWidths: cWidths, tableW: tW, tableH: tH, headerRowH: hRowH, bodyRowHeights: bRowHeights };
        };

        /**
         * @description 원본 레이아웃에서 열별 자연 폭과 최소 권장 폭 계산
         * @param {object[]} origHLayouts 원본 헤더 레이아웃
         * @param {object[][]} origBLayouts 원본 바디 레이아웃
         * @returns {{naturalColWidths: number[], minColWidths: number[]}}
         */
        const getColumnWidthBounds = (origHLayouts, origBLayouts) => {
            const naturalColWidths = new Array(cols).fill(0);
            const minColWidths = new Array(cols).fill(0);

            for (let c = 0; c < cols; c++) {
                let naturalContentW = origHLayouts[c].maxWidth || 0;
                let minContentW = 0;

                for (let line of origHLayouts[c].lines || []) {
                    minContentW = Math.max(minContentW, _maxUnbreakableLineWidth(line, headerPaint, true));
                }

                for (let r = 0; r < rows; r++) {
                    const layout = origBLayouts[r][c];
                    naturalContentW = Math.max(naturalContentW, layout.maxWidth || 0);
                    for (let line of layout.lines || []) {
                        minContentW = Math.max(minContentW, _maxUnbreakableLineWidth(line, bodyPaint, false));
                    }
                }

                naturalColWidths[c] = Math.ceil(naturalContentW + cellPadX * 2);
                minColWidths[c] = Math.ceil(Math.max(MIN_CELL_WIDTH, minContentW) + cellPadX * 2);
                if (minColWidths[c] > naturalColWidths[c]) minColWidths[c] = naturalColWidths[c];
            }

            return { naturalColWidths, minColWidths };
        };

        /**
         * @description 목표 테이블 폭에 맞게 열별 폭을 자연 폭과 최소 폭 사이에서 배분
         * @param {number[]} naturalColWidths 열별 자연 폭
         * @param {number[]} minColWidths 열별 최소 권장 폭
         * @param {number} targetTableW 목표 테이블 폭
         * @returns {number[]} 열별 배분 폭
         */
        const distributeColumnWidths = (naturalColWidths, minColWidths, targetTableW) => {
            const naturalTotal = naturalColWidths.reduce((a, b) => a + b, 0);
            const minTotal = minColWidths.reduce((a, b) => a + b, 0);

            if (targetTableW >= naturalTotal) return naturalColWidths.slice();
            if (targetTableW <= minTotal) return minColWidths.slice();

            const flexibleTotal = naturalTotal - minTotal;
            const keepRatio = (targetTableW - minTotal) / flexibleTotal;
            const widths = new Array(cols);
            let assigned = 0;

            for (let c = 0; c < cols; c++) {
                widths[c] = Math.floor(minColWidths[c] + (naturalColWidths[c] - minColWidths[c]) * keepRatio);
                assigned += widths[c];
            }

            let remainder = Math.round(targetTableW - assigned);
            for (let c = 0; remainder > 0 && c < cols; c++) {
                if (widths[c] < naturalColWidths[c]) {
                    widths[c]++;
                    remainder--;
                }
            }

            return widths;
        };

        /**
         * @description 열별 최대 셀 폭으로 재레이아웃
         * @param {number[]} wrapColWidths 열별 전체 폭(패딩 포함)
         * @returns {{headerLayouts: object[], bodyLayouts: object[][]}}
         */
        const layoutWithColumnWidths = (wrapColWidths) => {
            const hLayouts = new Array(cols);
            for (let c = 0; c < cols; c++) {
                const maxCellWidth = Math.max(1, Math.floor(wrapColWidths[c] - cellPadX * 2));
                hLayouts[c] = _layoutCell(header[c] || "", true, headerPaint, hfm, maxCellWidth);
            }

            const bLayouts = new Array(rows);
            for (let r = 0; r < rows; r++) {
                bLayouts[r] = new Array(cols);
                for (let c = 0; c < cols; c++) {
                    const maxCellWidth = Math.max(1, Math.floor(wrapColWidths[c] - cellPadX * 2));
                    bLayouts[r][c] = _layoutCell(body[r][c] || "", false, bodyPaint, bfm, maxCellWidth);
                }
            }

            return { headerLayouts: hLayouts, bodyLayouts: bLayouts };
        };

        // 1패스: 워드랩 없이 레이아웃
        let { headerLayouts, bodyLayouts } = layoutAllCells(0);
        let { colWidths, tableW, tableH, headerRowH, bodyRowHeights } = calcTableSize(headerLayouts, bodyLayouts);

        // 비율 체크 및 2패스 워드랩
        const totalRows = rows + 1; // 헤더 포함
        const colRowRatio = cols / totalRows;
        const allowedRatio = Math.min(MAX_ASPECT_RATIO, Math.max(BASE_ASPECT_RATIO, colRowRatio));
        const aspectRatio = tableW / tableH;

        if (aspectRatio > allowedRatio) {
            const bounds = getColumnWidthBounds(headerLayouts, bodyLayouts);
            const naturalTotal = bounds.naturalColWidths.reduce((a, b) => a + b, 0);
            const minTotal = bounds.minColWidths.reduce((a, b) => a + b, 0);

            let low = minTotal;
            let high = naturalTotal;
            let bestLayouts = null;
            let bestSize = null;

            // 줄바꿈 후에는 높이가 증가하므로, 최종 비율 기준으로 가장 넓게 들어맞는 폭을 찾는다.
            for (let i = 0; i < 7; i++) {
                const mid = (low + high) / 2;
                const wrapColWidths = distributeColumnWidths(bounds.naturalColWidths, bounds.minColWidths, mid);
                const relayout = layoutWithColumnWidths(wrapColWidths);
                const resized = calcTableSize(relayout.headerLayouts, relayout.bodyLayouts);
                const resizedRatio = resized.tableW / resized.tableH;

                if (resizedRatio > allowedRatio) {
                    high = mid;
                } else {
                    bestLayouts = relayout;
                    bestSize = resized;
                    low = mid;
                }
            }

            if (bestLayouts === null) {
                const wrapColWidths = distributeColumnWidths(bounds.naturalColWidths, bounds.minColWidths, minTotal);
                bestLayouts = layoutWithColumnWidths(wrapColWidths);
                bestSize = calcTableSize(bestLayouts.headerLayouts, bestLayouts.bodyLayouts);
            }

            headerLayouts = bestLayouts.headerLayouts;
            bodyLayouts = bestLayouts.bodyLayouts;
            colWidths = bestSize.colWidths;
            tableW = bestSize.tableW;
            tableH = bestSize.tableH;
            headerRowH = bestSize.headerRowH;
            bodyRowHeights = bestSize.bodyRowHeights;
        }

        // 렌더링용 라인 높이
        const headerLineH = (hfm.descent - hfm.ascent);
        const bodyLineH = (bfm.descent - bfm.ascent);

        // 비트맵 크기
        const bmpW = Math.ceil(marginX * 2 + tableW);
        const bmpH = Math.ceil(marginY * 2 + tableH);

        bitmap = Bitmap.createBitmap(bmpW, bmpH, Bitmap.Config.ARGB_8888);
        const canvas = new Canvas(bitmap);
        canvas.drawColor(Color.WHITE);

        const colX = new Array(cols + 1);
        colX[0] = marginX;
        for (let c = 0; c < cols; c++) colX[c + 1] = colX[c] + colWidths[c];

        const headerTop = marginY;
        const headerBottom = marginY + headerRowH;

        const rowY = new Array(rows + 1);
        rowY[0] = headerBottom;
        for (let r = 0; r < rows; r++) rowY[r + 1] = rowY[r] + bodyRowHeights[r];

        // 헤더 배경
        canvas.drawRect(marginX, headerTop, marginX + tableW, headerBottom, headerBgPaint);

        // 그리드
        for (let c = 0; c <= cols; c++) canvas.drawLine(colX[c], headerTop, colX[c], rowY[rows], gridPaint);
        canvas.drawLine(marginX, headerTop, marginX + tableW, headerTop, gridPaint);
        const headerBorderPaint = new Paint(gridPaint);
        headerBorderPaint.setStrokeWidth(gridStroke * 1.5);
        canvas.drawLine(marginX, headerBottom, marginX + tableW, headerBottom, headerBorderPaint);
        for (let i = 1; i <= rows; i++) canvas.drawLine(marginX, rowY[i], marginX + tableW, rowY[i], gridPaint);

        // 텍스트 렌더링
        // 헤더
        for (let c = 0; c < cols; c++) {
            const cw = colWidths[c];
            const layout = headerLayouts[c];
            let baseline = headerTop + cellPadY + (-hfm.ascent);
            for (let li = 0; li < layout.lines.length; li++) {
                const line = layout.lines[li];
                const a = align[c] || "left";
                let startX;
                if (a === "center") startX = colX[c] + (cw - line.width) / 2;
                else if (a === "right") startX = colX[c] + cw - cellPadX - line.width;
                else startX = colX[c] + cellPadX;

                let runX = startX;
                const units = line.units || 1;
                const currLineH = headerLineH * units;

                for (let run of line.runs) {
                    if (run.image === true && run._img) {
                        const top = baseline + hfm.ascent + (currLineH - run._imgH) / 2;
                        const left = runX + IMAGE_PAD_X;
                        REUSE_RECT.set(left, top, left + run._imgW, top + run._imgH);
                        canvas.drawBitmap(run._img, null, REUSE_RECT, null);
                        runX += run._w;
                        continue;
                    }
                    headerPaint.setTypeface(_getTypefaceFor(true, run));
                    headerPaint.setStrikeThruText(run.strike === true);
                    if (run.text?.length > 0) {
                        if (run.code === true) {
                            const tW = headerPaint.measureText(run.text);
                            const top = baseline + hfm.ascent;
                            const bottom = baseline + hfm.descent;
                            canvas.drawRect(runX, top - CODE_PAD_Y, runX + tW + CODE_PAD_X * 2, bottom + CODE_PAD_Y, codeBgPaint);
                            canvas.drawText(run.text, runX + CODE_PAD_X, baseline, headerPaint);
                            runX += tW + CODE_PAD_X * 2;
                        } else {
                            canvas.drawText(run.text, runX, baseline, headerPaint);
                            runX += headerPaint.measureText(run.text);
                        }
                    }
                }
                baseline += currLineH;
            }
        }
        headerPaint.setStrikeThruText(false);

        // 바디
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cw = colWidths[c];
                const layout = bodyLayouts[r][c];
                let baseline = rowY[r] + cellPadY + (-bfm.ascent);
                for (let li = 0; li < layout.lines.length; li++) {
                    const line = layout.lines[li];
                    const a = align[c] || "left";
                    let startX;
                    if (a === "center") startX = colX[c] + (cw - line.width) / 2;
                    else if (a === "right") startX = colX[c] + cw - cellPadX - line.width;
                    else startX = colX[c] + cellPadX;

                    let runX = startX;
                    const units = line.units || 1;
                    const currLineH = bodyLineH * units;

                    for (let run of line.runs) {
                        if (run.image === true && run._img) {
                            const top = baseline + bfm.ascent + (currLineH - run._imgH) / 2;
                            const left = runX + IMAGE_PAD_X;
                            REUSE_RECT.set(left, top, left + run._imgW, top + run._imgH);
                            canvas.drawBitmap(run._img, null, REUSE_RECT, null);
                            runX += run._w;
                            continue;
                        }
                        bodyPaint.setTypeface(_getTypefaceFor(false, run));
                        bodyPaint.setStrikeThruText(run.strike === true);
                        if (run.text?.length > 0) {
                            if (run.code === true) {
                                const tW = bodyPaint.measureText(run.text);
                                const top = baseline + bfm.ascent;
                                const bottom = baseline + bfm.descent;
                                canvas.drawRect(runX, top - CODE_PAD_Y, runX + tW + CODE_PAD_X * 2, bottom + CODE_PAD_Y, codeBgPaint);
                                canvas.drawText(run.text, runX + CODE_PAD_X, baseline, bodyPaint);
                                runX += tW + CODE_PAD_X * 2;
                            } else {
                                canvas.drawText(run.text, runX, baseline, bodyPaint);
                                runX += bodyPaint.measureText(run.text);
                            }
                        }
                    }
                    baseline += currLineH;
                }
            }
        }
        bodyPaint.setStrikeThruText(false);

        // 출력
        let result;
        if (saveAndReturnPath) {
            // 파일로 저장 후 경로 반환
            const baseDir = `sdcard/msgbot_media/tableToImage`;
            FileStream.createDir(baseDir);
            const filePath = `${baseDir}/${Security.uuidv7()}.png`;

            let fos = null;
            try {
                fos = new FileOutputStream(new File(filePath));
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, fos);
                fos.flush();
            } finally {
                if (fos !== null) fos.close();
            }
            result = filePath;
        } else {
            // byte[] 반환
            const baos = new ByteArrayOutputStream();
            try {
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, baos);
                result = baos.toByteArray();
            } finally {
                baos.close();
            }
        }

        return result;
    } catch (e) {
        Log.e(`${e.name}\n${e.message}\n${e.stack}`);
        throw e;
    } finally {
        if (bitmap !== null && !bitmap.isRecycled()) bitmap.recycle();
        for (let [, info] of IMG_CACHE) {
            if (info.bmp && !info.bmp.isRecycled()) info.bmp.recycle();
        }
        IMG_CACHE.clear();
    }
}


// module.exports = tableToImage;
