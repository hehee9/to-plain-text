/**
 * @description 마크다운 테이블을 이미지로 변환
 * @param {string} markdown 마크다운 테이블
 * @returns {string} 파일 저장 경로
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
const RectF = Java.type("android.graphics.RectF");
const Jsoup = Java.type("org.jsoup.Jsoup");
const Base64 = Java.type("android.util.Base64");


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




/* =================================== 유틸/헬퍼 =================================== */


/** @description 마크다운 테이블 1줄을 셀 배열로 변환 */
function _tokenizeRow(line) {
    let s = line.trim();
    if (s.startsWith("|")) s = s.slice(1);
    if (s.endsWith("|")) s = s.slice(0, -1);
    let cells = s.split("|");
    for (let i = 0; i < cells.length; i++) cells[i] = cells[i].trim();
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
/**
 * @description 인라인 변환(볼드/이탤릭/취소선/인라인 코드)
 * @param {string} line
 * @return {object[]} [{text, bold, italic, strike, code}]
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

        // ![alt](src)
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

        // 코드 토글
        if (ch === "`") {
            if (code) { _flushCode(); code = false; }
            else { _flush(); code = true; }
            i += 1; continue;
        }

        // 코드 내부 리터럴 처리
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
/**
 * @description 한 셀을 레이아웃으로 변환
 * @param {string} text
 * @param {boolean} isHeader
 * @param {Paint} paint
 * @return {object} { lines: {runs: object[], width: number}[], maxWidth: number, lineCount: number }
 */
function _layoutCell(text, isHeader, paint, fm) {
    const rawLines = _normalizeBr(text).split("\n");
    const unitH = (fm.descent - fm.ascent);

    let lines = [];
    let maxW = 0;

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

        let width = 0;
        let hasContent = false;

        // 폭 계산 및 이미지 스케일
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

        width = Math.ceil(width);
        maxW = Math.max(maxW, width);

        lines.push({
            runs: hasContent ? runs : [{ text: "", bold: false, italic: false, strike: false }],
            width,
            units
        });
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
 * @description Markdown 테이블을 이미지로 저장 후 경로 반환
 * @param {string} table
 * @return {string}
 */
function tableToImage(table) {
    const marginX = 24, marginY = 24;
    const cellPadX = 16, cellPadY = 10;
    const bodyTextSize = 36, headerTextSize = 36;
    const gridStroke = 2;

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

        const headerLayouts = new Array(cols);
        for (let c = 0; c < cols; c++) headerLayouts[c] = _layoutCell(header[c] || "", true, headerPaint, hfm);

        const bodyLayouts = new Array(rows);
        for (let r = 0; r < rows; r++) {
            bodyLayouts[r] = new Array(cols);
            for (let c = 0; c < cols; c++) bodyLayouts[r][c] = _layoutCell(body[r][c] || "", false, bodyPaint, bfm);
        }

        // 컬럼 너비
        const colWidths = new Array(cols).fill(0);
        for (let c = 0; c < cols; c++) {
            let maxW = headerLayouts[c].maxWidth;
            for (let r = 0; r < rows; r++) if (bodyLayouts[r][c].maxWidth > maxW) maxW = bodyLayouts[r][c].maxWidth;
            colWidths[c] = Math.ceil(maxW + cellPadX * 2);
        }

        // 행 높이
        const headerLineH = (hfm.descent - hfm.ascent);
        const bodyLineH = (bfm.descent - bfm.ascent);

        let headerMaxUnits = 1;
        for (let c = 0; c < cols; c++) {
            const u = headerLayouts[c].unitsTotal || headerLayouts[c].lineCount;
            if (u > headerMaxUnits) headerMaxUnits = u;
        }
        const headerRowH = Math.ceil(headerMaxUnits * headerLineH + cellPadY * 2);

        const bodyRowHeights = new Array(rows);
        for (let r = 0; r < rows; r++) {
            let maxUnits = 1;
            for (let c = 0; c < cols; c++) {
                const u = bodyLayouts[r][c].unitsTotal || bodyLayouts[r][c].lineCount;
                if (u > maxUnits) maxUnits = u;
            }
            bodyRowHeights[r] = Math.ceil(maxUnits * bodyLineH + cellPadY * 2);
        }

        // 크기/좌표
        const tableW = colWidths.reduce((a, b) => a + b, 0);
        const bodyTotalH = bodyRowHeights.reduce((a, b) => a + b, 0);
        const tableH = headerRowH + bodyTotalH;
        const bmpW = Math.ceil(marginX * 2 + tableW);
        const bmpH = Math.ceil(marginY * 2 + tableH);

        const bitmap = Bitmap.createBitmap(bmpW, bmpH, Bitmap.Config.ARGB_8888);
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

        // 저장
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
            bitmap.recycle();

            for (let [, info] of IMG_CACHE) {
                if (info.bmp && !info.bmp.isRecycled()) info.bmp.recycle();
            }
            IMG_CACHE.clear();
        }
        return filePath;
    } catch (e) {
        Log.e(`${e.name}\n${e.message}\n${e.stack}`);
        throw e;
    }
}


// module.exports = tableToImage;