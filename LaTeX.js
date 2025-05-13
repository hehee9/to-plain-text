/**
 * @description 라텍스 제거 함수
 * @param {string} text 제거할 문자열
 * @returns {string} 라텍스 제거 문자열
 * 
 * @author hehee https://github.com/hehee9
 * @license CC BY-NC-SA 4.0
 * - 저작권자 표기
 * - 라이선스 표기
 * - 상업적 이용 금지
 * - 동일 조건 변경 가능
 */
function LatexToText(text) {
    try {
        const CONSTANTS = {
            // 위 첨자
            superscripts: {
                '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
                '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
                'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
                'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
                'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
                'p': 'ᵖ', 'q': 'q', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ',
                'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ',
                'z': 'ᶻ',
                'A': 'ᴬ', 'B': 'ᴮ', 'C': 'ᶜ', 'D': 'ᴰ', 'E': 'ᴱ',
                'F': 'ᶠ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ',
                'K': 'ᴷ', 'L': 'ᴸ', 'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ',
                'P': 'ᴾ', 'Q': 'Q', 'R': 'ᴿ', 'S': 'ˢ', 'T': 'ᵀ',
                'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ', 'X': 'ˣ', 'Y': 'ʸ',
                'Z': 'ᶻ'
            },
    
            // 아래 첨자
            subscripts: {
                '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
                '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
                'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
                'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
                'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
                'v': 'ᵥ', 'x': 'ₓ',
                'A': 'ₐ', 'B': 'ᵦ', 'E': 'ₑ', 'H': 'ₕ', 'I': 'ᵢ',
                'K': 'ₖ', 'L': 'ₗ', 'M': 'ₘ', 'N': 'ₙ', 'O': 'ₒ',
                'P': 'ₚ', 'R': 'ᵣ', 'S': 'ₛ', 'T': 'ₜ', 'U': 'ᵤ',
                'V': 'ᵥ', 'X': 'ₓ',
                '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎'
            },
    
            // 그리스 문자
            greekLetters: {
                'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'Gamma': 'Γ',
                'delta': 'δ', 'Delta': 'Δ', 'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η',
                'theta': 'θ', 'Theta': 'Θ', 'iota': 'ι', 'kappa': 'κ',
                'lambda': 'λ', 'Lambda': 'Λ', 'mu': 'μ', 'nu': 'ν',
                'xi': 'ξ', 'Xi': 'Ξ', 'pi': 'π', 'Pi': 'Π',
                'rho': 'ρ', 'Sigma': 'Σ', 'sigma': 'σ',
                'tau': 'τ', 'Upsilon': 'Υ', 'upsilon': 'υ',
                'phi': 'φ', 'Phi': 'Φ', 'chi': 'χ', 'psi': 'ψ', 'Psi': 'Ψ',
                'omega': 'ω', 'Omega': 'Ω'
            },
    
            // 수학 연산자
            mathOperators: {
                'neq': '≠', 'leq': '≤', 'geq': '≥', 'le': '≤', 'ge': '≥',
                'approx': '≈', 'propto': '∝',
                'equiv': '≡', 'sim': '∼', 'simeq': '≃', 'cong': '≅',
                
                'neg': '¬', 'land': '∧', 'lor': '∨',
                'Leftrightarrow': '⟺', 'Rightarrow': '⇒', 'Leftarrow': '⇐',
                'rightarrow': '→', 'leftarrow': '←', 'forall': '∀', 'exists': '∃',
                'mapsto': '↦', 'longmapsto': '⟼', 'hookrightarrow': '↪', 'hookleftarrow': '↩',
                'rightharpoonup': '⇀', 'leftharpoonup': '↼', 'rightharpoondown': '⇁', 'leftharpoondown': '↽',
                'updownarrow': '↕', 'Updownarrow': '⇕', 'nearrow': '↗', 'searrow': '↘', 'swarrow': '↙',
                'nwarrow': '↖', 'top': '⊤', 'bot': '⊥',
                'circlearrowleft': '↺', 'circlearrowright': '↻', 'curvearrowleft': '↶', 'curvearrowright': '↷',
                'leftrightarrow': '↔',
                'uparrow': '↑', 'downarrow': '↓', 'twoheadrightarrow': '↠', 'rightsquigarrow': '⇝',
                
                'in': '∈', 'notin': '∉', 'cup': '∪', 'cap': '∩',
                'subset': '⊂', 'subseteq': '⊆', 'supset': '⊃', 'supseteq': '⊇',
                'emptyset': '∅',
                
                'times': '×', 'cdot': '·', 'oint': '∮',
                'pm': '±', 'mp': '∓', 'div': '÷', 'hbar': 'ℏ',
                
                'therefore': '∴', 'because': '∵',
                'dots': '…', 'cdots': '⋯', 'vdots': '⋮', 'ddots': '⋱', 'ldots': '…',
                
                'nabla': '∇', 'partial': '∂',
                
                'angle': '∠', 'triangle': '△', 'square': '□', 'circle': '○',
                
                'infty': '∞', 'prime': '′', 'degree': '°', 'circ': '∘', 'bullet': '•',
                'ast': '∗', 'star': '⋆', 'mid': '∣', 'ell': 'ℓ',
                'wp': '℘', 'Re': 'ℜ', 'Im': 'ℑ',
    
                'varnothing': '∅', 'setminus': '∖', 'smallsetminus': '∖',
                'subseteqq': '⫅', 'supseteqq': '⫆', 'nsubseteqq': '⊈',
                'subsetneqq': '⊊', 'supsetneqq': '⊋', 'varsubsetneq': '⊊', 'varsupsetneq': '⊋',
                'nsubset': '⊄', 'nsupset': '⊅', 'nsupseteq': '⊉',
                
                'prec': '≺', 'succ': '≻', 'preceq': '⪯', 'succeq': '⪰',
                'nprec': '⊀', 'nsucc': '⊁', 'parallel': '∥', 'nparallel': '∦',
                'asymp': '≍', 'bowtie': '⋈', 'vartriangle': '△', 'triangleq': '≜',
                
                'perp': '⊥', 'vdash': '⊢', 'models': '⊨', 'dashv': '⊣',
                'nvdash': '⊬', 'intercal': '⊺', 'between': '≬', 'pitchfork': '⋔', 'backepsilon': '∍',
                
                'ltimes': '⋉', 'rtimes': '⋊', 'leftthreetimes': '⋋', 'rightthreetimes': '⋌', 'dotplus': '∔', 'divideontimes': '⋇', 'smallint': '∫',
                
                'aleph': 'ℵ', 'beth': 'ℶ', 'gimel': 'ℷ', 'daleth': 'ℸ', 'samekh': 'ס', 'zayin': 'ז', 'het': 'ח',
                'tet': 'ט', 'yod': 'י', 'kaf': 'כ', 'lamed': 'ל', 'mem': 'מ', 'nun': 'נ', 'pe': 'פ', 'tsadi': 'צ',
                'qof': 'ק', 'resh': 'ר', 'shin': 'ש', 'tav': 'ת', 'vav': 'ו',
                'ayin': 'ע', 'finalkaf': 'ך', 'finalmem': 'ם', 'finalnun': 'ן', 'finalpe': 'ף', 'finaltsadi': 'ץ',    
                
                'implies': '⟹', 'iff': '⟺', 'Box': '□', 'Diamond': '◇',
                'blacksquare': '■', 'diamond': '◇', 'blackdiamond': '◆', 'lozenge': '◊', 'blacklozenge': '⧫',
                'bigcirc': '○', 'bigstar': '★', 'pounds': '£', 'yen': '¥', 'euro': '€',
                'circledS': 'Ⓢ', 'circledR': '®', 'trademark': '™', 'copyright': '©',
    
                'measuredangle': '∡', 'sphericalangle': '∢', 'nmid': '∤', 'lvert': '|', 'rvert': '|',
                
                'dagger': '†', 'ddagger': '‡', 'amalg': '⨿', 'bigcap': '⋂', 'bigcup': '⋃', 'bigsqcup': '⨆',
                'bigvee': '⋁', 'bigwedge': '⋀', 'bigodot': '⨀', 'bigoplus': '⨁', 'bigotimes': '⨂',
                'iint': '∬', 'iiint': '∭', 'iiiint': '⨌', 'idotsint': '∫⋯∫',
                
                'ulcorner': '⌜', 'urcorner': '⌝', 'llcorner': '⌞', 'lrcorner': '⌟',
                
                'textcircled': '⓪①②③④⑤⑥⑦⑧⑨', 'textdegree': '°', 'dag': '†', 'ddag': '‡',
                'textbar': '|', 'textasciicircum': '^', 'textasciitilde': '~', 'checkmark': '✓',
                'Join': '⋈', 'lhd': '⊲', 'rhd': '⊳', 'unlhd': '⊴', 'unrhd': '⊵',
                
                'mho': '℧', 'varkappa': 'ϰ', 'varrho': 'ϱ', 'varsigma': 'ς', 'vartheta': 'ϑ', 'varphi': 'φ', 'varpi': 'ϖ',
                
                'Game': '⅁', 'flat': '♭', 'natural': '♮', 'sharp': '♯',
                'clubsuit': '♣', 'diamondsuit': '♢', 'heartsuit': '♡', 'spadesuit': '♠',
    
                'imath': 'ı', 'jmath': 'ȷ', 'wr': '≀',
                'coprod': '∐', 'biguplus': '⨄',
              
                'backprime': '‵', 'And': '⩓', 'S': '§', 'P': '¶', 'eth': 'ð', 'maltese': '✠',
                'diagup': '╱', 'diagdown': '╲',
                'triangledown': '▽', 'triangleleft': '◁', 'triangleright': '▷',
                'circledast': '⊛', 'circledcirc': '⊚', 'circleddash': '⊝',
                'oplus': '⊕', 'ominus': '⊖', 'otimes': '⊗', 'oslash': '⊘',
            },
    
            // 수학 함수
            mathFunctions: [
                'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
                'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh',
                'log', 'ln', 'lg',
                'exp', 'min', 'max',
                'det', 'rank', 'tr',
                'ker', 'im', 'dim', 'deg',
                'gcd', 'lcm', 'sup', 'inf'
            ],
    
            // 원 문자
            textCircledMap: {
                'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ',
                'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ',
                'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ',
                'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ',
                'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ',
                'z': 'ⓩ',
                'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ',
                'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ',
                'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ',
                'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ',
                'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ',
                'Z': 'Ⓩ',
                '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤',
                '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨', '10': '⑩',
                '11': '⑪', '12': '⑫', '13': '⑬', '14': '⑭', '15': '⑮',
                '16': '⑯', '17': '⑰', '18': '⑱', '19': '⑲', '20': '⑳',
                '21': '㉑', '22': '㉒', '23': '㉓', '24': '㉔', '25': '㉕',
                '26': '㉖', '27': '㉗', '28': '㉘', '29': '㉙', '30': '㉚',
                '31': '㉛', '32': '㉜', '33': '㉝', '34': '㉞', '35': '㉟',
                '36': '㊱', '37': '㊲', '38': '㊳', '39': '㊴', '40': '㊵',
                '41': '㊶', '42': '㊷', '43': '㊸', '44': '㊹', '45': '㊺',
                '46': '㊻', '47': '㊼', '48': '㊽', '49': '㊾', '50': '㊿',
            },
    
            // 구분자
            delimiters: {
                '\\left(': '(','\\right)': ')',
                '\\left[': '[', '\\right]': ']',
                '\\left\\{': '{', '\\right\\}': '}',
                '\\left|': '|', '\\right|': '|',
                '\\middle|': '|',
                '\\lVert': '‖', '\\rVert': '‖',
                '\\|': '‖'
            },
    
            // 수학 폰트
            mathFonts: {
                'mathbf': {
                    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 
                    'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 
                    'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
                    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 
                    'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 
                    's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳'
                },
                'mathbb': {
                    'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾', 'H': 'ℍ', 'I': '𝕀', 
                    'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ', 'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ', 
                    'S': '𝕊', 'T': '𝕋', 'U': '𝕌', 'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ',
                    'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖',
                    'f': '𝕗', 'g': '𝕘', 'h': '𝕙', 'i': '𝕚', 'j': '𝕛', 'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟',
                    'o': '𝕠', 'p': '𝕡', 'q': '𝕢', 'r': '𝕣', 's': '𝕤', 't': '𝕥', 'u': '𝕦', 'v': '𝕧', 'w': '𝕨',
                    'x': '𝕩', 'y': '𝕪', 'z': '𝕫'
                },
                'mathcal': {
                    'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': 'ℰ', 'F': 'ℱ', 'G': '𝒢', 'H': 'ℋ', 'I': 'ℐ', 
                    'J': '𝒥', 'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': 'ℛ', 
                    'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵',
                    'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': '𝑒', 'f': '𝒻', 'g': '𝑔', 'h': '𝒽', 'i': '𝒾',
                    'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': '𝑜', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇',
                    's': '𝓈', 't': '𝓉', 'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏'
                },
                'mathfrak': {
                    'A': '𝔄', 'B': '𝔅', 'C': 'ℭ', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊', 'H': 'ℌ', 'I': 'ℑ', 
                    'J': '𝔍', 'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑', 'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': 'ℜ', 
                    'S': '𝔖', 'T': '𝔗', 'U': '𝔘', 'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': 'ℨ',
                    'a': '𝔞', 'b': '𝔟', 'c': '𝔠', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤', 'h': '𝔥', 'i': '𝔦', 
                    'j': '𝔧', 'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫', 'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯', 
                    's': '𝔰', 't': '𝔱', 'u': '𝔲', 'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷'
                }
            },
    
            // 장식 기호
            decorations: {
                'overline': '̄',
                'widehat': '̂', 'widetilde': '̃',
                'vec': '⃗', 'bar': '̄', 'dot': '̇', 'ddot': '̈',
                'acute': '́', 'grave': '̀', 'check': '̌', 'breve': '̆', 'tilde': '̃'
            },
    
            // 공백
            spaces: {
                '\\,': '\u2009', '\\:': '\u205F', '\\;': '\u2004', '\\!': '',
                '\\quad': '\u2003', '\\qquad': '\u2003\u2003'
            },
    
            // 색상 (css가 포함되어 들어올 경우)
            colors: [
                'red', 'blue', 'green', 'yellow', 'orange', 'purple',
                'black', 'white', 'gray', 'brown', 'pink'
            ],
    
            // 환경
            mathEnvironments: [
                'align', 'align*',
                'gather', 'gather*',
                'equation', 'equation*',
                'multline', 'multline*',
                'split', 'split*'
            ]
        };
    
        // 변환용 유틸 함수
        const utils = {
            convertLimits(text) {
                // sum, prod 처리
                let result = text.replace(
                    /\\(sum|prod)_\{([^}]+)\}\^\{([^}]+)\}/g,
                    (_, type, lower, upper) => {
                        const symbol = type === "sum" ? "Σ" : "Π";
                        // 첨자 변환
                        const upperConverted = upper.split("").map(char =>  CONSTANTS.superscripts[char] || char).join("");
                        const lowerConverted = lower.split("").map(char =>  CONSTANTS.subscripts[char] || char).join("");
                        return `${symbol}[${upperConverted}${lowerConverted}]`;
                    }
                );
              
                // 적분 기호 처리
                result = result.replace(
                    /\\(oint|int)(?:_([A-Z]))?/g,
                    (_, type, var_) => {
                        const integral = type === "oint" ? "∮" : "∫";
                        return var_ ? `${integral}${var_}` : integral;
                    }
                );
              
                return result;
            },
          
            convertCases(text) {
                return text.replace(
                    /\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g,
                    (_, content) => content
                        .split('\\\\')
                        .map(line => {
                            const [expr, cond] = line.split('&');
                            return cond 
                                ? `${expr.trim()} if ${cond.replace(/\\text\{if \}/g, '').trim()}`
                                : expr.trim();
                        })
                        .join(', ')
                );
            },
    
            convertMatrices(text) {
                return text.replace(
                    /\\begin\{([pb])matrix\}([\s\S]*?)\\end\{\1matrix\}/g,
                    (_, type, content) => {
                        const bracket = type === 'p' ? ['(', ')'] : ['[', ']'];
                        const rows = content.trim().split('\\\\');
                        const matrix = rows.map(row => 
                            row.trim().split('&').map(cell => cell.trim())
                        );
                        
                        if (matrix.length === 1)
                            // 단일 행 벡터
                            return `${bracket[0]} ${matrix[0].join(' | ')} ${bracket[1]}`;
                        else
                            // 다중 행 행렬
                            return `${bracket[0]}\n${
                                matrix.map(row => row.join('  ')).join(' | ')
                            }\n${bracket[1]}`;
                    }
                );
            },
    
            convertFractions(text) {
                return text.replace(
                    /\\[d]?frac\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}/g,
                    (_, num, den) => {
                        // 재귀적으로 내부 분수 처리
                        num = this.convertFractions(num);
                        den = this.convertFractions(den);
                        
                        // 분모나 분자에 분수가 있거나 항이 여럿인 경우 괄호 추가
                        const needNumParens = num.includes('/') || num.includes('+') || num.includes('-');
                        const needDenParens = den.includes('/') || den.includes('+') || den.includes('-');
                        
                        num = needNumParens ? `(${num})` : num;
                        den = needDenParens ? `(${den})` : den;
                        
                        return `${num}/${den}`;
                    }
                );
            },
      
            convertSqrt(text) {
                return text
                    .replace(/\\sqrt\[(\d+|n)\]\{([^}]+)\}/g,
                      (_, n, expr) => n === '3' ? `∛(${expr})` : n === '4' ? `∜(${expr})` : `${n}√(${expr})`)
                    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
            },
      
            convertFontsAndDecorations(text) {
                let result = text;
                
                // 모든 수학 폰트 처리
                const fontCommands = ['mathbf', 'mathbb', 'mathcal', 'mathfrak'];
                fontCommands.forEach(cmd => {
                    result = result.replace(
                        new RegExp(`\\\\${cmd}\\{([^}]+)\\}`, 'g'),
                        (_, content) => content.split('').map(char => 
                            CONSTANTS.mathFonts[cmd][char] || char
                        ).join('')
                    );
                });
              
                // 장식 기호 처리
                result = result.replace(
                    /\\(overline|hat|widehat|vec|dot|ddot|bar|tilde|widetilde)\{([^}]+)\}/g,
                    (_, decoration, char) => `${char}${CONSTANTS.decorations[decoration]}`
                );
              
                return result;
            },
      
            convertSubscriptsAndSuperscripts(text) {
                return text
                    .replace(/\_([A-Za-z])/g, (_, sub) => CONSTANTS.subscripts[sub] || sub)
                    .replace(/\_\{([^}]+)\}/g,
                        (_, sub) => sub.split('').map(char => CONSTANTS.subscripts[char] || char).join(''))
                    .replace(/\_([0-9a-z])/g,
                        (_, sub) => CONSTANTS.subscripts[sub] || sub)
                    .replace(/\^\{([^}]+)\}/g,
                        (_, sup) => sup.split('').map(char => CONSTANTS.superscripts[char] || char).join(''))
                    .replace(/\^([0-9a-z])/g,
                        (_, sup) => CONSTANTS.superscripts[sup] || sup);
            },
      
            cleanupResult(text) {
                return text
                    .replace(/[{}]/g, '')  // 남은 중괄호 제거
                    .replace(/\\/g, '')    // 남은 백슬래시 제거
                    .replace(/\s*([+\-=<>≤≥≈≠×÷∙∘∧∨⟺⇒⇐→←∪∩∈∉⊂⊃⊆⊇])\s*/g, ' $1 ')  // 연산자 주변 공백
                    .replace(/\s+/g, ' ')  // 연속된 공백을 하나로
                    .trim();
            },
      
            convertText(text) {
                return text
                    .replace(/\\text\{([^}]+)\}/g, '$1')
                    .replace(/\\textcolor\{([^}]+)\}\{([^}]+)\}/g, '$2')
                    .replace(/\\operatorname\{([^}]+)\}/g, '$1');
            },
      
            convertSpaces(text) {
                return text.replace(
                    /\\[,;]|\\quad|\\qquad/g,
                    match => CONSTANTS.spaces[match] || match
                );
            },
      
            convertMathEnvironment(text) {
                return text
                    // begin/end 환경 제거
                    .replace(/\\begin\{[^}]+\}/g, '')
                    .replace(/\\end\{[^}]+\}/g, '')
                    // 정렬 기호(&=)를 일반 =로 변환
                    .replace(/&=/g, '=')
                    // 남은 & 제거
                    .replace(/&/g, '')
                    // 줄바꿈(\\)을 공백으로 변환
                    .replace(/\\\\/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
        };
    
        // 메인 변환 함수
        function convertMath(math) {
            let result = math;
    
            result = result.replace(/\\boxed\{([^}]+)\}/g, (_, content) => {
                // 내용을 먼저 변환한 후 [ ] 안에 넣기
                const convertedContent = convertMath(content);
                return `[ ${convertedContent} ]`;
            });
  
            // 원 문자
            result = result.replace(/\\textcircled\{([^}]+)\}/g, (_, char) => {
                return CONSTANTS.textCircledMap[char] || `Ⓞ`;
            });
          
            // 구분자
            result = result.replace(
                /\\(?:left|right|middle)(?:\\[{}]|\(|\)|\[|\]|\|)|\\[lr]Vert/g,
                match => CONSTANTS.delimiters[match] || match
            );
          
            // 기본 명령어
            result = result
              .replace(/\\displaystyle\s*/g, '')
              .replace(/\\dfrac/g, '\\frac');
            
            if (result.includes('\\begin{')) {
                result = utils.convertMatrices(result);
            }
          
            // 연산자, 그리스 문자
            result = result.replace(
                /\\([A-Za-z]+)(?![a-zA-Z])/g,
                (match, operator) => CONSTANTS.mathOperators[operator] || CONSTANTS.greekLetters[operator] || match
            );
          
            // 나머지
            if (result.includes("\\begin{") || result.includes("\\end{"))
                result = utils.convertMathEnvironment(result);
          
            result = utils.convertText(result);
            result = utils.convertSpaces(result);
            result = utils.convertLimits(result);
            result = utils.convertCases(result);
            result = utils.convertMatrices(result);
            result = utils.convertFractions(result);
            result = utils.convertSqrt(result);
            result = utils.convertFontsAndDecorations(result);
            result = utils.convertSubscriptsAndSuperscripts(result);
          
            // 최종 정리
            result = utils.cleanupResult(result);
          
            return result;
        }
    
        function processLine(line, state) {
            const { currentEnvironment, environmentContent } = state;
            // 달러 기호 사이에 있을 때
            const dollarMatch = line.match(/\$([^\$]+)\$/);
            if (dollarMatch) {
                const mathContent = dollarMatch[1];
                if (mathContent.includes("\\begin{cases}")) {
                    const [beforeCases, casesContent] = mathContent.split("\\begin{cases}");
                    const casesEnd = casesContent.split("\\end{cases}");
                    
                    // cases 처리
                    const lines = casesEnd[0].split("\\\\");
                    const processedLines = lines
                        .map(line => {
                            if (!line.trim()) return "";
                            const [expr, cond] = line.split("&").map(part => part.trim());
                            const convertedExpr = convertMath(expr);
                            const convertedCond = cond ? convertMath(cond.replace(/\\text\{if\s*\}/g, "")) : "";
                            return `│ ${convertedExpr}${cond ? " if " + convertedCond : ""}`;
                        })
                        .filter(line => line);
    
                    // 전체 결과
                    let result = [
                        convertMath(beforeCases.trim()),
                        "┌─ cases ─────"
                    ].join("\n");
                    
                    return `${result}\n${processedLines.join("\n")}\n└────────────`;
                }
                return convertMath(mathContent);
            }
    
            // begin 환경 체크
            const beginMatch = line.match(/\\begin\{(align|gather|cases)\*?\}/);
            if (beginMatch) {
                state.currentEnvironment = beginMatch[1];
                state.environmentContent = [];
                return `┌─ ${beginMatch[1]}${beginMatch[0].includes('*') ? '*' : ''} ─────`;
            }
    
            // end 환경 체크
            const endMatch = line.match(/\\end\{(align|gather|cases)\*?\}/);
            if (endMatch) {
                const env = endMatch[1];
                if (env === state.currentEnvironment) {
                    const content = state.environmentContent.join("\n");
                    state.currentEnvironment = null;
                    
                    // 환경별 처리
                    if (env === 'cases') {
                        let processedContent = content.split('\n')
                            .map(line => {
                                if (!line.trim()) return "";
                                const [expr, cond] = line.split("&").map(part => part.trim());
                                const convertedExpr = convertMath(expr);
                                const convertedCond = cond ? convertMath(cond.replace(/\\text\{if\s*\}/g, "")) : "";
                                return `│ ${convertedExpr}${cond ? " if " + convertedCond : ""}`;
                            })
                            .filter(line => line) // 빈 줄 제거
                            .join("\n");
                        return processedContent + "\n└────────────";
                    } else {  // align, gather
                        let processedContent = content.split("\n")
                            .map(line => {
                                if (!line.trim()) return "";
                                const parts = line.split("&").map(part => part.trim());
                                return `│ ${parts.map(part => convertMath(part)).join(" = ")}`;
                            })
                            .filter(line => line)
                            .join("\n");
                        return processedContent + "\n└────────────";
                    }
                }
                return "└────────────";
            }
    
            // 내부 라인 처리
            if (state.currentEnvironment) {
                state.environmentContent.push(line);
                return "";
            }
    
            // 일반 라인 처리
            return convertMath(line.replace(/\\text\{if\s*\}/g, "if").trim());
        }

        // LaTeX 세그먼트 처리
        function processLatexSegment(segment) {
            const state = { currentEnvironment: null, environmentContent: [] };
            const lines = segment.split('\n');
            return lines.map(line => processLine(line.trim(), state)).join('\n');
        }
  
        // 코드 블록 토큰
        const codeBlocks = [];
        const TOKEN_START = "⟦𪚥";
        const TOKEN_END = "𪚥⟧";
        text = text.replace(/```(.*?)\n([\s\S]*?)```/g, (_, lang, code) => {
            const token = `${TOKEN_START}CB${codeBlocks.length}${TOKEN_END}`;
            codeBlocks.push({ lang: lang.trim(), code: code.trim() });
            return token;
        });

        // LaTeX 패턴 매칭 및 변환
        const latexRegex = /(\\(?:begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\})|\$[^$]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g;
        text = text.replace(latexRegex, (match) => {
            return processLatexSegment(match.replace(/^\\\(|\\\)$/g, '').replace(/^\\\[|\\\]$/g, '')); // 괄호 제거
        });
  
        // 코드 블록 복원
        codeBlocks.forEach(({ lang, code }, n) => {
            const token = `${TOKEN_START}CB${n}${TOKEN_END}`;
            text = text.replace(token, `\n\`\`\`${lang}\n${code}\n\`\`\``);
        });
        
        return text;
          
    } catch(e) {
        Log.e(`${e.name}\n${e.message}\n${e.stack}`);
        return text;
    }
}