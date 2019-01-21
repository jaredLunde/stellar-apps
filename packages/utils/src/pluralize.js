function wordForm (amt, singularForm, pluralForm) {
  return parseInt(amt) === 1 ? singularForm : pluralForm || `${singularForm}s`
}


export default function pluralize (amt, singularForm, pluralForm) {
  return parseInt(amt) === 1 ?
    `1 ${singularForm}` :
    `${amt} ${wordForm(amt, singularForm, pluralForm)}`
}