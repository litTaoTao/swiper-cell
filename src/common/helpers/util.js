import { camelize } from '../lang/string'

function processComponentName(Component, { prefix = '', firstUpperCase = false } = {}) {
    const name = Component.name
    const pureName = name.replace(/^cube-/i, '')
    let camelizeName = `${camelize(`${prefix}${pureName}`)}`
    /* istanbul ignore if */
    if (firstUpperCase) {
      camelizeName = camelizeName.charAt(0).toUpperCase() + camelizeName.slice(1)
    }
    return camelizeName
}

export {
    processComponentName
}