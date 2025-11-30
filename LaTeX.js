/**
 * @file LaTeX.js
 * @description LaTeX 제거(변환)
 * @author hehee https://github.com/hehee9
 * @license CC BY-NC-SA 4.0
 * - 저작권자 표기
 * - 라이선스 표기
 * - 상업적 이용 금지
 * - 동일 조건 변경 가능
 */




/* ============================= 상수 준비 =============================== */


// 매칭 맵
const superscriptsMap = new Map([
    ['0', '⁰'], ['1', '¹'], ['2', '²'], ['3', '³'], ['4', '⁴'],
    ['5', '⁵'], ['6', '⁶'], ['7', '⁷'], ['8', '⁸'], ['9', '⁹'],
    ['a', 'ᵃ'], ['b', 'ᵇ'], ['c', 'ᶜ'], ['d', 'ᵈ'], ['e', 'ᵉ'],
    ['f', 'ᶠ'], ['g', 'ᵍ'], ['h', 'ʰ'], ['i', 'ⁱ'], ['j', 'ʲ'],
    ['k', 'ᵏ'], ['l', 'ˡ'], ['m', 'ᵐ'], ['n', 'ⁿ'], ['o', 'ᵒ'],
    ['p', 'ᵖ'], ['q', 'q'], ['r', 'ʳ'], ['s', 'ˢ'], ['t', 'ᵗ'],
    ['u', 'ᵘ'], ['v', 'ᵛ'], ['w', 'ʷ'], ['x', 'ˣ'], ['y', 'ʸ'],
    ['z', 'ᶻ'],
    ['A', 'ᴬ'], ['B', 'ᴮ'], ['C', 'ᶜ'], ['D', 'ᴰ'], ['E', 'ᴱ'],
    ['F', 'ᶠ'], ['G', 'ᴳ'], ['H', 'ᴴ'], ['I', 'ᴵ'], ['J', 'ᴶ'],
    ['K', 'ᴷ'], ['L', 'ᴸ'], ['M', 'ᴹ'], ['N', 'ᴺ'], ['O', 'ᴼ'],
    ['P', 'ᴾ'], ['Q', 'Q'], ['R', 'ᴿ'], ['S', 'ˢ'], ['T', 'ᵀ'],
    ['U', 'ᵁ'], ['V', 'ⱽ'], ['W', 'ᵂ'], ['X', 'ˣ'], ['Y', 'ʸ'],
    ['Z', 'ᶻ'],
    ['+', '⁺'], ['-', '⁻'], ['=', '⁼'], ['(', '⁽'], [')', '⁾']
]);
const subscriptsMap = new Map([
    ['0', '₀'], ['1', '₁'], ['2', '₂'], ['3', '₃'], ['4', '₄'],
    ['5', '₅'], ['6', '₆'], ['7', '₇'], ['8', '₈'], ['9', '₉'],
    ['a', 'ₐ'], ['e', 'ₑ'], ['h', 'ₕ'], ['i', 'ᵢ'], ['j', 'ⱼ'],
    ['k', 'ₖ'], ['l', 'ₗ'], ['m', 'ₘ'], ['n', 'ₙ'], ['o', 'ₒ'],
    ['p', 'ₚ'], ['r', 'ᵣ'], ['s', 'ₛ'], ['t', 'ₜ'], ['u', 'ᵤ'],
    ['v', 'ᵥ'], ['x', 'ₓ'],
    ['A', 'ₐ'], ['B', 'ᵦ'], ['E', 'ₑ'], ['H', 'ₕ'], ['I', 'ᵢ'],
    ['K', 'ₖ'], ['L', 'ₗ'], ['M', 'ₘ'], ['N', 'ₙ'], ['O', 'ₒ'],
    ['P', 'ₚ'], ['R', 'ᵣ'], ['S', 'ₛ'], ['T', 'ₜ'], ['U', 'ᵤ'],
    ['V', 'ᵥ'], ['X', 'ₓ'],
    ['+', '₊'], ['-', '₋'], ['=', '₌'], ['(', '₍'], [')', '₎']
]);
const symbolMap = new Map([
    // 그리스 문자
    ['alpha', 'α'], ['beta', 'β'], ['gamma', 'γ'], ['Gamma', 'Γ'],
    ['delta', 'δ'], ['Delta', 'Δ'], ['epsilon', 'ε'], ['zeta', 'ζ'], ['eta', 'η'],
    ['theta', 'θ'], ['Theta', 'Θ'], ['iota', 'ι'], ['kappa', 'κ'],
    ['lambda', 'λ'], ['Lambda', 'Λ'], ['mu', 'μ'], ['nu', 'ν'],
    ['xi', 'ξ'], ['Xi', 'Ξ'], ['pi', 'π'], ['Pi', 'Π'],
    ['rho', 'ρ'], ['Sigma', 'Σ'], ['sigma', 'σ'],
    ['tau', 'τ'], ['Upsilon', 'Υ'], ['upsilon', 'υ'],
    ['phi', 'φ'], ['Phi', 'Φ'], ['chi', 'χ'], ['psi', 'ψ'], ['Psi', 'Ψ'],
    ['omega', 'ω'], ['Omega', 'Ω'],

    // 수학 연산자
    ['neq', '≠'], ['leq', '≤'], ['geq', '≥'], ['le', '≤'], ['ge', '≥'],
    ['approx', '≈'], ['propto', '∝'],
    ['equiv', '≡'], ['sim', '∼'], ['simeq', '≃'], ['cong', '≅'],

    ['neg', '¬'], ['land', '∧'], ['lor', '∨'],
    ['Leftrightarrow', '⟺'], ['Rightarrow', '⇒'], ['Leftarrow', '⇐'],
    ['rightarrow', '→'], ['leftarrow', '←'], ['forall', '∀'], ['exists', '∃'],
    ['mapsto', '↦'], ['longmapsto', '⟼'], ['hookrightarrow', '↪'], ['hookleftarrow', '↩'],
    ['rightharpoonup', '⇀'], ['leftharpoonup', '↼'], ['rightharpoondown', '⇁'], ['leftharpoondown', '↽'],
    ['updownarrow', '↕'], ['Updownarrow', '⇕'], ['nearrow', '↗'], ['searrow', '↘'], ['swarrow', '↙'],
    ['nwarrow', '↖'], ['top', '⊤'], ['bot', '⊥'],
    ['circlearrowleft', '↺'], ['circlearrowright', '↻'], ['curvearrowleft', '↶'], ['curvearrowright', '↷'],
    ['leftrightarrow', '↔'],
    ['uparrow', '↑'], ['downarrow', '↓'], ['twoheadrightarrow', '↠'], ['rightsquigarrow', '⇝'],

    ['in', '∈'], ['notin', '∉'], ['cup', '∪'], ['cap', '∩'],
    ['subset', '⊂'], ['subseteq', '⊆'], ['supset', '⊃'], ['supseteq', '⊇'],
    ['emptyset', '∅'],

    ['times', '×'], ['cdot', '·'], ['oint', '∮'],
    ['pm', '±'], ['mp', '∓'], ['div', '÷'], ['hbar', 'ℏ'],

    ['therefore', '∴'], ['because', '∵'],
    ['dots', '…'], ['cdots', '⋯'], ['vdots', '⋮'], ['ddots', '⋱'], ['ldots', '…'],

    ['nabla', '∇'], ['partial', '∂'],

    ['angle', '∠'], ['triangle', '△'], ['square', '□'], ['circle', '○'],

    ['infty', '∞'], ['prime', '′'], ['degree', '°'], ['circ', '∘'], ['bullet', '•'],
    ['ast', '∗'], ['star', '⋆'], ['mid', '∣'], ['ell', 'ℓ'],
    ['wp', '℘'], ['Re', 'ℜ'], ['Im', 'ℑ'],

    ['varnothing', '∅'], ['setminus', '∖'], ['smallsetminus', '∖'],
    ['subseteqq', '⫅'], ['supseteqq', '⫆'], ['nsubseteqq', '⊈'],
    ['subsetneqq', '⊊'], ['supsetneqq', '⊋'], ['varsubsetneq', '⊊'], ['varsupsetneq', '⊋'],
    ['nsubset', '⊄'], ['nsupset', '⊅'], ['nsupseteq', '⊉'],

    ['prec', '≺'], ['succ', '≻'], ['preceq', '⪯'], ['succeq', '⪰'],
    ['nprec', '⊀'], ['nsucc', '⊁'], ['parallel', '∥'], ['nparallel', '∦'],
    ['asymp', '≍'], ['bowtie', '⋈'], ['vartriangle', '△'], ['triangleq', '≜'],

    ['perp', '⊥'], ['vdash', '⊢'], ['models', '⊨'], ['dashv', '⊣'],
    ['nvdash', '⊬'], ['intercal', '⊺'], ['between', '≬'], ['pitchfork', '⋔'], ['backepsilon', '∍'],

    ['ltimes', '⋉'], ['rtimes', '⋊'], ['leftthreetimes', '⋋'], ['rightthreetimes', '⋌'], ['dotplus', '∔'], ['divideontimes', '⋇'], ['smallint', '∫'],

    ['aleph', 'ℵ'], ['beth', 'ℶ'], ['gimel', 'ℷ'], ['daleth', 'ℸ'], ['samekh', 'ס'], ['zayin', 'ז'], ['het', 'ח'],
    ['tet', 'ט'], ['yod', 'י'], ['kaf', 'כ'], ['lamed', 'ל'], ['mem', 'מ'], ['nun', 'נ'], ['pe', 'פ'], ['tsadi', 'צ'],
    ['qof', 'ק'], ['resh', 'ר'], ['shin', 'ש'], ['tav', 'ת'], ['vav', 'ו'],
    ['ayin', 'ע'], ['finalkaf', 'ך'], ['finalmem', 'ם'], ['finalnun', 'ן'], ['finalpe', 'ף'], ['finaltsadi', 'ץ'],

    ['implies', '⟹'], ['iff', '⟺'], ['Box', '□'], ['Diamond', '◇'],
    ['blacksquare', '■'], ['diamond', '◇'], ['blackdiamond', '◆'], ['lozenge', '◊'], ['blacklozenge', '⧫'],
    ['bigcirc', '○'], ['bigstar', '★'], ['pounds', '£'], ['yen', '¥'], ['euro', '€'],
    ['circledS', 'Ⓢ'], ['circledR', '®'], ['trademark', '™'], ['copyright', '©'],

    ['measuredangle', '∡'], ['sphericalangle', '∢'], ['nmid', '∤'], ['lvert', '|'], ['rvert', '|'],

    ['dagger', '†'], ['ddagger', '‡'], ['amalg', '⨿'], ['bigcap', '⋂'], ['bigcup', '⋃'], ['bigsqcup', '⨆'],
    ['bigvee', '⋁'], ['bigwedge', '⋀'], ['bigodot', '⨀'], ['bigoplus', '⨁'], ['bigotimes', '⨂'],
    ['iint', '∬'], ['iiint', '∭'], ['iiiint', '⨌'], ['idotsint', '∫⋯∫'],

    ['ulcorner', '⌜'], ['urcorner', '⌝'], ['llcorner', '⌞'], ['lrcorner', '⌟'],

    ['textcircled', '⓪①②③④⑤⑥⑦⑧⑨'], ['textdegree', '°'], ['dag', '†'], ['ddag', '‡'],
    ['textbar', '|'], ['textasciicircum', '^'], ['textasciitilde', '~'], ['checkmark', '✓'],
    ['Join', '⋈'], ['lhd', '⊲'], ['rhd', '⊳'], ['unlhd', '⊴'], ['unrhd', '⊵'],

    ['mho', '℧'], ['varkappa', 'ϰ'], ['varrho', 'ϱ'], ['varsigma', 'ς'], ['vartheta', 'ϑ'], ['varphi', 'φ'], ['varpi', 'ϖ'],

    ['Game', '⅁'], ['flat', '♭'], ['natural', '♮'], ['sharp', '♯'],
    ['clubsuit', '♣'], ['diamondsuit', '♢'], ['heartsuit', '♡'], ['spadesuit', '♠'],

    ['imath', 'ı'], ['jmath', 'ȷ'], ['wr', '≀'],
    ['coprod', '∐'], ['biguplus', '⨄'],

    ['backprime', '‵'], ['And', '⩓'], ['S', '§'], ['P', '¶'], ['eth', 'ð'], ['maltese', '✠'],
    ['diagup', '╱'], ['diagdown', '╲'],
    ['triangledown', '▽'], ['triangleleft', '◁'], ['triangleright', '▷'],
    ['circledast', '⊛'], ['circledcirc', '⊚'], ['circleddash', '⊝'],
    ['oplus', '⊕'], ['ominus', '⊖'], ['otimes', '⊗'], ['oslash', '⊘']
]);
const textCircledMap = new Map([
    ['a', 'ⓐ'], ['b', 'ⓑ'], ['c', 'ⓒ'], ['d', 'ⓓ'], ['e', 'ⓔ'],
    ['f', 'ⓕ'], ['g', 'ⓖ'], ['h', 'ⓗ'], ['i', 'ⓘ'], ['j', 'ⓙ'],
    ['k', 'ⓚ'], ['l', 'ⓛ'], ['m', 'ⓜ'], ['n', 'ⓝ'], ['o', 'ⓞ'],
    ['p', 'ⓟ'], ['q', 'ⓠ'], ['r', 'ⓡ'], ['s', 'ⓢ'], ['t', 'ⓣ'],
    ['u', 'ⓤ'], ['v', 'ⓥ'], ['w', 'ⓦ'], ['x', 'ⓧ'], ['y', 'ⓨ'],
    ['z', 'ⓩ'],
    ['A', 'Ⓐ'], ['B', 'Ⓑ'], ['C', 'Ⓒ'], ['D', 'Ⓓ'], ['E', 'Ⓔ'],
    ['F', 'Ⓕ'], ['G', 'Ⓖ'], ['H', 'Ⓗ'], ['I', 'Ⓘ'], ['J', 'Ⓙ'],
    ['K', 'Ⓚ'], ['L', 'Ⓛ'], ['M', 'Ⓜ'], ['N', 'Ⓝ'], ['O', 'Ⓞ'],
    ['P', 'Ⓟ'], ['Q', 'Ⓠ'], ['R', 'Ⓡ'], ['S', 'Ⓢ'], ['T', 'Ⓣ'],
    ['U', 'Ⓤ'], ['V', 'Ⓥ'], ['W', 'Ⓦ'], ['X', 'Ⓧ'], ['Y', 'Ⓨ'],
    ['Z', 'Ⓩ'],
    ['0', '⓪'], ['1', '①'], ['2', '②'], ['3', '③'], ['4', '④'], ['5', '⑤'],
    ['6', '⑥'], ['7', '⑦'], ['8', '⑧'], ['9', '⑨'], ['10', '⑩'],
    ['11', '⑪'], ['12', '⑫'], ['13', '⑬'], ['14', '⑭'], ['15', '⑮'],
    ['16', '⑯'], ['17', '⑰'], ['18', '⑱'], ['19', '⑲'], ['20', '⑳'],
    ['21', '㉑'], ['22', '㉒'], ['23', '㉓'], ['24', '㉔'], ['25', '㉕'],
    ['26', '㉖'], ['27', '㉗'], ['28', '㉘'], ['29', '㉙'], ['30', '㉚'],
    ['31', '㉛'], ['32', '㉜'], ['33', '㉝'], ['34', '㉞'], ['35', '㉟'],
    ['36', '㊱'], ['37', '㊲'], ['38', '㊳'], ['39', '㊴'], ['40', '㊵'],
    ['41', '㊶'], ['42', '㊷'], ['43', '㊸'], ['44', '㊹'], ['45', '㊺'],
    ['46', '㊻'], ['47', '㊼'], ['48', '㊽'], ['49', '㊾'], ['50', '㊿']
]);
const delimiters = new Map([
    ['\\left(', '('], ['\\right)', ')'],
    ['\\left[', '['], ['\\right]', ']'],
    ['\\left\\{', '{'], ['\\right\\}', '}'],
    ['\\left|', '|'], ['\\right|', '|'],
    ['\\middle|', '|'],
    ['\\lVert', '‖'], ['\\rVert', '‖'],
    ['\\|', '‖']
]);
const mathFonts = new Map([
    ['mathbf', new Map([
        ['A', '𝐀'], ['B', '𝐁'], ['C', '𝐂'], ['D', '𝐃'], ['E', '𝐄'], ['F', '𝐅'], ['G', '𝐆'], ['H', '𝐇'], ['I', '𝐈'],
        ['J', '𝐉'], ['K', '𝐊'], ['L', '𝐋'], ['M', '𝐌'], ['N', '𝐍'], ['O', '𝐎'], ['P', '𝐏'], ['Q', '𝐐'], ['R', '𝐑'],
        ['S', '𝐒'], ['T', '𝐓'], ['U', '𝐔'], ['V', '𝐕'], ['W', '𝐖'], ['X', '𝐗'], ['Y', '𝐘'], ['Z', '𝐙'],
        ['a', '𝐚'], ['b', '𝐛'], ['c', '𝐜'], ['d', '𝐝'], ['e', '𝐞'], ['f', '𝐟'], ['g', '𝐠'], ['h', '𝐡'], ['i', '𝐢'],
        ['j', '𝐣'], ['k', '𝐤'], ['l', '𝐥'], ['m', '𝐦'], ['n', '𝐧'], ['o', '𝐨'], ['p', '𝐩'], ['q', '𝐪'], ['r', '𝐫'],
        ['s', '𝐬'], ['t', '𝐭'], ['u', '𝐮'], ['v', '𝐯'], ['w', '𝐰'], ['x', '𝐱'], ['y', '𝐲'], ['z', '𝐳']
    ])],
    ['mathbb', new Map([
        ['A', '𝔸'], ['B', '𝔹'], ['C', 'ℂ'], ['D', '𝔻'], ['E', '𝔼'], ['F', '𝔽'], ['G', '𝔾'], ['H', 'ℍ'], ['I', '𝕀'],
        ['J', '𝕁'], ['K', '𝕂'], ['L', '𝕃'], ['M', '𝕄'], ['N', 'ℕ'], ['O', '𝕆'], ['P', 'ℙ'], ['Q', 'ℚ'], ['R', 'ℝ'],
        ['S', '𝕊'], ['T', '𝕋'], ['U', '𝕌'], ['V', '𝕍'], ['W', '𝕎'], ['X', '𝕏'], ['Y', '𝕐'], ['Z', 'ℤ'],
        ['a', '𝕒'], ['b', '𝕓'], ['c', '𝕔'], ['d', '𝕕'], ['e', '𝕖'], ['f', '𝕗'], ['g', '𝕘'], ['h', '𝕙'], ['i', '𝕚'],
        ['j', '𝕛'], ['k', '𝕜'], ['l', '𝕝'], ['m', '𝕞'], ['n', '𝕟'], ['o', '𝕠'], ['p', '𝕡'], ['q', '𝕢'], ['r', '𝕣'],
        ['s', '𝕤'], ['t', '𝕥'], ['u', '𝕦'], ['v', '𝕧'], ['w', '𝕨'], ['x', '𝕩'], ['y', '𝕪'], ['z', '𝕫']
    ])],
    ['mathcal', new Map([
        ['A', '𝒜'], ['B', 'ℬ'], ['C', '𝒞'], ['D', '𝒟'], ['E', 'ℰ'], ['F', 'ℱ'], ['G', '𝒢'], ['H', 'ℋ'], ['I', 'ℐ'],
        ['J', '𝒥'], ['K', '𝒦'], ['L', 'ℒ'], ['M', 'ℳ'], ['N', '𝒩'], ['O', '𝒪'], ['P', '𝒫'], ['Q', '𝒬'], ['R', 'ℛ'],
        ['S', '𝒮'], ['T', '𝒯'], ['U', '𝒰'], ['V', '𝒱'], ['W', '𝒲'], ['X', '𝒳'], ['Y', '𝒴'], ['Z', '𝒵'],
        ['a', '𝒶'], ['b', '𝒷'], ['c', '𝒸'], ['d', '𝒹'], ['e', '𝑒'], ['f', '𝒻'], ['g', '𝑔'], ['h', '𝒽'], ['i', '𝒾'],
        ['j', '𝒿'], ['k', '𝓀'], ['l', '𝓁'], ['m', '𝓂'], ['n', '𝓃'], ['o', '𝑜'], ['p', '𝓅'], ['q', '𝓆'], ['r', '𝓇'],
        ['s', '𝓈'], ['t', '𝓉'], ['u', '𝓊'], ['v', '𝓋'], ['w', '𝓌'], ['x', '𝓍'], ['y', '𝓎'], ['z', '𝓏']
    ])],
    ['mathfrak', new Map([
        ['A', '𝔄'], ['B', '𝔅'], ['C', 'ℭ'], ['D', '𝔇'], ['E', '𝔈'], ['F', '𝔉'], ['G', '𝔊'], ['H', 'ℌ'], ['I', 'ℑ'],
        ['J', '𝔍'], ['K', '𝔎'], ['L', '𝔏'], ['M', '𝔐'], ['N', '𝔑'], ['O', '𝔒'], ['P', '𝔓'], ['Q', '𝔔'], ['R', 'ℜ'],
        ['S', '𝔖'], ['T', '𝔗'], ['U', '𝔘'], ['V', '𝔙'], ['W', '𝔚'], ['X', '𝔛'], ['Y', '𝔜'], ['Z', 'ℨ'],
        ['a', '𝔞'], ['b', '𝔟'], ['c', '𝔠'], ['d', '𝔡'], ['e', '𝔢'], ['f', '𝔣'], ['g', '𝔤'], ['h', '𝔥'], ['i', '𝔦'],
        ['j', '𝔧'], ['k', '𝔨'], ['l', '𝔩'], ['m', '𝔪'], ['n', '𝔫'], ['o', '𝔬'], ['p', '𝔭'], ['q', '𝔮'], ['r', '𝔯'],
        ['s', '𝔰'], ['t', '𝔱'], ['u', '𝔲'], ['v', '𝔳'], ['w', '𝔴'], ['x', '𝔵'], ['y', '𝔶'], ['z', '𝔷']
    ])]
]);
const decorations = new Map([
    ['overline', '̄'], ['widehat', '̂'], ['widetilde', '̃'],
    ['vec', '⃗'], ['bar', '̄'], ['dot', '̇'], ['ddot', '̈'],
    ['acute', '́'], ['grave', '̀'], ['check', '̌'], ['breve', '̆'], ['tilde', '̃'], ['hat', '̂']
]);
const spaces = new Map([
    ['\\,', '\u2009'], ['\\:', '\u205F'], ['\\;', '\u2004'], ['\\!', ''],
    ['\\quad', '\u2003'], ['\\qquad', '\u2003\u2003']
]);


