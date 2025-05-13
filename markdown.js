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
    const MD_PATTERNS = {
        CODE_BLOCK: /```(.*?)\n([\s\S]*?)```/g,
        INLINE_CODE: /`([^`]+)`/g,
        BOLD_ITALIC: /(\*\*\*|___)(.*?)\1/g,
        BOLD: /(\*\*|__)(.*?)\1/g,
        ITALIC: /(\*|_)(.*?)\1/g,
        STRIKETHROUGH: /~~(.*?)~~/g,
        IMAGE: /(!?)\[([^\]]+)\]\(([^)]+)\)/g,
        HORIZONTAL_LINE: /^([-*]){3,}$/gm,
        HEADING: /^(#+)\s+(.*)/gm,
        LIST: /^(\s*)([-*])\s+(.*)/gm,
        BLOCKQUOTE: /^(>+)\s+(.*)/gm
    };

    const codeBlocks = [];
    const inlineCodes = [];
    const TOKEN_START = "%%TOK%%S%%";
    const TOKEN_END = "%%TOK%%E%%";

    // URL 임시 보호용 토큰
    const protectedUrls = [];
    const URL_REGEX = /(?:https?:\/\/)[^\s\[\]()]*/g;

    // 변환 시작
    let result = markdown;

    // URL 보호
    result = result.replace(URL_REGEX, function(url) {
        const token = TOKEN_START + "URL" + protectedUrls.length + TOKEN_END;
        protectedUrls.push(url);
        return token;
    });

    // 마크다운 변환 로직
    result = result
        .replace(MD_PATTERNS.CODE_BLOCK, processCodeBlock)
        .replace(/`([^\n`]+)`/g, processInlineCode)
        .replace(MD_PATTERNS.BOLD_ITALIC, "❮$2❯")
        .replace(MD_PATTERNS.BOLD, "❪$2❫")
        .replace(MD_PATTERNS.ITALIC, '❬$2❭')
        .replace(MD_PATTERNS.STRIKETHROUGH, processStrikethrough)
        .replace(MD_PATTERNS.HORIZONTAL_LINE, "━".repeat(20))
        .replace(MD_PATTERNS.HEADING, function(_, hashes, content) {
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
        .replace(MD_PATTERNS.LIST, function(_, spaces, __, content) {
            const level = Math.floor(spaces.length / 2);
            const markers = ["⦁", "￮", "▸", "▹"];
            const marker = markers[Math.min(level, markers.length - 1)];
            return " ".repeat(level * 2) + marker + " " + content;
        })
        .replace(MD_PATTERNS.BLOCKQUOTE, function(_, quotes, content) {
            const level = quotes.length;
            return " ".repeat(level * 2) + "‖ ".repeat(level) + content;
        });

    // 마크다운 표 변환 로직
    const TABLE_REGEX = /(^\|.*\|[ \t]*\n)(^\|[ \t]*[-:| \t]+[ \t]*\n)((?:^\|.*\|[ \t]*\n?)+)/gm;
    result = result.replace(TABLE_REGEX, processTable);

    // 토큰 복원: 인라인 코드 먼저
    inlineCodes.forEach(function(code, n) {
        result = result.replace(new RegExp(TOKEN_START + "IC" + n + TOKEN_END, "g"), "⦗ " + code + " ⦘");
    });

    // 토큰 복원: 코드 블록
    codeBlocks.forEach(function(obj, n) {
        const border = "━".repeat(5);
        const formattedBlock = "\n┏" + border + " " + (obj.lang.trim() || "Code") + " " + border + "┓\n" + obj.code.trim() + "\n┗" + "━".repeat(10 + Math.ceil((obj.lang.trim() || "Code").length / 2)) + "┛\n";
        result = result.replace(new RegExp(TOKEN_START + "CB" + n + TOKEN_END, "g"), formattedBlock);
    });

    // URL 복원
    protectedUrls.forEach(function(url, i) {
        result = result.replace(new RegExp(TOKEN_START + "URL" + i + TOKEN_END, "g"), url);
    });

    result = result
        .replace(MD_PATTERNS.IMAGE, function(match, imgFlag, text, url) {
            // 대괄호 안의 텍스트가 URL인지 (동일한지) 확인
            if (text.trim().toLowerCase() === url.trim().toLowerCase()) {
                return url + " ";
            }
            // 일반적인 경우: "텍스트( url )" 형식으로 반환
            return text + "( " + url + " )";
        })

    return result;

    // 코드 블록 처리 함수
    function processCodeBlock(_, lang, code) {
        const token = TOKEN_START + "CB" + codeBlocks.length + TOKEN_END;
        codeBlocks.push({
            lang: lang.trim() || "Code",
            code: code.trim()
        });
        return token;
    }

    /**
     * @description 1줄 내의 인라인 코드를 토큰으로 대체
     * - 개행 문자가 포함된 경우 제외
     */
    function processInlineCode(match, code) {
        if (code.includes("\n")) return match;

        const token = TOKEN_START + "IC" + inlineCodes.length + TOKEN_END;
        inlineCodes.push(code);
        return token;
    }

    // 취소선 처리
    function processStrikethrough(_, text) {
        let result = "";
        for (let char of text) result += char + "\u0336";
        return result;
    }

    /**
     * @description 마크다운 테이블을 목록 형식으로 변환
     * @param {string} match 전체 매칭된 표 텍스트
     * @param {string} headerRow 헤더 행 (첫 번째 행)
     * @param {string} separatorRow 구분선 행 (예: |---|---| )
     * @param {string} dataRows 데이터 행 (세 번째 행 이후)
     * @returns {string} 변환된 문자열
     */
    function processTable(match, headerRow, separatorRow, dataRows) {
        /**
         * @description 셀 배열로 파싱
         * @param {string} row 테이블의 한 행
         * @returns {Array<string>} 셀의 배열
         */
        function parseRow(row) {
            let cells = row.split("|").map(cell => cell.trim());
            if (cells[0] === "") cells.shift();
            if (cells[cells.length - 1] === "") cells.pop();
            return cells;
        }
        
        const headers = parseRow(headerRow);
        const dataRowLines = dataRows.split("\n").filter(line => line.trim() !== "");
        const rows = dataRowLines.map(parseRow);
        
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
}