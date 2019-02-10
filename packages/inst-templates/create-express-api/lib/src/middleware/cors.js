import cors from 'cors'


export const config = {
  methods: ['GET', 'POST', 'HEAD'],
  maxAge: 604800,
  optionsSuccessStatus: 200,
}

export default cors(config)