// 정규식 사전 컴파일
const RE_CODE_BLOCK = /```(.*?)\n([\s\S]*?)```/g;
const RE_LATEX_CHECK = /\$[^$]|\\\[|\\\(|\\[a-zA-Z]{2,}|\\begin/;
const RE_BOXED = /\\boxed\{([^}]+)\}/g;
const RE_TEXTCIRCLED = /\\textcircled\{([^}]+)\}/g;
const RE_DELIMITERS = /\\(?:left|right|middle)(?:\\[{}]|\(|\)|\[|\]|\|)|\\[lr]Vert/g;
const RE_DISPLAYSTYLE = /\\displaystyle\s*/g;
const RE_DFRAC = /\\dfrac/g;
const RE_SYMBOLS = /\\([A-Za-z]+)(?![a-zA-Z])/g;
const RE_TEXT = /\\text\{([^}]+)\}/g;
const RE_TEXTCOLOR = /\\textcolor\{([^}]+)\}\{([^}]+)\}/g;
const RE_OPERATORNAME = /\\operatorname\{([^}]+)\}/g;
const RE_SPACES = /\\[,;]|\\quad|\\qquad/g;
const RE_SUM_PROD = /\\(sum|prod)_\{([^}]+)\}\^\{([^}]+)\}/g;
const RE_INTEGRAL = /\\(oint|int)(?:_([A-Z]))?/g;
const RE_CASES = /\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g;
const RE_MATRIX = /\\begin\{([pb])matrix\}([\s\S]*?)\\end\{\1matrix\}/g;
const RE_FRAC = /\\[d]?frac\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}/g;
const RE_SQRT_N = /\\sqrt\[(\d+|n)\]\{([^}]+)\}/g;
const RE_SQRT = /\\sqrt\{([^}]+)\}/g;

