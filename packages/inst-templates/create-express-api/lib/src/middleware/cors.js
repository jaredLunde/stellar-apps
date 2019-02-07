import cors from 'cors'


export const config = {
  methods: ['GET', 'POST', 'HEAD'],
  optionsSuccessStatus: 200
}

export default cors(config)