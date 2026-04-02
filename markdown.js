/**
 * @file markdown.js
 * @description 마크다운 텍스트를 일반 텍스트로 변환
 * @author hehee https://github.com/hehee9
 * @license CC BY-NC-SA 4.0
 * - 저작권자 표기
 * - 라이선스 표기
 * - 상업적 이용 금지
 * - 동일 조건 변경 가능
 */



/* ============================= 상수 준비 =============================== */


const MD_PATTERNS = {
    CODE_BLOCK: /^([ \t]*)```([^\n]*)\n([\s\S]*?)```[ \t]*(?=\r?\n|$)/gm,
    INLINE_CODE: /`([^`]+)`/g,
    WRAPPED_CODE_BLOCK: /^([ \t]*)(`{4,})\n([\s\S]*?)\n\2[ \t]*(?=\r?\n|$)/gm,
    BOLD_ITALIC: /(\*\*\*|___)(.*?)\1/g,
    BOLD: /(\*\*|__)(.*?)\1/g,
    ITALIC: /(\*|_)(.*?)\1/g,
    STRIKETHROUGH: /~~(.*?)~~/g,
    IMAGE: /(!?)\[([^\]]+)\]\(([^)]+)\)/g,
    HORIZONTAL_LINE: /^[ \t]{0,3}([-*_])[ \t]*\1[ \t]*\1(?:[ \t]*\1)*[ \t]*$/gm,
    HEADING: /^(#+)\s+(.*)/gm,
    CHECKBOX: /^([ \t]*)([-*])\s+\[([ xX])\]\s+(.*)/gm,
    LIST: /^([ \t]*)([-*])\s+(.*)/gm,
    BLOCKQUOTE: /^((?:>\s*)+)(.*)/gm,
    URL: /(?:https?:\/\/)[^\s\[\]()]*/g,
    TABLE: /(^\|.*\|[ \t]*\n)(^\|[ \t]*[-:| \t]+[ \t]*\n)((?:^\|.*\|[ \t]*\n?)+)/gm
};

const INDEX_CHAR = "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９가각갂갃간갅갆갇갈갉갊갋갌갍갎갏감갑값갓갔강갖갗갘같갚갛개객갞갟갠갡갢갣갤갥갦갧갨갩갪갫갬갭갮갯갰갱갲갳갴갵갶갷갸갹갺갻갼갽갾갿걀걁걂걃걄걅걆걇걈걉걊걋걌걍걎걏걐걑걒걓걔걕걖걗걘걙걚걛걜걝걞걟걠걡걢걣걤걥걦걧걨걩걪걫걬걭걮걯거걱걲걳건걵걶걷걸걹걺걻걼걽걾걿검겁겂것겄겅겆겇겈겉겊겋게겍겎겏겐겑겒겓겔겕겖겗겘겙겚겛겜겝겞겟겠겡겢겣겤겥겦겧겨격겪겫견겭겮겯결겱겲겳겴겵겶겷겸겹겺겻겼경겾겿곀곁곂곃계곅곆곇곈곉곊곋곌곍곎곏곐곑곒곓곔곕곖곗곘곙곚곛곜곝곞곟고곡곢곣곤곥곦곧골곩곪곫곬곭곮곯곰곱곲곳곴공곶곷곸곹곺곻과곽곾곿관괁괂괃괄괅괆괇괈괉괊괋괌괍괎괏괐광괒괓괔괕괖괗괘괙괚괛괜괝괞괟괠괡괢괣괤괥괦괧괨괩괪괫괬괭괮괯괰괱괲괳괴괵괶괷괸괹괺괻괼괽괾괿굀굁굂굃굄굅굆굇굈굉굊굋굌굍굎굏교굑굒굓굔굕굖굗굘굙굚굛굜굝굞굟굠굡굢굣굤굥굦굧굨굩굪굫구국굮굯군굱굲굳굴굵굶굷굸굹굺굻굼굽굾굿궀궁궂궃궄궅궆궇궈궉궊궋권궍궎궏궐궑궒궓궔궕궖궗궘궙궚궛궜궝궞궟궠궡궢궣궤궥궦궧궨궩궪궫궬궭궮궯궰궱궲궳궴궵궶궷궸궹궺궻궼궽궾궿귀귁귂귃귄귅귆귇귈귉귊귋귌귍귎귏귐귑귒귓귔귕귖귗귘귙귚귛규귝귞귟균귡귢귣귤귥귦귧귨귩귪귫귬귭귮귯귰귱귲귳귴귵귶귷그극귺귻근귽귾귿글긁긂긃긄긅긆긇금급긊긋긌긍긎긏긐긑긒긓긔긕긖긗긘긙긚긛긜긝긞긟긠긡긢긣긤긥긦긧긨긩긪긫긬긭긮긯기긱긲긳긴긵긶긷길긹긺긻긼긽긾긿김깁깂깃깄깅깆깇깈깉깊깋";
const CHAR_TO_INDEX = new Map();
for (let i = 0; i < INDEX_CHAR.length; i++) CHAR_TO_INDEX.set(INDEX_CHAR[i], i);

