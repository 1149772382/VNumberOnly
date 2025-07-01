function getRegex(options) {
    if (options.decimal && options.negative) return /^-?\d*(\.\d*)?$/
    if (options.decimal) return /^\d*(\.\d*)?$/
    if (options.negative) return /^-?\d*$/
    return /^\d*$/
}

function formatValue(value, options, { strict = false } = {}) {
    let allowedChars = '0-9'
    if (options.decimal) allowedChars += '\\.'
    if (options.negative) allowedChars += '\\-'
    const cleanReg = new RegExp(`[^${allowedChars}]`, 'g')

    let result = value.replace(cleanReg, '')


    // 保留单个负号
    if (options.negative) {
        result = result[0] === '-' ? '-' + result.slice(1).replace(/-/g, '') : result.replace(/-/g, '')
    }
    // 只保留第一个小数点
    const parts = result.split('.')
    if (parts.length > 2) {
        result = parts.shift() + '.' + parts.join('').replace(/\./g, '')
    }

    const reParts = result.split('.')

    // 去除前导0（仅整数时）
    if (!options.decimal || reParts.length === 1) {
        result = result.replace(/^(-?)0+(\d)/, '$1$2')
    }

    const endsWithDot = result.endsWith('.')

    // "-"开头
    const isIntermediate = !strict && (
        result === '-' || result === '.' || result === '-.' ||
        (options.decimal && /^-?\d+\.$/.test(result))
    )
    if (isIntermediate) return result
    if (!strict && /^-?$/.test(result)) return result

    // 小数位数限制
    if (options.maxDecimalPlaces !== undefined && options.decimal && reParts.length === 2) {
        reParts[1] = reParts[1].slice(0, options.maxDecimalPlaces)
        result = reParts.join('.')
    }

    let num = parseFloat(result)
    if (!isNaN(num)) {
        if (options.min !== undefined) num = Math.max(num, options.min)
        if (options.max !== undefined) num = Math.min(num, options.max)
        result = options.decimal ? String(num) : String(Math.floor(num))
        if (!strict && endsWithDot && !result.includes('.')) {
            result += '.'
        }
    } else {
        result = options.allowEmpty ? '' : '0'
    }

    return result
}



const numberOnly = {
    bind(el, binding) {
        const input = el.tagName.toLowerCase() === 'input' ? el : el.querySelector('input')
        if (!input) return

        const options = Object.assign({ allowEmpty: true }, binding.value || {})
        let isComposing = false

        if (!options.allowEmpty && (input.value === '' || input.value == null)) {
            input.value = '0'
            input.dispatchEvent(new Event('input'))
        }

        const handler = () => {
            if (isComposing) return
            const val = input.value
            if (options.allowEmpty && val === '') return
            const formatted = formatValue(val, options, { strict: false })
            if (formatted !== input.value) {
                input.value = formatted
                input.dispatchEvent(new Event('input'))
            }
        }

        const blurHandler = () => {
            const val = input.value
            if (options.allowEmpty && val === '') return
            const formatted = formatValue(val, options, { strict: true })
            if (formatted !== input.value) {
                input.value = formatted
                input.dispatchEvent(new Event('input'))
            }
        }

        input.__numberOnlyHandler__ = handler
        input.__numberOnlyBlurHandler__ = blurHandler

        input.addEventListener('input', handler)
        input.addEventListener('blur', blurHandler)
        input.addEventListener('compositionstart', () => isComposing = true)
        input.addEventListener('compositionend', () => {
            isComposing = false
            handler()
        })
    },

    unbind(el) {
        const input = el.tagName.toLowerCase() === 'input' ? el : el.querySelector('input')
        if (input) {
            input.removeEventListener('input', input.__numberOnlyHandler__)
            input.removeEventListener('blur', input.__numberOnlyBlurHandler__)
            delete input.__numberOnlyHandler__
            delete input.__numberOnlyBlurHandler__
        }
    }
}

// 插件形式
export default {
    install(Vue) {
        Vue.directive('number-only', numberOnly)
    }
}

// 可按需导入
export const NumberOnlyDirective = numberOnly
