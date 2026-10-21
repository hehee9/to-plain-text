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
    ['a', 'ₐ'], ['b', 'ᵦ'], ['e', 'ₑ'], ['h', 'ₕ'], ['i', 'ᵢ'], ['j', 'ⱼ'],
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
    ['Longleftrightarrow', '⟺'], ['Longrightarrow', '⟹'], ['Longleftarrow', '⟸'],
    ['longleftrightarrow', '⟷'], ['longrightarrow', '⟶'], ['longleftarrow', '⟵'],
    ['rightarrow', '→'], ['leftarrow', '←'], ['leftrightarrow', '↔'], ['to', '→'], ['gets', '←'],
    ['rightleftharpoons', '⇌'], ['leftrightharpoons', '⇋'],
    ['forall', '∀'], ['exists', '∃'],
    ['mapsto', '↦'], ['longmapsto', '⟼'], ['hookrightarrow', '↪'], ['hookleftarrow', '↩'],
    ['rightharpoonup', '⇀'], ['leftharpoonup', '↼'], ['rightharpoondown', '⇁'], ['leftharpoondown', '↽'],
    ['updownarrow', '↕'], ['Updownarrow', '⇕'], ['nearrow', '↗'], ['searrow', '↘'], ['swarrow', '↙'],
    ['nwarrow', '↖'], ['top', '⊤'], ['bot', '⊥'],
    ['circlearrowleft', '↺'], ['circlearrowright', '↻'], ['curvearrowleft', '↶'], ['curvearrowright', '↷'],
    ['uparrow', '↑'], ['downarrow', '↓'], ['twoheadrightarrow', '↠'], ['rightsquigarrow', '⇝'],

    ['ne', '≠'], ['langle', '⟨'], ['rangle', '⟩'],

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
    ['lVert', '‖'], ['rVert', '‖'], ['Vert', '‖'], ['vert', '|'],

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
const mathFunctionCommands = new Set([
    "log", "ln", "lg",
    "sin", "cos", "tan", "cot", "sec", "csc",
    "arcsin", "arccos", "arctan", "atan", "atan2",
    "sinh", "cosh", "tanh",
    "lim", "min", "max", "sup", "inf", "deg", "det", "dim", "gcd", "hom", "ker", "Pr", "exp", "arg"
]);
const fracLikeCommands = new Set(["frac", "dfrac", "tfrac", "cfrac"]);
const bigDelimiterCommands = new Set([
    "big", "Big", "bigg", "Bigg",
    "bigl", "bigr", "Bigl", "Bigr",
    "biggl", "biggr", "Biggl", "Biggr"
]);
const V2_LEFT_BRACE_PLACEHOLDER = "\uE000";
const V2_RIGHT_BRACE_PLACEHOLDER = "\uE001";
const RE_V2_LEFT_BRACE_PLACEHOLDER = /\uE000/g;
const RE_V2_RIGHT_BRACE_PLACEHOLDER = /\uE001/g;


