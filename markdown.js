/**
 * @description 마크다운 텍스트를 일반 텍스트로 변환
 * @param {string} markdown 마크다운 텍스트
 * @returns {string} 일반 텍스트
 * 
 * @author hehee https://github.com/hehee9
 * @license CC BY-NC-SA 4.0
 * - 저작권자 표기
 * - 라이선스 표기
 * - 상업적 이용 금지
 * - 동일 조건 변경 가능
 */
function mdToText(markdown) {
    /* ============================= 상수/변수 선언 =============================== */
    const MD_PATTERNS = {
        CODE_BLOCK: /^([ \t]*)```([^\n]*)\n([\s\S]*?)```[ \t]*(?=\r?\n|$)/gm,
        INLINE_CODE: /`([^`]+)`/g,
        WRAPPED_CODE_BLOCK: /^([ \t]*)(`{4,})\n([\s\S]*?)\n\2[ \t]*(?=\r?\n|$)/gm,
        BOLD_ITALIC: /(\*\*\*|___)(.*?)\1/g,
        BOLD: /(\*\*|__)(.*?)\1/g,
        ITALIC: /(\*|_)(.*?)\1/g,
        STRIKETHROUGH: /~~(.*?)~~/g,
        IMAGE: /(!?)\[([^\]]+)\]\(([^)]+)\)/g,
        HORIZONTAL_LINE: /^([-*]){3,}$/gm,
        HEADING: /^(#+)\s+(.*)/gm,
        CHECKBOX: /^([ \t]*)([-*])\s+\[([ xX])\]\s+(.*)/gm,
        LIST: /^([ \t]*)([-*])\s+(.*)/gm,
        BLOCKQUOTE: /^((?:>\s*)+)(.*)/gm
    };

    const codeBlocks = [];
    const inlineCodes = [];
    const protectedUrls = [];

    const URL_REGEX = /(?:https?:\/\/)[^\s\[\]()]*/g;
    const TABLE_REGEX = /(^\|.*\|[ \t]*\n)(^\|[ \t]*[-:| \t]+[ \t]*\n)((?:^\|.*\|[ \t]*\n?)+)/gm;

    // 다른 마크다운 변환에 영향을 안 받도록 특수문자 사용
    const indexChar = "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９가각갂갃간갅갆갇갈갉갊갋갌갍갎갏감갑값갓갔강갖갗갘같갚갛개객갞갟갠갡갢갣갤갥갦갧갨갩갪갫갬갭갮갯갰갱갲갳갴갵갶갷갸갹갺갻갼갽갾갿걀걁걂걃걄걅걆걇걈걉걊걋걌걍걎걏걐걑걒걓걔걕걖걗걘걙걚걛걜걝걞걟걠걡걢걣걤걥걦걧걨걩걪걫걬걭걮걯거걱걲걳건걵걶걷걸걹걺걻걼걽걾걿검겁겂것겄겅겆겇겈겉겊겋게겍겎겏겐겑겒겓겔겕겖겗겘겙겚겛겜겝겞겟겠겡겢겣겤겥겦겧겨격겪겫견겭겮겯결겱겲겳겴겵겶겷겸겹겺겻겼경겾겿곀곁곂곃계곅곆곇곈곉곊곋곌곍곎곏곐곑곒곓곔곕곖곗곘곙곚곛곜곝곞곟고곡곢곣곤곥곦곧골곩곪곫곬곭곮곯곰곱곲곳곴공곶곷곸곹곺곻과곽곾곿관괁괂괃괄괅괆괇괈괉괊괋괌괍괎괏괐광괒괓괔괕괖괗괘괙괚괛괜괝괞괟괠괡괢괣괤괥괦괧괨괩괪괫괬괭괮괯괰괱괲괳괴괵괶괷괸괹괺괻괼괽괾괿굀굁굂굃굄굅굆굇굈굉굊굋굌굍굎굏교굑굒굓굔굕굖굗굘굙굚굛굜굝굞굟굠굡굢굣굤굥굦굧굨굩굪굫구국굮굯군굱굲굳굴굵굶굷굸굹굺굻굼굽굾굿궀궁궂궃궄궅궆궇궈궉궊궋권궍궎궏궐궑궒궓궔궕궖궗궘궙궚궛궜궝궞궟궠궡궢궣궤궥궦궧궨궩궪궫궬궭궮궯궰궱궲궳궴궵궶궷궸궹궺궻궼궽궾궿귀귁귂귃귄귅귆귇귈귉귊귋귌귍귎귏귐귑귒귓귔귕귖귗귘귙귚귛규귝귞귟균귡귢귣귤귥귦귧귨귩귪귫귬귭귮귯귰귱귲귳귴귵귶귷그극귺귻근귽귾귿글긁긂긃긄긅긆긇금급긊긋긌긍긎긏긐긑긒긓긔긕긖긗긘긙긚긛긜긝긞긟긠긡긢긣긤긥긦긧긨긩긪긫긬긭긮긯기긱긲긳긴긵긶긷길긹긺긻긼긽긾긿김깁깂깃깄깅깆깇깈깉깊깋";
    const TOKEN_START = "乜𪚥";
    const TOKEN_END = "𪚥乜";
    const TOKEN_URL = "有斡恚累";
    const TOKEN_CODE = "高頭不歷";
    const TOKEN_INLINE = "引羅引";



    /* ============================= 헬퍼 함수 =============================== */


    /** @description 텍스트가 모두 변환 가능한 문자인지 확인 */
    function _isAllConvertible(text, includeNumbers) {
        // 허용 특수문자
        const allowedSpecialChars = [
            "+", "-", "*", "/", "=", "<", ">", "%", "^", "±", "×", "÷", "°",
            "!", "?", ".", ",", ":", ";", "'", '"', "`",
            "(", ")", "[", "]", "{", "}",
            "@", "#", "$", "&", "|", "\\", "_", "~", "§", "©", "®", "™", "€", "£", "¥", "¢",
            
            "！", "？", "．", "，", "：", "；", "＇", "＂", "−",
            "（", "）", "［", "］", "｛", "｝", "〈", "〉", "《", "》", "「", "」", "『", "』",
            "＠", "＃", "＄", "％", "＆", "＊", "＋", "－", "＝", "＼", "｜", "～", "＿",
            "※", "★", "☆", "♪", "♡", "♢", "♦", "♧", "♠"
        ];
        
        // 정규식에서 사용할 수 있도록 이스케이프
        const escapedChars = allowedSpecialChars.map(char => 
            char.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')
        ).join('');
        
        // 숫자 포함 여부에 따라 패턴 결정
        const numberPattern = includeNumbers ? '0-9' : '';
        const allowedPattern = new RegExp(`^[${numberPattern}a-zA-Z\\s${escapedChars}]*$`);
        return allowedPattern.test(text);
    }


    /** @description 볼드체 특수문자 변환 함수 (숫자, 알파벳) */
    function _convertToBoldSpecial(text) {
        return text.replace(/[0-9a-zA-Z]/g, (char) => {
            if (char >= "0" && char <= "9") return String.fromCodePoint(0x1D7EC + (char.charCodeAt(0) - "0".charCodeAt(0)));
            else if (char >= "A" && char <= "Z") return String.fromCodePoint(0x1D5D4 + (char.charCodeAt(0) - "A".charCodeAt(0)));
            else if (char >= "a" && char <= "z") return String.fromCodePoint(0x1D5EE + (char.charCodeAt(0) - "a".charCodeAt(0)));
            return char;
        });
    }
    /** @description 이탤릭체 특수문자 변환 함수 (알파벳) */
    function _convertToItalicSpecial(text) {
        return text.replace(/[a-zA-Z]/g, (char) => {
            if (char >= "A" && char <= "Z") return String.fromCodePoint(0x1D608 + (char.charCodeAt(0) - "A".charCodeAt(0)));
            else if (char >= "a" && char <= "z") return String.fromCodePoint(0x1D622 + (char.charCodeAt(0) - "a".charCodeAt(0)));
            return char;
        });
    }
    /** @description 볼드+이탤릭체 특수문자 변환 함수 (알파벳, 숫자) */
    function _convertToBoldItalicSpecial(text) {
        return text.replace(/[0-9a-zA-Z]/g, (char) => {
            if (char >= "0" && char <= "9") return String.fromCodePoint(0x1D7EC + (char.charCodeAt(0) - "0".charCodeAt(0)));
            else if (char >= "A" && char <= "Z") return String.fromCodePoint(0x1D63C + (char.charCodeAt(0) - "A".charCodeAt(0)));
            else if (char >= "a" && char <= "z") return String.fromCodePoint(0x1D656 + (char.charCodeAt(0) - "a".charCodeAt(0)));
            return char;
        });
    }
    /** @description 마크다운 테이블을 목록 형식으로 변환 */
    function _processTable(match, headerRow, separatorRow, dataRows) {
        /**
         * @description 셀 배열로 파싱
         * @param {string} row 테이블의 한 행
         * @returns {Array<string>} 셀의 배열
         */
        function _parseRow(row) {
            let cells = row.split("|").map(cell => cell.trim());
            if (cells[0] === "") cells.shift();
            if (cells[cells.length - 1] === "") cells.pop();
            return cells;
        }
        
        const headers = _parseRow(headerRow);
        const dataRowLines = dataRows.split("\n").filter(line => line.trim() !== "");
        const rows = dataRowLines.map(_parseRow);
        
        // 첫 번째 열 빈 셀은 위의 값으로 채움
        for (let n = 0; n < rows.length; n++) {
            if (!rows[n][0] || rows[n][0] === "") {
                if (n > 0) rows[n][0] = rows[n - 1][0];
            }
        }
        
        let tableResult = "";
        const divider = "-------------------------\n";
        
        // 각 열별로 데이터를 번호와 함께 변환
        for (let colIndex = 0; colIndex < headers.length; colIndex++) {
            tableResult += "【" + headers[colIndex] + "】\n";
            if (headers[colIndex] === "장르") {
                for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                    let cellValue = rows[rowIndex][colIndex] || "";
                    if (rowIndex === 0 || cellValue !== rows[rowIndex - 1][colIndex]) {
                        // rowIndex + 1 : 원본 행 번호
                        tableResult += "    《" + (rowIndex + 1) + "》 " + cellValue + "\n";
                    }
                }
            } else {
                // 나머지 열은 모든 행을 출력 (연속 번호)
                let itemCounter = 0;
                for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                    let cellValue = (colIndex < rows[rowIndex].length) ? rows[rowIndex][colIndex] : "";
                    itemCounter++;
                    tableResult += "    《" + itemCounter + "》 " + cellValue + "\n";
                }
            }
            tableResult += divider;
        }
        
        return tableResult;
    }


    /** @description 볼드체 처리 함수 */
    function _processBold(match, delimiter, content) {
        const converted = _convertToBoldSpecial(content);
        return _isAllConvertible(content, true) ? converted : "❪" + converted + "❫";
    }
    /** @description 이탤릭체 처리 함수 */
    function _processItalic(match, delimiter, content) {
        const converted = _convertToItalicSpecial(content);
        return _isAllConvertible(content, false) ? converted : "❬" + converted + "❭";
    }
    /** @description 볼드+이탤릭체 처리 함수 */
    function _processBoldItalic(match, delimiter, content) {
        const converted = _convertToBoldItalicSpecial(content);
        return _isAllConvertible(content, true) ? converted : "❮" + converted + "❯";
    }
    /** @description 취소선 처리 */
    function _processStrikethrough(_, text) {
        let result = "";
        for (let char of text) result += char + "\u0336";
        return result;
    }


    /** @description 백틱 4개 이상 래퍼 처리 함수 */
    function _processWrappedCodeBlock(match, indent, fence, inner) {
        let lang = "";
        let codeText = inner;
      
        let m = inner.match(/^```([^\n]*)\n([\s\S]*?)\n```$/);
        if (m) {
            lang = (m[1] || "").trim();
            codeText = "```\n" + m[2].trim() + "\n```";
        }
      
        let token = TOKEN_START + TOKEN_CODE + indexChar[codeBlocks.length] + TOKEN_END;
        codeBlocks.push({
            lang: lang || "Code",
            code: codeText
        });
        return (indent || "") + token;
    }
    /** @description 코드 블록 처리 함수 */
    function _processCodeBlock(match, indent, lang, code) {
        const token = TOKEN_START + TOKEN_CODE + indexChar[codeBlocks.length] + TOKEN_END;
        codeBlocks.push({
            lang: (lang || "").trim() || "Code",
            code: (code || "").trim()
        });
        return (indent || "") + token;
    }
    /** @description 1줄 내의 인라인 코드를 토큰으로 대체 */
    function _processInlineCode(match, code) {
        if (code.includes("\n")) return match;

        const token = TOKEN_START + TOKEN_INLINE + indexChar[inlineCodes.length] + TOKEN_END;
        inlineCodes.push(code);
        return token;
    }




    /* =========================== 변환 시작 =========================== */


    let result = markdown;

    /** @description URL 보호 */
    result = result.replace(URL_REGEX, function(url) {
        const token = TOKEN_START + TOKEN_URL + indexChar[protectedUrls.length] + TOKEN_END;
        protectedUrls.push(url);
        return token;
    });

    // 마크다운 변환 로직
    result = result
        // 코드 블록, 인라인 코드 토큰화
        .replace(MD_PATTERNS.WRAPPED_CODE_BLOCK, _processWrappedCodeBlock)
        .replace(MD_PATTERNS.CODE_BLOCK, _processCodeBlock)
        .replace(/`([^\n`]+)`/g, _processInlineCode)
        
        // 줄 단위 요소 처리
        .replace(MD_PATTERNS.HORIZONTAL_LINE, "━".repeat(20))
        .replace(MD_PATTERNS.HEADING, (match, hashes, content) => {
            const level = hashes.length;
            const indent = " ".repeat(Math.max(0, 8 - level * 2));
            let pureContent = content;
            if (
                (pureContent.charAt(0) === "❪" && pureContent.charAt(pureContent.length - 1) === "❫") ||
                (pureContent.charAt(0) === "❮" && pureContent.charAt(pureContent.length - 1) === "❯") ||
                (pureContent.charAt(0) === '❬' && pureContent.charAt(pureContent.length - 1) === '❭')
            ) {
                pureContent = pureContent.substring(1, pureContent.length - 1);
                return "\n" + indent + "❰" + pureContent + "❱\n";
            }
            return "\n" + indent + "【" + content + "】\n";
        })
        .replace(MD_PATTERNS.CHECKBOX, (match, spaces, marker, checkState, content) => {
            const level = Math.floor(spaces.length / 2);
            const checkbox = (checkState.trim().toLowerCase() === 'x') ? '✔' : '✖';
            return " ".repeat(level * 2) + checkbox + " " + content;
        })
        .replace(MD_PATTERNS.LIST, (match, spaces, marker, content) => {
            const level = Math.floor(spaces.length / 2);
            const markers = ["⦁", "￮", "▸", "▹"];
            const bullet = markers[Math.min(level, markers.length - 1)];
            return " ".repeat(level * 2) + bullet + " " + content;
        })
        .replace(MD_PATTERNS.BLOCKQUOTE, (match, quotes, content) => {
            const level = (quotes.match(/>/g) || []).length;
            return " ".repeat(level * 2) + "‖ ".repeat(level) + content;
        })
        
        // 인라인 요소 처리
        .replace(MD_PATTERNS.BOLD_ITALIC, _processBoldItalic)
        .replace(MD_PATTERNS.BOLD, _processBold)
        .replace(MD_PATTERNS.ITALIC, _processItalic)
        .replace(MD_PATTERNS.STRIKETHROUGH, _processStrikethrough);


    // 마크다운 표 변환
    result = result.replace(TABLE_REGEX, _processTable);

    // 토큰 복원: 인라인 코드
    inlineCodes.forEach((code, n) => {
        result = result.replace(new RegExp(TOKEN_START + TOKEN_INLINE + indexChar[n] + TOKEN_END, "g"), "⦗ " + code + " ⦘");
    });

    // 토큰 복원: 코드 블록
    codeBlocks.forEach((obj, n) => {
        const border = "━".repeat(5);
        const formattedBlock = "\n┏" + border + " " + (obj.lang.trim() || "Code") + " " + border + "┓\n" + obj.code.trim() + "\n┗" + "━".repeat(10 + Math.ceil((obj.lang.trim() || "Code").length / 2)) + "┛\n";
        result = result.replace(new RegExp(TOKEN_START + TOKEN_CODE + indexChar[n] + TOKEN_END, "g"), formattedBlock);
    });

    // URL 복원
    protectedUrls.forEach((url, i) => {
        result = result.replace(new RegExp(TOKEN_START + TOKEN_URL + indexChar[i] + TOKEN_END, "g"), url);
    });

    // 이미지 처리
    result = result
        .replace(MD_PATTERNS.IMAGE, (match, imgFlag, text, url) => {
            if (text.trim().toLowerCase() === url.trim().toLowerCase()) return url + " ";   // 표시 텍스트 == URL
            return text + "( " + url + " )";    // 일반적인 경우
        });

    return result;
}