const TOKEN_START = "乜𪚥";
const TOKEN_END = "𪚥乜";
const TOKEN_URL = "有斡恚累";
const TOKEN_CODE = "高頭不歷";
const TOKEN_INLINE = "引羅引";
const ZERO_WIDTH_SPACE = "\u200b";
const ALL_TOKENS_REGEX = new RegExp(
    `${TOKEN_START}(${TOKEN_URL}|${TOKEN_CODE}|${TOKEN_INLINE})(.)?${TOKEN_END}`,
    "g"
);

// 허용 특수문자
const ALLOWED_CHARS_PATTERN = (() => {
    const chars = [
        "+", "-", "*", "/", "=", "<", ">", "%", "^", "±", "×", "÷", "°",
        "!", "?", ".", ",", ":", ";", "'", '"', "`",
        "(", ")", "[", "]", "{", "}",
        "@", "#", "$", "&", "|", "\\", "_", "~", "§", "©", "®", "™", "€", "£", "¥", "¢",
        "！", "？", "．", "，", "：", "；", "＇", "＂", "−",
        "（", "）", "［", "］", "｛", "｝", "〈", "〉", "《", "》", "「", "」", "『", "』",
        "＠", "＃", "＄", "％", "＆", "＊", "＋", "－", "＝", "＼", "｜", "～", "＿",
        "※", "★", "☆", "♪", "♡", "♢", "♦", "♧", "♠"
    ];
    const escaped = chars.map(c => c.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')).join('');
    const common = escaped + '\\u2600-\\u27BF\\u2B00-\\u2BFF' + ']' +
                   '|[\\uD83C-\\uDBFF][\\uDC00-\\uDFFF]' +
                   '|\\uFE0F|\\uFE0E|\\u200D|\\u20E3';
    
    return {
        withNumber: new RegExp(`^(?:[0-9a-zA-Z\\s${common})*$`),
        withoutNumber: new RegExp(`^(?:[a-zA-Z\\s${common})*$`)
    };
})();




/* ============================= 메인 로직 =============================== */


/**
 * @description 마크다운 텍스트를 일반 텍스트로 변환
 * @param {string} markdown 마크다운 텍스트
 * @param {boolean} [useKakaoMarkdown=false] 카카오 마크다운 활성화 여부
 * @returns {string} 일반 텍스트
 */
function mdToText(markdown, useKakaoMarkdown = false) {
    const codeBlocks = [];
    const inlineCodes = [];
    const protectedUrls = [];


    /* ============================= 헬퍼 함수 =============================== */

    /** @description 텍스트가 모두 변환 가능한 문자인지 확인 */
    function _isAllConvertible(text, includeNumbers) {
        return includeNumbers 
            ? ALLOWED_CHARS_PATTERN.withNumber.test(text)
            : ALLOWED_CHARS_PATTERN.withoutNumber.test(text);
    }


    /** @description 볼드체 특수문자 변환 */
    function _convertToBoldSpecial(text) {
        return text.replace(/[0-9a-zA-Z]/g, char => {
            const code = char.charCodeAt(0);
            if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + (code - 48));
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + (code - 65));
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + (code - 97));
            return char;
        });
    }
    /** @description 이탤릭체 특수문자 변환 */
    function _convertToItalicSpecial(text) {
        return text.replace(/[a-zA-Z]/g, char => {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D608 + (code - 65));
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D622 + (code - 97));
            return char;
        });
    }
    /** @description 볼드+이탤릭체 특수문자 변환 */
    function _convertToBoldItalicSpecial(text) {
        return text.replace(/[0-9a-zA-Z]/g, char => {
            const code = char.charCodeAt(0);
            if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + (code - 48));
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D63C + (code - 65));
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D656 + (code - 97));
            return char;
        });
    }
    /** @description 마크다운 테이블을 목록 형식으로 변환 */
    function _processTable(match, headerRow, separatorRow, dataRows) {
        const _parseRow = row => {
            const cells = row.split("|");
            if (cells.length && cells[0].trim() === "") cells.shift();
            if (cells.length && cells[cells.length - 1].trim() === "") cells.pop();
            return cells.map(c => c.trim());
        };
        
        const headers = _parseRow(headerRow);
        const rows = dataRows.split("\n")
            .filter(line => line.trim() !== "")
            .map(_parseRow);
        
        // 첫 열 채우기
        for (let n = 1; n < rows.length; n++) {
            if (!rows[n][0]) rows[n][0] = rows[n - 1][0];
        }
        
        const tableResult = [];
        const divider = "-------------------------\n";
        
        for (let colIndex = 0; colIndex < headers.length; colIndex++) {
            tableResult.push(`【${headers[colIndex]}】\n`);
            const isGenre = (headers[colIndex] === "장르");
            let itemCounter = 0;
            
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                const cellValue = rows[rowIndex][colIndex] || "";
                if (isGenre) {
                    if (rowIndex === 0 || cellValue !== rows[rowIndex - 1][colIndex]) {
                        tableResult.push(`    《${rowIndex + 1}》 ${cellValue}\n`);
                    }
                } else {
                    itemCounter++;
                    tableResult.push(`    《${itemCounter}》 ${cellValue}\n`);
                }
            }
            tableResult.push(divider);
        }
        return tableResult.join("");
    }


    /** @description 취소선 처리 */
    function _processStrikethrough(_, text) {
        return text.split('').map(c => c + '\u0336').join('');
    }
    /** @description CommonMark 기준 기호/문장부호 여부 확인 */
    function _isMarkdownPunctuationOrSymbol(char) {
        if (!char || /\s/.test(char)) return false;
        if (/[\p{P}\p{S}]/u.test(char)) return true;
        return /[!-/:-@[-`{-~]/.test(char);
    }
    /** @description 강조 내부 마지막 가시 문자 반환 */
    function _getLastVisibleChar(text) {
        for (let i = text.length - 1; i >= 0; i--) {
            const char = text.charAt(i);
            if (char === ZERO_WIDTH_SPACE) continue;
            return char;
        }
        return "";
    }
    /** @description 카카오 강조 닫힘 직전 ZWSP 필요 여부 */
    function _shouldInsertZwspBeforeClosing(content, nextChar) {
        if (!useKakaoMarkdown) return false;
        if (!nextChar || /\s/.test(nextChar)) return false;
        if (content.endsWith(ZERO_WIDTH_SPACE)) return false;
        return _isMarkdownPunctuationOrSymbol(_getLastVisibleChar(content));
    }
    /** @description 카카오 강조 출력 보정 */
    function _formatKakaoEmphasis(delimiter, content, nextChar) {
        return _shouldInsertZwspBeforeClosing(content, nextChar)
            ? `${delimiter}${content}${ZERO_WIDTH_SPACE}${delimiter}`
            : `${delimiter}${content}${delimiter}`;
    }
    /** @description 헤딩 들여쓰기 계산 */
    function _getHeadingIndent(level) {
        const baseIndent = Math.max(0, 8 - level * 2);
        return " ".repeat(useKakaoMarkdown ? Math.max(0, baseIndent - 2) : baseIndent);
    }
    /** @description 카카오 헤딩 내부의 볼드만 기존 규칙으로 변환 */
    function _convertHeadingBoldForKakao(text) {
        const _findClosingBold = (source, start, delimiter) => {
            const marker = delimiter.charAt(0);
            for (let i = start; i < source.length - 1; i++) {
                if (source.slice(i, i + 2) !== delimiter) continue;
                if (source.charAt(i - 1) === marker || source.charAt(i + 2) === marker) continue;
                return i;
            }
            return -1;
        };
        let convertedText = "";
        let index = 0;

        while (index < text.length) {
            const delimiter = (
                text.slice(index, index + 2) === "**" && text.charAt(index - 1) !== "*" && text.charAt(index + 2) !== "*"
            ) ? "**" : (
                text.slice(index, index + 2) === "__" && text.charAt(index - 1) !== "_" && text.charAt(index + 2) !== "_"
            ) ? "__" : null;

            if (!delimiter) {
                convertedText += text.charAt(index);
                index++;
                continue;
            }

            const closeIndex = _findClosingBold(text, index + 2, delimiter);
            if (closeIndex === -1) {
                convertedText += text.charAt(index);
                index++;
                continue;
            }

            const content = text.slice(index + 2, closeIndex);
            const converted = _convertToBoldSpecial(content);
            convertedText += _isAllConvertible(content, true) ? converted : `❪${converted}❫`;
            index = closeIndex + 2;
        }

        return convertedText;
    }
    /** @description 헤딩 처리 */
    function _processHeading(match, hashes, content) {
        const level = hashes.length;
        const indent = _getHeadingIndent(level);
        let pureContent = content.trim();

        if (useKakaoMarkdown) {
            pureContent = _convertHeadingBoldForKakao(content);
            const trailingText = match.slice(match.indexOf(content) + content.length);
            return `\n${indent}${_formatKakaoEmphasis("**", `【${pureContent}】`, trailingText.charAt(0))}\n`;
        }

        const start = pureContent.charAt(0);
        const end = pureContent.charAt(pureContent.length - 1);
        if ((start === "❪" && end === "❫") || (start === "❮" && end === "❯") || (start === "❬" && end === "❭")) {
            pureContent = pureContent.substring(1, pureContent.length - 1);
            return `\n${indent}❰${pureContent}❱\n`;
        }
        return `\n${indent}【${content}】\n`;
    }
    /** @description 기본 인용문 처리 */
    function _processBlockquote(match, quotes, content) {
        const level = (quotes.match(/>/g) || []).length;
        return " ".repeat(level * 2) + "‖ ".repeat(level) + content;
    }
    /** @description 카카오 인용문 내부 줄 처리 */
    function _formatKakaoBlockquoteLine(line, hasTopLevelQuote) {
        const match = line.match(/^((?:>\s*)+)(.*)$/);
        if (!match) return line;
        const level = (match[1].match(/>/g) || []).length;
        if (level === 1) {
            return hasTopLevelQuote ? match[2] : `‖ ${match[2]}`;
        }
        const indent = " ".repeat((level - 1) * 2);
        return `${indent}‖ ${match[2]}`;
    }
    /** @description 카카오 인용문 전체 블록 처리 */
    function _wrapBlockquotesForKakao(text) {
        const lines = text.split(/\r?\n/);
        const output = [];
        let quoteLines = [];

        const _flush = () => {
            if (quoteLines.length === 0) return;
            output.push("```");
            let hasTopLevelQuote = false;
            for (let i = 0; i < quoteLines.length; i++) {
                const formatted = _formatKakaoBlockquoteLine(quoteLines[i], hasTopLevelQuote);
                if (!hasTopLevelQuote && /^((?:>\s*)+)(.*)$/.test(quoteLines[i])) {
                    const level = ((quoteLines[i].match(/^((?:>\s*)+)(.*)$/) || [])[1] || "").match(/>/g);
                    if (level && level.length === 1) hasTopLevelQuote = true;
                }
                output.push(formatted);
            }
            output.push("```");
            quoteLines = [];
        };

        for (let i = 0; i < lines.length; i++) {
            if (/^((?:>\s*)+)(.*)$/.test(lines[i])) {
                quoteLines.push(lines[i]);
                continue;
            }
            _flush();
            output.push(lines[i]);
        }
        _flush();

        return output.join("\n");
    }
    /** @description 코드블록 내부 토큰 복원 */
    function _restoreCodeTokens(code) {
        return code.replace(ALL_TOKENS_REGEX, (m2, t2, idxChar2) => {
            const idx2 = CHAR_TO_INDEX.get(idxChar2);
            if (idx2 === undefined) return m2;

            if (t2 === TOKEN_INLINE) {
                return useKakaoMarkdown ? `\`${inlineCodes[idx2]}\`` : `⦗ ${inlineCodes[idx2]} ⦘`;
            }
            if (t2 === TOKEN_URL) {
                return protectedUrls[idx2];
            }
            return m2;
        });
    }
    /** @description 카카오용 코드블록 펜스 보장 */
    function _ensureKakaoCodeFence(code) {
        if (/^```[\s\S]*\n```$/.test(code) || /^```[\s\S]*```$/.test(code)) return code;
        return `\`\`\`\n${code}\n\`\`\``;
    }

    // 토큰 생성 헬퍼
    const _makeToken = (type, index) => `${TOKEN_START}${type}${INDEX_CHAR[index]}${TOKEN_END}`;




    /* =========================== 변환 시작 =========================== */


    let result = markdown;

    /** @description URL 보호 */
    result = result.replace(MD_PATTERNS.URL, url => {
        const token = _makeToken(TOKEN_URL, protectedUrls.length);
        protectedUrls.push(url);
        return token;
    });

    // 마크다운 변환 로직
    result = result
        .replace(MD_PATTERNS.WRAPPED_CODE_BLOCK, (match, indent, fence, inner) => {
            let m = inner.match(/^```([^\n]*)\n([\s\S]*?)\n```$/);
            let lang = m ? (m[1] || "") : "";
            let code = m ? `\`\`\`\n${m[2].trim()}\n\`\`\`` : inner;
            
            const token = _makeToken(TOKEN_CODE, codeBlocks.length);
            codeBlocks.push({ lang: lang.trim() || "Code", code });
            return (indent || "") + token;
        })
        .replace(MD_PATTERNS.CODE_BLOCK, (match, indent, lang, code) => {
            const token = _makeToken(TOKEN_CODE, codeBlocks.length);
            codeBlocks.push({ lang: (lang || "").trim() || "Code", code: (code || "").trim() });
            return (indent || "") + token;
        })
        .replace(MD_PATTERNS.INLINE_CODE, (match, code) => {
            if (code.includes("\n")) return match;
            const token = _makeToken(TOKEN_INLINE, inlineCodes.length);
            inlineCodes.push(code);
            return token;
        })
        .replace(MD_PATTERNS.HORIZONTAL_LINE, "━".repeat(20))
        .replace(MD_PATTERNS.HEADING, _processHeading)
        .replace(MD_PATTERNS.CHECKBOX, (match, spaces, marker, checkState, content) => {
            const level = (spaces.length >> 1);
            const checkbox = (checkState.trim().toLowerCase() === 'x') ? '✔' : '✖';
            return " ".repeat(level * 2) + checkbox + " " + content;
        })
        .replace(MD_PATTERNS.LIST, (match, spaces, marker, content) => {
            const level = (spaces.length >> 1);
            const markers = ["⦁", "￮", "▸", "▹"];
            const bullet = markers[Math.min(level, 3)];
            return " ".repeat(level * 2) + bullet + " " + content;
        });

    result = useKakaoMarkdown
        ? _wrapBlockquotesForKakao(result)
        : result.replace(MD_PATTERNS.BLOCKQUOTE, _processBlockquote);

    if (useKakaoMarkdown) {
        result = result
            .replace(MD_PATTERNS.BOLD_ITALIC, (match, delimiter, content, offset, source) => {
                const nextChar = source.charAt(offset + match.length);
                return _formatKakaoEmphasis(delimiter, content, nextChar);
            })
            .replace(MD_PATTERNS.BOLD, (match, delimiter, content, offset, source) => {
                const nextChar = source.charAt(offset + match.length);
                return _formatKakaoEmphasis(delimiter, content, nextChar);
            })
            .replace(MD_PATTERNS.ITALIC, (match, delimiter, content, offset, source) => {
                const nextChar = source.charAt(offset + match.length);
                return _formatKakaoEmphasis(delimiter, content, nextChar);
            });
    } else {
        result = result
            .replace(MD_PATTERNS.BOLD_ITALIC, (match, delimiter, content) => {
                const converted = _convertToBoldItalicSpecial(content);
                return _isAllConvertible(content, true) ? converted : `❮${converted}❯`;
            })
            .replace(MD_PATTERNS.BOLD, (match, delimiter, content) => {
                const converted = _convertToBoldSpecial(content);
                return _isAllConvertible(content, true) ? converted : `❪${converted}❫`;
            })
            .replace(MD_PATTERNS.ITALIC, (match, delimiter, content) => {
                const converted = _convertToItalicSpecial(content);
                return _isAllConvertible(content, false) ? converted : `❬${converted}❭`;
            });
    }

    result = result
        .replace(MD_PATTERNS.STRIKETHROUGH, _processStrikethrough)
        .replace(MD_PATTERNS.TABLE, _processTable);

    // 토큰 복원
    result = result.replace(ALL_TOKENS_REGEX, (match, type, idxChar) => {
        const index = CHAR_TO_INDEX.get(idxChar);
        if (index === undefined) return match;
    
        if (type === TOKEN_INLINE) {
            return useKakaoMarkdown ? `\`${inlineCodes[index]}\`` : `⦗ ${inlineCodes[index]} ⦘`;
        }
        if (type === TOKEN_CODE) {
            const obj = codeBlocks[index];
            const border = "━".repeat(5);
            const lang = obj.lang;
    
            // 코드블록 내부에 남아있는 (URL/인라인) 토큰 복원
            const innerCode = _restoreCodeTokens(obj.code);
            const displayCode = useKakaoMarkdown ? _ensureKakaoCodeFence(innerCode) : innerCode;
    
            return `\n┏${border} ${lang} ${border}┓\n${displayCode}\n┗${"━".repeat(10 + Math.ceil(lang.length / 2))}┛\n`;
        }
        if (type === TOKEN_URL) {
            return protectedUrls[index];
        }
        return match;
    });

    // 이미지 처리
    result = result.replace(MD_PATTERNS.IMAGE, (match, imgFlag, text, url) => {
        if (text.trim().toLowerCase() === url.trim().toLowerCase()) return url + " ";
        return `${text}( ${url} )`;
    });

    return result;
}


// module.exports = mdToText;