// 정규식 사전 컴파일
const RE_CODE_BLOCK = /```(.*?)\n([\s\S]*?)```/g;
const RE_LATEX_COMMAND_CHECK = /\\\[|\\\(|\\[a-zA-Z]{2,}|\\begin/;
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
const RE_CODE_BLOCK_TOKEN = /⟦𪚥CB(\d+)𪚥⟧/g;

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

function _looksLikeNaturalLanguage(content) {
    if (!content) return false;
    if (/[가-힣]/.test(content)) return true;

    const compact = content.trim();
    if (!compact) return false;

    const words = compact.match(/[A-Za-z]+/g) || [];
    const meaningfulWords = [];
    for (let i = 0; i < words.length; i++) {
        if (words[i].length >= 2) {
            meaningfulWords.push(words[i]);
        }
    }

    if (meaningfulWords.length >= 3) return true;
    if (meaningfulWords.length >= 2 && compact.includes(" ")) return true;
    return false;
}

function _hasInlineMathOperator(content) {
    if (!content) return false;

    for (let i = 0; i < content.length; i++) {
        const ch = content[i];
        if (ch === '+' || ch === '*' || ch === '/' || ch === '=' || ch === '<' || ch === '>' || ch === '^' || ch === '_') {
            return true;
        }
        if (ch === '-' && i > 0 && i < content.length - 1) {
            return true;
        }
    }
    return /[≤≥≈≠]/.test(content);
}

function _isLikelyInlineMath(content) {
    const source = String(content || "").trim();
    if (!source) return false;
    if (source.length > 120) return false;

    if (/\\(?:[A-Za-z]{2,}|[\[\](){}])/g.test(source)) return true;
    if (source.includes("\\left") || source.includes("\\right") || source.includes("\\begin")) return true;
    if (_hasInlineMathOperator(source)) return true;
    if (/[()[\]{}]/.test(source) && /[A-Za-z0-9]/.test(source)) return true;
    if (_looksLikeNaturalLanguage(source)) return false;
    if (/^\d+(?:\.\d+)?$/.test(source)) return false;
    if (/^\d+(?:\.\d+)?[A-Za-z가-힣]+/.test(source)) return false;
    if (/^[A-Za-z](?:[A-Za-z0-9]{0,7})?$/.test(source)) return true;
    return false;
}

function _hasConvertibleInlineMath(text) {
    if (!text || text.indexOf('$') === -1) return false;

    for (let i = 0; i < text.length; i++) {
        if (text[i] !== '$') continue;

        const maxEnd = Math.min(text.length, i + 122);
        for (let j = i + 1; j < maxEnd; j++) {
            const ch = text[j];
            if (ch === '\n') break;
            if (ch !== '$') continue;
            if (_isLikelyInlineMath(text.slice(i + 1, j))) {
                return true;
            }
            break;
        }
    }

    return false;
}

function _restoreCodeBlocks(text, codeBlocks) {
    if (!text || !codeBlocks || codeBlocks.length === 0) return text;

    return text.replace(RE_CODE_BLOCK_TOKEN, (match, indexStr) => {
        const block = codeBlocks[Number(indexStr)];
        if (!block) return match;
        return `\n\`\`\`${block.lang}\n${block.code}\n\`\`\``;
    });
}

function _replaceInlineMathSegments(text) {
    if (!text || text.indexOf('$') === -1) return text;

    let result = '';
    let index = 0;
    while (index < text.length) {
        if (text[index] !== '$') {
            result += text[index];
            index += 1;
            continue;
        }

        let converted = false;
        const maxEnd = Math.min(text.length, index + 122);
        for (let cursor = index + 1; cursor < maxEnd; cursor++) {
            const ch = text[cursor];
            if (ch === '\n') break;
            if (ch !== '$') continue;

            const candidate = text.slice(index + 1, cursor);
            if (!_isLikelyInlineMath(candidate)) {
                break;
            }

            result += _processLatexSegment(candidate);
            index = cursor + 1;
            converted = true;
            break;
        }

        if (!converted) {
            result += '$';
            index += 1;
        }
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
function _legacyLatexToText(text) {
    // LaTeX가 포함되었는지 확인
    if (!text.includes('$') && !text.includes('\\')) {
        return text;
    }
    const textOutsideCode = text.replace(RE_CODE_BLOCK, '');
    if (!RE_LATEX_COMMAND_CHECK.test(textOutsideCode) && !_hasConvertibleInlineMath(textOutsideCode)) {
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
            // \boxed{...}
            { regex: /\\boxed\{[^}]*\}/g, strip: null }
        ];

        for (let i = 0; i < latexPatterns.length; i++) {
            let pattern = latexPatterns[i];
            processedText = processedText.replace(pattern.regex, (match) => {
                let cleaned = pattern.strip ? match.replace(pattern.strip, '') : match;
                if (pattern.validate && !pattern.validate(cleaned)) {
                    return match;
                }
                return _processLatexSegment(cleaned);
            });
        }

        processedText = _replaceInlineMathSegments(processedText);

        return _restoreCodeBlocks(processedText, codeBlocks);

    } catch(e) {
        Log.e(`${e.name}\n${e.message}\n${e.stack}`);
        return text;
    }
}


/* ============================= 보강 변환 로직 =============================== */


const RE_INLINE_CODE_V2 = /`([^`\n]+)`/g;
const RE_ANY_CODE_TOKEN_V2 = /⟦𪚥(?:CB|IC)(\d+)𪚥⟧/g;

/** @description 백슬래시 이스케이프 여부 확인 */
function _v2IsEscaped(source, index) {
    let count = 0;
    for (let i = index - 1; i >= 0 && source.charAt(i) === "\\"; i--) count++;
    return count % 2 === 1;
}
/** @description 지정 위치의 닫힘 토큰 검색 */
function _v2FindClosing(source, start, closeToken, allowNewline) {
    for (let i = start; i < source.length; i++) {
        if (!allowNewline && source.charAt(i) === "\n") return -1;
        if (source.startsWith(closeToken, i) && !_v2IsEscaped(source, i)) return i;
    }
    return -1;
}
/** @description 중괄호 인자 읽기 */
function _v2ReadGroup(source, index, open, close) {
    if (source.charAt(index) !== open) return null;
    let depth = 1;
    for (let i = index + 1; i < source.length; i++) {
        const ch = source.charAt(i);
        if (ch === "\\" && i + 1 < source.length) {
            i++;
            continue;
        }
        if (ch === open) depth++;
        else if (ch === close) {
            depth--;
            if (depth === 0) {
                return {
                    value: source.slice(index + 1, i),
                    end: i + 1
                };
            }
        }
    }
    return null;
}
/** @description 공백 건너뛰기 */
function _v2SkipSpaces(source, index) {
    let i = index;
    while (i < source.length && /\s/.test(source.charAt(i))) i++;
    return i;
}
/** @description 명령 뒤 중괄호 인자 읽기 */
function _v2ReadBracedArg(source, index) {
    const start = _v2SkipSpaces(source, index);
    return _v2ReadGroup(source, start, "{", "}");
}
/** @description 단일 토큰 인자 읽기 */
function _v2ReadSingleArg(source, index) {
    const start = _v2SkipSpaces(source, index);
    if (start >= source.length) return null;
    const braced = _v2ReadGroup(source, start, "{", "}");
    if (braced) return braced;
    const ch = source.charAt(start);
    if (/[A-Za-z0-9]/.test(ch)) return { value: ch, end: start + 1 };
    if (ch === "\\") {
        let end = start + 1;
        while (end < source.length && /[A-Za-z]/.test(source.charAt(end))) end++;
        if (end > start + 1) return { value: source.slice(start, end), end };
    }
    return null;
}
/** @description 명령 뒤 선택 인자 읽기 */
function _v2ReadOptionalArg(source, index) {
    const start = _v2SkipSpaces(source, index);
    return _v2ReadGroup(source, start, "[", "]");
}
/** @description LaTeX 행 분리 */
function _v2SplitRows(source) {
    const rows = [];
    let buf = "";
    for (let i = 0; i < source.length; i++) {
        if (source.startsWith("\\\\", i)) {
            rows.push(buf);
            buf = "";
            i++;
            continue;
        }
        buf += source.charAt(i);
    }
    rows.push(buf);
    return rows;
}
/** @description LaTeX 셀 분리 */
function _v2SplitCells(source) {
    const cells = [];
    let buf = "";
    let braceDepth = 0;
    for (let i = 0; i < source.length; i++) {
        const ch = source.charAt(i);
        if (ch === "\\" && i + 1 < source.length) {
            buf += ch + source.charAt(i + 1);
            i++;
            continue;
        }
        if (ch === "{") braceDepth++;
        else if (ch === "}" && braceDepth > 0) braceDepth--;
        if (ch === "&" && braceDepth === 0) {
            cells.push(buf.trim());
            buf = "";
            continue;
        }
        buf += ch;
    }
    cells.push(buf.trim());
    return cells;
}
/** @description 환경 끝 위치 검색 */
function _v2FindEnvironmentEnd(source, beginIndex) {
    const beginMatch = source.slice(beginIndex).match(/^\\begin\{([^}]+)\}/);
    if (!beginMatch) return null;
    const env = beginMatch[1];
    const contentStart = beginIndex + beginMatch[0].length;
    const endToken = `\\end{${env}}`;
    const endIndex = source.indexOf(endToken, contentStart);
    if (endIndex < 0) return null;
    return {
        env,
        content: source.slice(contentStart, endIndex),
        end: endIndex + endToken.length
    };
}
/** @description cases 환경 변환 */
function _v2ConvertCases(content) {
    const lines = [];
    for (let row of _v2SplitRows(content)) {
        row = row.trim();
        if (!row) continue;
        const cells = _v2SplitCells(row);
        const expr = _v2ConvertMath(cells[0] || "");
        const cond = _v2ConvertMath(String(cells.slice(1).join(" ").replace(/\\text\{if\s*\}/g, "") || "").trim());
        lines.push("│ " + expr + (cond ? " if " + cond : ""));
    }
    return "┌─ cases ─────\n" + lines.join("\n") + "\n└────────────";
}
/** @description matrix 계열 환경 변환 */
function _v2ConvertMatrix(env, content) {
    const brackets = env === "pmatrix" ? ["(", ")"] :
        env === "bmatrix" ? ["[", "]"] :
        env === "vmatrix" ? ["|", "|"] :
        env === "Vmatrix" ? ["‖", "‖"] :
        ["", ""];
    const rows = [];
    const matrixContent = env === "array" ? content.replace(/^\s*\{[^}]*\}/, "") : content;
    for (let row of _v2SplitRows(matrixContent)) {
        row = row.trim();
        if (!row) continue;
        rows.push(_v2SplitCells(row).map(cell => _v2ConvertMath(cell)).join("  "));
    }
    const body = rows.join(" | ");
    return brackets[0] ? `${brackets[0]} ${body} ${brackets[1]}` : body;
}
/** @description 정렬 환경 변환 */
function _v2ConvertAligned(env, content) {
    const lines = [];
    for (let row of _v2SplitRows(content)) {
        row = row.trim();
        if (!row) continue;
        lines.push("│ " + _v2ConvertMath(row.replace(/&/g, "")));
    }
    return "┌─ " + env + " ─────\n" + lines.join("\n") + "\n└────────────";
}
/** @description 환경 변환 */
function _v2ConvertEnvironment(env, content, standalone) {
    if (env === "cases") return _v2ConvertCases(content);
    if (env === "matrix" || env === "pmatrix" || env === "bmatrix" || env === "vmatrix" || env === "Vmatrix" || env === "smallmatrix" || env === "array") return _v2ConvertMatrix(env, content);
    if (env === "align" || env === "align*" || env === "gather" || env === "gather*") return _v2ConvertAligned(env, content);
    if (standalone) return _v2ConvertMath(_v2ConvertMathEnvironment(content));
    return _v2ConvertMathEnvironment(`\\begin{${env}}${content}\\end{${env}}`);
}
/** @description 환경 포함 수식 변환 */
function _v2ConvertEnvironments(source) {
    if (!source.includes("\\begin{")) return source;
    let result = "";
    for (let i = 0; i < source.length;) {
        if (source.startsWith("\\begin{", i)) {
            const env = _v2FindEnvironmentEnd(source, i);
            if (env) {
                result += _v2ConvertEnvironment(env.env, env.content);
                i = env.end;
                continue;
            }
        }
        result += source.charAt(i);
        i++;
    }
    return result;
}
/** @description 구분자 명령 변환 */
function _v2ReadDelimiterAfterCommand(source, index) {
    const i = _v2SkipSpaces(source, index);
    if (source.startsWith("\\{", i)) return { value: V2_LEFT_BRACE_PLACEHOLDER, end: i + 2 };
    if (source.startsWith("\\}", i)) return { value: V2_RIGHT_BRACE_PLACEHOLDER, end: i + 2 };
    if (source.startsWith("\\lVert", i)) return { value: "‖", end: i + 6 };
    if (source.startsWith("\\rVert", i)) return { value: "‖", end: i + 6 };
    if (source.startsWith("\\Vert", i)) return { value: "‖", end: i + 5 };
    if (source.startsWith("\\lvert", i)) return { value: "|", end: i + 6 };
    if (source.startsWith("\\rvert", i)) return { value: "|", end: i + 6 };
    if (source.startsWith("\\vert", i)) return { value: "|", end: i + 5 };
    if (source.startsWith("\\|", i)) return { value: "‖", end: i + 2 };
    const ch = source.charAt(i);
    if (ch === "(" || ch === ")" || ch === "[" || ch === "]" || ch === "|" || ch === "." || ch === "{" || ch === "}") {
        const value = ch === "." ? "" : ch === "{" ? V2_LEFT_BRACE_PLACEHOLDER : ch === "}" ? V2_RIGHT_BRACE_PLACEHOLDER : ch;
        return { value, end: i + 1 };
    }
    return { value: "", end: index };
}
/** @description 수식 글꼴 본문 변환 및 경계 공백 보존 */
function _v2ConvertMathFontBody(value, depth) {
    const source = String(value || "");
    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    const body = source.slice(leading.length, source.length - trailing.length);
    if (!body) return source;
    return leading + _v2ConvertMath(body, depth) + trailing;
}
/** @description 분수 텍스트 조합 */
function _v2FormatFraction(numText, denText) {
    const n = /[+\-\/]/.test(numText) ? `(${numText})` : numText;
    const d = /[+\-\/]/.test(denText) ? `(${denText})` : denText;
    const fraction = n + "/" + d;
    return _v2IsDerivativeFraction(numText, denText) ? fraction + " " : fraction;
}
/** @description 미분 분수 여부 확인 */
function _v2IsDerivativeFraction(numText, denText) {
    const n = String(numText || "").trim();
    const d = String(denText || "").trim();
    return (n === "d" || n === "∂") && (d.startsWith("d") || d.startsWith("∂"));
}
/** @description 함수명 앞 공백 필요 여부 확인 */
function _v2NeedsLeadingFunctionSpace(result) {
    if (!result) return false;
    const last = result.charAt(result.length - 1);
    return !/\s/.test(last) && !/[+\-=<>≤≥≈≠×÷∙∘∧∨⟺⇒⇐→←∪∩,;:([{|]/.test(last);
}
/** @description 함수형 명령 변환 */
function _v2ConvertKnownCommand(command, source, commandEnd, depth) {
    if (command === "left" || command === "right" || command === "middle") {
        return _v2ReadDelimiterAfterCommand(source, commandEnd);
    }
    if (bigDelimiterCommands.has(command)) {
        return _v2ReadDelimiterAfterCommand(source, commandEnd);
    }
    if (command === "xrightarrow" || command === "xleftarrow") {
        const lower = _v2ReadOptionalArg(source, commandEnd);
        const upper = _v2ReadBracedArg(source, lower ? lower.end : commandEnd);
        if (!upper) return { value: command, end: commandEnd };
        const arrow = command === "xrightarrow" ? "→" : "←";
        const lowerScript = lower && lower.value.trim() ? "_{" + lower.value + "}" : "";
        const upperScript = upper.value.trim() ? "^{" + upper.value + "}" : "";
        return { value: arrow + lowerScript + upperScript, end: upper.end };
    }
    if (fracLikeCommands.has(command)) {
        const num = _v2ReadBracedArg(source, commandEnd);
        if (!num) {
            const shortNum = _v2ReadSingleArg(source, commandEnd);
            if (!shortNum) return { value: command, end: commandEnd };
            const shortDen = _v2ReadSingleArg(source, shortNum.end);
            if (!shortDen) return { value: command + "(" + _v2ConvertMath(shortNum.value, depth + 1) + ")", end: shortNum.end };
            return {
                value: _v2FormatFraction(_v2ConvertMath(shortNum.value, depth + 1), _v2ConvertMath(shortDen.value, depth + 1)),
                end: shortDen.end
            };
        }
        const den = _v2ReadBracedArg(source, num.end);
        if (!den) return { value: command + "(" + _v2ConvertMath(num.value, depth + 1) + ")", end: num.end };
        const numText = _v2ConvertMath(num.value, depth + 1);
        const denText = _v2ConvertMath(den.value, depth + 1);
        return { value: _v2FormatFraction(numText, denText), end: den.end };
    }
    if (command === "binom") {
        const top = _v2ReadBracedArg(source, commandEnd);
        if (!top) return { value: command, end: commandEnd };
        const bottom = _v2ReadBracedArg(source, top.end);
        if (!bottom) return { value: command + "(" + _v2ConvertMath(top.value, depth + 1) + ")", end: top.end };
        return { value: "C(" + _v2ConvertMath(top.value, depth + 1) + "," + _v2ConvertMath(bottom.value, depth + 1) + ")", end: bottom.end };
    }
    if (command === "sqrt") {
        const opt = _v2ReadOptionalArg(source, commandEnd);
        const argStart = opt ? opt.end : commandEnd;
        const arg = _v2ReadBracedArg(source, argStart);
        if (!arg) return { value: command, end: commandEnd };
        const expr = _v2ConvertMath(arg.value, depth + 1);
        const n = opt ? opt.value.trim() : "";
        if (n === "3") return { value: `∛(${expr})`, end: arg.end };
        if (n === "4") return { value: `∜(${expr})`, end: arg.end };
        return { value: n ? `${n}√(${expr})` : `√(${expr})`, end: arg.end };
    }
    if (command === "textcolor") {
        const color = _v2ReadBracedArg(source, commandEnd);
        if (!color) return { value: command, end: commandEnd };
        const arg = _v2ReadBracedArg(source, color.end);
        if (!arg) return { value: command + "(" + color.value.replace(/[{}]/g, "") + ")", end: color.end };
        return { value: _v2ConvertMath(arg.value, depth + 1), end: arg.end };
    }
    if (command === "text" || command === "operatorname" || command === "textrm") {
        const arg = _v2ReadBracedArg(source, commandEnd);
        if (arg) return { value: arg.value.replace(/[{}]/g, ""), end: arg.end };
        const shortArg = _v2ReadSingleArg(source, commandEnd);
        if (shortArg) return { value: _v2ConvertMath(shortArg.value, depth + 1), end: shortArg.end };
        return { value: command, end: commandEnd };
    }
    if (command === "mathrm" || command === "mathit" || command === "mathsf") {
        const arg = _v2ReadBracedArg(source, commandEnd);
        if (arg) return { value: _v2ConvertMathFontBody(arg.value, depth + 1), end: arg.end };
        const shortArg = _v2ReadSingleArg(source, commandEnd);
        if (shortArg) return { value: _v2ConvertMathFontBody(shortArg.value, depth + 1), end: shortArg.end };
        return { value: command, end: commandEnd };
    }
    if (mathFonts.has(command)) {
        const arg = _v2ReadBracedArg(source, commandEnd);
        if (arg) return { value: _convertFont(_v2ConvertMath(arg.value, depth + 1), mathFonts.get(command)), end: arg.end };
        const shortArg = _v2ReadSingleArg(source, commandEnd);
        if (shortArg) return { value: _convertFont(_v2ConvertMath(shortArg.value, depth + 1), mathFonts.get(command)), end: shortArg.end };
        return { value: command, end: commandEnd };
    }
    if (decorations.has(command)) {
        const arg = _v2ReadBracedArg(source, commandEnd);
        if (!arg) return { value: command, end: commandEnd };
        return { value: _v2ConvertMath(arg.value, depth + 1) + decorations.get(command), end: arg.end };
    }
    if (command === "boxed") {
        const arg = _v2ReadBracedArg(source, commandEnd);
        if (!arg) return { value: command, end: commandEnd };
        return { value: "[" + _v2ConvertMath(arg.value, depth + 1) + "]", end: arg.end };
    }
    if (command === "textcircled") {
        const arg = _v2ReadBracedArg(source, commandEnd);
        if (!arg) return { value: command, end: commandEnd };
        return { value: textCircledMap.get(arg.value) || "Ⓞ", end: arg.end };
    }
    if (command === "sum" || command === "prod") {
        return { value: command === "sum" ? "Σ" : "Π", end: commandEnd };
    }
    if (command === "int" || command === "oint") {
        return { value: command === "oint" ? "∮" : "∫", end: commandEnd };
    }
    if (spaces.has("\\" + command)) {
        return { value: spaces.get("\\" + command), end: commandEnd };
    }
    const functionEnd = command === "atan" && source.charAt(commandEnd) === "2" ? commandEnd + 1 : commandEnd;
    const functionName = functionEnd === commandEnd ? command : "atan2";
    if (mathFunctionCommands.has(functionName)) {
        return { value: functionName, end: functionEnd, kind: "function" };
    }
    if (symbolMap.has(command)) {
        return { value: symbolMap.get(command), end: commandEnd };
    }

    const arg = _v2ReadBracedArg(source, commandEnd);
    if (arg) return { value: command + "(" + _v2ConvertMath(arg.value, depth + 1) + ")", end: arg.end };
    return { value: command, end: commandEnd };
}
/** @description LaTeX 명령 변환 */
function _v2ConvertCommands(source, depth) {
    if (!source.includes("\\")) return source;
    let result = "";
    for (let i = 0; i < source.length;) {
        const ch = source.charAt(i);
        if (ch !== "\\") {
            result += ch;
            i++;
            continue;
        }
        if (i + 1 >= source.length) {
            result += "\\";
            i++;
            continue;
        }
        const next = source.charAt(i + 1);
        if (next === "," || next === ":" || next === ";" || next === "!") {
            result += spaces.get("\\" + next) || "";
            i += 2;
            continue;
        }
        if (next === "\\" || next === "{" || next === "}" || next === "%" || next === "$" || next === "_" || next === "&" || next === "#") {
            result += next;
            i += 2;
            continue;
        }
        if (next === "|") {
            result += "‖";
            i += 2;
            continue;
        }
        if (!/[A-Za-z]/.test(next)) {
            result += next;
            i += 2;
            continue;
        }
        let end = i + 1;
        while (end < source.length && /[A-Za-z]/.test(source.charAt(end))) end++;
        const command = source.slice(i + 1, end);
        const converted = _v2ConvertKnownCommand(command, source, end, depth);
        if (converted.kind === "function") {
            const nextIndex = _v2SkipSpaces(source, converted.end);
            const needsTrailing = source.charAt(nextIndex) && source.charAt(nextIndex) !== "(" && source.charAt(nextIndex) !== "_" && source.charAt(nextIndex) !== "^" && !/\s/.test(source.charAt(converted.end));
            result += (_v2NeedsLeadingFunctionSpace(result) ? " " : "") + converted.value + (needsTrailing ? " " : "");
        } else {
            result += converted.value;
        }
        i = converted.end;
    }
    return result;
}
/** @description 첨자 토큰 읽기 */
function _v2ReadScriptToken(source, index) {
    if (source.charAt(index) === "{") {
        const group = _v2ReadGroup(source, index, "{", "}");
        if (group) return group;
    }
    if (source.charAt(index) === "\\") {
        let end = index + 1;
        while (end < source.length && /[A-Za-z]/.test(source.charAt(end))) end++;
        if (end < source.length && source.slice(index + 1, end) === "atan" && source.charAt(end) === "2") end++;
        if (end > index + 1) return { value: source.slice(index, end), end };
        if (index + 1 < source.length) return { value: source.slice(index, index + 2), end: index + 2 };
    }
    if (index < source.length) {
        return {
            value: source.charAt(index),
            end: index + 1
        };
    }
    return null;
}
/** @description 첨자 텍스트 정리 */
function _v2NormalizeScriptText(value) {
    return String(value || "")
        .replace(/\s*([+\-=→←])\s*/g, "$1")
        .replace(/[ \t\r\f\v\u2000-\u200A\u205F\u3000]+/g, " ")
        .trim();
}
/** @description 첨자 의미 보존 변환 */
function _v2ConvertScriptValue(value, scriptMap, marker) {
    const normalized = _v2NormalizeScriptText(value);
    if (!normalized) return marker;
    let canUseScript = true;
    for (let i = 0; i < normalized.length; i++) {
        if (!scriptMap.has(normalized.charAt(i))) {
            canUseScript = false;
            break;
        }
    }
    if (canUseScript) return _convertToScript(normalized, scriptMap);
    if (normalized.length === 1) return marker + normalized;
    return marker + V2_LEFT_BRACE_PLACEHOLDER + normalized + V2_RIGHT_BRACE_PLACEHOLDER;
}
/** @description 첨자/위첨자 변환 */
function _v2ConvertScripts(source, depth) {
    if (!source.includes("_") && !source.includes("^")) return source;
    let result = "";
    for (let i = 0; i < source.length;) {
        const ch = source.charAt(i);
        if ((ch === "_" || ch === "^") && i + 1 < source.length) {
            const token = _v2ReadScriptToken(source, i + 1);
            if (token) {
                const tokenValue = _v2ConvertMath(token.value, depth + 1);
                const converted = _v2ConvertScriptValue(tokenValue, ch === "_" ? subscriptsMap : superscriptsMap, ch);
                result += converted;
                i = token.end;
                continue;
            }
        }
        result += ch;
        i++;
    }
    return result;
}
/** @description 수식 환경 잔여 문법 정리 */
function _v2ConvertMathEnvironment(source) {
    return source
        .replace(RE_BEGIN_ENV, "")
        .replace(RE_END_ENV, "")
        .replace(RE_ALIGN_SYMBOL, "=")
        .replace(RE_AMPERSAND, "")
        .replace(RE_LINEBREAK, " ");
}
/** @description 변환 결과 정리 */
function _v2CleanupMath(source) {
    let result = source
        .replace(RE_DISPLAYSTYLE, "")
        .replace(/[{}]/g, "")
        .replace(/\s*([+\-=<>≤≥≈≠×÷∙∘∧∨⟺⇒⇐→←∪∩∈∉⊂⊃⊆⊇])\s*/g, " $1 ")
        .replace(/[ \t\r\f\v\u2000-\u200A\u205F\u3000]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .trim();
    result = result
        .replace(RE_V2_LEFT_BRACE_PLACEHOLDER, "{")
        .replace(RE_V2_RIGHT_BRACE_PLACEHOLDER, "}")
        .replace(/([_^])\{([^}]*)\}/g, (match, marker, body) => marker + "{" + _v2NormalizeScriptText(body) + "}")
        .replace(/\b(lim(?:_\{[^}]+\}|[₀-₉ₐ-ₜ₊₋₌₍₎]+)?(?:\^\{[^}]+\}|[⁰-⁹⁺⁻⁼⁽⁾]+)?)(?=[A-Za-z0-9α-ωΑ-Ω∂√ΣΠ∫])/g, "$1 ")
        .replace(/[ \t\r\f\v\u2000-\u200A\u205F\u3000]+/g, " ")
        .trim();
    return result;
}
/** @description 수식 본문 변환 */
function _v2ConvertMath(math, depth = 0) {
    if (depth > 30) return String(math || "");
    let result = String(math || "");
    result = result.replace(RE_DFRAC, "\\frac");
    result = _v2ConvertEnvironments(result);
    result = _v2ConvertCommands(result, depth);
    result = _v2ConvertScripts(result, depth);
    result = _v2ConvertMathEnvironment(result);
    return _v2CleanupMath(result);
}
/** @description 수식 후보 여부 확인 */
function _v2IsLikelyMath(content, isDisplay) {
    const source = String(content || "").trim();
    if (!source) return false;
    if (isDisplay) return true;
    if (/^-?\d+(?:\.\d+)?$/.test(source)) return true;
    if (/^-?\d+(?:\.\d+)?[A-Za-z]+$/.test(source)) return true;
    return _isLikelyInlineMath(source);
}
/** @description 코드 토큰 보호 */
function _v2ProtectCode(text, blocks) {
    let result = text.replace(RE_CODE_BLOCK, (match) => {
        const token = TOKEN_START + "CB" + blocks.length + TOKEN_END;
        blocks.push({ type: "block", text: match });
        return token;
    });
    result = result.replace(RE_INLINE_CODE_V2, (match, code) => {
        const token = TOKEN_START + "IC" + blocks.length + TOKEN_END;
        blocks.push({ type: "inline", code });
        return token;
    });
    return result;
}
/** @description 코드 토큰 복원 */
function _v2RestoreCode(text, blocks) {
    return text.replace(RE_ANY_CODE_TOKEN_V2, (match, indexStr) => {
        const block = blocks[Number(indexStr)];
        if (!block) return match;
        if (block.type === "inline") return "`" + block.code + "`";
        return block.text;
    });
}
/** @description 텍스트 내 수식 구간 변환 */
function _v2ReplaceMathSegments(text) {
    let result = "";
    for (let i = 0; i < text.length;) {
        if (text.startsWith("$$", i) && !_v2IsEscaped(text, i)) {
            const end = _v2FindClosing(text, i + 2, "$$", true);
            if (end > i + 2) {
                const content = text.slice(i + 2, end);
                if (_v2IsLikelyMath(content, true)) {
                    result += _v2ConvertMath(content);
                    i = end + 2;
                    continue;
                }
            }
        }
        if (text.charAt(i) === "$" && !_v2IsEscaped(text, i)) {
            const end = _v2FindClosing(text, i + 1, "$", false);
            if (end > i) {
                const content = text.slice(i + 1, end);
                if (_v2IsLikelyMath(content, false)) {
                    result += _v2ConvertMath(content);
                    i = end + 1;
                    continue;
                }
            }
        }
        if ((text.startsWith("\\(", i) || text.startsWith("\\[", i)) && !_v2IsEscaped(text, i)) {
            const close = text.startsWith("\\(", i) ? "\\)" : "\\]";
            const end = _v2FindClosing(text, i + 2, close, close === "\\]");
            if (end >= 0) {
                result += _v2ConvertMath(text.slice(i + 2, end));
                i = end + 2;
                continue;
            }
        }
        if (text.startsWith("\\begin{", i)) {
            const env = _v2FindEnvironmentEnd(text, i);
            if (env) {
                result += _v2ConvertEnvironment(env.env, env.content, true);
                i = env.end;
                continue;
            }
        }
        if (text.startsWith("\\$", i)) {
            result += "$";
            i += 2;
            continue;
        }
        result += text.charAt(i);
        i++;
    }
    return result;
}
/**
 * @description LaTeX 제거(변환) 함수
 * @param {string} text 제거할 문자열
 * @returns {string} LaTeX 제거 문자열
 */
function LatexToText(text) {
    const source = text == null ? "" : String(text);
    if (!source.includes("$") && !source.includes("\\")) return source;

    try {
        const codeBlocks = [];
        const protectedText = _v2ProtectCode(source, codeBlocks);
        const converted = _v2ReplaceMathSegments(protectedText);
        return _v2RestoreCode(converted, codeBlocks);
    } catch(e) {
        if (typeof Log !== "undefined" && Log?.e) {
            Log.e(`${e.name}\n${e.message}\n${e.stack}`);
        }
        return source;
    }
}


// module.exports = LatexToText;