const RE_FONT_CMD = /(mathbf|mathbb|mathcal|mathfrak)/;
const RE_DECORATION = /\\(overline|hat|widehat|vec|dot|ddot|bar|tilde|widetilde)\{([^}]+)\}/g;

const RE_SUBSCRIPT_SINGLE = /\_([A-Za-z0-9])/g;
const RE_SUBSCRIPT_BRACED = /\_\{([^}]+)\}/g;
const RE_SUPERSCRIPT_BRACED = /\^\{([^}]+)\}/g;
const RE_SUPERSCRIPT_SINGLE = /\^([0-9a-z])/g;
const RE_BRACES = /[{}]/g;
const RE_BACKSLASH = /\\/g;
const RE_OPERATORS_SPACING = /\s*([+\-=<>≤≥≈≠×÷∙∘∧∨⟺⇒⇐→←∪∩∈∉⊂⊃⊆⊇])\s*/g;
const RE_WHITESPACE = /\s+/g;
const RE_BEGIN_ENV = /\\begin\{[^}]+\}/g;
const RE_END_ENV = /\\end\{[^}]+\}/g;
const RE_ALIGN_SYMBOL = /&=/g;
const RE_AMPERSAND = /&/g;
const RE_LINEBREAK = /\\\\/g;

const RE_FONT_MATHBF = /\\mathbf\{([^}]+)\}/g;
const RE_FONT_MATHBB = /\\mathbb\{([^}]+)\}/g;
const RE_FONT_MATHCAL = /\\mathcal\{([^}]+)\}/g;
const RE_FONT_MATHFRAK = /\\mathfrak\{([^}]+)\}/g;

