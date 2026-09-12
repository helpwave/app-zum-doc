export const spaFallbackId = '__spa'

export function spaStaticPaths() {
  return {
    paths: [{ params: { id: spaFallbackId } }],
    fallback: false as const,
  }
}

export function spaStaticProps() {
  return {
    props: {},
  }
}
