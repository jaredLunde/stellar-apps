import createClient from './createClient'
import {forwardRequestHeaders, forwardResponseHeaders} from './forwardHeaders'
import getCSRFHeaders from './getCSRFHeaders'


export default {
  createClient,
  forwardRequestHeaders,
  forwardResponseHeaders,
  getCSRFHeaders
}