const TOKEN_START = "⟦𪚥";
const TOKEN_END = "𪚥⟧";




/* ============================= 유틸/헬퍼 함수 =============================== */


/** @description 첨자 변환 */
function _convertToScript(str, scriptMap) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += scriptMap.get(str[i]) || str[i];
    }
    return result;
}
/** @description 폰트 변환 */
function _convertFont(content, fontMap) {
    let result = '';
    for (let i = 0; i < content.length; i++) {
        result += fontMap.get(content[i]) || content[i];
    }
    return result;
}


const utils = {
    _convertLimits(text) {
        let result = text.replace(RE_SUM_PROD, (_, type, lower, upper) => {
            let symbol = type === "sum" ? "Σ" : "Π";
            let upperConverted = _convertToScript(upper, superscriptsMap);
            let lowerConverted = _convertToScript(lower, subscriptsMap);
            return `${symbol}[${upperConverted}${lowerConverted}]`;
        });

        result = result.replace(RE_INTEGRAL, (_, type, var_) => {
            let integral = type === "oint" ? "∮" : "∫";
            return var_ ? `${integral}${var_}` : integral;
        });

        return result;
    },

    _convertCases(text) {
        return text.replace(RE_CASES, (_, content) => {
            let lines = content.split('\\\\');
            let result = [];
            for (let i = 0; i < lines.length; i++) {
                let parts = lines[i].split('&');
                let expr = parts[0];
                let cond = parts[1];
                if (cond) {
                    result.push(`${expr.trim()} if ${cond.replace(/\\text\{if \}/g, '').trim()}`);
                } else {
                    result.push(expr.trim());
                }
            }
            return result.join(', ');
        });
    },

    _convertMatrices(text) {
        return text.replace(RE_MATRIX, (_, type, content) => {
            const bracket = type === 'p' ? ['(', ')'] : ['[', ']'];
            const rows = content.trim().split('\\\\');
            const matrix = [];
            for (let i = 0; i < rows.length; i++) {
                let cells = rows[i].trim().split('&');
                let row = [];
                for (let j = 0; j < cells.length; j++) {
                    row.push(cells[j].trim());
                }
                matrix.push(row);
            }
            if (matrix.length === 1) {
                return `${bracket[0]} ${matrix[0].join(' | ')} ${bracket[1]}`;
            }
            const matrixStr = [];
            for (let i = 0; i < matrix.length; i++) {
                matrixStr.push(matrix[i].join('  '));
            }
            return `${bracket[0]}\n${matrixStr.join(' | ')}\n${bracket[1]}`;
        });
    },

    _convertFractions(text, depth) {
        if (depth > 20) return text;
        return text.replace(RE_FRAC, (_, num, den) => {
            num = this._convertFractions(num, depth + 1);
            den = this._convertFractions(den, depth + 1);
            const needNumParens = num.includes('/') || num.includes('+') || num.includes('-');
            const needDenParens = den.includes('/') || den.includes('+') || den.includes('-');
            return ((needNumParens ? `(${num})` : num)) + "/" + ((needDenParens ? `(${den})` : den));
        });
    },

    _convertSqrt(text) {
        return text
            .replace(RE_SQRT_N, (_, n, expr) => {
                if (n === '3') return `∛(${expr})`;
                if (n === '4') return `∜(${expr})`;
                return `${n}√(${expr})`;
            })
            .replace(RE_SQRT, '√($1)');
    },

    _convertFontsAndDecorations(text) {
        return text
            .replace(RE_FONT_MATHBF, (_, content) => _convertFont(content, mathFonts.get('mathbf')))
            .replace(RE_FONT_MATHBB, (_, content) => _convertFont(content, mathFonts.get('mathbb')))
            .replace(RE_FONT_MATHCAL, (_, content) => _convertFont(content, mathFonts.get('mathcal')))
            .replace(RE_FONT_MATHFRAK, (_, content) => _convertFont(content, mathFonts.get('mathfrak')))
            .replace(RE_DECORATION, (_, decoration, char) => char + (decorations.get(decoration) || ''));
    },

    _convertSubscriptsAndSuperscripts(text) {
        return text
            .replace(RE_SUBSCRIPT_SINGLE, (_, sub) => subscriptsMap.get(sub) || sub)
            .replace(RE_SUBSCRIPT_BRACED, (_, sub) => _convertToScript(sub, subscriptsMap))
            .replace(RE_SUPERSCRIPT_BRACED, (_, sup) => _convertToScript(sup, superscriptsMap))
            .replace(RE_SUPERSCRIPT_SINGLE, (_, sup) => superscriptsMap.get(sup) || sup);
    },

    _cleanupResult(text) {
        return text
            .replace(RE_BRACES, '')
            .replace(RE_BACKSLASH, '')
            .replace(RE_OPERATORS_SPACING, ' $1 ')
            .replace(RE_WHITESPACE, ' ')
            .trim();
    },

    _convertText(text) {
        return text
            .replace(RE_TEXT, '$1')
            .replace(RE_TEXTCOLOR, '$2')
            .replace(RE_OPERATORNAME, '$1');
    },

    _convertSpaces(text) {
        return text.replace(RE_SPACES, match => spaces.get(match) || match);
    },

    _convertMathEnvironment(text) {
        return text
            .replace(RE_BEGIN_ENV, '')
            .replace(RE_END_ENV, '')
            .replace(RE_ALIGN_SYMBOL, '=')
            .replace(RE_AMPERSAND, '')
            .replace(RE_LINEBREAK, ' ')
            .replace(RE_WHITESPACE, ' ')
            .trim();
    }
};


