export default function isStandalone () {
  return (
    typeof navigator !== 'undefined'
    && typeof window !== 'undefined'
    &&  ("standalone" in window.navigator)
    && window.navigator.standalone
  )
}
