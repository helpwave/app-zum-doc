const defaultTitle = 'App zum Doc Administration'

const titleWrapper = (title?: string) => title ? `${title} | ${defaultTitle}` : defaultTitle

export default titleWrapper