/** @description 수학 기호 변환 */
function _convertMath(math) {
    let result = math;

    result = result.replace(RE_BOXED, (_, content) => `[${_convertMath(content)}]`);
    result = result.replace(RE_TEXTCIRCLED, (_, char) => textCircledMap.get(char) || 'Ⓞ');
    result = result.replace(RE_DELIMITERS, match => delimiters.get(match) || match);
    result = result.replace(RE_DISPLAYSTYLE, '').replace(RE_DFRAC, '\\frac');

    const hasBegin = result.includes('\\begin{');
    if (hasBegin) {
        result = utils._convertMatrices(result);
    }

    result = result.replace(RE_SYMBOLS, (match, operator) => symbolMap.get(operator) || match);

    if (hasBegin || result.includes('\\end{')) {
        result = utils._convertMathEnvironment(result);
    }

    result = utils._convertText(result);
    result = utils._convertSpaces(result);
    result = utils._convertLimits(result);
    result = utils._convertCases(result);
    
    if (!hasBegin && result.includes('\\begin{')) {
        result = utils._convertMatrices(result);
    }
    
    result = utils._convertFractions(result, 0);
    result = utils._convertSqrt(result);
    result = utils._convertFontsAndDecorations(result);
    result = utils._convertSubscriptsAndSuperscripts(result);
    result = utils._cleanupResult(result);

    return result;
}
/** @description LaTeX 선 변환 */
function _processLine(line, state) {
    const dollarMatch = line.match(/\$([^\$]+)\$/);
    if (dollarMatch) {
        const mathContent = dollarMatch[1];
        if (mathContent.includes("\\begin{cases}")) {
            let parts = mathContent.split("\\begin{cases}");
            let beforeCases = parts[0];
            let casesEnd = parts[1].split("\\end{cases}");
            let lines = casesEnd[0].split("\\\\");
            let processedLines = [];
            for (let i = 0; i < lines.length; i++) {
                let l = lines[i];
                if (!l.trim()) continue;
                let p = l.split("&");
                let expr = p[0] ? p[0].trim() : '';
                let cond = p[1] ? p[1].trim() : '';
                let convertedExpr = _convertMath(expr);
                let convertedCond = cond ? _convertMath(cond.replace(/\\text\{if\s*\}/g, "")) : "";
                processedLines.push("│ " + convertedExpr + (cond ? " if " + convertedCond : ""));
            }
            return _convertMath(beforeCases.trim()) + "\n┌─ cases ─────\n" + processedLines.join("\n") + "\n└────────────";
        }
        return _convertMath(mathContent);
    }

    const beginMatch = line.match(/\\begin\{(align|gather|cases)\*?\}/);
    if (beginMatch) {
        state.currentEnvironment = beginMatch[1];
        state.environmentContent = [];
        return "┌─ " + beginMatch[1] + (beginMatch[0].includes('*') ? '*' : '') + " ─────";
    }

    const endMatch = line.match(/\\end\{(align|gather|cases)\*?\}/);
    if (endMatch) {
        const env = endMatch[1];
        if (env === state.currentEnvironment) {
            let content = state.environmentContent.join("\n");
            state.currentEnvironment = null;

            if (env === 'cases') {
                let lines = content.split('\n');
                let processedContent = [];
                for (let i = 0; i < lines.length; i++) {
                    let l = lines[i];
                    if (!l.trim()) continue;
                    let p = l.split("&");
                    let expr = p[0] ? p[0].trim() : '';
                    let cond = p[1] ? p[1].trim() : '';
                    processedContent.push("│ " + _convertMath(expr) + (cond ? " if " + _convertMath(cond.replace(/\\text\{if\s*\}/g, "")) : ""));
                }
                return processedContent.join("\n") + "\n└────────────";
            } else {
                let lines = content.split("\n");
                let processedContent = [];
                for (let i = 0; i < lines.length; i++) {
                    let l = lines[i];
                    if (!l.trim()) continue;
                    let parts = l.split("&");
                    let converted = [];
                    for (let j = 0; j < parts.length; j++) {
                        converted.push(_convertMath(parts[j].trim()));
                    }
                    processedContent.push("│ " + converted.join(" = "));
                }
                return processedContent.join("\n") + "\n└────────────";
            }
        }
        return "└────────────";
    }

    if (state.currentEnvironment) {
        state.environmentContent.push(line);
        return "";
    }

    return _convertMath(line.replace(/\\text\{if\s*\}/g, "if").trim());
}
/** @description 세그먼트 처리 */
function _processLatexSegment(segment) {
    const state = { currentEnvironment: null, environmentContent: [] };
    const lines = segment.split('\n');
    const result = [];
    for (let i = 0; i < lines.length; i++) {
        result.push(_processLine(lines[i].trim(), state));
    }
    return result.join('\n');
}




/* ============================= 메인 로직 =============================== */


/**
 * @description LaTeX 제거(변환) 함수
 * @param {string} text 제거할 문자열
 * @returns {string} LaTeX 제거 문자열
 */
function LatexToText(text) {
    // LaTeX가 포함되었는지 확인
    if (!text.includes('$') && !text.includes('\\')) {
        return text;
    }
    const textOutsideCode = text.replace(/```[\s\S]*?```/g, '');
    if (!/\$[^$]|\\\[|\\\(|\\[a-zA-Z]{2,}|\\begin/.test(textOutsideCode)) {
        return text;
    }

    try {  
        // 코드 블록 토큰
        const codeBlocks = [];
        let processedText = text.replace(RE_CODE_BLOCK, (_, lang, code) => {
            const token = TOKEN_START + "CB" + codeBlocks.length + TOKEN_END;
            codeBlocks.push({ lang: lang.trim(), code: code.trim() });
            return token;
        });

        // LaTeX 패턴 순차 처리
        const latexPatterns = [
            // begin/end 환경
            { regex: /\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g, strip: null },
            // $$ 블록
            { regex: /\$\$[\s\S]+?\$\$/g, strip: /^\$\$|\$\$$/g },
            // \[...\]
            { regex: /\\\[[\s\S]*?\\\]/g, strip: /^\\\[|\\\]$/g },
            // \(...\)
            { regex: /\\\([\s\S]*?\\\)/g, strip: /^\\\(|\\\)$/g },
            // $ 인라인
            { regex: /\$[^$]+\$/g, strip: /^\$|\$$/g },
            // \boxed{...}
            { regex: /\\boxed\{[^}]*\}/g, strip: null }
        ];

        for (let i = 0; i < latexPatterns.length; i++) {
            let pattern = latexPatterns[i];
            processedText = processedText.replace(pattern.regex, (match) => {
                let cleaned = pattern.strip ? match.replace(pattern.strip, '') : match;
                return _processLatexSegment(cleaned);
            });
        }

        for (let n = 0; n < codeBlocks.length; n++) {
            let block = codeBlocks[n];
            processedText = processedText.replace(
                TOKEN_START + "CB" + n + TOKEN_END,
                `\n\`\`\`${block.lang}\n${block.code}\n\`\`\``
            );
        }
        
        return processedText;
          
    } catch(e) {
        Log.e(`${e.name}\n${e.message}\n${e.stack}`);
        return text;
    }
}


// module.exports = LatexToText;